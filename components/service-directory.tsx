"use client";

import { useState } from "react";
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
  Users
} from "lucide-react";

// 12 Main Services from the service page
const services = [
  { id: "pos", name: "POS Solutions", category: "POS", icon: Store, metric: "Smart Selling", features: ["Multi-store", "Real-time Analytics", "Cloud-Based"], desc: "Modern point-of-sale systems for retail and hospitality.", gradient: "linear-gradient(145deg, #FF6B35, #DC2626, #B91C1C)" },
  { id: "hotel", name: "Hotel PMS", category: "POS", icon: Hotel, metric: "Complete", features: ["Booking Engine", "Housekeeping", "Front Desk"], desc: "Property management for hotels and hospitality.", gradient: "linear-gradient(145deg, #3B82F6, #4F46E5, #4338CA)" },
  { id: "web", name: "Web Development", category: "WEB", icon: Code, metric: "Modern", features: ["React", "Next.js", "TypeScript"], desc: "Custom web applications with modern frameworks.", gradient: "linear-gradient(145deg, #A855F7, #EC4899, #DB2777)" },
  { id: "saas", name: "SaaS Development", category: "WEB", icon: Database, metric: "Scalable", features: ["Multi-tenant", "API Design", "Cloud"], desc: "Scalable SaaS platforms with cloud deployment.", gradient: "linear-gradient(145deg, #8B5CF6, #7C3AED, #6D28D9)" },
  { id: "erp", name: "ERP Development", category: "WEB", icon: LayoutGrid, metric: "Enterprise", features: ["Finance", "HR", "Supply Chain"], desc: "Enterprise resource planning solutions.", gradient: "linear-gradient(145deg, #6366F1, #2563EB, #1D4ED8)" },
  { id: "mobile", name: "Mobile Apps", category: "WEB", icon: Smartphone, metric: "iOS/Android", features: ["React Native", "Cross-platform", "App Store"], desc: "Native mobile applications for all platforms.", gradient: "linear-gradient(145deg, #14B8A6, #0891B2, #0E7490)" },
  { id: "infra", name: "Infrastructure", category: "INFRA", icon: Wrench, metric: "Robust", features: ["Servers", "Network", "Power Backup"], desc: "Complete IT infrastructure solutions.", gradient: "linear-gradient(145deg, #64748B, #71717A, #52525B)" },
  { id: "security", name: "Security Systems", category: "SECURITY", icon: Shield, metric: "Advanced", features: ["CCTV", "Access Control", "Alarms"], desc: "Advanced security and surveillance systems.", gradient: "linear-gradient(145deg, #EF4444, #E11D48, #BE123C)" },
  { id: "maintenance", name: "IT Maintenance", category: "SUPPORT", icon: Zap, metric: "24/7", features: ["On-site", "Remote", "Preventive"], desc: "Ongoing technical support and monitoring.", gradient: "linear-gradient(145deg, #22C55E, #10B981, #059669)" },
  { id: "payroll", name: "Payroll & HR", category: "WEB", icon: Users, metric: "Smart HR", features: ["Payroll", "Attendance", "Compliance"], desc: "White-label HR and payroll management.", gradient: "linear-gradient(145deg, #F43F5E, #EC4899, #BE185D)" },
  { id: "gst", name: "GST Services", category: "BUSINESS", icon: FileText, metric: "Tax Compliance", features: ["Registration", "Filing", "Consulting"], desc: "Complete GST services and tax compliance.", gradient: "linear-gradient(145deg, #EAB308, #D97706, #B45309)" },
  { id: "consulting", name: "IT Consulting", category: "CONSULTING", icon: Users, metric: "Strategic", features: ["Planning", "Advisory", "Roadmap"], desc: "Strategic IT consulting and digital transformation.", gradient: "linear-gradient(145deg, #06B6D4, #3B82F6, #2563EB)" },
];

function InteractiveHexagon({ service, index, setSelectedVideo }: { service: typeof services[0], index: number, setSelectedVideo: (v: string) => void }) {
  const [isActive, setIsActive] = useState(false);
  const Icon = service.icon;

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
          <div className="text-[9px] font-black text-[#10B981] uppercase tracking-[0.2em] mb-2">{service.category}</div>
          <h3 className="text-xl font-bold text-[#0F172A] dark:text-white leading-tight tracking-tight mb-3">
            {service.name}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 px-4 italic">
            "High-performance infrastructure logic engineered for Bhutan's top enterprises."
          </p>
          
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 flex flex-wrap justify-center gap-1.5 relative z-10"
              >
                {service.features.slice(0, 2).map(f => (
                  <span key={f} className="text-[7px] font-bold text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase shadow-sm">
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

export function ServiceDirectory() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <div className="w-full">
      {/* 4 rows × 3 columns = 12 services */}
      <div className="grid grid-cols-3 gap-6 lg:gap-8 max-w-[1400px] mx-auto px-4">
        {services.map((service, index) => (
          <InteractiveHexagon
            key={service.id}
            service={service}
            index={index}
            setSelectedVideo={setSelectedVideo}
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
      
      {/* Video Modal UI */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl"
          >
            <div className="absolute inset-0" onClick={() => setSelectedVideo(null)} />
            <motion.div
              initial={{ scale: 0.9, y: 50, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 50, rotateX: 20 }}
              className="relative w-full max-w-5xl aspect-video bg-[#020617] rounded-[2rem] overflow-hidden shadow-[0_0_120px_rgba(57,255,20,0.25)] border border-primary/30"
            >
              <button 
                onClick={() => setSelectedVideo(null)}
                className="absolute top-8 right-8 z-10 w-12 h-12 bg-black/60 hover:bg-primary text-white hover:text-[#020617] rounded-full flex items-center justify-center transition-all border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                src={selectedVideo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
