import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Home from './pages/Home';
import WeeklySchedule from './pages/WeeklySchedule';
import Tasks from './pages/Tasks';
import ParentDashboard from './pages/ParentDashboard';
import Customize from './pages/Customize';
import Login from './pages/Login';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-3">🦸‍♀️</div>
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