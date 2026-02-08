import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Sparkles, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Tip {
  id: string;
  category: string;
  title: string;
  content: string;
}

const baseTips: Tip[] = [
  { id: "1", category: "Mobility", title: "Gentle morning stretches", content: "Marie mentioned knee discomfort this week. A 5-minute gentle stretching routine each morning can help improve joint flexibility and reduce stiffness. Start with ankle rotations, then gentle knee lifts while seated." },
  { id: "2", category: "Nutrition", title: "Stay hydrated", content: "Based on recent conversations, Marie may not be drinking enough water. Keeping a glass of water by her favorite chair and sipping throughout the day can help maintain energy levels and cognitive function." },
  { id: "3", category: "Social", title: "Weekly social connection", content: "Marie lights up when talking about her neighbor Françoise. Regular social interaction is one of the strongest predictors of wellbeing in seniors. Encourage a weekly tea together." },
];

export default function WellnessTips() {
  const navigate = useNavigate();
  const [tips, setTips] = useState<Tip[]>(baseTips);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askAI = () => {
    if (!question.trim()) return;
    setLoading(true);
    // Simulate AI response
    setTimeout(() => {
      setAiResponse(
        `Based on Marie's recent mood patterns and conversations, here's a personalized tip:\n\n` +
        `**${question.trim()}**\n\n` +
        `Given that Marie has been mentioning her knee more frequently, I recommend gentle seated exercises combined with her favorite music. ` +
        `Research shows that combining physical activity with enjoyable stimuli improves adherence by 60%. ` +
        `Start with 5 minutes daily and gradually increase. Also, consider discussing this with Dr. Martin during the next visit.`
      );
      setLoading(false);
      setQuestion("");
    }, 1500);
  };

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
        <p className="text-sm text-muted-foreground mb-6">Personalized insights for Marie's wellbeing</p>

        {/* AI Ask Section */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-accent p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-accent-foreground">Ask AI for personalized advice</span>
          </div>
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAI()}
              placeholder="e.g. How to help with knee pain?"
              className="flex-1 text-sm bg-background rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground"
            />
            <Button size="icon" onClick={askAI} disabled={loading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* AI Response */}
        {(loading || aiResponse) && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">AI Recommendation</span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-line">{aiResponse}</p>
            )}
          </motion.div>
        )}

        {/* Tips List */}
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
