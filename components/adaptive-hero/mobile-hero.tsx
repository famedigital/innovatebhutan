"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Store, Hotel, Shield, Star, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PerformanceTier } from "@/lib/performance-config";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { MorphingBlobCard } from "@/components/ui/morphing-blob-card";
import { BotAnimatedText } from "@/components/ui/bot-animated-text";

interface MobileHeroProps {
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  onContact?: () => void;
  performanceTier: PerformanceTier;
}

/**
 * Mobile Hero Experience
 *
 * Optimized for mobile devices with:
 * - Minimal particle effects (20 particles max)
 * - CSS-only animations
 * - Touch-optimized interactions
 * - Reduced loading complexity
 */
export function MobileHero({
  heading,
  description,
  ctaText,
  ctaLink,
  onContact,
  performanceTier,
}: MobileHeroProps) {
  const router = useRouter();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, -100]);

  // Simplified mountain background for mobile
  const renderMountainBackground = () => (
    <motion.div
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
      {/* Simple stars for mobile */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Mountain silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-800 to-transparent">
        <div className="absolute bottom-0 w-full h-16 bg-slate-800 rounded-t-3xl" />
      </div>
    </motion.div>
  );

  // Mobile service cards
  const mobileServices = [
    {
      id: 'pos',
      name: 'POS Systems',
      icon: Store,
      description: 'Modern retail solutions',
    },
    {
      id: 'hotel',
      name: 'Hotel Management',
      icon: Hotel,
      description: 'Property management systems',
    },
    {
      id: 'security',
      name: 'Security Systems',
      icon: Shield,
      description: 'Advanced surveillance',
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

  return (
    <motion.div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ opacity, y }}
    >
      {/* Background */}
      {renderMountainBackground()}

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 py-20 sm:py-32 text-center max-w-4xl mx-auto">
        {/* Bot Animated Heading - Road/Map Edition */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <BotAnimatedText
            text={heading}
            className="w-full"
            animationSpeed={8}
            botCount={8}
            respectReducedMotion={true}
          />
        </motion.div>

        {/* Animated description - Catchy sales copy */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-2">
            Empowering Your Digital Evolution
          </h2>
          <p className="text-base text-white/90 max-w-2xl mx-auto leading-relaxed">
            Transform your business with cutting-edge technology solutions that drive growth and innovation.
          </p>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-2 text-white/70">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm">350+ Clients</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Zap className="w-5 h-5 text-green-400" />
            <span className="text-sm">99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm">15+ Years</span>
          </div>
        </motion.div>

        {/* Typewriter effect for slogans */}
        <motion.div
          className="mb-12"
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
            className="text-2xl font-bold text-white/90"
            typeSpeed={100}
            deleteSpeed={50}
            pauseDuration={2000}
            loop={true}
            showCursor={true}
            cursor="|"
          />
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={handleCTAClick}
          className="relative px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {ctaText}
            <ArrowRight className="w-4 h-4" />
          </span>
        </motion.button>

        {/* Services section - Touch-friendly cards */}
        <motion.div
          className="mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-8">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mobileServices.map((service, index) => (
              <MorphingBlobCard
                key={service.id}
                blobColor="#10B981"
                blobIntensity={0.3}
                morphSpeed={0.3}
                hoverIntensity={0.05}
                className="p-4 cursor-pointer"
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="text-center">
                  <service.icon className="w-12 h-12 mx-auto mb-3 text-white" />
                  <h3 className="font-semibold text-white text-lg mb-1">
                    {service.name}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {service.description}
                  </p>
                </div>
              </MorphingBlobCard>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}