'use client';

import { motion } from 'framer-motion';
import { use3dSceneInteraction } from '@/hooks/use-3d-scene-interaction';
import { ReactNode } from 'react';

interface IsometricSceneProps {
  children: ReactNode;
  className?: string;
  intensity?: 'subtle' | 'moderate' | 'dynamic';
  style?: React.CSSProperties;
}

export function IsometricScene({
  children,
  className = '',
  intensity = 'moderate',
  style = {}
}: IsometricSceneProps) {
  const interaction = use3dSceneInteraction({ intensity });

  return (
    <motion.div
      ref={interaction.containerRef}
      className={`isometric-scene ${className}`}
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        ...style
      }}
      animate={{
        rotateX: interaction.rotateX,
        rotateY: interaction.rotateY,
        scale: interaction.scale
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 0.5
      }}
    >
      {/* Lighting system for depth */}
      <div
        className="scene-lighting"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          opacity: interaction.isHovering ? 0.8 : 0.5,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* 3D elements rendered here */}
      {children}
    </motion.div>
  );
}