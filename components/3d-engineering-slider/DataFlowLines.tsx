'use client';

import { motion } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

interface DataFlowLinesProps {
  color: string;
}

export function DataFlowLines({ color }: DataFlowLinesProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate multiple wire paths with electric pulses
  const wirePaths = useMemo(() => {
    if (!isMounted) return [];

    return Array.from({ length: 15 }, (_, i) => {
      const startX = Math.random() * 400 - 200;
      const startY = Math.random() * 400 - 200;
      const endX = Math.random() * 400 - 200;
      const endY = Math.random() * 400 - 200;
      const controlX = (startX + endX) / 2 + (Math.random() - 0.5) * 100;
      const controlY = (startY + endY) / 2 + (Math.random() - 0.5) * 100;

      return {
        id: i,
        path: `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2
      };
    });
  }, [isMounted]);

  // Electric pulse points
  const pulses = useMemo(() => {
    if (!isMounted) return [];

    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 300 - 150,
      y: Math.random() * 300 - 150,
      delay: Math.random() * 4
    }));
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <svg
      className="data-flow-lines"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0 }} />
          <stop offset="50%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
        <filter id={`glow-${color}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Multiple wire paths with electric pulses */}
      {wirePaths.map((wire) => (
        <g key={wire.id}>
          <motion.path
            d={wire.path}
            stroke={`url(#gradient-${color})`}
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="15 8"
            filter={`url(#glow-${color})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1],
              opacity: [0, 0.8, 0.3]
            }}
            transition={{
              duration: wire.duration,
              repeat: Infinity,
              delay: wire.delay,
              ease: 'easeInOut'
            }}
          />

          {/* Electric pulse traveling along the wire */}
          <motion.circle
            r="2"
            fill={color}
            filter={`url(#glow-${color})`}
            initial={{ opacity: 0 }}
            animate={{
              offsetDistance: ['0%', '100%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: wire.duration,
              repeat: Infinity,
              delay: wire.delay,
              ease: 'linear'
            }}
            style={{
              offsetPath: `path('${wire.path}')`
            }}
          />
        </g>
      ))}

      {/* Electric pulse bursts */}
      {pulses.map((pulse) => (
        <motion.g
          key={pulse.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 2, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: pulse.delay,
            ease: 'easeOut'
          }}
        >
          <circle
            cx={pulse.x}
            cy={pulse.y}
            r="4"
            fill={color}
            filter={`url(#glow-${color})`}
          />
          <circle
            cx={pulse.x}
            cy={pulse.y}
            r="8"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity={0.5}
          />
        </motion.g>
      ))}

      {/* Data center connection lines */}
      <g opacity={0.4}>
        {Array.from({ length: 8 }, (_, i) => (
          <motion.path
            key={i}
            d={`M ${-150 + i * 40} -100 L ${-150 + i * 40} 100`}
            stroke={color}
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="4 2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </g>

      {/* Horizontal data bus lines */}
      <g opacity={0.3}>
        {Array.from({ length: 5 }, (_, i) => (
          <motion.path
            key={i}
            d={`M -200 ${-60 + i * 30} L 200 ${-60 + i * 30}`}
            stroke={color}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: [0, 1, 1],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
      </g>
    </svg>
  );
}