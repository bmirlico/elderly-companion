import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pill, Plus, Clock, Bell, Trash2, X, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  frequency: string;
  reminder: boolean;
}

const initialMeds: Medication[] = [
  { id: "1", name: "Metformin", dosage: "500mg", time: "08:00", frequency: "daily", reminder: true },
  { id: "2", name: "Lisinopril", dosage: "10mg", time: "09:00", frequency: "daily", reminder: true },
  { id: "3", name: "Vitamin D", dosage: "1000 IU", time: "08:00", frequency: "daily", reminder: false },
];

export default function MedicationSchedule() {
  const navigate = useNavigate();
  const [meds, setMeds] = useState<Medication[]>(initialMeds);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", time: "08:00", frequency: "daily" });

  const addMed = () => {
    if (!form.name.trim()) return;
    setMeds((prev) => [...prev, { id: Date.now().toString(), ...form, reminder: true }]);
    setAdding(false);
    setForm({ name: "", dosage: "", time: "08:00", frequency: "daily" });
  };

  const toggleReminder = (id: string) => {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, reminder: !m.reminder } : m)));
  };

  const deleteMed = (id: string) => {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  };

  const addToCalendar = (med: Medication) => {
    const title = encodeURIComponent(`💊 ${med.name} - ${med.dosage}`);
    const details = encodeURIComponent(`Take ${med.name} ${med.dosage}`);
    // Generate a Google Calendar event URL
    const now = new Date();
    const [hours, minutes] = med.time.split(":");
    now.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const start = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = new Date(now.getTime() + 15 * 60000).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}&recur=RRULE:FREQ=DAILY`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <button onClick={() => navigate("/resources")} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center justify-between mb-6">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground">
            Medication Schedule
          </motion.h1>
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {adding && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Medication name" className="w-full text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground" />
            <input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="Dosage (e.g. 500mg)" className="w-full text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground" />
            <div className="flex gap-2">
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="flex-1 text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground" />
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice-daily">Twice daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="as-needed">As needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addMed}><Check className="w-4 h-4 mr-1" /> Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {meds.map((med, i) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-card shadow-veille p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-status-good-bg flex items-center justify-center flex-shrink-0">
                  <Pill className="w-4 h-4 text-status-good" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground">{med.name}</h3>
                  <p className="text-xs text-muted-foreground">{med.dosage} · {med.frequency}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{med.time}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    <Bell className="w-3 h-3 text-muted-foreground" />
                    <Switch checked={med.reminder} onCheckedChange={() => toggleReminder(med.id)} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => addToCalendar(med)} className="text-xs text-primary font-medium hover:underline">
                      📅 Calendar
                    </button>
                    <button onClick={() => deleteMed(med.id)} className="p-1 rounded hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
