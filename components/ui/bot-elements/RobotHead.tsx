"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface RobotHeadProps {
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
  isPaused: boolean;
}

/**
 * Robot Head Bot Element
 *
 * Features:
 * - Animated robot head with eyes
 * - Floating animation
 * - Eye blinking
 */
export function RobotHead({ x, y, color, delay, duration, isPaused }: RobotHeadProps) {
  return (
    <motion.g
      initial={{ opacity: 0, y: y - 20 }}
      animate={{
        opacity: 1,
        y: [y, y - 15, y],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Robot head */}
      <rect
        x={x}
        y={y}
        width="24"
        height="20"
        rx="4"
        fill={color}
        opacity="0.8"
      />

      {/* Eyes */}
      <motion.circle
        cx={x + 8}
        cy={y + 8}
        r="3"
        fill="white"
        animate={{
          opacity: isPaused ? 1 : [1, 0.3, 1],
          scale: isPaused ? 1 : [1, 0.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: delay + 0.5,
        }}
      />
      <motion.circle
        cx={x + 16}
        cy={y + 8}
        r="3"
        fill="white"
        animate={{
          opacity: isPaused ? 1 : [1, 0.3, 1],
          scale: isPaused ? 1 : [1, 0.5, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: delay + 0.5,
        }}
      />

      {/* Antenna */}
      <line
        x1={x + 12}
        y1={y}
        x2={x + 12}
        y2={y - 6}
        stroke={color}
        strokeWidth="2"
      />
      <circle
        cx={x + 12}
        cy={y - 8}
        r="2"
        fill={color}
      />
    </motion.g>
  );
}