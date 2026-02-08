from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


# --- Database row models ---

class Resident(BaseModel):
    id: UUID
    name: str
    phone: str
    age: Optional[int] = None
    city: Optional[str] = None
    preferences: dict = Field(default_factory=dict)
    created_at: datetime


class FamilyMember(BaseModel):
    id: UUID
    resident_id: UUID
    name: str
    phone: str
    relationship: Optional[str] = None
    created_at: datetime


class TranscriptEntry(BaseModel):
    role: str  # "user" or "assistant"
    text: str
    timestamp: float  # Unix epoch


class Call(BaseModel):
    id: UUID
    resident_id: UUID
    twilio_call_sid: Optional[str] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    transcript: list[TranscriptEntry] = Field(default_factory=list)
    turn_count: int = 0
    status: str = "pending"
    created_at: datetime


class Signal(BaseModel):
    type: str  # "health" | "safety" | "mood" | "social"
    detail: str
    severity: float  # 0.0 - 1.0


class Analysis(BaseModel):
    id: UUID
    call_id: UUID
    resident_id: UUID
    alert_level: str  # "green" | "yellow" | "red"
    summary: Optional[str] = None
    mood_score: Optional[float] = None
    signals: list[Signal] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    family_message: Optional[str] = None
    created_at: datetime


# --- API response models ---

class TriggerCallResponse(BaseModel):
    call_id: str
    twilio_call_sid: str
    status: str
    message: str


# --- Auth models ---

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    loved_one_name: str
    loved_one_age: int
    relationship: str = "family"


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user_id: str
    resident_id: str
    name: str
