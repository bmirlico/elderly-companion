import { motion } from "framer-motion";
import { Phone, MapPin, Pill, Heart, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const resources = [
  { icon: Phone, title: "Emergency contacts", description: "Dr. Martin, Pharmacy, SAMU", path: "/emergency-contacts" },
  {
    icon: Pill,
    title: "Medication schedule",
    description: "Current medications and reminders",
    path: "/medication-schedule",
  },
  { icon: MapPin, title: "Nearby services", description: "Pharmacies, doctors, hospitals", path: "/nearby-services" },
  { icon: Heart, title: "Wellness tips", description: "Articles about senior wellbeing", path: "/wellness-tips" },
];

export default function Resources() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-foreground mb-6"
        >
          Resources
        </motion.h1>

        <div className="space-y-3">
          {resources.map((item, i) => (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(item.path)}
              className="w-full rounded-2xl bg-card shadow-veille p-4 flex items-center gap-4 hover:shadow-veille-hover transition-shadow text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 rounded-2xl bg-accent p-5"
        >
          <h3 className="text-base font-bold text-accent-foreground mb-2">About Voixy</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Voixy is your parent's daily companion that catches what they won't tell you. It's not surveillance — it's
            awareness. The AI makes human connections better, not a substitute for them.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
