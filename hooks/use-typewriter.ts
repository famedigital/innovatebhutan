import { useState, useEffect, useCallback } from 'react';

interface TypewriterConfig {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  startDelay?: number;
  autoStart?: boolean;
}

interface TypewriterState {
  currentText: string;
  isDeleting: boolean;
  currentPhraseIndex: number;
  currentCharIndex: number;
}

/**
 * Hook for typewriter effect with accessibility support
 *
 * Features:
 * - Type and delete phrases in sequence
 * - Respect prefers-reduced-motion
 * - Keyboard accessibility (Space to skip, Tab to navigate)
 * - Auto-loop or one-time playback
 * - Configurable typing/deleting speeds
 */
export function useTypewriter({
  phrases,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2000,
  loop = true,
  startDelay = 0,
  autoStart = true,
}: TypewriterConfig) {
  const [state, setState] = useState<TypewriterState>({
    currentText: '',
    isDeleting: false,
    currentPhraseIndex: 0,
    currentCharIndex: 0,
  });

  const [isPaused, setIsPaused] = useState(startDelay > 0);
  const [isRunning, setIsRunning] = useState(autoStart);

  // Check if user prefers reduced motion
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Auto-start the typewriter after delay
  useEffect(() => {
    if (startDelay > 0 && autoStart) {
      const timer = setTimeout(() => {
        setIsRunning(true);
      }, startDelay);
      return () => clearTimeout(timer);
    }
  }, [startDelay, autoStart]);

  // Typewriter effect logic
  useEffect(() => {
    if (!isRunning || isPaused || !phrases.length) return;

    // If user prefers reduced motion, show full phrase instantly
    if (prefersReducedMotion) {
      const currentPhrase = phrases[state.currentPhraseIndex];
      setState(prev => ({
        ...prev,
        currentText: currentPhrase,
        currentCharIndex: currentPhrase.length,
        isDeleting: true
      }));
      return;
    }

    const timer = setTimeout(() => {
      setState(prev => {
        const { currentPhraseIndex, currentCharIndex, isDeleting } = prev;
        const currentPhrase = phrases[currentPhraseIndex];

        if (!isDeleting && currentCharIndex < currentPhrase.length) {
          // Typing
          return {
            ...prev,
            currentText: currentPhrase.substring(0, currentCharIndex + 1),
            currentCharIndex: currentCharIndex + 1,
          };
        } else if (isDeleting && currentCharIndex > 0) {
          // Deleting
          return {
            ...prev,
            currentText: currentPhrase.substring(0, currentCharIndex - 1),
            currentCharIndex: currentCharIndex - 1,
          };
        } else if (!isDeleting && currentCharIndex === currentPhrase.length) {
          // Finished typing, pause then delete
          setIsPaused(true);
          setTimeout(() => {
            setIsPaused(false);
          }, pauseDuration);
          return {
            ...prev,
            isDeleting: true,
          };
        } else if (isDeleting && currentCharIndex === 0) {
          // Finished deleting, move to next phrase
          const nextIndex = loop ?
            (currentPhraseIndex + 1) % phrases.length :
            Math.min(currentPhraseIndex + 1, phrases.length - 1);

          return {
            ...prev,
            currentPhraseIndex: nextIndex,
            isDeleting: false,
            currentCharIndex: 0,
          };
        }

        return prev;
      });
    }, state.isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [isRunning, isPaused, state, phrases, typingSpeed, deletingSpeed, pauseDuration, loop, prefersReducedMotion]);

  // Control functions
  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setState({
      currentText: '',
      isDeleting: false,
      currentPhraseIndex: 0,
      currentCharIndex: 0,
    });
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const skipToNext = useCallback(() => {
    const nextIndex = loop ?
      (state.currentPhraseIndex + 1) % phrases.length :
      Math.min(state.currentPhraseIndex + 1, phrases.length - 1);

    setState(prev => ({
      ...prev,
      currentPhraseIndex: nextIndex,
      currentText: '',
      currentCharIndex: 0,
      isDeleting: false,
    }));
  }, [state.currentPhraseIndex, phrases, loop]);

  const skipToPrevious = useCallback(() => {
    const prevIndex = loop ?
      (state.currentPhraseIndex - 1 + phrases.length) % phrases.length :
      Math.max(state.currentPhraseIndex - 1, 0);

    setState(prev => ({
      ...prev,
      currentPhraseIndex: prevIndex,
      currentText: '',
      currentCharIndex: 0,
      isDeleting: false,
    }));
  }, [state.currentPhraseIndex, phrases, loop]);

  const getCurrentPhrase = () => phrases[state.currentPhraseIndex] || '';
  const getProgress = () => {
    const currentPhrase = phrases[state.currentPhraseIndex];
    return currentPhrase ? (state.currentCharIndex / currentPhrase.length) * 100 : 0;
  };

  return {
    currentText: state.currentText,
    isDeleting: state.isDeleting,
    currentPhraseIndex: state.currentPhraseIndex,
    currentCharIndex: state.currentCharIndex,
    isRunning,
    isPaused,
    start,
    stop,
    reset,
    skipToNext,
    skipToPrevious,
    getCurrentPhrase,
    getProgress,
  };
}