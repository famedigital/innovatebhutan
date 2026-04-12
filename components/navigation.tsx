"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, MapPin, ChevronRight, Moon, Sun, LogIn } from "lucide-react";

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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar with Luxe Marquee */}
      <div className="bg-[#F1F5F9] dark:bg-black text-[#059669] dark:text-[#10B981] border-b border-slate-200 dark:border-white/10 overflow-hidden shadow-sm transition-colors">
        <div className="flex items-center h-8">
          {/* Phone & Location */}
          <div className="flex items-center gap-4 px-4 sm:px-6 shrink-0 z-10 bg-[#F1F5F9] dark:bg-black">
            <a href="tel:+97517268753" className="flex items-center gap-1 hover:text-[#0F172A] dark:hover:text-white transition-colors">
              <Phone className="w-3 h-3" />
              <span className="text-[10px] font-mono font-bold">+975 17268753</span>
            </a>
            <span className="hidden sm:flex items-center gap-1 text-slate-400">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] uppercase tracking-widest font-medium text-slate-500">Thimphu Hub</span>
            </span>
          </div>

          {/* Marquee */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#F1F5F9] dark:from-black to-transparent z-10" />
            <div className="flex animate-marquee whitespace-nowrap">
              {[...marqueeItems, ...marqueeItems].map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-6 text-[9px] font-mono tracking-tighter uppercase font-bold text-slate-500 dark:text-white/40">
                  <ChevronRight className="w-3 h-3 text-[#10B981]" />
                  {item}
                </span>
              ))}
            </div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#F1F5F9] dark:from-black to-transparent z-10" />
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Logo */}
            <a href="/" className="flex flex-col group relative z-10 transition-transform hover:scale-105">
              <div className="text-2xl font-black tracking-tighter text-[#0F172A] dark:text-white leading-none relative">
                INNOVATE<span className="text-primary relative">
                .
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                </span>
              </div>
              <div className="text-[8px] font-mono tracking-[0.4em] text-primary uppercase mt-0.5 ml-1 opacity-80 group-hover:opacity-100 transition-all relative">
                BHUTAN
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/50 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-all duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Action Area */}
            <div className="flex items-center gap-3">
              {/* Login Button */}
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#E5E5E1] dark:border-white/10 text-[11px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-white rounded-full hover:bg-[#3ECF8E] hover:border-[#3ECF8E] hover:text-black transition-all"
              >
                <LogIn className="w-3 h-3" />
                Login
              </a>

              {/* Apple-Style Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-primary hover:scale-110 active:scale-95 transition-all outline-none dark:shadow-[0_0_15px_rgba(57,255,20,0.2)]"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="hidden md:flex items-center gap-2">
                <a
                  href="https://wa.me/97517268753"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground dark:text-black text-[11px] uppercase tracking-tighter font-black rounded-full hover:bg-opacity-90 dark:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all"
                >
                  Connect
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-full text-slate-400 dark:text-white/40 hover:text-[#10B981] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
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
              className="fixed inset-0 bg-slate-200/60 dark:bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-24 left-4 right-4 md:hidden bg-white/95 dark:bg-[#111] backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden z-[60]"
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
                    className="block px-4 py-3 text-sm font-bold text-slate-600 dark:text-white/70 hover:text-[#10B981] hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all"
                  >
                    {link.name}
                  </motion.a>
                ))}
                <motion.a
                  href="https://wa.me/97517268753"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="block mt-4 px-4 py-4 bg-[#10B981] text-white text-center text-sm font-bold rounded-2xl shadow-lg"
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
