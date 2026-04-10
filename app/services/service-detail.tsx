"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface ServiceProps {
  service: {
    id: string;
    name: string;
    shortName: string;
    description: string;
    fullDescription: string;
    features: string[];
    brands: string[];
    priceRange: string;
    icon: string;
  };
}

export function ServiceDetail({ service }: ServiceProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden hover:border-[#BBF7D0] transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Icon */}
          <div className="w-14 h-14 bg-[#F0FDF4] rounded-xl flex items-center justify-center text-2xl shrink-0">
            {service.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#030712] mb-1">{service.name}</h3>
                <p className="text-sm text-[#6B7280]">{service.description}</p>
              </div>
              
              {/* Price */}
              <div className="hidden sm:block text-right shrink-0">
                <div className="text-xs text-[#9CA3AF] mb-1">Starting from</div>
                <div className="text-sm font-semibold text-[#14532D]">{service.priceRange}</div>
              </div>
            </div>

            {/* Brands */}
            <div className="flex flex-wrap gap-2 mt-4">
              {service.brands.map((brand) => (
                <span
                  key={brand}
                  className="px-2.5 py-1 bg-[#F3F4F6] text-[#6B7280] text-xs rounded-md"
                >
                  {brand}
                </span>
              ))}
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 flex items-center gap-1.5 text-sm text-[#14532D] font-medium hover:underline"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  View Details
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-[#E5E7EB]"
          >
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              {service.fullDescription}
            </p>

            {/* Features */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-[#374151] uppercase tracking-wide mb-3">
                Key Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {service.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    <span className="text-sm text-[#6B7280]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/97517000000?text=Hi, I'm interested in ${encodeURIComponent(service.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#14532D] text-white text-sm font-medium rounded-lg hover:bg-[#166534] transition-colors"
              >
                Get Quote
                <ArrowRight className="w-4 h-4" />
              </a>
              <span className="sm:hidden text-xs text-[#9CA3AF] mt-2">
                Starting from: {service.priceRange}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}