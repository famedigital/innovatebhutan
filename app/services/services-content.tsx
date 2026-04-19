"use client";

import { useState, useEffect, Suspense, useRef, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Store, Utensils, Hotel, Code, Database, LayoutGrid,
  Wrench, Shield, Zap, Smartphone, FileText, Users, Search,
  X, Plus, Minus, ChevronRight, ShoppingCart, Check, ArrowLeft,
  GitCompare, Clock, Eye, Sparkles, Loader2
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { getMediaUrl } from "@/lib/cloudinary";
import Image from "next/image";
import Fuse from 'fuse.js';

// 12 Services with premium gradients
const allServices = [
  {
    id: "pos-solutions",
    name: "POS Solutions",
    shortName: "POS",
    subtitle: "Smart Selling, Seamless Operations",
    icon: Store,
    gradient: "linear-gradient(145deg, #FF6B35, #DC2626, #B91C1C)",
    category: "POS Systems",
    description: "Modern point-of-sale systems for retail and hospitality businesses with real-time inventory tracking and multi-store support.",
    screenshots: ["/hero/restaurantpos.png", "/hero/resturant.png"],
    features: ["Multi-store Support", "Real-time Analytics", "Cloud-Based", "Offline Mode", "Receipt Printing"],
    subs: [
      {
        id: "retail-pos",
        name: "Retail POS",
        subtitle: "Complete Retail Management",
        description: "Complete retail management with barcode scanning, inventory tracking, and customer loyalty programs. Perfect for shops, boutiques, and supermarkets.",
        screenshots: ["/hero/restaurantpos.png"],
        features: ["Barcode Scanning", "Inventory Management", "Loyalty Programs", "Multi-Payment", "Customer Database"]
      },
      {
        id: "restaurant-pos",
        name: "Restaurant POS",
        subtitle: "Smart Dining Solutions",
        description: "Table management, kitchen display, order routing, and split billing. Designed for restaurants, cafes, and food service.",
        screenshots: ["/hero/resturant.png"],
        features: ["Table Management", "Kitchen Display", "Order Routing", "Split Billing", "Table Reservations"]
      }
    ]
  },
  {
    id: "hotel-pms",
    name: "Hotel PMS",
    shortName: "Hotel",
    subtitle: "Complete Property Management",
    icon: Hotel,
    gradient: "linear-gradient(145deg, #3B82F6, #4F46E5, #4338CA)",
    category: "POS Systems",
    screenshots: ["/hero/hotelpms.png"],
    description: "Complete property management for hotels and hospitality with booking engine and housekeeping schedules.",
    features: ["Booking Management", "Housekeeping", "Front Desk Operations", "Room Service", "Guest History"]
  },
  {
    id: "web-development",
    name: "Web Development",
    shortName: "Web",
    subtitle: "Modern Web Experiences",
    icon: Code,
    gradient: "linear-gradient(145deg, #A855F7, #EC4899, #DB2777)",
    category: "Web/SaaS",
    screenshots: ["/hero/webdev.png", "/hero/dashboard.png"],
    description: "Custom web applications built with modern frameworks like React, Next.js, and TypeScript.",
    features: ["React", "Next.js", "TypeScript", "API Integration", "Responsive Design"]
  },
  {
    id: "saas-development",
    name: "SaaS Development",
    shortName: "SaaS",
    subtitle: "Scalable Cloud Platforms",
    icon: Database,
    gradient: "linear-gradient(145deg, #8B5CF6, #7C3AED, #6D28D9)",
    category: "Web/SaaS",
    screenshots: ["/hero/saas.png", "/hero/analytics.png"],
    description: "Scalable SaaS platforms with subscription billing, multi-tenant architecture, and cloud deployment.",
    features: ["Cloud Architecture", "API Design", "Subscription Billing", "Multi-tenant", "Analytics Dashboard"]
  },
  {
    id: "erp-development",
    name: "ERP Development",
    shortName: "ERP",
    subtitle: "Enterprise Resource Planning",
    shortName: "ERP",
    icon: LayoutGrid,
    gradient: "linear-gradient(145deg, #6366F1, #2563EB, #1D4ED8)",
    category: "Web/SaaS",
    screenshots: ["/hero/erp.png", "/hero/erp-dashboard.png"],
    description: "Enterprise resource planning covering finance, HR, and supply chain management.",
    features: ["Finance Module", "HR Management", "Supply Chain", "Reporting", "Workflow Automation"]
  },
  {
    id: "mobile-app",
    name: "Mobile App Development",
    shortName: "Mobile",
    subtitle: "iOS & Android Applications",
    icon: Smartphone,
    gradient: "linear-gradient(145deg, #14B8A6, #0891B2, #0E7490)",
    category: "Web/SaaS",
    screenshots: ["/hero/mobile.png", "/hero/appscreen.png"],
    description: "Native and cross-platform mobile applications for iOS and Android with React Native.",
    features: ["iOS Development", "Android Development", "React Native", "App Store Deployment", "Push Notifications"]
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    shortName: "Infra",
    subtitle: "Robust IT Foundations",
    icon: Wrench,
    gradient: "linear-gradient(145deg, #64748B, #71717A, #52525B)",
    category: "Infrastructure",
    screenshots: ["/hero/server.png", "/hero/datacenter.png"],
    description: "Complete IT infrastructure including servers, networking, and power backup solutions.",
    features: ["Server Setup", "Network Cabling", "Power Backup", "Rack Installation", "Maintenance"],
    subs: [
      {
        id: "hardware",
        name: "Hardware",
        subtitle: "Server & Equipment Setup",
        description: "Server installation, rack mounting, and hardware configuration. We handle complete setup from unboxing to production deployment.",
        screenshots: ["/hero/hardware.png"],
        features: ["Server Installation", "Rack Mounting", "Hardware Config", "Cable Management", "Testing"]
      },
      {
        id: "network",
        name: "Network",
        subtitle: "Connectivity & Cabling",
        description: "Structured cabling, WiFi setup, and network configuration. Design and deploy robust networks for your business.",
        screenshots: ["/hero/network.png", "/hero/wifi.png"],
        features: ["Structured Cabling", "WiFi Setup", "Switch Config", "Network Security", "Bandwidth Mgmt"]
      },
      {
        id: "power",
        name: "Power",
        subtitle: "Backup & Electrical Solutions",
        description: "UPS installation, power backup, and electrical work. Ensure your systems stay running during power outages.",
        screenshots: ["/hero/ups.png", "/hero/power.png"],
        features: ["UPS Installation", "Power Backup", "Generator Setup", "Electrical Work", "Maintenance"]
      }
    ]
  },
  {
    id: "security-systems",
    name: "Security Systems",
    shortName: "Security",
    subtitle: "Advanced Surveillance & Protection",
    icon: Shield,
    gradient: "linear-gradient(145deg, #EF4444, #E11D48, #BE123C)",
    category: "Security",
    screenshots: ["/hero/cctv.png", "/hero/access.png"],
    description: "Advanced security and surveillance with CCTV, access control, and anti-theft systems.",
    features: ["CCTV Installation", "Access Control", "Alarm Systems", "Remote Monitoring", "Motion Detection"],
    subs: [
      {
        id: "cctv",
        name: "CCTV",
        subtitle: "HD Surveillance Systems",
        description: "Professional CCTV installation with HD cameras, remote viewing, and recording solutions. Monitor your property from anywhere.",
        screenshots: ["/hero/cctv.png", "/hero/cctv2.png"],
        features: ["HD Cameras", "Remote Viewing", "Recording", "Night Vision", "Mobile Alerts"]
      },
      {
        id: "anti-theft",
        name: "Anti Theft",
        subtitle: "Retail Loss Prevention",
        description: "RFID tags, EAS gates, and anti-theft systems for retail. Protect your inventory with professional loss prevention.",
        screenshots: ["/hero/antitheft.png", "/hero/rfid.png"],
        features: ["RFID Tags", "EAS Gates", "Sensors", "Deactivation", "Alarm Integration"]
      }
    ]
  },
  {
    id: "technical-maintenance",
    name: "Technical Maintenance",
    shortName: "Maintenance",
    subtitle: "24/7 Support & Care",
    icon: Zap,
    gradient: "linear-gradient(145deg, #22C55E, #10B981, #059669)",
    category: "Maintenance",
    screenshots: ["/hero/support.png", "/hero/maintenance.png"],
    description: "Ongoing technical support with 24/7 monitoring, on-site service, and remote assistance.",
    features: ["24/7 Support", "On-site Service", "Remote Monitoring", "Preventive Maintenance", "SLA Guarantee"]
  },
  {
    id: "payroll-hr",
    name: "Payroll & HR",
    shortName: "HR",
    subtitle: "Smart HR & Payroll Management",
    icon: Users,
    gradient: "linear-gradient(145deg, #F43F5E, #EC4899, #BE185D)",
    category: "Web/SaaS",
    screenshots: ["/hero/payroll.png", "/hero/hrms.png"],
    description: "White-label HR and payroll management with attendance tracking and compliance reporting.",
    features: ["Payroll Processing", "HR Management", "Attendance Tracking", "Compliance", "Employee Self-Service"]
  },
  {
    id: "gst-services",
    name: "GST Services",
    shortName: "GST",
    subtitle: "Tax Compliance Made Simple",
    icon: FileText,
    gradient: "linear-gradient(145deg, #EAB308, #D97706, #B45309)",
    category: "Business Services",
    screenshots: ["/hero/gst.png", "/hero/tax.png"],
    description: "Complete GST services including registration, filing, and consultation for tax compliance.",
    features: ["GST Registration", "Return Filing", "Consultation", "Compliance Check", "Tax Planning"]
  },
  {
    id: "it-consulting",
    name: "IT Consulting",
    shortName: "Consulting",
    subtitle: "Strategic Technology Advisory",
    icon: Search,
    gradient: "linear-gradient(145deg, #06B6D4, #3B82F6, #2563EB)",
    category: "Consulting",
    screenshots: ["/hero/consulting.png", "/hero/strategy.png"],
    description: "Strategic IT consulting for digital transformation, technology planning, and advisory services.",
    features: ["Technology Planning", "Digital Transformation", "Advisory", "Roadmap Design", "Vendor Evaluation"]
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

// Sub-service type
interface SubService {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  screenshots: string[];
  features: string[];
}

// Cart item type
interface CartItem {
  service: typeof allServices[0];
  subService?: SubService;
}

// Recently viewed item type
interface RecentlyViewedItem {
  serviceId: string;
  timestamp: number;
}

// Compare item type
interface CompareItem {
  service: typeof allServices[0];
  subService?: SubService;
}

// Skeleton loading component
function ServiceCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="flex flex-col items-center gap-3"
    >
      {/* Shimmer effect for icon */}
      <div className="relative w-[68px] h-[68px]">
        <div className="absolute inset-0 rounded-3xl bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
              delay: index * 0.1
            }}
          />
        </div>
      </div>
      {/* Shimmer for text */}
      <div className="w-12 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            delay: index * 0.1
          }}
        />
      </div>
    </motion.div>
  );
}

// Loading state component
function ServicesLoadingState() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-8 pb-8 sm:px-8 sm:pt-12 sm:pb-12 lg:px-12 lg:pt-16">
      <div className="p-4 sm:p-6 rounded-3xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-sm">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 gap-y-6 justify-items-center">
        {Array.from({ length: 12 }).map((_, index) => (
          <ServiceCardSkeleton key={index} index={index} />
        ))}
        </div>
      </div>
    </div>
  );
}

// Enhanced empty cart state component
function EnhancedEmptyCartState({ onExploreServices }: { onExploreServices: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="flex flex-col items-center justify-center text-center py-10 px-4"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative mb-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <ShoppingCart className="w-10 h-10 text-primary/40" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Sparkles className="w-6 h-6 text-primary/60" />
        </motion.div>
      </motion.div>

      <h3 className="text-base font-semibold text-foreground mb-2">Your selection is empty</h3>
      <p className="text-sm text-foreground/50 mb-6 max-w-[200px]">
        Start building your perfect solution stack
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onExploreServices}
        className="px-5 py-2.5 bg-primary text-black rounded-xl font-semibold text-sm shadow-lg shadow-primary/20"
      >
        Explore Services
      </motion.button>
    </motion.div>
  );
}

// Enhanced search empty state component
function SearchEmptyState({ searchQuery, onClear }: { searchQuery: string; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-16 px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-zinc-400" />
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">No services found</h3>
      <p className="text-sm text-foreground/50 mb-6 max-w-[300px]">
        We couldn't find any services matching "{searchQuery}"
      </p>

      <div className="space-y-3 w-full max-w-[250px]">
        <div className="text-left">
          <p className="text-xs font-semibold text-foreground/70 mb-2">Try:</p>
          <ul className="text-xs text-foreground/50 space-y-1">
            <li>• Checking your spelling</li>
            <li>• Using more general terms</li>
            <li>• Browsing categories</li>
          </ul>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClear}
          className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-xl font-medium text-sm border border-zinc-200 dark:border-zinc-700"
        >
          Clear Search
        </motion.button>
      </div>
    </motion.div>
  );
}

// Service comparison modal
function ServiceComparisonModal({
  compareItems,
  onClose,
  onRemoveFromCompare
}: {
  compareItems: CompareItem[];
  onClose: () => void;
  onRemoveFromCompare: (index: number) => void;
}) {
  if (compareItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Compare Services</h2>
              <p className="text-xs text-foreground/50">{compareItems.length} services selected</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-foreground/60" />
          </motion.button>
        </div>

        {/* Comparison Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {compareItems.map((item, index) => {
              const Icon = item.service.icon;
              const displayName = item.subService ? item.subService.name : item.service.name;
              const displayDescription = item.subService ? item.subService.description : item.service.description;
              const displayFeatures = item.subService ? item.subService.features : item.service.features;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-700">
                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveFromCompare(index)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <X className="w-4 h-4 text-foreground/40" />
                    </button>

                    {/* Service Icon */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: item.service.gradient }}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Service Name */}
                    <h3 className="text-base font-bold text-foreground mb-1">{displayName}</h3>
                    <p className="text-xs text-foreground/50 mb-4">{item.service.category}</p>

                    {/* Description */}
                    <p className="text-xs text-foreground/70 mb-4 line-clamp-3">{displayDescription}</p>

                    {/* Features */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-foreground/60">Key Features:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {displayFeatures.slice(0, 4).map((feature, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-white dark:bg-zinc-700 rounded-lg text-foreground/70 border border-zinc-200 dark:border-zinc-600">
                            {feature}
                          </span>
                        ))}
                        {displayFeatures.length > 4 && (
                          <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-foreground/50">
                            +{displayFeatures.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Add more placeholder */}
          {compareItems.length < 3 && (
            <div className="mt-6 flex justify-center">
              <div className="text-center text-sm text-foreground/40">
                <p>Add up to 3 services to compare</p>
                <p className="text-xs mt-1">Click the compare button on any service card</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Quick preview modal
function QuickPreviewModal({
  service,
  subService,
  onClose,
  onAddToCart
}: {
  service: typeof allServices[0];
  subService?: SubService;
  onClose: () => void;
  onAddToCart: () => void;
}) {
  const Icon = service.icon;
  const displayName = subService ? subService.name : service.name;
  const displayDescription = subService ? subService.description : service.description;
  const displayFeatures = subService ? subService.features : service.features;
  const displayScreenshots = subService ? subService.screenshots : service.screenshots;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div className="relative p-6 pb-12" style={{ background: service.gradient }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
              <p className="text-sm text-white/80">{service.category}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 -mt-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-lg">
            {/* Screenshots */}
            {displayScreenshots && displayScreenshots.length > 0 && (
              <div className="mb-5">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {displayScreenshots.map((screenshot, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-32 h-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700"
                    >
                      <Image
                        src={getMediaUrl(screenshot)}
                        alt={`${displayName} screenshot ${i + 1}`}
                        width={128}
                        height={80}
                        className="w-full h-full object-cover"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-foreground/70 mb-2">About</h3>
              <p className="text-sm text-foreground/80 leading-relaxed">{displayDescription}</p>
            </div>

            {/* Features */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-foreground/70 mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {displayFeatures.slice(0, 4).map((feature, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-foreground/70 border border-zinc-200 dark:border-zinc-700">
                    {feature}
                  </span>
                ))}
                {displayFeatures.length > 4 && (
                  <span className="text-xs px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-foreground/50 border border-zinc-200 dark:border-zinc-700">
                    +{displayFeatures.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddToCart}
                className="flex-1 py-3 bg-primary text-black rounded-xl font-semibold text-sm shadow-lg shadow-primary/20"
              >
                Add to Selection
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-xl font-medium text-sm border border-zinc-200 dark:border-zinc-700"
              >
                Close
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Recently viewed services component
function RecentlyViewedServices({
  recentlyViewed,
  services,
  onSelectService
}: {
  recentlyViewed: RecentlyViewedItem[];
  services: typeof allServices;
  onSelectService: (service: typeof allServices[0]) => void;
}) {
  if (recentlyViewed.length === 0) return null;

  const recentServices = recentlyViewed
    .map(item => services.find(s => s.id === item.serviceId))
    .filter(Boolean) as typeof allServices;

  if (recentServices.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-foreground/50" />
        <h3 className="text-sm font-semibold text-foreground/70">Recently Viewed</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {recentServices.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectService(service)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: service.gradient }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{service.shortName}</p>
                <p className="text-xs text-foreground/50">{service.category}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// App Store Style Card with Enhanced Micro-interactions
function AppStoreCard({
  service,
  index,
  onPress,
  isSelected,
  onQuickPreview,
  onCompare
}: {
  service: typeof allServices[0];
  index: number;
  onPress: () => void;
  isSelected: boolean;
  onQuickPreview?: () => void;
  onCompare?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = service.icon;
  const hasSubs = service.subs;

  const colorMatch = service.gradient.match(/#[A-F0-9]{6}/gi);
  const primaryColor = colorMatch?.[0] || '#10B981';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onPress();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.03,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="group cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPress}
      onKeyDown={handleKeyDown}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      role="button"
      tabIndex={0}
      aria-label={`${service.name} - ${service.description}`}
      aria-pressed={isSelected}
    >
      <div className="relative p-3 flex items-center gap-3">
        {/* Colorful icon box - Left side */}
        <div className="relative flex-shrink-0">
          <motion.div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: service.gradient,
              boxShadow: isHovered
                ? `0 15px 30px -10px ${primaryColor}70`
                : '0 4px 15px -4px rgba(0,0,0,0.2)',
            }}
            animate={{
              scale: isHovered ? 1.08 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 20,
            }}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
          {hasSubs && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-md">
              <span className="text-[9px]" style={{ color: primaryColor }}>
                {service.subs?.length || 0}
              </span>
            </div>
          )}
        </div>

        {/* Text content - Right side */}
        <div className="flex-1 min-w-0">
          <motion.h3
            className={`text-sm font-semibold transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}
            animate={{
              scale: isHovered ? 1.02 : 1,
            }}
          >
            {service.name}
          </motion.h3>
          <p className="text-xs text-foreground/50 truncate">{service.category}</p>
        </div>

        {/* Quick action buttons on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex gap-1"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickPreview?.();
                }}
                className="p-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700"
                title="Quick preview"
              >
                <Eye className="w-3 h-3 text-foreground/60" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare?.();
                }}
                className="p-1.5 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-zinc-200 dark:border-zinc-700"
                title="Compare"
              >
                <GitCompare className="w-3 h-3 text-foreground/60" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Vertical Service List Item
function ServiceListItem({
  service,
  isSelected,
  onPress
}: {
  service: typeof allServices[0];
  isSelected: boolean;
  onPress: () => void;
}) {
  const Icon = service.icon;

  return (
    <motion.button
      onClick={onPress}
      className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all ${
        isSelected ? 'bg-primary/10' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: service.gradient }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm text-foreground">{service.shortName}</div>
        <div className="text-xs text-foreground/50">{service.category}</div>
      </div>
      {isSelected && <Check className="w-5 h-5 text-primary" />}
      {!isSelected && <ChevronRight className="w-5 h-5 text-foreground/30" />}
    </motion.button>
  );
}

// Sub-Service Detail Panel - App Store Style
function SubServiceDetailPanel({
  subService,
  service,
  onAddToCart,
  isInCart,
  hideAddButton = false
}: {
  subService: SubService;
  service: typeof allServices[0];
  onAddToCart: (subService?: SubService) => void;
  isInCart: (subService?: SubService) => boolean;
  hideAddButton?: boolean;
}) {
  const Icon = service.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full flex flex-col"
    >
      {/* App Store Style Header */}
      <div className="flex items-start gap-4 mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
          style={{ background: service.gradient }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground/50 mb-1">{service.name}</p>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight mb-1">{subService.name}</h2>
          {subService.subtitle && <p className="text-sm text-primary font-medium mb-1">{subService.subtitle}</p>}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((star) => (
                <svg key={star} className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.78-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">4.9</span>
            <span className="text-xs text-foreground/40">• {subService.features.length} FEATURES</span>
          </div>
        </div>
      </div>

      {/* Screenshots Gallery */}
      {subService.screenshots && subService.screenshots.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground/70 mb-3">PREVIEWS</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
            {subService.screenshots.map((screenshot, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-48 h-28 sm:w-64 sm:h-36 rounded-2xl snap-center relative overflow-hidden bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 shadow-lg"
              >
                <Image
                  src={getMediaUrl(screenshot)}
                  alt={`${subService.name} screenshot ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 192px, 256px"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* About Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-foreground/70 mb-2">ABOUT THIS SERVICE</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {subService.description}
        </p>
      </div>

      {/* Features Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-foreground/70 mb-3">FEATURES</h3>
        <div className="flex flex-wrap gap-2">
          {subService.features.map((feature, i) => (
            <motion.span
              key={feature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-foreground/80 border border-zinc-200 dark:border-zinc-700"
            >
              {feature}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Add button */}
      {!hideAddButton && (
      <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onAddToCart(subService)}
          className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            isInCart(subService)
              ? 'bg-primary/15 text-primary border border-primary/30'
              : 'bg-primary text-black shadow-lg shadow-primary/20'
          }`}
        >
          {isInCart(subService) ? (
            <>
              <Check className="w-5 h-5" />
              Added to Selection
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add to Selection
            </>
          )}
        </motion.button>
      </div>
      )}
    </motion.div>
  );
}

// Service Detail Panel
function ServiceDetailPanel({
  service,
  onAddToCart,
  isInCart,
  hideAddButton = false
}: {
  service: typeof allServices[0];
  onAddToCart: (subService?: string) => void;
  isInCart: (subService?: string) => boolean;
  hideAddButton?: boolean;
}) {
  const Icon = service.icon;
  const hasSubs = service.subs;
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll direction detection for Play Store-style header
  useEffect(() => {
    if (!isMobile) return;

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setScrollY(currentScrollY);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full flex flex-col"
    >
      {/* iOS App Store Style Header */}
      <div className="flex items-start gap-4 mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shadow-xl"
          style={{ background: service.gradient }}
        >
          <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight mb-1">{service.name}</h2>
          <p className="text-sm text-primary font-medium mb-1">{"subtitle" in service ? (service as any).subtitle : service.category}</p>
          <p className="text-xs text-foreground/50 mb-2">{service.category}</p>

          {/* App Store Style Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((star) => (
                <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.78-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">4.9</span>
            <span className="text-xs text-foreground/40">• {service.features.length} FEATURES</span>
          </div>
        </div>
      </div>

      {/* Screenshots Gallery - App Store Style */}
      {service.screenshots && service.screenshots.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground/70 mb-3">PREVIEWS</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-4 px-4 sm:mx-0 sm:px-0">
            {service.screenshots.map((screenshot, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-48 h-28 sm:w-64 sm:h-36 rounded-2xl snap-center relative overflow-hidden bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 shadow-lg"
              >
                <Image
                  src={getMediaUrl(screenshot)}
                  alt={`${service.name} screenshot ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 192px, 256px"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* About Section - App Store Style */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-foreground/70 mb-2">ABOUT THIS SERVICE</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Features Section - App Store Style */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-foreground/70 mb-3">FEATURES</h3>
        <div className="flex flex-wrap gap-2">
          {service.features.map((feature, i) => (
            <motion.span
              key={feature}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-foreground/80 border border-zinc-200 dark:border-zinc-700"
            >
              {feature}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Add main service button */}
      {!hideAddButton && (
      <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAddToCart()}
          className={`w-full py-5 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 ${
            isInCart()
              ? 'bg-primary/20 text-primary'
              : 'bg-primary text-black'
          }`}
        >
          {isInCart() ? (
            <>
              <Check className="w-5 h-5" />
              Added to Cart
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add to Cart
            </>
          )}
        </motion.button>
      </div>
      )}
    </motion.div>
  );
}

// iOS-style Cart Panel
function CartPanel({
  cart,
  onRemove,
  onClear,
  isOpen,
  onExploreServices
}: {
  cart: CartItem[];
  onRemove: (index: number) => void;
  onClear: () => void;
  isOpen: boolean;
  onExploreServices?: () => void;
}) {
  const whatsappNumber = "97517268753";

  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return "";

    let message = "Hi Innovates.bt, I'm interested in:\n\n";
    cart.forEach((item, i) => {
      message += `${i + 1}. ${item.service.name}`;
      if (item.subService) {
        message += ` (${item.subService.name})`;
      }
      message += "\n";
    });
    message += "\nPlease provide more details.";
    return encodeURIComponent(message);
  };

  return (
    <div className="sticky top-6 flex flex-col">
      {/* Premium Compact Cart Card - Apple Store Style */}
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl border border-zinc-200/60 dark:border-zinc-700/60 shadow-xl shadow-zinc-200/30 dark:shadow-black/30 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-r from-zinc-50/50 to-transparent dark:from-zinc-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={cart.length > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3, repeat: cart.length > 0 ? Infinity : 0, repeatDelay: 2 }}
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 text-primary" />
              </motion.div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Your Selection</h3>
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-foreground/50 font-medium"
                    >
                      {cart.length} {cart.length === 1 ? 'item' : 'items'}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
            {cart.length > 1 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClear}
                className="text-xs text-foreground/40 hover:text-red-500 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
              >
                Clear All
              </motion.button>
            )}
          </div>
        </div>

        {/* Cart Items - Scrollable with max height */}
        <div className="max-h-[560px] overflow-y-auto px-4 py-3 space-y-2 -webkit-overflow-scrolling-touch">
          <AnimatePresence initial={false}>
            {cart.length === 0 ? (
              <EnhancedEmptyCartState onExploreServices={() => onExploreServices?.()} />
            ) : (
              cart.map((item, index) => {
                const Icon = item.service.icon;
                return (
                  <motion.div
                    key={`${item.service.id}-${item.subService || 'main'}`}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{ background: item.service.gradient }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate leading-tight">{item.service.shortName}</p>
                      {item.subService && (
                        <p className="text-xs text-foreground/50 truncate leading-tight mt-0.5">{item.subService.name}</p>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onRemove(index)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* WhatsApp CTA - Premium */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/50 bg-gradient-to-r from-zinc-50/50 to-transparent dark:from-zinc-800/30">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (cart.length === 0) e.preventDefault(); }}
            className={`w-full py-3.5 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2.5 text-sm ${
              cart.length > 0
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-zinc-100 dark:bg-zinc-800 text-foreground/30 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {cart.length > 0 ? (
              <span>Connect on WhatsApp</span>
            ) : (
              <span>Add items first</span>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}

// Amazon-style Footer Cart for Mobile
function MobileFooterCart({
  cart,
  onRemove,
  cartOpen,
  setCartOpen
}: {
  cart: CartItem[];
  onRemove: (index: number) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}) {
  const whatsappNumber = "97517268753";

  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return "";
    let message = "Hi innovates.bt, I'm interested in:\n\n";
    cart.forEach((item, i) => {
      message += `${i + 1}. ${item.service.name}`;
      if (item.subService) message += ` (${item.subService.name})`;
      message += "\n";
    });
    message += "\nPlease provide more details.";
    return encodeURIComponent(message);
  };

  return (
    <>
      {/* Premium Fixed Footer Bar - Apple Store Style */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-[env(safe-area-inset-bottom)]">
        {/* Backdrop blur overlay */}
        <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-2xl -z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-100/50 to-transparent dark:from-zinc-900/50 -z-10" />

        {/* Shadow for depth */}
        <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-t from-zinc-200/50 to-transparent dark:from-zinc-800/50 -z-20" />

        <div className="flex items-stretch relative">
          {/* Premium Cart Summary - Gradient + Glow */}
          <motion.button
            onClick={() => setCartOpen(!cartOpen)}
            whileTap={{ scale: 0.98 }}
            className={`flex-1 flex items-center justify-between px-5 py-4 ${
              cart.length > 0
                ? 'bg-gradient-to-r from-primary via-primary to-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                : 'bg-zinc-100 dark:bg-zinc-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={cart.length > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3, repeat: cart.length > 0 ? Infinity : 0, repeatDelay: 2 }}
              >
                <ShoppingCart className={`w-5 h-5 ${cart.length > 0 ? 'text-black' : 'text-zinc-400'}`} />
              </motion.div>
              <div className="flex flex-col items-start">
                <span className={`text-sm font-semibold ${cart.length > 0 ? 'text-black' : 'text-zinc-500'}`}>
                  {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                </span>
                {cart.length > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-black/60 font-medium"
                  >
                    View Selection
                  </motion.span>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: cartOpen ? 90 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <ChevronRight className={`w-5 h-5 ${cart.length > 0 ? 'text-black' : 'text-zinc-400'}`} />
            </motion.div>
          </motion.button>

          {/* Premium WhatsApp CTA - iOS Style */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (cart.length === 0) e.preventDefault(); }}
            className={`px-6 flex items-center justify-center transition-all duration-300 ${
              cart.length > 0
                ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-[0_0_20px_rgba(34,197,94,0.5)] active:scale-95'
                : 'bg-zinc-200 dark:bg-zinc-800'
            }`}
          >
            {cart.length > 0 ? (
              <motion.svg
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </motion.svg>
            ) : (
              <svg className="w-6 h-6 text-zinc-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            )}
          </a>
        </div>

        {/* Premium Expandable Cart Sheet - iOS Sheet Style */}
        <AnimatePresence>
          {cartOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-30"
                onClick={() => setCartOpen(false)}
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="max-h-[55vh] overflow-y-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-200/50 dark:border-zinc-700/50 -webkit-overflow-scrolling-touch"
              >
                <div className="p-4 space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-bold text-foreground">Your Selection</h3>
                    <span className="text-xs text-foreground/50">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
                  </div>

                  {cart.map((item, index) => {
                    const Icon = item.service.icon;
                    return (
                      <motion.div
                        key={`${item.service.id}-${item.subService || 'main'}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800/80 rounded-2xl shadow-lg shadow-zinc-200/50 dark:shadow-black/30 border border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm"
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: item.service.gradient }}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{item.service.shortName}</p>
                          {item.subService && <p className="text-xs text-foreground/50 font-medium">{item.subService.name}</p>}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRemove(index)}
                          className="p-2.5 bg-zinc-100 dark:bg-zinc-700/50 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    );
                  })}
                  {cart.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center mb-4 shadow-lg"
                      >
                        <ShoppingCart className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
                      </motion.div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-semibold">Your selection is empty</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">Add services to get started</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer for fixed footer - iOS safe area */}
      <div className="h-20 lg:hidden" />
    </>
  );
}

export function ServiceBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<typeof allServices[0] | null>(null);
  const [selectedSubService, setSelectedSubService] = useState<SubService | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showQuickPreview, setShowQuickPreview] = useState<{ service: typeof allServices[0]; subService?: SubService } | null>(null);

  // Set category from URL param
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.some(c => c.value === categoryParam || c.name === categoryParam)) {
      setActiveCategory(categoryParam === "POS Systems" ? "POS Systems" : categoryParam);
    }
  }, [searchParams]);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Load recently viewed from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentlyViewedServices');
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently viewed', e);
      }
    }
  }, []);

  // Save to recently viewed when service is selected
  useEffect(() => {
    if (selectedService) {
      const newItem: RecentlyViewedItem = {
        serviceId: selectedService.id,
        timestamp: Date.now()
      };

      setRecentlyViewed(prev => {
        const filtered = prev.filter(item => item.serviceId !== selectedService.id);
        const updated = [newItem, ...filtered].slice(0, 5); // Keep only 5 most recent

        // Save to localStorage
        localStorage.setItem('recentlyViewedServices', JSON.stringify(updated));

        return updated;
      });
    }
  }, [selectedService?.id]);

  // Toggle body class for hiding footer/WhatsApp when service detail is open on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile && selectedService) {
      document.body.classList.add('service-detail-open');
    } else {
      document.body.classList.remove('service-detail-open');
    }
    return () => {
      document.body.classList.remove('service-detail-open');
    };
  }, [selectedService]);

  // Fuzzy search with Fuse.js
  const filteredServices = useMemo(() => {
    let services = activeCategory === "all"
      ? allServices
      : allServices.filter(s => s.category === activeCategory);

    if (searchQuery.trim()) {
      const fuse = new Fuse(services, {
        keys: ['name', 'shortName', 'category', 'description', 'features'],
        threshold: 0.4,
        ignoreLocation: true,
      });
      services = fuse.search(searchQuery).map(result => result.item);
    }

    return services;
  }, [activeCategory, searchQuery]);

  // Helper to check if a service matches the current filter
  const isServiceInFilter = useCallback((service: typeof allServices[0]) => {
    // Category match
    const categoryMatch = activeCategory === "all" || service.category === activeCategory;
    if (!categoryMatch) return false;

    // Search match (if search is active)
    if (searchQuery.trim()) {
      const fuse = new Fuse(allServices, {
        keys: ['name', 'shortName', 'category', 'description', 'features'],
        threshold: 0.4,
        ignoreLocation: true,
      });
      const searchResults = fuse.search(searchQuery).map(r => r.item);
      return searchResults.includes(service);
    }

    return true;
  }, [activeCategory, searchQuery]);

  const addToCart = (subService?: SubService) => {
    if (!selectedService) return;

    // Check if already exists
    const exists = cart.some(
      item => item.service.id === selectedService.id &&
      (item.subService?.id === subService?.id) &&
      (!subService && !item.subService)
    );

    if (!exists) {
      setCart([...cart, { service: selectedService, subService }]);
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (subService?: SubService) => {
    return cart.some(
      item => item.service.id === selectedService?.id &&
      (item.subService?.id === subService?.id) &&
      (!subService && !item.subService)
    );
  };

  const handleServiceClick = (service: typeof allServices[0]) => {
    setSelectedService(service);
  };

  const handleBack = () => {
    setSelectedService(null);
  };

  // Add to compare function
  const handleAddToCompare = (service: typeof allServices[0], subService?: SubService) => {
    const compareItem: CompareItem = { service, subService };

    // Check if already exists
    const exists = compareItems.some(
      item => item.service.id === service.id &&
      (item.subService?.id === subService?.id) &&
      (!subService && !item.subService)
    );

    if (!exists && compareItems.length < 3) {
      setCompareItems([...compareItems, compareItem]);
      if (compareItems.length + 1 === 2) {
        setShowCompareModal(true);
      }
    } else if (exists) {
      // Remove if already exists
      setCompareItems(compareItems.filter(
        item => !(item.service.id === service.id &&
        (item.subService?.id === subService?.id) &&
        (!subService && !item.subService))
      ));
    }
  };

  // Remove from compare
  const handleRemoveFromCompare = (index: number) => {
    setCompareItems(compareItems.filter((_, i) => i !== index));
  };

  // Quick preview handler
  const handleQuickPreview = (service: typeof allServices[0], subService?: SubService) => {
    setShowQuickPreview({ service, subService });
  };

  // Explore services handler
  const handleExploreServices = () => {
    setSelectedService(null);
    setSearchQuery("");
    setActiveCategory("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Dynamic Header */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-zinc-200/30 dark:border-zinc-800/30 sticky top-12 lg:top-12 service-detail-sticky-header z-20 transition-all duration-300 ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {selectedService ? (
            // Detail View Header - Apple Style Breadcrumb
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Back Button */}
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-foreground/50 hover:text-foreground transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 flex-shrink-0"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </motion.button>

              {/* Apple Style Breadcrumb */}
              <motion.nav
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm flex-1 min-w-0"
              >
                {/* Services (always clickable to go back) */}
                <button
                  onClick={handleBack}
                  className="text-foreground/40 hover:text-foreground/60 transition-colors font-medium truncate"
                >
                  Services
                </button>
                <span className="text-foreground/20 flex-shrink-0">/</span>

                {/* Service Name (selected) */}
                <span className="text-foreground/70 font-semibold truncate">
                  {selectedService.shortName}
                </span>

                {/* Sub-service Name (if selected) */}
                {selectedSubService && (
                  <>
                    <span className="text-foreground/20 flex-shrink-0">/</span>
                    <span className="text-primary font-semibold truncate">
                      {selectedSubService.name}
                    </span>
                  </>
                )}
              </motion.nav>

              {/* Animated cart badge */}
              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-primary/20 to-primary/10 px-2.5 py-1.5 rounded-full border border-primary/20 flex-shrink-0"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">{cart.length}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Grid View Header - Premium
            <div className="flex flex-col gap-4">
              {/* Mobile: Title + Search in one row */}
              <div className="flex items-center justify-between gap-3 px-4 sm:hidden">
                <motion.h1
                  key="services-title"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="text-xl text-foreground font-semibold tracking-tight"
                >
                  Services
                </motion.h1>
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                    <input
                      id="mobile-search-input"
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-8 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/50 w-32 transition-all duration-200"
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <X className="w-3 h-3 text-foreground/40" />
                      </motion.button>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Desktop: Full header */}
              <div className="hidden lg:flex lg:items-center lg:justify-between">
                <div className="flex items-center gap-4 sm:gap-6">
                  <motion.h1
                    key="services-title"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="text-2xl sm:text-3xl text-foreground font-semibold tracking-tight"
                  >
                    Services
                  </motion.h1>
                  {/* Premium segmented control */}
                  <div className="hidden lg:flex items-center gap-1 px-1 py-1 rounded-2xl bg-zinc-100/60 dark:bg-zinc-800/60 backdrop-blur-sm border border-zinc-200/40 dark:border-zinc-700/40 shadow-inner">
                    {categories.slice(0, 6).map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => {
                          setActiveCategory(cat.value);
                          router.push(cat.value !== "all" ? `/services?category=${encodeURIComponent(cat.value)}` : "/services");
                        }}
                        className="relative px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all duration-200 text-foreground/50 hover:text-foreground/70"
                      >
                        {activeCategory === cat.value && (
                          <motion.div
                            layoutId="activeCategory"
                            className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-xl shadow-sm"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search and compare section */}
                <div className="flex items-center gap-3">
                  {/* Search input */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input
                      id="desktop-search-input"
                      type="text"
                      placeholder="Search services..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/50 w-48 focus:w-64 transition-all duration-200"
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <X className="w-3 h-3 text-foreground/40" />
                      </motion.button>
                    )}
                  </motion.div>

                {/* Compare button */}
                <AnimatePresence>
                  {compareItems.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowCompareModal(true)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 text-sm font-medium"
                    >
                      <GitCompare className="w-4 h-4" />
                      <span>Compare ({compareItems.length})</span>
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Cart indicator - Premium */}
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="flex items-center gap-2 bg-gradient-to-r from-primary/15 to-primary/5 px-3 py-2 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10"
                    >
                      <ShoppingCart className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-primary">{cart.length}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile category pills - Sleek horizontal scroll */}
            <div className="lg:hidden -mx-4 px-4">
              {!selectedService && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                >
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.value}
                      onClick={() => {
                        setActiveCategory(cat.value);
                        router.push(cat.value !== "all" ? `/services?category=${encodeURIComponent(cat.value)}` : "/services");
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm whitespace-nowrap transition-all font-medium ${
                        activeCategory === cat.value
                          ? "bg-foreground text-white shadow-lg"
                          : "bg-zinc-100 dark:bg-zinc-800 text-foreground/60"
                      }`}
                    >
                      {cat.name}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!selectedService ? (
          // Grid View
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-[1400px] mx-auto px-6 pt-24 pb-8 sm:px-8 sm:pt-12 sm:pb-12 lg:px-12 lg:pt-16"
          >
            {/* Loading State */}
            {isLoading ? (
              <ServicesLoadingState />
            ) : (
              <>
                {/* Search empty state */}
                {searchQuery && filteredServices.length === 0 ? (
                  <SearchEmptyState searchQuery={searchQuery} onClear={() => setSearchQuery("")} />
                ) : (
                  <>
                    {/* Recently Viewed Services */}
                    <RecentlyViewedServices
                      recentlyViewed={recentlyViewed}
                      services={allServices}
                      onSelectService={handleServiceClick}
                    />
            {/* iOS App Store Style Featured Banner */}
            <div className="mb-10 sm:mb-12">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 border border-primary/10">
                <div className="p-6 sm:p-8 lg:p-12">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
                    {/* Featured Icon */}
                    <div className="flex-shrink-0">
                      <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center shadow-2xl"
                        style={{ background: 'linear-gradient(145deg, #10B981, #059669)' }}
                      >
                        <LayoutGrid className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      </motion.div>
                    </div>

                    {/* Featured Text */}
                    <div className="flex-1 min-w-0">
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2"
                      >
                        Transform Your Business
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm sm:text-base text-foreground/60"
                      >
                        Complete technology solutions for Bhutan's growing businesses
                      </motion.p>
                    </div>

                    {/* Featured Screenshot Gallery - iOS App Store style */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }}
                      className="flex-shrink-0 w-full lg:w-auto"
                    >
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {[
                          { img: "/hero/restaurantpos.png", label: "POS Interface" },
                          { img: "/hero/hotelpms.png", label: "Hotel Dashboard" },
                          { img: "/hero/cctv.png", label: "Security View" }
                        ].map((screenshot, i) => (
                          <div
                            key={i}
                            className="flex-shrink-0 w-32 h-24 sm:w-40 sm:h-28 lg:w-48 lg:h-36 rounded-2xl snap-center shadow-lg overflow-hidden border border-white/20 bg-zinc-900 relative"
                          >
                            <Image
                              src={getMediaUrl(screenshot.img)}
                              alt={screenshot.label}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q=="
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Cards Grid */}
            {/* iOS-style single container for all icons */}
            <div className="p-4 sm:p-6 rounded-3xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 justify-items-start">
              {filteredServices.map((service, index) => (
                <AppStoreCard
                  key={service.id}
                  service={service}
                  index={index}
                  onPress={() => handleServiceClick(service)}
                  isSelected={false}
                  onQuickPreview={() => handleQuickPreview(service)}
                  onCompare={() => handleAddToCompare(service)}
                />
              ))}
              </div>
            </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        ) : (
          // Detail View - Mobile Horizontal + Desktop Three Panel Layout
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="service-detail-content max-w-[1400px] mx-auto px-4 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-6 lg:px-8 lg:pt-10"
          >
            {/* Mobile Only - Horizontal Category Filters */}
            <div className="lg:hidden mb-4 px-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x"
              >
                {categories.map((cat) => (
                  <motion.button
                    key={cat.value}
                    onClick={() => {
                      setActiveCategory(cat.value);
                      router.push(cat.value !== "all" ? `/services?category=${encodeURIComponent(cat.value)}` : "/services");
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm whitespace-nowrap transition-all font-medium snap-start ${
                      activeCategory === cat.value
                        ? 'bg-foreground text-white shadow-lg'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-foreground/60'
                    }`}
                  >
                    {cat.name}
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Mobile Only - Horizontal Service Icon List */}
            <div className="lg:hidden mb-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-4 px-4"
              >
                {filteredServices.map((service) => {
                  const Icon = service.icon;
                  const isSelected = selectedService?.id === service.id;

                  return (
                    <motion.button
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setSelectedSubService(null);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 flex flex-col items-center gap-2 snap-start p-2 rounded-2xl transition-all ${
                        isSelected ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                          isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                        style={{
                          background: service.gradient,
                          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                        {service.subs && service.subs.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-[9px]" style={{ color: service.gradient.match(/#[A-F0-9]{6}/gi)?.[0] || '#10B981' }}>
                              {service.subs.length}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className={`text-xs font-medium whitespace-nowrap ${
                        isSelected ? 'text-primary' : 'text-foreground/70'
                      }`}>
                        {service.shortName}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>

            {/* Mobile Only - Horizontal Sub-services List */}
            {selectedService?.subs && selectedService.subs.length > 0 && (
              <div className="lg:hidden mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-4 px-4"
                >
                  <motion.button
                    key="main-service"
                    onClick={() => setSelectedSubService(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium snap-start transition-all ${
                      !selectedSubService
                        ? 'bg-foreground text-white shadow-lg'
                        : 'bg-white dark:bg-zinc-800 text-foreground/60 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    Overview
                  </motion.button>
                  {selectedService.subs.map((sub) => (
                    <motion.button
                      key={sub.id}
                      onClick={() => setSelectedSubService(sub)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium snap-start transition-all ${
                        selectedSubService?.id === sub.id
                          ? 'bg-foreground text-white shadow-lg'
                          : 'bg-white dark:bg-zinc-800 text-foreground/60 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {sub.name}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Three Panel Grid Layout - Desktop only panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              {/* Left Panel - Service List - Desktop only, Scrollable */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block lg:col-span-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                style={{ maxHeight: 'calc(100vh - 140px)' }}
              >
                {/* Grid Layout: 4 rows × 3 columns */}
                <div className="space-y-3 sticky top-0 pt-4">
                  {(selectedService ? allServices : filteredServices).map((service) => {
                    const Icon = service.icon;
                    const hasSubs = service.subs && service.subs.length > 0;
                    const matchesFilter = isServiceInFilter(service);

                    return (
                      <div key={service.id} className="space-y-1">
                        {/* Main Service */}
                        <motion.button
                          onClick={() => {
                            setSelectedService(service);
                            setSelectedSubService(null);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            selectedService?.id === service.id && !selectedSubService
                              ? 'bg-primary/10 ring-2 ring-primary/30'
                              : matchesFilter
                              ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              : 'opacity-40 hover:opacity-60'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className="w-12 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                            style={{ background: service.gradient }}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-foreground">{service.shortName}</div>
                            <div className="text-xs text-foreground/50">{service.category}</div>
                          </div>
                          {hasSubs && (
                            <div className="ml-auto flex items-center gap-1 text-xs text-foreground/40">
                              <span>{service.subs.length}</span>
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
                        </motion.button>

                        {/* Sub-services - Only show for filtered services or selected service */}
                        {hasSubs && (matchesFilter || selectedService?.id === service.id) && (
                          <div className="ml-6 space-y-1">
                            {service.subs.map((sub) => (
                              <motion.button
                                key={sub.id}
                                onClick={() => {
                                  setSelectedService(service);
                                  setSelectedSubService(sub);
                                }}
                                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${
                                  selectedSubService?.id === sub.id
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-foreground/70'
                                }`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <div
                                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: service.gradient }}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-medium truncate block">{sub.name}</span>
                                  {sub.subtitle && (
                                    <span className="text-[10px] text-foreground/40 truncate block">{sub.subtitle}</span>
                                  )}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Middle Panel - Service Details - Scrollable */}
              <div className="lg:col-span-7 relative flex flex-col">
                {/* Floating Cart Button - Always visible outside middle panel */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCartOpen(!cartOpen)}
                  className="absolute -right-4 top-4 z-50 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/30"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="text-sm font-semibold">{cart.length}</span>
                </motion.button>

                {/* Scrollable content */}
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-zinc-200/50 dark:border-zinc-700/50 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 flex-1"
                  style={{ maxHeight: 'calc(100vh - 120px)' }}
                >
                  <AnimatePresence mode="wait">
                    {selectedSubService ? (
                      <SubServiceDetailPanel
                        key={selectedSubService.id}
                        subService={selectedSubService}
                        service={selectedService!}
                        onAddToCart={addToCart}
                        isInCart={isInCart}
                        hideAddButton
                      />
                    ) : selectedService ? (
                      <ServiceDetailPanel
                        key={selectedService.id}
                        service={selectedService}
                        onAddToCart={addToCart}
                        isInCart={isInCart}
                        hideAddButton
                      />
                    ) : null}
                  </AnimatePresence>
                </div>

                {/* Floating Action Button - Bottom right corner */}
                {selectedService && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (selectedSubService) {
                        addToCart(selectedSubService);
                      } else {
                        addToCart();
                      }
                    }}
                    className={`absolute bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${
                      isInCart(selectedSubService)
                        ? 'bg-zinc-200 dark:bg-zinc-700'
                        : 'bg-primary'
                    }`}
                  >
                    {isInCart(selectedSubService) ? (
                      <Check className={`w-6 h-6 ${isInCart(selectedSubService) ? 'text-zinc-600 dark:text-zinc-400' : 'text-black'}`} />
                    ) : (
                      <Plus className="w-6 h-6 text-black" />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Right Panel - Cart - Desktop only, Stays at top */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block lg:col-span-3 sticky top-0"
              >
                <CartPanel
                  cart={cart}
                  onRemove={removeFromCart}
                  onClear={clearCart}
                  isOpen={true}
                  onExploreServices={handleExploreServices}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Footer Cart - Amazon Style - Outside AnimatePresence */}
      {selectedService && (
        <MobileFooterCart
          cart={cart}
          onRemove={removeFromCart}
          cartOpen={cartOpen}
          setCartOpen={setCartOpen}
        />
      )}

      {/* Comparison Modal */}
      <AnimatePresence>
        {showCompareModal && (
          <ServiceComparisonModal
            compareItems={compareItems}
            onClose={() => setShowCompareModal(false)}
            onRemoveFromCompare={handleRemoveFromCompare}
          />
        )}
      </AnimatePresence>

      {/* Quick Preview Modal */}
      <AnimatePresence>
        {showQuickPreview && (
          <QuickPreviewModal
            service={showQuickPreview.service}
            subService={showQuickPreview.subService}
            onClose={() => setShowQuickPreview(null)}
            onAddToCart={() => {
              addToCart(showQuickPreview.subService);
              setShowQuickPreview(null);
            }}
          />
        )}
      </AnimatePresence>
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
