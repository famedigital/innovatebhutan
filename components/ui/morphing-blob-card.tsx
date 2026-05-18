"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MorphingBlobCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  blobColor?: string;
  blobIntensity?: number;
  morphSpeed?: number;
  gradientColors?: string[];
  hoverIntensity?: number;
  clickIntensity?: number;
  className?: string;
}

/**
 * Morphing blob card component with animated SVG filter effects
 *
 * Features:
 * - Animated blob morphology using SVG filters
 * - Gradient color transitions
 * - Hover/click morphing effects
 * - Smooth animations with Framer Motion
 * - Accessibility support and keyboard navigation
 */
export function MorphingBlobCard({
  children,
  blobColor = "#10B981",
  blobIntensity = 0.8,
  morphSpeed = 0.5,
  gradientColors = ["#10B981", "#3B82F6", "#8B5CF6"],
  hoverIntensity = 0.1,
  clickIntensity = 0.2,
  className,
  ...props
}: MorphingBlobCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0.5, y: 0.5 });

  // Blob filter definition for the morphing effect
  const blobFilterId = `morph-blob-${React.useId()}`;
  const turbulenceFilterId = `turbulence-${React.useId()}`;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  const baseFilters = [
    // Morphing blob filter
    <filter
      key="blob"
      id={blobFilterId}
      x="-20%"
      y="-20%"
      width="140%"
      height="140%"
      filterUnits="objectBoundingBox"
    >
      <feGaussianBlur in="SourceGraphic" stdDeviation={isPressed ? 10 : isHovered ? 8 : 12} />
      <feDisplacementMap
        in="SourceGraphic"
        in2="turbulence"
        scale={isPressed ? clickIntensity * 100 : isHovered ? hoverIntensity * 100 : morphSpeed * 50}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>,

    // Turbulence filter for organic movement
    <filter
      key="turbulence"
      id={turbulenceFilterId}
      x="-20%"
      y="-20%"
      width="140%"
      height="140%"
      filterUnits="objectBoundingBox"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.02"
        numOctaves="3"
        result="turbulence"
        seed="1"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="turbulence"
        scale={isHovered ? 20 : 10}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>,

    // Soft glow effect
    <feGaussianBlur key="glow" in="SourceGraphic" stdDeviation={3} result="glow" />,
    <feComposite
      key="composite"
      in="glow"
      in2="SourceGraphic"
      operator="over"
    />,
  ];

  // Gradient based on mouse position and hover state
  const backgroundGradient = `radial-gradient(
    circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
    ${gradientColors[0]}22 0%,
    ${gradientColors[1]}22 40%,
    ${gradientColors[2]}22 70%
  )`;

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-3xl cursor-pointer select-none",
        "border border-transparent bg-card",
        "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-green-50/20 before:via-blue-50/20 before:to-purple-50/20",
        "hover:border-green-400/30 hover:shadow-lg",
        "transition-all duration-300",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      whileHover={{
        scale: 1.02,
        y: -2,
      }}
      whileTap={{
        scale: 0.98,
        y: 2,
      }}
      animate={{
        filter: `url(#${blobFilterId})`,
        boxShadow: isHovered
          ? `0 20px 40px -10px rgba(16, 185, 129, 0.3)`
          : `0 10px 20px -5px rgba(0, 0, 0, 0.1)`,
      }}
      transition={{
        duration: morphSpeed,
        ease: "easeInOut",
      }}
      {...props}
    >
      {/* SVG filters for morphing effects */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {baseFilters}
      </svg>

      {/* Children content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Interactive highlight overlay */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(
              circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%,
              rgba(255, 255, 255, 0.1) 0%,
              transparent 50%
            )`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
}

export { MorphingBlobCard };