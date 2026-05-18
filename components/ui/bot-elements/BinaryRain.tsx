"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface BinaryRainProps {
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
  isPaused: boolean;
}

/**
 * Binary Rain Bot Element
 *
 * Features:
 * - Falling binary numbers (0s and 1s)
 * - Matrix-style digital rain
 * - Glowing effect
 */
export function BinaryRain({ x, y, color, delay, duration, isPaused }: BinaryRainProps) {
  const binaryChars = React.useMemo(() => {
    return Array.from({ length: 8 }, () => Math.random() > 0.5 ? '1' : '0');
  }, []);

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 0],
        y: isPaused ? y : [y - 40, y + 40],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ pointerEvents: 'none' }}
    >
      {binaryChars.map((char, index) => (
        <motion.text
          key={index}
          x={x}
          y={y + index * 6}
          fontSize="5"
          fontWeight="bold"
          fill={color}
          opacity={0.8}
          animate={{
            opacity: isPaused ? 0.8 : [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: delay + index * 0.1,
          }}
        >
          {char}
        </motion.text>
      ))}
    </motion.g>
  );
}