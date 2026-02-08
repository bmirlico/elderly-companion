import { motion } from "framer-motion";
import { User, Bell, Heart, HelpCircle, LogOut, ChevronRight, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMe } from "@/hooks/use-api";
import { clearAuth } from "@/api/client";

const menuItems = [
  { icon: Heart, label: "Who I am caring about", description: "Preferences & adjustments", path: "/caring-settings" },
  { icon: Bell, label: "Notifications", description: "Alert levels, call frequency & quiet hours", path: "/notifications" },
  { icon: Shield, label: "Privacy", description: "Data handling & consent", path: "/privacy" },
  { icon: HelpCircle, label: "Help & Support", description: "Chat, FAQ & contact us", path: "/help-support" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { data: me } = useMe();

  const userName = me?.user.name ?? "...";
  const residentName = me?.resident.name.split(" ")[0] ?? "...";

  const handleSignOut = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/personal-profile")}
          className="flex items-center gap-4 mb-8 w-full text-left"
        >
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{userName}</h1>
            <p className="text-sm text-muted-foreground">Caring for {residentName}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </motion.button>

        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => item.path && navigate(item.path)}
              className="w-full rounded-xl p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleSignOut}
          className="w-full mt-8 rounded-xl p-4 flex items-center gap-3 text-left hover:bg-destructive/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-sm font-semibold text-destructive">Sign out</span>
        </motion.button>
      </div>
    </div>
  );
}
