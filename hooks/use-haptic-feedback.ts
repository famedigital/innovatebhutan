import * as React from "react";

interface HapticPattern {
  light: [number];
  medium: [number];
  heavy: [number];
  custom?: number[];
}

interface HapticConfig {
  enabled: boolean;
  patterns: HapticPattern;
  fallbackToCSS: boolean;
  respectUserPreference: boolean;
}

interface HapticFeedbackReturn {
  triggerHaptic: (pattern: 'light' | 'medium' | 'heavy' | 'custom', customPattern?: number[]) => void;
  isSupported: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
  requestPermission: () => Promise<boolean>;
}

/**
 * Haptic Feedback Hook
 *
 * Features:
 * - Native vibration API support
 * - Customizable vibration patterns
 * - CSS fallback animations
 * - User preference respect
 * - Permission handling
 */
export function useHapticFeedback(config: HapticConfig = {
  enabled: true,
  patterns: {
    light: [10],
    medium: [20],
    heavy: [30],
    custom: [10, 5, 10, 5, 10],
  },
  fallbackToCSS: true,
  respectUserPreference: true,
}): HapticFeedbackReturn {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isEnabled, setIsEnabled] = React.useState(config.enabled);
  const [hasPermission, setHasPermission] = React.useState(false);

  // Check if vibration API is supported
  React.useEffect(() => {
    const isSupported = 'vibrate' in navigator;
    setIsSupported(isSupported);

    if (isSupported) {
      // Check if we can get permission (iOS 13+)
      if ((navigator as any).permissions) {
        (navigator as any).permissions.query({ name: 'vibrate' as PermissionName }).then((result: PermissionStatus) => {
          setHasPermission(state => result.state === 'granted');
          // Listen for permission changes
          result.onchange = () => {
            setHasPermission(state => result.state === 'granted');
          };
        }).catch(() => {
          // If permission API is not available, assume granted
          setHasPermission(true);
        });
      } else {
        // No permission API, assume granted
        setHasPermission(true);
      }
    }
  }, []);

  // Check user preferences
  const shouldUseHaptics = React.useMemo(() => {
    if (!isEnabled) return false;
    if (!isSupported && !config.fallbackToCSS) return false;
    if (!hasPermission) return false;

    if (config.respectUserPreference) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches === false;
    }

    return true;
  }, [isEnabled, isSupported, hasPermission, config.respectUserPreference, config.fallbackToCSS]);

  const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy' | 'custom', customPattern?: number[]) => {
    if (!shouldUseHaptics) return;

    const vibrationPattern = customPattern || config.patterns[pattern];

    if (isSupported && hasPermission) {
      try {
        navigator.vibrate(vibrationPattern);
      } catch (error) {
        console.warn('Haptic feedback failed:', error);
      }
    }

    // CSS fallback
    if (config.fallbackToCSS) {
      triggerCSSFeedback(pattern);
    }
  };

  const triggerCSSFeedback = (pattern: 'light' | 'medium' | 'heavy') => {
    // Create a temporary element for haptic feedback animation
    const feedbackElement = document.createElement('div');
    feedbackElement.style.position = 'fixed';
    feedbackElement.style.top = '0';
    feedbackElement.style.left = '0';
    feedbackElement.style.width = '100vw';
    feedbackElement.style.height = '100vh';
    feedbackElement.style.pointerEvents = 'none';
    feedbackElement.style.zIndex = '9999';

    // Animation based on pattern
    const animationDuration = {
      light: '100ms',
      medium: '200ms',
      heavy: '300ms',
    }[pattern];

    feedbackElement.style.animation = `
      haptic-${pattern} ${animationDuration} ease-out
    `;

    // Define keyframes dynamically
    const style = document.createElement('style');
    style.textContent = `
      @keyframes haptic-light {
        0% { transform: scale(1); }
        50% { transform: scale(0.98); }
        100% { transform: scale(1); }
      }
      @keyframes haptic-medium {
        0% { transform: scale(1); }
        25% { transform: scale(0.95); }
        50% { transform: scale(0.98); }
        75% { transform: scale(0.95); }
        100% { transform: scale(1); }
      }
      @keyframes haptic-heavy {
        0% { transform: scale(1); opacity: 1; }
        25% { transform: scale(0.92); opacity: 0.8; }
        50% { transform: scale(0.95); opacity: 0.9; }
        75% { transform: scale(0.92); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(feedbackElement);

    // Clean up
    setTimeout(() => {
      document.body.removeChild(feedbackElement);
      document.head.removeChild(style);
    }, 500);
  };

  const setEnabled = (enabled: boolean) => {
    setIsEnabled(enabled);
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      if ((navigator as any).permissions) {
        const result = await (navigator as any).permissions.query({ name: 'vibrate' as PermissionName });
        if (result.state === 'granted') {
          setHasPermission(true);
          return true;
        }

        // On iOS, we might need to trigger haptic to request permission
        navigator.vibrate([10]);
        await new Promise(resolve => setTimeout(resolve, 100));
        return hasPermission;
      }
      return true;
    } catch (error) {
      console.warn('Permission request failed:', error);
      return false;
    }
  };

  return {
    triggerHaptic,
    isSupported,
    isEnabled,
    setEnabled,
    requestPermission,
  };
}

/**
 * Pre-defined haptic feedback patterns for different interactions
 */
export const hapticPatterns = {
  // UI interactions
  buttonPress: { pattern: 'light', action: 'tap' },
  buttonLongPress: { pattern: 'medium', action: 'longPress' },
  selectionConfirm: { pattern: 'medium', action: 'confirm' },
  errorFeedback: { pattern: 'heavy', action: 'error' },
  successFeedback: { pattern: 'light', action: 'success' },

  // Navigation
  swipeGesture: { pattern: 'light', action: 'swipe' },
  scrollMilestone: { pattern: 'light', action: 'scroll' },

  // Content interactions
  likeAction: { pattern: 'medium', action: 'like' },
  saveAction: { pattern: 'light', action: 'save' },
  shareAction: { pattern: 'light', action: 'share' },

  // Game-like interactions
  achievementUnlock: { pattern: 'heavy', action: 'achievement' },
  levelUp: { pattern: 'custom', action: 'levelUp', custom: [10, 20, 10, 20, 50] },
  powerUp: { pattern: 'custom', action: 'powerUp', custom: [20, 10, 20, 10] },
};

/**
 * Hook to use pre-defined haptic patterns
 */
export function useHapticPatterns(
  hapticFeedback: HapticFeedbackReturn,
  context: 'ui' | 'navigation' | 'content' | 'game' = 'ui'
) {
  const triggerPattern = (patternName: keyof typeof hapticPatterns) => {
    const pattern = hapticPatterns[patternName];
    hapticFeedback.triggerHaptic(
      pattern.pattern,
      pattern.custom
    );
  };

  const triggerContextPattern = (action: string) => {
    const pattern = Object.values(hapticPatterns).find(
      p => p.action === action &&
           (context === 'all' || p.action.includes(context))
    );

    if (pattern) {
      hapticFeedback.triggerHaptic(
        pattern.pattern,
        pattern.custom
      );
    }
  };

  return { triggerPattern, triggerContextPattern };
}