"use client";

import { motion } from "framer-motion";
import { TopMarquee } from "@/components/top-marquee";
import { AntigravityHero } from "@/components/antigravity-hero";
import { ContactSectionDynamic } from "@/components/contact-section-dynamic";
import { FooterSectionDynamic } from "@/components/footer-section-dynamic";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { SuccessStoriesGrid } from "@/components/capabilities-showcase/success-stories-grid";
import { TechStackShowcase } from "@/components/capabilities-showcase/tech-stack-showcase";
import { SolutionCategories } from "@/components/capabilities-showcase/solution-categories";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#10B981] selection:text-white dark:selection:bg-primary dark:selection:text-black transition-colors duration-500">
      <TopMarquee />

      {/* Hero Section - Antigravity-style with particles */}
      <AntigravityHero />

      {/* Technology Capabilities Showcase Section */}
      <section id="capabilities" className="py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-slate-950 scroll-mt-20 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6"
            >
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Our Expertise</span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Technology That{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                Transforms
              </span>
              {" "}Businesses
            </h2>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              We don't just sell products — we deliver solutions that solve real business challenges with proven results
            </p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-8 mt-10"
            >
              {[
                { label: 'Clients Served', value: '304+' },
                { label: 'Projects Delivered', value: '500+' },
                { label: 'Years Experience', value: '10+' },
                { label: 'Success Rate', value: '98%' }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Success Stories Grid */}
          <div className="mb-24">
            <SuccessStoriesGrid />
          </div>

          {/* Technology Experts */}
          <div className="mb-24">
            <TechStackShowcase />
          </div>

          {/* Solutions by Category */}
          <div className="mb-8">
            <SolutionCategories />
          </div>
        </div>
      </section>

      <ContactSectionDynamic />
      <FooterSectionDynamic />
      <WhatsAppButton />
    </main>
  );
}
