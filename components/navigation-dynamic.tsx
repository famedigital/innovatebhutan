"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, LogIn, Home, Layers, Building2, Grid3X3, Headphones } from "lucide-react";

// Icon mapping for navigation
const iconMap: Record<string, any> = {
  Home,
  Layers,
  Building2,
  Grid3X3,
  Headphones,
  LogIn,
};

interface NavLink {
  id: number;
  label: string;
  url: string;
  parent_id: number | null;
  icon_name?: string;
  icon_color?: string;
  badge?: string;
  badge_color?: string;
  open_in_new_tab: boolean;
  display_order: number;
}

// Modern Logo Component with PNG Image + Text
function ModernLogo() {
  const innovatesGreen = '#10B981';
  const btBlue = '#3B82F6';

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
        className="text-lg font-bold flex items-center"
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <span style={{ color: innovatesGreen }}>innovates</span>
        <span style={{ color: btBlue }}>.bt</span>
      </motion.span>
    </motion.div>
  );
}

export function NavigationDynamic() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);
  const [submenuTimeout, setSubmenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNavigation() {
      try {
        const response = await fetch("/api/website/navigation");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setNavLinks(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch navigation:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNavigation();
  }, []);

  // Check local storage or system preference for theme
  useEffect(() => {
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
    }, 200);
    setSubmenuTimeout(timeout);
  };

  // Group links into parent and child items
  const parentLinks = navLinks.filter(link => !link.parent_id);
  const getChildren = (parentId: number) => navLinks.filter(link => link.parent_id === parentId);

  // Fallback to static links if API fails
  const fallbackLinks: NavLink[] = [
    { id: 1, label: "Home", url: "/", parent_id: null, icon_name: "Home", open_in_new_tab: false, display_order: 1 },
    { id: 2, label: "Services", url: "/services", parent_id: null, icon_name: "Layers", open_in_new_tab: false, display_order: 2 },
    { id: 3, label: "Company", url: "/company", parent_id: null, icon_name: "Building2", open_in_new_tab: false, display_order: 3 },
    { id: 4, label: "Directory", url: "/directory", parent_id: null, icon_name: "Grid3X3", badge: "Live", open_in_new_tab: false, display_order: 4 },
    { id: 5, label: "Support", url: "/support", parent_id: null, icon_name: "Headphones", open_in_new_tab: false, display_order: 5 },
  ];

  const displayLinks = parentLinks.length > 0 ? parentLinks : fallbackLinks;

  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <ModernLogo />
              <div className="w-32 h-4 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out">
      {/* Main Nav */}
      <nav className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/10 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Modern Logo Animation - positioned left */}
            <a href="/" className="flex items-center gap-2 group relative z-10 transition-transform hover:scale-105 -ml-2">
              <ModernLogo />
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {displayLinks.map((link) => {
                const children = getChildren(link.id);
                const hasChildren = children.length > 0;
                const Icon = link.icon_name ? iconMap[link.icon_name] : null;

                return hasChildren ? (
                  <div
                    key={link.id}
                    className="relative"
                    onMouseEnter={() => handleSubmenuEnter(link.label)}
                    onMouseLeave={handleSubmenuLeave}
                  >
                    <button className="px-4 py-2 text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/50 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-all duration-300 flex items-center gap-1">
                      {link.label}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openSubmenu === link.label && (
                      <div
                        className="absolute top-full left-0 mt-1 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl min-w-[200px] overflow-hidden z-50"
                        onMouseEnter={() => handleSubmenuEnter(link.label)}
                        onMouseLeave={handleSubmenuLeave}
                      >
                        {children.map((subLink) => (
                          subLink.open_in_new_tab ? (
                            <a
                              key={subLink.id}
                              href={subLink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-3 text-sm text-slate-600 dark:text-white/70 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all border-b border-slate-100 dark:border-white/5 last:border-0"
                            >
                              {subLink.label}
                            </a>
                          ) : (
                            <a
                              key={subLink.id}
                              href={subLink.url}
                              className="block px-4 py-3 text-sm text-slate-600 dark:text-white/70 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-all border-b border-slate-100 dark:border-white/5 last:border-0"
                            >
                              {subLink.label}
                            </a>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    key={link.id}
                    href={link.url}
                    target={link.open_in_new_tab ? "_blank" : undefined}
                    rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                    className="px-4 py-2 text-[11px] uppercase tracking-widest font-bold text-slate-500 dark:text-white/50 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-all duration-300 flex items-center gap-1"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="text-[8px] px-1.5 py-0.5 bg-primary text-white rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </a>
                );
              })}
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
                {displayLinks.map((link, index) => {
                  const children = getChildren(link.id);
                  const hasChildren = children.length > 0;

                  return hasChildren ? (
                    <div key={link.id}>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setMobileOpenSubmenu(mobileOpenSubmenu === link.label ? null : link.label)}
                        className="w-full px-4 py-3 text-sm font-bold text-slate-600 dark:text-white/70 hover:text-[#10B981] hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all flex items-center justify-between"
                      >
                        {link.label}
                        <svg className={`w-4 h-4 transition-transform ${mobileOpenSubmenu === link.label ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.button>
                      {mobileOpenSubmenu === link.label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-4 space-y-1 mt-1"
                        >
                          {children.map((subLink) => (
                            subLink.open_in_new_tab ? (
                              <a
                                key={subLink.id}
                                href={subLink.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-slate-600 dark:text-white/60 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-all"
                              >
                                {subLink.label}
                              </a>
                            ) : (
                              <a
                                key={subLink.id}
                                href={subLink.url}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2 text-sm text-slate-600 dark:text-white/60 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl transition-all"
                              >
                                {subLink.label}
                              </a>
                            )
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target={link.open_in_new_tab ? "_blank" : undefined}
                      rel={link.open_in_new_tab ? "noopener noreferrer" : undefined}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 text-sm font-bold text-slate-600 dark:text-white/70 hover:text-[#10B981] hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all"
                    >
                      {link.label}
                    </motion.a>
                  );
                })}
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
