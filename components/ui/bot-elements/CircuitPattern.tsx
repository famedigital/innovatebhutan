"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface CircuitPatternProps {
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
  isPaused: boolean;
}

/**
 * Circuit Pattern Bot Element
 *
 * Features:
 * - Animated circuit lines
 * - Pulsing connections
 * - Data flow animation
 */
export function CircuitPattern({ x, y, color, delay, duration, isPaused }: CircuitPatternProps) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Circuit lines */}
      <motion.line
        x1={x}
        y1={y}
        x2={x + 30}
        y2={y}
        stroke={color}
        strokeWidth="1.5"
        animate={{
          opacity: isPaused ? 0.6 : [0.3, 1, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
        }}
      />
      <motion.line
        x1={x + 30}
        y1={y}
        x2={x + 30}
        y2={y + 20}
        stroke={color}
        strokeWidth="1.5"
        animate={{
          opacity: isPaused ? 0.6 : [0.3, 1, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.3,
        }}
      />
      <motion.line
        x1={x + 30}
        y1={y + 20}
        x2={x}
        y2={y + 20}
        stroke={color}
        strokeWidth="1.5"
        animate={{
          opacity: isPaused ? 0.6 : [0.3, 1, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.6,
        }}
      />
      <motion.line
        x1={x}
        y1={y + 20}
        x2={x}
        y2={y}
        stroke={color}
        strokeWidth="1.5"
        animate={{
          opacity: isPaused ? 0.6 : [0.3, 1, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.9,
        }}
      />

      {/* Circuit nodes */}
      <circle cx={x} cy={y} r="2" fill={color} />
      <circle cx={x + 30} cy={y} r="2" fill={color} />
      <circle cx={x + 30} cy={y + 20} r="2" fill={color} />
      <circle cx={x} cy={y + 20} r="2" fill={color} />

      {/* Data flow particle */}
      <motion.circle
        cx={x}
        cy={y}
        r="1.5"
        fill="white"
        animate={{
          cx: [x, x + 30, x + 30, x, x],
          cy: [y, y, y + 20, y + 20, y],
        }}
        transition={{
          duration: isPaused ? 0 : duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.g>
  );
}