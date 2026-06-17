"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Target, Eye, Award, Users, MapPin, Calendar, CheckCircle2,
  ArrowRight, Star, Globe, TrendingUp, Zap, Shield, Code2,
  Camera, Network, Database, Wrench, Clock, Building2,
  Server, Smartphone, HeadphonesIcon, FileText, BarChart
} from "lucide-react";
import { getMediaUrl } from "@/lib/cloudinary";
import { useState, useEffect, useRef } from "react";
import { CompanyPhotoGallery } from "@/components/company-photo-gallery";

// Unused components removed - now using CompanyPhotoGallery
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  radius: number;
  opacity: number;
}

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();
  const [isMounted, setIsMounted] = useState(false);

  const MOUSE_RADIUS = 150;
  const MOUSE_FORCE = 3;
  const SPRING_TENSION = 0.03;
  const FRICTION = 0.92;
  const GRID_SPACING = 25;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
            opacity: Math.random() * 0.25 + 0.15,
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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      for (const particle of particlesRef.current) {
        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);

          particle.vx += Math.cos(angle) * force * MOUSE_FORCE;
          particle.vy += Math.sin(angle) * force * MOUSE_FORCE;
        }

        const springDx = particle.originX - particle.x;
        const springDy = particle.originY - particle.y;

        particle.vx += springDx * SPRING_TENSION;
        particle.vy += springDy * SPRING_TENSION;

        particle.vx *= FRICTION;
        particle.vy *= FRICTION;

        particle.x += particle.vx;
        particle.y += particle.vy;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);

        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const velocityAlpha = Math.min(speed * 0.1, 0.15);
        ctx.fillStyle = `rgba(16, 185, 129, ${particle.opacity + velocityAlpha})`;
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
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ opacity: 0.8 }}
    />
  );
}

// 🖼️ All Cloudinary Images for Premium Slideshow
const heroImages = [
  getMediaUrl('innovate_bhutan/services_main_hero', false, true),
  getMediaUrl('innovate_bhutan/pos_engineering', false, true),
  getMediaUrl('innovate_bhutan/biometric_id', false, true),
  getMediaUrl('innovate_bhutan/hospitality_tech', false, true),
  getMediaUrl('innovate_bhutan/network_flow', false, true),
  getMediaUrl('innovate_bhutan/security_ai_node', false, true),
  getMediaUrl('innovate_bhutan/surveillance_ai', false, true),
  getMediaUrl('innovate_bhutan/software_dev', false, true),
  getMediaUrl('innovate_bhutan/power_resilience', false, true),
];

// 🌟 Modern Premium Hero Section
function ModernHero() {
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "innovates.bt";

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const typeWriter = () => {
      if (i < fullText.length) {
        setTypedText(fullText.substring(0, i + 1));
        i++;
        setTimeout(typeWriter, 150);
      }
    };
    typeWriter();

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white dark:from-black dark:via-slate-950 dark:to-black">
      {/* Interactive Particle Background */}
      <ParticleBackground />

      {/* Ambient Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/5 rounded-full blur-[150px]" />
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-2xl"
            initial={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              scale: 0,
            }}
            animate={{
              left: [`${Math.random() * 80 + 10}%`, `${Math.random() * 80 + 10}%`],
              top: [`${Math.random() * 80 + 10}%`, `${Math.random() * 80 + 10}%`],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-white/10 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/30 rounded-full mb-8 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-current" />
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-700 dark:text-slate-300">
            Trusted Since 2012 • 300+ Businesses
          </span>
        </motion.div>

        {/* Main Title with Typewriter */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 tracking-tight"
        >
          <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 dark:from-emerald-400 dark:via-emerald-300 dark:to-emerald-200 bg-clip-text text-transparent">
            {typedText}
            <span className={`inline-block w-2 h-16 sm:h-20 md:h-24 lg:h-32 ml-2 align-middle bg-emerald-600 dark:bg-emerald-400 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6"
        >
          Premium Technology Solutions for{" "}
          <span className="text-emerald-600 dark:text-emerald-400">Modern Enterprises</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          For over 12 years, we've been Bhutan's trusted partner for enterprise technology solutions.
          From ERP implementations to custom software development, we empower businesses with cutting-edge tools.
        </motion.p>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-12"
        >
          {[
            { number: "12+", label: "Years Experience" },
            { number: "300+", label: "Happy Clients" },
            { number: "500+", label: "Projects Delivered" },
            { number: "99%", label: "Satisfaction" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {stat.number}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="https://wa.me/97517268753"
            className="group relative px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white dark:text-black font-black uppercase text-xs tracking-widest rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50"
          >
            <span className="relative flex items-center gap-3">
              Start Your Project
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>

          <a
            href="/services"
            className="px-10 py-5 bg-white/80 dark:bg-white/10 backdrop-blur-xl border-2 border-slate-200 dark:border-white/20 text-slate-800 dark:text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all hover:scale-105 hover:shadow-xl"
          >
            Explore Services
          </a>
        </motion.div>

        {/* Trust Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-50"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Trusted Partners:
          </div>
          {['Rancelab', 'Microsoft', 'Cisco', 'Dell', 'HP'].map((partner, i) => (
            <div key={i} className="text-sm font-bold text-slate-600 dark:text-slate-400">
              {partner}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
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
    </section>
  );
}

// 🎯 SEO-Optimized Service Data
const coreServices = [
  {
    icon: Database,
    title: "Rancelab ERP Solutions",
    description: "Bhutan's leading ERP implementation partner with 300+ active installations across Thimphu, Paro, and Punakha. Enterprise-grade resource planning for seamless business operations.",
    features: ["300+ Active Members", "12+ Years Expertise", "24/7 Support", "Custom Implementations"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Code2,
    title: "Custom Software Development",
    description: "Bespoke ERP solutions starting at Nu. 100,000. Complete whitelabel systems including Payroll, HR, Accounting, Projects, Operations, and Audit modules with scalable architecture.",
    features: ["From Nu. 1 Lakh", "Whitelabel Ready", "Modular Design", "Custom Analytics"],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Camera,
    title: "CCTV & Security Systems",
    description: "Professional surveillance installations with AI-powered analytics. Protect your business with cutting-edge security technology and remote monitoring capabilities.",
    features: ["HD Quality", "Night Vision", "Mobile Access", "Cloud Storage"],
    color: "from-red-500 to-orange-500"
  },
  {
    icon: Network,
    title: "Networking Infrastructure",
    description: "Enterprise networking solutions for seamless connectivity. Structured cabling, WiFi deployment, and network security for businesses of all sizes.",
    features: ["High-Speed Fiber", "Network Security", "WiFi Solutions", "24/7 Monitoring"],
    color: "from-green-500 to-emerald-500"
  }
];

// 📊 Updated Achievements
const achievements = [
  { number: "12+", label: "Years Experience", sub: "Since 2012", icon: Calendar },
  { number: "300+", label: "Active ERP Members", sub: "Across Bhutan", icon: Users },
  { number: "500+", label: "Projects Delivered", sub: "Successfully", icon: Award },
  { number: "99%", label: "Client Satisfaction", sub: "Retention Rate", icon: Star },
  { number: "24/7", label: "Support Available", sub: "Always Online", icon: HeadphonesIcon },
  { number: "3+", label: "Major Cities", sub: "Thimphu, Paro, Punakha", icon: MapPin }
];

// 🏆 Updated Timeline
const timeline = [
  { year: "2012", title: "Foundation", description: "Established as Bhutan's premier IT solutions provider, focusing on enterprise software and networking infrastructure.", icon: Building2 },
  { year: "2015", title: "Rancelab Partnership", description: "Became authorized Rancelab ERP partner, revolutionizing business automation across Bhutan with enterprise-grade solutions.", icon: Database },
  { year: "2018", title: "Expansion", description: "Expanded operations to Paro and Punakha, establishing comprehensive service coverage in western Bhutan.", icon: MapPin },
  { year: "2020", title: "Security Division", description: "Launched professional CCTV and security systems division, integrating AI-powered surveillance for businesses.", icon: Camera },
  { year: "2022", title: "Custom Development", description: "Introduced custom software development services, creating whitelabel ERP solutions starting at Nu. 100,000.", icon: Code2 },
  { year: "2024", title: "Digital Transformation", description: "Achieved 300+ active ERP installations, becoming Bhutan's largest Rancelab implementation partner.", icon: TrendingUp }
];

// 💼 Updated Values
const values = [
  {
    icon: Shield,
    title: "Reliability",
    description: "12 years of consistent service delivery with 99% client satisfaction. Your business continuity is our priority.",
    color: "text-blue-500"
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Cutting-edge technology solutions including AI-powered security, custom ERP development, and cloud-based systems.",
    color: "text-yellow-500"
  },
  {
    icon: Users,
    title: "Expert Team",
    description: "Certified professionals with deep expertise in Rancelab ERP, networking, and software development.",
    color: "text-green-500"
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "Industry-best practices with comprehensive testing, training, and post-deployment support for all solutions.",
    color: "text-purple-500"
  }
];

// 🎨 Animated Counter Component
function AnimatedCounter({ end, duration = 2 }: { end: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const numericEnd = parseInt(end.replace(/\D/g, '')) || 0;

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * numericEnd));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [numericEnd, duration]);

  return <span>{end.replace(/\d+/, count.toString())}</span>;
}

// 🎯 Scroll Animation Component
function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export function CompanyContent() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">

      {/* 📸 APPLE-STYLE PHOTO GALLERY */}
      <CompanyPhotoGallery />

      {/* 🎯 CORE SERVICES SECTION */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-4">What We Offer</h2>
              <p className="text-4xl lg:text-5xl font-black text-foreground dark:neon-text tracking-tight mb-4">
                Premium Technology Solutions
              </p>
              <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
                Comprehensive IT services tailored for Bhutanese businesses, from enterprise ERP to custom software development
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-8">
            {coreServices.map((service, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative bg-card rounded-3xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                  <div className="relative p-8">
                    <div className="flex items-start gap-6 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} p-0.5`}>
                        <div className="w-full h-full bg-card rounded-xl flex items-center justify-center">
                          <service.icon className="w-8 h-8 text-foreground" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-2">{service.title}</h3>
                        <p className="text-sm text-foreground/60 leading-relaxed">{service.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {service.features.map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-xs text-foreground/50">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 🏆 VALUES SECTION */}
      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-4">Why Choose Us</h2>
              <p className="text-4xl lg:text-5xl font-black text-foreground dark:neon-text tracking-tight">
                The <span className="text-primary">innovates.bt</span>{" "}
                <span className="text-primary">Difference</span>
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="bg-background rounded-3xl p-8 text-center border border-border hover:border-primary/30 transition-all duration-500 group"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/10 transition-colors"
                  >
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </motion.div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-3">{value.title}</h3>
                  <p className="text-xs text-foreground/50 leading-relaxed font-medium">{value.description}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 🕰️ TIMELINE SECTION */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-5xl mx-auto px-5">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-4">Our Journey</h2>
              <p className="text-4xl lg:text-5xl font-black text-foreground dark:neon-text tracking-tight">
                12 Years of{" "}
                <span className="text-primary">Excellence</span>
              </p>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-blue-500 to-purple-500" />

            <div className="space-y-12">
              {timeline.map((item, i) => (
                <ScrollReveal key={i} delay={i * 0.1}>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative pl-20 group"
                  >
                    {/* Timeline Dot */}
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="absolute left-6 w-5 h-5 bg-primary rounded-full border-4 border-background group-hover:border-primary/20 transition-all"
                    />

                    <div className="bg-card rounded-2xl p-6 border border-border group-hover:border-primary/30 transition-all">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold font-mono text-primary">{item.year}</span>
                            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{item.title}</h3>
                          </div>
                          <p className="text-sm text-foreground/60 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 📞 PREMIUM CTA SECTION */}
      <section className="py-24 bg-card border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-5 text-center">
          <ScrollReveal>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-background rounded-3xl p-12 border border-border shadow-2xl relative overflow-hidden"
            >
              {/* Animated Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

              <div className="relative">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Zap className="w-10 h-10 text-primary" />
                  </div>
                </div>

                <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-6 tracking-tight dark:neon-text">
                  Ready to Transform Your Business?
                </h2>

                <p className="text-lg text-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join 300+ successful businesses across Bhutan that trust innovates.bt for their technology needs.
                  From ERP implementation to custom software, we deliver solutions that drive growth and efficiency.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://wa.me/97517268753"
                    className="group relative px-10 py-5 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-2xl hover:shadow-primary/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="relative flex items-center justify-center gap-3">
                      <span>Start Your Project</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>

                  <a
                    href="/services"
                    className="px-10 py-5 bg-card border-2 border-border text-foreground font-black uppercase text-[11px] tracking-widest rounded-2xl hover:border-primary/30 hover:text-primary transition-all"
                  >
                    View All Services
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="mt-10 pt-10 border-t border-border">
                  <div className="flex flex-wrap justify-center gap-8 text-center">
                    <div>
                      <p className="text-2xl font-black text-primary">300+</p>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/40">Happy Clients</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-primary">12+</p>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/40">Years Experience</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-primary">24/7</p>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/40">Support Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}