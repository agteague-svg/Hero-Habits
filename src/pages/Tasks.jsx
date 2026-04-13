import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Layout from "../components/Layout";
import TaskCard from "../components/TaskCard";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CATEGORIES = ["homework", "chore", "band", "dance", "activity", "personal"];

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "homework", subject: "", day_of_week: "Monday", due_time: "", due_date: "", points: 10, priority: "medium", recurring: false, notes: "" });

  useEffect(() => { if (user) loadTasks(); }, [user]);

  const loadTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setTasks(data || []);
    setLoading(false);
  };

  const handleComplete = async (task) => {
    const today = new Date().toISOString().split("T")[0];
    await supabase.from('tasks').update({ completed: true, completed_date: today }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
  };

  const handleDelete = async (task) => {
    await supabase.from('tasks').delete().eq('id', task.id);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const handleAdd = async () => {
    if (!newTask.title.trim()) return;
    const { data: created } = await supabase.from('tasks').insert({ ...newTask, user_id: user.id, completed: false }).select().single();
    setTasks(prev => [created, ...prev]);
    setNewTask({ title: "", category: "homework", subject: "", day_of_week: "Monday", due_time: "", due_date: "", points: 10, priority: "medium", recurring: false, notes: "" });
    setAddOpen(false);
  };

  const filtered = tasks.filter(t => {
    if (filter === "all") return true;
    if (filter === "pending") return !t.completed;
    if (filter === "done") return t.completed;
    return t.category === filter;
  });

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">📋 All Tasks</h1>
          <p className="text-muted-foreground font-semibold text-sm">{tasks.filter(t => !t.completed).length} tasks to go!</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-1 font-bold"><Plus className="w-4 h-4" />Add Task</Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-black text-xl">New Task 🦸</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Task name" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} className="rounded-xl font-semibold" />
              <Select value={newTask.category} onValueChange={v => setNewTask(p => ({ ...p, category: v }))}>
                <SelectTrigger className="rounded-xl font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="font-semibold capitalize">{c}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={newTask.day_of_week} onValueChange={v => setNewTask(p => ({ ...p, day_of_week: v }))}>
                <SelectTrigger className="rounded-xl font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d} className="font-semibold">{d}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Subject (if homework)" value={newTask.subject} onChange={e => setNewTask(p => ({ ...p, subject: e.target.value }))} className="rounded-xl font-semibold" />
              <Input type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} className="rounded-xl font-semibold" />
              <Input placeholder="Due time (e.g. 4:00 PM)" value={newTask.due_time} onChange={e => setNewTask(p => ({ ...p, due_time: e.target.value }))} className="rounded-xl font-semibold" />
              <Select value={newTask.priority} onValueChange={v => setNewTask(p => ({ ...p, priority: v }))}>
                <SelectTrigger className="rounded-xl font-semibold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="font-semibold">🟢 Low Priority</SelectItem>
                  <SelectItem value="medium" className="font-semibold">🟡 Medium Priority</SelectItem>
                  <SelectItem value="high" className="font-semibold">🔴 High Priority</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Notes (optional)" value={newTask.notes} onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))} className="rounded-xl font-semibold" />
              <Button onClick={handleAdd} className="w-full rounded-xl font-black">Add task! 🦸</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {[{ val: "all", label: "All 🌸" }, { val: "pending", label: "To Do 📌" }, { val: "done", label: "Done ✅" }, { val: "homework", label: "Homework 📚" }, { val: "chore", label: "Chores 🧹" }, { val: "band", label: "Band 🎵" }, { val: "dance", label: "Dance 💃" }].map(({ val, label }) => (
          <button key={val} onClick={() => setFilter(val)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${filter === val ? "bg-primary text-white border-primary shadow-sm" : "bg-white border-border text-muted-foreground hover:border-primary/50"}`}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="text-4xl animate-bounce">🦸</div></div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map(task => <TaskCard key={task.id} task={task} onComplete={handleComplete} onDelete={handleDelete} />)}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-5xl mb-3">🦸</div>
              <p className="font-bold text-lg">No tasks here!</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}