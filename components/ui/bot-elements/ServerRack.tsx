"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface ServerRackProps {
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
  isPaused: boolean;
}

/**
 * Server Rack Bot Element
 *
 * Features:
 * - Mini server rack with blinking lights
 * - Multiple server units
 * - Status indicators
 */
export function ServerRack({ x, y, color, delay, duration, isPaused }: ServerRackProps) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
        delay,
      }}
      style={{ pointerEvents: 'none' }}
    >
      {/* Server rack frame */}
      <rect
        x={x}
        y={y}
        width="20"
        height="30"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.8"
      />

      {/* Server unit 1 */}
      <rect
        x={x + 3}
        y={y + 3}
        width="14"
        height="6"
        fill={color}
        opacity="0.3"
      />
      <motion.circle
        cx={x + 6}
        cy={y + 6}
        r="1.5"
        fill="#10B981"
        animate={{
          opacity: isPaused ? 1 : [1, 0.3, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
        }}
      />
      <motion.circle
        cx={x + 10}
        cy={y + 6}
        r="1.5"
        fill="#3B82F6"
        animate={{
          opacity: isPaused ? 1 : [1, 0.3, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: 0.2,
        }}
      />

      {/* Server unit 2 */}
      <rect
        x={x + 3}
        y={y + 12}
        width="14"
        height="6"
        fill={color}
        opacity="0.3"
      />
      <motion.circle
        cx={x + 6}
        cy={y + 15}
        r="1.5"
        fill="#8B5CF6"
        animate={{
          opacity: isPaused ? 1 : [1, 0.3, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: 0.4,
        }}
      />
      <motion.circle
        cx={x + 10}
        cy={y + 15}
        r="1.5"
        fill="#10B981"
        animate={{
          opacity: isPaused ? 1 : [1, 0.3, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.6,
        }}
      />

      {/* Server unit 3 */}
      <rect
        x={x + 3}
        y={y + 21}
        width="14"
        height="6"
        fill={color}
        opacity="0.3"
      />
      <motion.circle
        cx={x + 6}
        cy={y + 24}
        r="1.5"
        fill="#3B82F6"
        animate={{
          opacity: isPaused ? 1 : [1, 0.3, 1],
        }}
        transition={{
          duration: 1.1,
          repeat: Infinity,
          delay: 0.8,
        }}
      />
      <motion.circle
        cx={x + 10}
        cy={y + 24}
        r="1.5"
        fill="#8B5CF6"
        animate={{
          opacity: isPaused ? 1 : [1, 0.3, 1],
        }}
        transition={{
          duration: 0.9,
          repeat: Infinity,
          delay: 1,
        }}
      />
    </motion.g>
  );
}