import { motion } from "framer-motion";
import { X, Phone, AlertTriangle } from "lucide-react";
import { StatusDot } from "./StatusDot";

type StatusLevel = "good" | "warning" | "alert" | "inactive";

interface DayDetail {
  day: string;
  date: string;
  status: StatusLevel;
  summary: string;
  alert?: {
    title: string;
    description: string;
    actions: { label: string; primary?: boolean }[];
  };
}

interface DayDetailSheetProps {
  detail: DayDetail;
  onClose: () => void;
}

const statusLabels: Record<StatusLevel, string> = {
  good: "All good",
  warning: "Attention recommended",
  alert: "Urgent attention needed",
  inactive: "No data",
};

const statusCardBg: Record<StatusLevel, string> = {
  good: "bg-status-good-bg",
  warning: "bg-status-warning-bg",
  alert: "bg-status-alert-bg",
  inactive: "bg-status-inactive-bg",
};

const statusCardText: Record<StatusLevel, string> = {
  good: "text-status-good",
  warning: "text-status-warning",
  alert: "text-status-alert",
  inactive: "text-status-inactive",
};

export function DayDetailSheet({ detail, onClose }: DayDetailSheetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl bg-card shadow-veille-hover p-5 mt-3 relative"
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary transition-colors">
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      <div className="flex items-center gap-3 mb-3">
        <StatusDot status={detail.status} size="lg" />
        <div>
          <h3 className="text-base font-bold text-foreground">{detail.day} · {detail.date}</h3>
          <p className={`text-xs font-semibold ${statusCardText[detail.status]}`}>{statusLabels[detail.status]}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{detail.summary}</p>

      {/* Alert card for warning/alert status */}
      {detail.alert && (detail.status === "warning" || detail.status === "alert") && (
        <div className={`rounded-xl ${statusCardBg[detail.status]} p-4 space-y-3`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${statusCardText[detail.status]}`} />
              <span className={`text-sm font-bold ${statusCardText[detail.status]}`}>{detail.alert.title}</span>
            </div>
          </div>
          <p className="text-xs text-foreground/80">{detail.alert.description}</p>
          <div className="flex gap-2">
            {detail.alert.actions.map((action) => (
              <button
                key={action.label}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 ${
                  action.primary
                    ? "bg-veille-warm text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                {action.primary && <Phone className="w-3.5 h-3.5" />}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
