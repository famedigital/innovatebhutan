"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";

/**
 * 🌟 Antigravity-Style Hero Section
 *
 * Minimalist hero with interactive particle grid, inspired by https://antigravity.google
 * Adapted for Innovate Bhutan with emerald green theme.
 *
 * Features:
 * - Grid-based particle system with spring physics
 * - Mouse repulsion effect (magnetic push away)
 * - Smooth return to anchor positions using easing
 * - 60fps buttery-smooth animation
 * - Responsive and performance-optimized
 * - Typewriter effect for headline
 */

interface Particle {
  // Current position
  x: number;
  y: number;
  // Velocity
  vx: number;
  vy: number;
  // Original anchor position (grid position)
  originX: number;
  originY: number;
  // Visual properties
  radius: number;
  opacity: number;
}

export function AntigravityHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  // Typewriter effect state
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "Experience Innovation";

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const typeWriter = () => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
        setTimeout(typeWriter, 100);
      }
    };
    typeWriter();

    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Physics constants (tuned for smooth, premium feel)
  const MOUSE_RADIUS = 150; // Distance at which mouse affects particles
  const MOUSE_FORCE = 3; // How strongly particles are pushed
  const SPRING_TENSION = 0.03; // How quickly particles return to anchor
  const FRICTION = 0.92; // Damping for smooth deceleration
  const GRID_SPACING = 25; // Space between grid points (tighter = more visible)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize grid of particles
    const initGrid = () => {
      particlesRef.current = [];
      const cols = Math.ceil(canvas.width / GRID_SPACING);
      const rows = Math.ceil(canvas.height / GRID_SPACING);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * GRID_SPACING + GRID_SPACING / 2;
          const y = j * GRID_SPACING + GRID_SPACING / 2;

          particlesRef.current.push({
            x,
            y,
            vx: 0,
            vy: 0,
            originX: x,
            originY: y,
            radius: 2,
            opacity: Math.random() * 0.25 + 0.15, // More visible opacity
          });
        }
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGrid();
    };

    resizeCanvas();

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    // Handle touch for mobile
    const handleTouchMove = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    };

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Update each particle
      for (const particle of particlesRef.current) {
        // Calculate distance from mouse
        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply mouse repulsion force
        if (distance < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);

          // Push particle away from mouse
          particle.vx += Math.cos(angle) * force * MOUSE_FORCE;
          particle.vy += Math.sin(angle) * force * MOUSE_FORCE;
        }

        // Spring physics - return to anchor position
        const springDx = particle.originX - particle.x;
        const springDy = particle.originY - particle.y;

        particle.vx += springDx * SPRING_TENSION;
        particle.vy += springDy * SPRING_TENSION;

        // Apply friction for smooth damping
        particle.vx *= FRICTION;
        particle.vy *= FRICTION;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);

        // Color varies with velocity for subtle dynamic effect
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const velocityAlpha = Math.min(speed * 0.1, 0.15);
        ctx.fillStyle = `rgba(16, 185, 129, ${particle.opacity + velocityAlpha})`; // Emerald green
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-950">
      {/* Interactive Particle Grid Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto"
        style={{ opacity: 1 }}
      />

      {/* Content with Parallax */}
      <motion.div
        style={{ y }}
        className="relative z-10 text-center px-4 max-w-5xl mx-auto pointer-events-none"
      >
        {/* Headline with Typewriter Effect */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
        >
          <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
            {typedText}
            <span className={`inline-block w-1 h-12 sm:h-16 md:h-20 lg:h-24 ml-1 align-middle bg-emerald-600 dark:bg-emerald-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Complete IT solutions for Bhutan businesses
          <br />
          From custom software to enterprise systems
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto"
        >
          {/* Primary CTA */}
          <a
            href="#products"
            className="group relative px-8 py-4 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black rounded-full font-semibold text-base sm:text-lg transition-all hover:bg-emerald-700 dark:hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex items-center gap-2">
              Explore Products
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          {/* Secondary CTA */}
          <a
            href="https://wa.me/97517268753"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-transparent border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-semibold text-base sm:text-lg transition-all hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Get in Touch
            </span>
          </a>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-500"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>350+ Clients</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>12+ Years</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pan-Bhutan Support</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-slate-300 dark:border-slate-700 rounded-full flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ scaleY: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
          />
        </motion.div>
      </motion.div>

      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/5 dark:bg-emerald-300/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
