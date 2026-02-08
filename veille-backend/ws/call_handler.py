import asyncio
import audioop
import base64
import json
import logging
import time
from datetime import datetime, timezone
from typing import Optional

from config import settings
from db import supabase
from fastapi import WebSocket, WebSocketDisconnect
from services.dust_service import trigger_post_call_analysis
from services.gradium_service import STTSession, text_to_speech_stream
from services.openai_service import (
    COMPANION_SYSTEM_PROMPT,
    get_companion_response,
)
from services.twilio_service import end_call

logger = logging.getLogger(__name__)

MAX_TURNS = 8  # after this many turns, AI wraps up the conversation
MAX_DURATION_SECONDS = 300  # 5 minutes hard limit


def convert_twilio_to_gradium(twilio_payload: str) -> bytes:
    """
    Convert Twilio mulaw 8kHz base64 audio to Gradium PCM 24kHz 16-bit mono.

    Pipeline: base64 decode → mulaw to PCM 16-bit → resample 8kHz to 24kHz
    """
    mulaw_bytes = base64.b64decode(twilio_payload)
    pcm_8k = audioop.ulaw2lin(mulaw_bytes, 2)  # 2 = 16-bit samples
    pcm_24k, _ = audioop.ratecv(pcm_8k, 2, 1, 8000, 24000, None)
    return pcm_24k


class CallSession:
    """
    Manages the full state of a single live phone call.
    Wires together: Twilio WS ↔ Gradium STT ↔ OpenAI ↔ Gradium TTS ↔ Twilio WS
    """

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.stream_sid: Optional[str] = None
        self.call_sid: Optional[str] = None
        self.call_id: Optional[str] = None
        self.stt_session = STTSession()
        self.transcript: list[dict] = []
        self.conversation_history: list[dict] = [
            {"role": "system", "content": COMPANION_SYSTEM_PROMPT}
        ]
        self.turn_count: int = 0
        self.call_start_time: Optional[float] = None
        self._is_active: bool = False
        self._is_speaking: bool = False  # True while TTS is playing

    async def handle_connected(self, message: dict):
        """Handle the 'connected' event from Twilio."""
        logger.info("Twilio WebSocket connected")

    async def handle_start(self, message: dict):
        """Handle the 'start' event: extract metadata, start STT, send greeting."""
        self.stream_sid = message.get("streamSid")
        start_data = message.get("start", {})
        self.call_sid = start_data.get("callSid")
        self.call_start_time = time.time()
        self._is_active = True

        logger.info(
            f"Stream started: streamSid={self.stream_sid}, callSid={self.call_sid}"
        )

        # Link WebSocket session to DB call record
        result = (
            supabase.table("calls")
            .select("id")
            .eq("twilio_call_sid", self.call_sid)
            .execute()
        )
        if result.data:
            self.call_id = result.data[0]["id"]
            supabase.table("calls").update({"status": "in_progress"}).eq(
                "id", self.call_id
            ).execute()

        # Register turn-end callback
        self.stt_session.set_on_turn_end(self._on_user_turn_end)

        # Start STT streaming
        await self.stt_session.start()

        # Send initial greeting (non-blocking so media events can flow immediately)
        asyncio.create_task(self._generate_and_speak(
            "(Marie just picked up the phone. Start the conversation with a warm greeting.)"
        ))

    async def handle_media(self, message: dict):
        """Handle incoming audio from Twilio: convert and feed to STT."""
        payload = message.get("media", {}).get("payload")
        if payload:
            pcm_chunk = convert_twilio_to_gradium(payload)
            await self.stt_session.feed_audio(pcm_chunk)

    async def handle_stop(self, message: dict):
        """Handle the 'stop' event: clean up STT, finalize call."""
        logger.info(f"Stream stopped: streamSid={self.stream_sid}")
        self._is_active = False
        await self.stt_session.stop()

        duration = (
            int(time.time() - self.call_start_time) if self.call_start_time else 0
        )

        # Update call record in Supabase
        if self.call_id:
            supabase.table("calls").update(
                {
                    "status": "completed",
                    "ended_at": datetime.now(timezone.utc).isoformat(),
                    "duration_seconds": duration,
                    "transcript": self.transcript,
                    "turn_count": self.turn_count,
                }
            ).eq("id", self.call_id).execute()

        # Trigger post-call analysis
        if self.transcript:
            await trigger_post_call_analysis(
                call_id=self.call_id or "unknown",
                resident_id=settings.resident_id,
                transcript=self.transcript,
                turn_count=self.turn_count,
                duration_seconds=duration,
            )

    async def _generate_and_speak(self, user_text: str):
        """
        Generate an OpenAI response and stream it as audio to Twilio via Gradium TTS.

        Pipeline: OpenAI tokens → single Gradium TTS stream → Twilio audio.
        Tokens are piped directly to TTS — no per-sentence connection overhead.
        """
        self._is_speaking = True
        self.stt_session.mute()  # suppress echo while AI speaks
        logger.info(f"Generating response for: {user_text[:80]}...")

        try:
            openai_gen = get_companion_response(user_text, self.conversation_history)

            # Pipe OpenAI tokens directly into a single TTS stream
            tts_audio = text_to_speech_stream(openai_gen)
            async for audio_chunk in tts_audio:
                if not self._is_active:
                    break
                await self.send_audio_to_twilio(audio_chunk)

            # Record assistant response in transcript
            if self.conversation_history and self.conversation_history[-1]["role"] == "assistant":
                assistant_text = self.conversation_history[-1]["content"]
                self.transcript.append(
                    {
                        "role": "assistant",
                        "text": assistant_text,
                        "timestamp": time.time(),
                    }
                )
                logger.info(f"AI said: {assistant_text}")

        except Exception as e:
            logger.error(f"Error in generate_and_speak: {e}", exc_info=True)
        finally:
            self._is_speaking = False
            self.stt_session.unmute()  # resume listening after AI finishes

    async def _on_user_turn_end(self, user_text: str):
        """
        Callback fired by STTSession when VAD detects end of user's turn.
        Generates OpenAI response and streams TTS audio back to caller.
        Handles conversation ending after MAX_TURNS or MAX_DURATION.
        """
        self.turn_count += 1
        self.transcript.append(
            {
                "role": "user",
                "text": user_text,
                "timestamp": time.time(),
            }
        )
        logger.info(f"[Turn {self.turn_count}] User said: {user_text}")

        # Check if we should wrap up the conversation
        elapsed = time.time() - self.call_start_time if self.call_start_time else 0
        should_end = self.turn_count >= MAX_TURNS or elapsed >= MAX_DURATION_SECONDS

        if should_end:
            logger.info(f"Ending call (turns={self.turn_count}, elapsed={elapsed:.0f}s)")
            await self._generate_and_speak(
                f"{user_text}\n\n(This is your last response. Say goodbye warmly to Marie, wish her a lovely day, and end the conversation.)"
            )
            await self._hang_up()
        else:
            await self._generate_and_speak(user_text)

    async def _hang_up(self):
        """Hang up the call via Twilio REST API after a short delay for TTS to finish playing."""
        if not self.call_sid:
            return
        # Small delay to let Twilio finish playing the buffered goodbye audio
        await asyncio.sleep(2)
        try:
            await asyncio.to_thread(end_call, self.call_sid)
        except Exception as e:
            logger.error(f"Error hanging up call: {e}", exc_info=True)

    # --- Twilio output methods ---

    async def send_audio_to_twilio(self, audio_chunk: bytes):
        """Send mulaw audio back through the Twilio Media Stream."""
        if not self._is_active or not self.stream_sid:
            return
        payload = base64.b64encode(audio_chunk).decode("utf-8")
        await self.websocket.send_json(
            {
                "event": "media",
                "streamSid": self.stream_sid,
                "media": {
                    "payload": payload,
                },
            }
        )

    async def send_mark(self, label: str):
        """Send a mark message to track when audio playback completes."""
        if not self._is_active or not self.stream_sid:
            return
        await self.websocket.send_json(
            {
                "event": "mark",
                "streamSid": self.stream_sid,
                "mark": {
                    "name": label,
                },
            }
        )

    async def clear_audio_buffer(self):
        """Clear Twilio's audio buffer (e.g., when interrupting playback)."""
        if not self._is_active or not self.stream_sid:
            return
        await self.websocket.send_json(
            {
                "event": "clear",
                "streamSid": self.stream_sid,
            }
        )


async def handle_twilio_websocket(websocket: WebSocket):
    """
    Main WebSocket handler registered with FastAPI.
    Dispatches Twilio Media Stream events to the CallSession.
    """
    await websocket.accept()
    session = CallSession(websocket)

    try:
        while True:
            raw = await websocket.receive_text()
            message = json.loads(raw)
            event = message.get("event")

            if event == "connected":
                await session.handle_connected(message)
            elif event == "start":
                await session.handle_start(message)
            elif event == "media":
                await session.handle_media(message)
            elif event == "stop":
                await session.handle_stop(message)
                break
            elif event == "mark":
                logger.debug(f"Mark received: {message.get('mark', {}).get('name')}")
            else:
                logger.warning(f"Unknown Twilio event: {event}")

    except WebSocketDisconnect:
        logger.info("Twilio WebSocket disconnected")
        if session._is_active:
            await session.handle_stop({})
    except Exception as e:
        logger.error(f"WebSocket handler error: {e}", exc_info=True)
        if session._is_active:
            await session.handle_stop({})
