import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { day: "Mon", mood: 78, energy: 72 },
  { day: "Tue", mood: 82, energy: 75 },
  { day: "Wed", mood: 85, energy: 80 },
  { day: "Thu", mood: 60, energy: 55 },
  { day: "Fri", mood: 65, energy: 58 },
  { day: "Sat", mood: 70, energy: 65 },
  { day: "Sun", mood: 75, energy: 70 },
];

export function MoodChart() {
  return (
    <div className="rounded-2xl bg-card shadow-veille p-5">
      <h3 className="text-base font-bold text-foreground mb-1">Mood & Energy</h3>
      <p className="text-xs text-muted-foreground mb-4">This week's trends based on voice analysis</p>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(214, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(214, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(214, 14%, 40%)' }} />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="mood" stroke="hsl(214, 92%, 50%)" strokeWidth={2.5} fill="url(#moodGrad)" />
            <Area type="monotone" dataKey="energy" stroke="hsl(142, 71%, 45%)" strokeWidth={2} fill="url(#energyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Mood</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-status-good" />
          <span className="text-xs text-muted-foreground">Energy</span>
        </div>
      </div>
    </div>
  );
}
