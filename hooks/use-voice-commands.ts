import * as React from "react";

interface VoiceCommand {
  phrase: string;
  callback: () => void;
  description?: string;
}

interface VoiceCommandsConfig {
  commands: VoiceCommand[];
  autoStart?: boolean;
  continuous?: boolean;
  language?: string;
}

interface VoiceCommandsReturn {
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  error: string | null;
  transcript: string;
}

/**
 * Voice Commands Hook
 *
 * Features:
 * - Speech recognition with custom commands
 * - Voice control for navigation and interactions
 * - Support for multiple languages
 * - Error handling and accessibility
 * - Privacy-conscious implementation
 */
export function useVoiceCommands(config: VoiceCommandsConfig): VoiceCommandsReturn {
  const [isListening, setIsListening] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [transcript, setTranscript] = React.useState("");

  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is supported
  React.useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);

      const recognition = new SpeechRecognition();
      recognition.continuous = config.continuous || false;
      recognition.interimResults = true;
      recognition.lang = config.language || 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        setTranscript(transcript);

        // Check for commands only on final results
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          processCommands(transcript.toLowerCase());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Voice recognition error';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Could not capture audio. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }

        setError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }
  }, [config.continuous, config.language]);

  const processCommands = (text: string) => {
    const commands = config.commands;

    for (const command of commands) {
      if (text.includes(command.phrase.toLowerCase())) {
        try {
          command.callback();
          setTranscript(`✓ Executed: ${command.phrase}`);

          // Stop recognition after command execution unless continuous
          if (!config.continuous) {
            stop();
          }
          return;
        } catch (err) {
          console.error('Command execution error:', err);
          setError(`Failed to execute command: ${command.phrase}`);
        }
      }
    }
  };

  const start = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported');
      return;
    }

    try {
      setIsListening(true);
      setError(null);
      setTranscript('Listening...');
      recognitionRef.current?.start();
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setError('Failed to start voice recognition');
      setIsListening(false);
    }
  };

  const stop = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    start,
    stop,
    error,
    transcript,
  };
}

/**
 * Pre-defined voice commands for the hero section
 */
export const heroVoiceCommands = (navigate: (path: string) => void) => [
  {
    phrase: "show services",
    description: "Navigate to services page",
    callback: () => navigate("/services"),
  },
  {
    phrase: "show contact",
    description: "Navigate to contact section",
    callback: () => navigate("/contact"),
  },
  {
    phrase: "scroll down",
    description: "Scroll page down",
    callback: () => window.scrollBy({ top: 500, behavior: "smooth" }),
  },
  {
    phrase: "scroll up",
    description: "Scroll page up",
    callback: () => window.scrollBy({ top: -500, behavior: "smooth" }),
  },
  {
    phrase: "start demo",
    description: "Start interactive demo",
    callback: () => {
      const demoSection = document.querySelector('[data-demo="interactive"]');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: "smooth" });
      }
    },
  },
  {
    phrase: "show testimonials",
    description: "View client testimonials",
    callback: () => {
      const testimonialSection = document.querySelector('[data-testimonials="true"]');
      if (testimonialSection) {
        testimonialSection.scrollIntoView({ behavior: "smooth" });
      }
    },
  },
  {
    phrase: "pause animations",
    description: "Pause all animations",
    callback: () => {
      document.documentElement.style.setProperty('--animation-speed', '0');
      // Pause CSS animations
      const animatedElements = document.querySelectorAll('.animate-pulse, .animate-bounce');
      animatedElements.forEach(el => {
        el.style.animationPlayState = 'paused';
      });
    },
  },
  {
    phrase: "resume animations",
    description: "Resume all animations",
    callback: () => {
      document.documentElement.style.removeProperty('--animation-speed');
      // Resume CSS animations
      const animatedElements = document.querySelectorAll('.animate-pulse, .animate-bounce');
      animatedElements.forEach(el => {
        el.style.animationPlayState = 'running';
      });
    },
  },
  {
    phrase: "help",
    description: "Show voice command help",
    callback: () => {
      const helpText = heroVoiceCommands(navigate)
        .map(cmd => `• ${cmd.phrase}: ${cmd.description}`)
        .join('\n');
      alert(`Available commands:\n\n${helpText}`);
    },
  },
];