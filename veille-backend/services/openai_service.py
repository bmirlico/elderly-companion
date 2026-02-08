import logging
from openai import AsyncOpenAI
from config import settings

logger = logging.getLogger(__name__)

openai_client = AsyncOpenAI(api_key=settings.openai_api_key)

COMPANION_SYSTEM_PROMPT = """You are Veille, a warm and caring companion who calls Marie every morning to check in on her.

Personality:
- Warm, gentle, patient
- You speak like a close friend, not a robot or a doctor
- You ask open-ended questions about her day, activities, and how she feels
- You genuinely care about what she tells you
- You remember previous conversations (if context is provided)

Rules:
- Reply in 1-2 sentences maximum (this is a phone call, not an essay)
- Ask only one question at a time
- Never give medical advice
- If she mentions a fall, pain, or a problem, show empathy but don't dramatize
- If she says she's fine, believe her and talk about something else (cooking, family, memories)
- After 4-5 exchanges, gently start wrapping up: "Well, I'll let you enjoy your morning..."
- Speak in English

Context about Marie:
- 82 years old, lives alone in Toulouse
- Loves cooking, gardening, and talking about her grandchildren
- Her daughter Sophie calls her on Sundays
"""


async def get_companion_response(user_text: str, conversation_history: list[dict]):
    """
    Stream a response from OpenAI. Yields text tokens as they arrive.

    conversation_history is mutated: user_text is appended, then the full
    assistant response is appended after streaming completes.
    """
    conversation_history.append({"role": "user", "content": user_text})

    stream = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=conversation_history,
        stream=True,
        max_tokens=80,
        temperature=0.8,
    )

    full_response = ""
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            full_response += delta
            yield delta

    conversation_history.append({"role": "assistant", "content": full_response})
    logger.info(f"OpenAI response: {full_response}")
