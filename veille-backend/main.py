import asyncio
import logging
import time

from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from db import supabase
from models import TriggerCallResponse, SignupRequest, LoginRequest, AuthResponse
from services.auth_service import hash_password, verify_password, create_token
from services.dust_service import trigger_post_call_analysis, trigger_weekly_digest
from services.twilio_service import create_outbound_call
from ws.call_handler import handle_twilio_websocket

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Veille API",
    description="AI phone companion for elderly people",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "veille-backend"}


@app.post("/api/auth/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    """Create a new user account with their loved one's profile."""
    # Check if email already exists
    existing = supabase.table("users").select("id").eq("email", req.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create resident (the loved one)
    resident = supabase.table("residents").insert({
        "name": req.loved_one_name,
        "phone": settings.resident_phone,
        "age": req.loved_one_age,
    }).execute()
    resident_id = resident.data[0]["id"]

    # Create user
    user = supabase.table("users").insert({
        "email": req.email,
        "password_hash": hash_password(req.password),
        "name": req.name,
        "resident_id": resident_id,
    }).execute()
    user_id = user.data[0]["id"]

    # Create family member link
    supabase.table("family_members").insert({
        "resident_id": resident_id,
        "name": req.name,
        "phone": settings.family_phone or "",
        "relationship": req.relationship,
    }).execute()

    token = create_token(user_id, resident_id)
    return AuthResponse(token=token, user_id=user_id, resident_id=resident_id, name=req.name)


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    """Log in with email and password."""
    result = supabase.table("users").select("*").eq("email", req.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = result.data[0]
    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["id"], user["resident_id"])
    return AuthResponse(
        token=token,
        user_id=user["id"],
        resident_id=user["resident_id"],
        name=user["name"],
    )


@app.get("/api/auth/me")
async def get_me(token: str):
    """Get current user info + resident info from token."""
    from services.auth_service import decode_token
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = supabase.table("users").select("*").eq("id", payload["user_id"]).execute()
    resident = supabase.table("residents").select("*").eq("id", payload["resident_id"]).execute()

    if not user.data or not resident.data:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user": {
            "id": user.data[0]["id"],
            "name": user.data[0]["name"],
            "email": user.data[0]["email"],
        },
        "resident": {
            "id": resident.data[0]["id"],
            "name": resident.data[0]["name"],
            "age": resident.data[0].get("age"),
        },
    }


@app.post("/api/call/trigger", response_model=TriggerCallResponse)
async def trigger_call():
    """Trigger an outbound call to the resident."""
    try:
        result = await asyncio.to_thread(create_outbound_call)
        return TriggerCallResponse(
            call_id=str(result["call_id"]),
            twilio_call_sid=result["twilio_call_sid"],
            status="pending",
            message="Call initiated successfully",
        )
    except Exception as e:
        logger.error(f"Failed to trigger call: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to trigger call: {str(e)}")


@app.websocket("/ws/twilio-stream")
async def twilio_stream(websocket: WebSocket):
    """WebSocket endpoint for Twilio Media Streams (bidirectional)."""
    await handle_twilio_websocket(websocket)


@app.get("/api/dashboard/pulse")
async def get_pulse(resident_id: str = ""):
    """Get last 7 days of analyses for the dashboard."""
    rid = resident_id or settings.resident_id
    result = (
        supabase.table("analyses")
        .select("*")
        .eq("resident_id", rid)
        .order("created_at", desc=True)
        .limit(7)
        .execute()
    )
    return result.data


@app.get("/api/dashboard/today")
async def get_today(resident_id: str = ""):
    """Get today's analysis (latest)."""
    rid = resident_id or settings.resident_id
    result = (
        supabase.table("analyses")
        .select("*")
        .eq("resident_id", rid)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


@app.get("/api/dashboard/call-status")
async def get_call_status(resident_id: str = ""):
    """Get the most recent call status."""
    rid = resident_id or settings.resident_id
    result = (
        supabase.table("calls")
        .select("*")
        .eq("resident_id", rid)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


@app.post("/api/call/simulate")
async def simulate_call(scenario: str = "green", resident_id: str = ""):
    """Skip live call, directly trigger analysis with a pre-written transcript."""
    scenarios = {
        "green": [
            {"role": "user", "text": "Oh I'm doing great! I made a lovely soup yesterday.", "timestamp": time.time()},
            {"role": "assistant", "text": "That sounds wonderful! What kind of soup?", "timestamp": time.time()},
            {"role": "user", "text": "A nice vegetable soup, with carrots and leeks from my garden.", "timestamp": time.time()},
        ],
        "yellow": [
            {"role": "user", "text": "I'm not feeling too well today, I didn't sleep much.", "timestamp": time.time()},
            {"role": "assistant", "text": "I'm sorry to hear that. Is there anything bothering you?", "timestamp": time.time()},
            {"role": "user", "text": "My knee has been hurting a lot, and I feel quite tired.", "timestamp": time.time()},
        ],
        "red": [
            {"role": "user", "text": "Well... yesterday I fell in the kitchen.", "timestamp": time.time()},
            {"role": "assistant", "text": "Oh dear, are you alright? What happened?", "timestamp": time.time()},
            {"role": "user", "text": "I couldn't get up for a while. I'm okay now but it scared me.", "timestamp": time.time()},
        ],
    }

    if scenario not in scenarios:
        raise HTTPException(status_code=400, detail=f"Unknown scenario: {scenario}. Use green, yellow, or red.")

    transcript = scenarios[scenario]

    # Create a fake call record
    rid = resident_id or settings.resident_id
    from datetime import datetime, timezone
    call_result = supabase.table("calls").insert({
        "resident_id": rid,
        "status": "completed",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "ended_at": datetime.now(timezone.utc).isoformat(),
        "duration_seconds": 120,
        "transcript": transcript,
        "turn_count": len([t for t in transcript if t["role"] == "user"]),
    }).execute()

    call_id = call_result.data[0]["id"]

    await trigger_post_call_analysis(
        call_id=call_id,
        resident_id=rid,
        transcript=transcript,
        turn_count=len([t for t in transcript if t["role"] == "user"]),
        duration_seconds=120,
    )

    return {"status": "analysis triggered", "scenario": scenario, "call_id": call_id}


@app.post("/api/digest/trigger")
async def trigger_digest(resident_id: str = ""):
    """Trigger a weekly digest: analyzes last 7 days and SMS the family."""
    rid = resident_id or settings.resident_id
    digest = await trigger_weekly_digest(rid)
    if not digest:
        raise HTTPException(status_code=500, detail="Failed to generate weekly digest")
    return digest


@app.on_event("startup")
async def startup():
    logger.info("Veille backend starting up")
    logger.info(f"Server base URL: {settings.server_base_url}")
