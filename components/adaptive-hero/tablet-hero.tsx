"use client";

import * as React from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Store, Hotel, Shield, Star, Users, Zap, Cloud, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PerformanceTier } from "@/lib/performance-config";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { MorphingBlobCard } from "@/components/ui/morphing-blob-card";
import { BotAnimatedText } from "@/components/ui/bot-animated-text";

interface TabletHeroProps {
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  onContact?: () => void;
  performanceTier: PerformanceTier;
  heroContent?: any;
}

/**
 * Tablet Hero Experience
 *
 * Optimized for tablets with:
 * - Moderate particle effects (50 particles max)
 * - Selective 3D transforms
 * - Enhanced animations
 * - Balanced performance
 */
export function TabletHero({
  heading,
  description,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  onContact,
  performanceTier,
  heroContent,
}: TabletHeroProps) {
  const router = useRouter();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const y = useTransform(scrollY, [0, 400], [0, -100]);

  // Enhanced mountain background for tablet
  const renderMountainBackground = () => (
    <motion.div
      className="absolute inset-0 bg-gradient-to-b from-blue-900 via-purple-900 to-blue-900"
      animate={{
        background: [
          "linear-gradient(to bottom, #1e3a8a, #581c87, #1e3a8a)",
          "linear-gradient(to bottom, #3730a3, #6b21a8, #3730a3)",
          "linear-gradient(to bottom, #1e3a8a, #581c87, #1e3a8a)"
        ]
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* More stars for tablet */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Floating cloud platforms */}
      <AnimatePresence>
        {[1, 2, 3].map((cloudId) => (
          <motion.div
            key={cloudId}
            className="absolute bg-white/10 backdrop-blur-sm rounded-2xl"
            style={{
              left: `${10 + cloudId * 30}%`,
              top: `${15 + cloudId * 5}%`,
              width: `${120 + cloudId * 20}px`,
              height: `${60 + cloudId * 10}px`,
            }}
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 0.15, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 20 + cloudId * 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 rounded-2xl" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Mountain silhouette with enhanced styling */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-slate-800 to-transparent">
        <div className="absolute bottom-0 w-full">
          <div className="absolute bottom-0 left-0 w-1/3 h-32 bg-slate-800 rounded-t-[50%] transform -skew-y-3" />
          <div className="absolute bottom-0 left-1/3 w-1/3 h-40 bg-slate-800 rounded-t-[60%]" />
          <div className="absolute bottom-0 right-0 w-1/3 h-32 bg-slate-800 rounded-t-[50%] transform skew-y-3" />
        </div>
      </div>
    </motion.div>
  );

  // Tablet service cards with enhanced styling
  const tabletServices = [
    {
      id: 'pos',
      name: 'POS Systems',
      icon: Store,
      description: 'Enterprise point-of-sale systems',
      features: ['Real-time processing', 'Inventory management', 'Analytics'],
      gradient: 'from-green-500 to-blue-600',
    },
    {
      id: 'hotel',
      name: 'Hotel Management',
      icon: Hotel,
      description: 'Complete property solutions',
      features: ['Room management', 'Billing system', 'Guest portal'],
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      id: 'security',
      name: 'Security Systems',
      icon: Shield,
      description: 'Advanced surveillance & access',
      features: ['AI monitoring', 'Access control', 'Alert systems'],
      gradient: 'from-purple-500 to-pink-600',
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
      <div className="relative z-10 px-6 py-32 text-center max-w-5xl mx-auto">
        {/* Cyberpunk Animated Text Heading */}
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
            botCount={12}
            respectReducedMotion={true}
          />
        </motion.div>

        {/* Simple, direct subheadline */}
        <motion.h2
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 drop-shadow-lg">
            I Design. You Grow.
          </span>
        </motion.h2>

        {/* Simple, direct description */}
        <motion.p
          className="text-xl text-white font-semibold mb-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Smart business tools. Built by experts. Ready to use.
        </motion.p>

        {/* Trust indicators with enhanced styling */}
        <motion.div
          className="flex flex-wrap justify-center gap-8 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">350+ Clients</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Zap className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">15+ Years</span>
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
            className="text-3xl font-bold text-white/90"
            typeSpeed={100}
            deleteSpeed={50}
            pauseDuration={2000}
            loop={true}
            showCursor={true}
            cursor="|"
          />
        </motion.div>

        {/* CTA Button with enhanced styling */}
        <motion.button
          onClick={handleCTAClick}
          className="relative px-10 py-5 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10 flex items-center gap-2">
            {ctaText}
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.div>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-700/20" />
        </motion.button>

        {/* Services section with enhanced cards */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-8">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {tabletServices.map((service, index) => (
              <MorphingBlobCard
                key={service.id}
                blobColor={service.gradient.includes('green') ? '#10B981' :
                         service.gradient.includes('blue') ? '#3B82F6' : '#8B5CF6'}
                blobIntensity={0.4}
                morphSpeed={0.4}
                hoverIntensity={0.08}
                className="p-6 cursor-pointer group"
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="text-center transform transition-transform duration-300 group-hover:scale-105">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${service.gradient} mb-4`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-xl mb-2">
                    {service.name}
                  </h3>
                  <p className="text-white/70 mb-4">
                    {service.description}
                  </p>
                  <div className="space-y-1">
                    {service.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        className="text-xs text-white/60 flex items-center gap-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 + featureIndex * 0.1 }}
                      >
                        <div className="w-1 h-1 bg-white/40 rounded-full" />
                        {feature}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </MorphingBlobCard>
            ))}
          </div>
        </motion.div>

        {/* Cloud icon decoration */}
        <motion.div
          className="absolute top-32 right-8"
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Cloud className="w-12 h-12 text-white/20" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 15, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-2 h-4 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}