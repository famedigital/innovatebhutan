"use client";

import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles, Award, Users, Globe } from "lucide-react";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function HeroSection({ searchQuery, setSearchQuery }: HeroSectionProps) {
  const popularSearches = ["POS Engineers", "Surveillance AI", "Cloud Masters", "Hotel Tech Guys"];

  return (
    <div className="h-full flex flex-col">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-full mb-6 w-fit shadow-[0_0_15px_rgba(57,255,20,0.05)]"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#39FF14]">The Talent Matrix</span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tighter text-white mb-6 leading-[0.9]"
      >
        Broker <span className="text-[#39FF14]">Elite Skills</span>
        <br />
        For Your Empire
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-sm sm:text-base text-white/50 mb-6 max-w-md font-medium"
      >
        We connect shops, restaurants, and homeowners with the most advanced technical talents in Bhutan.
      </motion.p>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-6"
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-[#39FF14] rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="relative flex items-center bg-[#0f172a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden focus-within:border-[#39FF14]/50 transition-colors">
            <Search className="w-5 h-5 text-white/30 ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Search talent or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none bg-transparent min-w-0"
            />
            <button className="m-1.5 px-4 py-2.5 bg-[#39FF14] text-[#020617] text-xs font-bold uppercase rounded-xl hover:bg-white hover:scale-105 transition-all flex items-center gap-1.5 shrink-0">
              Find
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Popular Searches */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap items-center gap-2 mb-8"
      >
        <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Trending:</span>
        {popularSearches.map((term) => (
          <button
            key={term}
            onClick={() => setSearchQuery(term)}
            className="px-3 py-1.5 text-[9px] font-bold uppercase text-white/60 bg-white/5 border border-white/5 hover:border-[#39FF14]/30 hover:text-[#39FF14] rounded-full transition-all"
          >
            {term}
          </button>
        ))}
      </motion.div>

      {/* Company Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10"
      >
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#39FF14] mb-2">Innovation Brokerage</h3>
        <p className="text-xs text-white/60 mb-4 leading-relaxed font-medium">
          The ultimate bridge to Bhutan&apos;s technical elite. Since 2009, we have brokered expertise for 500+ high-stakes projects across 20+ dzongkhags.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#39FF14]" />
              <span className="text-white font-bold text-xs">15+ YRS</span>
            </div>
            <span className="text-[9px] text-white/30 uppercase font-bold">Experience</span>
          </div>
          <div className="flex flex-col gap-1 text-center">
            <div className="flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#39FF14]" />
              <span className="text-white font-bold text-xs">500+</span>
            </div>
            <span className="text-[9px] text-white/30 uppercase font-bold">Talents</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <div className="flex items-center justify-end gap-1">
              <Globe className="w-3.5 h-3.5 text-[#39FF14]" />
              <span className="text-white font-bold text-xs">NATIONWIDE</span>
            </div>
            <span className="text-[9px] text-white/30 uppercase font-bold">Reach</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}