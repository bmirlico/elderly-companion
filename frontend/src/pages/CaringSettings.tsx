import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Clock, Heart, Pill, User, Pencil, Check, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMe } from "@/hooks/use-api";

export default function CaringSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: me } = useMe();
  const [language, setLanguage] = useState("french");
  const [reminders, setReminders] = useState(true);
  const [companionTone, setCompanionTone] = useState("warm");
  const [callFrequency, setCallFrequency] = useState("daily");

  const handleFrequencyChange = (value: string) => {
    setCallFrequency(value);
    const labels: Record<string, string> = {
      daily: "Every day at 10:00 AM",
      twice: "Twice a day (10 AM & 6 PM)",
      weekly: "Once a week (Monday 10 AM)",
      manual: "Manual only (no scheduled calls)",
    };
    toast({ title: "Call schedule updated", description: labels[value] });
  };

  // Elder info editing
  const [editingElder, setEditingElder] = useState(false);
  const [elderInfo, setElderInfo] = useState({
    name: me?.resident.name ?? "...",
    age: me?.resident.age?.toString() ?? "",
    phone: me?.resident.phone ?? "",
    address: "",
    conditions: "",
    emergencyNote: "",
  });
  const [elderForm, setElderForm] = useState(elderInfo);

  // Sync when me data loads
  useEffect(() => {
    if (me) {
      const info = {
        name: me.resident.name,
        age: me.resident.age?.toString() ?? "",
        phone: me.resident.phone ?? "",
        address: elderInfo.address,
        conditions: elderInfo.conditions,
        emergencyNote: elderInfo.emergencyNote,
      };
      setElderInfo(info);
      if (!editingElder) setElderForm(info);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const saveElderInfo = () => {
    setElderInfo(elderForm);
    setEditingElder(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <button onClick={() => navigate("/profile")} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground mb-1">
          Who I am caring about
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-6">Adjust preferences for {me?.resident.name.split(" ")[0] ?? "..."}</p>

        <div className="space-y-4">
          {/* Elder information card */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Elder information</span>
              </div>
              {!editingElder ? (
                <button onClick={() => { setElderForm(elderInfo); setEditingElder(true); }} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ) : (
                <button onClick={saveElderInfo} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {editingElder ? (
              <div className="space-y-2 ml-7">
                <div>
                  <label className="text-xs text-muted-foreground">Full name</label>
                  <input value={elderForm.name} onChange={(e) => setElderForm({ ...elderForm, name: e.target.value })} className="w-full text-sm bg-background rounded-lg px-3 py-2 outline-none text-foreground border border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Age</label>
                  <input value={elderForm.age} onChange={(e) => setElderForm({ ...elderForm, age: e.target.value })} className="w-full text-sm bg-background rounded-lg px-3 py-2 outline-none text-foreground border border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Phone number</label>
                  <input value={elderForm.phone} onChange={(e) => setElderForm({ ...elderForm, phone: e.target.value })} className="w-full text-sm bg-background rounded-lg px-3 py-2 outline-none text-foreground border border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Address</label>
                  <input value={elderForm.address} onChange={(e) => setElderForm({ ...elderForm, address: e.target.value })} className="w-full text-sm bg-background rounded-lg px-3 py-2 outline-none text-foreground border border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Health conditions</label>
                  <input value={elderForm.conditions} onChange={(e) => setElderForm({ ...elderForm, conditions: e.target.value })} className="w-full text-sm bg-background rounded-lg px-3 py-2 outline-none text-foreground border border-border" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Emergency notes</label>
                  <input value={elderForm.emergencyNote} onChange={(e) => setElderForm({ ...elderForm, emergencyNote: e.target.value })} className="w-full text-sm bg-background rounded-lg px-3 py-2 outline-none text-foreground border border-border" />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 ml-7">
                <p className="text-sm font-medium text-foreground">{elderInfo.name}</p>
                <p className="text-xs text-muted-foreground">Age: {elderInfo.age}</p>
                {elderInfo.phone && <p className="text-xs text-muted-foreground">Phone: {elderInfo.phone}</p>}
                <p className="text-xs text-muted-foreground">{elderInfo.address}</p>
                <p className="text-xs text-muted-foreground">Conditions: {elderInfo.conditions}</p>
                <p className="text-xs text-muted-foreground">⚠️ {elderInfo.emergencyNote}</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-xl bg-secondary/30 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground flex-1">Preferred language</span>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-xl bg-secondary/30 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground flex-1">Companion tone</span>
            </div>
            <Select value={companionTone} onValueChange={setCompanionTone}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="warm">Warm & gentle</SelectItem>
                <SelectItem value="cheerful">Cheerful & upbeat</SelectItem>
                <SelectItem value="calm">Calm & soothing</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="rounded-xl bg-secondary/30 p-4">
            <div className="flex items-center gap-3">
              <Pill className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground flex-1">Medication reminders</span>
              <Switch checked={reminders} onCheckedChange={setReminders} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="rounded-xl bg-secondary/30 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground flex-1">Call frequency</span>
            </div>
            <Select value={callFrequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Every day</SelectItem>
                <SelectItem value="twice">Twice a day</SelectItem>
                <SelectItem value="weekly">Once a week</SelectItem>
                <SelectItem value="manual">Manual only</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-xl bg-secondary/30 p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground flex-1">Wake-up time</span>
              <span className="text-sm text-muted-foreground">08:00</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
