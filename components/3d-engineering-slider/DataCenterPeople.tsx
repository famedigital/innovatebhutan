'use client';

import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

interface DataCenterPeopleProps {
  color: string;
  count?: number;
}

export function DataCenterPeople({ color, count = 6 }: DataCenterPeopleProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate people figures moving around the data center
  const people = useMemo(() => {
    if (!isMounted) return [];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      startX: Math.random() * 300 - 150,
      startY: Math.random() * 300 - 150,
      endX: Math.random() * 300 - 150,
      endY: Math.random() * 300 - 150,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4,
      scale: 0.6 + Math.random() * 0.4
    }));
  }, [count, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="data-center-people" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {people.map((person) => (
        <motion.g
          key={person.id}
          initial={{
            x: person.startX,
            y: person.startY,
            opacity: 0
          }}
          animate={{
            x: [person.startX, person.endX, person.startX],
            y: [person.startY, person.endY, person.startY],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: person.duration,
            repeat: Infinity,
            delay: person.delay,
            ease: 'easeInOut'
          }}
          style={{
            transformOrigin: 'center',
            transform: `scale(${person.scale})`
          }}
        >
          {/* Person figure - simplified tech worker */}
          <svg
            width="24"
            height="40"
            viewBox="0 0 24 40"
            style={{ overflow: 'visible' }}
          >
            {/* Head */}
            <circle
              cx="12"
              cy="6"
              r="5"
              fill={color}
              opacity={0.8}
            />

            {/* Body */}
            <rect
              x="6"
              y="11"
              width="12"
              height="18"
              rx="2"
              fill={color}
              opacity={0.6}
            />

            {/* Arms */}
            <motion.rect
              x="2"
              y="13"
              width="4"
              height="12"
              rx="1"
              fill={color}
              opacity={0.5}
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '4px 13px' }}
            />
            <motion.rect
              x="18"
              y="13"
              width="4"
              height="12"
              rx="1"
              fill={color}
              opacity={0.5}
              animate={{ rotate: [0, -15, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '20px 13px' }}
            />

            {/* Legs */}
            <rect
              x="7"
              y="29"
              width="4"
              height="10"
              rx="1"
              fill={color}
              opacity={0.5}
            />
            <rect
              x="13"
              y="29"
              width="4"
              height="10"
              rx="1"
              fill={color}
              opacity={0.5}
            />

            {/* Tablet/Device in hand */}
            <rect
              x="0"
              y="20"
              width="6"
              height="8"
              rx="1"
              fill={color}
              opacity={0.7}
            />
          </svg>

          {/* Shadow */}
          <ellipse
            cx="12"
            cy="42"
            rx="8"
            ry="2"
            fill="rgba(0,0,0,0.3)"
          />
        </motion.g>
      ))}
    </div>
  );
}