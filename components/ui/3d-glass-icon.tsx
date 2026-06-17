"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * 🎨 3D Glass Icon Component
 *
 * Premium glassmorphic icon with 3D transforms and animations.
 * Inspired by Apple SF Symbols and Material You design principles.
 *
 * Features:
 * - Perspective 3D transforms
 * - Glassmorphism with backdrop blur
 * - Specular highlights and reflections
 * - Smooth hover animations
 * - Mouse tracking for dynamic lighting
 */

export interface GlassIcon3DProps {
  /** Icon element (Lucide icon or custom SVG) */
  icon: React.ReactNode;
  /** Color theme */
  color?: string;
  /** Icon size in pixels */
  size?: number;
  /** Enable glowing effect */
  glowing?: boolean;
  /** Animation on hover */
  animateOnHover?: boolean;
  /** Custom className */
  className?: string;
  /** Icon container background gradient */
  gradient?: string;
  /** Border radius */
  borderRadius?: string | number;
}

/**
 * Convert hex to RGB for opacity manipulation
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Default colors matching the design system
 */
const DEFAULT_COLORS = {
  emerald: '#0A5F4E',
  jade: '#0F766E',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
};

export function GlassIcon3D({
  icon,
  color = DEFAULT_COLORS.emerald,
  size = 64,
  glowing = false,
  animateOnHover = true,
  className = "",
  gradient,
  borderRadius = 16,
}: GlassIcon3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !animateOnHover) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Normalize and scale the rotation
    const rotateY = (mouseX / rect.width) * 20; // Max 20deg rotation
    const rotateX = -(mouseY / rect.height) * 20; // Invert for natural feel

    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Default gradient based on color
  const defaultGradient = `linear-gradient(135deg, ${color}22, ${color}11)`;
  const bgGradient = gradient || defaultGradient;

  // Calculate glow color
  const glowColor = color || DEFAULT_COLORS.emerald;
  const rgb = hexToRgb(glowColor);

  return (
    <motion.div
      ref={containerRef}
      className={`glass-icon-3d ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
        background: bgGradient,
        // Glassmorphism effect
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${glowColor}40`,
        boxShadow: glowing
          ? `0 0 30px ${glowColor}40, 0 0 60px ${glowColor}20, inset 0 1px 0 ${glowColor}30`
          : `0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
        // 3D transform origin
        transformOrigin: "center center",
        willChange: "transform",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      animate={
        animateOnHover
          ? {
              rotateX: mousePosition.y,
              rotateY: mousePosition.x,
              scale: isHovered ? 1.05 : 1,
            }
          : {}
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Specular highlight effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + mousePosition.x * 2}% ${50 + mousePosition.y * 2}%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Icon container */}
      <div
        className="flex items-center justify-center w-full h-full relative z-10"
        style={{
          color: glowColor,
          filter: glowing ? `drop-shadow(0 0 8px ${glowColor}80)` : "none",
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            width: `${size * 0.5}px`,
            height: `${size * 0.5}px`,
          }}
        >
          {icon}
        </motion.div>
      </div>

      {/* Reflection/shine effect at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${glowColor}15, transparent)`,
          opacity: isHovered ? 0.6 : 0.3,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Subtle inner border for depth */}
      <div
        className="absolute inset-0 pointer-events-none rounded-inherit"
        style={{
          border: `1px solid rgba(255, 255, 255, 0.1)`,
          borderRadius: typeof borderRadius === "number" ? `${borderRadius - 2}px` : borderRadius,
        }}
      />
    </motion.div>
  );
}

/**
 * 🎨 Icon Presets for Different Categories
 *
 * Pre-configured color themes for various use cases.
 */
export const IconPresets = {
  /** Emerald green - Primary brand color */
  emerald: (props: Omit<GlassIcon3DProps, "color">) => (
    <GlassIcon3D {...props} color={DEFAULT_COLORS.emerald} />
  ),

  /** Jade green - Secondary brand color */
  jade: (props: Omit<GlassIcon3DProps, "color">) => (
    <GlassIcon3D {...props} color={DEFAULT_COLORS.jade} />
  ),

  /** Blue - Trust and technology */
  blue: (props: Omit<GlassIcon3DProps, "color">) => (
    <GlassIcon3D {...props} color={DEFAULT_COLORS.blue} />
  ),

  /** Purple - Premium and creative */
  purple: (props: Omit<GlassIcon3DProps, "color">) => (
    <GlassIcon3D {...props} color={DEFAULT_COLORS.purple} />
  ),

  /** Pink - Modern and vibrant */
  pink: (props: Omit<GlassIcon3DProps, "color">) => (
    <GlassIcon3D {...props} color={DEFAULT_COLORS.pink} />
  ),

  /** Orange - Energy and action */
  orange: (props: Omit<GlassIcon3DProps, "color">) => (
    <GlassIcon3D {...props} color={DEFAULT_COLORS.orange} />
  ),
};

/**
 * 🔄 Spinning Icon Animation
 *
 * Wraps GlassIcon3D with a continuous rotation animation.
 */
export function SpinningGlassIcon(props: GlassIcon3DProps & { duration?: number }) {
  const { duration = 8, ...iconProps } = props;

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <GlassIcon3D {...iconProps} />
    </motion.div>
  );
}

/**
 * 💫 Pulsing Icon Animation
 *
 * Wraps GlassIcon3D with a scale pulse animation.
 */
export function PulsingGlassIcon(props: GlassIcon3DProps & { duration?: number }) {
  const { duration = 2, ...iconProps } = props;

  return (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <GlassIcon3D {...iconProps} />
    </motion.div>
  );
}

/**
 * 📱 Stacked Icon Group
 *
 * Displays multiple 3D glass icons in a stacked arrangement.
 */
export function StackedGlassIcons({
  icons,
  size = 48,
  offset = 8,
}: {
  icons: React.ReactNode[];
  size?: number;
  offset?: number;
}) {
  return (
    <div className="relative inline-flex">
      {icons.map((icon, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: `${index * offset}px`,
            top: `${index * offset}px`,
            zIndex: icons.length - index,
          }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <GlassIcon3D icon={icon} size={size} />
        </motion.div>
      ))}
    </div>
  );
}

export default GlassIcon3D;
