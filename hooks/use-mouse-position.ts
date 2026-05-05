import { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

/**
 * Hook to track mouse position relative to viewport
 * Provides real-time cursor coordinates for interactive effects
 */
export function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip SSR and touch devices
    if (!isClient || typeof window === 'undefined' || 'ontouchstart' in window) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smooth performance
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isClient]);

  return mousePosition;
}

/**
 * Hook to track mouse position relative to a specific element
 * Useful for calculating 3D tilt effects on individual components
 */
export function useRelativeMousePosition(elementRef: React.RefObject<HTMLElement>) {
  const [relativePosition, setRelativePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isClient || typeof window === 'undefined') return;

    // Skip on touch devices
    if ('ontouchstart' in window) return;

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setRelativePosition({ x, y });
      });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      setRelativePosition({ x: 0, y: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [elementRef, isClient]);

  return { ...relativePosition, isHovering };
}