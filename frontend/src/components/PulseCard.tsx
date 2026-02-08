import { StatusDot } from "./StatusDot";
import { Phone, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type StatusLevel = "good" | "warning" | "alert" | "inactive";

interface PulseCardProps {
  parentName: string;
  status: StatusLevel;
  lastTalked: string;
  summary: string;
  onCallClick?: () => void;
  isCallPending?: boolean;
}

const statusMessages: Record<StatusLevel, string> = {
  good: "Talked today, sounded good",
  warning: "Talked today, something felt a bit off",
  alert: "Something concerning detected",
  inactive: "No conversation yet",
};

export function PulseCard({ parentName, status, lastTalked, summary, onCallClick, isCallPending }: PulseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-card shadow-veille p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusDot status={status} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-foreground">{parentName}</h2>
            <p className="text-xs text-muted-foreground">{lastTalked}</p>
          </div>
        </div>
        <button
          onClick={onCallClick}
          disabled={isCallPending}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50"
        >
          {isCallPending ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <Phone className="w-4 h-4 text-primary" />
          )}
        </button>
      </div>

      <div className="rounded-xl bg-secondary/60 px-4 py-3">
        <p className="text-sm font-semibold text-accent-foreground">
          {statusMessages[status]}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{summary}</p>
      </div>
    </motion.div>
  );
}
