import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Send, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Layout from "../components/Layout";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pet, setPet] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);
  const [formData, setFormData] = useState({ parent_name: "", parent_email: "", child_name: "", notifications_enabled: true, weekly_report: true, event_reminders: true });

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: tasksData }, { data: petData }, { data: settingsData }] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
      supabase.from('pet_states').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1),
      supabase.from('parent_settings').select('*').eq('user_id', user.id).limit(1),
    ]);
    setTasks(tasksData || []);
    if (petData && petData.length > 0) setPet(petData[0]);
    if (settingsData && settingsData.length > 0) {
      setSettings(settingsData[0]);
      setFormData(settingsData[0]);
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    if (settings) {
      const { data: updated } = await supabase.from('parent_settings').update(formData).eq('id', settings.id).select().single();
      setSettings(updated);
    } else {
      const { data: created } = await supabase.from('parent_settings').insert({ ...formData, user_id: user.id }).select().single();
      setSettings(created);
    }
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  const handleSendReport = async () => {
    if (!formData.parent_email) return;
    setSending(true);

    const completedThisWeek = tasks.filter(t => t.completed).length;
    const pending = tasks.filter(t => !t.completed).length;
    const highPriority = tasks.filter(t => !t.completed && t.priority === "high");

    const body = `Hi ${formData.parent_name || "Parent"}! 🦸

Here's ${formData.child_name || "your child"}'s HeroHabit Weekly Progress Report:

🌟 Pet Status: ${pet ? `${pet.pet_name} is Level ${pet.level} with a ${pet.streak_days || 0}-day streak!` : "No pet yet!"}

✅ Tasks Completed: ${completedThisWeek}
📌 Tasks Still Pending: ${pending}

${highPriority.length > 0 ? `⚠️ High Priority Items:\n${highPriority.map(t => `  • ${t.title} (${t.day_of_week})`).join("\n")}` : "🎉 No urgent tasks right now!"}

Keep encouraging your hero! Every completed task makes them stronger! 🦸⚡

With love,
The HeroHabit App 🦸`.trim();

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'HeroHabit <onboarding@resend.dev>',
          to: formData.parent_email,
          subject: `🦸 HeroHabit Weekly Update for ${formData.child_name || "your child"}!`,
          text: body,
        })
      });

      if (response.ok) {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      } else {
        const err = await response.json();
        console.error('Resend error:', err);
        alert('Could not send email. Make sure the email is verified in Resend.');
      }
    } catch (err) {
      console.error('Email error:', err);
    }
    setSending(false);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2">👩‍👧 Parent Dashboard</h1>
        <p className="text-muted-foreground font-semibold text-sm">Stay in the loop with your hero's progress!</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="text-4xl animate-bounce">🦸</div></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Tasks Done", value: completedCount, icon: "✅", color: "bg-green-50 border-green-200" },
              { label: "Still Pending", value: pendingCount, icon: "📌", color: "bg-amber-50 border-amber-200" },
              { label: "Completion Rate", value: `${completionRate}%`, icon: "📈", color: "bg-blue-50 border-blue-200" },
              { label: "Pet Level", value: pet ? `Lv. ${pet.level}` : "—", icon: "🦸", color: "bg-pink-50 border-pink-200" },
            ].map(({ label, value, icon, color }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border-2 p-4 text-center ${color}`}>
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-black text-foreground">{value}</div>
                <div className="text-xs font-bold text-muted-foreground">{label}</div>
              </motion.div>
            ))}
          </div>

          {pet && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 p-5">
              <h2 className="font-black text-green-800 mb-3 flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" />Pet Progress</h2>
              <div className="flex items-center gap-4">
                <div className="text-5xl">🦸</div>
                <div className="flex-1">
                  <p className="font-black text-lg text-green-800">{pet.pet_name}</p>
                  <p className="text-sm font-semibold text-green-600">Level {pet.level} • {pet.xp}/{pet.xp_to_next} XP</p>
                  <p className="text-sm font-semibold text-orange-500">🔥 {pet.streak_days || 0} day streak</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">Mood: {pet.mood} • {pet.total_tasks_completed || 0} total tasks completed</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border-2 border-border p-5">
            <h2 className="font-black text-foreground mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" />Recent Tasks</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.slice(0, 10).map(t => (
                <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <div>
                    <span className={`text-sm font-bold ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">{t.day_of_week} • {t.category}</span>
                  </div>
                  <span className={`text-sm ${t.completed ? "text-green-500" : "text-amber-500"}`}>{t.completed ? "✅" : "📌"}</span>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-sm text-muted-foreground font-semibold">No tasks added yet!</p>}
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-border p-5">
            <h2 className="font-black text-foreground mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-primary" />Parent Settings</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Your Name</Label>
                  <Input placeholder="Parent name" value={formData.parent_name || ""} onChange={e => setFormData(p => ({ ...p, parent_name: e.target.value }))} className="rounded-xl font-semibold" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Your Email</Label>
                  <Input type="email" placeholder="parent@email.com" value={formData.parent_email || ""} onChange={e => setFormData(p => ({ ...p, parent_email: e.target.value }))} className="rounded-xl font-semibold" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-muted-foreground mb-1 block">Child's Name</Label>
                  <Input placeholder="Child's name" value={formData.child_name || ""} onChange={e => setFormData(p => ({ ...p, child_name: e.target.value }))} className="rounded-xl font-semibold" />
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[{ key: "notifications_enabled", label: "Email Notifications", icon: "🔔" }, { key: "weekly_report", label: "Weekly Progress Report", icon: "📊" }, { key: "event_reminders", label: "Upcoming Event Reminders", icon: "📅" }].map(({ key, label, icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="font-bold flex items-center gap-2">{icon} {label}</Label>
                    <Switch checked={!!formData[key]} onCheckedChange={v => setFormData(p => ({ ...p, [key]: v }))} />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveSettings} variant="outline" className={`w-full rounded-xl font-bold transition-all ${savedSettings ? "bg-green-500 text-white border-green-500" : ""}`}>
                {savedSettings ? "✅ Saved!" : "Save Settings 💾"}
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl border-2 border-pink-200 p-5">
            <h2 className="font-black text-pink-800 mb-2 flex items-center gap-2"><Mail className="w-5 h-5" />Send Progress Report</h2>
            <p className="text-sm text-pink-600 font-semibold mb-4">Get an email summary of your child's progress!</p>
            <Button onClick={handleSendReport} disabled={sending || !formData.parent_email} className="w-full rounded-xl font-black bg-pink-500 hover:bg-pink-600 text-white gap-2">
              {sending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : sent ? <><CheckCircle2 className="w-4 h-4" />Sent! Check your email 📬</> : <><Send className="w-4 h-4" />Send Report to Parent 💌</>}
            </Button>
            {!formData.parent_email && <p className="text-xs text-pink-500 font-semibold text-center mt-2">Add a parent email above first!</p>}
          </div>
        </div>
      )}
    </Layout>
  );
}
