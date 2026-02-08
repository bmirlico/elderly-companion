"""
Dust analysis service — sends call transcripts to a Dust agent for
well-being analysis and stores the result in Supabase.
"""

import json
import logging

import httpx
from config import settings
from db import supabase

logger = logging.getLogger(__name__)

DUST_API_BASE = "https://dust.tt/api/v1"


def _format_transcript(transcript: list[dict]) -> str:
    """Format transcript entries into readable text for the Dust agent."""
    lines = []
    for entry in transcript:
        speaker = "Marie" if entry["role"] == "user" else "Veille"
        lines.append(f"{speaker}: {entry['text']}")
    return "\n".join(lines)


def _parse_agent_response(conversation: dict) -> dict | None:
    """Extract the agent's JSON response from a Dust conversation."""
    for message_group in conversation.get("content", []):
        for msg in message_group:
            if msg.get("type") == "agent_message" and msg.get("status") == "succeeded":
                raw = msg.get("content", "")
                # Strip markdown code fences if present
                cleaned = raw.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.split("\n", 1)[-1]
                if cleaned.endswith("```"):
                    cleaned = cleaned.rsplit("```", 1)[0]
                cleaned = cleaned.strip()
                try:
                    return json.loads(cleaned)
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse Dust agent JSON: {cleaned[:200]}")
                    return None
    return None


async def trigger_post_call_analysis(
    call_id: str,
    resident_id: str,
    transcript: list[dict],
    turn_count: int,
    duration_seconds: int,
):
    """
    Send transcript to the Dust agent for analysis, store the result
    in Supabase, and send an SMS alert to family if needed.
    """
    if (
        not settings.dust_api_key
        or not settings.dust_workspace_id
        or not settings.dust_agent_id
    ):
        logger.warning(f"Dust not configured — skipping analysis for call_id={call_id}")
        return

    transcript_text = _format_transcript(transcript)

    message_content = f"""Analyze this phone conversation between Veille (AI companion) and Marie (82 years old, lives alone in Toulouse).

TRANSCRIPT:
{transcript_text}

METADATA:
- Duration: {duration_seconds} seconds
- Number of exchanges: {turn_count}

Respond with ONLY a raw JSON object (no markdown, no explanation), with this exact structure:
{{
  "alert_level": "green|yellow|red",
  "summary": "2-3 sentence summary for the family",
  "mood_score": 0.0 to 1.0 (0=very bad, 1=very good),
  "signals": [{{"type": "health|safety|mood|social", "detail": "description", "severity": 0.0 to 1.0}}],
  "tags": ["tag1", "tag2"],
  "family_message": "SMS message for the family (null if green)"
}}"""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{DUST_API_BASE}/w/{settings.dust_workspace_id}/assistant/conversations",
                headers={
                    "Authorization": f"Bearer {settings.dust_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "message": {
                        "content": message_content,
                        "mentions": [{"configurationId": settings.dust_agent_id}],
                        "context": {
                            "username": "veille-backend",
                            "timezone": "Europe/Paris",
                            "fullName": "Veille System",
                            "email": "system@veille.app",
                            "origin": "api",
                        },
                    },
                    "blocking": True,
                    "title": f"Call Analysis — {call_id[:8]}",
                },
            )
            resp.raise_for_status()

        data = resp.json()
        analysis = _parse_agent_response(data.get("conversation", {}))

        if not analysis:
            logger.error("Could not parse analysis from Dust response")
            return

        logger.info(
            f"Dust analysis for call_id={call_id}: "
            f"alert={analysis['alert_level']}, mood={analysis.get('mood_score')}"
        )

        # Store in Supabase
        supabase.table("analyses").insert(
            {
                "call_id": call_id,
                "resident_id": resident_id,
                "alert_level": analysis["alert_level"],
                "summary": analysis.get("summary", ""),
                "mood_score": analysis.get("mood_score"),
                "signals": analysis.get("signals", []),
                "tags": analysis.get("tags", []),
                "family_message": analysis.get("family_message"),
            }
        ).execute()

        # Send SMS to family if yellow or red
        if analysis["alert_level"] in ("yellow", "red") and settings.family_phone:
            family_msg = analysis.get("family_message")
            if family_msg:
                _send_family_sms(family_msg)

    except httpx.HTTPStatusError as e:
        logger.error(
            f"Dust API error: {e.response.status_code} — {e.response.text[:300]}"
        )
    except Exception as e:
        logger.error(f"Dust analysis failed: {e}", exc_info=True)


async def trigger_weekly_digest(resident_id: str) -> dict | None:
    """
    Query last 7 days of analyses from Supabase, send them to the Dust
    agent for trend analysis, and SMS the family a weekly summary.
    """
    if (
        not settings.dust_api_key
        or not settings.dust_workspace_id
        or not settings.dust_digest_agent_id
    ):
        logger.warning("Dust digest agent not configured — skipping weekly digest")
        return None

    result = (
        supabase.table("analyses")
        .select("*")
        .eq("resident_id", resident_id)
        .order("created_at", desc=True)
        .limit(7)
        .execute()
    )

    analyses = result.data
    if not analyses:
        logger.warning("No analyses found for weekly digest")
        return None

    # Format analyses in chronological order for the agent
    analyses_text = ""
    for a in reversed(analyses):
        analyses_text += (
            f"Date: {a['created_at']}\n"
            f"Alert: {a['alert_level']}\n"
            f"Mood: {a.get('mood_score', 'N/A')}\n"
            f"Summary: {a.get('summary', 'N/A')}\n"
            f"Signals: {json.dumps(a.get('signals', []))}\n"
            f"---\n"
        )

    message_content = f"""Here are the daily call analyses from the past week:

{analyses_text}

Analyze trends across the week. Respond with ONLY a raw JSON object (no markdown, no explanation):
{{
  "trend": "improving|stable|declining",
  "week_summary": "3-4 sentence overview of Marie's week for her family",
  "key_concerns": ["concern 1", "concern 2"],
  "positive_notes": ["positive note 1", "positive note 2"],
  "recommendation": "One actionable suggestion for the family",
  "family_message": "SMS message (2-3 sentences) summarizing the week"
}}"""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{DUST_API_BASE}/w/{settings.dust_workspace_id}/assistant/conversations",
                headers={
                    "Authorization": f"Bearer {settings.dust_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "message": {
                        "content": message_content,
                        "mentions": [
                            {"configurationId": settings.dust_digest_agent_id}
                        ],
                        "context": {
                            "username": "veille-backend",
                            "timezone": "Europe/Paris",
                            "fullName": "Veille System",
                            "email": "system@veille.app",
                            "origin": "api",
                        },
                    },
                    "blocking": True,
                    "title": f"Weekly Digest — {resident_id[:8]}",
                },
            )
            resp.raise_for_status()

        data = resp.json()
        digest = _parse_agent_response(data.get("conversation", {}))

        if not digest:
            logger.error("Could not parse weekly digest from Dust response")
            return None

        logger.info(f"Weekly digest: trend={digest.get('trend')}")

        # Send SMS to family
        if settings.family_phone and digest.get("family_message"):
            _send_family_sms(digest["family_message"])

        return digest

    except httpx.HTTPStatusError as e:
        logger.error(
            f"Dust API error (digest): {e.response.status_code} — {e.response.text[:300]}"
        )
        return None
    except Exception as e:
        logger.error(f"Weekly digest failed: {e}", exc_info=True)
        return None


def _extract_text_response(conversation: dict) -> str | None:
    """Extract the agent's text response (not JSON) from a Dust conversation."""
    for message_group in conversation.get("content", []):
        for msg in message_group:
            if msg.get("type") == "agent_message" and msg.get("status") == "succeeded":
                return msg.get("content", "").strip()
    return None


async def ask_advice(question: str) -> str | None:
    """
    Ask a general caregiving question to a Dust advice agent.
    The agent can use web search and reasoning to give tips and advice.
    """
    if (
        not settings.dust_api_key
        or not settings.dust_workspace_id
        or not settings.dust_qa_agent_id
    ):
        logger.warning("Dust advice agent not configured")
        return None

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{DUST_API_BASE}/w/{settings.dust_workspace_id}/assistant/conversations",
                headers={
                    "Authorization": f"Bearer {settings.dust_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "message": {
                        "content": f"Answer in 2-3 short sentences max. Be practical and direct.\n\nQuestion: {question}",
                        "mentions": [{"configurationId": settings.dust_qa_agent_id}],
                        "context": {
                            "username": "veille-backend",
                            "timezone": "Europe/Paris",
                            "fullName": "Veille System",
                            "email": "system@veille.app",
                            "origin": "api",
                        },
                    },
                    "blocking": True,
                    "title": f"Advice — {question[:30]}",
                },
            )
            resp.raise_for_status()

        data = resp.json()
        answer = _extract_text_response(data.get("conversation", {}))
        if answer:
            logger.info(f"Advice for '{question[:40]}': {answer[:100]}...")
        return answer

    except httpx.HTTPStatusError as e:
        logger.error(f"Dust advice API error: {e.response.status_code} — {e.response.text[:300]}")
        return None
    except Exception as e:
        logger.error(f"Dust advice failed: {e}", exc_info=True)
        return None


def _send_family_sms(message: str):
    """Send an SMS alert to the family member via Twilio."""
    try:
        from services.twilio_service import twilio_client

        twilio_client.messages.create(
            body=message,
            from_=settings.twilio_phone_number,
            to=settings.family_phone,
        )
        logger.info(f"Family SMS sent to {settings.family_phone}")
    except Exception as e:
        logger.error(f"Failed to send family SMS: {e}", exc_info=True)
