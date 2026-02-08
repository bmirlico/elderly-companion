import { motion } from "framer-motion";
import { Heart, Stethoscope, Sparkles, MessageCircle } from "lucide-react";

const sentimentPrompts = [
  "Ask about her favorite memory from this week",
  "Share a photo and invite a story behind it",
  "Remind her of a small win (gardening, cooking, a walk)",
];

const healthChecks = [
  "Pain check: " + "Where is the discomfort today?",
  "Meals: " + "Did you eat three times yesterday?",
  "Sleep: " + "How many hours did you sleep?",
];

const quickQuestions = [
  "How can I respond to loneliness?",
  "What are gentle activity ideas?",
  "How to bring up health concerns?",
];

export default function Action() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-foreground mb-6"
        >
          Action Center
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card shadow-veille p-5 mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Sentimental prompts</h3>
              <p className="text-xs text-muted-foreground">Keep the conversation warm and personal</p>
            </div>
          </div>
          <div className="space-y-2">
            {sentimentPrompts.map((prompt) => (
              <div key={prompt} className="rounded-xl bg-secondary/60 px-3 py-2 text-xs text-foreground">
                {prompt}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card shadow-veille p-5 mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Health check</h3>
              <p className="text-xs text-muted-foreground">Gentle questions to monitor wellbeing</p>
            </div>
          </div>
          <div className="space-y-2">
            {healthChecks.map((check) => (
              <div key={check} className="rounded-xl bg-secondary/60 px-3 py-2 text-xs text-foreground">
                {check}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-card shadow-veille p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Ask Voixy</h3>
              <p className="text-xs text-muted-foreground">AI companion for personal questions</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {quickQuestions.map((q) => (
              <span key={q} className="text-[11px] px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                {q}
              </span>
            ))}
          </div>

          <div className="rounded-2xl border border-border/50 bg-background px-3 py-2 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ask a question about caregiving..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="text-xs font-semibold text-primary">Send</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
