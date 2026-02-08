import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Tip {
  id: string;
  category: string;
  title: string;
  content: string;
}

const tips: Tip[] = [
  { id: "1", category: "Mobility", title: "Gentle morning stretches", content: "A 5-minute gentle stretching routine each morning can help improve joint flexibility and reduce stiffness. Start with ankle rotations, then gentle knee lifts while seated." },
  { id: "2", category: "Nutrition", title: "Stay hydrated", content: "Keeping a glass of water by their favorite chair and sipping throughout the day can help maintain energy levels and cognitive function." },
  { id: "3", category: "Social", title: "Weekly social connection", content: "Regular social interaction is one of the strongest predictors of wellbeing in seniors. Encourage a weekly tea with a friend or neighbor." },
];

export default function WellnessTips() {
  const navigate = useNavigate();

  const categoryColors: Record<string, string> = {
    Mobility: "bg-status-warning-bg text-status-warning",
    Nutrition: "bg-status-good-bg text-status-good",
    Social: "bg-secondary text-primary",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <button onClick={() => navigate("/resources")} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground mb-1">
          Wellness Tips
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-6">Tips for wellbeing</p>

        <h3 className="text-sm font-bold text-foreground mb-3">This week's insights</h3>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl bg-card shadow-veille p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColors[tip.category] || "bg-secondary text-primary"}`}>
                  {tip.category}
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1">{tip.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
