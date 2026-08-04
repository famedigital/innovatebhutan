"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, Quote } from "lucide-react";
import { CASE_STUDIES, getIndustries, type CaseStudy } from "@/lib/data/case-studies";

/**
 * 🏆 Success Stories Grid Component
 *
 * Showcase real client wins with measurable results.
 * Features industry filtering, expandable cards, and before/after metrics.
 */
export function SuccessStoriesGrid() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const industries = ["all", ...getIndustries()];
  const filteredStudies = selectedIndustry === "all"
    ? CASE_STUDIES
    : CASE_STUDIES.filter(cs => cs.industry === selectedIndustry);

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
          Success Stories That{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
            Speak for Themselves
          </span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real results from real businesses across Bhutan
        </p>
      </motion.div>

      {/* Industry Filters */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {industries.map((industry) => (
          <button
            key={industry}
            onClick={() => setSelectedIndustry(industry)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedIndustry === industry
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            {industry === "all" ? "All Industries" : industry}
          </button>
        ))}
      </div>

      {/* Case Studies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudies.map((study, index) => (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
          >
            <div className="h-full relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10">
              {/* Accent Gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />

              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Client & Industry */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        {study.client.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{study.client}</h4>
                      <p className="text-xs text-muted-foreground">{study.industry}</p>
                    </div>
                  </div>
                  {study.featured && (
                    <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Featured</span>
                    </div>
                  )}
                </div>

                {/* Challenge */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {study.challenge}
                </p>

                {/* Top Result Highlight */}
                {study.results[0] && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 mb-4 border border-emerald-200 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        {study.results[0].metric}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {study.results[0].after}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        vs {study.results[0].before}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {study.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Testimonial (if exists) */}
                {study.testimonial && expandedCard === study.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 pt-4 border-t border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-start gap-2">
                      <Quote className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                        {study.testimonial}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Expand/Collapse Results */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpandedCard(expandedCard === study.id ? null : study.id)}
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {expandedCard === study.id ? "Show Less" : "View All Results"}
                  </button>
                </div>

                {/* All Results (when expanded) */}
                {expandedCard === study.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    {study.results.map((result, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{result.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 line-through">{result.before}</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{result.after}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}

export default SuccessStoriesGrid;
