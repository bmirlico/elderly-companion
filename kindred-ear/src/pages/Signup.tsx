import { useState } from "react";
import { motion } from "framer-motion";
import { User, Users, Calendar, Languages, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { authApi, storeAuth } from "@/api/client";
import { useToast } from "@/hooks/use-toast";

const topics = ["Family", "Health", "Food", "Memories", "Neighbors", "Hobbies"];

export default function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // User fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Loved one fields
  const [lovedOneName, setLovedOneName] = useState("");
  const [lovedOneAge, setLovedOneAge] = useState("");
  const [relationship, setRelationship] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lovedOneName || !lovedOneAge) {
      toast({ title: "Missing info", description: "Please fill in your loved one's name and age", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.signup({
        email,
        password,
        name,
        loved_one_name: lovedOneName,
        loved_one_age: parseInt(lovedOneAge),
        relationship: relationship || "family",
      });
      storeAuth(res.token, { name: res.name, resident_id: res.resident_id, user_id: res.user_id });
      navigate("/");
    } catch {
      toast({ title: "Signup failed", description: "Could not create account. Email may already be in use.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-[#F7F3FF] to-[#EAF7FF] px-5 py-10">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-extrabold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tell us about your loved one so we can personalize care
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <section className="rounded-3xl bg-card shadow-veille p-6 space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Your details</h2>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Full name</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Password</span>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>
          </section>

          <section className="rounded-3xl bg-card shadow-veille p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Elder care profile</h2>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Loved one's name</span>
              <input
                type="text"
                placeholder="e.g., Marie Dupont"
                value={lovedOneName}
                onChange={(e) => setLovedOneName(e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Age</span>
                <input
                  type="number"
                  placeholder="78"
                  value={lovedOneAge}
                  onChange={(e) => setLovedOneAge(e.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Relation</span>
                <input
                  type="text"
                  placeholder="Mother"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Primary language</span>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="French, English"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Preferred call time</span>
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Weekdays, 6:30 PM"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Health notes</span>
              <textarea
                placeholder="Mobility limits, medications, chronic pain..."
                className="mt-2 w-full rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                rows={3}
              />
            </label>
          </section>

          <section className="rounded-3xl bg-card shadow-veille p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Conversation topics</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <label
                  key={topic}
                  className="text-[11px] px-3 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-2"
                >
                  <input type="checkbox" className="accent-primary" />
                  {topic}
                </label>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary text-primary-foreground py-3 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <div className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold">
              Sign in
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
