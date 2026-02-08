const API_BASE = "/api";

export function getStoredToken(): string | null {
  return localStorage.getItem("veille_token");
}

export function getStoredUser(): { name: string; resident_id: string; user_id: string } | null {
  const raw = localStorage.getItem("veille_user");
  return raw ? JSON.parse(raw) : null;
}

export function storeAuth(token: string, user: { name: string; resident_id: string; user_id: string }) {
  localStorage.setItem("veille_token", token);
  localStorage.setItem("veille_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("veille_token");
  localStorage.removeItem("veille_user");
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// --- Auth types ---

export interface AuthResponse {
  token: string;
  user_id: string;
  resident_id: string;
  name: string;
}

// --- Types matching backend responses ---

export interface Signal {
  type: "health" | "safety" | "mood" | "social";
  detail: string;
  severity: number;
}

export interface Analysis {
  id: string;
  call_id: string;
  resident_id: string;
  alert_level: "green" | "yellow" | "red";
  summary: string | null;
  mood_score: number | null;
  signals: Signal[];
  tags: string[];
  family_message: string | null;
  created_at: string;
}

export interface Call {
  id: string;
  resident_id: string;
  twilio_call_sid: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript: { role: string; text: string; timestamp: number }[];
  turn_count: number;
  status: string;
  created_at: string;
}

export interface Digest {
  trend: "improving" | "stable" | "declining";
  week_summary: string;
  key_concerns: string[];
  positive_notes: string[];
  recommendation: string;
  family_message: string;
}

// --- API functions ---

export interface MeResponse {
  user: { id: string; name: string; email: string };
  resident: { id: string; name: string; age: number | null };
}

export const authApi = {
  me: () => {
    const token = getStoredToken();
    if (!token) return Promise.reject(new Error("No token"));
    return fetchAPI<MeResponse>(`/auth/me?token=${token}`);
  },
  signup: (data: {
    email: string;
    password: string;
    name: string;
    loved_one_name: string;
    loved_one_age: number;
    relationship: string;
  }) => fetchAPI<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchAPI<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
};

function rid() {
  return getStoredUser()?.resident_id ?? "";
}

export const api = {
  getDashboardToday: () => fetchAPI<Analysis | null>(`/dashboard/today?resident_id=${rid()}`),
  getDashboardPulse: () => fetchAPI<Analysis[]>(`/dashboard/pulse?resident_id=${rid()}`),
  getCallStatus: () => fetchAPI<Call | null>(`/dashboard/call-status?resident_id=${rid()}`),
  triggerCall: () => fetchAPI<{ call_id: string; status: string }>(`/call/trigger?resident_id=${rid()}`, { method: "POST" }),
  simulateCall: (scenario: string) =>
    fetchAPI<{ status: string; scenario: string; call_id: string }>(
      `/call/simulate?scenario=${scenario}&resident_id=${rid()}`,
      { method: "POST" },
    ),
  triggerDigest: () => fetchAPI<Digest>(`/digest/trigger?resident_id=${rid()}`, { method: "POST" }),
};

// --- Transform helpers ---

export type StatusLevel = "good" | "warning" | "alert" | "inactive";

export function alertToStatus(alertLevel: string): StatusLevel {
  const map: Record<string, StatusLevel> = {
    green: "good",
    yellow: "warning",
    red: "alert",
  };
  return map[alertLevel] ?? "inactive";
}

export function formatLastTalked(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (isToday) return `Last conversation: Today, ${time}`;
  if (isYesterday) return `Last conversation: Yesterday, ${time}`;
  return `Last conversation: ${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}, ${time}`;
}

export function analysisToDay(a: Analysis): string {
  return new Date(a.created_at).toLocaleDateString("en-US", { weekday: "short" });
}

export function analysisToDate(a: Analysis): string {
  const d = new Date(a.created_at);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
