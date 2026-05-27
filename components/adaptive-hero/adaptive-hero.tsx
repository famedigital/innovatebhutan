"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDeviceCapabilities, getDeviceCategory } from "@/lib/device-detection";
import { getOptimalPerformanceTier, PerformanceMonitor, globalPerformanceMonitor } from "@/lib/performance-config";
import { TypewriterEffect } from "@/components/ui/typewriter-effect"; // To be created
import { MobileHero } from "./mobile-hero";
import { TabletHero } from "./tablet-hero";
import { DesktopHero } from "./desktop-hero";

interface HeroContainerProps {
  className?: string;
  children: React.ReactNode;
  showPerformanceInfo?: boolean;
}

interface AdaptiveHeroProps {
  className?: string;
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  onContact?: () => void;
  showPerformanceInfo?: boolean;
  heroContent?: any;
}

/**
 * Main Adaptive Hero Component
 *
 * Orchestrates different hero experiences based on device capabilities:
 * - Mobile: Lightweight experience with CSS animations only
 * - Tablet: Balanced experience with selective 3D effects
 * - Desktop: Full experience with WebGL and advanced interactions
 */
export function HeroContainer({ className, children, showPerformanceInfo }: HeroContainerProps) {
  const [performanceMode, setPerformanceMode] = React.useState<string>('loading');
  const [deviceInfo, setDeviceInfo] = React.useState<string>('');

  React.useEffect(() => {
    const monitor = globalPerformanceMonitor;
    monitor.start();

    const fpsSubscription = monitor.subscribe((fps) => {
      if (fps < 30) {
        setPerformanceMode('low');
      } else if (fps < 45) {
        setPerformanceMode('medium');
      } else {
        setPerformanceMode('high');
      }
    });

    // Clean up
    return () => {
      fpsSubscription();
      monitor.subscribe(() => {}); // Stop monitor
    };
  }, []);

  return (
    <div className={cn(
      "relative w-full min-h-screen overflow-hidden",
      className
    )}>
      {/* Performance overlay (for debugging) */}
      {showPerformanceInfo && (
        <div className="absolute top-4 right-4 z-50 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono">
          <div>FPS: {globalPerformanceMonitor.getCurrentFPS()}</div>
          <div>Mode: {performanceMode}</div>
        </div>
      )}

      {/* Children hero variant */}
      {children}
    </div>
  );
}

/**
 * Main Adaptive Hero - Orchestrates device-specific variants
 */
export function AdaptiveHero({
  className,
  heading = "WE BUILD DIGITAL WORLDS",
  description = "Premium IT solutions for the Himalayan region",
  ctaText = "Explore Our Services",
  ctaLink = "/services",
  secondaryCtaText,
  secondaryCtaLink,
  onContact,
  showPerformanceInfo = false,
  heroContent,
}: AdaptiveHeroProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const deviceCapabilities = useDeviceCapabilities();
  const deviceCategory = getDeviceCategory(deviceCapabilities);
  const performanceTier = getOptimalPerformanceTier(deviceCategory.type, deviceCapabilities);

  // Initialize performance monitor
  React.useEffect(() => {
    const monitor = globalPerformanceMonitor;
    monitor.start();

    const timer = setTimeout(() => {
      setIsLoaded(true);
      setIsInitializing(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      // Stop monitor when component unmounts
      monitor.subscribe(() => {});
    };
  }, []);

  // Determine which hero variant to render
  const renderHeroVariant = () => {
    if (isInitializing) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full"
          />
        </div>
      );
    }

    switch (deviceCategory.type) {
      case 'mobile':
        return (
          <MobileHero
            heading={heading}
            description={description}
            ctaText={ctaText}
            ctaLink={ctaLink}
            secondaryCtaText={secondaryCtaText}
            secondaryCtaLink={secondaryCtaLink}
            onContact={onContact}
            performanceTier={performanceTier}
            heroContent={heroContent}
          />
        );
      case 'tablet':
        return (
          <TabletHero
            heading={heading}
            description={description}
            ctaText={ctaText}
            ctaLink={ctaLink}
            secondaryCtaText={secondaryCtaText}
            secondaryCtaLink={secondaryCtaLink}
            onContact={onContact}
            performanceTier={performanceTier}
            heroContent={heroContent}
          />
        );
      case 'desktop':
        return (
          <DesktopHero
            heading={heading}
            description={description}
            ctaText={ctaText}
            ctaLink={ctaLink}
            secondaryCtaText={secondaryCtaText}
            secondaryCtaLink={secondaryCtaLink}
            onContact={onContact}
            performanceTier={performanceTier}
            heroContent={heroContent}
          />
        );
      default:
        return (
          <MobileHero
            heading={heading}
            description={description}
            ctaText={ctaText}
            ctaLink={ctaLink}
            secondaryCtaText={secondaryCtaText}
            secondaryCtaLink={secondaryCtaLink}
            onContact={onContact}
            performanceTier={performanceTier}
            heroContent={heroContent}
          />
        );
    }
  };

  return (
    <HeroContainer className={className} showPerformanceInfo={showPerformanceInfo}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${deviceCategory.type}-${performanceTier.id}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {renderHeroVariant()}
        </motion.div>
      </AnimatePresence>
    </HeroContainer>
  );
}

/**
 * Performance indicator component (for debugging/monitoring)
 */
export function PerformanceIndicator({ tier }: { tier: any }) {
  return (
    <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono z-50">
      <div>Device: {tier.id}</div>
      <div>Particles: {tier.particleCount}</div>
      <div>FPS: {tier.maxFPS}</div>
      <div>3D: {tier.enable3D ? '✓' : '✗'}</div>
      <div>WebGL: {tier.enableWebGL ? '✓' : '✗'}</div>
    </div>
  );
}

export { AdaptiveHero as default };