import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, Phone, Pencil, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMe, useUpdatePhones } from "@/hooks/use-api";

export default function PersonalProfile() {
  const navigate = useNavigate();
  const { data: me } = useMe();
  const updatePhones = useUpdatePhones();

  const userName = me?.user.name ?? "...";
  const userEmail = me?.user.email ?? "...";
  const userPhone = me?.user.phone || "Not set";

  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");

  const startEditPhone = () => {
    setPhoneValue(me?.user.phone || "");
    setEditingPhone(true);
  };

  const savePhone = () => {
    updatePhones.mutate({ user_phone: phoneValue });
    setEditingPhone(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <button type="button" onClick={() => navigate("/profile")} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-3">
            <User className="w-9 h-9 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">{userName}</h1>
          <p className="text-sm text-muted-foreground">Caregiver</p>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl bg-secondary/30 p-4 flex items-center gap-3">
            <Mail className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{userEmail}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }} className="rounded-xl bg-secondary/30 p-4 flex items-center gap-3">
            <Phone className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Phone</p>
              {editingPhone ? (
                <input
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  className="w-full text-sm bg-background rounded-lg px-3 py-1.5 outline-none text-foreground border border-border mt-1"
                  placeholder="+33..."
                />
              ) : (
                <p className="text-sm font-medium text-foreground">{userPhone}</p>
              )}
            </div>
            {editingPhone ? (
              <button type="button" onClick={savePhone} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button type="button" onClick={startEditPhone} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
