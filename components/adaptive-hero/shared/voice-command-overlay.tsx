"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, HelpCircle, X, Play, Stop } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceCommands, heroVoiceCommands } from "@/hooks/use-voice-commands";
import { useGestureControls } from "@/hooks/use-gesture-controls";
import { useHapticFeedback, hapticPatterns } from "@/hooks/use-haptic-feedback";

interface VoiceCommandOverlayProps {
  navigate: (path: string) => void;
  performanceTier: any;
}

/**
 * Voice Command Overlay Component
 *
 * Features:
 * - Voice recognition with command execution
 * - Visual feedback and transcripts
 * - Gesture control integration
 * - Haptic feedback support
 * - Help modal with command list
 */
export function VoiceCommandOverlay({ navigate, performanceTier }: VoiceCommandOverlayProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const [micRotation, setMicRotation] = React.useState(0);

  // Voice commands
  const voiceCommands = React.useMemo(() => heroVoiceCommands(navigate), [navigate]);
  const voiceControls = useVoiceCommands({
    commands: voiceCommands,
    continuous: false,
    autoStart: false,
  });

  // Gesture controls
  const gestureControls = useGestureControls({
    enableTouchGestures: performanceTier.type === 'mobile',
    enableWebcamGestures: performanceTier.enableAdvancedEffects,
    fallbackToMouse: true,
  });

  // Haptic feedback
  const hapticFeedback = useHapticFeedback({
    enabled: performanceTier.type !== 'mobile',
    fallbackToCSS: true,
    respectUserPreference: true,
  });

  // Trigger haptic feedback based on gestures
  React.useEffect(() => {
    if (gestureControls.lastGesture) {
      hapticFeedback.triggerHaptic('light');

      // Special handling for long press
      if (gestureControls.isLongPressing) {
        hapticFeedback.triggerHaptic('medium');
      }
    }
  }, [gestureControls.lastGesture, hapticFeedback, gestureControls.isLongPressing]);

  // Visual feedback for voice commands
  const getVoiceFeedback = () => {
    if (voiceControls.error) {
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-3"
        >
          <div className="text-red-300 text-sm">{voiceControls.error}</div>
        </motion.div>
      );
    }

    if (voiceControls.isListening) {
      return (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
          className="bg-green-500/20 border border-green-500/50 rounded-lg p-3"
        >
          <div className="flex items-center gap-2 text-green-300">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm">Listening...</span>
          </div>
        </motion.div>
      );
    }

    if (voiceControls.transcript) {
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3"
        >
          <div className="text-blue-300 text-sm">{voiceControls.transcript}</div>
        </motion.div>
      );
    }

    return null;
  };

  // Start/stop voice recognition
  const toggleVoiceRecognition = () => {
    if (voiceControls.isListening) {
      voiceControls.stop();
      setIsVisible(false);
      setMicRotation(0);
    } else {
      voiceControls.start();
      setIsVisible(true);
      hapticFeedback.triggerHaptic('light');
    }
  };

  // Help modal
  const renderHelpModal = () => {
    if (!showHelp) return null;

    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-background border border-border rounded-xl p-6 max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Voice Commands</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {voiceCommands.map((command, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="font-mono text-sm">"{command.phrase}"</span>
                  <span className="text-gray-500 text-sm ml-2">{command.description}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Tip: You can also use gestures like swiping and pinching to navigate!
              </p>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  // Gesture indicators
  const renderGestureIndicators = () => {
    if (!gestureControls.lastGesture) return null;

    const gestureMap: Record<string, string> = {
      swipeLeft: "← Swipe Left",
      swipeRight: "→ Swipe Right",
      swipeUp: "↑ Swipe Up",
      swipeDown: "↓ Swipe Down",
      pinchIn: "✋ Pinch In",
      pinchOut: "📌 Pinch Out",
      tap: "👆 Tap",
      longPress: "⏱️ Long Press",
      mouseClick: "🖱️ Click",
      handWave: "👋 Wave",
      point: "👉 Point",
      thumbsUp: "👍 Thumbs Up",
      peaceSign: "✌️ Peace Sign",
    };

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 z-40"
        >
          <div className="text-white text-sm">{gestureMap[gestureControls.lastGesture] || gestureControls.lastGesture}</div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      {/* Voice command button */}
      <motion.button
        onClick={toggleVoiceRecognition}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-40",
          voiceControls.isListening
            ? "bg-red-500 text-white shadow-lg"
            : "bg-green-500 text-white shadow-lg",
          performanceTier.type === 'mobile' ? 'bottom-20' : ''
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          rotate: voiceControls.isListening ? micRotation : 0,
        }}
        transition={{
          rotate: { duration: 0.5 },
        }}
      >
        {voiceControls.isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </motion.button>

      {/* Help button */}
      <motion.button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-24 w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <HelpCircle className="w-5 h-5" />
      </motion.button>

      {/* Voice feedback overlay */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-6 z-40"
        >
          {getVoiceFeedback()}
        </motion.div>
      )}

      {/* Gesture indicators */}
      {renderGestureIndicators()}

      {/* Help modal */}
      {renderHelpModal()}

      {/* Permission request for haptic feedback */}
      {!hapticFeedback.isSupported && performanceTier.type === 'desktop' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 bg-gray-800 text-white rounded-lg p-4 z-40"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-sm">
              Enable haptic feedback for enhanced interaction experience
            </span>
            <button
              onClick={hapticFeedback.requestPermission}
              className="text-xs bg-blue-500 px-2 py-1 rounded hover:bg-blue-600"
            >
              Enable
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}