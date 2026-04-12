"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Trophy, MapPin, Clock, Heart } from "lucide-react";

const stats = [
  { value: 500, suffix: "+", label: "Talent Linked", icon: Trophy },
  { value: 20, suffix: "/20", label: "Dzongkhag Nodes", icon: MapPin },
  { value: 15, suffix: "+", label: "Industry Cycles", icon: Clock },
  { value: 99, suffix: "%", label: "Operational Success", icon: Heart },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
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
    <div className="w-full">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-4 px-8 bg-card rounded-2xl border border-border transition-all hover:border-primary/30 group">
        
        {/* 📟 COMPACT HEADER */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] leading-none">
            Network Intelligence
          </h2>
        </div>

        {/* 📊 HORIZONTAL DATA STREAM */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-10 lg:gap-16 flex-1">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex items-center gap-10">
              {index !== 0 && (
                <div className="hidden lg:block w-[1px] h-4 bg-border/50" />
              )}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col lg:flex-row items-center lg:items-baseline gap-2 lg:gap-3"
              >
                <div className="text-xl lg:text-2xl font-black text-foreground font-mono tracking-tighter dark:neon-text leading-none">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[9px] text-foreground/30 font-black uppercase tracking-[0.2em] whitespace-nowrap leading-none">
                  {stat.label}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
