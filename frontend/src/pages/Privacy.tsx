import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, FileText, Eye, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Privacy() {
  const navigate = useNavigate();
  const [analyticsConsent, setAnalyticsConsent] = useState(true);
  const [voiceStorage, setVoiceStorage] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <button onClick={() => navigate("/profile")} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground mb-1">
          Privacy & Data
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-6">GDPR compliant · France & EU</p>

        <div className="space-y-4">
          {/* GDPR Rights */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Your GDPR Rights</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground ml-7">
              <li>• <strong className="text-foreground">Right of access</strong> — request a copy of all your data</li>
              <li>• <strong className="text-foreground">Right to rectification</strong> — correct inaccurate data</li>
              <li>• <strong className="text-foreground">Right to erasure</strong> — delete your account & data</li>
              <li>• <strong className="text-foreground">Right to portability</strong> — export your data</li>
              <li>• <strong className="text-foreground">Right to object</strong> — opt out of processing</li>
            </ul>
          </motion.div>

          {/* Data handling */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-xl bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">How we handle data</span>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground ml-7">
              <p>• Conversations are <strong className="text-foreground">never recorded or stored</strong></p>
              <p>• AI generates mood summaries only — no transcripts shared</p>
              <p>• Data stored in <strong className="text-foreground">EU servers</strong> (France)</p>
              <p>• End-to-end encryption for all personal data</p>
              <p>• Data retention: 12 months, then auto-deleted</p>
            </div>
          </motion.div>

          {/* Consent toggles */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-xl bg-secondary/30 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">Consent preferences</span>
            </div>
            <div className="space-y-3 ml-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Usage analytics</p>
                  <p className="text-xs text-muted-foreground">Help us improve HeartEcho</p>
                </div>
                <Switch checked={analyticsConsent} onCheckedChange={setAnalyticsConsent} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Voice data storage</p>
                  <p className="text-xs text-muted-foreground">Store voice patterns for better detection</p>
                </div>
                <Switch checked={voiceStorage} onCheckedChange={setVoiceStorage} />
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="space-y-2">
            <button className="w-full rounded-xl bg-secondary/30 p-4 flex items-center gap-3 text-left">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Export my data</span>
            </button>
            <button className="w-full rounded-xl bg-secondary/30 p-4 flex items-center gap-3 text-left">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">View privacy policy</span>
            </button>
            <button className="w-full rounded-xl p-4 flex items-center gap-3 text-left hover:bg-destructive/5 transition-colors">
              <span className="text-sm font-semibold text-destructive">Delete all my data</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
