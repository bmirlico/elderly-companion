-- Veille Backend — Supabase Schema
-- Run this in the Supabase SQL editor

-- Residents (the elderly person)
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER,
  city TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call logs
CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  twilio_call_sid TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  transcript JSONB DEFAULT '[]',     -- array of {role, text, timestamp}
  turn_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',     -- pending, in_progress, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis results (from Dust)
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  alert_level TEXT NOT NULL,          -- green, yellow, red
  summary TEXT,                       -- 2-3 sentence summary for family
  mood_score FLOAT,                   -- 0.0 to 1.0
  signals JSONB DEFAULT '[]',         -- [{type, detail, severity}]
  tags JSONB DEFAULT '[]',            -- ["health", "social", "mood"]
  family_message TEXT,                -- SMS text if yellow/red
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for dashboard queries
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_analyses_resident_id ON analyses(resident_id);
CREATE INDEX idx_calls_resident_id ON calls(resident_id);
CREATE INDEX idx_calls_twilio_sid ON calls(twilio_call_sid);

-- Seed data for demo
INSERT INTO residents (id, name, phone, age, city) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Marie Dupont', '+33XXXXXXXXX', 82, 'Toulouse');

INSERT INTO family_members (resident_id, name, phone, relationship) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sophie Dupont', '+33XXXXXXXXX', 'daughter');

-- Seed 5 days of mock call records
INSERT INTO calls (id, resident_id, status, duration_seconds, turn_count, started_at, created_at) VALUES
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'completed', 180, 5, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'completed', 200, 6, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  ('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'completed', 120, 3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'completed', 90, 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'completed', 210, 5, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Seed 5 days of mock analysis data (referencing the calls above)
INSERT INTO analyses (call_id, resident_id, alert_level, summary, mood_score, signals, tags, created_at) VALUES
  ('aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'green', 'Marie était de bonne humeur. Elle a parlé de sa recette de soupe et de son jardin.', 0.80, '[]', '["cuisine", "jardin"]', NOW() - INTERVAL '5 days'),
  ('aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'green', 'Conversation joyeuse. Marie a parlé de la visite de ses petits-enfants.', 0.75, '[]', '["famille", "humeur positive"]', NOW() - INTERVAL '4 days'),
  ('aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'yellow', 'Marie semblait fatiguée. Elle a mentionné une douleur au genou.', 0.45, '[{"type":"health","detail":"douleur genou","severity":0.5}]', '["santé", "fatigue"]', NOW() - INTERVAL '3 days'),
  ('aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'yellow', 'Conversation courte. Marie a encore parlé de son genou, peu bavarde.', 0.40, '[{"type":"health","detail":"douleur genou persistante","severity":0.55}]', '["santé", "humeur basse"]', NOW() - INTERVAL '2 days'),
  ('aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'green', 'Marie a rigolé en racontant un souvenir de Bretagne. Très bonne humeur.', 0.85, '[]', '["souvenirs", "humeur positive"]', NOW() - INTERVAL '1 day');
