"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Database, Cloud, Shield, Cpu, Network, Server, HardDrive } from "lucide-react";

interface TechItem {
  name: string;
  years: number;
  projects: number;
  certified: boolean;
  icon: React.ReactNode;
}

interface TechCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  technologies: TechItem[];
}

/**
 * 🛠️ Technology Stack Showcase Component
 *
 * Displays Innovate Bhutan's technical expertise and experience.
 * Features tabbed navigation, animated counters, and certification badges.
 */
export function TechStackShowcase() {
  const [selectedTab, setSelectedTab] = useState<string>("platforms");
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  const techCategories: TechCategory[] = [
    {
      id: "platforms",
      name: "Platforms",
      icon: <Cloud className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      technologies: [
        { name: "Next.js", years: 5, projects: 45, certified: true, icon: "⚡" },
        { name: "React", years: 6, projects: 67, certified: true, icon: "⚛️" },
        { name: "Node.js", years: 6, projects: 52, certified: true, icon: "🟢" },
        { name: "Supabase", years: 3, projects: 28, certified: true, icon: "⚡" },
        { name: "WordPress", years: 7, projects: 89, certified: true, icon: "📝" },
        { name: "Shopify", years: 4, projects: 23, certified: false, icon: "🛒" }
      ]
    },
    {
      id: "languages",
      name: "Languages",
      icon: <Code className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      technologies: [
        { name: "TypeScript", years: 5, projects: 56, certified: true, icon: "📘" },
        { name: "JavaScript", years: 7, projects: 89, certified: true, icon: "📜" },
        { name: "Python", years: 6, projects: 34, certified: true, icon: "🐍" },
        { name: "PHP", years: 7, projects: 67, certified: true, icon: "🐘" },
        { name: "SQL", years: 7, projects: 92, certified: true, icon: "🗃️" },
        { name: "Go", years: 2, projects: 8, certified: false, icon: "🐹" }
      ]
    },
    {
      id: "infrastructure",
      name: "Infrastructure",
      icon: <Server className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-500",
      technologies: [
        { name: "AWS", years: 4, projects: 23, certified: true, icon: "☁️" },
        { name: "Docker", years: 5, projects: 34, certified: true, icon: "🐳" },
        { name: "Linux", years: 7, projects: 67, certified: true, icon: "🐧" },
        { name: "Nginx", years: 6, projects: 45, certified: true, icon: "🦖" },
        { name: "Git", years: 7, projects: 92, certified: true, icon: "📦" },
        { name: "CI/CD", years: 4, projects: 28, certified: true, icon: "🔄" }
      ]
    },
    {
      id: "database",
      name: "Databases",
      icon: <Database className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
      technologies: [
        { name: "PostgreSQL", years: 7, projects: 78, certified: true, icon: "🐘" },
        { name: "MySQL", years: 7, projects: 82, certified: true, icon: "🐬" },
        { name: "MongoDB", years: 5, projects: 23, certified: true, icon: "🍃" },
        { name: "Redis", years: 4, projects: 18, certified: false, icon: "⚡" },
        { name: "SQLite", years: 6, projects: 34, certified: true, icon: "📁" }
      ]
    },
    {
      id: "networking",
      name: "Networking",
      icon: <Network className="w-5 h-5" />,
      color: "from-cyan-500 to-blue-500",
      technologies: [
        { name: "Cisco", years: 6, projects: 34, certified: true, icon: "🔧" },
        { name: "Mikrotik", years: 5, projects: 28, certified: true, icon: "📡" },
        { name: "Ubiquiti", years: 4, projects: 23, certified: true, icon: "📶" },
        { name: "Structured Cabling", years: 7, projects: 56, certified: true, icon: "🔌" },
        { name: "Firewall Config", years: 6, projects: 45, certified: true, icon: "🛡️" }
      ]
    },
    {
      id: "security",
      name: "Security",
      icon: <Shield className="w-5 h-5" />,
      color: "from-red-500 to-pink-500",
      technologies: [
        { name: "CCTV Systems", years: 7, projects: 67, certified: true, icon: "📹" },
        { name: "Access Control", years: 6, projects: 34, certified: true, icon: "🔓" },
        { name: "Biometrics", years: 5, projects: 23, certified: true, icon: "👆" },
        { name: "Cybersecurity", years: 4, projects: 18, certified: true, icon: "🔐" },
        { name: "VPN & SSL", years: 6, projects: 45, certified: true, icon: "🔒" }
      ]
    }
  ];

  const currentCategory = techCategories.find(cat => cat.id === selectedTab) || techCategories[0];

  // Calculate totals
  const totalYears = currentCategory.technologies.reduce((sum, tech) => sum + tech.years, 0);
  const totalProjects = currentCategory.technologies.reduce((sum, tech) => sum + tech.projects, 0);
  const certifiedCount = currentCategory.technologies.filter(t => t.certified).length;

  return (
    <div className="relative">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h3 className="text-3xl sm:text-4xl font-bold mb-4">
          Technology{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
            Expertise
          </span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Deep experience across platforms, languages, and infrastructure
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {techCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedTab(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              selectedTab === category.id
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/30 text-center"
            >
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {totalYears}+ Years
              </div>
              <p className="text-sm text-muted-foreground">Combined Experience</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800/30 text-center"
            >
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {totalProjects}+ Projects
              </div>
              <p className="text-sm text-muted-foreground">Successfully Delivered</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-5 border border-purple-200 dark:border-purple-800/30 text-center"
            >
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {certifiedCount}/{currentCategory.technologies.length}
              </div>
              <p className="text-sm text-muted-foreground">Certified Technologies</p>
            </motion.div>
          </div>

          {/* Technology Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategory.technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredTech(tech.name)}
                onMouseLeave={() => setHoveredTech(null)}
                className="group relative"
              >
                <div
                  className={`h-full bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 transition-all duration-300 ${
                    hoveredTech === tech.name
                      ? "border-emerald-500/50 shadow-xl shadow-emerald-500/10"
                      : "hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Hover Glow */}
                  {hoveredTech === tech.name && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentCategory.color} opacity-5 rounded-2xl`} />
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentCategory.color} flex items-center justify-center text-lg shadow-md`}>
                          {typeof tech.icon === "string" ? tech.icon : tech.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold">{tech.name}</h4>
                          {tech.certified && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">Certified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{tech.years}</div>
                        <p className="text-xs text-muted-foreground">Years</p>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{tech.projects}</div>
                        <p className="text-xs text-muted-foreground">Projects</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Expertise CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-12 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/30"
      >
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
          Need a specific technology or solution?
        </p>
        <a
          href="https://wa.me/97517268753?text=Hi%2C%20I%27d%20like%20to%20discuss%20our%20tech%20stack%20requirements"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>Discuss Your Tech Stack</span>
        </a>
      </motion.div>
    </div>
  );
}

export default TechStackShowcase;
