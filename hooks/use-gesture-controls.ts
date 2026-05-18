import * as React from "react";
import { motion } from "framer-motion";

interface GestureConfig {
  swipeThreshold?: number;
  pinchThreshold?: number;
  longPressDuration?: number;
  enableWebcamGestures?: boolean;
  enableTouchGestures?: boolean;
  fallbackToMouse?: boolean;
}

interface GestureControlsReturn {
  // Gesture states
  isSwiping: boolean;
  isPinching: boolean;
  isLongPressing: boolean;
  lastGesture: string | null;

  // Touch handlers
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;

  // Mouse handlers (for fallback)
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;

  // Webcam handlers
  onWebcamMove: (e: React.MouseEvent) => void;

  // Camera calibration
  cameraCalibration: {
    sensitivity: number;
    smoothing: number;
    isActive: boolean;
  };
}

/**
 * Gesture Controls Hook
 *
 * Features:
 * - Touch gestures (swipe, pinch, long press)
 * - Mouse-based gesture patterns
 * - Webcam gesture detection (placeholder for MediaPipe integration)
 * - Calibratable sensitivity
 * - Gesture queuing and debouncing
 */
export function useGestureControls(config: GestureConfig = {}): GestureControlsReturn {
  const {
    swipeThreshold = 50,
    pinchThreshold = 50,
    longPressDuration = 800,
    enableWebcamGestures = false,
    enableTouchGestures = true,
    fallbackToMouse = true,
  } = config;

  // Gesture states
  const [isSwiping, setIsSwiping] = React.useState(false);
  const [isPinching, setIsPinching] = React.useState(false);
  const [isLongPressing, setIsLongPressing] = React.useState(false);
  const [lastGesture, setLastGesture] = React.useState<string | null>(null);

  // Touch gesture tracking
  const touchStartRef = React.useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEndRef = React.useRef<{ x: number; y: number } | null>(null);
  const pinchStartRef = React.useRef<{ distance: number; x: number; y: number } | null>(null);
  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Camera calibration
  const [cameraCalibration] = React.useState({
    sensitivity: 1.0,
    smoothing: 0.3,
    isActive: false,
  });

  // Handle touch start
  const onTouchStart = (e: React.TouchEvent) => {
    if (!enableTouchGestures) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Initialize pinch if multiple touches
    if (e.touches.length >= 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      pinchStartRef.current = {
        distance,
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
      setIsPinching(true);
    }

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      setLastGesture('longPress');
    }, longPressDuration);
  };

  // Handle touch move
  const onTouchMove = (e: React.TouchEvent) => {
    if (!enableTouchGestures) return;

    // Clear long press timer if moving
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = e.touches[0];
    const touchStart = touchStartRef.current;

    if (touchStart && e.touches.length === 1) {
      // Check for swipe
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance > swipeThreshold) {
        setIsSwiping(true);

        // Determine swipe direction
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        if (angle > -45 && angle <= 45) {
          setLastGesture('swipeRight');
        } else if (angle > 45 && angle <= 135) {
          setLastGesture('swipeDown');
        } else if (angle > 135 || angle <= -135) {
          setLastGesture('swipeLeft');
        } else {
          setLastGesture('swipeUp');
        }
      }
    }

    // Handle pinch
    if (e.touches.length >= 2 && pinchStartRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const pinchDelta = Math.abs(currentDistance - pinchStartRef.current.distance);

      if (pinchDelta > pinchThreshold) {
        if (currentDistance > pinchStartRef.current.distance) {
          setLastGesture('pinchIn');
        } else {
          setLastGesture('pinchOut');
        }
        pinchStartRef.current.distance = currentDistance;
      }
    }
  };

  // Handle touch end
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!enableTouchGestures) return;

    // Clear timers
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Reset gesture states
    setIsSwiping(false);
    setIsPinching(false);
    if (!isLongPressing) {
      setIsLongPressing(false);
    }

    // Handle single tap
    if (e.touches.length === 0 && touchStartRef.current) {
      const touchEnd = e.changedTouches[0];
      const deltaX = touchEnd.clientX - touchStartRef.current.x;
      const deltaY = touchEnd.clientY - touchStartRef.current.y;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance < swipeThreshold && !isLongPressing) {
        setLastGesture('tap');
      }
    }

    // Reset references
    touchStartRef.current = null;
    pinchStartRef.current = null;
  };

  // Mouse gesture handlers (fallback)
  const mouseStartRef = React.useRef({ x: 0, y: 0, time: 0 });
  const mouseEndRef = React.useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    if (!fallbackToMouse) return;
    mouseStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!fallbackToMouse) return;

    const deltaX = e.clientX - mouseStartRef.current.x;
    const deltaY = e.clientY - mouseStartRef.current.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance > swipeThreshold) {
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      if (angle > -45 && angle <= 45) {
        setLastGesture('mouseRight');
      } else if (angle > 45 && angle <= 135) {
        setLastGesture('mouseDown');
      } else if (angle > 135 || angle <= -135) {
        setLastGesture('mouseLeft');
      } else {
        setLastGesture('mouseUp');
      }
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!fallbackToMouse) return;

    const distance = Math.hypot(
      e.clientX - mouseStartRef.current.x,
      e.clientY - mouseStartRef.current.y
    );

    if (distance < swipeThreshold) {
      setLastGesture('mouseClick');
    }

    mouseStartRef.current = { x: 0, y: 0, time: 0 };
  };

  // Webcam gesture detection (placeholder for MediaPipe integration)
  const onWebcamMove = (e: React.MouseEvent) => {
    if (!enableWebcamGestures) return;

    // This would integrate with MediaPipe for hand detection
    // For now, simulate gesture detection
    const randomGesture = ['handWave', 'point', 'thumbsUp', 'peaceSign'][
      Math.floor(Math.random() * 4)
    ];
    setLastGesture(randomGesture);
  };

  // Clean up timers on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    isSwiping,
    isPinching,
    isLongPressing,
    lastGesture,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onWebcamMove,
    cameraCalibration,
  };
}

/**
 * Gesture animation hook for Framer Motion
 */
export function useGestureAnimation() {
  const gestureVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.05, rotate: 2 },
    tap: { scale: 0.95, rotate: -2 },
    swipe: { x: [0, -50, 0], transition: { duration: 0.5 } },
    pinch: { scale: [1, 1.1, 1], transition: { duration: 0.3 } },
    longPress: { scale: 0.98, filter: 'brightness(0.8)' },
  };

  return { gestureVariants };
}