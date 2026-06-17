"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowRight, Calendar, Users, Award, Star, HeadphonesIcon, MapPin, Sparkles, Play } from "lucide-react";
import { getMediaUrl, getVideoUrl } from "@/lib/cloudinary";
import Image from "next/image";

interface GalleryMedia {
  publicId: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  format: string;
  subfolder: string;
  createdAt: string;
  width?: number;
  height?: number;
  duration?: number;
}

const achievements = [
  { number: "12+", label: "Years Experience", icon: Calendar },
  { number: "300+", label: "Active ERP Members", icon: Users },
  { number: "500+", label: "Projects Delivered", icon: Award },
  { number: "99%", label: "Client Satisfaction", icon: Star },
];

/**
 * 🎨 Elegant Hero Gallery with Beautiful Text Overlay
 *
 * Features:
 * - Sliding background gallery
 * - Beautiful hero text overlay
 * - Elegant decorations and details
 * - Click to view fullscreen slideshow
 * - Fetches all media (images & videos) from Cloudinary
 */
export function CompanyPhotoGallery() {
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch all media from Cloudinary
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch('/api/cloudinary/list-images?folder=innovate_bhutan&includeVideos=true');
        const data = await response.json();
        if (data.success) {
          setMedia(data.media);
        }
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  // Auto-rotate background images
  useEffect(() => {
    if (isPaused || loading || media.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % media.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, loading, media.length]);

  const nextMedia = () => {
    setActiveIndex((prev) => (prev + 1) % media.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const prevMedia = () => {
    setActiveIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const getOptimizedUrl = useCallback((publicId: string, isVideo: boolean, width: number) => {
    if (isVideo) {
      return getVideoUrl(publicId, { maxWidth: width });
    }
    return getMediaUrl(publicId, false, true).replace("w_1200", `w_${width}`);
  }, []);

  const getCategory = (item: GalleryMedia) => {
    const folderMap: Record<string, string> = {
      'innovate_bhutan': 'All',
      'services': 'Services',
      'products': 'Products',
      'projects': 'Projects',
      'team': 'Team',
      'events': 'Events'
    };
    return folderMap[item.subfolder] || item.subfolder;
  };

  const getTitle = (item: GalleryMedia) => {
    return item.name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .substring(0, 30);
  };

  const currentMedia = media[activeIndex];

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading gallery...</div>
      </section>
    );
  }

  if (!currentMedia) {
    return null;
  }

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-black select-none"
      onContextMenu={handleContextMenu}
    >
      {/* Background Gallery Slider */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            {currentMedia.type === 'video' ? (
              <>
                <video
                  src={getOptimizedUrl(currentMedia.publicId, true, 1920)}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onContextMenu={handleContextMenu}
                />
                {/* Video indicator */}
                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                  <Play className="w-4 h-4 text-white" fill="currentColor" />
                  <span className="text-white text-xs font-semibold">Video</span>
                </div>
              </>
            ) : (
              <Image
                src={getOptimizedUrl(currentMedia.publicId, false, 1920)}
                alt={getTitle(currentMedia)}
                fill
                className="object-cover"
                draggable={false}
                priority
                onContextMenu={handleContextMenu}
              />
            )}
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sparkle effects */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-emerald-500/30" />
        <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-cyan-500/30" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-cyan-500/30" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-emerald-500/30" />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 border border-emerald-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-48 h-48 border border-cyan-500/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-white/80">Transforming Bhutan's Digital Landscape</span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight">
                  Innovating
                  <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                    Since 2012
                  </span>
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg sm:text-xl text-white/70 max-w-xl leading-relaxed"
              >
                Empowering businesses across Bhutan with cutting-edge technology solutions.
                From enterprise ERP systems to custom software development, we build the future.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4"
              >
                {achievements.map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-start">
                      <stat.icon className="w-3 h-3 text-emerald-400" />
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <button
                  onClick={() => window.location.href = '/contact'}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-full font-bold text-lg transition-all hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-full font-bold text-lg border border-white/20 transition-all hover:shadow-xl"
                >
                  <span>View Gallery</span>
                  <Sparkles className="w-5 h-5" />
                </button>
              </motion.div>
            </motion.div>

            {/* Right Side - Empty for image visibility */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {media.slice(0, 10).map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-12 h-1 rounded-full transition-all ${
              index === activeIndex
                ? 'bg-white'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to media ${index + 1}`}
          />
        ))}
      </div>

      {/* Side Navigation */}
      <button
        onClick={prevMedia}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all border border-white/20 hover:scale-110"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={nextMedia}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-all border border-white/20 hover:scale-110"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Current Media Info */}
      <motion.div
        key={`info-${activeIndex}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 right-8 z-20 text-right"
      >
        <div className="text-6xl font-black text-white/10 leading-none">
          {String(activeIndex + 1).padStart(2, '0')}
        </div>
        <div className="flex items-center justify-end gap-2 mt-1">
          {currentMedia.type === 'video' && (
            <Play className="w-3 h-3 text-emerald-400" fill="currentColor" />
          )}
          <div className="text-sm text-white/60 uppercase tracking-wider">
            {getCategory(currentMedia)}
          </div>
        </div>
        <div className="text-lg font-semibold text-white mt-1">
          {getTitle(currentMedia)}
        </div>
        <div className="text-xs text-white/40 mt-1">
          {media.length} total items • {media.filter((m: GalleryMedia) => m.type === 'video').length} videos
        </div>
      </motion.div>

      {/* Fullscreen Slideshow */}
      <AnimatePresence>
        {isFullscreen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50"
              onClick={() => setIsFullscreen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Media */}
              <div className="flex-1 flex items-center justify-center p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full max-w-6xl max-h-[80vh] flex items-center justify-center"
                  >
                    {currentMedia.type === 'video' ? (
                      <video
                        src={getOptimizedUrl(currentMedia.publicId, true, 1920)}
                        className="max-w-full max-h-full object-contain"
                        autoPlay
                        controls
                        loop
                        playsInline
                      />
                    ) : (
                      <Image
                        src={getOptimizedUrl(currentMedia.publicId, false, 1920)}
                        alt={getTitle(currentMedia)}
                        fill
                        className="object-contain"
                        draggable={false}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="h-24 bg-black/80 backdrop-blur-sm flex items-center px-6 gap-4 overflow-x-auto">
                {media.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`flex-shrink-0 relative h-16 w-24 rounded-lg overflow-hidden transition-all ${
                      index === activeIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                      </div>
                    ) : (
                      <Image
                        src={getOptimizedUrl(item.publicId, false, 200)}
                        alt={getTitle(item)}
                        fill
                        className="object-cover"
                        draggable={false}
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
