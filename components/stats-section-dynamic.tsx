"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Trophy, MapPin, Users, Heart, Target, Award, TrendingUp } from "lucide-react";

interface StatData {
  id?: number;
  label: string;
  value: string;
  description: string;
  icon_name: string;
  icon_color: string;
  color_from: string;
  color_to: string;
  bg_gradient: string;
  display_order: number;
}

// Icon mapping
const iconMap: Record<string, any> = {
  Trophy,
  MapPin,
  Users,
  Heart,
  Target,
  Award,
  TrendingUp,
};

function AnimatedCounter({ value, suffix }: { value: string; suffix: string }) {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      // Extract numeric value from string like "500+" or "98%"
      const numValue = parseInt(value.replace(/\D/g, "")) || 0;
      const hasPlus = value.includes("+");
      const hasPercent = value.includes("%");

      const duration = 2000;
      const steps = 60;
      const increment = numValue / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= numValue) {
          setDisplayValue(
            (hasPlus ? `${numValue}+` : numValue.toString()) + (hasPercent ? "%" : "")
          );
          clearInterval(timer);
        } else {
          setDisplayValue(
            Math.floor(current).toString() + (hasPlus ? "+" : "")
          );
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value, suffix]);

  return (
    <span ref={ref} className="font-mono tracking-tighter">
      {displayValue}{suffix}
    </span>
  );
}

export function StatsSectionDynamic() {
  const [stats, setStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/website/stats");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-10 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no stats in database, use defaults
  const displayStats = stats.length > 0 ? stats : [
    {
      label: "Projects Delivered",
      value: "500+",
      description: "Successfully completed projects",
      icon_name: "Trophy",
      icon_color: "#3ECF8E",
      color_from: "from-green-500",
      color_to: "to-emerald-500",
      bg_gradient: "from-green-50 to-emerald-50",
      display_order: 1,
    },
    {
      label: "Happy Clients",
      value: "98%",
      description: "Client satisfaction rate",
      icon_name: "Heart",
      icon_color: "#EF4444",
      color_from: "from-red-500",
      color_to: "to-pink-500",
      bg_gradient: "from-red-50 to-pink-50",
      display_order: 2,
    },
    {
      label: "Years Experience",
      value: "12+",
      description: "Industry expertise",
      icon_name: "Award",
      icon_color: "#F59E0B",
      color_from: "from-orange-500",
      color_to: "to-yellow-500",
      bg_gradient: "from-orange-50 to-yellow-50",
      display_order: 3,
    },
    {
      label: "Team Members",
      value: "50+",
      description: "Skilled professionals",
      icon_name: "Users",
      icon_color: "#8B5CF6",
      color_from: "from-purple-500",
      color_to: "to-violet-500",
      bg_gradient: "from-purple-50 to-violet-50",
      display_order: 4,
    },
  ];

  return (
    <div className="w-full py-6 sm:py-10 lg:py-16 bg-gradient-to-b from-background to-card relative overflow-hidden">
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
          className="text-center mb-6 sm:mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full mb-4">
            <Award className="w-3 h-3 text-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">
              Trusted by Businesses
            </span>
          </div>
          <h2 className="text-2xl lg:text-4xl font-black text-foreground mb-3 dark:neon-text tracking-tight">
            Our Impact in{" "}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Numbers</span>
          </h2>
          <p className="text-sm lg:text-base text-foreground/50 max-w-xl mx-auto px-4">
            {stats.length > 0
              ? "Our track record speaks for itself"
              : "12 years of excellence, powered by cutting-edge technology"
            }
          </p>
        </motion.div>

        {/* Modern Grid Layout */}
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {displayStats.map((stat, index) => {
            const Icon = iconMap[stat.icon_name] || Trophy;
            return (
              <motion.div
                key={stat.id || stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group relative"
              >
                {/* Card with Gradient Border */}
                <div className="relative bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all duration-500 overflow-hidden h-full">
                  {/* Animated Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color_from} ${stat.color_to} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <div className="flex items-center gap-4">
                    {/* Floating Icon */}
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
                      className="relative flex-shrink-0"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color_from} ${stat.color_to} p-0.5`}>
                        <div className="w-full h-full bg-card rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-foreground" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Main Stats */}
                    <div className="relative flex-1 min-w-0">
                      <div className="text-2xl font-black text-foreground font-mono tracking-tighter mb-1 dark:neon-text">
                        <AnimatedCounter value={stat.value} suffix="" />
                      </div>
                      <div className="text-[8px] font-black uppercase tracking-[0.15em] text-primary mb-0.5">
                        {stat.label}
                      </div>
                      <div className="text-[10px] text-foreground/40 font-medium uppercase tracking-wide">
                        {stat.description}
                      </div>
                    </div>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-2xl" />
                </div>

                {/* Glow Effect */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${stat.color_from} ${stat.color_to} rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500 -z-10`}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Premium Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4 text-center px-4"
        >
          {[
            { icon: Trophy, text: "Industry Leader" },
            { icon: Target, text: "Result Oriented" },
            { icon: TrendingUp, text: "Growth Partner" },
            { icon: Award, text: "Quality Assured" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-foreground/40">
              <item.icon className="w-3 h-3 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-wider">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
