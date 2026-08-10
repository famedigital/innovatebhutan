"use client";

import { motion } from "framer-motion";
import { Award, Headphones, ShieldCheck, Users } from "lucide-react";

const highlights = [
  {
    icon: Award,
    value: "10+",
    label: "Years Experience",
    detail: "Serving businesses across Bhutan since day one",
  },
  {
    icon: Users,
    value: "304+",
    label: "Happy Clients",
    detail: "Hotels, shops, offices, and organizations trust us",
  },
  {
    icon: ShieldCheck,
    value: "500+",
    label: "Projects Delivered",
    detail: "Websites, POS, CCTV, networking, and custom systems",
  },
  {
    icon: Headphones,
    value: "Support",
    label: "When You Need Us",
    detail: "Local team, fast response, real people on WhatsApp",
  },
];

/**
 * Client-facing expertise highlights.
 * Keeps outcomes simple — no technical stack jargon.
 */
export function TechStackShowcase() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h3 className="text-3xl sm:text-4xl font-bold mb-4">
          Technology{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
            Experts
          </span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We build, install, and support the systems your business actually needs
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                {item.value}
              </div>
              <div className="font-semibold mb-2">{item.label}</div>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-12 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/30"
      >
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
          Tell us what you need — we&apos;ll handle the rest
        </p>
        <a
          href="https://wa.me/97517268753?text=Hi%2C%20I%27d%20like%20to%20discuss%20what%20my%20business%20needs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
        >
          Talk to Us on WhatsApp
        </a>
      </motion.div>
    </div>
  );
}

export default TechStackShowcase;
