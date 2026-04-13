import { useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Check, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "../components/Layout";

const THEMES = [
  { id: "garden", label: "Garden 🌸", description: "Fresh greens & pinks", primary: "#3d8b5e", bg: "#f8f4ee", accent: "#f0a6ca" },
  { id: "ocean", label: "Ocean 🌊", description: "Cool blues & teals", primary: "#0e7490", bg: "#f0f9ff", accent: "#67e8f9" },
  { id: "sunset", label: "Sunset 🌅", description: "Warm oranges & purples", primary: "#c2410c", bg: "#fff7ed", accent: "#fb923c" },
  { id: "lavender", label: "Lavender 💜", description: "Soft purples & mauves", primary: "#7c3aed", bg: "#faf5ff", accent: "#c4b5fd" },
  { id: "berry", label: "Berry 🍓", description: "Bold pinks & reds", primary: "#be185d", bg: "#fff1f2", accent: "#f9a8d4" },
  { id: "forest", label: "Forest 🌲", description: "Deep greens & earthy tones", primary: "#166534", bg: "#f0fdf4", accent: "#86efac" },
];

const PETS = [
  { type: "bunny", emoji: "🐰", label: "Blossom Bunny", description: "Soft and sweet!" },
  { type: "fox", emoji: "🦊", label: "Fern Fox", description: "Clever and quick!" },
  { type: "frog", emoji: "🐸", label: "Lily Frog", description: "Jumpy and fun!" },
  { type: "butterfly", emoji: "🦋", label: "Flutter Butterfly", description: "Free and colorful!" },
  { type: "hedgehog", emoji: "🦔", label: "Hazel Hedgehog", description: "Cozy and cute!" },
];

export default function Customize() {
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(localStorage.getItem("herohabit_theme") || "garden");
  const [selectedPet, setSelectedPet] = useState("bunny");
  const [petName, setPetName] = useState("Hero");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (user) loadPet(); }, [user]);

  const loadPet = async () => {
    setLoading(true);
    const { data } = await supabase.from('pet_states').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1);
    if (data && data.length > 0) {
      setPet(data[0]);
      setSelectedPet(data[0].pet_type || "bunny");
      setPetName(data[0].pet_name || "Hero");
    }
    setLoading(false);
  };

  const applyTheme = (themeId) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;
    const root = document.documentElement;
    const hexToHsl = (hex) => {
      let r = parseInt(hex.slice(1, 3), 16) / 255;
      let g = parseInt(hex.slice(3, 5), 16) / 255;
      let b = parseInt(hex.slice(5, 7), 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };
    root.style.setProperty("--primary", hexToHsl(theme.primary));
    root.style.setProperty("--background", hexToHsl(theme.bg));
    root.style.setProperty("--accent", hexToHsl(theme.accent));
    localStorage.setItem("herohabit_theme", themeId);
  };

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
  };

  const handleSavePet = async () => {
    if (!pet) return;
    await supabase.from('pet_states').update({ pet_type: selectedPet, pet_name: petName, updated_at: new Date().toISOString() }).eq('id', pet.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-black flex items-center gap-2">✨ Customize</h1>
        <p className="text-muted-foreground font-semibold text-sm">Make HeroHabit totally yours!</p>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-black text-foreground mb-3 flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Choose Your Theme</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {THEMES.map(theme => (
            <motion.button key={theme.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleThemeSelect(theme.id)} className={`relative rounded-2xl border-2 p-4 text-left transition-all ${selectedTheme === theme.id ? "border-primary shadow-md ring-2 ring-primary/30" : "border-border bg-white hover:border-primary/40"}`}>
              {selectedTheme === theme.id && <span className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5"><Check className="w-3 h-3" /></span>}
              <div className="flex gap-1 mb-2">
                <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: theme.primary }} />
                <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: theme.bg }} />
                <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: theme.accent }} />
              </div>
              <p className="font-black text-sm">{theme.label}</p>
              <p className="text-xs text-muted-foreground font-semibold">{theme.description}</p>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-black text-foreground mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Choose Your Pet</h2>
        {loading ? <div className="text-center py-8 text-4xl animate-bounce">🦸</div> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {PETS.map(p => (
                <motion.button key={p.type} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedPet(p.type)} className={`relative rounded-2xl border-2 p-4 text-center transition-all ${selectedPet === p.type ? "border-primary shadow-md ring-2 ring-primary/30 bg-primary/5" : "border-border bg-white hover:border-primary/40"}`}>
                  {selectedPet === p.type && <span className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5"><Check className="w-3 h-3" /></span>}
                  <div className="text-4xl mb-2">{p.emoji}</div>
                  <p className="font-black text-sm">{p.label}</p>
                  <p className="text-xs text-muted-foreground font-semibold">{p.description}</p>
                </motion.button>
              ))}
            </div>
            <div className="bg-white rounded-2xl border-2 border-border p-4">
              <label className="block text-sm font-black text-foreground mb-2">Give your pet a name! 🏷️</label>
              <div className="flex gap-2">
                <Input placeholder="Pet name..." value={petName} onChange={e => setPetName(e.target.value)} className="rounded-xl font-bold" maxLength={20} />
                <Button onClick={handleSavePet} className="rounded-xl font-black px-6 gap-1">
                  {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save 🦸"}
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </Layout>
  );
}