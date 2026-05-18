"use client";

import * as React from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, ArrowUp, Building, Cloud, Users, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { PerformanceTier } from "@/lib/performance-config";

interface StoryScene {
  id: string;
  title: string;
  description: string;
  icon: any;
  bgGradient: string;
  content: React.ReactNode;
  progress: number; // 0-100
}

interface ScrollStoryProps {
  performanceTier: PerformanceTier;
}

/**
 * Scroll-Triggered Narrative Component
 *
 * Creates a story-driven experience as users scroll:
 * - Scene 1: Himalayan Heritage - Mountain peaks, traditional architecture
 * - Scene 2: Digital Transformation - Data flowing from peaks to clouds
 * - Scene 3: Innovation Hub - Modern buildings, technology showcase
 */
export function ScrollStoryNarrative({ performanceTier }: ScrollStoryProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Story scenes
  const scenes: StoryScene[] = [
    {
      id: "heritage",
      title: "Himalayan Heritage",
      description: "Rooted in tradition, reaching for digital excellence",
      icon: Building,
      bgGradient: "from-slate-900 via-blue-900 to-slate-900",
      content: (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Our Mountain Roots</h3>
          <p className="text-white/80 max-w-2xl mx-auto">
            Standing tall like the Himalayan peaks, Innovate Bhutan bridges traditional values
            with cutting-edge technology to deliver solutions that honor our heritage while embracing
            the digital future.
          </p>
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <Building className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <span className="text-white/70">Traditional Values</span>
            </div>
            <div className="text-center">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <span className="text-white/70">Community Focus</span>
            </div>
            <div className="text-center">
              <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
              <span className="text-white/70">Local Innovation</span>
            </div>
          </div>
        </div>
      ),
      progress: 0
    },
    {
      id: "transformation",
      title: "Digital Transformation",
      description: "From peaks to clouds, technology flows like mountain streams",
      icon: Cloud,
      bgGradient: "from-blue-900 via-purple-900 to-slate-900",
      content: (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">The Digital Flow</h3>
          <p className="text-white/80 max-w-2xl mx-auto">
            Like mountain streams flowing into the clouds, our data solutions seamlessly connect
            ground-level operations with cloud-powered intelligence, creating a continuous flow
            of innovation and efficiency.
          </p>
          <div className="mt-8 relative h-32">
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-800 to-transparent"
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            />
            {performanceTier.particleCount > 20 && (
              [...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-400 rounded-full"
                  initial={{
                    left: `${Math.random() * 100}%`,
                    bottom: "0%",
                    opacity: 0,
                  }}
                  animate={{
                    left: `${20 + Math.random() * 60}%`,
                    bottom: "70%",
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                />
              ))
            )}
          </div>
        </div>
      ),
      progress: 0
    },
    {
      id: "innovation",
      title: "Innovation Hub",
      description: "Building the future, one line of code at a time",
      icon: Lightbulb,
      bgGradient: "from-purple-900 via-pink-900 to-slate-900",
      content: (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-4">The Future is Now</h3>
          <p className="text-white/80 max-w-2xl mx-auto">
            In our digital innovation hub, we're not just building software—we're crafting
            tomorrow's solutions today, with cutting-edge AI, cloud computing, and enterprise-grade
            security.
          </p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="text-white/70 text-sm">Artificial Intelligence</span>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm font-bold">Cloud</span>
              </div>
              <span className="text-white/70 text-sm">Cloud Solutions</span>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white text-sm font-bold">Secure</span>
              </div>
              <span className="text-white/70 text-sm">Enterprise Security</span>
            </div>
          </div>
        </div>
      ),
      progress: 0
    }
  ];

  // Calculate scene progress based on scroll
  const scene1Progress = useTransform(scrollYProgress, [0, 0.33], [0, 100]);
  const scene2Progress = useTransform(scrollYProgress, [0.33, 0.66], [0, 100]);
  const scene3Progress = useTransform(scrollYProgress, [0.66, 1], [0, 100]);

  // Update scenes with progress
  React.useEffect(() => {
    scenes[0].progress = scene1Progress.get();
    scenes[1].progress = scene2Progress.get();
    scenes[2].progress = scene3Progress.get();
  }, [scene1Progress, scene2Progress, scene3Progress]);

  // Handle navigation between scenes
  const scrollToScene = (index: number) => {
    const element = containerRef.current;
    if (!element) return;

    const sceneElement = element.children[index];
    if (sceneElement) {
      sceneElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-[300vh]">
      {/* Scene indicators */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 space-y-4">
        {scenes.map((scene, index) => (
          <motion.button
            key={scene.id}
            className={`w-3 h-3 rounded-full transition-colors ${
              scenes[0].progress > 50 && index === 0 ? 'bg-green-400' : 'bg-white/30'
            } ${scenes[1].progress > 50 && index === 1 ? 'bg-blue-400' : ''}
            ${scenes[2].progress > 50 && index === 2 ? 'bg-purple-400' : ''}`}
            onClick={() => scrollToScene(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Scene navigation (desktop only) */}
      {performanceTier.type === 'desktop' && (
        <motion.div
          className="fixed left-8 top-1/2 transform -translate-y-1/2 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2 space-y-2">
            {scenes.map((_, index) => (
              <motion.button
                key={index}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                onClick={() => scrollToScene(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowUp className="w-5 h-5" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Story scenes */}
      {scenes.map((scene, index) => {
        const isActive = index === 0 && scenes[0].progress > 50 ||
                        index === 1 && scenes[1].progress > 50 ||
                        index === 2 && scenes[2].progress > 50;

        return (
          <motion.section
            key={scene.id}
            className={`min-h-screen flex items-center justify-center relative ${scene.bgGradient}`}
            style={{
              background: scene.bgGradient,
            }}
          >
            {/* Scene transition overlay */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Scene content */}
            <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
              <motion.div
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 50 }}
                animate={{
                  opacity: isActive ? 1 : 0.7,
                  y: isActive ? 0 : 30
                }}
                transition={{ duration: 0.8 }}
              >
                {/* Progress bar */}
                <motion.div
                  className="h-1 bg-white/20 rounded-full mb-8"
                  initial={{ width: 0 }}
                  animate={{ width: `${scene.progress}%` }}
                  transition={{ duration: 0.3 }}
                />

                {/* Scene icon */}
                <motion.div
                  className="w-20 h-20 mx-auto mb-8 rounded-full bg-white/10 flex items-center justify-center"
                  animate={{
                    scale: isActive ? 1 : 0.9,
                    rotate: isActive ? 0 : 5,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <scene.icon className="w-10 h-10 text-white" />
                </motion.div>

                {/* Scene content */}
                {scene.content}

                {/* Scene title and description */}
                <motion.h2
                  className="text-4xl lg:text-5xl font-bold text-white mb-4"
                  animate={{
                    opacity: isActive ? 1 : 0.5,
                    y: isActive ? 0 : 20,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {scene.title}
                </motion.h2>

                <motion.p
                  className="text-xl text-white/80 mb-8"
                  animate={{
                    opacity: isActive ? 1 : 0.5,
                    y: isActive ? 0 : 20,
                  }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {scene.description}
                </motion.p>

                {/* Action buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  animate={{
                    opacity: isActive ? 1 : 0.5,
                    y: isActive ? 0 : 20,
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.button
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToScene((index + 1) % scenes.length)}
                  >
                    Next Story
                    <ArrowRight className="w-4 h-4 inline-block ml-2" />
                  </motion.button>

                  {index === scenes.length - 1 && (
                    <motion.button
                      className="px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Back to Top
                      <ChevronDown className="w-4 h-4 inline-block rotate-180 ml-2" />
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            </div>

            {/* Parallax background elements */}
            {performanceTier.enableAdvancedEffects && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  y: scenes[0].progress > 50 ? -50 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              </motion.div>
            )}
          </motion.section>
        );
      })}

      {/* Scroll hint */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white/70">
          <span className="text-sm">Scroll to continue story</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </motion.div>
    </div>
  );
}