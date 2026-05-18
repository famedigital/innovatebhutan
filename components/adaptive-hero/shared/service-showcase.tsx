"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Info, Phone, Mail, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PerformanceTier } from "@/lib/performance-config";
import { use3dTilt } from "@/hooks/use-3d-tilt";
import { useGlareEffect } from "@/hooks/use-3d-tilt";

interface Service {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  gradient: string;
  features: string[];
  stats: string;
  demoUrl?: string;
  contact?: {
    email: string;
    phone: string;
  };
}

interface ServiceDemoProps {
  performanceTier: PerformanceTier;
  onServiceClick?: (serviceId: string) => void;
  onContact?: (service: Service) => void;
}

/**
 * Interactive Service Demo System
 *
 * Features device-specific interactions:
 * - Mobile: Touch-friendly cards, swipe gestures
 * - Tablet: Enhanced hover effects, tilt interactions
 * - Desktop: 3D models, mouse-controlled rotation, advanced effects
 */
export function ServiceShowcase({ performanceTier, onServiceClick, onContact }: ServiceDemoProps) {
  const router = useRouter();
  const [activeService, setActiveService] = React.useState<string>('pos');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isAutoRotating, setIsAutoRotating] = React.useState(true);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  // Core services with enhanced data
  const services: Service[] = [
    {
      id: 'pos',
      name: 'POS Systems',
      description: 'Modern retail point-of-sale solutions with real-time analytics',
      icon: require('lucide-react').Store,
      iconColor: '#10B981',
      gradient: 'from-green-500 to-blue-600',
      features: [
        'Real-time inventory management',
        'Customer analytics dashboard',
        'Multi-location support',
        'Mobile payment integration',
        'Automated reporting'
      ],
      stats: '99.9% uptime',
      demoUrl: '/services/pos-demo',
      contact: {
        email: 'pos@innovatebhutan.com',
        phone: '+975 2 323 456'
      }
    },
    {
      id: 'hotel',
      name: 'Hotel Management',
      description: 'Comprehensive property management system for hospitality',
      icon: require('lucide-react').Hotel,
      iconColor: '#3B82F6',
      gradient: 'from-blue-500 to-purple-600',
      features: [
        'Room booking management',
        'Guest CRM system',
        'Restaurant POS integration',
        'Financial reporting',
        'Channel manager'
      ],
      stats: '500+ hotels',
      demoUrl: '/services/hotel-demo',
      contact: {
        email: 'hotel@innovatebhutan.com',
        phone: '+975 2 323 457'
      }
    },
    {
      id: 'security',
      name: 'Security Systems',
      description: 'Advanced surveillance and access control solutions',
      icon: require('lucide-react').Shield,
      iconColor: '#8B5CF6',
      gradient: 'from-purple-500 to-pink-600',
      features: [
        'AI-powered monitoring',
        'Biometric access control',
        'Real-time alerts',
        'Cloud storage integration',
        'Mobile app access'
      ],
      stats: '24/7 monitoring',
      demoUrl: '/services/security-demo',
      contact: {
        email: 'security@innovatebhutan.com',
        phone: '+975 2 323 458'
      }
    }
  ];

  const activeServiceData = services.find(s => s.id === activeService);

  // 3D tilt effect for enhanced interaction
  const tiltRef = React.useRef<HTMLDivElement>(null);
  const { ref: tiltRefObj, style: tiltStyle, isHovering: isTilting } = use3dTilt({
    maxTilt: 15,
    perspective: 1000,
    scale: 1.05,
    speed: 300,
  });

  // Glare effect for premium look
  const glareRef = React.useRef<HTMLDivElement>(null);
  const { glareStyle } = useGlareEffect({ maxGlare: 0.5 });

  // Auto-rotation timer
  React.useEffect(() => {
    if (!performanceTier.enableAdvancedEffects || !isAutoRotating) return;

    const timer = setInterval(() => {
      const currentIndex = services.findIndex(s => s.id === activeService);
      const nextIndex = (currentIndex + 1) % services.length;
      setActiveService(services[nextIndex].id);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeService, performanceTier.enableAdvancedEffects, isAutoRotating]);

  // Touch handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      // Swipe detected
      const currentIndex = services.findIndex(s => s.id === activeService);
      if (diff > 0) {
        // Swipe left - next service
        const nextIndex = (currentIndex + 1) % services.length;
        setActiveService(services[nextIndex].id);
      } else {
        // Swipe right - previous service
        const prevIndex = (currentIndex - 1 + services.length) % services.length;
        setActiveService(services[prevIndex].id);
      }
    }

    setTouchStart(null);
  };

  const handleServiceClick = (serviceId: string) => {
    setActiveService(serviceId);
    setIsExpanded(!isExpanded);
    onServiceClick?.(serviceId);
  };

  const handleContactClick = (service: Service) => {
    onContact?.(service);
  };

  const handleDemoClick = (url?: string) => {
    if (url) {
      router.push(url);
    }
  };

  // Render based on performance tier
  const renderServiceCard = (service: Service) => {
    const isActive = service.id === activeService;

    if (performanceTier.type === 'mobile') {
      return (
        <motion.div
          key={service.id}
          className={cn(
            "p-4 rounded-xl cursor-pointer transition-all duration-300",
            isActive ? "bg-white/10 border border-white/20 shadow-lg" : "bg-white/5 hover:bg-white/10"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleServiceClick(service.id)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${service.gradient} flex items-center justify-center`}>
              <service.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{service.name}</h3>
              <p className="text-sm text-white/70">{service.description}</p>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={service.id}
        ref={isActive ? tiltRefObj : null}
        className={cn(
          "relative p-6 rounded-xl cursor-pointer overflow-hidden",
          isActive ? "bg-white/10 border border-white/20 shadow-2xl" : "bg-white/5 hover:bg-white/10"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleServiceClick(service.id)}
        style={isActive ? tiltStyle : {}}
      >
        {/* Background gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br opacity-20"
          style={{ background: service.gradient }}
        />

        {/* Glare effect */}
        {isActive && performanceTier.enableAdvancedEffects && (
          <motion.div
            ref={glareRef}
            className="absolute inset-0 pointer-events-none"
            style={glareStyle}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg`}>
              <service.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{service.name}</h3>
              <p className="text-white/80">{service.description}</p>
            </div>
          </div>

          {/* Stats */}
          {isActive && (
            <motion.div
              className="mt-4 text-sm text-white/70 bg-white/10 rounded-lg px-3 py-1 inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {service.stats}
            </motion.div>
          )}
        </div>

        {/* Active service highlight */}
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div className="w-4 h-4 bg-white rounded-full" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Interactive Service Showcase</h2>
        <p className="text-white/70">
          Explore our premium solutions with interactive demos
        </p>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {services.map((service) => renderServiceCard(service))}
      </div>

      {/* Expanded Service Details */}
      <AnimatePresence>
        {isExpanded && activeServiceData && (
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Service Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${activeServiceData.gradient} flex items-center justify-center`}>
                    <activeServiceData.icon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{activeServiceData.name}</h3>
                    <p className="text-white/70">{activeServiceData.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {activeServiceData.features.map((feature, index) => (
                      <motion.li
                        key={index}
                        className="flex items-center gap-2 text-white/80"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                        {feature}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Auto-rotation control */}
                {performanceTier.enableAdvancedEffects && (
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <div className={`w-2 h-2 rounded-full ${isAutoRotating ? 'bg-green-400' : 'bg-gray-400'}`} />
                    <span>Auto-rotation {isAutoRotating ? 'ON' : 'OFF'}</span>
                    <button
                      className="ml-2 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      onClick={() => setIsAutoRotating(!isAutoRotating)}
                    >
                      {isAutoRotating ? 'Pause' : 'Play'}
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex-1">
                <div className="space-y-4">
                  {/* Demo Button */}
                  <motion.button
                    className="w-full flex items-center gap-3 justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoClick(activeServiceData.demoUrl)}
                  >
                    <Play className="w-5 h-5" />
                    Live Demo
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>

                  {/* Contact Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleContactClick(activeServiceData)}
                    >
                      <Phone className="w-5 h-5" />
                      Call
                    </motion.button>
                    <motion.button
                      className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleContactClick(activeServiceData)}
                    >
                      <Mail className="w-5 h-5" />
                      Email
                    </motion.button>
                  </div>

                  {/* Stats */}
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-white/60 text-sm">Performance</div>
                    <div className="text-green-400 font-bold text-lg">{activeServiceData.stats}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Touch instruction for mobile */}
      {performanceTier.type === 'mobile' && (
        <div className="text-center mt-6 text-white/60 text-sm">
          Swipe left/right to browse services
        </div>
      )}
    </div>
  );
}