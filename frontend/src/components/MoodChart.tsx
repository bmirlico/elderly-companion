import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface MoodChartProps {
  data?: { day: string; mood: number }[];
}

export function MoodChart({ data }: MoodChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-card shadow-veille p-5">
        <h3 className="text-base font-bold text-foreground mb-1">Mood</h3>
        <p className="text-xs text-muted-foreground">No mood data yet. Trigger a call to start tracking.</p>
      </div>
    );
  }

  const chartData = data;

  return (
    <div className="rounded-2xl bg-card shadow-veille p-5">
      <h3 className="text-base font-bold text-foreground mb-1">Mood</h3>
      <p className="text-xs text-muted-foreground mb-4">This week's trends based on voice analysis</p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(214, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(214, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(214, 14%, 40%)' }} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="mood" stroke="hsl(214, 92%, 50%)" strokeWidth={2.5} fill="url(#moodGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Mood</span>
        </div>
      </div>
    </div>
  );
}
