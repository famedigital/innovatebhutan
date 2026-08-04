"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Rocket, Lightbulb, Users, Award, TrendingUp } from "lucide-react";

interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "achievement" | "expansion" | "innovation" | "future";
  highlight?: boolean;
}

/**
 * 🚀 Innovation Timeline Component
 *
 * Scroll-triggered vertical timeline showcasing company milestones and future vision.
 */
export function InnovationTimeline() {
  const [visibleMilestones, setVisibleMilestones] = useState<Set<number>>(new Set());
  const milestonesRef = useRef<HTMLDivElement>(null);

  const milestones: TimelineMilestone[] = [
    {
      year: "2015",
      title: "Founded",
      description: "Innovates Bhutan established with a vision to transform technology in the country.",
      icon: <Lightbulb className="w-6 h-6" />,
      type: "achievement",
      highlight: true
    },
    {
      year: "2016",
      title: "First Major Project",
      description: "Delivered enterprise POS solution for Bhutan's largest retail chain.",
      icon: <Award className="w-6 h-6" />,
      type: "achievement"
    },
    {
      year: "2018",
      title: "Expansion",
      description: "Grew team to 15+ professionals and expanded to networking infrastructure.",
      icon: <Users className="w-6 h-6" />,
      type: "expansion"
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description: "Launched comprehensive digital solutions for banking and hospitality sectors.",
      icon: <TrendingUp className="w-6 h-6" />,
      type: "innovation",
      highlight: true
    },
    {
      year: "2022",
      title: "300+ Clients",
      description: "Reached milestone of serving over 300 businesses across Bhutan.",
      icon: <Award className="w-6 h-6" />,
      type: "achievement"
    },
    {
      year: "2024",
      title: "Modern Tech Stack",
      description: "Adopted Next.js 16, Supabase, and modern AI-powered solutions.",
      icon: <Rocket className="w-6 h-6" />,
      type: "innovation",
      highlight: true
    },
    {
      year: "2025",
      title: "AI Integration",
      description: "Implementing AI-powered analytics and intelligent business solutions.",
      icon: <Lightbulb className="w-6 h-6" />,
      type: "future"
    },
    {
      year: "2026",
      title: "Cloud Platform",
      description: "Launching proprietary cloud platform for Bhutan businesses.",
      icon: <Rocket className="w-6 h-6" />,
      type: "future"
    }
  ];

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setVisibleMilestones((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2 }
    );

    const milestoneElements = milestonesRef.current?.querySelectorAll("[data-index]");
    milestoneElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const getTypeColor = (type: TimelineMilestone["type"]) => {
    switch (type) {
      case "achievement":
        return "from-emerald-500 to-teal-600";
      case "expansion":
        return "from-blue-500 to-indigo-600";
      case "innovation":
        return "from-purple-500 to-pink-600";
      case "future":
        return "from-cyan-500 to-blue-600";
    }
  };

  const getTypeBg = (type: TimelineMilestone["type"]) => {
    switch (type) {
      case "achievement":
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/30";
      case "expansion":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30";
      case "innovation":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/30";
      case "future":
        return "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800/30";
    }
  };

  return (
    <div className="relative">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h3 className="text-3xl sm:text-4xl font-bold mb-4">
          Our Journey of{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
            Innovation
          </span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From a small startup to Bhutan's leading technology solutions provider
        </p>
      </motion.div>

      {/* Timeline */}
      <div ref={milestonesRef} className="relative max-w-4xl mx-auto">
        {/* Center Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-purple-500 to-cyan-500 sm:left-1/2 sm:-translate-x-px" />

        {/* Milestones */}
        <div className="space-y-12">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              data-index={index}
              className={`relative ${index % 2 === 0 ? "sm:pr-8 sm:text-right" : "sm:pl-8 sm:ml-auto sm:w-1/2"}`}
            >
              {/* Timeline Node */}
              <div className={`absolute left-8 top-6 w-4 h-4 rounded-full bg-gradient-to-br ${getTypeColor(milestone.type)} shadow-lg z-10 sm:left-1/2 sm:-translate-x-1/2 ${
                visibleMilestones.has(index) ? "scale-125" : "scale-100"
              } transition-transform duration-300`} />

              {/* Card */}
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={visibleMilestones.has(index) ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`ml-16 sm:ml-0 p-6 rounded-2xl border ${getTypeBg(milestone.type)} transition-all hover:shadow-lg ${
                  milestone.highlight ? "shadow-md shadow-emerald-500/10" : ""
                }`}
              >
                {/* Year Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${getTypeColor(milestone.type)} text-white text-sm font-bold mb-3`}>
                  <Calendar className="w-4 h-4" />
                  {milestone.year}
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-3 mb-2">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${getTypeColor(milestone.type)} text-white shadow-md`}>
                    {milestone.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{milestone.title}</h4>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400">{milestone.description}</p>

                {/* Type Indicator */}
                <div className="mt-3">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
                    {milestone.type}
                  </span>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Vision CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-16"
      >
        <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-2xl font-bold mb-3">Building the Future of Technology in Bhutan</h4>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Join us on our journey as we continue to innovate and transform businesses across the country.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/97517268753?text=Hi%2C%20I%27d%20like%20to%20partner%20with%20Innovates"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Partner With Us</span>
              <Rocket className="w-4 h-4" />
            </a>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-400 rounded-full font-semibold transition-all"
            >
              <span>Get in Touch</span>
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default InnovationTimeline;
