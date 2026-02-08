import { Lightbulb, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface NudgeCardProps {
  text: string;
  suggestion: string;
  index?: number;
}

export function NudgeCard({ text, suggestion, index = 0 }: NudgeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-start gap-3 rounded-xl bg-veille-warm-bg p-4"
    >
      <div className="w-8 h-8 rounded-full bg-veille-warm/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb className="w-4 h-4 text-veille-warm" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{text}</p>
        <p className="text-xs text-muted-foreground mt-1">{suggestion}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
    </motion.div>
  );
}
