'use client';

import { motion } from 'framer-motion';

interface Grid3DProps {
  color: string;
  animated?: boolean;
}

export function Grid3D({ color, animated = true }: Grid3DProps) {
  return (
    <motion.div
      className="grid-3d-floor"
      style={{
        position: 'absolute',
        width: '200%',
        height: '200%',
        left: '-50%',
        top: '-50%',
        backgroundImage: `
          linear-gradient(${color}25 1px, transparent 1px),
          linear-gradient(90deg, ${color}25 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        transform: 'rotateX(90deg) translateZ(-100px)',
        opacity: 0.4,
        transformStyle: 'preserve-3d',
        pointerEvents: 'none'
      }}
      animate={animated ? {
        backgroundPosition: ['0px 0px', '40px 40px']
      } : {}}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
}

// Animated version with flowing grid effect
export function AnimatedGrid3D({ color }: Grid3DProps) {
  return (
    <div
      className="animated-grid-3d-floor"
      style={{
        position: 'absolute',
        width: '300%',
        height: '300%',
        left: '-100%',
        top: '-100%',
        transform: 'rotateX(90deg) translateZ(-100px)',
        transformStyle: 'preserve-3d',
        pointerEvents: 'none'
      }}
    >
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: '100%',
            height: '2px',
            top: `${i * 10}%`,
            background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
            opacity: 0.3
          }}
          animate={{
            x: ['-100%', '100%'],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 8 + i * 0.5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}