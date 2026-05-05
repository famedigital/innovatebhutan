"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { useMousePosition } from "@/hooks/use-mouse-position";
import { use3dTilt, useGlareEffect } from "@/hooks/use-3d-tilt";

interface InteractiveShowcaseProps {
  hoveredService: string | null;
  services: Array<{
    name: string;
    category: string;
    gradient: string;
    icon: any;
    image?: string;
  }>;
}

/**
 * Interactive showcase component with Hollywood-style visual effects
 * Features: 3D tilt, mouse-following spotlight, parallax layers, magnetic effects
 */
export function InteractiveShowcase({ hoveredService, services }: InteractiveShowcaseProps) {
  const mousePosition = useMousePosition();
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update spotlight position with smooth animation
  useEffect(() => {
    if ('ontouchstart' in window) return;

    const updateSpotlight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((mousePosition.x - rect.left) / rect.width) * 100;
        const y = ((mousePosition.y - rect.top) / rect.height) * 100;

        setSpotlightPosition({ x, y });
      }
    };

    updateSpotlight();
  }, [mousePosition]);

  // Find current service to display
  const currentService = hoveredService
    ? services.find(s => s.name === hoveredService)
    : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square sm:aspect-auto sm:h-[550px] rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      {/* Mouse-following spotlight effect */}
      {!currentService && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle 300px at ${spotlightPosition.x}% ${spotlightPosition.y}%, rgba(57, 255, 20, 0.15), transparent 40%)`,
          }}
        />
      )}

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, #0f172a 1px, transparent 1px),
              linear-gradient(to bottom, #0f172a 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Animated particles */}
      {!currentService && <ParticleEffect />}

      {/* Service showcase or grid */}
      {currentService ? (
        <ServiceSpotlight service={currentService} mousePosition={mousePosition} />
      ) : (
        <ServiceGrid services={services} mousePosition={mousePosition} cardRefs={cardRefs} />
      )}

      {/* Subtle vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.1) 100%)',
        }}
      />
    </div>
  );
}

/**
 * Single service spotlight with enhanced interactive effects
 */
function ServiceSpotlight({ service, mousePosition }: { service: any; mousePosition: any }) {
  const { ref, style, isHovering } = use3dTilt({
    maxTilt: 20,
    scale: 1.08,
    speed: 400,
  });

  return (
    <motion.div
      ref={ref}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-4 rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => {
        // Navigate to service page
        window.location.href = `/services?category=${encodeURIComponent(service.category)}`;
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
        style={{ background: service.gradient }}
      />

      {/* Service icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <service.icon className="w-32 h-32 text-white/20 group-hover:text-white/30 transition-colors duration-300" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 sm:p-8">
        <div className="absolute bottom-0 left-0 right-0">
          <h3 className="text-white text-2xl sm:text-3xl font-bold mb-2">{service.name}</h3>
          <p className="text-white/70 text-sm sm:text-base mb-4">{service.category}</p>
          <div className="flex items-center gap-2 text-white/80 text-xs sm:text-sm">
            <span>Learn more</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Interactive glare effect */}
      {isHovering && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 200px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.3), transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
}

/**
 * Service grid with parallax cards
 */
function ServiceGrid({
  services,
  mousePosition,
  cardRefs
}: {
  services: any[];
  mousePosition: any;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  // Display 4 services in 2x2 grid
  const displayServices = services.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 p-4 sm:p-6 h-full">
      {displayServices.map((service, index) => (
        <ParallaxServiceCard
          key={service.name}
          service={service}
          index={index}
          mousePosition={mousePosition}
          ref={(el) => (cardRefs.current[index] = el)}
        />
      ))}
    </div>
  );
}

/**
 * Individual service card with parallax effect
 */
function ParallaxServiceCard({
  service,
  index,
  mousePosition
}: {
  service: any;
  index: number;
  mousePosition: any;
  ref: (el: HTMLDivElement | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [parallaxStyle, setParallaxStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!cardRef.current || 'ontouchstart' in window) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Calculate parallax offset based on mouse position
    const offsetX = ((mousePosition.x - rect.left - rect.width / 2) / window.innerWidth) * 20;
    const offsetY = ((mousePosition.y - rect.top - rect.height / 2) / window.innerHeight) * 20;

    setParallaxStyle({
      transform: `translate(${offsetX}px, ${offsetY}px)`,
    });
  }, [mousePosition, index]);

  return (
    <motion.div
      ref={cardRef}
      style={parallaxStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => {
        window.location.href = `/services?category=${encodeURIComponent(service.category)}`;
      }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
        style={{ background: service.gradient }}
      />

      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <service.icon className="w-12 h-12 text-white/40 group-hover:text-white/60 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-3 sm:p-4">
        <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
          <h3 className="text-white text-xs sm:text-sm font-bold line-clamp-1">{service.name}</h3>
          <p className="text-white/70 text-[10px] sm:text-xs">{service.category}</p>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
    </motion.div>
  );
}

/**
 * Animated particle background effect
 */
function ParticleEffect() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}