import { useState, useRef } from "react";
import { MoodChart } from "@/components/MoodChart";
import { WeekPulseStrip } from "@/components/WeekPulseStrip";
import { DayDetailSheet } from "@/components/DayDetailSheet";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, MessageCircle, Brain, Heart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Generate dates for this week (same logic as FamilyHome)
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

const insights = [
  {
    icon: MessageCircle,
    title: "Conversation patterns",
    detail: "15% shorter conversations compared to last month. Average: 7 min vs 8.2 min.",
    trend: "down" as const,
  },
  {
    icon: Heart,
    title: "Emotional tone",
    detail: "Happy Mon–Wed. Quieter and more tired Thursday–Friday. Mentioned feeling lonely once.",
    trend: "neutral" as const,
  },
  {
    icon: Brain,
    title: "Cognitive markers",
    detail: "Speech pace is stable. Vocabulary richness normal. No concerns this week.",
    trend: "stable" as const,
  },
];

const topicsMentioned = [
  { topic: "Knee pain", count: 3, isNew: false },
  { topic: "Garden", count: 5, isNew: false },
  { topic: "Françoise (neighbor)", count: 2, isNew: false },
  { topic: "Sleeping poorly", count: 2, isNew: true },
  { topic: "Soup recipe", count: 1, isNew: false },
];

export default function Reports() {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDayClick = (day: string) => {
    setSelectedDay(selectedDay === day ? null : day);
  };

  const selectedPulse = selectedDay ? weekPulse.find((d) => d.day === selectedDay) : null;

  const handleDownload = () => {
    const printContent = reportRef.current;
    if (!printContent) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Weekly Report</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;color:#1a1a2e}
      .hide-print{display:none}</style></head>
      <body>${printContent.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
    win.close();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-xl font-bold text-foreground">Weekly Report</h1>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </motion.div>

        <div ref={reportRef}>

        {/* Week overview with interactive day detail */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5"
        >
          <h3 className="text-base font-bold text-foreground mb-3">This week's pulse</h3>
          <div className="rounded-2xl bg-card shadow-veille p-4">
            <WeekPulseStrip days={weekPulse} selectedDay={selectedDay} onDayClick={handleDayClick} />
          </div>
          <p className="text-xs text-muted-foreground mt-3 px-1">
            Mom seemed in good spirits Mon–Wed. Thursday she sounded more tired than usual and mentioned not sleeping well.
          </p>

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

        {/* Mood Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-5"
        >
          <MoodChart />
        </motion.div>

        {/* Behavioral Insights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-5"
        >
          <h3 className="text-base font-bold text-foreground mb-3">Behavioral insights</h3>
          <div className="space-y-3">
            {insights.map((item, i) => (
              <div key={i} className="rounded-2xl bg-card shadow-veille p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                    {item.trend === "down" && <TrendingDown className="w-3 h-3 text-status-warning" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Topics Mentioned */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-base font-bold text-foreground mb-3">Topics mentioned</h3>
          <div className="rounded-2xl bg-card shadow-veille p-4">
            <div className="space-y-2.5">
              {topicsMentioned.map((t) => (
                <div key={t.topic} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{t.topic}</span>
                    {t.isNew && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-status-warning-bg text-status-warning">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">{t.count}x</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
