import asyncio
import logging
import time

from config import settings
from db import supabase
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from models import AuthResponse, LoginRequest, SignupRequest, TriggerCallResponse
from services.auth_service import create_token, hash_password, verify_password
from services.dust_service import (
    ask_advice,
    trigger_post_call_analysis,
    trigger_weekly_digest,
)
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
    resident = (
        supabase.table("residents")
        .insert(
            {
                "name": req.loved_one_name,
                "phone": req.loved_one_phone or settings.resident_phone,
                "age": req.loved_one_age,
            }
        )
        .execute()
    )
    resident_id = resident.data[0]["id"]

    # Create user
    user = (
        supabase.table("users")
        .insert(
            {
                "email": req.email,
                "password_hash": hash_password(req.password),
                "name": req.name,
                "resident_id": resident_id,
            }
        )
        .execute()
    )
    user_id = user.data[0]["id"]

    # Create family member link
    supabase.table("family_members").insert(
        {
            "resident_id": resident_id,
            "name": req.name,
            "phone": req.user_phone or settings.family_phone or "",
            "relationship": req.relationship,
        }
    ).execute()

    token = create_token(user_id, resident_id)
    return AuthResponse(
        token=token, user_id=user_id, resident_id=resident_id, name=req.name
    )


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
    resident = (
        supabase.table("residents")
        .select("*")
        .eq("id", payload["resident_id"])
        .execute()
    )

    if not user.data or not resident.data:
        raise HTTPException(status_code=404, detail="User not found")

    # Get family member record for user's phone + relationship
    fm = (
        supabase.table("family_members")
        .select("*")
        .eq("resident_id", payload["resident_id"])
        .eq("name", user.data[0]["name"])
        .execute()
    )
    fm_data = fm.data[0] if fm.data else {}

    return {
        "user": {
            "id": user.data[0]["id"],
            "name": user.data[0]["name"],
            "email": user.data[0]["email"],
            "phone": fm_data.get("phone", ""),
            "relationship": fm_data.get("relationship", ""),
        },
        "resident": {
            "id": resident.data[0]["id"],
            "name": resident.data[0]["name"],
            "age": resident.data[0].get("age"),
            "phone": resident.data[0].get("phone", ""),
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
            {
                "role": "user",
                "text": "Oh I'm doing great! I made a lovely soup yesterday.",
                "timestamp": time.time(),
            },
            {
                "role": "assistant",
                "text": "That sounds wonderful! What kind of soup?",
                "timestamp": time.time(),
            },
            {
                "role": "user",
                "text": "A nice vegetable soup, with carrots and leeks from my garden.",
                "timestamp": time.time(),
            },
        ],
        "yellow": [
            {
                "role": "user",
                "text": "I'm not feeling too well today, I didn't sleep much.",
                "timestamp": time.time(),
            },
            {
                "role": "assistant",
                "text": "I'm sorry to hear that. Is there anything bothering you?",
                "timestamp": time.time(),
            },
            {
                "role": "user",
                "text": "My knee has been hurting a lot, and I feel quite tired.",
                "timestamp": time.time(),
            },
        ],
        "red": [
            {
                "role": "user",
                "text": "Well... yesterday I fell in the kitchen.",
                "timestamp": time.time(),
            },
            {
                "role": "assistant",
                "text": "Oh dear, are you alright? What happened?",
                "timestamp": time.time(),
            },
            {
                "role": "user",
                "text": "I couldn't get up for a while. I'm okay now but it scared me.",
                "timestamp": time.time(),
            },
        ],
    }

    if scenario not in scenarios:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown scenario: {scenario}. Use green, yellow, or red.",
        )

    transcript = scenarios[scenario]

    # Create a fake call record
    rid = resident_id or settings.resident_id
    from datetime import datetime, timezone

    call_result = (
        supabase.table("calls")
        .insert(
            {
                "resident_id": rid,
                "status": "completed",
                "started_at": datetime.now(timezone.utc).isoformat(),
                "ended_at": datetime.now(timezone.utc).isoformat(),
                "duration_seconds": 120,
                "transcript": transcript,
                "turn_count": len([t for t in transcript if t["role"] == "user"]),
            }
        )
        .execute()
    )

    call_id = call_result.data[0]["id"]

    await trigger_post_call_analysis(
        call_id=call_id,
        resident_id=rid,
        transcript=transcript,
        turn_count=len([t for t in transcript if t["role"] == "user"]),
        duration_seconds=120,
    )

    return {"status": "analysis triggered", "scenario": scenario, "call_id": call_id}


@app.get("/api/dashboard/report-insights")
async def get_report_insights(resident_id: str = ""):
    """Generate behavioral insights + topics from recent analyses and calls."""
    from collections import Counter

    rid = resident_id or settings.resident_id

    # Fetch last 7 analyses
    analyses_result = (
        supabase.table("analyses")
        .select("*")
        .eq("resident_id", rid)
        .order("created_at", desc=True)
        .limit(7)
        .execute()
    )
    analyses = analyses_result.data or []

    # Fetch last 7 calls for duration data
    calls_result = (
        supabase.table("calls")
        .select("duration_seconds,turn_count,created_at")
        .eq("resident_id", rid)
        .order("created_at", desc=True)
        .limit(7)
        .execute()
    )
    calls = calls_result.data or []

    # --- Conversation patterns ---
    durations = [c["duration_seconds"] for c in calls if c.get("duration_seconds")]
    avg_duration = round(sum(durations) / len(durations) / 60, 1) if durations else 0
    total_calls = len(calls)
    conv_detail = (
        f"{total_calls} conversation(s) this week, averaging {avg_duration} min each."
        if total_calls
        else "No conversations this week."
    )
    conv_trend = (
        "stable" if total_calls >= 3 else ("down" if total_calls > 0 else "neutral")
    )

    # --- Emotional tone ---
    mood_scores = [a["mood_score"] for a in analyses if a.get("mood_score") is not None]
    if mood_scores:
        avg_mood = round(sum(mood_scores) / len(mood_scores) * 100)
        low_days = sum(1 for m in mood_scores if m < 0.5)
        if avg_mood >= 70 and low_days == 0:
            mood_detail = (
                f"Overall positive mood (avg {avg_mood}%). No low days detected."
            )
            mood_trend = "stable"
        elif low_days > 0:
            mood_detail = f"Average mood {avg_mood}%. {low_days} day(s) below normal — might be worth checking in."
            mood_trend = "down"
        else:
            mood_detail = (
                f"Average mood {avg_mood}%. Fairly consistent throughout the week."
            )
            mood_trend = "stable"
    else:
        mood_detail = "No mood data available yet."
        mood_trend = "neutral"

    # --- Cognitive / safety markers from signals ---
    all_signals = []
    for a in analyses:
        all_signals.extend(a.get("signals") or [])

    health_signals = [s for s in all_signals if s.get("type") == "health"]
    safety_signals = [s for s in all_signals if s.get("type") == "safety"]
    if safety_signals:
        worst = max(safety_signals, key=lambda s: s.get("severity", 0))
        cog_detail = f"Safety concern detected: {worst.get('detail', 'see analysis')}."
        cog_trend = "down"
    elif health_signals:
        cog_detail = f"{len(health_signals)} health signal(s) detected this week. Review daily summaries for detail."
        cog_trend = "neutral"
    else:
        cog_detail = "No health or safety concerns detected this week."
        cog_trend = "stable"

    insights = [
        {
            "icon": "MessageCircle",
            "title": "Conversation patterns",
            "detail": conv_detail,
            "trend": conv_trend,
        },
        {
            "icon": "Heart",
            "title": "Emotional tone",
            "detail": mood_detail,
            "trend": mood_trend,
        },
        {
            "icon": "Brain",
            "title": "Health & safety markers",
            "detail": cog_detail,
            "trend": cog_trend,
        },
    ]

    # --- Topics mentioned (from tags) ---
    all_tags: list[str] = []
    # Track which tags appeared in previous weeks (simple: first seen = new)
    for a in analyses:
        all_tags.extend(a.get("tags") or [])

    tag_counts = Counter(all_tags)
    topics = [
        {"topic": tag, "count": count, "isNew": count == 1}
        for tag, count in tag_counts.most_common(8)
        if tag  # skip empty strings
    ]

    return {"insights": insights, "topics": topics}


@app.get("/api/dashboard/nudges")
async def get_nudges(resident_id: str = ""):
    """Generate smart nudges from recent analyses signals/tags."""
    rid = resident_id or settings.resident_id
    result = (
        supabase.table("analyses")
        .select("*")
        .eq("resident_id", rid)
        .order("created_at", desc=True)
        .limit(7)
        .execute()
    )

    nudges: list[dict] = []
    if not result.data:
        return nudges

    # Collect signals and tags across recent analyses
    all_signals: list[dict] = []
    all_tags: list[str] = []
    alert_count = {"yellow": 0, "red": 0}
    for a in result.data:
        for s in a.get("signals") or []:
            all_signals.append(s)
        all_tags.extend(a.get("tags") or [])
        if a["alert_level"] in alert_count:
            alert_count[a["alert_level"]] += 1

    # Group signals by type and pick high-severity ones
    from collections import Counter

    tag_counts = Counter(all_tags)
    for tag, count in tag_counts.most_common(3):
        if count >= 2:
            nudges.append(
                {
                    "text": f'"{tag}" mentioned {count} times this week',
                    "suggestion": "Maybe ask about it on your next call?",
                }
            )

    # Surface concerning signals
    for s in all_signals:
        if s.get("severity", 0) >= 7:
            nudges.append(
                {
                    "text": s.get("detail", "Something concerning detected"),
                    "suggestion": "Worth checking in about this",
                }
            )
            if len(nudges) >= 4:
                break

    # Alert-level nudge
    if alert_count["red"] > 0:
        nudges.append(
            {
                "text": f"{alert_count['red']} concerning conversation(s) this week",
                "suggestion": "Consider calling soon",
            }
        )
    elif alert_count["yellow"] > 0:
        nudges.append(
            {
                "text": f"{alert_count['yellow']} conversation(s) felt a bit off this week",
                "suggestion": "Nothing urgent, but worth staying attentive",
            }
        )

    # Family messages as nudges
    for a in result.data:
        if a.get("family_message") and a["alert_level"] != "green":
            nudges.append(
                {
                    "text": a["family_message"],
                    "suggestion": "From today's conversation analysis",
                }
            )
            break

    return nudges[:5]


@app.post("/api/digest/trigger")
async def trigger_digest(resident_id: str = ""):
    """Trigger a weekly digest: analyzes last 7 days and SMS the family."""
    rid = resident_id or settings.resident_id
    digest = await trigger_weekly_digest(rid)
    if not digest:
        raise HTTPException(status_code=500, detail="Failed to generate weekly digest")
    return digest


@app.post("/api/advice")
async def get_advice(question: str):
    """Ask a general caregiving question to the Dust advice agent."""
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question is required")
    answer = await ask_advice(question)
    if not answer:
        raise HTTPException(status_code=500, detail="Could not generate advice")
    return {"question": question, "answer": answer}


@app.on_event("startup")
async def startup():
    logger.info("Veille backend starting up")
    logger.info(f"Server base URL: {settings.server_base_url}")
