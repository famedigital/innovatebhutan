"use client";

import * as React from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Store, Hotel, Shield, Star, Users, Zap, Cloud, Building } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PerformanceTier } from "@/lib/performance-config";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { MorphingBlobCard } from "@/components/ui/morphing-blob-card";
import { BotAnimatedText } from "@/components/ui/bot-animated-text";

interface DesktopHeroProps {
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  onContact?: () => void;
  performanceTier: PerformanceTier;
}

/**
 * Desktop Hero Experience
 *
 * Full-featured experience for desktop with:
 * - Maximum particle effects (100+ particles)
 * - Full WebGL support
 * - Advanced interactions
 * - Premium animations and effects
 */
export function DesktopHero({
  heading,
  description,
  ctaText,
  ctaLink,
  onContact,
  performanceTier,
}: DesktopHeroProps) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, -100]);

  // Enhanced mountain background with data flow effects
  const renderPremiumBackground = () => (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900"
      animate={{
        background: [
          "linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)",
          "linear-gradient(to bottom, #1e293b, #334155, #1e293b)",
          "linear-gradient(to bottom, #0f172a, #1e293b, #0f172a)"
        ]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Premium stars with twinkling */}
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 40}%`,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: Math.random() * 4 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Premium cloud platforms with depth */}
      <AnimatePresence>
        {[1, 2, 3].map((cloudId) => (
          <motion.div
            key={cloudId}
            className="absolute bg-white/15 backdrop-blur-sm rounded-2xl border border-white/10"
            style={{
              left: `${10 + cloudId * 30}%`,
              top: `${10 + cloudId * 5}%`,
              width: `${150 + cloudId * 30}px`,
              height: `${70 + cloudId * 15}px`,
            }}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 0.2, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 25 + cloudId * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-white/5 rounded-2xl" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Mountain buildings with data flow effects */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-800 to-transparent">
        <div className="absolute bottom-0 w-full flex justify-around items-end">
          {/* POS Shop */}
          <motion.div
            className="relative w-20 h-24 bg-slate-700 rounded-t-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Building className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 text-green-400" />
            <div className="absolute bottom-2 left-2 right-2 h-1 bg-green-400/50 rounded" />
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>

          {/* Hotel (highest peak) */}
          <motion.div
            className="relative w-24 h-32 bg-slate-700 rounded-t-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Hotel className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 text-blue-400" />
            <div className="absolute bottom-2 left-2 right-2 h-1 bg-blue-400/50 rounded" />
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          </motion.div>

          {/* Security Centre */}
          <motion.div
            className="relative w-20 h-24 bg-slate-700 rounded-t-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Shield className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 text-purple-400" />
            <div className="absolute bottom-2 left-2 right-2 h-1 bg-purple-400/50 rounded" />
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          </motion.div>
        </div>
      </div>

      {/* Data flow particles (enhanced for desktop) */}
      <AnimatePresence>
        {[...Array(performanceTier.particleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
            initial={{
              left: `${Math.random() * 100}%`,
              bottom: '0%',
              opacity: 0,
            }}
            animate={{
              left: `${20 + Math.random() * 60}%`,
              bottom: '60%',
              opacity: [0, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );

  // Premium service showcase
  const desktopServices = [
    {
      id: 'pos',
      name: 'POS Systems',
      icon: Store,
      description: 'Enterprise point-of-sale systems',
      features: ['Real-time processing', 'Inventory management', 'Advanced analytics'],
      gradient: 'from-green-500 to-blue-600',
      stats: '99.9% uptime',
    },
    {
      id: 'hotel',
      name: 'Hotel Management',
      icon: Hotel,
      description: 'Complete property solutions',
      features: ['Room management', 'Billing system', 'Guest portal'],
      gradient: 'from-blue-500 to-purple-600',
      stats: '500+ hotels',
    },
    {
      id: 'security',
      name: 'Security Systems',
      icon: Shield,
      description: 'Advanced surveillance & access',
      features: ['AI monitoring', 'Access control', 'Real-time alerts'],
      gradient: 'from-purple-500 to-pink-600',
      stats: '24/7 monitoring',
    },
  ];

  const handleServiceClick = (serviceId: string) => {
    router.push(`/services#${serviceId}`);
  };

  const handleCTAClick = () => {
    if (ctaLink) {
      router.push(ctaLink);
    } else if (onContact) {
      onContact();
    }
  };

  // Mouse interaction effects
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ opacity, y }}
    >
      {/* Background */}
      {renderPremiumBackground()}

      {/* Mouse interaction overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            circle at ${mousePosition.x / window.innerWidth * 100}% ${mousePosition.y / window.innerHeight * 100}%,
            rgba(16, 185, 129, 0.1) 0%,
            transparent 50%
          )`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-8 py-32 text-center max-w-6xl mx-auto">
        {/* Bot Animated Heading - Road/Map Edition */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <BotAnimatedText
            text={heading}
            className="w-full"
            animationSpeed={8}
            botCount={20}
            respectReducedMotion={true}
          />
        </motion.div>

        {/* Animated description - Catchy sales copy */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4">
            Empowering Your Digital Evolution
          </h2>
          <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            Transform your business with cutting-edge technology solutions that drive growth, innovation, and success in the digital age.
          </p>
        </motion.div>

        {/* Premium trust indicators */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <Star className="w-6 h-6 text-yellow-400" />
            <div>
              <div className="text-white font-bold text-lg">350+ Clients</div>
              <div className="text-white/60 text-sm">Trusted enterprises</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <Zap className="w-6 h-6 text-green-400" />
            <div>
              <div className="text-white font-bold text-lg">99.9% Uptime</div>
              <div className="text-white/60 text-sm">Reliable service</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <Users className="w-6 h-6 text-blue-400" />
            <div>
              <div className="text-white font-bold text-lg">15+ Years</div>
              <div className="text-white/60 text-sm">Industry experience</div>
            </div>
          </div>
        </motion.div>

        {/* Typewriter effect with enhanced styling */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <TypewriterEffect
            words={[
              "Digital Transformation",
              "Innovative Solutions",
              "Future-Ready Technology",
              "Bhutan's Digital Future"
            ]}
            className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
            typeSpeed={100}
            deleteSpeed={50}
            pauseDuration={2000}
            loop={true}
            showCursor={true}
            cursor="|"
          />
        </motion.div>

        {/* Premium CTA Button */}
        <motion.button
          onClick={handleCTAClick}
          className="relative px-12 py-6 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden group"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10 flex items-center gap-3">
            {ctaText}
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-700/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>

        {/* Premium services showcase */}
        <motion.div
          className="mt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-4xl font-bold text-white mb-12">Our Premium Services</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {desktopServices.map((service, index) => (
              <MorphingBlobCard
                key={service.id}
                blobColor={service.gradient.includes('green') ? '#10B981' :
                         service.gradient.includes('blue') ? '#3B82F6' : '#8B5CF6'}
                blobIntensity={0.6}
                morphSpeed={0.5}
                hoverIntensity={0.1}
                className="p-8 cursor-pointer group transform transition-all duration-300 hover:scale-105"
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="text-center transform transition-transform duration-300 group-hover:scale-105">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${service.gradient} mb-6 shadow-lg`}>
                    <service.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-2xl mb-3">
                    {service.name}
                  </h3>
                  <p className="text-white/80 mb-6 text-lg">
                    {service.description}
                  </p>
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        className="text-sm text-white/70 flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + featureIndex * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-white/40 rounded-full" />
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-xs text-white/50 bg-white/10 rounded-full px-4 py-2 inline-block">
                    {service.stats}
                  </div>
                </div>
              </MorphingBlobCard>
            ))}
          </div>
        </motion.div>

        {/* Premium decorations */}
        <motion.div
          className="absolute top-40 right-16"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Cloud className="w-16 h-16 text-white/20" />
        </motion.div>

        <motion.div
          className="absolute bottom-32 left-16"
          animate={{
            x: [0, 20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Building className="w-12 h-12 text-white/15" />
        </motion.div>

        {/* Premium scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-10 h-16 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-2 h-6 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}