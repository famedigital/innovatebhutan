"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Cpu, Database, Globe, Shield, Zap } from "lucide-react";

interface ServiceScreen {
  title: string;
  description: string;
  icon: any;
  gradient: string;
}

interface PremiumDeviceFrameProps {
  activeService: 'pos' | 'hotel' | 'security';
  onServiceChange?: (service: 'pos' | 'hotel' | 'security') => void;
}

const serviceScreens: Record<'pos' | 'hotel' | 'security', ServiceScreen> = {
  pos: {
    title: "POS Solutions",
    description: "Enterprise point-of-sale systems",
    icon: Database,
    gradient: "from-emerald-500 via-cyan-500 to-blue-500"
  },
  hotel: {
    title: "Hotel Management",
    description: "Complete property management solutions",
    icon: Globe,
    gradient: "from-green-500 via-teal-500 to-cyan-500"
  },
  security: {
    title: "Security Systems",
    description: "Advanced surveillance and access control",
    icon: Shield,
    gradient: "from-cyan-500 via-blue-500 to-indigo-500"
  }
};

// 3D Animated Background Component
function Animated3DBackground({ gradient }: { gradient: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Floating 3D geometric shapes */}
      <div className="absolute inset-0">
        {/* Large floating spheres */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20"
          style={{
            background: `linear-gradient(135deg, ${gradient})`,
            filter: 'blur(40px)'
          }}
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            x: [0, -15, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-10 w-40 h-40 rounded-full opacity-30"
          style={{
            background: `linear-gradient(135deg, ${gradient})`,
            filter: 'blur(50px)'
          }}
        />
        <motion.div
          animate={{
            y: [0, -25, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-25"
          style={{
            background: `linear-gradient(135deg, ${gradient})`,
            filter: 'blur(60px)'
          }}
        />

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }} />
        </div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${gradient})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}

        {/* Rotating 3D cube effect */}
        <motion.div
          animate={{
            rotateY: [0, 360],
            rotateX: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64"
          style={{
            transformStyle: 'preserve-3d',
            perspective: '1000px'
          }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-xl opacity-10" style={{
              background: `linear-gradient(135deg, ${gradient})`,
              transform: 'translateZ(50px)'
            }} />
            <div className="absolute inset-0 rounded-xl opacity-5" style={{
              background: `linear-gradient(135deg, ${gradient})`,
              transform: 'translateZ(-50px)'
            }} />
          </div>
        </motion.div>
      </div>

      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-900/50 backdrop-blur-sm" />
    </div>
  );
}

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
  const Icon = currentScreen.icon;

  return (
    <div
      className="relative"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Premium Device Mockup Frame with 3D Animation */}
      <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border-2 border-slate-700/50 shadow-2xl overflow-hidden group">
        {/* Device Bezel with green-blue gradient */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
          background: `linear-gradient(135deg, ${currentScreen.gradient})`,
          padding: '2px',
          filter: 'blur(1px)'
        }} />

        {/* Screen Content with 3D Animation Background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeService}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-video bg-slate-950"
          >
            {/* 3D Animated Background */}
            <Animated3DBackground gradient={currentScreen.gradient} />

            {/* Floating icon in center */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-3xl opacity-50"
                     style={{
                       background: `linear-gradient(135deg, ${currentScreen.gradient})`,
                     }}
                />
                <Icon className="relative w-32 h-32 text-white drop-shadow-2xl" />
              </div>
            </motion.div>

            {/* Title Overlay with green-blue gradient */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {currentScreen.title}
                </h3>
                <p className="text-slate-300 text-sm">{currentScreen.description}</p>

                {/* Animated stats/features */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4 mt-4"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Cloud Native</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>Enterprise Security</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows with green-blue hover */}
        <button
          onClick={() => {
            const services: Array<'pos' | 'hotel' | 'security'> = ['pos', 'hotel', 'security'];
            const currentIndex = services.indexOf(activeService);
            const prevIndex = (currentIndex - 1 + services.length) % services.length;
            handleServiceChange(services[prevIndex]);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800/80 backdrop-blur-sm border border-emerald-500/30 hover:border-emerald-500 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-6 h-6 text-emerald-400" />
        </button>
        <button
          onClick={() => {
            const services: Array<'pos' | 'hotel' | 'security'> = ['pos', 'hotel', 'security'];
            const currentIndex = services.indexOf(activeService);
            const nextIndex = (currentIndex + 1) % services.length;
            handleServiceChange(services[nextIndex]);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-500 transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-6 h-6 text-cyan-400" />
        </button>

        {/* Active Indicator with green-blue gradient */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {(['pos', 'hotel', 'security'] as const).map((service) => (
            <button
              key={service}
              onClick={() => handleServiceChange(service)}
              className={`h-1.5 rounded-full transition-all ${
                activeService === service
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 w-8'
                  : 'bg-slate-600 hover:bg-slate-500 w-3'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}