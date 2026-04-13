import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Plus, Clock, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Layout from "../components/Layout";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CATEGORIES = ["school", "homework", "band", "dance", "chore", "activity", "free_time"];
const CATEGORY_CONFIG = {
  school: { color: "bg-blue-100 border-blue-300 text-blue-800", icon: "🏫" },
  homework: { color: "bg-indigo-100 border-indigo-300 text-indigo-800", icon: "📚" },
  band: { color: "bg-purple-100 border-purple-300 text-purple-800", icon: "🎵" },
  dance: { color: "bg-pink-100 border-pink-300 text-pink-800", icon: "💃" },
  chore: { color: "bg-amber-100 border-amber-300 text-amber-800", icon: "🧹" },
  activity: { color: "bg-green-100 border-green-300 text-green-800", icon: "⚡" },
  free_time: { color: "bg-rose-100 border-rose-300 text-rose-800", icon: "🎮" },
};
const TODAY_DAY = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

export default function WeeklySchedule() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", category: "school", day_of_week: "Monday", start_time: "", end_time: "", location: "" });
  const [selectedDay, setSelectedDay] = useState(TODAY_DAY);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: eventsData }, { data: tasksData }] = await Promise.all([
      supabase.from('schedule_events').select('*').eq('user_id', user.id),
      supabase.from('tasks').select('*').eq('user_id', user.id),
    ]);
    setEvents(eventsData || []);
    setTasks(tasksData || []);
    setLoading(false);
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) return;
    const { data: created } = await supabase.from('schedule_events').insert({ ...newEvent, user_id: user.id, recurring: true }).select().single();
    setEvents(prev => [...prev, created]);
    setNewEvent({ title: "", category: "school", day_of_week: "Monday", start_time: "", end_time: "", location: "" });
    setAddOpen(false);
  };

  const handleDeleteEvent = async (id) => {
    await supabase.from('schedule_events').delete().eq('id', id);
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const getDayItems = (day) => ({
    events: events.filter(e => e.day_of_week === day),
    tasks: tasks.filter(t => t.day_of_week === day),
  });

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">🗓️ My Week</h1>
          <p className="text-muted-foreground font-semibold text-sm">Your colorful weekly schedule</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-1 font-bold"><Plus className="w-4 h-4" />Add Event</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-black text-xl">Add to Schedule 📅</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Event name" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} className="rounded-xl font-semibold" />
              <Select value={newEvent.category} onValueChange={v => setNewEvent(p => ({ ...p, category: v }))}>
                <SelectTrigger className="rounded-xl font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="font-semibold capitalize">{c.replace("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={newEvent.day_of_week} onValueChange={v => setNewEvent(p => ({ ...p, day_of_week: v }))}>
                <SelectTrigger className="rounded-xl font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d} className="font-semibold">{d}</SelectItem>)}</SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Start (e.g. 3:30 PM)" value={newEvent.start_time} onChange={e => setNewEvent(p => ({ ...p, start_time: e.target.value }))} className="rounded-xl font-semibold" />
                <Input placeholder="End (e.g. 5:00 PM)" value={newEvent.end_time} onChange={e => setNewEvent(p => ({ ...p, end_time: e.target.value }))} className="rounded-xl font-semibold" />
              </div>
              <Input placeholder="Location (optional)" value={newEvent.location} onChange={e => setNewEvent(p => ({ ...p, location: e.target.value }))} className="rounded-xl font-semibold" />
              <Button onClick={handleAddEvent} className="w-full rounded-xl font-black">Add to my schedule! 🦸</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {DAYS.map(day => {
          const { events: de, tasks: dt } = getDayItems(day);
          const isToday = day === TODAY_DAY;
          const selected = day === selectedDay;
          return (
            <button key={day} onClick={() => setSelectedDay(day)} className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-2xl border-2 transition-all font-bold ${selected ? "bg-primary text-white border-primary shadow-md scale-105" : isToday ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>
              <span className="text-xs">{day.slice(0, 3)}</span>
              <span className="text-lg">{isToday ? "⭐" : "📅"}</span>
              <span className="text-xs">{de.length + dt.length}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="text-4xl animate-bounce">🦸</div></div>
      ) : (
        <div className="space-y-3">
          {(() => {
            const { events: de, tasks: dt } = getDayItems(selectedDay);
            const all = [...de.map(e => ({ ...e, _type: "event" })), ...dt.map(t => ({ ...t, _type: "task" }))];
            if (all.length === 0) return (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-5xl mb-3">🌿</div>
                <p className="font-bold text-lg">Nothing scheduled for {selectedDay}!</p>
                <p className="text-sm">Sounds like a free day 🎉</p>
              </div>
            );
            return all.map((item, idx) => {
              const cfg = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.activity;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={`rounded-2xl border-2 p-4 ${cfg.color} flex items-start gap-3`}>
                  <span className="text-2xl">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-base">{item.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(item.start_time || item.due_time) && <span className="text-xs font-semibold flex items-center gap-1 opacity-80"><Clock className="w-3 h-3" />{item.start_time || item.due_time}{item.end_time ? ` – ${item.end_time}` : ""}</span>}
                      {item.location && <span className="text-xs font-semibold flex items-center gap-1 opacity-80"><MapPin className="w-3 h-3" />{item.location}</span>}
                      {item._type === "task" && item.completed && <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded-full">✅ Done!</span>}
                    </div>
                  </div>
                  {item._type === "event" && <button onClick={() => handleDeleteEvent(item.id)} className="opacity-30 hover:opacity-70 transition-opacity"><Trash2 className="w-4 h-4" /></button>}
                </motion.div>
              );
            });
          })()}
        </div>
      )}
    </Layout>
  );
}