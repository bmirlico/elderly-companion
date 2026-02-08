import { useNavigate } from "react-router-dom";
import { Heart, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-[#F7F3FF] to-[#EAF7FF] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center">
          <Heart className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground">Veille</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
          The companion that catches what your loved ones won't tell you.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-sm space-y-4"
      >
        <button
          onClick={() => navigate("/login?role=caregiver")}
          className="w-full rounded-2xl bg-primary text-primary-foreground p-5 text-left space-y-1 hover:shadow-veille transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" />
            <span className="text-base font-bold">I'm a Caregiver</span>
          </div>
          <p className="text-xs text-primary-foreground/80 pl-8">
            Son, daughter, grandchild, or family member
          </p>
        </button>

        <button
          onClick={() => navigate("/elder-setup")}
          className="w-full rounded-2xl bg-card border border-border text-foreground p-5 text-left space-y-1 hover:shadow-veille transition-shadow"
        >
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-veille-warm" />
            <span className="text-base font-bold">I'm Being Cared For</span>
          </div>
          <p className="text-xs text-muted-foreground pl-8">
            I want a friendly daily companion
          </p>
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-muted-foreground mt-10 text-center"
      >
        Your privacy is our core promise. No recordings are ever shared.
      </motion.p>
    </div>
  );
}
