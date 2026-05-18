'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Service3DConfig, getServicesArray } from '@/lib/3d-utils/service-3d-configs';
import { IsometricScene } from './IsometricScene';
import { ServiceBuilding3D } from './ServiceBuilding3D';
import { Grid3D } from './Grid3D';
import { ParticleField3D, AmbientParticles } from './ParticleField3D';
import { SliderNavigation } from './SliderNavigation';
import { DataCenterPeople } from './DataCenterPeople';
import { CloudIoT } from './CloudIoT';

interface Engineering3DSliderProps {
  services?: Service3DConfig[];
  autoPlayInterval?: number;
  onServiceChange?: (serviceId: string) => void;
}

export function Engineering3DSlider({
  services = getServicesArray(),
  autoPlayInterval = 25000,
  onServiceChange
}: Engineering3DSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const currentService = services[currentIndex];

  // Auto-rotation logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setDirection('right');
      setCurrentIndex((prev) => (prev + 1) % services.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, services.length, autoPlayInterval]);

  // Notify parent of service change
  useEffect(() => {
    onServiceChange?.(currentService.id);
  }, [currentService.id, onServiceChange]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setDirection('left');
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
    setIsAutoPlaying(false); // Pause autoplay on manual navigation
  }, [services.length]);

  const handleNext = useCallback(() => {
    setDirection('right');
    setCurrentIndex((prev) => (prev + 1) % services.length);
    setIsAutoPlaying(false); // Pause autoplay on manual navigation
  }, [services.length]);

  const handleNavigate = useCallback((index: number) => {
    setDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Pause autoplay on manual navigation
  }, [currentIndex]);

  // Resume autoplay after 5 seconds of inactivity
  useEffect(() => {
    if (!isAutoPlaying) {
      const timeout = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isAutoPlaying]);

  // Slide transition variants
  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      opacity: 0,
      scale: 0.8,
      rotateY: direction === 'left' ? 15 : -15,
      z: -100
    }),
    center: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      z: 0,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: (direction: 'left' | 'right') => ({
      opacity: 0,
      scale: 0.8,
      rotateY: direction === 'left' ? -15 : 15,
      z: -100,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    })
  };

  return (
    <div
      className="engineering-3d-slider"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#0a0a0a'
      }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* 3D Scene Container */}
      <IsometricScene intensity={currentService.animationIntensity}>
        <AnimatePresence
          mode="wait"
          custom={direction}
          initial={false}
        >
          <motion.div
            key={currentService.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '180px',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Service Building */}
            <ServiceBuilding3D
              config={currentService}
              isActive={true}
            />

            {/* Background elements */}
            <Grid3D color={currentService.primaryColor} />
            <ParticleField3D count={25} color={currentService.secondaryColor} />
            <AmbientParticles color={currentService.secondaryColor} />

            {/* Enhanced data center elements */}
            <DataCenterPeople color={currentService.secondaryColor} count={6} />
            <CloudIoT color={currentService.primaryColor} />
          </motion.div>
        </AnimatePresence>
      </IsometricScene>

      {/* Navigation controls */}
      <SliderNavigation
        currentIndex={currentIndex}
        totalSlides={services.length}
        services={services}
        onNavigate={handleNavigate}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      {/* Ambient background glow */}
      <div
        className="ambient-glow"
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${currentService.primaryColor}10, transparent 70%)`,
          pointerEvents: 'none',
          opacity: 0.5
        }}
      />
    </div>
  );
}