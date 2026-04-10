"use client";

import { motion } from "framer-motion";
import { 
  LayoutGrid, 
  Monitor, 
  ShieldCheck, 
  Fingerprint, 
  Hotel, 
  Code2, 
  Zap 
} from "lucide-react";

const categories = [
  { id: "pos", name: "POS Ops", icon: Monitor },
  { id: "security", name: "Security AI", icon: ShieldCheck },
  { id: "biometric", name: "Identity", icon: Fingerprint },
  { id: "hospitality", name: "Hospitality", icon: Hotel },
  { id: "software", name: "Digital", icon: Code2 },
  { id: "power", name: "Energy", icon: Zap },
];

interface CategoryFilterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export function CategoryFilter({ activeCategory, setActiveCategory }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pb-4">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              group flex items-center gap-2.5 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300
              ${isActive 
                ? "bg-[#39FF14] text-[#020617] shadow-[0_0_20px_rgba(57,255,20,0.3)]" 
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5"
              }
            `}
          >
            <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#020617]" : "text-white/30 group-hover:text-[#39FF14]"}`} />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}