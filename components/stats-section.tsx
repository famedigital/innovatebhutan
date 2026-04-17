"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Trophy, MapPin, Clock, Heart, TrendingUp, Award, Users, Target } from "lucide-react";

const stats = [
  { value: 12, suffix: "+ Years", label: "Industry Excellence", description: "Trusted Expertise", icon: Trophy, color: "from-yellow-500 to-orange-500" },
  { value: 20, suffix: "/20", label: "National Coverage", description: "All Dzongkhags", icon: MapPin, color: "from-blue-500 to-cyan-500" },
  { value: 300, suffix: "+", label: "Active ERP Members", description: "Rancelab Partners", icon: Users, color: "from-purple-500 to-pink-500" },
  { value: 99, suffix: "%", label: "Client Retention", description: "Satisfaction Rate", icon: Heart, color: "from-green-500 to-emerald-500" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const duration = 2500;
      const steps = 80;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref} className="font-mono tracking-tighter">{count}{suffix}</span>
  );
}

export function StatsSection() {
  return (
    <div className="w-full py-16 bg-gradient-to-b from-background to-card relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 relative">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/5 border border-primary/20 rounded-full mb-6">
            <Award className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Trusted by 300+ Businesses</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4 dark:neon-text tracking-tight">
            Our Impact in{" "}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Numbers</span>
          </h2>
          <p className="text-lg text-foreground/50 max-w-2xl mx-auto">
            12 years of excellence, powered by cutting-edge technology and unwavering commitment to client success
          </p>
        </motion.div>

        {/* Modern Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Card with Gradient Border */}
              <div className="relative bg-card rounded-3xl p-8 border border-border hover:border-primary/30 transition-all duration-500 overflow-hidden">
                {/* Animated Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* Floating Icon */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                  className="relative mb-6"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} p-0.5`}>
                    <div className="w-full h-full bg-card rounded-xl flex items-center justify-center">
                      <stat.icon className="w-8 h-8 text-foreground" />
                    </div>
                  </div>
                </motion.div>

                {/* Main Stats */}
                <div className="relative">
                  <div className="text-4xl lg:text-5xl font-black text-foreground font-mono tracking-tighter mb-2 dark:neon-text">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs text-foreground/40 font-medium uppercase tracking-wider">
                    {stat.description}
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl" />
              </div>

              {/* Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />
            </motion.div>
          ))}
        </div>

        {/* Premium Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-center"
        >
          {[
            { icon: Trophy, text: "Industry Leader" },
            { icon: Target, text: "Result Oriented" },
            { icon: TrendingUp, text: "Growth Partner" },
            { icon: Award, text: "Quality Assured" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-foreground/40">
              <item.icon className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}