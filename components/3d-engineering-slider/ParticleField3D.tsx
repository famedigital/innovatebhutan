'use client';

import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

interface ParticleField3DProps {
  count: number;
  color: string;
  spread?: number;
}

export function ParticleField3D({ count, color, spread = 200 }: ParticleField3DProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!isMounted) return [];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * spread * 2 - spread,
      y: Math.random() * spread * 2 - spread,
      z: Math.random() * 150 - 75,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3
    }));
  }, [count, spread, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="particle-field-3d">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="particle-3d"
          style={{
            position: 'absolute',
            left: `calc(50% + ${particle.x}px)`,
            top: `calc(50% + ${particle.y}px)`,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}, ${color}40)`,
            transform: `translateZ(${particle.z}px) translate(-50%, -50%)`,
            transformStyle: 'preserve-3d',
            boxShadow: `0 0 10px ${color}60`,
            pointerEvents: 'none'
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay
          }}
        />
      ))}
    </div>
  );
}

// Smaller, more subtle particle field for background ambience
export function AmbientParticles({ color }: { color: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ambientParticles = useMemo(() => {
    if (!isMounted) return [];

    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 300 - 150,
      y: Math.random() * 300 - 150,
      z: Math.random() * 100 - 50,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 4
    }));
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="ambient-particles">
      {ambientParticles.map((particle) => (
        <motion.div
          key={particle.id}
          className="ambient-particle"
          style={{
            position: 'absolute',
            left: `calc(50% + ${particle.x}px)`,
            top: `calc(50% + ${particle.y}px)`,
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: color,
            transform: `translateZ(${particle.z}px) translate(-50%, -50%)`,
            transformStyle: 'preserve-3d',
            opacity: 0.2,
            pointerEvents: 'none'
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: particle.delay
          }}
        />
      ))}
    </div>
  );
}