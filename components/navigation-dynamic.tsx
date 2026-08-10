"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, LogIn, Home, Layers, Building2, Grid3X3, Headphones, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/PureThemeProvider";
import { NavigationMenuFullMegaMenu } from "@/components/examples/navigation-menu/complex/navigation-menu-full-mega-menu";

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
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // ALL useState hooks must be declared before any conditional returns
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);
  const [submenuTimeout, setSubmenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [loading, setLoading] = useState(true);

  // ALL useEffect hooks MUST be declared before any conditional returns
  // Wait for client-side mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll detection for sticky navbar styling (client-only)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY) {
        setScrollDirection('up');
      }

      setLastScrollY(currentScrollY);
      setIsScrolled(currentScrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Fetch navigation links from API
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

  const isCompanyPage = pathname === '/company' || pathname === '/company/';

  // Hide navigation for admin/backend routes (MUST be after ALL hooks)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Helper to determine if dark mode is active
  const isDarkMode = mounted && (theme === 'dark' || (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches));

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      // System mode - toggle to explicit mode
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(systemPrefersDark ? 'light' : 'dark');
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

  // Fallback to static links if API fails (Company & Directory removed from public nav)
  const fallbackLinks: NavLink[] = [
    { id: 1, label: "Home", url: "/", parent_id: null, icon_name: "Home", open_in_new_tab: false, display_order: 1 },
    { id: 2, label: "Services", url: "/services", parent_id: null, icon_name: "Layers", open_in_new_tab: false, display_order: 2 },
    { id: 5, label: "Support", url: "/support", parent_id: null, icon_name: "Headphones", open_in_new_tab: false, display_order: 3 },
  ];

  const hiddenNavPaths = ["/company", "/directory"];
  const isHiddenNavLink = (link: NavLink) =>
    hiddenNavPaths.some(
      (path) =>
        link.url === path ||
        link.url.startsWith(`${path}/`) ||
        link.label.toLowerCase() === "company" ||
        link.label.toLowerCase() === "directory"
    );

  const displayLinks = (parentLinks.length > 0 ? parentLinks : fallbackLinks).filter(
    (link) => !isHiddenNavLink(link)
  );

  // Conditional rendering based on scroll state and company page
  const showFullNav = !isCompanyPage && (!isScrolled || scrollDirection === 'up' || scrollDirection === null);
  const showMinimizedNav = isCompanyPage || (isScrolled && scrollDirection === 'down');

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
      {/* Desktop Top Navigation - shadcn.io Navbar Mega Menu Grid */}
      <motion.header
        initial={false}
        animate={{
          y: showFullNav ? 0 : -150,
          opacity: showFullNav ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 justify-center pt-2 sm:pt-4 px-4"
      >
        <div className="relative z-50 max-w-5xl mx-auto w-full">
          <NavigationMenuFullMegaMenu />
        </div>
      </motion.header>

      {/* Minimized Desktop Navigation - Shown when scrolling down */}
      <AnimatePresence>
        {showMinimizedNav && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="hidden md:flex fixed top-4 right-4 z-50"
          >
            <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full shadow-xl px-4 py-2 flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
                <ModernLogo />
              </a>
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-white/70" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burger Menu Overlay - Desktop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-black z-[70] shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex items-center justify-between mb-8">
                  <ModernLogo />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {displayLinks.map((link) => {
                    const children = getChildren(link.id);
                    const hasChildren = children.length > 0;
                    const Icon = link.icon_name ? iconMap[link.icon_name] : null;

                    return (
                      <div key={link.id}>
                        {hasChildren ? (
                          <>
                            <button
                              onClick={() => setMobileOpenSubmenu(mobileOpenSubmenu === link.label ? null : link.label)}
                              className="w-full flex items-center justify-between px-4 py-3 text-slate-600 dark:text-white/70 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                            >
                              <div className="flex items-center gap-3">
                                {Icon && <Icon className="w-5 h-5" />}
                                <span className="font-semibold">{link.label}</span>
                              </div>
                              <ChevronRight
                                className={`w-5 h-5 transition-transform ${
                                  mobileOpenSubmenu === link.label ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                            {mobileOpenSubmenu === link.label && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="ml-4 mt-1 space-y-1 overflow-hidden"
                              >
                                {children.map((subLink) => (
                                  <a
                                    key={subLink.id}
                                    href={subLink.url}
                                    target={subLink.open_in_new_tab ? '_blank' : undefined}
                                    rel={subLink.open_in_new_tab ? 'noopener noreferrer' : undefined}
                                    onClick={() => setIsOpen(false)}
                                    className="block px-4 py-2 text-sm text-slate-500 dark:text-white/60 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-all"
                                  >
                                    {subLink.label}
                                  </a>
                                ))}
                              </motion.div>
                            )}
                          </>
                        ) : (
                          <a
                            href={link.url}
                            target={link.open_in_new_tab ? '_blank' : undefined}
                            rel={link.open_in_new_tab ? 'noopener noreferrer' : undefined}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-white/70 hover:text-primary dark:hover:text-primary hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all"
                          >
                            {Icon && <Icon className="w-5 h-5" />}
                            <span className="font-semibold">{link.label}</span>
                            {link.badge && (
                              <span className="ml-auto text-xs px-2 py-1 bg-primary text-white rounded-full">
                                {link.badge}
                              </span>
                            )}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </nav>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <a
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-full font-semibold hover:border-primary hover:text-primary transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </a>
                  <a
                    href="https://wa.me/97517268753"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground dark:text-black rounded-full font-semibold hover:bg-opacity-90 transition-all"
                  >
                    <span>Connect on WhatsApp</span>
                  </a>
                </div>

                {/* Theme Toggle */}
                <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <span className="text-sm font-medium">Theme</span>
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-5 h-5 text-primary" />
                        <span className="text-sm">Light</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-5 h-5 text-slate-600" />
                        <span className="text-sm">Dark</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

          {/* Products */}
          <a
            href="/products"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Grid3X3 className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">Products</span>
          </a>

          {/* Services */}
          <a
            href="/services"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Layers className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">Services</span>
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
        </div>
      </div>
    </>
  );
}
