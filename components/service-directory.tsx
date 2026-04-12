"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  Play, 
  X,
  Monitor,
  Database,
  Cable,
  Settings,
  Hammer,
  Layers,
  Zap,
  Cpu
} from "lucide-react";

const services = [
  { id: "pos-1", name: "POS Engineering", category: "POS", icon: Monitor, metric: "350+ Nodes", features: ["RanceLab Sync", "Tysso Tuned"], desc: "Multi-branch checkout architecture.", video: "https://www.youtube.com/embed/65K5377k9MM", image: "/services/innovatedisplay.jpeg" },
  { id: "data-1", name: "SaaS Transformation", category: "DATA", icon: Database, metric: "Enterprise", features: ["Next.js/Supabase", "Cloud Logic"], desc: "Custom digital infrastructure.", video: "https://www.youtube.com/embed/OK_jNwG1sEQ", image: "/services/Gemini_Generated_Image_oc1f17oc1f17oc1f.png" },
  { id: "net-1", name: "Fiber Backbone", category: "NET", icon: Cable, metric: "99.9% Up", features: ["Fiber Splicing", "WiFi 6 Mesh"], desc: "High-speed network meshes.", video: "https://www.youtube.com/embed/2gqQ7TCzRjk", image: "/services/Gemini_Generated_Image_f8csorf8csorf8cs.png" },
  { id: "it-1", name: "Managed IT Support", category: "IT", icon: Settings, metric: "24/7 Link", features: ["Remote Diag", "On-site Ops"], desc: "Foundational tech residency.", video: "https://www.youtube.com/embed/DRE_2-WvGgM", image: "/services/Gemini_Generated_Image_gnvqwhgnvqwhgnvq.png" },
  { id: "labor-1", name: "Infra Deployment", category: "LABOR", icon: Hammer, metric: "Precision", features: ["Wire Casing", "Casing Fit"], desc: "Physical hardware mounting.", video: "https://www.youtube.com/embed/Gemini_Generated_Image_lz86e8lz86e8lz86.png", image: "/services/Gemini_Generated_Image_lz86e8lz86e8lz86.png" },
  { id: "labor-2", name: "Server Racking", category: "LABOR", icon: Layers, metric: "Scale", features: ["UPS Calib", "Rack Mount"], desc: "Physical lab deployments.", video: "https://www.youtube.com/embed/65K5377k9MM", image: "/services/Gemini_Generated_Image_sv9u0esv9u0esv9u.png" },
  { id: "labor-3", name: "Perimeter Hardware", category: "LABOR", icon: Zap, metric: "Armor", features: ["CCTV Fit", "Gate Sync"], desc: "Physical security mounting.", video: "https://www.youtube.com/embed/p3W6r0x6kYI", image: "/services/survilance guardian.jpeg" },
  { id: "optics-1", name: "Neural Surveillance", category: "SEC", icon: Cpu, metric: "AI Viz", features: ["4K Detection", "Biometrics"], desc: "Advanced vision systems.", video: "https://www.youtube.com/embed/p3W6r0x6kYI", image: "/services/Gemini_Generated_Image_oc1f17oc1f17oc1f.png" },
];

function InteractiveHexagon({ service, index, setSelectedVideo }: { service: typeof services[0], index: number, setSelectedVideo: (v: string) => void }) {
  const [isActive, setIsActive] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], ["5deg", "-5deg"]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], ["-5deg", "5deg"]), { stiffness: 100, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => { setIsActive(false); x.set(0); y.set(0); }}
      className="relative group h-[420px] cursor-pointer"
    >
      {/* Apple Card Container */}
      <div 
        className={`absolute inset-0 bg-white/80 dark:bg-black/40 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[40px] overflow-hidden transition-all duration-500 shadow-xl flex flex-col
          ${isActive ? "scale-[1.02] shadow-2xl border-white/60 dark:border-white/20" : "scale-100"}
        `}
      >
        {/* 1. IMAGE ON TOP */}
        <div className="relative w-full h-[45%] overflow-hidden rounded-t-[40px]">
          <img 
            src={service.image} 
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
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
                className="mt-4 flex flex-wrap justify-center gap-1.5"
              >
                {service.features.slice(0, 2).map(f => (
                  <span key={f} className="text-[7px] font-bold text-slate-500 dark:text-white/40 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full uppercase">
                    {f}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. LAST ICON CLICK */}
        <div className="p-6 pt-0 flex justify-center mt-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedVideo(service.video); }}
            className="w-16 h-16 rounded-full bg-[#10B981]/10 dark:bg-white/5 border border-[#10B981]/20 dark:border-white/10 flex items-center justify-center group/btn hover:bg-[#10B981] hover:border-[#10B981] transition-all duration-500 shadow-lg active:scale-90"
          >
            <Icon className="w-6 h-6 text-[#10B981] dark:text-white group-hover/btn:text-white transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function ServiceDirectory() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8 max-w-[1400px] mx-auto">
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
