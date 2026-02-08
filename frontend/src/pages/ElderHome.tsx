import { useNavigate } from "react-router-dom";
import { Sun, Pill, Phone, Calendar, Mic } from "lucide-react";
import greenButton from "@/assets/green_voice_chat_button.png";
import { motion } from "framer-motion";

const tips = [
  "A short walk today can do wonders for your mood 🌿",
  "Don't forget to drink some water this morning 💧",
  "Have you called Sophie this week? She'd love to hear from you 💛",
];

const quickHelpers = [
  { icon: Pill, label: "Medications", color: "bg-status-good-bg text-status-good" },
  { icon: Phone, label: "Call family", color: "bg-secondary text-primary" },
  { icon: Calendar, label: "Reminders", color: "bg-veille-warm-bg text-veille-warm" },
];

export default function ElderHome() {
  const navigate = useNavigate();
  const tip = tips[new Date().getDay() % tips.length];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="max-w-sm w-full px-6 pt-16 flex-1 flex flex-col">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-veille-warm" />
            <span className="text-sm text-muted-foreground">Good morning</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Bonjour, Marie</h1>
        </motion.div>

        {/* Big Talk Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="flex-1 flex flex-col items-center justify-center"
        >
          <motion.button
            onClick={() => navigate("/companion")}
            animate={{
              rotate: 360,
              scale: [1, 1.04, 1, 0.98, 1],
            }}
            transition={{
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            }}
            className="w-48 h-48 relative flex items-center justify-center"
          >
            <img src={greenButton} alt="Talk" className="w-full h-full object-contain" />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute"
            >
              <Mic className="w-10 h-10 text-white" />
            </motion.div>
          </motion.button>

          <p className="text-sm text-muted-foreground mt-6 text-center max-w-[240px]">
            Tap to chat with your companion
          </p>
        </motion.div>

        {/* Daily Tip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-secondary/60 px-5 py-4 mb-6"
        >
          <p className="text-sm text-foreground font-medium text-center">{tip}</p>
        </motion.div>

        {/* Quick helpers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4 pb-10"
        >
          {quickHelpers.map((helper) => (
            <button key={helper.label} className="flex flex-col items-center gap-1.5">
              <div className={`w-14 h-14 rounded-2xl ${helper.color} flex items-center justify-center`}>
                <helper.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{helper.label}</span>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
