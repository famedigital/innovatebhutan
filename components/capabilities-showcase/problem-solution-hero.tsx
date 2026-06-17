"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Play, TrendingUp } from "lucide-react";
import { getFeaturedSolutions, type Solution } from "@/lib/data/solutions-catalog";
import { CASE_STUDIES, type CaseStudy } from "@/lib/data/case-studies";

interface ProblemSolutionCard {
  id: string;
  problem: string;
  solution: string;
  client: string;
  metrics: {
    label: string;
    value: string;
    improvement: string;
  }[];
  category: string;
  icon: string;
  color: string;
}

/**
 * 🎯 Problem → Solution Hero Component
 *
 * Interactive slider showcasing business problems and how Innovate Bhutan solves them.
 * Features auto-rotation, manual controls, and animated metrics.
 */
export function ProblemSolutionHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Combine solutions and case studies for the cards
  const cards: ProblemSolutionCard[] = [
    {
      id: 'retail',
      problem: 'Managing retail operations manually?',
      solution: 'Complete POS system transformed local retail operations',
      client: 'Local Retail Clients',
      metrics: [
        { label: 'Checkout Time', value: '75% faster', improvement: '2 min vs 8 min' },
        { label: 'Inventory Accuracy', value: '98%', improvement: '+26% increase' },
        { label: 'Shrinkage', value: '1.2%', improvement: '-76% reduction' }
      ],
      category: 'Retail',
      icon: '🛒',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'webdesign',
      problem: 'Struggling with outdated website and poor online presence?',
      solution: 'Modern responsive website transformed Yeshey Tshogyal\'s online visibility',
      client: 'Yeshey Tshogyal',
      metrics: [
        { label: 'Page Load Speed', value: '82% faster', improvement: '1.2s vs 6.5s' },
        { label: 'Mobile Traffic', value: '+94%', improvement: '68% vs 35%' },
        { label: 'Inquiry Rate', value: '+232%', improvement: '8.3% vs 2.5%' }
      ],
      category: 'Web Design',
      icon: '💻',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'hospitality',
      problem: 'Manual hotel bookings and inefficient operations?',
      solution: 'Complete PMS implementation revolutionized Silverpine Boutique',
      client: 'Silverpine Boutique',
      metrics: [
        { label: 'Check-in Time', value: '83% faster', improvement: '2 min vs 12 min' },
        { label: 'Guest Satisfaction', value: '92%', improvement: '+31% increase' },
        { label: 'Billing Errors', value: '0.1%', improvement: '-98% reduction' }
      ],
      category: 'Hospitality',
      icon: '🏨',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'security',
      problem: 'Inadequate facility security and frequent incidents?',
      solution: 'Comprehensive CCTV system protected YOLO retail establishment',
      client: 'YOLO',
      metrics: [
        { label: 'Security Incidents', value: '-83%', improvement: '2 vs 12 per month' },
        { label: 'Monitoring Coverage', value: '98%', improvement: '+78% increase' },
        { label: 'Response Time', value: '30 seconds', improvement: 'Instant alerts' }
      ],
      category: 'Security',
      icon: '🔒',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'infrastructure',
      problem: 'Unreliable network connectivity across locations?',
      solution: 'Enterprise networking transformed Silverpine Group operations',
      client: 'Silverpine Group',
      metrics: [
        { label: 'Network Uptime', value: '99.8%', improvement: '+12% increase' },
        { label: 'Data Speed', value: '10x faster', improvement: '500 Mbps vs 50 Mbps' },
        { label: 'Downtime', value: '-93%', improvement: '1 vs 15 per month' }
      ],
      category: 'Infrastructure',
      icon: '🖥️',
      color: 'from-cyan-500 to-blue-600'
    }
  ];

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, cards.length]);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const currentCard = cards[currentIndex];

  return (
    <div
      className="relative max-w-6xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Every Challenge Has a{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
            Digital Solution
          </span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Real problems. Proven solutions. Measurable results.
        </p>
      </motion.div>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative"
        >
          {/* Glass Card */}
          <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl shadow-emerald-500/10">
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.color} opacity-5 dark:opacity-10`} />
            <div className={`absolute inset-0 bg-gradient-to-br ${currentCard.color} opacity-0 dark:opacity-5 blur-3xl`} />

            {/* Content */}
            <div className="relative z-10 p-8 sm:p-12">
              {/* Icon & Category */}
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentCard.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {currentCard.icon}
                </div>
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {currentCard.category}
                </span>
              </div>

              {/* Problem Statement */}
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
                {currentCard.problem}
              </h3>

              {/* Solution */}
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl">
                {currentCard.solution}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {currentCard.metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        {metric.label}
                      </span>
                    </div>
                    <div className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${currentCard.color} bg-clip-text text-transparent mb-1`}>
                      {metric.value}
                    </div>
                    <p className="text-xs text-muted-foreground">{metric.improvement}</p>
                  </motion.div>
                ))}
              </div>

              {/* Client Badge & CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{currentCard.client.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Story</p>
                    <p className="font-semibold">{currentCard.client}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.location.href = '/contact'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>See Full Case Study</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.location.href = `mailto:info@innovates.bt?subject=Solution Inquiry: ${currentCard.category}`}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-400 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={prevCard}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:border-emerald-600 dark:hover:border-emerald-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => goToCard(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-emerald-600 w-8'
                  : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:border-emerald-600 dark:hover:border-emerald-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={currentIndex === cards.length - 1}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Auto-play Status */}
      <div className="text-center mt-6">
        <p className="text-xs text-muted-foreground">
          {isPaused ? 'Paused - Move mouse away to resume' : 'Auto-rotating every 5 seconds'}
        </p>
      </div>
    </div>
  );
}

export default ProblemSolutionHero;
