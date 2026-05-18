"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface CodeSnippetProps {
  x: number;
  y: number;
  color: string;
  delay: number;
  duration: number;
  isPaused: boolean;
}

/**
 * Code Snippet Bot Element
 *
 * Features:
 * - Floating code lines
 * - Syntax highlighting colors
 * - Typewriter appearance
 */
export function CodeSnippet({ x, y, color, delay, duration, isPaused }: CodeSnippetProps) {
  const codeLines = React.useMemo(() => {
    const snippets = [
      ['const', 'bot', '=', 'new', 'Robot()'],
      ['await', 'bot.transform()'],
      ['if', '(bot.isAwesome)'],
      ['return', '"success"'],
      ['import', '{AI}', 'from', 'future'],
      ['function', 'innovate()'],
    ];
    return snippets[Math.floor(Math.random() * snippets.length)];
  }, []);

  return (
    <motion.g
      initial={{ opacity: 0, x: x - 20 }}
      animate={{
        opacity: [0, 1, 0],
        x: [x - 20, x, x + 20],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ pointerEvents: 'none' }}
    >
      <g>
        {/* Code background */}
        <rect
          x={x}
          y={y}
          width="45"
          height="14"
          rx="2"
          fill="#0f172a"
          opacity="0.9"
        />

        {/* Code text */}
        <text
          x={x + 3}
          y={y + 5}
          fontSize="3"
          fontFamily="monospace"
          fill="white"
        >
          {codeLines.map((word, index) => {
            const xOffset = codeLines.slice(0, index).join(' ').length * 2;
            const colors = ['#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA'];
            const wordColor = word === codeLines[0] ? colors[0] : colors[index % colors.length];

            return (
              <motion.tspan
                key={index}
                x={x + 3 + xOffset}
                fill={wordColor}
                animate={{
                  opacity: isPaused ? 1 : [0, 1],
                }}
                transition={{
                  duration: 0.5,
                  delay: delay + index * 0.1,
                }}
              >
                {word}
                {index < codeLines.length - 1 && ' '}
              </motion.tspan>
            );
          })}
        </text>

        {/* Cursor */}
        <motion.rect
          x={x + 40}
          y={y + 3}
          width="1"
          height="5"
          fill="white"
          animate={{
            opacity: isPaused ? 1 : [1, 0, 1],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
          }}
        />
      </g>
    </motion.g>
  );
}