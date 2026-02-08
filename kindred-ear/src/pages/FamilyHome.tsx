import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PulseCard } from "@/components/PulseCard";
import { NudgeCard } from "@/components/NudgeCard";
import { WeekPulseStrip } from "@/components/WeekPulseStrip";
import { DayDetailSheet } from "@/components/DayDetailSheet";
import { Search, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboardToday, useDashboardPulse, useMe } from "@/hooks/use-api";
import { alertToStatus, formatLastTalked, analysisToDay, type Analysis } from "@/api/client";

// Fallback nudges (kept as mock — would need NLP backend to generate)
const nudges = [
  { text: "Mom mentioned her knee 3 times this week", suggestion: "Maybe ask her about it on your next call?" },
  { text: "She sounded really happy talking about her garden", suggestion: "Might be nice to mention it" },
  { text: "She hasn't mentioned eating dinner in 4 days", suggestion: "Could be nothing, but worth checking" },
];

function buildWeekPulse(analyses: Analysis[]) {
  // Build a map of day-of-week → analysis
  const byDay = new Map<string, Analysis>();
  for (const a of analyses) {
    const day = analysisToDay(a);
    if (!byDay.has(day)) byDay.set(day, a); // keep most recent per day
  }

  // Generate current week dates
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);

  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const analysis = byDay.get(day);
    return {
      day,
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      status: analysis ? alertToStatus(analysis.alert_level) : ("inactive" as const),
      analysis,
    };
  });
}

export default function FamilyHome() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const { data: me } = useMe();
  const { data: todayAnalysis, isLoading: todayLoading } = useDashboardToday();
  const { data: pulseData, isLoading: pulseLoading } = useDashboardPulse();

  const userName = me?.user.name.split(" ")[0] ?? "Sophie";
  const residentName = me?.resident.name.split(" ")[0] ?? "Marie";

  const weekPulse = pulseData ? buildWeekPulse(pulseData) : [];
  const selectedPulse = selectedDay ? weekPulse.find((d) => d.day === selectedDay) : null;

  const handleDayClick = (day: string) => {
    setSelectedDay(selectedDay === day ? null : day);
  };

  // Derive PulseCard props from today's analysis
  const status = todayAnalysis ? alertToStatus(todayAnalysis.alert_level) : "inactive";
  const lastTalked = todayAnalysis ? formatLastTalked(todayAnalysis.created_at) : "No conversation yet";
  const summary = todayAnalysis?.summary ?? "No data available yet.";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Hello, {userName}</h1>
            <p className="text-sm text-muted-foreground">Here's how {residentName} is doing</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {status === "alert" && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-alert" />}
            </button>
          </div>
        </motion.div>

        {/* Pulse Card */}
        {todayLoading ? (
          <div className="rounded-2xl bg-card shadow-veille p-5 animate-pulse h-32" />
        ) : (
          <PulseCard
            parentName={residentName}
            status={status}
            lastTalked={lastTalked}
            summary={summary}
          />
        )}

        {/* This Week Strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
          <h3 className="text-base font-bold text-foreground mb-3">This week's pulse</h3>
          <div className="rounded-2xl bg-card shadow-veille p-4">
            {pulseLoading ? (
              <div className="h-12 animate-pulse" />
            ) : (
              <WeekPulseStrip days={weekPulse} selectedDay={selectedDay} onDayClick={handleDayClick} />
            )}
          </div>

          {/* Day detail sheet */}
          <AnimatePresence>
            {selectedDay && selectedPulse?.analysis && (
              <DayDetailSheet
                detail={{
                  day: selectedDay,
                  date: selectedPulse.date || "",
                  status: alertToStatus(selectedPulse.analysis.alert_level),
                  summary: selectedPulse.analysis.summary ?? "No summary available.",
                  alert:
                    selectedPulse.analysis.alert_level !== "green" && selectedPulse.analysis.family_message
                      ? {
                          title: selectedPulse.analysis.alert_level === "red" ? "Urgent attention needed" : "Attention recommended",
                          description: selectedPulse.analysis.family_message,
                          actions: [
                            { label: `Call ${residentName}`, primary: true },
                            { label: "Call Dr. Martin" },
                          ],
                        }
                      : undefined,
                }}
                onClose={() => setSelectedDay(null)}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Nudges */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6">
          <h3 className="text-base font-bold text-foreground mb-3">Smart nudges</h3>
          <div className="space-y-3">
            {nudges.map((nudge, i) => (
              <NudgeCard key={i} text={nudge.text} suggestion={nudge.suggestion} index={i} />
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
          <button onClick={() => navigate("/reports")} className="w-full rounded-2xl bg-accent px-5 py-4 flex items-center justify-between group hover:shadow-veille transition-shadow">
            <span className="text-base font-bold text-accent-foreground">View weekly report</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
