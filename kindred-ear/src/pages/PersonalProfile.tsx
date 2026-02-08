import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PersonalProfile() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <button onClick={() => navigate("/profile")} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-3">
            <User className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Sophie Dupont</h1>
          <p className="text-sm text-muted-foreground">Caregiver</p>
        </motion.div>

        <div className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: "sophie.dupont@email.com" },
            { icon: Phone, label: "Phone", value: "+33 6 12 34 56 78" },
            { icon: MapPin, label: "Location", value: "Paris, France" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl bg-secondary/30 p-4 flex items-center gap-3"
            >
              <item.icon className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
