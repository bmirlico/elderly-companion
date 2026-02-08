import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Phone, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Notifications() {
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [callFrequency, setCallFrequency] = useState("daily");
  const [alertLevel, setAlertLevel] = useState([2]);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);

  const alertLabels = ["Low", "Medium", "High"];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <button onClick={() => navigate("/profile")} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground mb-1">
          Notifications
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-6">Manage alerts and call preferences</p>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-secondary/30 p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground flex-1">Push notifications</span>
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-xl bg-secondary/30 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground flex-1">Alert sensitivity</span>
            </div>
            <Slider value={alertLevel} onValueChange={setAlertLevel} min={0} max={2} step={1} />
            <p className="text-xs text-muted-foreground text-center">{alertLabels[alertLevel[0]]}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-xl bg-secondary/30 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground flex-1">Call frequency</span>
            </div>
            <Select value={callFrequency} onValueChange={setCallFrequency}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="twice-daily">Twice a day</SelectItem>
                <SelectItem value="daily">Once a day</SelectItem>
                <SelectItem value="every-other">Every other day</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="rounded-xl bg-secondary/30 p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground flex-1">Quiet hours (22:00–07:00)</span>
              <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
