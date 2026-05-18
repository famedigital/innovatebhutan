"use client";

import { useState, useEffect, useRef } from "react";
import { Engineering3DSlider } from "@/components/3d-engineering-slider/Engineering3DSlider";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * 🚀 PREMIUM ANTIGRAVITY HERO
 * Google-style physics-based floating animations
 * Everything responds to your mouse with gravity-defying smoothness
 */
export function PremiumHeroSlider({
  heading,
  description: descProp,
  ctaText,
  ctaLink,
  onContact
}: any = {}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Physics-based spring values for premium smooth animation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = {
    stiffness: 150,
    damping: 20,
    mass: 0.5
  };

  // Smooth mouse tracking with spring physics
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -150]);
  const y2 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Track mouse with smooth interpolation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      mouseX.set(x * 100);
      mouseY.set(y * 100);
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    setIsLoaded(true);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Floating animation variants
  const floatVariants = {
    animate: (custom: number) => ({
      y: [0, -custom * 2, 0],
      rotate: [0, custom * 0.5, 0],
      transition: {
        duration: 4 + custom * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: custom * 0.2
      }
    })
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black"
      style={{ cursor: 'none' }}
    >
      {/* Premium Cursor with Trail Effect */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full border-2 border-[#39FF14] pointer-events-none z-[100]"
        style={{
          x: useSpring(mouseX, { stiffness: 200, damping: 25 }),
          y: useSpring(mouseY, { stiffness: 200, damping: 25 }),
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 rounded-full bg-[#39FF14] pointer-events-none z-[100] mix-blend-difference"
        style={{
          x: useSpring(mouseX, { stiffness: 100, damping: 30 }),
          y: useSpring(mouseY, { stiffness: 100, damping: 30 }),
        }}
      />

      {/* 3D Background with Antigravity Effect */}
      <div className="absolute inset-0">
        <Engineering3DSlider autoPlayInterval={25000} onServiceChange={() => {}} />
      </div>

      {/* Premium Floating Typography */}
      <motion.div
        style={{
          y: y1,
          opacity
        }}
        className="relative z-10 h-full flex items-center justify-center"
      >
        <div className="relative">
          {/* Floating Words - Each responds differently to mouse */}
          <motion.div
            className="relative"
            style={{
              x: useTransform(smoothMouseX, (x) => x * -0.5),
              y: useTransform(smoothMouseY, (y) => y * -0.3),
            }}
          >
            <motion.h1
              initial={{ y: 150, opacity: 0, rotateX: -15 }}
              animate={isLoaded ? { y: 0, opacity: 1, rotateX: 0 } : {}}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[16vw] leading-[0.9] font-black text-white tracking-tighter"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                textShadow: '0 0 80px rgba(57, 255, 20, 0.3)',
                filter: 'url(#glow)',
              }}
            >
              WE BUILD
            </motion.h1>
          </motion.div>

          <motion.div
            className="relative -mt-4"
            style={{
              x: useTransform(smoothMouseX, (x) => x * 0.5),
              y: useTransform(smoothMouseY, (y) => y * 0.3),
            }}
          >
            <motion.h1
              initial={{ y: 150, opacity: 0, rotateX: -15 }}
              animate={isLoaded ? { y: 0, opacity: 1, rotateX: 0 } : {}}
              transition={{ duration: 1.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[16vw] leading-[0.9] font-black"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                background: 'linear-gradient(135deg, #39FF14 0%, #10B981 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'url(#glow)',
              }}
            >
              DIGITAL
            </motion.h1>
          </motion.div>

          <motion.div
            className="relative -mt-4"
            style={{
              x: useTransform(smoothMouseX, (x) => x * -0.3),
              y: useTransform(smoothMouseY, (y) => y * -0.2),
            }}
          >
            <motion.h1
              initial={{ y: 150, opacity: 0, rotateX: -15 }}
              animate={isLoaded ? { y: 0, opacity: 1, rotateX: 0 } : {}}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[16vw] leading-[0.9] font-black text-white"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                opacity: 0.95,
                filter: 'url(#glow)',
              }}
            >
              WORLDS
            </motion.h1>
          </motion.div>

          {/* Floating Geometric Shapes with Physics */}
          <motion.div
            className="absolute -right-32 top-1/3 w-32 h-32"
            variants={floatVariants}
            custom={1}
            style={{
              x: useTransform(smoothMouseX, (x) => x * 0.8),
              y: useTransform(smoothMouseY, (y) => y * 0.6),
            }}
          >
            <div className="w-full h-full border-2 border-[#39FF14] rotate-45"
                 style={{ boxShadow: '0 0 40px rgba(57, 255, 20, 0.3)' }} />
          </motion.div>

          <motion.div
            className="absolute -left-24 bottom-1/4 w-20 h-20 rounded-full"
            variants={floatVariants}
            custom={2}
            style={{
              x: useTransform(smoothMouseX, (x) => x * -0.6),
              y: useTransform(smoothMouseY, (y) => y * -0.4),
            }}
          >
            <div className="w-full h-full rounded-full border-2 border-[#10B981]"
                 style={{ boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }} />
          </motion.div>

          <motion.div
            className="absolute right-1/4 bottom-1/3 w-16 h-16"
            variants={floatVariants}
            custom={3}
            style={{
              x: useTransform(smoothMouseX, (x) => x * 0.4),
              y: useTransform(smoothMouseY, (y) => y * 0.3),
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-[#06B6D4] to-[#39FF14] opacity-20 rounded-lg"
                 style={{ filter: 'blur(20px)' }} />
          </motion.div>

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#39FF14]"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
                opacity: 0.6,
              }}
              variants={floatVariants}
              custom={i + 4}
              animate={{
                y: [0, -30 - i * 5, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom Tagline with Hover Effect */}
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-20 left-20 z-20"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={isLoaded ? { opacity: 0.8, x: 0 } : {}}
          transition={{ delay: 0.8, duration: 1, type: "spring", stiffness: 100 }}
          className="text-sm text-white tracking-[0.3em] uppercase font-semibold"
        >
          Bhutan's Premier Technology Partner
        </motion.p>
      </motion.div>

      {/* Premium CTA with Hover Animation */}
      <motion.div
        className="absolute bottom-20 right-20 z-20"
        initial={{ opacity: 0, x: 30 }}
        animate={isLoaded ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 1, duration: 1, type: "spring", stiffness: 100 }}
      >
        <motion.button
          onClick={() => router.push('/company/contact')}
          className="group relative px-14 py-6 bg-transparent"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-[#39FF14]"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
          />

          {/* Text with color transition */}
          <span className="relative z-10 text-white group-hover:text-black font-bold tracking-[0.2em] text-xs uppercase flex items-center gap-3 transition-colors duration-300">
            Start Your Project
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </span>

          {/* Bottom border */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#39FF14]" />

          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-[#39FF14] blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
          />
        </motion.button>
      </motion.div>

      {/* SVG Filters for Premium Effects */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Cinematic Grain */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Premium Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)'
        }}
      />
    </div>
  );
}