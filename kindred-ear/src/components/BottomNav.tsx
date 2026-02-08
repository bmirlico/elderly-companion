import { Home, BarChart3, BookOpen, User, Sparkles } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/reports", icon: BarChart3, label: "Reports" },
  { path: "/action", icon: Sparkles, label: "Action" },
  { path: "/resources", icon: BookOpen, label: "Resources" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-nav-bg border-t border-border/50 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200",
                isActive
                  ? "text-nav-active"
                  : "text-nav-inactive hover:text-foreground"
              )}
            >
              <tab.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              <span className={cn("text-[11px]", isActive ? "font-bold" : "font-medium")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
