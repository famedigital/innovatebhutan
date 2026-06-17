"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  ArrowRight,
  Package,
  Monitor,
  Camera,
  Wifi,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PRODUCTS_CATALOG,
  getFeaturedProducts,
  getProductsByCategory,
  type ProductCategory,
  PRODUCT_CATEGORIES,
} from "@/lib/data/products-catalog";

/**
 * 🎨 Elegant Product Showcase
 *
 * Premium product grid with subtle animations and elegant design.
 * No big sliding boxes - clean, minimal, beautiful cards.
 */

interface HeroProductSliderProps {
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

export function HeroProductSlider({
  limit = 8,
  showFilters = true,
  className = "",
}: HeroProductSliderProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Get products based on category
  const products = selectedCategory === "all"
    ? getFeaturedProducts().slice(0, limit)
    : getProductsByCategory(selectedCategory).filter(p => p.featured).slice(0, limit);

  // Category icons for pills
  const categoryIcons: Record<string, React.ReactNode> = {
    POS: <Package className="w-3.5 h-3.5" />,
    SECURITY: <Camera className="w-3.5 h-3.5" />,
    NETWORKING: <Wifi className="w-3.5 h-3.5" />,
    POWER: <Zap className="w-3.5 h-3.5" />,
    COMPUTERS: <Monitor className="w-3.5 h-3.5" />,
  };

  return (
    <div className={`elegant-product-showcase ${className}`}>
      {/* Category Filters - Subtle Pills */}
      {showFilters && (
        <div className="mb-10">
          <div className="flex flex-wrap gap-2 justify-center">
            <CategoryPill
              category="all"
              label="All Products"
              selected={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
              icon="🎯"
            />
            {Object.entries(PRODUCT_CATEGORIES).slice(0, 5).map(([key, cat]) => (
              <CategoryPill
                key={key}
                category={key as ProductCategory}
                label={cat.label}
                selected={selectedCategory === key}
                onClick={() => setSelectedCategory(key as ProductCategory)}
                icon={cat.icon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Elegant Grid - No Big Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onHoverStart={() => setHoveredProduct(product.id)}
            onHoverEnd={() => setHoveredProduct(null)}
            className="group"
          >
            <div className="h-full relative">
              {/* Elegant Card - Minimal Design */}
              <div className="h-full bg-gradient-to-br from-background to-muted/30 border border-border/50 rounded-2xl p-5 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-lg">
                {/* Top Row - Icon + Badge */}
                <div className="flex items-start justify-between mb-3">
                  {/* Small Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-lg">{PRODUCT_CATEGORIES[product.category]?.icon || "📦"}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-1.5">
                    {product.new && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-0">
                        New
                      </Badge>
                    )}
                    {product.popular && (
                      <Badge className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-500 border-0">
                        Popular
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Product Name - Clean Typography */}
                <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-2 leading-tight">
                  {product.name}
                </h3>

                {/* Tagline - Muted */}
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {product.tagline}
                </p>

                {/* Bottom Row - Price + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Starting from</div>
                    <div className="text-sm font-bold text-primary">
                      Nu. {product.price.toLocaleString('en-US')}
                    </div>
                  </div>

                  {/* Subtle CTA */}
                  <button
                    onClick={() => {
                      window.location.href = `mailto:info@innovates.bt?subject=Product Inquiry: ${encodeURIComponent(product.name)}`;
                    }}
                    className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110 hover:bg-primary hover:text-white"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Subtle Hover Glow */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none ${
                  hoveredProduct === product.id ? "opacity-100" : ""
                }`}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Link - Subtle */}
      <div className="text-center mt-8">
        <a
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <span>View all {PRODUCTS_CATALOG.length} products</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}

/**
 * Category Pill - Minimal Design
 */
interface CategoryPillProps {
  category: ProductCategory | "all";
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: string;
}

function CategoryPill({
  category,
  label,
  selected,
  onClick,
  icon,
}: CategoryPillProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
        ${selected
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
        }
      `}
    >
      <span className="flex items-center gap-2">
        {icon && <span className="text-sm">{icon}</span>}
        {label}
      </span>
    </button>
  );
}

/**
 * Compact Product Slider (for other sections)
 */
export function CompactProductSlider({ limit = 4 }: { limit?: number }) {
  const products = getFeaturedProducts().slice(0, limit);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group cursor-pointer"
          onClick={() => window.location.href = `/products?category=${product.category}`}
        >
          <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-xl p-4 border border-primary/10 transition-all group-hover:border-primary/30 group-hover:shadow-md">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
              <span className="text-xl">{PRODUCT_CATEGORIES[product.category]?.icon || "📦"}</span>
            </div>
            <h4 className="text-sm font-medium mb-1 line-clamp-1">{product.name}</h4>
            <p className="text-xs font-semibold text-primary">Nu. {product.price.toLocaleString('en-US')}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default HeroProductSlider;
