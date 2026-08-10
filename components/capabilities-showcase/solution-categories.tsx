"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, TrendingUp, ChevronRight, Package, Check } from "lucide-react";
import { SOLUTIONS_CATALOG, getAllSolutions, type Solution } from "@/lib/data/solutions-catalog";

/**
 * 📦 Solution Categories Component
 *
 * Displays products organized by solution type (problem → product mapping).
 * Each solution shows the problem it solves, key products, and success metrics.
 */
export function SolutionCategories() {
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);
  const [hoveredSolution, setHoveredSolution] = useState<string | null>(null);
  const solutions = getAllSolutions();

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
          Solutions for{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
            Every Challenge
          </span>
        </h3>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Products organized by the problems they solve
        </p>
      </motion.div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {solutions.map((solution, index) => (
          <motion.div
            key={solution.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseEnter={() => setHoveredSolution(solution.id)}
            onMouseLeave={() => setHoveredSolution(null)}
            className="group"
          >
            <div
              className={`h-full relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl border transition-all duration-300 overflow-hidden ${
                hoveredSolution === solution.id || selectedSolution === solution.id
                  ? "border-emerald-500/50 shadow-xl shadow-emerald-500/10"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              {/* Accent Gradient */}
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full ${
                (hoveredSolution === solution.id || selectedSolution === solution.id) ? "opacity-100" : "opacity-0"
              } transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Icon & Name */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
                      {solution.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{solution.name}</h4>
                      <p className="text-xs text-muted-foreground">Solution</p>
                    </div>
                  </div>
                  {solution.featured && (
                    <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Popular</span>
                    </div>
                  )}
                </div>

                {/* Problem Statement */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {solution.problem}
                </p>

                {/* Solution Overview */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 mb-4 border border-emerald-200 dark:border-emerald-800/30">
                  <p className="text-xs text-slate-600 dark:text-slate-400">{solution.solution}</p>
                </div>

                {/* Top Benefits */}
                <div className="space-y-2 mb-4">
                  {solution.benefits.slice(0, 2).map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{benefit.value}</span>
                        {" "}{benefit.description}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Product Count */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{solution.products.length} products</span>
                  </div>

                  <button
                    onClick={() => setSelectedSolution(selectedSolution === solution.id ? null : solution.id)}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {selectedSolution === solution.id ? "Hide Details" : "View Products"}
                    <ChevronRight className={`w-3 h-3 transition-transform ${selectedSolution === solution.id ? "rotate-90" : ""}`} />
                  </button>
                </div>

                {/* Expandable Product List */}
                <AnimatePresence>
                  {selectedSolution === solution.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2"
                    >
                      {solution.products.map((product) => (
                        <div
                          key={product.productId}
                          className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-900 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/products?product=${product.productId}`}
                        >
                          <div className="flex-1">
                            <p className="text-xs font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category}</p>
                          </div>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            Nu. {product.price.toLocaleString('en-US')}
                          </p>
                        </div>
                      ))}
                      <button
                        onClick={() => window.location.href = `mailto:info@innovates.bt?subject=Solution Inquiry: ${solution.name}`}
                        className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-sm font-medium transition-all hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Get Quote for This Solution</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default SolutionCategories;
