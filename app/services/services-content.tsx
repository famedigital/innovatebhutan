"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Store, Utensils, Hotel, Code, Database, LayoutGrid,
  Wrench, Shield, Zap, Smartphone, FileText, Users, Search,
  X, Plus, Minus, ChevronRight, ShoppingCart, Check, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// 12 Services with premium gradients
const allServices = [
  {
    id: "pos-solutions",
    name: "POS Solutions",
    shortName: "POS",
    icon: Store,
    gradient: "linear-gradient(145deg, #FF6B35, #DC2626, #B91C1C)",
    category: "POS Systems",
    subs: ["Retail POS", "Restaurant POS"],
    description: "Modern point-of-sale systems for retail and hospitality businesses with real-time inventory tracking and multi-store support.",
    features: ["Inventory Management", "Multi-store Support", "Real-time Analytics", "Receipt Printing", "Barcode Scanning"]
  },
  {
    id: "hotel-pms",
    name: "Hotel PMS",
    shortName: "Hotel",
    icon: Hotel,
    gradient: "linear-gradient(145deg, #3B82F6, #4F46E5, #4338CA)",
    category: "POS Systems",
    description: "Complete property management for hotels and hospitality with booking engine and housekeeping schedules.",
    features: ["Booking Management", "Housekeeping", "Front Desk Operations", "Room Service", "Guest History"]
  },
  {
    id: "web-development",
    name: "Web Development",
    shortName: "Web",
    icon: Code,
    gradient: "linear-gradient(145deg, #A855F7, #EC4899, #DB2777)",
    category: "Web/SaaS",
    description: "Custom web applications built with modern frameworks like React, Next.js, and TypeScript.",
    features: ["React", "Next.js", "TypeScript", "API Integration", "Responsive Design"]
  },
  {
    id: "saas-development",
    name: "SaaS Development",
    shortName: "SaaS",
    icon: Database,
    gradient: "linear-gradient(145deg, #8B5CF6, #7C3AED, #6D28D9)",
    category: "Web/SaaS",
    description: "Scalable SaaS platforms with subscription billing, multi-tenant architecture, and cloud deployment.",
    features: ["Cloud Architecture", "API Design", "Subscription Billing", "Multi-tenant", "Analytics Dashboard"]
  },
  {
    id: "erp-development",
    name: "ERP Development",
    shortName: "ERP",
    icon: LayoutGrid,
    gradient: "linear-gradient(145deg, #6366F1, #2563EB, #1D4ED8)",
    category: "Web/SaaS",
    description: "Enterprise resource planning covering finance, HR, and supply chain management.",
    features: ["Finance Module", "HR Management", "Supply Chain", "Reporting", "Workflow Automation"]
  },
  {
    id: "mobile-app",
    name: "Mobile App Development",
    shortName: "Mobile",
    icon: Smartphone,
    gradient: "linear-gradient(145deg, #14B8A6, #0891B2, #0E7490)",
    category: "Web/SaaS",
    description: "Native and cross-platform mobile applications for iOS and Android with React Native.",
    features: ["iOS Development", "Android Development", "React Native", "App Store Deployment", "Push Notifications"]
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    shortName: "Infra",
    icon: Wrench,
    gradient: "linear-gradient(145deg, #64748B, #71717A, #52525B)",
    category: "Infrastructure",
    subs: ["Hardware", "Network", "Power"],
    description: "Complete IT infrastructure including servers, networking, and power backup solutions.",
    features: ["Server Setup", "Network Cabling", "Power Backup", "Rack Installation", "Maintenance"]
  },
  {
    id: "security-systems",
    name: "Security Systems",
    shortName: "Security",
    icon: Shield,
    gradient: "linear-gradient(145deg, #EF4444, #E11D48, #BE123C)",
    category: "Security",
    subs: ["CCTV", "Anti Theft"],
    description: "Advanced security and surveillance with CCTV, access control, and anti-theft systems.",
    features: ["CCTV Installation", "Access Control", "Alarm Systems", "Remote Monitoring", "Motion Detection"]
  },
  {
    id: "technical-maintenance",
    name: "Technical Maintenance",
    shortName: "Maintenance",
    icon: Zap,
    gradient: "linear-gradient(145deg, #22C55E, #10B981, #059669)",
    category: "Maintenance",
    description: "Ongoing technical support with 24/7 monitoring, on-site service, and remote assistance.",
    features: ["24/7 Support", "On-site Service", "Remote Monitoring", "Preventive Maintenance", "SLA Guarantee"]
  },
  {
    id: "payroll-hr",
    name: "Payroll & HR",
    shortName: "HR",
    icon: Users,
    gradient: "linear-gradient(145deg, #F43F5E, #EC4899, #BE185D)",
    category: "Web/SaaS",
    description: "White-label HR and payroll management with attendance tracking and compliance reporting.",
    features: ["Payroll Processing", "HR Management", "Attendance Tracking", "Compliance", "Employee Self-Service"]
  },
  {
    id: "gst-services",
    name: "GST Services",
    shortName: "GST",
    icon: FileText,
    gradient: "linear-gradient(145deg, #EAB308, #D97706, #B45309)",
    category: "Business Services",
    description: "Complete GST services including registration, filing, and consultation for tax compliance.",
    features: ["GST Registration", "Return Filing", "Consultation", "Compliance Check", "Tax Planning"]
  },
  {
    id: "it-consulting",
    name: "IT Consulting",
    shortName: "Consulting",
    icon: Search,
    gradient: "linear-gradient(145deg, #06B6D4, #3B82F6, #2563EB)",
    category: "Consulting",
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

// Cart item type
interface CartItem {
  service: typeof allServices[0];
  subService?: string;
}

// App Store Style Card
function AppStoreCard({
  service,
  index,
  onPress,
  isSelected
}: {
  service: typeof allServices[0];
  index: number;
  onPress: () => void;
  isSelected: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = service.icon;
  const hasSubs = service.subs;

  const colorMatch = service.gradient.match(/#[A-F0-9]{6}/gi);
  const primaryColor = colorMatch?.[0] || '#10B981';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 200, damping: 20 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPress}
    >
      <div className="relative mb-3 mx-auto" style={{ width: '68px', height: '68px' }}>
        {isHovered && (
          <div
            className="absolute inset-0 rounded-3xl blur-xl opacity-40 transition-opacity duration-300"
            style={{ background: service.gradient }}
          />
        )}

        <div
          className="relative w-full h-full rounded-3xl flex items-center justify-center shadow-lg"
          style={{
            background: service.gradient,
            boxShadow: isSelected
              ? `0 0 0 3px ${primaryColor}`
              : isHovered
              ? `0 20px 40px -10px ${primaryColor}40`
              : '0 4px 20px -4px rgba(0,0,0,0.12)',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <Icon className="w-8 h-8 text-white" />
          {hasSubs && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-md">
              <span className="text-[9px]" style={{ color: primaryColor }}>
                {service.subs?.length || 0}
              </span>
            </div>
          )}
        </div>
      </div>

      <h3 className={`text-center text-xs mb-0.5 transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
        {service.shortName}
      </h3>
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

// Service Detail Panel
function ServiceDetailPanel({
  service,
  onAddToCart,
  isInCart
}: {
  service: typeof allServices[0];
  onAddToCart: (subService?: string) => void;
  isInCart: (subService?: string) => boolean;
}) {
  const Icon = service.icon;
  const hasSubs = service.subs;
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
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
      {/* Header - Mobile Play Store style or Desktop icon */}
      {isMobile ? (
        // Play Store style header for mobile
        <>
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ background: service.gradient }}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground leading-tight">{service.name}</h2>
              <p className="text-sm text-foreground/60">{service.category}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((star) => (
                    <svg key={star} className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.78-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-foreground/40">4.9</span>
              </div>
            </div>
          </div>

          {/* Screenshot Gallery - Play Store style */}
          <div className="mb-6 -mx-2">
            <div className="flex gap-3 overflow-x-auto px-2 scrollbar-hide snap-x">
              {[1,2,3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-72 h-40 rounded-2xl snap-center"
                  style={{
                    background: `linear-gradient(135deg, ${
                      service.gradient.match(/#[A-F0-9]{6}/gi)?.[i % 3] || '#10B981'
                    }${[15,30,45][i-1]}, ${
                      service.gradient.match(/#[A-F0-9]{6}/gi)?.[(i+1) % 3] || '#059669'
                    })`,
                  }}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-2xl"
            style={{ background: service.gradient }}
          >
            <Icon className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-lg text-foreground mb-1">{service.name}</h2>
          <p className="text-xs text-foreground/50">{service.category}</p>
        </div>
      )}

      {/* Description - Play Store style */}
      <div className="mb-6">
        <h3 className={`font-semibold text-foreground mb-2 ${isMobile ? 'text-base' : 'text-xs uppercase tracking-wider'}`}>
          About this {isMobile ? '' : 'service'}
        </h3>
        <p className="text-sm text-foreground/70 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h3 className={`font-semibold text-foreground mb-3 ${isMobile ? 'text-base' : 'text-xs uppercase tracking-wider'}`}>
          Features
        </h3>
        <div className="flex flex-wrap gap-2">
          {service.features.map((feature, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground/70"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Sub-services */}
      {hasSubs && (
        <div className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-foreground/50 mb-4">Includes</h3>
          <div className="space-y-2">
            {service.subs?.map((sub, i) => {
              const inCart = isInCart(sub);
              return (
                <motion.button
                  key={sub}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onAddToCart(sub)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    inCart ? 'bg-primary/20' : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: service.gradient }}>
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                    <span className="text-sm text-foreground">{sub}</span>
                  </div>
                  {inCart ? (
                    <Check className="w-5 h-5 text-primary" />
                  ) : (
                    <Plus className="w-5 h-5 text-foreground/40" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add main service button */}
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
    </motion.div>
  );
}

// iOS-style Cart Panel
function CartPanel({
  cart,
  onRemove,
  onClear,
  isOpen
}: {
  cart: CartItem[];
  onRemove: (index: number) => void;
  onClear: () => void;
  isOpen: boolean;
}) {
  const whatsappNumber = "97517268753";

  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return "";

    let message = "Hi Innovates.bt, I'm interested in:\n\n";
    cart.forEach((item, i) => {
      message += `${i + 1}. ${item.service.name}`;
      if (item.subService) {
        message += ` (${item.subService})`;
      }
      message += "\n";
    });
    message += "\nPlease provide more details.";
    return encodeURIComponent(message);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Compact Header */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm text-foreground leading-tight">Selection</h3>
              {cart.length > 0 && (
                <p className="text-[10px] text-foreground/40">{cart.length} item{cart.length > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          {cart.length > 1 && (
            <button
              onClick={onClear}
              className="text-[10px] text-foreground/40 hover:text-red-500 transition-colors px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Cart Items - Compact */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence initial={false}>
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                <ShoppingCart className="w-6 h-6 text-foreground/20" />
              </div>
              <p className="text-xs text-foreground/40">Add services to get started</p>
            </motion.div>
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
                  className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 group relative overflow-hidden"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.service.gradient }}
                  >
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate leading-tight">{item.service.shortName}</p>
                    {item.subService && (
                      <p className="text-[10px] text-foreground/40 truncate leading-tight">{item.subService}</p>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemove(index)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-foreground/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* WhatsApp Button - Compact */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-3 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 text-sm ${
            cart.length > 0
              ? 'bg-primary text-black hover:bg-primary/90'
              : 'bg-zinc-100 dark:bg-zinc-800 text-foreground/30 cursor-not-allowed'
          }`}
          onClick={(e) => {
            if (cart.length === 0) e.preventDefault();
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {cart.length > 0 ? 'Contact' : 'Empty'}
        </a>
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
      if (item.subService) message += ` (${item.subService})`;
      message += "\n";
    });
    message += "\nPlease provide more details.";
    return encodeURIComponent(message);
  };

  return (
    <>
      {/* Fixed Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch">
          {/* Cart Summary */}
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="flex-1 flex items-center justify-between px-4 py-3 bg-primary text-black"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
            </div>
            <ChevronRight className={`w-5 h-5 transition-transform ${cartOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-6 flex items-center justify-center transition-colors ${cart.length > 0 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}
            onClick={(e) => { if (cart.length === 0) e.preventDefault(); }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>

        {/* Expandable Cart Sheet */}
        <AnimatePresence>
          {cartOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-h-[60vh] overflow-y-auto bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="p-4 space-y-2">
                {cart.map((item, index) => {
                  const Icon = item.service.icon;
                  return (
                    <motion.div
                      key={`${item.service.id}-${item.subService || 'main'}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.service.gradient }}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.service.shortName}</p>
                        {item.subService && <p className="text-xs text-foreground/40">{item.subService}</p>}
                      </div>
                      <button onClick={() => onRemove(index)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  );
                })}
                {cart.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                      <ShoppingCart className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Your selection is empty</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Add services to continue</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer for fixed footer */}
      <div className="h-16 lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
    </>
  );
}

export function ServiceBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<typeof allServices[0] | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Set category from URL param
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.some(c => c.value === categoryParam || c.name === categoryParam)) {
      setActiveCategory(categoryParam === "POS Systems" ? "POS Systems" : categoryParam);
    }
  }, [searchParams]);

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

  const filteredServices = activeCategory === "all"
    ? allServices
    : allServices.filter(s => s.category === activeCategory);

  const addToCart = (subService?: string) => {
    if (!selectedService) return;

    // Check if already exists
    const exists = cart.some(
      item => item.service.id === selectedService.id && item.subService === subService
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

  const isInCart = (subService?: string) => {
    return cart.some(
      item => item.service.id === selectedService?.id && item.subService === subService
    );
  };

  const handleServiceClick = (service: typeof allServices[0]) => {
    setSelectedService(service);
  };

  const handleBack = () => {
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Dynamic Header */}
      <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border-b border-zinc-200/30 dark:border-zinc-800/30 sticky top-12 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          {selectedService ? (
            // Detail View Header - Ultra Compact
            <div className="flex items-center gap-3">
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground transition-all px-2 py-1.5 rounded-xl hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
              <motion.div
                key="detail-title"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1"
              >
                <h2 className="text-base sm:text-lg text-foreground font-medium tracking-tight">
                  {selectedService.shortName}
                </h2>
              </motion.div>
              {/* Animated cart badge */}
              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-primary/20 to-primary/10 px-2.5 py-1 rounded-full border border-primary/20"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">{cart.length}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Grid View Header - Premium
            <div className="flex items-center justify-between gap-4">
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
              {/* Cart indicator - Premium */}
              <div className="flex items-center">
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
          )}
          {/* Mobile category pills - Sleek horizontal scroll */}
          {!selectedService && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:hidden -mx-4 px-4"
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
                      ? "bg-primary text-black shadow-lg shadow-primary/25"
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
            className="max-w-5xl mx-auto px-6 pt-24 pb-10"
          >
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-x-6 gap-y-8">
              {filteredServices.map((service, index) => (
                <AppStoreCard
                  key={service.id}
                  service={service}
                  index={index}
                  onPress={() => handleServiceClick(service)}
                  isSelected={false}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          // Detail View - Three Panel Layout
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto px-6 py-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-180px)] lg:h-[calc(100vh-200px)]">
              {/* Left Panel - Service List */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3 overflow-y-auto space-y-2 pr-2"
              >
                {filteredServices.map((service) => (
                  <ServiceListItem
                    key={service.id}
                    service={service}
                    isSelected={selectedService.id === service.id}
                    onPress={() => setSelectedService(service)}
                  />
                ))}
              </motion.div>

              {/* Middle Panel - Service Details */}
              <div className="lg:col-span-6 bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 lg:p-8 border border-zinc-200 dark:border-zinc-800 overflow-y-auto min-h-[60vh] lg:min-h-0 lg:h-[calc(100vh-200px-3rem)]">
                <AnimatePresence mode="wait">
                  {selectedService && (
                    <ServiceDetailPanel
                      key={selectedService.id}
                      service={selectedService}
                      onAddToCart={addToCart}
                      isInCart={isInCart}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Right Panel - Cart - Desktop only */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block lg:col-span-3"
              >
                <CartPanel
                  cart={cart}
                  onRemove={removeFromCart}
                  onClear={clearCart}
                  isOpen={true}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Mobile Footer Cart - Amazon Style */}
        {selectedService && (
          <MobileFooterCart
            cart={cart}
            onRemove={removeFromCart}
            cartOpen={cartOpen}
            setCartOpen={setCartOpen}
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
