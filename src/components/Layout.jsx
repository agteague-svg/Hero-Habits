import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, CheckSquare, Users, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { path: "/", icon: Home, label: "Today", color: "text-green-600" },
  { path: "/schedule", icon: Calendar, label: "Schedule", color: "text-blue-500" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks", color: "text-pink-500" },
  { path: "/parents", icon: Users, label: "Parents", color: "text-amber-500" },
  { path: "/customize", icon: Sparkles, label: "Customize", color: "text-purple-500" },
];

export default function Layout({ children }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background font-nunito">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦸</span>
            <span className="text-xl font-black text-primary tracking-tight">HeroHabit</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path;
              return (
                <Link key={path} to={path} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${active ? "bg-primary text-white shadow-md scale-105" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <Icon className="w-4 h-4" />{label}
                </Link>
              );
            })}
          </nav>
          <button onClick={logout} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors">
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">{children}</main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
                <span className="text-xs font-bold">{label}</span>
                {active && <div className="w-1 h-1 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}