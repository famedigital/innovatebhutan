'use client';

import { motion } from 'framer-motion';
import { FloatingElement } from '@/lib/3d-utils/service-3d-configs';
import { getServiceIcon } from '@/lib/3d-utils/service-icons';
import { lucideStyles } from 'lucide-react';

interface FloatingElement3DProps {
  element: FloatingElement;
  color: string;
}

export function FloatingElement3D({ element, color }: FloatingElement3DProps) {
  const Icon = getServiceIcon(element.type);
  const iconSize = 36;

  return (
    <motion.div
      className="floating-element-3d"
      style={{
        position: 'absolute',
        left: `calc(50% + ${element.position.x}px)`,
        top: `calc(50% + ${element.position.y}px)`,
        transform: `translateZ(${element.position.z}px) translate(-50%, -50%)`,
        color: color,
        transformStyle: 'preserve-3d'
      }}
      animate={
        element.animation === 'float' ? {
          y: [0, -15, 0],
          rotateZ: [0, 5, -5, 0]
        } :
        element.animation === 'pulse' ? {
          scale: [1, 1.15, 1],
          opacity: [0.8, 1, 0.8]
        } :
        element.animation === 'rotate' ? {
          rotateZ: [0, 360]
        } :
        element.animation === 'scan' ? {
          x: [-20, 20, -20]
        } : {}
      }
      transition={{
        duration: element.animation === 'rotate' ? 10 : 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: Math.random() * 0.5
      }}
    >
      {/* Icon wrapper with glow */}
      <motion.div
        style={{
          position: 'relative',
          width: iconSize,
          height: iconSize,
          borderRadius: '8px',
          background: `radial-gradient(circle, ${color}20, transparent)`,
          boxShadow: `0 0 20px ${color}40, 0 0 40px ${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d'
        }}
        animate={{
          boxShadow: [
            `0 0 20px ${color}40, 0 0 40px ${color}20`,
            `0 0 30px ${color}60, 0 0 60px ${color}30`,
            `0 0 20px ${color}40, 0 0 40px ${color}20`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Icon
          size={iconSize * 0.6}
          style={{
            filter: `drop-shadow(0 0 10px ${color})`,
            transformStyle: 'preserve-3d'
          }}
        />
      </motion.div>
    </motion.div>
  );
}