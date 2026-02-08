import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PulseCard } from "@/components/PulseCard";
import { NudgeCard } from "@/components/NudgeCard";
import { WeekPulseStrip } from "@/components/WeekPulseStrip";
import { DayDetailSheet } from "@/components/DayDetailSheet";
import { Search, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Generate dates for this week
const getWeekDates = () => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { day, date: `${d.getDate()}/${d.getMonth() + 1}` };
  });
};

const weekDates = getWeekDates();

const weekPulse = [
  { ...weekDates[0], status: "good" as const },
  { ...weekDates[1], status: "good" as const },
  { ...weekDates[2], status: "good" as const },
  { ...weekDates[3], status: "warning" as const },
  { ...weekDates[4], status: "alert" as const },
  { ...weekDates[5], status: "good" as const },
  { ...weekDates[6], status: "good" as const },
];

const dayDetails: Record<string, { summary: string; alert?: { title: string; description: string; actions: { label: string; primary?: boolean }[] } }> = {
  Mon: { summary: "Marie sounded cheerful. She talked about making jam and mentioned her friend Françoise visited." },
  Tue: { summary: "Good conversation. She mentioned a walk in the park and was in good spirits." },
  Wed: { summary: "Marie was talkative, discussed her garden and a TV show she enjoyed." },
  Thu: {
    summary: "Marie mentioned feeling a bit tired. Her speech pace was slower than usual.",
    alert: {
      title: "Attention recommandée",
      description: "Marie a mentionné être tombée hier. Elle dit aller bien mais elle avait du mal à se relever. Son débit de parole était plus lent que d'habitude aujourd'hui.",
      actions: [
        { label: "Appeler Marie", primary: true },
        { label: "Appeler Dr. Martin" },
      ],
    },
  },
  Fri: {
    summary: "Concerning patterns detected. Marie didn't mention eating and sounded confused about the day.",
    alert: {
      title: "Urgent attention needed",
      description: "Marie seemed disoriented during the call. She confused today with yesterday and couldn't recall her last meal. This is unusual for her.",
      actions: [
        { label: "Appeler Marie", primary: true },
        { label: "Appeler Dr. Martin" },
      ],
    },
  },
  Sat: { summary: "Marie was in great spirits. She mentioned Sophie's visit and was very happy." },
  Sun: { summary: "Calm Sunday. Marie mentioned reading and listening to music. All seemed well." },
};

const nudges = [
  { text: "Mom mentioned her knee 3 times this week", suggestion: "Maybe ask her about it on your next call?" },
  { text: "She sounded really happy talking about Françoise", suggestion: "Might be nice to mention her neighbor" },
  { text: "She hasn't mentioned eating dinner in 4 days", suggestion: "Could be nothing, but worth checking" },
];

export default function FamilyHome() {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleDayClick = (day: string) => {
    setSelectedDay(selectedDay === day ? null : day);
  };

  const selectedPulse = selectedDay ? weekPulse.find((d) => d.day === selectedDay) : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Hello, Sophie</h1>
            <p className="text-sm text-muted-foreground">Here's how Mom is doing</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Search className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-alert" />
            </button>
          </div>
        </motion.div>

        {/* Pulse Card */}
        <PulseCard
          parentName="Marie"
          status="good"
          lastTalked="Last conversation: Today, 9:14 AM"
          summary="She mentioned making soup and seemed in good spirits. Talked about the garden for 5 minutes."
        />

        {/* This Week Strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
          <h3 className="text-base font-bold text-foreground mb-3">This week's pulse</h3>
          <div className="rounded-2xl bg-card shadow-veille p-4">
            <WeekPulseStrip days={weekPulse} selectedDay={selectedDay} onDayClick={handleDayClick} />
          </div>

          {/* Day detail sheet */}
          <AnimatePresence>
            {selectedDay && selectedPulse && dayDetails[selectedDay] && (
              <DayDetailSheet
                detail={{
                  day: selectedDay,
                  date: selectedPulse.date || "",
                  status: selectedPulse.status,
                  summary: dayDetails[selectedDay].summary,
                  alert: dayDetails[selectedDay].alert,
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
