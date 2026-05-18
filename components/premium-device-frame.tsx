"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ServiceScreen {
  image: string;
  title: string;
  description: string;
}

interface PremiumDeviceFrameProps {
  activeService: 'pos' | 'hotel' | 'security';
  onServiceChange?: (service: 'pos' | 'hotel' | 'security') => void;
}

const serviceScreens: Record<'pos' | 'hotel' | 'security', ServiceScreen> = {
  pos: {
    image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964123/INNOVATES1_1_ewtzh1.png",
    title: "POS Solutions",
    description: "Enterprise point-of-sale systems"
  },
  hotel: {
    image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964294/INNOVATES1_2_tttgan.png",
    title: "Hotel Management",
    description: "Complete property management solutions"
  },
  security: {
    image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964337/INNOVATES1_3_jpz8dy.png",
    title: "Security Systems",
    description: "Advanced surveillance and access control"
  }
};

export function PremiumDeviceFrame({ activeService, onServiceChange }: PremiumDeviceFrameProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-rotate through services every 5 seconds
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      const services: Array<'pos' | 'hotel' | 'security'> = ['pos', 'hotel', 'security'];
      const currentIndex = services.indexOf(activeService);
      const nextIndex = (currentIndex + 1) % services.length;
      handleServiceChange(services[nextIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeService, autoPlay]);

  const handleServiceChange = (service: 'pos' | 'hotel' | 'security') => {
    setIsTransitioning(true);
    setTimeout(() => {
      onServiceChange?.(service);
      setIsTransitioning(false);
    }, 300); // Smooth 300ms cross-fade
  };

  const currentScreen = serviceScreens[activeService];

  return (
    <div
      className="relative"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Premium Device Mockup Frame */}
      <div className="relative bg-slate-900 rounded-2xl border-2 border-slate-700/50 shadow-2xl overflow-hidden group">
        {/* Device Bezel */}
        <div className="absolute inset-0 border-4 border-slate-800 rounded-2xl pointer-events-none" />

        {/* Screen Content with Cross-Fade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-video"
          >
            <img
              src={currentScreen.image}
              alt={currentScreen.title}
              className="w-full h-full object-cover"
            />
            {/* Subtle Loading Animation Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"
            />
            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <h3 className="text-white text-sm font-semibold">{currentScreen.title}</h3>
              <p className="text-white/70 text-xs">{currentScreen.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={() => {
            const services: Array<'pos' | 'hotel' | 'security'> = ['pos', 'hotel', 'security'];
            const currentIndex = services.indexOf(activeService);
            const prevIndex = (currentIndex - 1 + services.length) % services.length;
            handleServiceChange(services[prevIndex]);
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => {
            const services: Array<'pos' | 'hotel' | 'security'> = ['pos', 'hotel', 'security'];
            const currentIndex = services.indexOf(activeService);
            const nextIndex = (currentIndex + 1) % services.length;
            handleServiceChange(services[nextIndex]);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>

        {/* Active Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {(['pos', 'hotel', 'security'] as const).map((service) => (
            <button
              key={service}
              onClick={() => handleServiceChange(service)}
              className={`h-1 rounded-full transition-all ${
                activeService === service
                  ? 'bg-cyan-500 w-6'
                  : 'bg-white/30 hover:bg-white/50 w-3'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}