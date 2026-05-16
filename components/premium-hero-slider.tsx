"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

interface Slide {
  id: string;
  image: string;
  title: string;
  description: string;
}

interface PremiumHeroSliderProps {
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  onContact?: () => void;
}

/**
 * Premium Apple-style Hero Slider with your actual Cloudinary images
 * Auto-scanned from innovatebhutan/slider folder
 */
export function PremiumHeroSlider({ heading, description: descProp, ctaText, ctaLink, onContact }: PremiumHeroSliderProps = {}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Your actual images from Cloudinary - using working URLs with version numbers
  const slides: Slide[] = [
    {
      id: "1",
      image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964123/INNOVATES1_1_ewtzh1.png",
      title: "Innovate Bhutan",
      description: "Leading technology solutions provider in Bhutan"
    },
    {
      id: "2",
      image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964294/INNOVATES1_2_tttgan.png",
      title: "POS Solutions",
      description: "Modern point-of-sale systems for retail and hospitality"
    },
    {
      id: "3",
      image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964337/INNOVATES1_3_jpz8dy.png",
      title: "Hotel Management",
      description: "Complete property management solutions"
    },
    {
      id: "4",
      image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964281/INNOVATES1_4_e6ye6r.png",
      title: "Security Systems",
      description: "Advanced surveillance and access control"
    },
    {
      id: "5",
      image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964262/INNOVATES1_5_ullilw.png",
      title: "IT Infrastructure",
      description: "Complete IT infrastructure and networking"
    },
    {
      id: "6",
      image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964260/INNOVATES1_6_pcatks.png",
      title: "Web Development",
      description: "Custom web applications and software development"
    },
    {
      id: "7",
      image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964260/INNOVATES1_7_znyltr.png",
      title: "Network Solutions",
      description: "Network solutions and connectivity services"
    },
    {
      id: "8",
      image: "https://res.cloudinary.com/dr9a371tx/image/upload/v1777964343/INNOVATES1_8_ijdvqt.png",
      title: "Complete Support",
      description: "24/7 technical support and maintenance services"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, 25000); // Change slide every 25 seconds (ultra slow)

      return () => clearInterval(interval);
    }
  }, [isPaused, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Slide Image */}
          <div className="absolute inset-0">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Slide Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl ml-auto"
            >
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 tracking-tight text-right">
                {heading || currentSlide.title}
              </h2>
              <p className="text-white/80 text-sm sm:text-base md:text-lg line-clamp-2 mb-4 text-right">
                {descProp || currentSlide.description}
              </p>
              {ctaText && onContact && (
                <div className="flex justify-end">
                  <button
                    onClick={onContact}
                    className="inline-flex items-center gap-2 bg-[#3ECF8E] hover:bg-[#34b27b] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                  >
                    {ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Premium Enhanced Style */}
      <div className="absolute inset-y-0 left-0 flex items-center z-40">
        <button
          onClick={goToPrevious}
          className="ml-4 sm:ml-6 p-3 sm:p-4 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border-2 border-white/30 hover:border-white/50 transition-all duration-300 group shadow-2xl hover:shadow-white/20 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-125 transition-transform" />
        </button>
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center z-40">
        <button
          onClick={goToNext}
          className="mr-4 sm:mr-6 p-3 sm:p-4 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border-2 border-white/30 hover:border-white/50 transition-all duration-300 group shadow-2xl hover:shadow-white/20 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-125 transition-transform" />
        </button>
      </div>

      {/* Dots Indicator - Premium Style */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2.5 z-40">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-10 sm:w-12 shadow-lg shadow-white/30"
                : "bg-white/50 hover:bg-white/70 w-2 sm:w-3"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Optional: Add a subtle vignette effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%)'
      }} />
    </div>
  );
}