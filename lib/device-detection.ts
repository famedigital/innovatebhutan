import { useState, useEffect } from 'react';

export interface DeviceCapabilities {
  // Device type detection
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;

  // Performance metrics
  gpuScore: number; // 0-100 based on WebGL capabilities
  memory: number; // Estimated device memory in GB
  cpuCores: number;

  // Network conditions
  networkSpeed: 'slow' | 'medium' | 'fast';
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'unknown';

  // Accessibility preferences
  prefersReducedMotion: boolean;
  prefersReducedData: boolean;
  prefersDarkMode: boolean;

  // Display characteristics
  screenResolution: { width: number; height: number };
  pixelRatio: number;
  touchEnabled: boolean;

  // Browser capabilities
  webglSupported: boolean;
  webgl2Supported: boolean;
  supportsWebWorkers: boolean;

  // Performance insights
  frameRate: number;
  canRunWebGL: boolean;
  canRunAdvanced3D: boolean;
}

export interface DeviceCategory {
  type: 'mobile' | 'tablet' | 'desktop';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  maxParticles: number;
  enable3D: boolean;
  enableWebGL: boolean;
  enableAdvancedEffects: boolean;
  maxFrameRate: number;
  recommendedEffects: string[];
}

/**
 * Comprehensive device detection system
 * Evaluates device capabilities for adaptive content delivery
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    gpuScore: 0,
    memory: 4,
    cpuCores: 4,
    networkSpeed: 'medium',
    effectiveType: 'unknown',
    prefersReducedMotion: false,
    prefersReducedData: false,
    prefersDarkMode: false,
    screenResolution: { width: 0, height: 0 },
    pixelRatio: 1,
    touchEnabled: false,
    webglSupported: false,
    webgl2Supported: false,
    supportsWebWorkers: true,
    frameRate: 60,
    canRunWebGL: false,
    canRunAdvanced3D: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Device type detection
    const width = window.innerWidth;
    const height = window.innerHeight;

    const isMobile = width <= 768;
    const isTablet = width > 768 && width <= 1024;
    const isDesktop = width > 1024;

    // GPU capability assessment
    let gpuScore = 0;
    let webglSupported = false;
    let webgl2Supported = false;
    let canRunWebGL = false;
    let canRunAdvanced3D = false;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      webglSupported = !!gl;

      if (webglSupported) {
        // WebGL 2 detection
        const gl2 = canvas.getContext('webgl2');
        webgl2Supported = !!gl2;

        // GPU score calculation based on capabilities
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

          // Score based on GPU type (simplified)
          if (vendor.toLowerCase().includes('nvidia')) gpuScore += 40;
          if (vendor.toLowerCase().includes('amd')) gpuScore += 35;
          if (vendor.toLowerCase().includes('intel')) gpuScore += 25;

          if (renderer.toLowerCase().includes('rtx')) gpuScore += 15;
          if (renderer.toLowerCase().includes('rtx 30')) gpuScore += 20;
          if (renderer.toLowerCase().includes('rtx 40')) gpuScore += 30;
        } else {
          // Fallback score for unknown GPUs
          gpuScore = Math.floor(Math.random() * 30) + 40;
        }

        // Ensure score is within bounds
        gpuScore = Math.min(100, Math.max(0, gpuScore));
        canRunWebGL = gpuScore > 30;
        canRunAdvanced3D = gpuScore > 70;
      }
    } catch (error) {
      console.warn('WebGL detection failed:', error);
    }

    // Memory estimation
    let memory = 4; // Default
    if (navigator.deviceMemory) {
      memory = navigator.deviceMemory;
    } else {
      // Fallback based on device type
      if (isMobile) memory = 3;
      else if (isTablet) memory = 4;
      else memory = 8;
    }

    // Network information
    let networkSpeed: 'slow' | 'medium' | 'fast' = 'medium';
    let effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'unknown' = 'unknown';

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      effectiveType = connection.effectiveType as any;

      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          networkSpeed = 'slow';
          break;
        case '3g':
          networkSpeed = 'medium';
          break;
        case '4g':
        case '5g':
          networkSpeed = 'fast';
          break;
      }
    }

    // Accessibility preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Screen characteristics
    const pixelRatio = window.devicePixelRatio || 1;
    const touchEnabled = 'ontouchstart' in window;

    // Frame rate estimation
    let frameRate = 60;
    if (isMobile && gpuScore < 30) frameRate = 30;
    else if (gpuScore < 50) frameRate = 45;
    else if (gpuScore > 80) frameRate = 60;

    // CPU cores detection
    const cpuCores = navigator.hardwareConcurrency || 4;

    setCapabilities({
      isMobile,
      isTablet,
      isDesktop,
      gpuScore,
      memory,
      cpuCores,
      networkSpeed,
      effectiveType,
      prefersReducedMotion,
      prefersReducedData,
      prefersDarkMode,
      screenResolution: { width, height },
      pixelRatio,
      touchEnabled,
      webglSupported,
      webgl2Supported,
      supportsWebWorkers: typeof Worker !== 'undefined',
      frameRate,
      canRunWebGL,
      canRunAdvanced3D,
    });
  }, []);

  return capabilities;
}

/**
 * Get device category and recommended performance settings
 */
export function getDeviceCategory(capabilities: DeviceCapabilities): DeviceCategory {
  const { isMobile, isTablet, isDesktop, gpuScore, memory, networkSpeed } = capabilities;

  if (isMobile) {
    return {
      type: 'mobile',
      quality: networkSpeed === 'slow' ? 'low' : 'medium',
      maxParticles: 20,
      enable3D: false,
      enableWebGL: false,
      enableAdvancedEffects: false,
      maxFrameRate: 30,
      recommendedEffects: ['simple-animations', 'static-gradients']
    };
  }

  if (isTablet) {
    return {
      type: 'tablet',
      quality: gpuScore > 60 ? 'high' : 'medium',
      maxParticles: 50,
      enable3D: true,
      enableWebGL: gpuScore > 40,
      enableAdvancedEffects: gpuScore > 70,
      maxFrameRate: 45,
      recommendedEffects: ['3d-transforms', 'particle-effects', 'shadows']
    };
  }

  // Desktop
  return {
    type: 'desktop',
    quality: gpuScore > 80 ? 'ultra' : gpuScore > 60 ? 'high' : 'medium',
    maxParticles: 100,
    enable3D: true,
    enableWebGL: true,
    enableAdvancedEffects: gpuScore > 60,
    maxFrameRate: 60,
    recommendedEffects: ['webgl-effects', 'complex-particles', 'shaders', 'advanced-blur']
  };
}

/**
 * Check if device can handle specific features
 */
export function canHandleFeature(capabilities: DeviceCapabilities, feature: string): boolean {
  switch (feature) {
    case 'webgl':
      return capabilities.canRunWebGL;
    case 'webgl2':
      return capabilities.canRunAdvanced3D && capabilities.webgl2Supported;
    case 'complex-3d':
      return capabilities.canRunAdvanced3D;
    case 'particle-effects':
      return capabilities.gpuScore > 30;
    case 'advanced-shaders':
      return capabilities.gpuScore > 70;
    case 'high-fps':
      return capabilities.gpuScore > 60;
    case 'touch-optimized':
      return capabilities.touchEnabled;
    default:
      return true;
  }
}