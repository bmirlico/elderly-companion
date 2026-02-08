# 🤝 Elderly — AI Phone Companion for Elderly People

> _Because staying close doesn't require being nearby._

**Elderly** is an AI-powered phone companion that calls elderly people daily, has warm conversations with them, then analyzes the call to keep their family informed — all through a beautiful mobile dashboard.

---

## 📋 Table of Contents

- [✨ How It Works](#-how-it-works)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚡ Quick Start](#-quick-start)
- [🔧 Environment Variables](#-environment-variables)
- [🗄️ Database Schema](#️-database-schema)
- [📡 API Reference](#-api-reference)
- [🎨 Frontend Pages](#-frontend-pages)
- [🧠 AI Pipeline](#-ai-pipeline)
- [📁 Project Structure](#-project-structure)

---

## ✨ How It Works

```
📞 Twilio Call → 🎙️ Gradium STT → 🤖 OpenAI GPT-4o → 🔊 Gradium TTS → 📞 Twilio Audio
                                         ↓
                                   💾 Transcript
                                         ↓
                              🧪 Dust Post-Call Analysis
                                         ↓
                        🟢🟡🔴 Alert Level + Mood Score + Signals
                                         ↓
                           📱 Family Dashboard + 📲 SMS Alerts
```

1. **📞 Daily Call** — Twilio places an outbound call to the elderly resident
2. **🎙️ Real-time STT** — Gradium transcribes speech with VAD turn detection
3. **🤖 AI Conversation** — OpenAI GPT-4o-mini generates warm, empathetic responses
4. **🔊 Text-to-Speech** — Gradium streams natural audio back through the call
5. **🧪 Post-Call Analysis** — Dust AI agent analyzes the transcript for health/mood/safety signals
6. **📱 Family Dashboard** — React app shows daily pulse, weekly trends, mood charts, and smart nudges
7. **📲 SMS Alerts** — Automatic Twilio SMS to family members when something concerning is detected

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    frontend/ (Frontend)                 │
│          React 18 + TypeScript + Tailwind + Shadcn       │
│         React Query for API state management             │
└─────────────────────────┬────────────────────────────────┘
                          │ Vite Proxy /api → :8000
┌─────────────────────────▼────────────────────────────────┐
│                  backend/ (Backend)                 │
│                   FastAPI + Python 3.13                   │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌───────────┐   │
│  │ Twilio  │  │ Gradium  │  │ OpenAI │  │   Dust    │   │
│  │ Calls   │  │ STT/TTS  │  │ GPT-4o │  │ Analysis  │   │
│  │ + SMS   │  │ + VAD    │  │  mini  │  │ + Digest  │   │
│  └────┬────┘  └────┬─────┘  └───┬────┘  └─────┬─────┘   │
│       │            │            │              │          │
│       └──── WebSocket (bidirectional) ────────┘          │
│                                                          │
└─────────────────────────┬────────────────────────────────┘
                          │
              ┌───────────▼───────────┐
              │   Supabase (Postgres)  │
              │  residents · calls     │
              │  analyses · users      │
              └────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | Web framework + WebSocket support |
| **Twilio** | Outbound calls, bidirectional media streams, SMS alerts |
| **Gradium** | Speech-to-text (STT) with VAD + text-to-speech (TTS) |
| **OpenAI GPT-4o-mini** | Conversational AI (streaming, 80-token responses) |
| **Dust** | Post-call analysis agent + weekly digest agent |
| **Supabase** | PostgreSQL database + API |
| **PyJWT + bcrypt** | Authentication (JWT tokens, password hashing) |
| **Python 3.13** | Runtime (uses `audioop-lts` for audio processing) |

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool + dev server |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/ui + Radix** | Accessible UI component library |
| **Framer Motion** | Animations and transitions |
| **React Query** | Server state management (auto-refetch every 30s) |
| **Recharts** | Mood charts and data visualization |
| **Lucide React** | Icon library |

---

## ⚡ Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Twilio](https://twilio.com) account with a phone number
- A [Gradium](https://gradium.ai) API key
- An [OpenAI](https://platform.openai.com) API key
- A [Dust](https://dust.tt) workspace with two agents configured

### 1️⃣ Clone the repository

```bash
git clone https://github.com/bmirlico/elderly-companion.git
cd elderly-companion
```

### 2️⃣ Set up the database

Run `backend/schema.sql` in the Supabase SQL Editor. This creates all tables and seeds demo data.

### 3️⃣ Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # Then fill in your API keys
uvicorn main:app --reload --port 8000
```

### 4️⃣ Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:8080` and proxies `/api` requests to the backend on port 8000.

### 5️⃣ Expose for Twilio (development)

```bash
ngrok http 8000
```

Set the ngrok URL as `SERVER_BASE_URL` in your `.env`.

---

## 🔧 Environment Variables

Create a `.env` file in `backend/`:

```env
# 📞 Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1234567890

# 🎙️ Gradium (STT/TTS)
GRADIUM_API_KEY=xxxxx

# 🤖 OpenAI
OPENAI_API_KEY=sk-xxxxx

# 🧪 Dust (AI Analysis)
DUST_API_KEY=xxxxx
DUST_WORKSPACE_ID=xxxxx
DUST_AGENT_ID=xxxxx               # Per-call analysis agent
DUST_DIGEST_AGENT_ID=xxxxx        # Weekly digest agent

# 🗄️ Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=xxxxx

# 🌐 Server
SERVER_BASE_URL=your-ngrok-url.ngrok.io

# 📱 Phone Numbers
RESIDENT_PHONE=+33612345678       # Elderly person's phone
FAMILY_PHONE=+33698765432         # Family member's phone (SMS alerts)

# 🔐 Auth
JWT_SECRET=your-secret-key-here

# 🎯 Demo
RESIDENT_ID=11111111-1111-1111-1111-111111111111
```

---

## 🗄️ Database Schema

Five tables in Supabase (PostgreSQL):

| Table | Purpose |
|---|---|
| `residents` | Elderly people being cared for (name, phone, age, preferences) |
| `family_members` | Family members linked to a resident |
| `calls` | Call logs with transcripts, duration, Twilio SID |
| `analyses` | AI analysis results: alert level, mood score, signals, tags |
| `users` | Dashboard users (email, password hash, linked resident) |

### Key relationships

```
users ──→ residents ←── family_members
                ↑
              calls ──→ analyses
```

---

## 📡 API Reference

### 🔐 Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Create account + resident profile |
| `POST` | `/api/auth/login` | Login, returns JWT token |
| `GET` | `/api/auth/me?token=` | Get current user + resident info |

### 📞 Calls

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/call/trigger` | Trigger outbound call to resident |
| `WS` | `/ws/twilio-stream` | Twilio bidirectional media stream |

### 📊 Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/today?resident_id=` | Latest analysis for today |
| `GET` | `/api/dashboard/pulse?resident_id=` | Last 7 days of analyses |
| `GET` | `/api/dashboard/call-status?resident_id=` | Most recent call status |
| `GET` | `/api/dashboard/nudges?resident_id=` | Smart nudges from recent data |

### 🧪 Testing & Analysis

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/call/simulate?scenario=` | Simulate a call (green/yellow/red) |
| `POST` | `/api/digest/trigger?resident_id=` | Trigger weekly digest analysis |

### 🏥 Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |

---

## 🎨 Frontend Pages

### 👤 Auth Flow
- `/welcome` — Landing page
- `/login` — Family member sign in
- `/signup` — Create account with loved one's name and age

### 📱 Family Dashboard (with bottom navigation)
- `/` — **Home** — Daily pulse card, weekly strip, smart nudges
- `/reports` — **Reports** — Weekly report, mood chart, behavioral insights, topics
- `/resources` — **Resources** — Wellness tips, medication, emergency contacts, nearby services
- `/action` — **Actions** — Action items from analyses
- `/profile` — **Profile** — Dynamic user info, settings, sign out

### 👴 Elderly Person
- `/elder-setup` — Initial setup
- `/elder-home` — Home screen for the resident
- `/companion` — Trigger and monitor AI companion calls

---

## 🧠 AI Pipeline

### 🎙️ Speech-to-Text (Gradium)

The `STTSession` class manages streaming audio with intelligent turn detection:

- **Punctuation detection** — Gradium adds `.` `!` `?` when detecting complete thoughts
- **Inactivity probability** — Triggers above 80% threshold
- **Silence timeout** — 4-second fallback
- **Echo suppression** — 3-second cooldown after AI speaks + mute/unmute during TTS
- **Minimum word count** — Requires 2+ words to prevent noise triggers

### 🤖 Conversation (OpenAI GPT-4o-mini)

- Personalized system prompt with resident's name and age
- Streaming token generation for low-latency responses
- 80-token max to keep responses conversational
- Warm, patient, friend-like personality
- Open-ended questions to encourage talking

### 🔊 Text-to-Speech (Gradium)

- Streams OpenAI tokens → clause buffering → Gradium TTS
- **Manon** voice (gentle, warm, calm)
- Native ulaw 8000 Hz format (no server-side conversion needed)
- 200ms minimum buffer for natural pacing

### 🧪 Post-Call Analysis (Dust)

Two separate Dust AI agents:

**Per-Call Agent** — Analyzes each conversation transcript:
- `alert_level`: 🟢 green / 🟡 yellow / 🔴 red
- `mood_score`: 0.0 to 1.0
- `signals`: Health, safety, mood, and social indicators with severity
- `tags`: Topic tags for tracking over time
- `family_message`: SMS-ready message for yellow/red alerts

**Weekly Digest Agent** — Analyzes 7-day trends:
- `trend`: improving / stable / declining
- `week_summary`: Narrative summary
- `key_concerns` and `positive_notes`
- `recommendation` and `family_message`

---

## 📁 Project Structure

```
elderly-companion/
│
├── backend/                 # 🐍 FastAPI Backend
│   ├── main.py                     # App routes + WebSocket endpoint
│   ├── config.py                   # Environment configuration
│   ├── db.py                       # Supabase client
│   ├── models.py                   # Pydantic data models
│   ├── schema.sql                  # Database schema + seed data
│   ├── requirements.txt            # Python dependencies
│   ├── services/
│   │   ├── twilio_service.py       # 📞 Call management + TwiML
│   │   ├── gradium_service.py      # 🎙️ STT/TTS + VAD turn detection
│   │   ├── openai_service.py       # 🤖 Streaming conversation
│   │   ├── dust_service.py         # 🧪 Analysis + weekly digest
│   │   └── auth_service.py         # 🔐 JWT + bcrypt auth
│   └── ws/
│       └── call_handler.py         # 🔄 Twilio WebSocket state machine
│
├── frontend/                    # ⚛️ React Frontend
│   ├── src/
│   │   ├── api/client.ts           # API client + types + transforms
│   │   ├── hooks/use-api.ts        # React Query hooks
│   │   ├── components/             # Reusable UI components
│   │   │   ├── PulseCard.tsx       # Daily status card
│   │   │   ├── WeekPulseStrip.tsx  # 7-day overview strip
│   │   │   ├── MoodChart.tsx       # Recharts mood visualization
│   │   │   ├── NudgeCard.tsx       # Smart insight cards
│   │   │   ├── DayDetailSheet.tsx  # Expandable day detail
│   │   │   ├── StatusDot.tsx       # Animated status indicator
│   │   │   └── ui/                 # Shadcn/ui components
│   │   └── pages/                  # 20+ route pages
│   ├── vite.config.ts              # Vite + API proxy config
│   └── tailwind.config.ts          # Custom theme + status colors
│
└── README.md
```

---

## 🚀 Production Deployment

### Backend on Render

1. Go to [render.com](https://render.com) > **New** > **Web Service**
2. Connect your GitHub repo (`bmirlico/elderly-companion`)
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables from `.env.example` in the **Environment** tab
5. Set `SERVER_BASE_URL` to your Render URL (e.g. `elderly-backend.onrender.com`)
6. Deploy

### Frontend on Render

1. Go to [render.com](https://render.com) > **New** > **Static Site**
2. Connect the same GitHub repo
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable: `VITE_API_URL` = your backend Render URL
5. Deploy

### Custom Domain (elderly.cc)

1. Purchase `elderly.cc` from your domain registrar
2. In Render > your static site > **Custom Domains** > add `elderly.cc`
3. Add the DNS records Render provides (CNAME or A record) at your registrar
4. Enable HTTPS (automatic via Render)

### Post-Deploy Checklist

- [ ] Update `SERVER_BASE_URL` in backend env to Render URL
- [ ] Update Twilio webhook URL to point to the Render backend
- [ ] Update frontend `vite.config.ts` proxy to point to production backend URL (or use `VITE_API_URL`)
- [ ] Run `schema.sql` in Supabase if not done
- [ ] Test `/health` endpoint
- [ ] Create an account and test the full flow

---

## 🧑‍💻 Team

| Name | GitHub |
|---|---|
| 🧑‍💻 Anthony | [@aakinboh-gramsneural](https://github.com/aakinboh-gramsneural) |
| 🧑‍💻 Wei-Ling | [@whung99](https://github.com/whung99) |
| 🧑‍💻 Luli | [@lumaruyam](https://github.com/lumaruyam) |
| 🧑‍💻 Bastien | [@bmirlico](https://github.com/bmirlico) |

Built with ❤️ at {Tech: Europe} Paris AI Hackathon — because every elderly person deserves someone to talk to, and every family deserves peace of mind.
