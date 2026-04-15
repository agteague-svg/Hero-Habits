import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sun, CheckCircle2, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Layout from "../components/Layout";
import VirtualPet from "../components/VirtualPet";
import TaskCard from "../components/TaskCard";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const CATEGORIES = ["homework", "chore", "band", "dance", "activity", "personal"];

export default function Home() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "homework", subject: "", due_time: "", points: 10, priority: "medium" });
  const [celebration, setCelebration] = useState(false);

  const today = new Date();
  const todayName = DAYS[today.getDay()];
  const todayStr = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);

    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('day_of_week', todayName);

    const { data: petData } = await supabase
      .from('pet_states')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    setTasks(tasksData || []);

    if (petData && petData.length > 0) {
      setPet(petData[0]);
    } else {
      const { data: newPet } = await supabase
        .from('pet_states')
        .insert({ user_id: user.id, pet_name: 'Hero', pet_type: 'bunny', level: 1, xp: 0, xp_to_next: 100, mood: 'happy', streak_days: 0, total_tasks_completed: 0 })
        .select()
        .single();
      setPet(newPet);
    }
    setLoading(false);
  };

  const handleCompleteTask = async (task) => {
    const todayStr = new Date().toISOString().split("T")[0];
    await supabase.from('tasks').update({ completed: true, completed_date: todayStr }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));

    if (pet) {
      const gainedXP = task.points || 10;
      let newXP = (pet.xp || 0) + gainedXP;
      let newLevel = pet.level || 1;
      let newXPToNext = pet.xp_to_next || 100;

      if (newXP >= newXPToNext) {
        newXP = newXP - newXPToNext;
        newLevel++;
        newXPToNext = newXPToNext + 50;
        setCelebration(true);
        setTimeout(() => setCelebration(false), 3000);
      }

      const completedToday = tasks.filter(t => t.completed).length + 1;
      const newMood = completedToday >= 3 ? "excited" : completedToday >= 1 ? "happy" : "neutral";

      const { data: updatedPet } = await supabase
        .from('pet_states')
        .update({ xp: newXP, level: newLevel, xp_to_next: newXPToNext, mood: newMood, total_tasks_completed: (pet.total_tasks_completed || 0) + 1, last_checkin: todayStr, updated_at: new Date().toISOString() })
        .eq('id', pet.id)
        .select()
        .single();
      setPet(updatedPet);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return;
    const { data: created } = await supabase
      .from('tasks')
      .insert({ ...newTask, user_id: user.id, day_of_week: todayName, completed: false })
      .select()
      .single();
    setTasks(prev => [...prev, created]);
    setNewTask({ title: "", category: "homework", subject: "", due_time: "", points: 10, priority: "medium" });
    setAddOpen(false);
  };

  const handleDeleteTask = async (task) => {
    await supabase.from('tasks').delete().eq('id', task.id);
    setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <Layout>
      <AnimatePresence>
        {celebration && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center border-4 border-amber-300">
              <div className="text-6xl mb-3">🎉</div>
              <h2 className="text-2xl font-black text-amber-600">LEVEL UP!</h2>
              <p className="text-green-600 font-bold">Your pet grew stronger! 🌟</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sun className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-black text-foreground">Good day! 🌸</h1>
        </div>
        <p className="text-muted-foreground font-semibold">{todayStr}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="text-4xl animate-bounce">🦸‍♀️</div></div>
      ) : (
        <div className="space-y-6">
          <VirtualPet pet={pet} onPetUpdate={setPet} />

          {totalCount > 0 && (
            <div className="bg-white rounded-2xl border-2 border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" />Today's Progress</span>
                <span className="font-black text-green-600">{completedCount}/{totalCount}</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.6 }} />
              </div>
              {progressPercent === 100 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-green-600 font-black mt-2 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4" /> All done! Amazing! 🎊
                </motion.p>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                {pendingTasks.length > 0 ? <><Flame className="w-5 h-5 text-orange-500" />Today's Tasks ({pendingTasks.length} left)</> : <><CheckCircle2 className="w-5 h-5 text-green-500" />All Done! 🎉</>}
              </h2>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full gap-1 font-bold"><Plus className="w-4 h-4" />Add Task</Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader><DialogTitle className="font-black text-xl">Add a Task 🦸‍♀️</DialogTitle></DialogHeader>
                  <div className="space-y-3 pt-2">
                    <Input placeholder="What's the task?" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} className="rounded-xl font-semibold" />
                    <Select value={newTask.category} onValueChange={v => setNewTask(p => ({ ...p, category: v }))}>
                      <SelectTrigger className="rounded-xl font-semibold"><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c} className="font-semibold capitalize">{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Subject (if homework)" value={newTask.subject} onChange={e => setNewTask(p => ({ ...p, subject: e.target.value }))} className="rounded-xl font-semibold" />
                    <Input placeholder="Due time (e.g. 4:00 PM)" value={newTask.due_time} onChange={e => setNewTask(p => ({ ...p, due_time: e.target.value }))} className="rounded-xl font-semibold" />
                    <Button onClick={handleAddTask} className="w-full rounded-xl font-black">Add this task! 🦸‍♀️</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              <AnimatePresence>
                {pendingTasks.map(task => <TaskCard key={task.id} task={task} onComplete={handleCompleteTask} onDelete={handleDeleteTask} />)}
              </AnimatePresence>
              {pendingTasks.length === 0 && totalCount === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">🦸‍♀️</div>
                  <p className="font-bold">No tasks yet! Add one above.</p>
                </div>
              )}
            </div>

            {completedTasks.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-bold text-muted-foreground mb-2">✅ Completed</p>
                <div className="space-y-2 opacity-60">
                  {completedTasks.map(task => <TaskCard key={task.id} task={task} onComplete={() => {}} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}