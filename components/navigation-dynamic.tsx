"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Layers, Grid3X3, Headphones } from "lucide-react";
import { NavigationMenuFullMegaMenu } from "@/components/examples/navigation-menu/complex/navigation-menu-full-mega-menu";

export function NavigationDynamic() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 50);
    return () => clearTimeout(timer);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      {/* Desktop: floating pill on hero → sticky full bar while scrolling */}
      <motion.header
        initial={false}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`hidden md:flex fixed z-50 left-0 right-0 justify-center transition-[padding,background-color,border-radius,box-shadow,backdrop-filter] duration-300 ${
          isScrolled
            ? "top-0 px-0 pt-0"
            : "top-0 px-4 sm:px-6 pt-3 sm:pt-4"
        }`}
      >
        <div
          className={`relative z-50 w-full transition-all duration-300 ${
            isScrolled
              ? "max-w-none rounded-none border-b border-border/80 bg-background/95 shadow-sm backdrop-blur-xl"
              : "max-w-5xl rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-black/80 shadow-lg backdrop-blur-xl"
          }`}
        >
          <div
            className={`mx-auto w-full ${
              isScrolled ? "max-w-[1600px] px-4 sm:px-6 lg:px-8" : "px-3 sm:px-4"
            }`}
          >
            {loading ? (
              <div className="flex h-14 items-center justify-between">
                <div className="h-6 w-36 animate-pulse rounded bg-muted" />
                <div className="h-6 w-64 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <NavigationMenuFullMegaMenu />
            )}
          </div>
        </div>
      </motion.header>

      {/* Spacer only once sticky so floating nav can overlay the hero */}
      <div
        className={`hidden md:block transition-[height] duration-300 ${
          isScrolled ? "h-14" : "h-0"
        }`}
        aria-hidden="true"
      />

      {/* Mobile Bottom Navigation - App Style */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] flex md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 safe-area-inset-bottom shadow-2xl">
        <div className="w-full flex items-center justify-around py-3 px-2">
          <a
            href="/"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Home className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">
              Home
            </span>
          </a>

          <a
            href="/products"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Grid3X3 className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">
              Products
            </span>
          </a>

          <a
            href="/services"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Layers className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">
              Services
            </span>
          </a>

          <a
            href="/support"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <Headphones className="w-6 h-6 text-slate-600 dark:text-white/70" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-white/60 whitespace-nowrap">
              Support
            </span>
          </a>

          <a
            href="https://wa.me/97517268753"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 min-w-0 flex-1 transition-all active:scale-95"
          >
            <svg
              className="w-6 h-6 text-green-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-[10px] font-semibold text-green-500 whitespace-nowrap">
              WhatsApp
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
