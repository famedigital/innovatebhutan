// Enhanced 3D Scene Interaction Hook
// Extends existing use-3d-tilt.ts for scene-level interactions
// Handles mouse movement, scroll position, and 3D perspective changes

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SceneInteraction {
  mouseX: number;
  mouseY: number;
  rotateX: number;
  rotateY: number;
  scale: number;
  isHovering: boolean;
  scrollProgress: number;
}

interface Use3dSceneInteractionOptions {
  intensity?: 'subtle' | 'moderate' | 'dynamic';
  baseRotateX?: number;
  baseRotateY?: number;
  maxTilt?: number;
  smoothness?: number;
}

export function use3dSceneInteraction(options: Use3dSceneInteractionOptions = {}) {
  const {
    intensity = 'moderate',
    baseRotateX = 55,
    baseRotateY = -45,
    maxTilt = 15,
    smoothness = 0.1
  } = options;

  const [interaction, setInteraction] = useState<SceneInteraction>({
    mouseX: 0,
    mouseY: 0,
    rotateX: baseRotateX,
    rotateY: baseRotateY,
    scale: 1,
    isHovering: false,
    scrollProgress: 0
  });

  const targetRef = useRef({ rotateX: baseRotateX, rotateY: baseRotateY, scale: 1 });
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Intensity multipliers
  const intensityMultiplier = {
    subtle: 0.5,
    moderate: 1.0,
    dynamic: 1.5
  }[intensity];

  // Handle mouse movement with smooth easing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate mouse position relative to center (-1 to 1)
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);

    setInteraction(prev => ({ ...prev, mouseX, mouseY }));

    // Calculate target rotation based on mouse position
    const targetRotateX = baseRotateX + (mouseY * maxTilt * intensityMultiplier);
    const targetRotateY = baseRotateY + (mouseX * maxTilt * intensityMultiplier);

    targetRef.current.rotateX = targetRotateX;
    targetRef.current.rotateY = targetRotateY;
  }, [baseRotateX, baseRotateY, maxTilt, intensityMultiplier]);

  // Handle mouse enter/leave for hover state
  const handleMouseEnter = useCallback(() => {
    setInteraction(prev => ({ ...prev, isHovering: true }));
    targetRef.current.scale = 1.05;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setInteraction(prev => ({ ...prev, isHovering: false, mouseX: 0, mouseY: 0 }));
    targetRef.current.rotateX = baseRotateX;
    targetRef.current.rotateY = baseRotateY;
    targetRef.current.scale = 1;
  }, [baseRotateX, baseRotateY]);

  // Handle scroll position for parallax effects
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollProgress = Math.max(0, Math.min(1, 1 - (rect.top / viewportHeight)));

    setInteraction(prev => ({ ...prev, scrollProgress }));
  }, []);

  // Animation loop for smooth transitions
  useEffect(() => {
    const animate = () => {
      setInteraction(prev => {
        // Smooth interpolation (lerp)
        const lerp = (start: number, end: number, factor: number) => {
          return start + (end - start) * factor;
        };

        const newRotateX = lerp(prev.rotateX, targetRef.current.rotateX, smoothness);
        const newRotateY = lerp(prev.rotateY, targetRef.current.rotateY, smoothness);
        const newScale = lerp(prev.scale, targetRef.current.scale, smoothness);

        return {
          ...prev,
          rotateX: newRotateX,
          rotateY: newRotateY,
          scale: newScale
        };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [smoothness]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse events
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Scroll event (passive for performance)
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial scroll calculation
    handleScroll();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, handleScroll]);

  return {
    ...interaction,
    containerRef
  };
}