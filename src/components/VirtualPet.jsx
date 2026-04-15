import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star } from "lucide-react";

const PET_EMOJIS = {
  bunny: { base: "🐰", happy: "🐇", excited: "🐰", sad: "😢", sleeping: "😴", neutral: "🐰" },
  fox: { base: "🦊", happy: "🦊", excited: "🦊", sad: "😢", sleeping: "😴", neutral: "🦊" },
  frog: { base: "🐸", happy: "🐸", excited: "🐸", sad: "😢", sleeping: "😴", neutral: "🐸" },
  butterfly: { base: "🦋", happy: "🦋", excited: "🦋", sad: "😢", sleeping: "😴", neutral: "🦋" },
  hedgehog: { base: "🦔", happy: "🦔", excited: "🦔", sad: "😢", sleeping: "😴", neutral: "🦔" },
};

const MOOD_MESSAGES = {
  happy: "I'm so happy! Keep it up! 🌸",
  excited: "WOW! You're amazing! 🎉",
  neutral: "Let's get some tasks done today! 🌿",
  sad: "I miss you! Come check off some tasks! 💧",
  sleeping: "Zzz... wake me up with a task! 😴",
};

const LEVEL_TITLES = ["Seedling", "Sprout", "Bud", "Bloomer", "Hero Star", "Hero Legend"];

export default function VirtualPet({ pet, onPetUpdate }) {
  const [showSparkle, setShowSparkle] = useState(false);
  if (!pet) return null;

  const petEmoji = PET_EMOJIS[pet.pet_type] || PET_EMOJIS.bunny;
  const moodEmoji = petEmoji[pet.mood] || petEmoji.base;
  const xpPercent = Math.min(100, ((pet.xp || 0) / (pet.xp_to_next || 100)) * 100);
  const levelTitle = LEVEL_TITLES[Math.min((pet.level || 1) - 1, LEVEL_TITLES.length - 1)];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 p-5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute top-2 right-4 text-3xl opacity-20">🦸‍♀️</span>
        <span className="absolute bottom-3 left-2 text-2xl opacity-20">⚡</span>
        <span className="absolute top-1/2 right-2 text-xl opacity-20">🌟</span>
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-4">
          <motion.div className="relative cursor-pointer select-none" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} onClick={() => setShowSparkle(true)} onAnimationComplete={() => setShowSparkle(false)}>
            <div className="text-6xl filter drop-shadow-md">{moodEmoji}</div>
            <AnimatePresence>
              {showSparkle && (
                <motion.div initial={{ opacity: 0, scale: 0, y: 0 }} animate={{ opacity: 1, scale: 1, y: -20 }} exit={{ opacity: 0 }} className="absolute -top-4 left-1/2 -translate-x-1/2 text-yellow-400">
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-black text-green-800">{pet.pet_name}</h3>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Star className="w-3 h-3" />Lv.{pet.level}</span>
            </div>
            <p className="text-xs font-bold text-green-600 mb-2 italic">{levelTitle}</p>
            <p className="text-xs text-green-700 font-semibold mb-2 bg-white/60 rounded-lg px-2 py-1">"{MOOD_MESSAGES[pet.mood]}"</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-green-700">
                <span>XP: {pet.xp}/{pet.xp_to_next}</span>
                {pet.streak_days > 0 && <span className="text-orange-500">🔥 {pet.streak_days} day streak!</span>}
              </div>
              <div className="h-3 bg-white/60 rounded-full overflow-hidden border border-green-200">
                <motion.div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}