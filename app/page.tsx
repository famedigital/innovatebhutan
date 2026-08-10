"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { TopMarquee } from "@/components/top-marquee";
import { AntigravityHero } from "@/components/antigravity-hero";
import { ContactSectionDynamic } from "@/components/contact-section-dynamic";
import { FooterSectionDynamic } from "@/components/footer-section-dynamic";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { SuccessStoriesGrid } from "@/components/capabilities-showcase/success-stories-grid";
import { TechStackShowcase } from "@/components/capabilities-showcase/tech-stack-showcase";
import { SolutionCategories } from "@/components/capabilities-showcase/solution-categories";
import { InnovationTimeline } from "@/components/capabilities-showcase/innovation-timeline";

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

          {/* Technology Stack Showcase */}
          <div className="mb-24">
            <TechStackShowcase />
          </div>

          {/* Solutions by Category */}
          <div className="mb-24">
            <SolutionCategories />
          </div>

          {/* Innovation Timeline */}
          <div className="mb-16">
            <InnovationTimeline />
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl border border-emerald-200 dark:border-emerald-800/30">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Let's discuss how our solutions can solve your business challenges
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/#contact"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white dark:text-black rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-1 active:translate-y-0"
                >
                  <span>Start Your Project</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="/products"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-400 rounded-full font-semibold text-lg transition-all"
                >
                  <span>Browse Products</span>
                  <TrendingUp className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <ContactSectionDynamic />
      <FooterSectionDynamic />
      <WhatsAppButton />
    </main>
  );
}