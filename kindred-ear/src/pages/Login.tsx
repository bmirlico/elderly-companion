import { motion } from "framer-motion";
import { HeartHandshake, Mail, Lock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F0] via-[#F7F3FF] to-[#EAF7FF] flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <HeartHandshake className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to check in on the people you love
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-card shadow-veille p-6 space-y-4"
        >
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Email</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Password</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Your password"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </label>

          <button className="w-full rounded-2xl bg-primary text-primary-foreground py-3 text-sm font-semibold">
            Sign in
          </button>

          <div className="text-center text-xs text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-primary font-semibold">
              Create an account
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
