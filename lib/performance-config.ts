import { DeviceCategory } from './device-detection';

/**
 * Performance configuration tiers for different device capabilities
 */
export interface PerformanceTier {
  id: string;
  name: string;
  description: string;
  particleCount: number;
  maxFPS: number;
  enable3D: boolean;
  enableWebGL: boolean;
  enableAdvancedEffects: boolean;
  enableComplexAnimations: boolean;
  enableShaders: boolean;
  enableComplexInteractions: boolean;
  imageQuality: number; // 0-1
  animationComplexity: 'minimal' | 'simple' | 'medium' | 'complex' | 'ultra';
  memoryBudget: number; // MB
  networkOptimization: 'aggressive' | 'balanced' | 'none';
  features: {
    stars: boolean;
    clouds: boolean;
    dataFlow: boolean;
    service3D: boolean;
    scrollEffects: boolean;
    voiceCommands: boolean;
    gestures: boolean;
    haptics: boolean;
  };
}

/**
 * Default performance tiers for different device categories
 */
export const PERFORMANCE_TIERS: Record<DeviceCategory['type'], PerformanceTier> = {
  mobile: {
    id: 'mobile',
    name: 'Mobile Experience',
    description: 'Optimized for mobile devices with reduced visual complexity',
    particleCount: 20,
    maxFPS: 30,
    enable3D: false,
    enableWebGL: false,
    enableAdvancedEffects: false,
    enableComplexAnimations: false,
    enableShaders: false,
    enableComplexInteractions: true,
    imageQuality: 0.7,
    animationComplexity: 'simple',
    memoryBudget: 50,
    networkOptimization: 'aggressive',
    features: {
      stars: true,
      clouds: false,
      dataFlow: false,
      service3D: false,
      scrollEffects: false,
      voiceCommands: false,
      gestures: true,
      haptics: false,
    },
  },
  tablet: {
    id: 'tablet',
    name: 'Tablet Experience',
    description: 'Balanced experience with moderate visual effects',
    particleCount: 50,
    maxFPS: 45,
    enable3D: true,
    enableWebGL: false,
    enableAdvancedEffects: true,
    enableComplexAnimations: true,
    enableShaders: false,
    enableComplexInteractions: true,
    imageQuality: 0.8,
    animationComplexity: 'medium',
    memoryBudget: 100,
    networkOptimization: 'balanced',
    features: {
      stars: true,
      clouds: true,
      dataFlow: true,
      service3D: true,
      scrollEffects: true,
      voiceCommands: false,
      gestures: true,
      haptics: false,
    },
  },
  desktop: {
    id: 'desktop',
    name: 'Desktop Experience',
    description: 'Full experience with advanced visual effects',
    particleCount: 100,
    maxFPS: 60,
    enable3D: true,
    enableWebGL: true,
    enableAdvancedEffects: true,
    enableComplexAnimations: true,
    enableShaders: true,
    enableComplexInteractions: true,
    imageQuality: 1.0,
    animationComplexity: 'ultra',
    memoryBudget: 200,
    networkOptimization: 'none',
    features: {
      stars: true,
      clouds: true,
      dataFlow: true,
      service3D: true,
      scrollEffects: true,
      voiceCommands: true,
      gestures: true,
      haptics: true,
    },
  },
};

/**
 * Dynamic performance adjustment based on device capabilities
 */
export function getOptimalPerformanceTier(
  deviceCategory: DeviceCategory['type'],
  deviceCapabilities: any
): PerformanceTier {
  const baseTier = PERFORMANCE_TIERS[deviceCategory];

  // Adjust based on GPU score
  if (deviceCapabilities.gpuScore < 30) {
    // Low GPU performance
    return {
      ...baseTier,
      particleCount: Math.max(10, baseTier.particleCount * 0.5),
      maxFPS: Math.min(30, baseTier.maxFPS),
      enable3D: false,
      enableWebGL: false,
      enableShaders: false,
      animationComplexity: 'minimal',
      memoryBudget: Math.min(50, baseTier.memoryBudget),
    };
  } else if (deviceCapabilities.gpuScore > 80) {
    // High GPU performance
    return {
      ...baseTier,
      particleCount: Math.min(200, baseTier.particleCount * 1.5),
      maxFPS: 60,
      enableShaders: true,
      enableAdvancedEffects: true,
      animationComplexity: 'ultra',
      memoryBudget: Math.min(300, baseTier.memoryBudget * 1.5),
    };
  }

  return baseTier;
}

/**
 * Network-aware performance adjustments
 */
export function getNetworkAwareTier(
  tier: PerformanceTier,
  networkSpeed: 'slow' | 'medium' | 'fast'
): PerformanceTier {
  if (networkSpeed === 'slow') {
    return {
      ...tier,
      particleCount: Math.max(10, tier.particleCount * 0.5),
      imageQuality: 0.5,
      networkOptimization: 'aggressive',
      enableComplexAnimations: false,
    };
  } else if (networkSpeed === 'fast') {
    return {
      ...tier,
      particleCount: Math.min(200, tier.particleCount * 1.2),
      imageQuality: 1.0,
      networkOptimization: 'none',
    };
  }

  return tier;
}

/**
 * Accessibility-aware performance adjustments
 */
export function getAccessibilityTier(
  tier: PerformanceTier,
  prefersReducedMotion: boolean,
  prefersReducedData: boolean
): PerformanceTier {
  let adjustedTier = { ...tier };

  if (prefersReducedMotion) {
    adjustedTier = {
      ...adjustedTier,
      particleCount: 5,
      animationComplexity: 'minimal',
      enableComplexAnimations: false,
      enableAdvancedEffects: false,
      maxFPS: 30,
    };
  }

  if (prefersReducedData) {
    adjustedTier = {
      ...adjustedTier,
      imageQuality: 0.5,
      enableShaders: false,
      networkOptimization: 'aggressive',
    };
  }

  return adjustedTier;
}

/**
 * Performance optimization utilities
 */
export const PerformanceOptimizer = {
  /**
   * Throttle animation frames to maintain target FPS
   */
  throttleFrameRate: (callback: () => void, fps: number) => {
    const interval = 1000 / fps;
    let lastTime = 0;
    let animationFrameId: number;

    return (time: number) => {
      if (time - lastTime >= interval) {
        callback();
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame((t) => PerformanceOptimizer.throttleFrameRate(callback, fps)(t));
    };
  },

  /**
   * Lazy load heavy components based on performance tier
   */
  shouldLoadHeavyComponent: (tier: PerformanceTier, componentName: string) => {
    const heavyComponents = ['service3D-demo', 'webgl-scene', 'shader-effects'];
    return !tier.networkOptimization.includes('aggressive') ||
           !heavyComponents.includes(componentName);
  },

  /**
   * Get asset optimization settings
   */
  getAssetOptimization: (tier: PerformanceTier) => ({
    quality: tier.imageQuality,
    responsive: true,
    lazy: tier.networkOptimization !== 'none',
    compression: tier.networkOptimization === 'aggressive',
  }),
};

/**
 * Performance monitor for real-time adjustments
 */
export class PerformanceMonitor {
  private fps = 0;
  private lastTime = performance.now();
  private frames = 0;
  private callbacks: ((fps: number) => void)[] = [];

  start() {
    const update = () => {
      const now = performance.now();
      this.frames++;

      if (now >= this.lastTime + 1000) {
        this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
        this.frames = 0;
        this.lastTime = now;

        // Notify listeners
        this.callbacks.forEach(callback => callback(this.fps));
      }

      requestAnimationFrame(update);
    };
    update();
  }

  getCurrentFPS(): number {
    return this.fps;
  }

  subscribe(callback: (fps: number) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  shouldReduceQuality(tier: PerformanceTier): boolean {
    return this.fps < tier.maxFPS * 0.8; // Reduce if FPS drops below 80% of target
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();