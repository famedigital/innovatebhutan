"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, Users, Zap, Award, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientTrustBarProps {
  className?: string;
  clientCount?: number;
  yearsInBusiness?: number;
  uptime?: string;
  showProducts?: boolean;
  featuredProducts?: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
}

/**
 * Client Trust Bar Component
 *
 * Displays trust indicators, client count, and featured products
 * in a professional scrolling carousel layout.
 */
export function ClientTrustBar({
  className,
  clientCount = 350,
  yearsInBusiness = 12,
  uptime = "99.9%",
  showProducts = true,
  featuredProducts = [
    {
      name: "POS Systems",
      description: "Complete retail management",
      icon: "shopping-cart"
    },
    {
      name: "Real Estate Software",
      description: "Property management simplified",
      icon: "building"
    },
    {
      name: "E-commerce Platform",
      description: "Sell online with confidence",
      icon: "shopping-bag"
    },
    {
      name: "Hotel Management",
      description: "Complete property solutions",
      icon: "home"
    },
    {
      name: "Security Systems",
      description: "Advanced surveillance",
      icon: "shield"
    },
    {
      name: "Custom Software",
      description: "Tailored to your needs",
      icon: "code"
    }
  ]
}: ClientTrustBarProps) {
  const [isPaused, setIsPaused] = React.useState(false);

  // Animated scroll for client logos
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const stats = [
    {
      icon: Users,
      value: `${clientCount}+`,
      label: "Happy Clients",
      color: "text-blue-400",
      bgColor: "bg-blue-400/10"
    },
    {
      icon: Award,
      value: `${yearsInBusiness}+`,
      label: "Years in Business",
      color: "text-green-400",
      bgColor: "bg-green-400/10"
    },
    {
      icon: Zap,
      value: uptime,
      label: "Uptime Guarantee",
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Client Rating",
      color: "text-purple-400",
      bgColor: "bg-purple-400/10"
    }
  ];

  return (
    <div className={cn("w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900", className)}>
      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                "rounded-2xl p-6 backdrop-blur-sm border border-white/10",
                "hover:scale-105 transition-transform duration-300",
                stat.bgColor
              )}
            >
              <div className="flex flex-col items-center text-center">
                <div className={cn("mb-3", stat.color)}>
                  <stat.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/70">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="border-t border-white/10 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Trusted by Bhutan's Leading Businesses
            </h3>
            <p className="text-white/60 text-sm sm:text-base">
              From government enterprises to local startups
            </p>
          </motion.div>

          {/* Scrolling Logo Carousel */}
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <motion.div
              ref={scrollRef}
              className="flex gap-8 sm:gap-12"
              animate={{
                x: [0, -1000]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                }
              }}
              style={{
                animationPlayState: isPaused ? 'paused' : 'running'
              }}
            >
              {/* Double the logos for seamless loop */}
              {[...Array(2)].map((_, loopIndex) => (
                <React.Fragment key={loopIndex}>
                  {clientLogos.map((client, index) => (
                    <motion.div
                      key={`${loopIndex}-${index}`}
                      className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="w-24 h-16 sm:w-32 sm:h-20 bg-white/5 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <span className="text-white font-bold text-xs sm:text-sm text-center px-2">
                          {client.name}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      {showProducts && featuredProducts.length > 0 && (
        <div className="border-t border-white/10 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Our Ready-to-Use Products
              </h3>
              <p className="text-white/60 text-sm sm:text-base">
                Deploy solutions in days, not months
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-green-400/30 transition-all duration-300 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-white text-sm mb-1">
                        {product.name}
                      </h4>
                      <p className="text-white/60 text-xs leading-tight">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="border-t border-white/10 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-500/10 to-blue-600/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-white/10"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Join {clientCount}+ Satisfied Clients
            </h3>
            <p className="text-white/70 mb-4 text-sm sm:text-base">
              Get started with a free consultation. No commitments.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                Get Free Quote
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 sm:px-8 py-3 bg-transparent border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-300"
              >
                View Portfolio
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Sample client logos (in production, fetch from database)
const clientLogos = [
  { name: "Bhutan Telecom", logo: "" },
  { name: "Bank of Bhutan", logo: "" },
  { name: "Druk Air", logo: "" },
  { name: "Tashi Bank", logo: "" },
  { name: "Thimphu Tech Park", logo: "" },
  { name: "Bhutan Power", logo: "" },
  { name: "Royal Insurance", logo: "" },
  { name: "Druk Holding", logo: "" },
  { name: "Bhutan Oil", logo: "" },
  { name: "City Mall", logo: "" },
];

export default ClientTrustBar;