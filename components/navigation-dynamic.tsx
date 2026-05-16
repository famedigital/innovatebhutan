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
        className="h-6 sm:h-8 w-auto"
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
        className="text-base sm:text-lg font-bold flex items-center"
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
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for sticky navbar styling (client-only)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
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
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 sm:pt-4">
        <nav className="relative z-50 max-w-4xl mx-auto w-full bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-slate-100 dark:border-white/10 rounded-2xl shadow-lg">
          <div className="px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-8 sm:h-10 lg:h-12">
              <ModernLogo />
              <div className="w-32 h-4 bg-slate-100 dark:bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <>
      {/* Desktop Top Navigation - Hidden on Mobile */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 justify-center pt-2 sm:pt-4 transition-all duration-300">
        {/* Main Nav - Floating Centered */}
        <nav className={`relative z-50 max-w-4xl mx-auto w-full backdrop-blur-xl border border-slate-100 dark:border-white/10 rounded-2xl transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-black/95 shadow-xl' : 'bg-white/90 dark:bg-black/80 shadow-lg'}`}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-8 sm:h-10 lg:h-12">
            {/* Modern Logo Animation - positioned left */}
            <a href="/" className="flex items-center gap-2 group relative z-10 transition-transform hover:scale-105 -ml-1">
              <ModernLogo />
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-0.5">
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
                    <button className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-white/50 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-all duration-300 flex items-center gap-1">
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
                    className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-white/50 hover:text-primary dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-full transition-all duration-300 flex items-center gap-1"
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
            <div className="flex items-center gap-2">
              {/* Login Button */}
              <a
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E5E1] dark:border-white/10 text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A] dark:text-white rounded-full hover:bg-[#3ECF8E] hover:border-[#3ECF8E] hover:text-black transition-all"
              >
                <LogIn className="w-3 h-3" />
                <span className="hidden md:inline">Login</span>
              </a>

              {/* Apple-Style Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-primary hover:scale-110 active:scale-95 transition-all outline-none dark:shadow-[0_0_15px_rgba(57,255,20,0.2)]"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              <a
                href="https://wa.me/97517268753"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground dark:text-black text-[10px] uppercase tracking-wider font-black rounded-full hover:bg-opacity-90 dark:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all"
              >
                Connect
              </a>
            </div>
          </div>
        </div>
      </nav>
      </header>

      {/* Mobile Bottom Navigation - App Style */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] flex md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 safe-area-inset-bottom shadow-2xl">
        <div className="w-full flex items-center justify-around py-3 px-2">
          {/* Home */}
          <a
            href="/"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Home className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">Home</span>
          </a>

          {/* Services */}
          <a
            href="/services"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Layers className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">Services</span>
          </a>

          {/* Directory */}
          <a
            href="/directory"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Grid3X3 className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">Directory</span>
          </a>

          {/* Support */}
          <a
            href="/support"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Headphones className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">Support</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/97517268753"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span className="text-[10px] font-semibold text-green-500 whitespace-nowrap">WhatsApp</span>
          </a>

          {/* Login/Connect */}
          <a
            href="/login"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95 bg-primary/10 dark:bg-primary/20 rounded-xl py-2 px-3"
          >
            <LogIn className="w-6 h-6 text-primary" />
            <span className="text-[10px] font-semibold text-primary whitespace-nowrap">Login</span>
          </a>
        </div>
      </div>
    </>
  );
}
