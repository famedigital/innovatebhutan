"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Store, Utensils, Hotel, Code, Database, LayoutGrid,
  Wrench, Shield, Zap, Smartphone, FileText, Users, Search
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// 12 Services with sub-services and premium gradients
const allServices = [
  {
    id: "pos-solutions",
    name: "POS Solutions",
    shortName: "POS",
    icon: Store,
    gradient: "linear-gradient(145deg, #FF6B35, #DC2626, #B91C1C)",
    category: "POS Systems",
    subs: ["Retail POS", "Restaurant POS"],
    description: "Modern point-of-sale systems for retail and hospitality businesses."
  },
  {
    id: "hotel-pms",
    name: "Hotel PMS",
    shortName: "Hotel",
    icon: Hotel,
    gradient: "linear-gradient(145deg, #3B82F6, #4F46E5, #4338CA)",
    category: "POS Systems",
    description: "Complete property management for hotels and hospitality."
  },
  {
    id: "web-development",
    name: "Web Development",
    shortName: "Web",
    icon: Code,
    gradient: "linear-gradient(145deg, #A855F7, #EC4899, #DB2777)",
    category: "Web/SaaS",
    description: "Custom web applications built with modern frameworks."
  },
  {
    id: "saas-development",
    name: "SaaS Development",
    shortName: "SaaS",
    icon: Database,
    gradient: "linear-gradient(145deg, #8B5CF6, #7C3AED, #6D28D9)",
    category: "Web/SaaS",
    description: "Scalable SaaS platforms for your business needs."
  },
  {
    id: "erp-development",
    name: "ERP Development",
    shortName: "ERP",
    icon: LayoutGrid,
    gradient: "linear-gradient(145deg, #6366F1, #2563EB, #1D4ED8)",
    category: "Web/SaaS",
    description: "Enterprise resource planning for business operations."
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    shortName: "Mobile",
    icon: Smartphone,
    gradient: "linear-gradient(145deg, #14B8A6, #0891B2, #0E7490)",
    category: "Web/SaaS",
    description: "Native and cross-platform mobile applications."
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    shortName: "Infra",
    icon: Wrench,
    gradient: "linear-gradient(145deg, #64748B, #71717A, #52525B)",
    category: "Infrastructure",
    subs: ["Hardware", "Network", "Power"],
    description: "Complete IT infrastructure setup and maintenance."
  },
  {
    id: "security-systems",
    name: "Security Systems",
    shortName: "Security",
    icon: Shield,
    gradient: "linear-gradient(145deg, #EF4444, #E11D48, #BE123C)",
    category: "Security",
    subs: ["CCTV", "Anti Theft"],
    description: "Advanced security and surveillance solutions."
  },
  {
    id: "technical-maintenance",
    name: "Technical Maintenance",
    shortName: "Maintenance",
    icon: Zap,
    gradient: "linear-gradient(145deg, #22C55E, #10B981, #059669)",
    category: "Maintenance",
    description: "Ongoing technical support and maintenance services."
  },
  {
    id: "payroll-hr",
    name: "Payroll & HR",
    shortName: "HR",
    icon: Users,
    gradient: "linear-gradient(145deg, #F43F5E, #EC4899, #BE185D)",
    category: "Web/SaaS",
    description: "White-label HR and payroll management solutions."
  },
  {
    id: "gst-services",
    name: "GST Services",
    shortName: "GST",
    icon: FileText,
    gradient: "linear-gradient(145deg, #EAB308, #D97706, #B45309)",
    category: "Business Services",
    description: "GST registration, filing, and compliance services."
  },
  {
    id: "it-consulting",
    name: "IT Consulting",
    shortName: "Consulting",
    icon: Search,
    gradient: "linear-gradient(145deg, #06B6D4, #3B82F6, #2563EB)",
    category: "Consulting",
    description: "Strategic IT consulting for your business growth."
  },
];

const categories = [
  { name: "All Services", value: "all" },
  { name: "POS Systems", value: "POS Systems" },
  { name: "Web/SaaS", value: "Web/SaaS" },
  { name: "Infrastructure", value: "Infrastructure" },
  { name: "Security", value: "Security" },
  { name: "Maintenance", value: "Maintenance" },
  { name: "Business Services", value: "Business Services" },
  { name: "Consulting", value: "Consulting" },
];

// Premium App Store Style Card
function AppStoreCard({ service, index }: { service: typeof allServices[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSubs, setShowSubs] = useState(false);
  const Icon = service.icon;
  const hasSubs = service.subs;

  // Extract primary color from gradient
  const colorMatch = service.gradient.match(/#[A-F0-9]{6}/gi);
  const primaryColor = colorMatch?.[0] || '#10B981';

  return (
    <div
      className="group"
      onMouseEnter={() => {
        setIsHovered(true);
        if (hasSubs) setShowSubs(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowSubs(false);
      }}
    >
      {/* App Icon */}
      <div
        className="relative mb-3 mx-auto"
        style={{ width: '72px', height: '72px' }}
      >
        {/* Outer glow on hover */}
        {isHovered && (
          <div
            className="absolute inset-0 rounded-3xl blur-xl opacity-50 transition-opacity duration-300"
            style={{ background: service.gradient }}
          />
        )}

        {/* Main icon container */}
        <div
          className="relative w-full h-full rounded-3xl flex items-center justify-center shadow-lg"
          style={{
            background: service.gradient,
            boxShadow: isHovered
              ? `0 20px 40px -10px ${primaryColor}40`
              : '0 4px 20px -4px rgba(0,0,0,0.15)',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <Icon className="w-9 h-9 text-white" />

          {/* Sub-services indicator */}
          {hasSubs && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-md">
              <span className="text-[9px]" style={{ color: primaryColor }}>
                {service.subs?.length || 0}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* App Name */}
      <h3 className="text-center text-sm text-foreground mb-0.5 line-clamp-1">
        {service.shortName}
      </h3>

      {/* Category */}
      <p className="text-center text-xs text-foreground/50">
        {service.category}
      </p>

      {/* Sub-services flyout menu */}
      {hasSubs && showSubs && (
        <div
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-white/10 p-2 min-w-[160px]"
          style={{
            animation: 'fadeInUp 0.2s ease-out',
          }}
        >
          <div className="flex flex-col gap-0.5">
            {service.subs?.map((sub, i) => (
              <div
                key={sub}
                className="px-3 py-2 rounded-xl text-xs text-foreground/70 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer text-center"
                style={{
                  animation: `fadeInUp 0.15s ease-out ${i * 0.05}s both`,
                }}
              >
                {sub}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ServiceBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [serviceData] = useState(allServices);

  // Set category from URL param
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.some(c => c.value === categoryParam || c.name === categoryParam)) {
      setActiveCategory(categoryParam === "POS Systems" ? "POS Systems" : categoryParam);
    }
  }, [searchParams]);

  const filteredServices = activeCategory === "all"
    ? serviceData
    : serviceData.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-3xl text-foreground mb-2">Services</h1>
          <p className="text-foreground/50">
            Premium solutions for your business
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="bg-white dark:bg-zinc-900 border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setActiveCategory(cat.value);
                  if (cat.value !== "all") {
                    router.push(`/services?category=${encodeURIComponent(cat.value)}`);
                  } else {
                    router.push("/services");
                  }
                }}
                className={`
                  px-4 py-2 rounded-full text-xs whitespace-nowrap
                  transition-all duration-200
                  ${activeCategory === cat.value
                    ? "bg-primary text-black"
                    : "bg-zinc-100 dark:bg-zinc-800 text-foreground/60 hover:text-foreground"
                  }
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid - App Store Style */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-x-6 gap-y-8">
          {filteredServices.map((service, index) => (
            <AppStoreCard
              key={service.id}
              service={service}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-12 text-center border border-primary/20">
          <h2 className="text-xl text-foreground mb-3">
            Ready to get started?
          </h2>
          <p className="text-foreground/50 mb-6 text-sm">
            Contact us for a free consultation and quote.
          </p>
          <a
            href="https://wa.me/97517268753"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors text-sm"
          >
            Contact Us
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export function ServicesContent() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ServiceBrowser />
    </Suspense>
  );
}
