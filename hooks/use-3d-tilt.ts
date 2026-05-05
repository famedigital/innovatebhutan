import { useState, useEffect, useRef, RefObject } from 'react';

interface TiltConfig {
  maxTilt?: number; // Maximum tilt angle in degrees (default: 15)
  perspective?: number; // CSS perspective value (default: 1000)
  scale?: number; // Scale factor on hover (default: 1.05)
  speed?: number; // Transition speed in ms (default: 300)
  easing?: string; // CSS easing function (default: 'cubic-bezier(0.03, 0.98, 0.52, 0.99)')
  reset?: boolean; // Reset tilt on mouse leave (default: true)
}

interface TiltResult {
  ref: RefObject<HTMLElement>;
  style: React.CSSProperties;
  isHovering: boolean;
}

/**
 * Hook to create 3D tilt effect based on mouse position
 * Inspired by the eye-following card effect from Figma
 *
 * @param config - Tilt configuration options
 * @returns Object with ref, styles, and hovering state
 */
export function use3dTilt(config: TiltConfig = {}): TiltResult {
  const {
    maxTilt = 15,
    perspective = 1000,
    scale = 1.05,
    speed = 300,
    easing = 'cubic-bezier(0.03, 0.98, 0.52, 0.99)',
    reset = true,
  } = config;

  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !isClient || typeof window === 'undefined') return;

    // Skip on touch devices or if user prefers reduced motion
    if ('ontouchstart' in window || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let rafId: number;
    let timeoutId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate percentage from center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;

        // Calculate tilt angles
        const rotateX = percentY * -maxTilt; // Invert for natural feel
        const rotateY = percentX * maxTilt;

        setTilt({ rotateX, rotateY, scale });
      });
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);

      if (reset) {
        // Reset to default position with smooth transition
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(() => {
          setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
        }, 100);
      }
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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [maxTilt, scale, reset, isClient]);

  const style: React.CSSProperties = {
    transform: `perspective(${perspective}px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(${tilt.scale}, ${tilt.scale}, ${tilt.scale})`,
    transition: isHovering ? 'none' : `all ${speed}ms ${easing}`,
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  };

  return { ref, style, isHovering };
}

/**
 * Hook to calculate glare/sunlight effect based on mouse position
 * Creates a realistic light reflection effect
 */
export function useGlareEffect(config: { maxGlare?: number; glarePosition?: 'top' | 'bottom' | 'left' | 'right' | 'dynamic' } = {}) {
  const { maxGlare = 0.5, glarePosition = 'dynamic' } = config;
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});

  const updateGlare = (mouseX: number, mouseY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const x = (mouseX - rect.left) / rect.width;
    const y = (mouseY - rect.top) / rect.height;

    // Calculate glare angle
    const angle = Math.atan2(y - 0.5, x - 0.5) * (180 / Math.PI);
    const distance = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));

    const glareOpacity = Math.max(0, maxGlare - distance * maxGlare);

    setGlareStyle({
      background: `linear-gradient(${angle}deg, rgba(255, 255, 255, ${glareOpacity}) 0%, rgba(255, 255, 255, 0) 80%)`,
      transform: `translate(${x * 50}%, ${y * 50}%)`,
    });
  };

  const resetGlare = () => {
    setGlareStyle({});
  };

  return { glareStyle, updateGlare, resetGlare };
}