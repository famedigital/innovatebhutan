"use client";

import { motion } from "framer-motion";
import { Target, Eye, Award, Users, MapPin, Calendar, CheckCircle2, ArrowRight, Star, Globe, TrendingUp } from "lucide-react";
import { getMediaUrl } from "@/lib/cloudinary";

const timeline = [
  { year: "2009", title: "Genesis", description: "Inception as a specialized IT node in Thimphu, mapping the kingdom's technological future." },
  { year: "2012", title: "Security Matrix", description: "Authorized partner for Hikvision. Bridging high-stakes surveillance into Bhutan's core security." },
  { year: "2015", title: "Nationwide Mesh", description: "Established operational presence across all 20 dzongkhags, ensuring 100% network reach." },
  { year: "2018", title: "Hospitality Cloud", description: "Exclusive Rancelab partnership. Revolutionizing luxury guest experience flows." },
  { year: "2020", title: "Operational Hub", description: "Activated state-of-the-art authorized diagnostics and service center in Thimphu." },
  { year: "2024", title: "Elite Talent Brokerage", description: "Pivoted to high-performance talent brokerage, linking 500+ enterprises with elite skillsets." },
];

const values = [
  { icon: Star, title: "Precision", description: "We broker excellence. Every skill, every node must be precision-engineered." },
  { icon: Globe, title: "Kingdom Logic", description: "Decades of deep-rooted understanding of Bhutan's unique operational terrain." },
  { icon: TrendingUp, title: "Infinite Growth", description: "Continuous evolution of our talent matrix to anticipate future market shifts." },
  { icon: Users, title: "Operational Link", description: "Your success is the heartbeat of our network. We are the link to your empire." },
];

const achievements = [
  { number: "500+", label: "Domains Linked", sub: "Operational Success" },
  { number: "20/20", label: "Dzongkhag Nodes", sub: "Network Coverage" },
  { number: "15+ Yrs", label: "Industry Cycles", sub: "Architectural Experience" },
  { number: "99%", label: "Uptime Logic", sub: "Client Satisfaction" },
  { number: "60+", label: "Luxury Hotels", sub: "PMS Integration" },
  { number: "250+", label: "POS Clusters", sub: "Hard-linked Units" },
];

export function CompanyContent() {
  return (
    <div className="pt-16 bg-background text-foreground transition-colors duration-500">
      {/* 🚀 COMPACT HERO SECTION */}
      <section className="relative py-16 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-5">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/20 rounded-full mb-6">
                <Award className="w-3.5 h-3.5 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Established 2009</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-6 tracking-tighter leading-none dark:neon-text">
                Architects of the <span className="text-primary">Operational</span> Era
              </h1>
              
              <p className="text-base text-foreground/50 mb-10 leading-relaxed font-medium max-w-xl">
                For over 15 years, we've brokered elite technical nodes for Bhutan's mission-critical sectors. 
                Our legacy links 500+ enterprises with high-performance infrastructure.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { icon: CheckCircle2, text: "500+ Domains Operational" },
                  { icon: CheckCircle2, text: "Nationwide Node Mesh" },
                  { icon: CheckCircle2, text: "Authorized Tech Broker" },
                  { icon: CheckCircle2, text: "15+ Yr Industry Cycle" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-foreground/40">
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.text}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://wa.me/97517268753"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
              >
                Initiate Link-up
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-10 bg-primary/10 rounded-full blur-[100px] opacity-30" />
              <div className="relative bg-card rounded-[32px] overflow-hidden border border-border p-2">
                <img
                  src={getMediaUrl('innovate_bhutan/services_main_hero')}
                  alt="Strategy Hub"
                  className="w-full h-[400px] object-cover rounded-[24px] grayscale opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent " />
                <div className="absolute bottom-8 left-8">
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Operational Command</p>
                  <p className="text-foreground/80 font-bold uppercase text-[11px] tracking-widest">Kingdom-wide Hub</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 📊 COMPACT STATS */}
      <section className="py-10 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {achievements.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-2xl font-bold font-mono text-foreground tracking-tighter mb-1">{stat.number}</div>
                <div className="text-primary text-[8px] font-black uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 MISSION & VISION */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { i: Target, t: "The Mission", d: "To link Bhutan's premier enterprises with high-performance talent, architecting operational flows that define the modern kingdom.", c: "bg-card border-border" },
              { i: Eye, t: "The Vision", d: "To be the primary node for Bhutan's technological legacy—bridging global innovation with deep-rooted kingdom logic.", c: "bg-muted/10 border-border" }
            ].map((item, i) => (
              <motion.div
                key={i}
                className={`${item.c} rounded-3xl p-8 border hover:border-primary/20 transition-all group`}
              >
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 border border-primary/20 group-hover:bg-primary transition-all">
                  <item.i className="w-6 h-6 text-primary group-hover:text-black" />
                </div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-4">{item.t}</h3>
                <p className="text-foreground/40 text-[13px] leading-relaxed font-medium italic">"{item.d}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🗝️ VALUES */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-[12px] font-black text-foreground/40 uppercase tracking-[0.5em] mb-4">Core Directives</h2>
            <div className="h-1 w-12 bg-primary rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value, i) => (
              <motion.div
                key={i}
                className="bg-background rounded-2xl p-6 text-center border border-border group hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center mx-auto mb-5 border border-primary/20 group-hover:bg-primary transition-all">
                  <value.icon className="w-5 h-5 text-primary group-hover:text-black" />
                </div>
                <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-2">{value.title}</h3>
                <p className="text-[10px] text-foreground/40 leading-relaxed font-bold uppercase tracking-tighter">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🕰️ TIMELINE */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-[12px] font-black text-foreground/40 uppercase tracking-[0.5em] mb-16">The Legacy Loop</h2>
          <div className="space-y-4">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-6 text-left group">
                <div className="text-xl font-bold font-mono text-primary group-hover:translate-x-1 transition-transform shrink-0 w-16">{item.year}</div>
                <div className="pt-1">
                  <h4 className="text-[12px] font-black text-foreground uppercase tracking-wider mb-1">{item.title}</h4>
                  <p className="text-[11px] text-foreground/40 leading-relaxed max-w-xl">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📞 COMPACT CTA */}
      <section className="py-20 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl lg:text-5xl font-black text-foreground mb-6 tracking-tighter uppercase leading-none dark:neon-text">Forge Your Future</h2>
          <p className="text-base text-foreground/40 mb-10 font-medium">
            Join the link mesh of 500+ enterprises who scale with precision.
          </p>
          <a
            href="https://wa.me/97517268753"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-2xl"
          >
            <ArrowRight className="w-4 h-4" />
            Connect With Architect
          </a>
        </div>
      </section>
    </div>
  );
}
