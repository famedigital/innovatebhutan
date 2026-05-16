"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  X,
  Store,
  Utensils,
  Hotel,
  Code,
  Database,
  LayoutGrid,
  Wrench,
  Shield,
  Zap,
  Smartphone,
  FileText,
  Users,
  Rocket,
  Heart,
  Award,
  Megaphone,
  Palette,
  Terminal,
  Network,
  CheckCircle2,
  BarChart3,
  Cloud
} from "lucide-react";

// Icon mapping for all possible icons from database
const iconMap: Record<string, any> = {
  Store,
  Utensils,
  Hotel,
  Code,
  Database,
  LayoutGrid,
  Wrench,
  Shield,
  Zap,
  Smartphone,
  FileText,
  Users,
  Rocket,
  Heart,
  Award,
  Megaphone,
  Palette,
  Terminal,
  Network,
  CheckCircle2,
  BarChart3,
  Cloud,
  // Add more icons as needed
  Play,
};

interface Service {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  icon_name?: string;
  icon_color?: string;
  gradient_from?: string;
  gradient_to?: string;
  features?: string[];
  category?: string;
}

interface InteractiveHexagonProps {
  service: Service;
  index: number;
}

function InteractiveHexagon({ service, index }: InteractiveHexagonProps) {
  const [isActive, setIsActive] = useState(false);

  // Get icon from mapping or use default
  const Icon = service.icon_name ? iconMap[service.icon_name] || Code : Code;

  // Build gradient from database values
  const gradient = service.gradient_from && service.gradient_to
    ? `linear-gradient(145deg, ${service.gradient_from.replace('from-', '')}, ${service.gradient_to.replace('to-', '')})`
    : "linear-gradient(145deg, #A855F7, #EC4899)";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onClick={() => window.location.href = '/services'}
      className="relative group cursor-pointer"
    >
      {/* Apple Card Container */}
      <div
        className={`absolute inset-0 bg-white/80 dark:bg-black/40 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[40px] overflow-hidden transition-all duration-500 shadow-xl flex flex-col
          ${isActive ? "scale-[1.02] shadow-2xl border-white/60 dark:border-white/20" : "scale-100"}
        `}
      >
        {/* 1. IMAGE ON TOP */}
        <div className="relative w-full h-[45%] overflow-hidden rounded-t-[40px] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
          <Icon className="w-12 h-12 text-primary" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* 2. DESCRIPTION IN MIDDLE */}
        <div className="flex-1 p-6 flex flex-col items-center text-center">
          {service.category && (
            <div className="text-[9px] font-black text-[#10B981] uppercase tracking-[0.2em] mb-2">
              {service.category}
            </div>
          )}
          <h3 className="text-xl font-bold text-[#0F172A] dark:text-white leading-tight tracking-tight mb-3">
            {service.title}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 px-4 italic">
            {service.short_description || "High-performance infrastructure logic engineered for Bhutan's top enterprises."}
          </p>

          <AnimatePresence>
            {isActive && service.features && service.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 flex flex-wrap justify-center gap-1.5 relative z-10"
              >
                {service.features.slice(0, 2).map((f, i) => (
                  <span key={i} className="text-[7px] font-bold text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase shadow-sm">
                    {f}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. LEARN MORE LINK */}
        <div className="p-6 pt-0 flex justify-center mt-auto">
          <a
            href="/services"
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            Learn More
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function ServiceDirectoryDynamic() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/website/services");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setServices(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 4 rows × 3 columns = 12 services */}
      <div className="grid grid-cols-3 gap-6 lg:gap-8 max-w-[1400px] mx-auto px-4">
        {services.map((service, index) => (
          <InteractiveHexagon
            key={service.id}
            service={service}
            index={index}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes scan-fast {
          0% { top: -100%; opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
