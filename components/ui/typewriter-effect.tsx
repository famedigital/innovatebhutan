"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTypewriter } from "@/hooks/use-typewriter";

interface TypewriterEffectProps {
  words: string[];
  className?: string;
  cursorClassName?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  startDelay?: number;
  autoStart?: boolean;
  showCursor?: boolean;
  cursor?: React.ReactNode;
  onAnimationComplete?: () => void;
}

/**
 * Enhanced typewriter effect component with animation
 *
 * Features:
 * - Animated typing and deleting effect
 * - Customizable cursor with animation
 * - Accessibility support
 * - Framer Motion integration
 */
export function TypewriterEffect({
  words,
  className,
  cursorClassName,
  typeSpeed = 80,
  deleteSpeed = 40,
  pauseDuration = 2000,
  loop = true,
  startDelay = 0,
  autoStart = true,
  showCursor = true,
  cursor = "|",
  onAnimationComplete,
}: TypewriterEffectProps) {
  const typewriter = useTypewriter({
    phrases: words,
    typingSpeed: typeSpeed,
    deletingSpeed: deleteSpeed,
    pauseDuration: pauseDuration,
    loop: loop,
    startDelay: startDelay,
    autoStart: autoStart,
  });

  // Handle animation completion
  React.useEffect(() => {
    if (!typewriter.isRunning && !typewriter.isPaused && !loop) {
      onAnimationComplete?.();
    }
  }, [typewriter.isRunning, typewriter.isPaused, loop, onAnimationComplete]);

  return (
    <div className={cn("relative inline-block", className)}>
      <motion.span
        key={typewriter.currentPhraseIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="block"
      >
        {typewriter.currentText}
      </motion.span>

      {/* Cursor animation */}
      {showCursor && typewriter.isRunning && (
        <motion.span
          className={cn(
            "inline-block ml-1 align-middle",
            "text-green-400 font-mono",
            cursorClassName
          )}
          animate={{
            opacity: [1, 0, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {cursor}
        </motion.span>
      )}

      {/* Progress indicator */}
      <div className="absolute -bottom-6 left-0 w-full">
        <motion.div
          className="h-1 bg-green-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${typewriter.getProgress()}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Accessibility information */}
      <span className="sr-only">
        Typing effect: {typewriter.getCurrentPhrase()}
      </span>
    </div>
  );
}

/**
 * Enhanced typewriter card component
 */
interface TypewriterCardProps {
  title: string;
  description: string;
  words: string[];
  className?: string;
  showProgress?: boolean;
}

export function TypewriterCard({
  title,
  description,
  words,
  className,
  showProgress = true,
}: TypewriterCardProps) {
  return (
    <div className={cn(
      "bg-background border border-border rounded-lg p-6",
      "relative overflow-hidden",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/10 to-blue-50/10" />

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>

        <div className="min-h-[3rem]">
          <TypewriterEffect
            words={words}
            className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
            typeSpeed={100}
            deleteSpeed={50}
            pauseDuration={1500}
            loop={true}
          />
        </div>

        {showProgress && (
          <div className="mt-4 space-y-2">
            <div className="text-xs text-muted-foreground">
              Auto-cycling through {words.length} phrases
            </div>
          </div>
        )}
      </div>
    </div>
  );
}