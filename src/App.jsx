import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { useEffect } from "react";
import Home from './pages/Home';
import WeeklySchedule from './pages/WeeklySchedule';
import Tasks from './pages/Tasks';
import ParentDashboard from './pages/ParentDashboard';
import Customize from './pages/Customize';
import Login from './pages/Login';

const THEMES = [
  { id: "garden", primary: "#3d8b5e", bg: "#f8f4ee", accent: "#f0a6ca" },
  { id: "ocean", primary: "#0e7490", bg: "#f0f9ff", accent: "#67e8f9" },
  { id: "sunset", primary: "#c2410c", bg: "#fff7ed", accent: "#fb923c" },
  { id: "lavender", primary: "#7c3aed", bg: "#faf5ff", accent: "#c4b5fd" },
  { id: "berry", primary: "#be185d", bg: "#fff1f2", accent: "#f9a8d4" },
  { id: "forest", primary: "#166534", bg: "#f0fdf4", accent: "#86efac" },
];

const hexToHsl = (hex) => {
  let r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max===min) { h=s=0; } else {
    const d=max-min; s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}
  }
  return `${Math.round(h*360)} ${Math.round(s*100)}% ${Math.round(l*100)}%`;
};

const applyTheme = (themeId) => {
  const theme = THEMES.find(t => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty("--primary", hexToHsl(theme.primary));
  root.style.setProperty("--background", hexToHsl(theme.bg));
  root.style.setProperty("--accent", hexToHsl(theme.accent));
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("herohabit_theme") || "garden";
    applyTheme(saved);
  }, []);

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-3">🦸</div>
          <p className="font-bold text-muted-foreground">Loading HeroHabit...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/schedule" element={<WeeklySchedule />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/parents" element={<ParentDashboard />} />
      <Route path="/customize" element={<Customize />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App