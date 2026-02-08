import logging
from datetime import datetime, timezone

from twilio.rest import Client as TwilioClient
from twilio.twiml.voice_response import VoiceResponse, Connect

from config import settings
from db import supabase

logger = logging.getLogger(__name__)

twilio_client = TwilioClient(settings.twilio_account_sid, settings.twilio_auth_token)


def build_stream_twiml() -> str:
    """Build TwiML that connects the call to our WebSocket for bidirectional streaming."""
    response = VoiceResponse()
    connect = Connect()
    connect.stream(url=f"wss://{settings.server_base_url}/ws/twilio-stream")
    response.append(connect)
    return str(response)


def end_call(call_sid: str):
    """Hang up a call via the Twilio REST API."""
    twilio_client.calls(call_sid).update(status="completed")
    logger.info(f"Call ended via API: SID={call_sid}")


def create_outbound_call(resident_id: str = "") -> dict:
    """
    Create an outbound Twilio call to the resident and store the call record in Supabase.
    Looks up the resident's phone number from the database.

    Returns dict with 'call_id' (our UUID) and 'twilio_call_sid'.
    """
    rid = resident_id or settings.resident_id

    # Look up resident phone from DB
    resident = supabase.table("residents").select("phone").eq("id", rid).execute()
    if not resident.data or not resident.data[0].get("phone"):
        raise ValueError(f"No phone number found for resident {rid}")
    resident_phone = resident.data[0]["phone"]

    twiml = build_stream_twiml()

    call = twilio_client.calls.create(
        to=resident_phone,
        from_=settings.twilio_phone_number,
        twiml=twiml,
    )
    logger.info(f"Twilio call created: SID={call.sid}, to={resident_phone}")

    now = datetime.now(timezone.utc).isoformat()
    result = supabase.table("calls").insert({
        "resident_id": rid,
        "twilio_call_sid": call.sid,
        "status": "pending",
        "started_at": now,
        "transcript": [],
        "turn_count": 0,
    }).execute()

    call_record = result.data[0]
    logger.info(f"Call record created in DB: id={call_record['id']}")

    return {
        "call_id": call_record["id"],
        "twilio_call_sid": call.sid,
    }
