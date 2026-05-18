"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BotAnimatedTextProps {
  text: string;
  className?: string;
  animationSpeed?: number;
  botCount?: number;
  respectReducedMotion?: boolean;
}

interface GlitchElement {
  id: string;
  x: number;
  delay: number;
  duration: number;
  color: string;
}

/**
 * Bot Animated Text Component - Cyberpunk Glitch Edition
 *
 * Features:
 * - Text acts as a road/map where cyberpunk neon travels through
 * - Glitchy neon effects inside the text
 * - SVG text masking reveals animated bot traffic
 * - No text outline - clean masked effect
 */
export function BotAnimatedText({
  text = "WE BUILD DIGITAL WORLDS",
  className,
  animationSpeed = 6,
  botCount = 15,
  respectReducedMotion = true,
}: BotAnimatedTextProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [glitchElements, setGlitchElements] = React.useState<GlitchElement[]>([]);

  // Check for reduced motion preference
  React.useEffect(() => {
    if (respectReducedMotion) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [respectReducedMotion]);

  // Generate glitch elements
  React.useEffect(() => {
    if (prefersReducedMotion) return;

    const cyberpunkColors = ['#00FF00', '#FF00FF', '#00FFFF', '#FFFF00', '#FF0080'];
    const elements: GlitchElement[] = [];

    for (let i = 0; i < botCount; i++) {
      elements.push({
        id: `glitch-${i}`,
        x: Math.random() * 750 + 25,
        delay: Math.random() * 2,
        duration: animationSpeed + Math.random() * 3,
        color: cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)],
      });
    }

    setGlitchElements(elements);
  }, [botCount, animationSpeed, prefersReducedMotion]);

  return (
    <div className={cn("relative inline-block", className)}>
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 900 120"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Cyberpunk neon gradient */}
          <linearGradient id="cyberpunk-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FF00">
              <animate
                attributeName="stop-color"
                values="#00FF00;#00FFFF;#00FF00"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#FF00FF">
              <animate
                attributeName="stop-color"
                values="#FF00FF;#FFFF00;#FF00FF"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#00FFFF">
              <animate
                attributeName="stop-color"
                values="#00FFFF;#FF0080;#00FFFF"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          {/* Clip path using text - no outline, just the text shape */}
          <clipPath id="cyberpunk-text-clip">
            <text
              x="450"
              y="70"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="56"
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.02em"
              style={{ textTransform: 'uppercase' }}
            >
              {text}
            </text>
          </clipPath>

          {/* Neon glow filter */}
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Extra strong neon glow */}
          <filter id="super-neon">
            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Everything inside the text - cyberpunk effect */}
        <g clipPath="url(#cyberpunk-text-clip)">
          {/* Animated gradient background inside text */}
          <motion.rect
            x="0"
            y="0"
            width="800"
            height="120"
            fill="url(#cyberpunk-gradient)"
            animate={{
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Scanlines effect */}
          {[...Array(12)].map((_, i) => (
            <motion.line
              key={`scan-${i}`}
              x1="0"
              y1={i * 10}
              x2="800"
              y2={i * 10}
              stroke="rgba(0,255,255,0.3)"
              strokeWidth="0.5"
              animate={{
                x1: [0, 800],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3 + i * 0.2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* Glitchy neon beams traveling through text */}
          {!prefersReducedMotion && glitchElements.map((glitch) => (
            <g key={glitch.id}>
              {/* Main neon beam */}
              <motion.line
                x1={glitch.x}
                y1="0"
                x2={glitch.x}
                y2="120"
                stroke={glitch.color}
                strokeWidth="2"
                filter="url(#neon-glow)"
                animate={{
                  y1: [-20, 140],
                  y2: [100, 260],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: glitch.duration,
                  repeat: Infinity,
                  delay: glitch.delay,
                  ease: "linear",
                }}
              />

              {/* Secondary glitch beam */}
              <motion.line
                x1={glitch.x + 5}
                y1="0"
                x2={glitch.x + 5}
                y2="120"
                stroke={glitch.color}
                strokeWidth="1"
                opacity="0.7"
                animate={{
                  y1: [-20, 140],
                  y2: [100, 260],
                  opacity: [0, 0.7, 0.7, 0],
                }}
                transition={{
                  duration: glitch.duration * 0.8,
                  repeat: Infinity,
                  delay: glitch.delay + 0.3,
                  ease: "linear",
                }}
              />
            </g>
          ))}

          {/* Horizontal data streams */}
          {[...Array(8)].map((_, i) => (
            <motion.rect
              key={`stream-${i}`}
              x="-100"
              y={20 + i * 12}
              width="100"
              height="2"
              fill="#00FFFF"
              filter="url(#neon-glow)"
              animate={{
                x: [900, -100],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          {/* Glitch squares */}
          {[...Array(6)].map((_, i) => (
            <motion.rect
              key={`square-${i}`}
              x={100 + i * 120}
              y={40 + Math.sin(i) * 20}
              width="8"
              height="8"
              fill="#FF00FF"
              filter="url(#super-neon)"
              animate={{
                width: [8, 20, 8],
                height: [8, 20, 8],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}

          {/* Matrix-style falling characters */}
          {!prefersReducedMotion && [...Array(10)].map((_, i) => (
            <motion.text
              key={`matrix-${i}`}
              x={50 + i * 75}
              y="-20"
              fontSize="10"
              fill="#00FF00"
              fontFamily="monospace"
              animate={{
                y: [-20, 140],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "linear",
              }}
            >
              {['0', '1', '█', '▓', '▒', '░'][i % 6]}
            </motion.text>
          ))}
        </g>
      </svg>

      {/* Accessibility fallback */}
      {prefersReducedMotion && (
        <span className="sr-only">
          {text} - Cyberpunk animations paused based on your motion preferences
        </span>
      )}
    </div>
  );
}