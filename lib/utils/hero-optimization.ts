/**
 * Hero Performance Optimization Utilities
 *
 * Optimized loading and fallback mechanisms for hero section media
 */

export interface OptimizedVideoConfig {
  cloudinaryId: string;
  posterId?: string;
  maxWidth?: number;
  quality?: 'auto' | 'low' | 'medium' | 'high';
  lazy?: boolean;
  fallbackGradient?: string;
}

/**
 * Progressive video loader with fallback
 */
export class ProgressiveVideoLoader {
  private loadedVideos = new Set<string>();
  private failedVideos = new Set<string>();

  /**
   * Load video progressively with fallback
   */
  async loadVideoWithFallback(
    videoElement: HTMLVideoElement,
    config: OptimizedVideoConfig
  ): Promise<boolean> {
    const { cloudinaryId, fallbackGradient = '#1e3a8a' } = config;

    // Check if already loaded
    if (this.loadedVideos.has(cloudinaryId)) {
      return true;
    }

    // Check if previously failed
    if (this.failedVideos.has(cloudinaryId)) {
      this.applyFallback(videoElement, fallbackGradient);
      return false;
    }

    try {
      // Create progressive loading promise
      const loadPromise = new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn(`Video loading timeout: ${cloudinaryId}`);
          this.failedVideos.add(cloudinaryId);
          this.applyFallback(videoElement, fallbackGradient);
          resolve(false);
        }, 10000); // 10 second timeout

        videoElement.addEventListener('loadeddata', () => {
          clearTimeout(timeout);
          this.loadedVideos.add(cloudinaryId);
          resolve(true);
        }, { once: true });

        videoElement.addEventListener('error', () => {
          clearTimeout(timeout);
          this.failedVideos.add(cloudinaryId);
          this.applyFallback(videoElement, fallbackGradient);
          resolve(false);
        }, { once: true });
      });

      // Start loading
      videoElement.load();

      return await loadPromise;
    } catch (error) {
      console.error('Video loading error:', error);
      this.failedVideos.add(cloudinaryId);
      this.applyFallback(videoElement, fallbackGradient);
      return false;
    }
  }

  /**
   * Apply fallback gradient background
   */
  private applyFallback(videoElement: HTMLVideoElement, gradient: string): void {
    const parent = videoElement.parentElement;
    if (parent) {
      parent.style.background = `linear-gradient(to bottom, ${gradient}, ${gradient})`;
      videoElement.style.display = 'none';
    }
  }

  /**
   * Check if video can be loaded based on network conditions
   */
  shouldLoadVideo(): boolean {
    // Check network connection if available
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      const effectiveType = conn.effectiveType; // 'slow-2g', '2g', '3g', '4g'

      // Don't load video on slow connections
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return false;
      }

      // Check if data saver is enabled
      if (conn.saveData) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get optimal video quality based on device and network
   */
  getOptimalQuality(): 'low' | 'medium' | 'high' | 'auto' {
    // Check network conditions
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      const effectiveType = conn.effectiveType;

      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'low';
      } else if (effectiveType === '3g') {
        return 'medium';
      }
    }

    // Check device capabilities
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      return 'medium';
    }

    return 'auto';
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.loadedVideos.clear();
    this.failedVideos.clear();
  }
}

/**
 * Lazy load images with intersection observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private loadedImages = new Set<string>();

  constructor() {
    // Only initialize observer on client side
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              this.loadImage(img);
              this.observer?.unobserve(img);
            }
          });
        },
        { rootMargin: '50px' }
      );
    }
  }

  /**
   * Observe image for lazy loading
   */
  observe(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.observe(img);
    }
  }

  /**
   * Load image immediately
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (src && !this.loadedImages.has(src)) {
      img.src = src;
      this.loadedImages.add(src);
    }
  }

  /**
   * Disconnect observer
   */
  disconnect(): void {
    this.observer?.disconnect();
  }
}

/**
 * Performance-aware animation controller
 */
export class AnimationController {
  private reducedMotion: boolean;
  private frameRate: number;

  constructor() {
    // Check for reduced motion preference (with SSR guard)
    if (typeof window !== 'undefined') {
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } else {
      this.reducedMotion = false;
    }

    // Estimate device frame rate capability
    this.frameRate = this.estimateFrameRate();
  }

  /**
   * Estimate device frame rate capability
   */
  private estimateFrameRate(): number {
    // Simple heuristic based on device
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isOldDevice = this.isOldDevice();

    if (isOldDevice) return 30;
    if (isMobile) return 50;
    return 60;
  }

  /**
   * Check if device is older/slower
   */
  private isOldDevice(): boolean {
    // Check for older iOS/Android versions
    const ua = navigator.userAgent;
    const iOSMatch = ua.match(/OS (\d+)_(\d+)_?(\d+)?/);
    const androidMatch = ua.match(/Android (\d+)\.(\d+)/);

    if (iOSMatch && parseInt(iOSMatch[1]) < 14) return true;
    if (androidMatch && parseInt(androidMatch[1]) < 10) return true;

    return false;
  }

  /**
   * Get optimal animation duration
   */
  getOptimalDuration(baseDuration: number): number {
    if (this.reducedMotion) return 0;
    if (this.frameRate < 40) return baseDuration * 1.5; // Slower on low-end devices
    return baseDuration;
  }

  /**
   * Check if complex animations should be enabled
   */
  shouldEnableComplexAnimations(): boolean {
    return !this.reducedMotion && this.frameRate >= 45;
  }

  /**
   * Get optimal particle count
   */
  getOptimalParticleCount(baseCount: number): number {
    if (this.reducedMotion) return 0;
    if (this.frameRate < 40) return Math.floor(baseCount * 0.3);
    if (this.frameRate < 55) return Math.floor(baseCount * 0.6);
    return baseCount;
  }
}

/**
 * Hero content preloader
 */
export class HeroContentPreloader {
  private preloadCache = new Map<string, any>();

  /**
   * Preload hero content
   */
  async preloadContent(content: any): Promise<void> {
    const cacheKey = JSON.stringify(content);

    if (this.preloadCache.has(cacheKey)) {
      return;
    }

    // Preload images
    if (content.videoPosterImageId) {
      this.preloadImage(content.videoPosterImageId);
    }

    // Preload video metadata (not the full video)
    if (content.videoCloudinaryId && content.enableVideoBackground) {
      this.preloadVideoMetadata(content.videoCloudinaryId);
    }

    this.preloadCache.set(cacheKey, true);
  }

  /**
   * Preload image
   */
  private preloadImage(imageId: string): void {
    const img = new Image();
    // Use Cloudinary optimization for preload
    img.src = this.getOptimizedImageUrl(imageId, { width: 100, quality: 'low' });
  }

  /**
   * Preload video metadata only
   */
  private preloadVideoMetadata(videoId: string): void {
    // Just fetch video headers, don't download
    fetch(`/api/video/metadata/${videoId}`, { method: 'HEAD' })
      .catch(console.error);
  }

  /**
   * Get optimized image URL
   */
  private getOptimizedImageUrl(
    publicId: string,
    options: { width?: number; quality?: 'auto' | 'low' | 'medium' | 'high' }
  ): string {
    const transforms = [];
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.quality) transforms.push(`q_${options.quality === 'auto' ? 'auto' : options.quality === 'low' ? '30' : options.quality === 'medium' ? '60' : '90'}`);

    const transformation = transforms.length > 0 ? transforms.join(',') : '';
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformation}/${publicId}`;
  }
}

// Export singleton instances (with SSR guards)
export const progressiveVideoLoader = new ProgressiveVideoLoader();
export const lazyImageLoader = typeof window !== 'undefined' ? new LazyImageLoader() : null;
export const animationController = typeof window !== 'undefined' ? new AnimationController() : null;
export const heroContentPreloader = new HeroContentPreloader();