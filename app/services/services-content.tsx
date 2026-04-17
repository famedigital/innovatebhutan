"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Store, Utensils, Hotel, Code, Database, LayoutGrid,
  Wrench, Shield, Zap, Smartphone, FileText, Users, Search
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// 12 Services with sub-services and colorful gradients
const allServices = [
  {
    id: "pos-solutions",
    name: "POS Solutions",
    icon: Store,
    gradient: "linear-gradient(135deg, #F97316, #DC2626)", // Orange to Red
    category: "POS Systems",
    subs: ["Retail POS", "Restaurant POS"],
    description: "Modern point-of-sale systems for retail and hospitality businesses.",
    specs: ["Inventory Management", "Multi-store Support", "Real-time Analytics"]
  },
  {
    id: "hotel-pms",
    name: "Hotel PMS",
    icon: Hotel,
    gradient: "linear-gradient(135deg, #3B82F6, #4F46E5)", // Blue to Indigo
    category: "POS Systems",
    description: "Complete property management for hotels and hospitality.",
    specs: ["Booking Management", "Housekeeping", "Front Desk Operations"]
  },
  {
    id: "web-development",
    name: "Web Development",
    icon: Code,
    gradient: "linear-gradient(135deg, #A855F7, #EC4899)", // Purple to Pink
    category: "Web/SaaS",
    description: "Custom web applications built with modern frameworks.",
    specs: ["React", "Next.js", "TypeScript"]
  },
  {
    id: "saas-development",
    name: "SaaS Development",
    icon: Database,
    gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)", // Violet
    category: "Web/SaaS",
    description: "Scalable SaaS platforms for your business needs.",
    specs: ["Cloud Architecture", "API Design", "Subscription Billing"]
  },
  {
    id: "erp-development",
    name: "ERP Development",
    icon: LayoutGrid,
    gradient: "linear-gradient(135deg, #6366F1, #2563EB)", // Indigo to Blue
    category: "Web/SaaS",
    description: "Enterprise resource planning for business operations.",
    specs: ["Finance", "HR", "Supply Chain"]
  },
  {
    id: "mobile-app",
    name: "Mobile App Development",
    icon: Smartphone,
    gradient: "linear-gradient(135deg, #14B8A6, #0891B2)", // Teal to Cyan
    category: "Web/SaaS",
    description: "Native and cross-platform mobile applications.",
    specs: ["iOS", "Android", "React Native"]
  },
  {
    id: "infrastructure",
    name: "Infrastructure Solutions",
    icon: Wrench,
    gradient: "linear-gradient(135deg, #64748B, #71717A)", // Slate to Zinc
    category: "Infrastructure",
    subs: ["Hardware Solutions", "Network Infrastructure", "Power Solutions"],
    description: "Complete IT infrastructure setup and maintenance.",
    specs: ["Server Setup", "Cabling", "Power Backup"]
  },
  {
    id: "security-systems",
    name: "Security Systems",
    icon: Shield,
    gradient: "linear-gradient(135deg, #EF4444, #E11D48)", // Red to Rose
    category: "Security",
    subs: ["Security Systems", "Anti Theft System"],
    description: "Advanced security and surveillance solutions.",
    specs: ["CCTV", "Access Control", "Alarm Systems"]
  },
  {
    id: "technical-maintenance",
    name: "Technical Maintenance",
    icon: Zap,
    gradient: "linear-gradient(135deg, #22C55E, #10B981)", // Green to Emerald
    category: "Maintenance",
    description: "Ongoing technical support and maintenance services.",
    specs: ["24/7 Support", "On-site Service", "Remote Monitoring"]
  },
  {
    id: "payroll-hr",
    name: "Payroll & HR Whitelabel",
    icon: Users,
    gradient: "linear-gradient(135deg, #F43F5E, #EC4899)", // Rose to Pink
    category: "Web/SaaS",
    description: "White-label HR and payroll management solutions.",
    specs: ["Payroll Processing", "HR Management", "Compliance"]
  },
  {
    id: "gst-services",
    name: "GST Services",
    icon: FileText,
    gradient: "linear-gradient(135deg, #EAB308, #D97706)", // Yellow to Amber
    category: "Business Services",
    description: "GST registration, filing, and compliance services.",
    specs: ["Registration", "Filing", "Consultation"]
  },
  {
    id: "it-consulting",
    name: "IT Consulting",
    icon: Search,
    gradient: "linear-gradient(135deg, #06B6D4, #3B82F6)", // Cyan to Blue
    category: "Consulting",
    description: "Strategic IT consulting for your business growth.",
    specs: ["Technology Planning", "Digital Transformation", "Advisory"]
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

// Colorful Service Card Component - All content within gradient box
function ColorfulServiceCard({ service, index }: { service: typeof allServices[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = service.icon;
  const hasSubs = service.subs;
  const subCount = hasSubs ? service.subs.length : 0;

  // Extract gradient colors for badge
  const gradientFrom = service.gradient.match(/#[A-F0-9]{6}/gi)?.[0] || '#10B981';

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <div
        className={`
          relative rounded-2xl cursor-pointer
          flex flex-col items-center justify-center p-4 gap-2
          transition-all duration-300 ease-out
        `}
        style={{
          width: '100%',
          height: '110px',
          background: service.gradient,
          boxShadow: isHovered
            ? `0 12px 40px ${gradientFrom}40`
            : `0 2px 12px ${gradientFrom}20`,
          transform: isHovered ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        }}
      >
        {/* Icon */}
        <Icon className="w-8 h-8 text-white flex-shrink-0" />

        {/* Service name - white text on gradient */}
        <span className="text-[11px] text-white text-center leading-tight line-clamp-2">
          {service.name}
        </span>

        {/* Service count badge - white semi-transparent */}
        {subCount > 0 && (
          <span
            className="text-[9px] px-2 py-0.5 rounded-full inline-block w-fit"
            style={{
              background: 'rgba(255,255,255,0.25)',
              color: 'white',
            }}
          >
            {subCount}
          </span>
        )}
      </div>

      {/* Sub-services reveal on hover */}
      {hasSubs && isHovered && (
        <div
          className="absolute z-10 left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-100 dark:border-white/10 p-3"
          style={{
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div className="flex flex-col gap-1.5">
            {service.subs.map((sub, i) => (
              <div
                key={sub}
                className="flex items-center gap-2"
                style={{
                  animation: `slideIn 0.2s ease-out ${i * 0.05}s both`,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: service.gradient }}
                />
                <span className="text-[11px] text-foreground/70">{sub}</span>
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
          <h1 className="text-4xl text-foreground mb-3">Services</h1>
          <p className="text-foreground/60 text-lg">
            Enterprise solutions tailored for your business growth
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
                  px-4 py-2 rounded-full text-sm whitespace-nowrap
                  transition-all duration-200
                  ${activeCategory === cat.value
                    ? "bg-primary text-black"
                    : "bg-zinc-100 dark:bg-zinc-800 text-foreground/70 hover:text-foreground"
                  }
                `}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service, index) => (
            <ColorfulServiceCard
              key={service.id}
              service={service}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12 text-center border border-primary/20">
          <h2 className="text-2xl text-foreground mb-3">
            Ready to get started?
          </h2>
          <p className="text-foreground/60 mb-6">
            Contact us for a free consultation and quote.
          </p>
          <a
            href="https://wa.me/97517268753"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors"
          >
            Contact Us
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
