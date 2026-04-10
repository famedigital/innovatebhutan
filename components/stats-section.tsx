"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Trophy, Users, Clock, Heart } from "lucide-react";

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

function MapPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

export function StatsSection() {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="mb-8">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-[10px] font-bold text-[#39FF14] mb-2 block uppercase tracking-[0.3em]"
        >
          Operational Metrics
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold text-white tracking-tighter"
        >
          Network Intelligence
        </motion.h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-6 bg-[#0f172a]/50 backdrop-blur-md rounded-2xl border border-white/5 hover:border-[#39FF14]/30 transition-all group"
            >
              <div className="flex flex-col gap-4">
                <div className="w-10 h-10 bg-[#39FF14]/5 rounded-xl flex items-center justify-center border border-[#39FF14]/20 group-hover:bg-[#39FF14] transition-colors">
                  <Icon className="w-5 h-5 text-[#39FF14] group-hover:text-[#020617] transition-colors" />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-tight">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}