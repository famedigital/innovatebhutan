'use client';

import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';

interface CloudIoTProps {
  color: string;
}

export function CloudIoT({ color }: CloudIoTProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate IoT devices floating in the cloud
  const iotDevices = useMemo(() => {
    if (!isMounted) return [];

    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 400 - 200,
      y: Math.random() * 300 - 150,
      z: Math.random() * 100 - 50,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 3,
      type: ['sensor', 'camera', 'server', 'database', 'mobile', 'smartwatch'][Math.floor(Math.random() * 6)]
    }));
  }, [isMounted]);

  // Connection lines between IoT devices
  const connections = useMemo(() => {
    if (!isMounted) return [];

    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x1: Math.random() * 300 - 150,
      y1: Math.random() * 200 - 100,
      x2: Math.random() * 300 - 150,
      y2: Math.random() * 200 - 100,
      delay: Math.random() * 2
    }));
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'sensor':
        return (
          <g>
            <circle cx="12" cy="12" r="8" fill={color} opacity="0.7" />
            <circle cx="12" cy="12" r="4" fill="white" opacity="0.9" />
            <circle cx="12" cy="12" r="2" fill={color} />
          </g>
        );
      case 'camera':
        return (
          <g>
            <rect x="4" y="6" width="16" height="12" rx="2" fill={color} opacity="0.7" />
            <circle cx="12" cy="12" r="4" fill="white" opacity="0.9" />
            <circle cx="12" cy="12" r="2" fill={color} />
            <rect x="10" y="4" width="4" height="2" fill={color} opacity="0.7" />
          </g>
        );
      case 'server':
        return (
          <g>
            <rect x="6" y="4" width="12" height="16" rx="2" fill={color} opacity="0.7" />
            <rect x="8" y="6" width="8" height="2" rx="1" fill="white" opacity="0.8" />
            <rect x="8" y="10" width="8" height="2" rx="1" fill="white" opacity="0.8" />
            <rect x="8" y="14" width="8" height="2" rx="1" fill="white" opacity="0.8" />
            <circle cx="17" cy="7" r="1" fill="#39FF14" />
            <circle cx="17" cy="11" r="1" fill="#39FF14" />
            <circle cx="17" cy="15" r="1" fill="#39FF14" />
          </g>
        );
      case 'database':
        return (
          <g>
            <ellipse cx="12" cy="6" rx="8" ry="3" fill={color} opacity="0.7" />
            <rect x="4" y="6" width="16" height="10" fill={color} opacity="0.7" />
            <ellipse cx="12" cy="16" rx="8" ry="3" fill={color} opacity="0.9" />
            <ellipse cx="12" cy="6" rx="6" ry="2" fill="white" opacity="0.5" />
            <ellipse cx="12" cy="11" rx="6" ry="2" fill="white" opacity="0.5" />
          </g>
        );
      case 'mobile':
        return (
          <g>
            <rect x="8" y="3" width="8" height="18" rx="2" fill={color} opacity="0.7" />
            <rect x="9" y="5" width="6" height="12" fill="white" opacity="0.9" />
            <circle cx="12" cy="19" r="1" fill="white" opacity="0.7" />
          </g>
        );
      case 'smartwatch':
        return (
          <g>
            <rect x="6" y="2" width="12" height="8" rx="1" fill={color} opacity="0.7" />
            <rect x="8" y="4" width="8" height="4" fill="white" opacity="0.9" />
            <rect x="10" y="10" width="4" height="6" rx="1" fill={color} opacity="0.7" />
            <rect x="10" y="2" width="4" height="2" rx="1" fill={color} opacity="0.7" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className="cloud-iot" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
      {/* Connection lines between IoT devices */}
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {connections.map((conn) => (
          <motion.path
            key={conn.id}
            d={`M ${conn.x1} ${conn.y1} Q ${(conn.x1 + conn.x2) / 2} ${(conn.y1 + conn.y2) / 2 - 20} ${conn.x2} ${conn.y2}`}
            stroke={color}
            strokeWidth="1"
            fill="none"
            strokeDasharray="4 2"
            opacity={0.3}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: [0, 0.4, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: conn.delay
            }}
          />
        ))}
      </svg>

      {/* IoT devices */}
      {iotDevices.map((device) => (
        <motion.div
          key={device.id}
          style={{
            position: 'absolute',
            left: `calc(50% + ${device.x}px)`,
            top: `calc(50% + ${device.y}px)`,
            width: 24,
            height: 24,
            transform: `translateZ(${device.z}px) translate(-50%, -50%)`,
            transformStyle: 'preserve-3d'
          }}
          animate={{
            y: [device.y, device.y - 15, device.y],
            x: [device.x, device.x + 5, device.x],
            opacity: [0.6, 1, 0.6],
            rotateZ: [0, 5, -5, 0]
          }}
          transition={{
            duration: device.duration,
            repeat: Infinity,
            delay: device.delay,
            ease: 'easeInOut'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" style={{ overflow: 'visible' }}>
            {getDeviceIcon(device.type)}

            {/* Glow effect */}
            <circle
              cx="12"
              cy="12"
              r="12"
              fill={color}
              opacity={0.1}
            />
          </svg>

          {/* Status indicator */}
          <motion.div
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#39FF14',
              boxShadow: '0 0 8px #39FF14'
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
        </motion.div>
      ))}

      {/* Cloud icon representation */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          fontSize: 40,
          opacity: 0.15,
          color: color
        }}
        animate={{
          y: [0, -10, 0],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        ☁️
      </motion.div>

      <motion.div
        style={{
          position: 'absolute',
          top: '15%',
          right: '15%',
          fontSize: 30,
          opacity: 0.1,
          color: color
        }}
        animate={{
          y: [0, -15, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: 2,
          ease: 'easeInOut'
        }}
      >
        ☁️
      </motion.div>
    </div>
  );
}