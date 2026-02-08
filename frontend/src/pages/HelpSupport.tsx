import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Mail, Phone, ChevronDown, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  { q: "How does the companion call work?", a: "Our AI companion calls your loved one at the scheduled time, engages in friendly conversation, and sends you a mood summary afterwards." },
  { q: "What happens if my parent doesn't answer?", a: "If the call is not answered after 3 attempts, you'll receive an alert notification so you can check in manually." },
  { q: "Can I change the call schedule?", a: "Yes! Go to Notifications in your profile settings to adjust the call frequency and preferred times." },
  { q: "Is the conversation data private?", a: "Absolutely. All conversations are encrypted, and only you and your loved one have access to summaries. We never share data with third parties." },
  { q: "How do I add another family member?", a: "Go to your profile and invite family members via email. They'll get their own caregiver dashboard." },
];

export default function HelpSupport() {
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Hi Sophie! 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { role: "bot", text: "Thanks for your message! Our team will get back to you shortly. In the meantime, check our FAQ below for quick answers." },
      ]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-14">
        <button onClick={() => navigate("/profile")} className="mb-6 flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-bold text-foreground mb-1">
          Help & Support
        </motion.h1>
        <p className="text-sm text-muted-foreground mb-6">We're here for you</p>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowChat(true)}
            className="rounded-xl bg-primary/10 p-4 flex flex-col items-center gap-2"
          >
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Chat with us</span>
          </motion.button>
          <motion.a
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            href="mailto:support@veille.app"
            className="rounded-xl bg-primary/10 p-4 flex flex-col items-center gap-2"
          >
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Email us</span>
          </motion.a>
        </div>

        {/* Contact info */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="rounded-xl bg-secondary/30 p-4 mb-6 flex items-center gap-3">
          <Phone className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Phone support</p>
            <p className="text-sm font-medium text-foreground">+33 1 23 45 67 89</p>
            <p className="text-xs text-muted-foreground">Mon–Fri, 9:00–18:00</p>
          </div>
        </motion.div>

        {/* Chatbot */}
        {showChat && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">Support Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-xs text-muted-foreground">Close</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`text-sm p-2 rounded-lg ${msg.role === "bot" ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground ml-8"}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your question..."
                className="flex-1 text-sm bg-secondary/50 rounded-lg px-3 py-2 outline-none text-foreground placeholder:text-muted-foreground"
              />
              <Button size="icon" onClick={sendMessage}><Send className="w-4 h-4" /></Button>
            </div>
          </motion.div>
        )}

        {/* FAQ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}>
          <h2 className="text-sm font-bold text-foreground mb-3">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
}
