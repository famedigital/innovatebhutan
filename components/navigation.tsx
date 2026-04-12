"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MapPin, ChevronRight } from "lucide-react";

const marqueeItems = [
  "Expert POS Engineers",
  "AI Surveillance Architects",
  "Biometric Security Specialists",
  "Hospitality Tech Consultants",
  "Full-stack Talent",
  "Network Infrastructure Experts",
  "Certified Technicians",
  "Strategic Talent Brokering",
  "Nationwide Tech Support",
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Service Portal", href: "/services" },
  { name: "Brand Partners", href: "/brands" },
  { name: "Strategy", href: "/company" },
  { name: "Support Hub", href: "/support" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar with Cyber Marquee */}
      <div className="bg-[#020617] text-[#39FF14] border-b border-[#39FF14]/20 overflow-hidden shadow-[0_0_15px_rgba(57,255,20,0.1)]">
        <div className="flex items-center h-8">
          {/* Phone & Location */}
          <div className="flex items-center gap-4 px-4 sm:px-6 shrink-0 z-10 bg-[#020617]">
            <a href="tel:+97517000000" className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="w-3 h-3" />
              <span className="text-[10px] font-mono">+975 17 000 000</span>
            </a>
            <span className="hidden sm:flex items-center gap-1 text-white/50">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-widest">Thimphu Hub</span>
            </span>
          </div>

          {/* LED Marquee */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#020617] to-transparent z-10" />
            <div className="flex animate-marquee whitespace-nowrap">
              {[...marqueeItems, ...marqueeItems].map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase">
                  <ChevronRight className="w-3 h-3 text-[#39FF14]" />
                  {item}
                </span>
              ))}
            </div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#020617] to-transparent z-10" />
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <a href="/" className="flex flex-col group relative z-10 transition-transform hover:scale-105">
              <div className="absolute -inset-2 bg-[#39FF14] rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="text-2xl font-bold tracking-tighter text-white leading-none relative">
                INNOVATE<span className="text-[#39FF14] [text-shadow:0_0_15px_#39FF14]">.</span>
              </div>
              <div className="text-[8px] font-mono tracking-[0.4em] text-[#39FF14] uppercase ml-1 opacity-80 group-hover:opacity-100 group-hover:[text-shadow:0_0_10px_#39FF14] transition-all">
                BHUTAN
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-[11px] uppercase tracking-widest font-medium text-white/60 hover:text-[#39FF14] hover:bg-white/5 rounded-full transition-all duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-2">
              <a
                href="https://wa.me/97517000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#22c55e] text-[#020617] text-[11px] uppercase tracking-tighter font-bold rounded-full hover:bg-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all"
              >
                Connect with Expert
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full text-white/70 hover:text-[#39FF14] hover:bg-white/5 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-24 left-4 right-4 md:hidden bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[60]"
            >
              <div className="p-4 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-white/70 hover:text-[#39FF14] hover:bg-white/5 rounded-xl transition-all"
                  >
                    {link.name}
                  </motion.a>
                ))}
                <motion.a
                  href="https://wa.me/97517000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="block mt-4 px-4 py-4 bg-[#22c55e] text-[#020617] text-center text-sm font-bold rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                >
                  Connect with Expert
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}