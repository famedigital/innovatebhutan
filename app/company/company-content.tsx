"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Target, Eye, Award, Users, MapPin, Calendar, CheckCircle2,
  ArrowRight, Star, Globe, TrendingUp, Zap, Shield, Code2,
  Camera, Network, Database, Wrench, Clock, Building2,
  Server, Smartphone, HeadphonesIcon, FileText, BarChart
} from "lucide-react";
import { getMediaUrl } from "@/lib/cloudinary";
import { useState, useEffect } from "react";

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

// 🎯 Premium Hero Slideshow Component
function PremiumHeroSlideshow() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; duration: number; delay: number }>>([]);

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    const particleData = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
    }));
    setParticles(particleData);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentImage((prev) => (prev + 1) % heroImages.length);
      }, 4000); // 4 seconds per image
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: index === currentImage ? 1 : 0,
              scale: index === currentImage ? 1 : 1.1,
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={image}
              alt={`Innovate Bhutan ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/70" />
          </motion.div>
        ))}
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-5 w-full">
          <div className="max-w-4xl">
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <Award className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                Trusted Since 2012 • 300+ Businesses
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-none"
            >
              Innovate{" "}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Bhutan
              </span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl lg:text-4xl font-bold text-white/90 mb-8 leading-tight"
            >
              Premium Technology Solutions for{" "}
              <span className="text-primary font-black">Modern Enterprises</span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-lg text-white/70 mb-12 leading-relaxed max-w-2xl"
            >
              For over 12 years, we've been Bhutan's trusted partner for enterprise technology solutions.
              From Rancelab ERP implementations to custom software development, we empower businesses across
              Thimphu, Paro, and Punakha with cutting-edge tools for success.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-wrap gap-4"
            >
              <a
                href="https://wa.me/97517268753"
                className="group relative px-10 py-5 bg-primary text-black font-black uppercase text-[11px] tracking-widest rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-2xl hover:shadow-primary/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center gap-3">
                  <span>Start Your Project</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>

              <a
                href="/services"
                className="px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-white/20 transition-all"
              >
                Explore Services
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-12 h-1 rounded-full transition-all ${
              index === currentImage
                ? "bg-primary scale-125"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
        className="absolute left-10 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
      >
        <ArrowRight className="w-6 h-6 rotate-180" />
      </button>

      <button
        onClick={() => setCurrentImage((prev) => (prev + 1) % heroImages.length)}
        className="absolute right-10 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110"
      >
        <ArrowRight className="w-6 h-6" />
      </button>
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

      {/* 🚀 PREMIUM SLIDESHOW HERO SECTION */}
      <PremiumHeroSlideshow />

      {/* 📊 ANIMATED STATS SECTION */}
      <section className="py-20 bg-card border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-5">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-[12px] font-black text-primary uppercase tracking-[0.5em] mb-4">Our Impact</h2>
              <p className="text-4xl lg:text-5xl font-black text-foreground dark:neon-text tracking-tight">
                Trusted by{" "}
                <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                  300+ Businesses
                </span>
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {achievements.map((stat, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-background rounded-2xl p-6 text-center border border-border hover:border-primary/30 transition-all group"
                >
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-bold font-mono text-foreground tracking-tighter mb-1">
                    <AnimatedCounter end={stat.number} />
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-primary mb-1">{stat.label}</div>
                  <div className="text-[8px] uppercase tracking-wider text-foreground/40">{stat.sub}</div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

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
                The Innovate Bhutan{" "}
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
                  Join 300+ successful businesses across Bhutan that trust Innovate Bhutan for their technology needs.
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