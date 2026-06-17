"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, Utensils, Hotel, Code, Database,
  Wrench, Shield, Zap, Smartphone, Users, Phone,
  ChevronRight, Check, ArrowRight, Fingerprint,
  Camera, Wifi, Server, HardDrive, Monitor,
  X, ChevronDown
} from "lucide-react";

// Pricing tiers for each service
const pricingTiers = {
  "pos-solutions": {
    basic: { name: "Starter", price: "Nu. 35,000", features: ["1 Terminal", "Basic inventory", "Standard reports", "Email support"] },
    pro: { name: "Professional", price: "Nu. 50,000", features: ["2 Terminals", "Advanced inventory", "Analytics dashboard", "Priority support", "GST reports"] },
    enterprise: { name: "Enterprise", price: "Custom", features: ["Unlimited terminals", "Multi-store sync", "Custom reports", "24/7 support", "API access"] }
  },
  "hotel-pms": {
    basic: { name: "Basic", price: "Nu. 2,000/mo", features: ["Up to 20 rooms", "Front desk operations", "Basic reports", "Email support"] },
    pro: { name: "Professional", price: "Nu. 4,000/mo", features: ["Up to 50 rooms", "Booking engine", "Housekeeping mgmt", "Channel manager", "Priority support"] },
    enterprise: { name: "Enterprise", price: "Custom", features: ["Unlimited rooms", "Multi-property", "Custom integrations", "24/7 support", "White label"] }
  },
  "security-systems": {
    basic: { name: "Basic", price: "Nu. 25,000", features: ["4 cameras", "Basic NVR", "Mobile viewing", "1-week storage"] },
    pro: { name: "Professional", price: "Nu. 45,000", features: ["8 cameras", "Advanced NVR", "AI detection", "1-month storage", "Remote alerts"] },
    enterprise: { name: "Enterprise", price: "Custom", features: ["Unlimited cameras", "Enterprise NVR", "AI analytics", "3-month storage", "24/7 monitoring"] }
  },
  "biometric": {
    basic: { name: "Starter", price: "Nu. 8,500", features: ["1 device", "Fingerprint only", "Basic reports", "Local software"] },
    pro: { name: "Professional", price: "Nu. 25,000", features: ["2 devices", "Face + fingerprint", "Cloud reports", "Access control"] },
    enterprise: { name: "Enterprise", price: "Custom", features: ["Multiple devices", "All biometric modes", "Cloud API", "Integration support"] }
  },
  "networking": {
    basic: { name: "Small Office", price: "Nu. 15,000", features: ["Up to 10 users", "Basic cabling", "WiFi setup", "Basic security"] },
    pro: { name: "Professional", price: "Nu. 35,000", features: ["Up to 50 users", "Structured cabling", "Enterprise WiFi", "Advanced security", "Network monitoring"] },
    enterprise: { name: "Enterprise", price: "Custom", features: ["Unlimited users", "Full infrastructure", "Multi-site WiFi", "Enterprise security", "24/7 support"] }
  },
  "software-dev": {
    basic: { name: "Basic Website", price: "Nu. 35,000", features: ["5 pages", "CMS included", "Mobile responsive", "Contact form"] },
    pro: { name: "Professional", price: "Nu. 75,000", features: ["Custom design", "E-commerce ready", "SEO optimized", "Blog system", "Analytics"] },
    enterprise: { name: "Enterprise", price: "Custom", features: ["Full custom platform", "Advanced integrations", "Custom features", "Priority support", "SLA guarantee"] }
  },
  "power": {
    basic: { name: "Basic", price: "Nu. 8,500", features: ["1KVA UPS", "Basic protection", "Battery backup", "1-year warranty"] },
    pro: { name: "Professional", price: "Nu. 25,000", features: ["3KVA UPS", "AVR stabilizer", "Extended battery", "3-year warranty", "Maintenance included"] },
    enterprise: { name: "Enterprise", price: "Custom", features: ["Multi-unit system", "Generator integration", "Auto transfer switch", "5-year warranty", "24/7 support"] }
  },
  "hardware": {
    basic: { name: "Single PC", price: "Nu. 35,000", features: ["Business desktop", "Standard specs", "Office software", "1-year warranty"] },
    pro: { name: "Professional", price: "Nu. 80,000", features: ["Multiple PCs", "Upgraded specs", "Software suite", "Network setup", "3-year warranty"] },
    enterprise: { name: "Enterprise", price: "Custom", features: ["Bulk deployment", "Custom specs", "Volume licensing", "On-site support", "Extended warranty"] }
  }
};

// FAQs for each service
const serviceFAQs = {
  "pos-solutions": [
    { q: "How long does installation take?", a: "Standard POS installation takes 1-2 days including software setup and staff training." },
    { q: "Is there a monthly fee?", a: "We offer one-time lifetime license options. Optional cloud backup and updates are available annually." },
    { q: "Does it work offline?", a: "Yes! Our POS works completely offline. Syncs when internet is available." },
    { q: "Can I connect barcode scanner?", a: "Yes, all standard barcode scanners and receipt printers are supported." },
    { q: "Do you provide training?", a: "Yes, we provide comprehensive staff training during installation." }
  ],
  "hotel-pms": [
    { q: "How is pricing calculated?", a: "Pricing is based on room count. Contact us for a custom quote." },
    { q: "Does it integrate with OTAs?", a: "Yes, our channel manager connects to Booking.com, Agoda, and more." },
    { q: "Can guests book online?", a: "Yes, includes a booking engine for your website." },
    { q: "Is housekeeping included?", a: "Yes, full housekeeping management and room status tracking." },
    { q: "What about check-in/check-out?", a: "Complete front desk operations with guest history and billing." }
  ],
  "security-systems": [
    { q: "Can I view from mobile?", a: "Yes, view live cameras from anywhere via our mobile app." },
    { q: "How many cameras can I add?", a: "Systems support 4 to 32+ cameras depending on NVR." },
    { q: "Is night vision included?", a: "Yes, all cameras include IR night vision." },
    { q: "What about storage?", a: "NVR includes storage. Options for 1-week to 3-month recording." },
    { q: "Do you provide installation?", a: "Yes, professional installation and configuration included." }
  ],
  "biometric": [
    { q: "Fingerprint or face detection?", a: "We offer both fingerprint-only and face+fingerprint devices." },
    { q: "Can it control door access?", a: "Yes, connect to electronic door locks for access control." },
    { q: "How many users can it store?", a: "Devices support 1,000 to 10,000 users depending on model." },
    { q: "Is cloud software available?", a: "Yes, optional cloud-based attendance management software." },
    { q: "What about power backup?", a: "Devices include battery backup for power outages." }
  ],
  "networking": [
    { q: "What type of cabling?", a: "We use Cat6 cabling for Gigabit speeds." },
    { q: "Can you cover multiple floors?", a: "Yes, multi-floor cabling with proper routing." },
    { q: "WiFi coverage area?", a: "Enterprise APs cover 2,000+ sq ft each with mesh support." },
    { q: "Do you provide maintenance?", a: "Yes, AMC available for ongoing support." },
    { q: "Is network security included?", a: "Yes, firewall configuration and security best practices included." }
  ],
  "software-dev": [
    { q: "How long for a website?", a: "Typically 2-4 weeks depending on requirements." },
    { q: "Do you provide hosting?", a: "Yes, we can handle hosting and domain management." },
    { q: "What about updates?", a: "We provide ongoing maintenance and update packages." },
    { q: "Can I update content myself?", a: "Yes, all sites include a CMS for easy content updates." },
    { q: "Is mobile included?", a: "Yes, all projects are fully mobile responsive." }
  ],
  "power": [
    { q: "What capacity do I need?", a: "Depends on your equipment load. We'll calculate the right size." },
    { q: "How long is backup?", a: "Ranges from 30 minutes to several hours depending on battery size." },
    { q: "Does it auto-switch?", a: "Yes, instant switch to battery when power fails." },
    { q: "Can it connect to generator?", a: "Yes, can integrate with generator for extended backup." },
    { q: "What maintenance is needed?", a: "Annual battery testing and system health check recommended." }
  ],
  "hardware": [
    { q: "What specs do you offer?", a: "We configure based on your needs - office work, design, gaming, etc." },
    { q: "Do you provide warranties?", a: "Yes, manufacturer warranties plus our service guarantee." },
    { q: "Can you bulk order?", a: "Yes, volume pricing available for multiple units." },
    { q: "What about software?", a: "Can include Windows, Office, and other business software." },
    { q: "Do you offer AMC?", a: "Yes, annual maintenance contracts for hardware support." }
  ]
};

const services = [
  {
    id: "pos-solutions",
    name: "POS Solutions",
    subtitle: "Complete Retail & Restaurant Management",
    icon: Store,
    color: "from-orange-500 to-red-600",
    bgColor: "bg-gradient-to-br from-orange-500/10 to-red-600/10",
    borderColor: "border-orange-500/20",
    description: "Modern point-of-sale systems with real-time inventory tracking, multi-store support, and GST compliance for Bhutanese businesses.",
    features: [
      "Real-time inventory tracking",
      "Multi-store management",
      "GST & tax compliant",
      "Sales analytics & reporting",
      "Customer loyalty programs",
      "One-time lifetime license available"
    ],
    products: [
      { name: "Complete POS System (1st Time Setup)", description: "15\" touch screen, thermal printer, barcode scanner, cash drawer, software installation", price: "Nu. 50,000" },
      { name: "Annual Maintenance Contract (AMC)", description: "Software updates, technical support, preventive maintenance", price: "Nu. 12,000/year" },
      { name: "Additional Terminal", description: "Extra touch screen for multi-store", price: "Nu. 15,000" },
      { name: "Hardware Only (No Software)", description: "15\" touch screen, thermal printer, barcode scanner, cash drawer", price: "Nu. 35,000" }
    ]
  },
  {
    id: "hotel-pms",
    name: "Hotel PMS",
    subtitle: "Complete Property Management System",
    icon: Hotel,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-gradient-to-br from-blue-500/10 to-indigo-600/10",
    borderColor: "border-blue-500/20",
    description: "Comprehensive hotel management with booking engine, housekeeping schedules, and front desk operations designed for Bhutanese hospitality.",
    features: [
      "Online booking engine",
      "Front desk operations",
      "Housekeeping management",
      "Room service tracking",
      "Guest history & CRM",
      "Multi-currency support"
    ],
    products: [
      { name: "PMS Software (Monthly)", description: "Per month subscription based on room count", price: "Nu. 2,000/month" },
      { name: "Annual License", description: "Full year license, save 17%", price: "Nu. 24,000/year" },
      { name: "Channel Manager", description: "Connect to OTAs and booking sites", price: "Nu. 1,500/month" },
      { name: "Setup & Training", description: "Initial setup with staff training", price: "Nu. 10,000" }
    ]
  },
  {
    id: "security-systems",
    name: "Security Systems",
    subtitle: "CCTV & Surveillance Solutions",
    icon: Shield,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-gradient-to-br from-emerald-500/10 to-teal-600/10",
    borderColor: "border-emerald-500/20",
    description: "Advanced CCTV surveillance with AI-powered detection, remote monitoring via mobile, and complete security coverage.",
    features: [
      "AI-powered motion detection",
      "Remote mobile monitoring",
      "Night vision & IR",
      "NVR/DVR recording",
      "Multi-camera viewing",
      "2-year warranty on cameras"
    ],
    products: [
      { name: "4-Channel NVR System", description: "4 HD cameras + NVR + installation", price: "From Nu. 25,000" },
      { name: "8-Channel NVR System", description: "8 HD cameras + NVR + installation", price: "From Nu. 45,000" },
      { name: "Additional Camera", description: "Extra HD camera with night vision", price: "Nu. 4,500 each" },
      { name: "Annual Maintenance", description: "Quarterly check-ups and support", price: "Nu. 5,000/year" }
    ]
  },
  {
    id: "biometric",
    name: "Biometric Systems",
    subtitle: "Attendance & Access Control",
    icon: Fingerprint,
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-600/10",
    borderColor: "border-purple-500/20",
    description: "Fingerprint and facial recognition systems for attendance tracking and secure access control for offices and facilities.",
    features: [
      "Fingerprint recognition",
      "Face detection",
      "Attendance automation",
      "Door access control",
      "Visitor management",
      "Cloud-based reporting"
    ],
    products: [
      { name: "Fingerprint Device", description: "Standalone attendance system", price: "Nu. 8,500" },
      { name: "Face Recognition Device", description: "AI-powered face detection", price: "Nu. 18,000" },
      { name: "Access Control System", description: "Door lock + controller + 2 readers", price: "Nu. 35,000" },
      { name: "Software License", description: "Attendance management software", price: "Nu. 6,000/year" }
    ]
  },
  {
    id: "networking",
    name: "Network Infrastructure",
    subtitle: "Connectivity & IT Solutions",
    icon: Wifi,
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-gradient-to-br from-cyan-500/10 to-blue-600/10",
    borderColor: "border-cyan-500/20",
    description: "Complete networking solutions including structured cabling, enterprise WiFi, server installation, and network security.",
    features: [
      "Structured Cat6 cabling",
      "Enterprise WiFi setup",
      "Server installation",
      "Network security",
      "Preventive maintenance",
      "Remote configuration"
    ],
    products: [
      { name: "Office Network Setup", description: "Cabling + switch + WiFi for small office", price: "From Nu. 15,000" },
      { name: "Enterprise WiFi", description: "Commercial-grade access points", price: "Nu. 8,000/AP" },
      { name: "Server Rack Cabinet", description: "42U rack with PDU and accessories", price: "Nu. 25,000" },
      { name: "Network Switch", description: "24-port gigabit managed switch", price: "Nu. 12,000" }
    ]
  },
  {
    id: "software-dev",
    name: "Custom Software",
    subtitle: "Web, Mobile & SaaS Development",
    icon: Code,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-gradient-to-br from-violet-500/10 to-purple-600/10",
    borderColor: "border-violet-500/20",
    description: "Bespoke software solutions including websites, mobile apps, ERPs, and cloud platforms tailored to Bhutanese business needs.",
    features: [
      "Custom web development",
      "Mobile apps (iOS/Android)",
      "SaaS platforms",
      "E-commerce solutions",
      "API integrations",
      "Ongoing maintenance support"
    ],
    products: [
      { name: "Business Website", description: "Professional website with CMS", price: "From Nu. 35,000" },
      { name: "E-commerce Platform", description: "Full online store with payment", price: "From Nu. 65,000" },
      { name: "Mobile Application", description: "iOS or Android native app", price: "From Nu. 55,000" },
      { name: "Custom ERP/Software", description: "Tailored business management system", price: "From Nu. 120,000" }
    ]
  },
  {
    id: "power",
    name: "Power Solutions",
    subtitle: "UPS & Electrical Backup",
    icon: Zap,
    color: "from-yellow-500 to-orange-600",
    bgColor: "bg-gradient-to-br from-yellow-500/10 to-orange-600/10",
    borderColor: "border-yellow-500/20",
    description: "Uninterruptible power supply systems, generators, and electrical backup solutions ensuring continuous operations.",
    features: [
      "UPS systems",
      "Generator setup",
      "Power distribution units",
      "Battery backup",
      "Annual maintenance contracts",
      "Emergency support"
    ],
    products: [
      { name: "Online UPS (1KVA)", description: "For computers and small equipment", price: "Nu. 8,500" },
      { name: "Online UPS (3KVA)", description: "For servers and network equipment", price: "Nu. 22,000" },
      { name: "Battery Bank", description: "Extended backup power pack", price: "Nu. 15,000" },
      { name: "Annual Maintenance", description: "Quarterly check-ups and support", price: "Nu. 4,000/year" }
    ]
  },
  {
    id: "hardware",
    name: "Hardware Solutions",
    subtitle: "Computers, Laptops & Accessories",
    icon: Monitor,
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-gradient-to-br from-rose-500/10 to-pink-600/10",
    borderColor: "border-rose-500/20",
    description: "Complete hardware solutions including computers, laptops, printers, and IT accessories for businesses.",
    features: [
      "Desktop computers",
      "Laptops & notebooks",
      "Printers & scanners",
      "Projectors & displays",
      "IT accessories",
      "Warranty & support"
    ],
    products: [
      { name: "Business Desktop", description: "Core i5, 8GB RAM, 256GB SSD", price: "From Nu. 35,000" },
      { name: "Business Laptop", description: "Core i5, 8GB RAM, 15.6\" display", price: "From Nu. 45,000" },
      { name: "Laser Printer", description: "Network-capable laser printer", price: "From Nu. 12,000" },
      { name: "Annual AMC", description: "Complete hardware maintenance", price: "Nu. 3,000/year" }
    ]
  }
];

const stats = [
  { value: "300+", label: "Clients" },
  { value: "12+", label: "Years" },
  { value: "500+", label: "Projects" },
  { value: "20", label: "Dzongkhags" }
];

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-800/50 px-4 rounded-lg transition-colors"
      >
        <span className="font-medium text-slate-900 dark:text-white pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 px-4 text-slate-600 dark:text-slate-400">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pricing Tier Card
function PricingTierCard({
  tier,
  color,
  isRecommended
}: {
  tier: { name: string; price: string; features: string[] };
  color: string;
  isRecommended?: boolean;
}) {
  return (
    <div
      className={`relative p-6 rounded-2xl ${
        isRecommended
          ? `bg-gradient-to-br ${color} text-white shadow-xl scale-105`
          : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold">
          RECOMMENDED
        </div>
      )}
      <div className={`text-lg font-bold mb-2 ${!isRecommended && "text-slate-900 dark:text-white"}`}>
        {tier.name}
      </div>
      <div className={`text-3xl font-black mb-6 ${!isRecommended && "bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent"}`}>
        {tier.price}
      </div>
      <ul className="space-y-3">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <Check className={`w-5 h-5 flex-shrink-0 ${isRecommended ? "text-white" : "text-emerald-500"}`} />
            <span className={`text-sm ${isRecommended ? "text-white/90" : "text-slate-600 dark:text-slate-400"}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServicesContentNew() {
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<Record<string, number>>({});

  // Keyboard navigation - ESC to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedService) {
        setSelectedService(null);
        document.body.style.overflow = "";
      }
    },
    [selectedService]
  );

  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedService, handleKeyDown]);

  const toggleFAQ = (serviceId: string, index: number) => {
    setExpandedFAQ((prev) => {
      const key = `${serviceId}-${index}`;
      if (prev[key]) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: index };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      {/* Compact Stats Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3">
              Our Services
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Click any service for detailed pricing and information
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedService(service)}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-zinc-800 cursor-pointer"
                >
                  <div className={`relative h-36 ${service.bgColor} overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      <span className="text-xs font-semibold text-white">
                        {service.products.length} products
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                      {service.subtitle}
                    </p>

                    <div className="space-y-1.5 mb-4">
                      {service.features.slice(0, 3).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <div className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        {service.products[0].price}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f08_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-slate-400 mb-6">
            Get in touch with our team for a free consultation and quote
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/97517268753"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-full font-bold hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href="tel:+97517268753"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Full-Page Service Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-h-[calc(100vh-4rem)] w-full flex bg-white dark:bg-zinc-900 max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sidebar - Service List */}
              <div className="w-72 flex-shrink-0 border-r border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-zinc-800 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </button>
                </div>
                <div className="p-2">
                  {services.map((service) => {
                    const Icon = service.icon;
                    const isActive = selectedService.id === service.id;
                    return (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${service.color} text-white shadow-md`
                            : "hover:bg-white dark:hover:bg-zinc-900"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive ? "bg-white/20" : service.bgColor
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm ${isActive ? "text-white" : "text-slate-900 dark:text-white"}`}>
                            {service.name}
                          </div>
                          <div className={`text-xs truncate ${isActive ? "text-white/70" : "text-slate-500"}`}>
                            {service.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className={`relative h-48 ${selectedService.bgColor} overflow-hidden`}>
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:3rem_3rem]" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${selectedService.color} rounded-2xl flex items-center justify-center shadow-2xl`}>
                      <selectedService.icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-8">
                    <h2 className="text-3xl font-bold text-white">{selectedService.name}</h2>
                    <p className="text-white/80">{selectedService.subtitle}</p>
                  </div>
                </div>

                <div className="p-8 max-w-4xl">
                  {/* Description */}
                  <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">
                    {selectedService.description}
                  </p>

                  {/* Key Features */}
                  <div className="mb-10">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Key Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedService.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Tiers */}
                  {pricingTiers[selectedService.id as keyof typeof pricingTiers] && (
                    <div className="mb-10">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Pricing Plans</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        {Object.values(pricingTiers[selectedService.id as keyof typeof pricingTiers]).map((tier, i) => (
                          <PricingTierCard
                            key={i}
                            tier={tier}
                            color={selectedService.color}
                            isRecommended={i === 1}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQ Section */}
                  {serviceFAQs[selectedService.id as keyof typeof serviceFAQs] && (
                    <div className="mb-10">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                        Frequently Asked Questions
                      </h3>
                      <div className="space-y-1">
                        {serviceFAQs[selectedService.id as keyof typeof serviceFAQs].map((faq, i) => (
                          <FAQItem key={i} question={faq.q} answer={faq.a} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="https://wa.me/97517268753"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                    >
                      Get Quote for {selectedService.name}
                      <ArrowRight className="w-5 h-5" />
                    </a>
                    <a
                      href="tel:+97517268753"
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-200 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-zinc-700 transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      Call Us
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
