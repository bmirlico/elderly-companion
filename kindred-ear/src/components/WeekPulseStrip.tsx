import { cn } from "@/lib/utils";

type StatusLevel = "good" | "warning" | "alert" | "inactive";

interface DayPulse {
  day: string;
  date?: string;
  status: StatusLevel;
}

const dotColor: Record<StatusLevel, string> = {
  good: "bg-status-good shadow-[0_0_8px_3px_hsl(var(--status-good)/0.45)]",
  warning: "bg-status-warning shadow-[0_0_8px_3px_hsl(var(--status-warning)/0.45)]",
  alert: "bg-status-alert shadow-[0_0_8px_3px_hsl(var(--status-alert)/0.45)]",
  inactive: "bg-status-inactive shadow-[0_0_8px_3px_hsl(var(--status-inactive)/0.3)]",
};

interface WeekPulseStripProps {
  days: DayPulse[];
  selectedDay?: string | null;
  onDayClick?: (day: string) => void;
}

export function WeekPulseStrip({ days, selectedDay, onDayClick }: WeekPulseStripProps) {
  return (
    <div className="flex items-center justify-between gap-1">
      {days.map((d) => (
        <button
          key={d.day}
          onClick={() => onDayClick?.(d.day)}
          className={cn(
            "flex flex-col items-center gap-1 py-1.5 px-2 rounded-xl transition-all",
            selectedDay === d.day && "bg-secondary",
            onDayClick && "hover:bg-secondary/60 cursor-pointer"
          )}
        >
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">{d.day}</span>
          {d.date && <span className="text-[9px] text-muted-foreground">{d.date}</span>}
          <div className={cn("w-5 h-5 rounded-full", dotColor[d.status])} />
        </button>
      ))}
    </div>
  );
}
