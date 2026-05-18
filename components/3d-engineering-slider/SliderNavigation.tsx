'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Service3DConfig } from '@/lib/3d-utils/service-3d-configs';

interface SliderNavigationProps {
  currentIndex: number;
  totalSlides: number;
  services: Service3DConfig[];
  onNavigate: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function SliderNavigation({
  currentIndex,
  totalSlides,
  services,
  onNavigate,
  onPrevious,
  onNext
}: SliderNavigationProps) {
  return (
    <div className="slider-navigation">
      {/* Navigation Arrows */}
      <motion.button
        className="nav-arrow nav-arrow-left"
        onClick={onPrevious}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#39FF14',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(57, 255, 20, 0.2)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <ChevronLeft size={24} />
      </motion.button>

      <motion.button
        className="nav-arrow nav-arrow-right"
        onClick={onNext}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#39FF14',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
          zIndex: 10,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(57, 255, 20, 0.2)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <ChevronRight size={24} />
      </motion.button>

      {/* Service Indicator Dots */}
      <div
        className="service-dots"
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 12,
          zIndex: 10
        }}
      >
        <AnimatePresence>
          {services.map((service, index) => (
            <motion.button
              key={service.id}
              onClick={() => onNavigate(index)}
              className="service-dot"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: currentIndex === index ? 32 : 10,
                height: currentIndex === index ? 10 : 10,
                borderRadius: 5,
                background: currentIndex === index
                  ? `linear-gradient(90deg, ${service.primaryColor}, ${service.secondaryColor})`
                  : 'rgba(255, 255, 255, 0.3)',
                border: currentIndex === index
                  ? `2px solid ${service.secondaryColor}`
                  : '1px solid rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: currentIndex === index
                  ? `0 0 20px ${service.secondaryColor}60`
                  : 'none'
              }}
              animate={{
                width: currentIndex === index ? 32 : 10,
                boxShadow: currentIndex === index
                  ? [`0 0 10px ${service.secondaryColor}40`, `0 0 25px ${service.secondaryColor}80`, `0 0 10px ${service.secondaryColor}40`]
                  : 'none'
              }}
              transition={{
                duration: 0.3,
                boxShadow: {
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}