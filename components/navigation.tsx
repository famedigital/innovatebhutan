"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, LogIn } from "lucide-react";

// Modern Logo Component with PNG Image + Text
function ModernLogo() {
  // Ultra luxury green color
  const luxuryGreen = '#047857';
  const shimmerGreen = '#10B981';

  return (
    <motion.div
      className="relative flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src="https://res.cloudinary.com/dr9a371tx/image/upload/q_auto/f_auto/v1776705871/weblogo_os6cni.png"
        alt="innovates.bt"
        className="h-8 w-auto"
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.span
        className="text-lg font-bold"
        style={{ color: luxuryGreen }}
        animate={{
          y: [0, -2, 0],
          color: [luxuryGreen, shimmerGreen, luxuryGreen],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        innovates.bt
      </motion.span>
    </motion.div>
  );
}

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Service Portal", href: "/services" },
  { name: "Directory", href: "/directory" },
  {
    name: "Company",
    submenu: [
      { name: "About Us", href: "/company" },
      { name: "Our Team", href: "/company/team" },
      { name: "Careers", href: "/company/careers" },
    ]
  },
  {
    name: "Support Hub",
    submenu: [
      { name: "Help Center", href: "/support/help" },
      { name: "Warranty", href: "/support/warranty" },
      { name: "Service Request", href: "/support/service" },
      { name: "WhatsApp Support", href: "https://wa.me/97517268753", external: true },
    ]
  },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);
  const [submenuTimeout, setSubmenuTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleSubmenuEnter = (name: string) => {
    if (submenuTimeout) {
      clearTimeout(submenuTimeout);
      setSubmenuTimeout(null);
    }
    setOpenSubmenu(name);
  };

  const handleSubmenuLeave = () => {
    const timeout = setTimeout(() => {
      setOpenSubmenu(null);
    }, 200); // 200ms delay before closing
    setSubmenuTimeout(timeout);
  };

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
    <header className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out">
      {/* Main Nav */}
      <nav className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Modern Logo Animation - positioned left */}
            <a href="/" className="flex items-center gap-2 group relative z-10 transition-transform hover:scale-105 -ml-2">
              <ModernLogo />
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                'submenu' in link ? (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => handleSubmenuEnter(link.name)}
                    onMouseLeave={handleSubmenuLeave}
                  >
                    <button className="px-4 py-2 text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/50 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-all duration-300 flex items-center gap-1">
                      {link.name}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openSubmenu === link.name && (
                      <div
                        className="absolute top-full left-0 mt-1 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl min-w-[200px] overflow-hidden z-50"
                        style={{ transform: "translateX(0)" }}
                        onMouseEnter={() => handleSubmenuEnter(link.name)}
                        onMouseLeave={handleSubmenuLeave}
                      >
                        {link.submenu.map((subLink) => (
                          subLink.external ? (
                            <a
                              key={subLink.name}
                              href={subLink.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-3 text-sm text-slate-600 dark:text-white/70 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all border-b border-slate-100 dark:border-white/5 last:border-0"
                            >
                              {subLink.name}
                            </a>
                          ) : (
                            <a
                              key={subLink.name}
                              href={subLink.href}
                              className="block px-4 py-3 text-sm text-slate-600 dark:text-white/70 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all border-b border-slate-100 dark:border-white/5 last:border-0"
                            >
                              {subLink.name}
                            </a>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="px-4 py-2 text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/50 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-all duration-300"
                  >
                    {link.name}
                  </a>
                )
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
                  'submenu' in link ? (
                    <div key={link.name}>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setMobileOpenSubmenu(mobileOpenSubmenu === link.name ? null : link.name)}
                        className="w-full px-4 py-3 text-sm font-bold text-slate-600 dark:text-white/70 hover:text-[#10B981] hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center justify-between"
                      >
                        {link.name}
                        <svg className={`w-4 h-4 transition-transform ${mobileOpenSubmenu === link.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.button>
                      {mobileOpenSubmenu === link.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 space-y-1 mt-1"
                        >
                          {link.submenu.map((subLink) => (
                            subLink.external ? (
                              <a
                                key={subLink.name}
                                href={subLink.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-slate-600 dark:text-white/60 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-all"
                              >
                                {subLink.name}
                              </a>
                            ) : (
                              <a
                                key={subLink.name}
                                href={subLink.href}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-slate-600 dark:text-white/60 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-all"
                              >
                                {subLink.name}
                              </a>
                            )
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ) : (
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
                  )
                ))}
                <motion.a
                  href="https://wa.me/97517268753"
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
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
