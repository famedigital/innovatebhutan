'use client';

import { motion } from 'framer-motion';
import { Service3DConfig } from '@/lib/3d-utils/service-3d-configs';
import { FloatingElement3D } from './FloatingElement3D';
import { DataFlowLines } from './DataFlowLines';
import { useState, useEffect, useMemo } from 'react';

interface ServiceBuilding3DProps {
  config: Service3DConfig;
  isActive: boolean;
}

export function ServiceBuilding3D({ config, isActive }: ServiceBuilding3DProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const buildingSize = 200;
  const buildingHeight = 120;

  // Generate window patterns once on mount to avoid hydration issues
  const windowPatterns = useMemo(() => {
    if (!isMounted) return { front: [], side: [] };

    const generateWindows = () => {
      const windows = [];
      const rows = 3;
      const cols = 4;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          windows.push({
            row,
            col,
            isLit: Math.random() > 0.5,
            delay: Math.random() * 2,
            duration: 3 + Math.random() * 2
          });
        }
      }
      return windows;
    };

    return {
      front: generateWindows(),
      side: generateWindows()
    };
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className="building-3d-container"
      style={{
        position: 'relative',
        width: buildingSize,
        height: buildingSize,
        transformStyle: 'preserve-3d',
        margin: '0 auto'
      }}
    >
      {/* Building Base */}
      <motion.div
        className="building-base"
        style={{
          position: 'absolute',
          width: buildingSize,
          height: buildingSize,
          left: 0,
          top: 0,
          background: `linear-gradient(135deg, ${config.primaryColor}40, ${config.secondaryColor}20)`,
          transform: `rotateX(90deg) translateZ(-${buildingHeight / 2}px)`,
          border: `1px solid ${config.primaryColor}30`,
          transformStyle: 'preserve-3d'
        }}
        animate={{
          opacity: isActive ? [0.6, 0.8, 0.6] : 0.6
        }}
        transition={{
          duration: 4,
          repeat: isActive ? Infinity : 0,
          ease: 'easeInOut'
        }}
      />

      {/* Building Front Wall */}
      <div
        className="building-wall-front"
        style={{
          position: 'absolute',
          width: buildingSize,
          height: buildingHeight,
          left: 0,
          bottom: 0,
          background: `linear-gradient(180deg, ${config.primaryColor}60, ${config.secondaryColor}40)`,
          transform: `translateZ(${buildingSize / 2}px)`,
          border: `1px solid ${config.primaryColor}50`,
          transformStyle: 'preserve-3d',
          boxShadow: `0 0 30px ${config.primaryColor}20`
        }}
      >
        {/* Windows */}
        {windowPatterns.front.map((win) => (
          <motion.div
            key={`front-${win.row}-${win.col}`}
            className="building-window"
            style={{
              position: 'absolute',
              width: 25,
              height: 20,
              left: 15 + win.col * 45,
              top: 15 + win.row * 35,
              background: win.isLit
                ? config.secondaryColor
                : `${config.primaryColor}30`,
              border: `1px solid ${config.primaryColor}50`,
              borderRadius: 2,
              boxShadow: win.isLit
                ? `0 0 10px ${config.secondaryColor}80, inset 0 0 10px ${config.secondaryColor}40`
                : 'none'
            }}
            animate={win.isLit ? {
              opacity: [0.4, 1, 0.4],
              boxShadow: [
                `0 0 10px ${config.secondaryColor}80`,
                `0 0 20px ${config.secondaryColor}100, 0 0 30px ${config.secondaryColor}60`,
                `0 0 10px ${config.secondaryColor}80`
              ]
            } : {}}
            transition={{
              duration: win.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: win.delay
            }}
          />
        ))}
      </div>

      {/* Building Side Wall */}
      <div
        className="building-wall-side"
        style={{
          position: 'absolute',
          width: buildingSize,
          height: buildingHeight,
          left: 0,
          bottom: 0,
          background: `linear-gradient(180deg, ${config.primaryColor}40, ${config.secondaryColor}30)`,
          transform: `rotateY(90deg) translateZ(${buildingSize / 2}px)`,
          border: `1px solid ${config.primaryColor}40`,
          transformStyle: 'preserve-3d',
          boxShadow: `0 0 30px ${config.primaryColor}15`
        }}
      >
        {/* Side Windows */}
        {windowPatterns.side.map((win) => (
          <motion.div
            key={`side-${win.row}-${win.col}`}
            className="building-window"
            style={{
              position: 'absolute',
              width: 25,
              height: 20,
              left: 15 + win.col * 45,
              top: 15 + win.row * 35,
              background: win.isLit
                ? config.secondaryColor
                : `${config.primaryColor}30`,
              border: `1px solid ${config.primaryColor}50`,
              borderRadius: 2,
              boxShadow: win.isLit
                ? `0 0 10px ${config.secondaryColor}80, inset 0 0 10px ${config.secondaryColor}40`
                : 'none'
            }}
            animate={win.isLit ? {
              opacity: [0.4, 1, 0.4],
              boxShadow: [
                `0 0 10px ${config.secondaryColor}80`,
                `0 0 20px ${config.secondaryColor}100, 0 0 30px ${config.secondaryColor}60`,
                `0 0 10px ${config.secondaryColor}80`
              ]
            } : {}}
            transition={{
              duration: win.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: win.delay
            }}
          />
        ))}
      </div>

      {/* Building Top */}
      <div
        className="building-wall-top"
        style={{
          position: 'absolute',
          width: buildingSize,
          height: buildingSize,
          left: 0,
          top: 0,
          background: `linear-gradient(135deg, ${config.primaryColor}50, ${config.secondaryColor}30)`,
          transform: `rotateX(90deg) translateZ(${buildingHeight - buildingHeight / 2}px)`,
          border: `1px solid ${config.primaryColor}60`,
          transformStyle: 'preserve-3d',
          boxShadow: `inset 0 0 30px ${config.secondaryColor}30`
        }}
      />

      {/* Floating elements */}
      {config.floatingElements.map((element, i) => (
        <FloatingElement3D
          key={i}
          element={element}
          color={config.secondaryColor}
        />
      ))}

      {/* Animated data flows */}
      {isActive && <DataFlowLines color={config.secondaryColor} />}
    </div>
  );
}