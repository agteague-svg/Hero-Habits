import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Star, Trash2 } from "lucide-react";

const CATEGORY_CONFIG = {
  homework: { color: "bg-blue-200 border-blue-400 text-blue-900", badge: "bg-blue-300 text-blue-900", icon: "📚", label: "Homework" },
  chore: { color: "bg-amber-200 border-amber-400 text-amber-900", badge: "bg-amber-300 text-amber-900", icon: "🧹", label: "Chore" },
  band: { color: "bg-purple-200 border-purple-400 text-purple-900", badge: "bg-purple-300 text-purple-900", icon: "🎵", label: "Band" },
  dance: { color: "bg-pink-200 border-pink-400 text-pink-900", badge: "bg-pink-300 text-pink-900", icon: "💃", label: "Dance" },
  activity: { color: "bg-green-200 border-green-400 text-green-900", badge: "bg-green-300 text-green-900", icon: "⭐", label: "Activity" },
  personal: { color: "bg-rose-200 border-rose-400 text-rose-900", badge: "bg-rose-300 text-rose-900", icon: "🌟", label: "Personal" },
};

const PRIORITY_DOTS = { high: "bg-red-400", medium: "bg-yellow-400", low: "bg-green-400" };

export default function TaskCard({ task, onComplete, onDelete }) {
  const [justCompleted, setJustCompleted] = useState(false);
  const config = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.activity;

  const handleComplete = async () => {
    if (task.completed) return;
    setJustCompleted(true);
    await onComplete(task);
    setTimeout(() => setJustCompleted(false), 1500);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: task.completed ? 0.6 : 1, y: 0 }} exit={{ opacity: 0, x: -50, scale: 0.8 }} className={`relative rounded-2xl border-2 p-3 transition-all ${config.color} ${task.completed ? "opacity-60" : ""}`}>
      <AnimatePresence>
        {justCompleted && (
          <motion.div initial={{ opacity: 0, scale: 0.5, y: 0 }} animate={{ opacity: 1, scale: 1.2, y: -30 }} exit={{ opacity: 0, y: -50 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <span className="text-3xl">⭐</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-start gap-3">
        <button onClick={handleComplete} disabled={task.completed} className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.completed ? "bg-green-500 border-green-500 text-white" : "border-current hover:bg-white/50 active:scale-90"}`}>
          {task.completed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base">{config.icon}</span>
            <span className={`text-sm font-bold leading-tight ${task.completed ? "line-through opacity-70" : ""}`}>{task.title}</span>
            {task.priority && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOTS[task.priority]}`} title={task.priority} />}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badge}`}>{config.label}</span>
            {task.subject && <span className="text-xs opacity-70 font-semibold">{task.subject}</span>}
            {task.due_time && <span className="text-xs opacity-70 font-semibold flex items-center gap-0.5"><Clock className="w-3 h-3" />{task.due_time}</span>}
            {task.points && <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />+{task.points}</span>}
          </div>
        </div>
        {onDelete && <button onClick={() => onDelete(task)} className="text-current opacity-30 hover:opacity-70 transition-opacity p-1"><Trash2 className="w-3.5 h-3.5" /></button>}
      </div>
    </motion.div>
  );
}