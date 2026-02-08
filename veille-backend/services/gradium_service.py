import asyncio
import json
import logging
import time
from typing import AsyncGenerator, Callable, Optional

import gradium

from config import settings

logger = logging.getLogger(__name__)

gradium_client = gradium.client.GradiumClient(api_key=settings.gradium_api_key)

STT_SETUP = {
    "model_name": "default",
    "input_format": "pcm",
    "json_config": {
        "language": "en",
    },
}

# VAD tuning — punctuation-based turn detection
# Key insight: Gradium STT adds "." "!" "?" when it detects a complete thought
# (falling intonation, natural pause). This is a much stronger signal than word count.
VAD_INACTIVITY_THRESHOLD = 0.8
MIN_WORDS_FOR_TURN = 2  # safety minimum (prevents single-word echo glitches)
SILENCE_TIMEOUT = 4.0  # fallback: fire after 4s even without punctuation (rare)
COOLDOWN_AFTER_AI_SPEAKS = 3.0

TTS_SETUP = {
    "model_name": "default",
    "voice_id": "p1fSBpcmVWngBqVd",  # Manon — gentle and warm, calm and measured pace
    "output_format": "ulaw_8000",  # native Twilio format, no conversion needed
    "json_config": {
        "padding_bonus": 0.4,  # natural pace (0.8 was too slow)
        "rewrite_rules": "en",
    },
}

# Minimum bytes before flushing audio to Twilio (smooths choppy delivery).
# ulaw_8000 = 8000 bytes/sec → 1600 bytes = 200ms of audio
TTS_BUFFER_MIN_BYTES = 1600


CLAUSE_ENDINGS = (".", "!", "?", "…", ",", ";")


async def _clause_buffer(token_generator):
    """
    Buffer OpenAI tokens into clauses before yielding to TTS.

    Breaks at commas and sentence endings so TTS gets coherent chunks
    like "D'accord," immediately instead of waiting for the full sentence.
    This minimizes dead-air while keeping natural pronunciation.
    """
    buf = ""
    async for token in token_generator:
        buf += token
        if any(buf.rstrip().endswith(p) for p in CLAUSE_ENDINGS):
            clause = buf.strip()
            buf = ""
            if clause:
                yield clause
    remaining = buf.strip()
    if remaining:
        yield remaining


async def text_to_speech_stream(text_generator):
    """
    Convert streaming text tokens into streaming ulaw audio.

    text_generator: async generator yielding text tokens (from OpenAI)
    Yields: bytes chunks of ulaw 8kHz audio (ready for Twilio)

    Pipeline: tokens → clause buffer → single TTS stream → audio buffer → out
    First audio chunk is sent immediately (no buffer wait) for minimal latency.
    """
    clauses = _clause_buffer(text_generator)

    stream = await gradium_client.tts_stream(
        setup=TTS_SETUP,
        text=clauses,
    )

    buffer = bytearray()
    first_chunk = True
    async for audio_chunk in stream.iter_bytes():
        if first_chunk:
            # Send first chunk immediately — no buffering delay
            yield audio_chunk
            first_chunk = False
        else:
            buffer.extend(audio_chunk)
            if len(buffer) >= TTS_BUFFER_MIN_BYTES:
                yield bytes(buffer)
                buffer.clear()

    if buffer:
        yield bytes(buffer)


class STTSession:
    """
    Manages a single Gradium STT streaming session for one phone call.

    Features:
    - VAD-based turn detection with tunable threshold
    - Minimum word count before turn can end
    - Cooldown after AI speaks to prevent echo triggers
    - Mute/unmute to suppress echo during TTS playback
    """

    def __init__(self):
        self._audio_queue: asyncio.Queue[Optional[bytes]] = asyncio.Queue()
        self._stt_stream = None
        self._reader_task: Optional[asyncio.Task] = None
        self._current_turn_text: str = ""
        self._on_turn_end: Optional[Callable] = None
        self._on_partial_text: Optional[Callable] = None
        self._running: bool = False
        self._muted: bool = False  # True while AI is speaking (echo suppression)
        self._last_unmute_time: float = 0.0  # for cooldown after AI finishes
        self._last_text_time: float = 0.0  # when last STT text fragment arrived

    def set_on_turn_end(self, callback: Callable):
        """Register async callback for when VAD detects user finished speaking."""
        self._on_turn_end = callback

    def set_on_partial_text(self, callback: Callable):
        """Register async callback for partial transcription updates."""
        self._on_partial_text = callback

    def mute(self):
        """Mute STT input (call when AI starts speaking to suppress echo)."""
        self._muted = True

    def unmute(self):
        """Unmute STT input, clear echo text, and drain stale echo audio from queue."""
        self._muted = False
        self._current_turn_text = ""  # discard any echo captured during TTS
        self._last_unmute_time = time.time()
        # Drain audio queue — removes echo chunks queued during AI speech
        # so Gradium immediately gets fresh user audio instead of stale echo
        drained = 0
        while not self._audio_queue.empty():
            try:
                self._audio_queue.get_nowait()
                drained += 1
            except asyncio.QueueEmpty:
                break
        if drained:
            logger.debug(f"Drained {drained} stale audio chunks from queue")

    async def _audio_generator(self) -> AsyncGenerator[bytes, None]:
        """Async generator that yields PCM chunks from the queue."""
        while self._running:
            try:
                chunk = await asyncio.wait_for(self._audio_queue.get(), timeout=1.0)
            except asyncio.TimeoutError:
                continue
            if chunk is None:
                break
            yield chunk

    async def start(self):
        """Start the Gradium STT stream and the background reader task."""
        self._running = True
        self._stt_stream = await gradium_client.stt_stream(
            STT_SETUP,
            self._audio_generator(),
        )
        self._reader_task = asyncio.create_task(self._read_stt_results())
        logger.info("Gradium STT session started")

    async def _read_stt_results(self):
        """Background task: read STT messages and detect turn boundaries."""
        try:
            stream_iter = self._stt_stream._stream
            async for msg in stream_iter:
                if not self._running:
                    break

                if isinstance(msg, dict):
                    await self._handle_stt_message(msg)
                elif isinstance(msg, str):
                    try:
                        parsed = json.loads(msg)
                        await self._handle_stt_message(parsed)
                    except json.JSONDecodeError:
                        logger.warning(f"Unparseable STT message: {msg}")

        except Exception as e:
            logger.error(f"STT reader error: {e}", exc_info=True)
        finally:
            logger.info("STT reader task ended")

    async def _handle_stt_message(self, msg: dict):
        """Process a single STT message."""
        msg_type = msg.get("type")

        # While muted (AI speaking), ignore text but still process stream
        if self._muted:
            return

        if msg_type == "text":
            text_fragment = msg.get("text", "")
            self._current_turn_text += text_fragment + " "
            self._last_text_time = time.time()
            logger.info(f"STT partial: {text_fragment}")
            if self._on_partial_text:
                await self._on_partial_text(text_fragment)

        elif msg_type == "step":
            vad = msg.get("vad", [])
            if len(vad) >= 3:
                inactivity_prob = vad[2].get("inactivity_prob", 0.0)
                turn_text = self._current_turn_text.strip()
                word_count = len(turn_text.split()) if turn_text else 0
                in_cooldown = (time.time() - self._last_unmute_time) < COOLDOWN_AFTER_AI_SPEAKS

                # Primary signal: text ends with sentence punctuation (. ! ?)
                # Gradium adds punctuation when it detects a complete thought.
                # Fallback: 4s silence timeout (rare — for unpunctuated trailing text)
                ends_with_punctuation = bool(
                    turn_text and turn_text.rstrip()[-1] in ".!?"
                )
                silence_elapsed = (
                    self._last_text_time > 0
                    and (time.time() - self._last_text_time) > SILENCE_TIMEOUT
                )

                if (
                    inactivity_prob > VAD_INACTIVITY_THRESHOLD
                    and not in_cooldown
                    and word_count >= MIN_WORDS_FOR_TURN
                    and (ends_with_punctuation or silence_elapsed)
                ):
                    self._current_turn_text = ""
                    self._last_text_time = 0.0
                    logger.info(
                        f"Turn ended (VAD={inactivity_prob:.2f}, words={word_count}, punct={ends_with_punctuation}): {turn_text}"
                    )
                    if self._on_turn_end:
                        await self._on_turn_end(turn_text)

    async def feed_audio(self, pcm_chunk: bytes):
        """Feed a PCM audio chunk (24kHz 16-bit mono) into the STT pipeline."""
        if self._running:
            await self._audio_queue.put(pcm_chunk)

    async def stop(self):
        """Stop the STT session gracefully."""
        self._running = False
        await self._audio_queue.put(None)
        if self._reader_task and not self._reader_task.done():
            self._reader_task.cancel()
            try:
                await self._reader_task
            except asyncio.CancelledError:
                pass
        logger.info("Gradium STT session stopped")
