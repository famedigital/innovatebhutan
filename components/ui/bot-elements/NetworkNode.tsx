"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface NetworkNodeProps {
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
  isPaused: boolean;
}

/**
 * Network Node Bot Element
 *
 * Features:
 * - Connected network nodes
 * - Pulsing connections
 * - Data packet flow
 */
export function NetworkNode({ x, y, color, delay, duration, isPaused }: NetworkNodeProps) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Network lines */}
      <line
        x1={x}
        y1={y}
        x2={x + 20}
        y2={y - 15}
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1={x + 20}
        y1={y - 15}
        x2={x + 35}
        y2={y}
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1={x + 35}
        y1={y}
        x2={x + 20}
        y2={y + 15}
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />
      <line
        x1={x + 20}
        y1={y + 15}
        x2={x}
        y2={y}
        stroke={color}
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Center node */}
      <motion.circle
        cx={x + 20}
        cy={y}
        r="4"
        fill={color}
        opacity="0.8"
        animate={{
          scale: isPaused ? 1 : [1, 1.3, 1],
          opacity: isPaused ? 0.8 : [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Satellite nodes */}
      <motion.circle
        cx={x}
        cy={y}
        r="2.5"
        fill={color}
        opacity="0.6"
        animate={{
          scale: isPaused ? 1 : [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 0.5,
        }}
      />
      <motion.circle
        cx={x + 20}
        cy={y - 15}
        r="2.5"
        fill={color}
        opacity="0.6"
        animate={{
          scale: isPaused ? 1 : [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1,
        }}
      />
      <motion.circle
        cx={x + 35}
        cy={y}
        r="2.5"
        fill={color}
        opacity="0.6"
        animate={{
          scale: isPaused ? 1 : [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 1.5,
        }}
      />
      <motion.circle
        cx={x + 20}
        cy={y + 15}
        r="2.5"
        fill={color}
        opacity="0.6"
        animate={{
          scale: isPaused ? 1 : [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: 2,
        }}
      />

      {/* Data packet */}
      <motion.circle
        cx={x}
        cy={y}
        r="1.5"
        fill="white"
        animate={{
          cx: isPaused ? x : [x, x + 20, x + 35, x + 20, x],
          cy: isPaused ? y : [y, y - 15, y, y + 15, y],
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