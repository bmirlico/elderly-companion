import { cn } from "@/lib/utils";

type StatusLevel = "good" | "warning" | "alert" | "inactive";

const statusConfig: Record<StatusLevel, { label: string; emoji: string; bgClass: string; dotClass: string }> = {
  good: { label: "Sounded good", emoji: "🟢", bgClass: "bg-status-good-bg", dotClass: "bg-status-good shadow-[0_0_8px_3px_hsl(var(--status-good)/0.45)]" },
  warning: { label: "Something felt off", emoji: "🟡", bgClass: "bg-status-warning-bg", dotClass: "bg-status-warning shadow-[0_0_8px_3px_hsl(var(--status-warning)/0.45)]" },
  alert: { label: "Something concerning", emoji: "🔴", bgClass: "bg-status-alert-bg", dotClass: "bg-status-alert shadow-[0_0_8px_3px_hsl(var(--status-alert)/0.45)]" },
  inactive: { label: "No data", emoji: "⚪", bgClass: "bg-status-inactive-bg", dotClass: "bg-status-inactive shadow-[0_0_8px_3px_hsl(var(--status-inactive)/0.3)]" },
};

interface StatusDotProps {
  status: StatusLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
}

export function StatusDot({ status, size = "md", showLabel = false, animate = true }: StatusDotProps) {
  const config = statusConfig[status];
  const sizeClasses = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-6 h-6" };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "rounded-full",
        sizeClasses[size],
        config.dotClass,
        animate && status !== "inactive" && "animate-pulse-gentle"
      )} />
      {showLabel && (
        <span className="text-sm text-muted-foreground">{config.label}</span>
      )}
    </div>
  );
}
