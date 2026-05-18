"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Store, Hotel, Shield, Zap, Award, Users } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * 🏔️ BHUTAN HIMALAYAN MASTERPIECE - Premium Cloud Data Flow
 * Night starry sky, majestic mountains, floating clouds, data flowing from mountain-top buildings
 */
export function PremiumHeroSlider({
  heading,
  description: descProp,
  ctaText,
  ctaLink,
  onContact
}: any = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    window.addEventListener('mousemove', handleMouseMove);
    containerRef.current?.addEventListener('mouseenter', handleMouseEnter);
    containerRef.current?.addEventListener('mouseleave', handleMouseLeave);

    setIsLoaded(true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      containerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Generate twinkling stars - professional and subtle
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 35, // Only in top 35%
    size: Math.random() * 1 + 0.5,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 2
  }));

  // Generate professional cloud platforms
  const clouds = [
    { id: 1, x: 15, y: 8, width: 180, height: 60, delay: 0, duration: 40, opacity: 0.08 },
    { id: 2, x: 50, y: 6, width: 200, height: 70, delay: 10, duration: 45, opacity: 0.10 },
    { id: 3, x: 80, y: 9, width: 170, height: 55, delay: 20, duration: 38, opacity: 0.08 },
  ];

  // Mountain buildings positioned on right-side peaks
  const mountainBuildings = [
    {
      id: 'pos',
      name: 'POS Shop',
      icon: Store,
      color: '#39FF14',
      mountainX: 55, // Left peak (right side of screen)
      mountainY: 62,
      signalCount: 2
    },
    {
      id: 'hotel',
      name: 'Hotel',
      icon: Hotel,
      color: '#2563EB',
      mountainX: 75, // Center peak (highest)
      mountainY: 58,
      signalCount: 3
    },
    {
      id: 'security',
      name: 'Security Centre',
      icon: Shield,
      color: '#DC2626',
      mountainX: 92, // Right peak
      mountainY: 62,
      signalCount: 2
    }
  ];

  // Data flow particles - from mountain buildings to cloud platforms
  const dataFlows = mountainBuildings.flatMap(building => {
    // Find nearest cloud platform
    const nearestCloud = clouds.reduce((nearest, cloud) => {
      const distance = Math.abs(cloud.x - building.mountainX);
      return distance < Math.abs(nearest.x - building.mountainX) ? cloud : nearest;
    });

    return Array.from({ length: building.signalCount }, (_, i) => ({
      id: `${building.id}-${i}`,
      buildingId: building.id,
      startX: building.mountainX,
      startY: building.mountainY - 10,
      endX: nearestCloud.x + 5, // Center of cloud platform
      endY: nearestCloud.y + 3, // Center of cloud platform
      delay: i * 2.5,
      color: building.color
    }));
  });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      {/* Night Starry Sky */}
      <div className="absolute inset-0 z-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Himalayan Mountain Range - 3 Distinct Peaks on Right Side */}
      <svg
        className="absolute bottom-0 right-0 z-10"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMax slice"
        style={{ height: '50%', width: '60%' }}
      >
        <defs>
          <linearGradient id="mountainGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1E293B', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0F172A', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: '#E2E8F0', stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>

        {/* Background mountains */}
        <motion.path
          d="M0,400 L0,280 L240,180 L480,250 L720,150 L960,220 L1200,120 L1440,200 L1440,400 Z"
          fill="url(#mountainGradient1)"
          opacity="0.3"
          animate={{ y: [0, -1, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Three Main Mountain Peaks */}
        <g>
          {/* Peak 1 - Left (POS) */}
          <motion.path
            d="M0,400 L0,320 L120,200 L240,320 L240,400 Z"
            fill="url(#mountainGradient1)"
            opacity="0.8"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          />
          <motion.path
            d="M120,200 L145,220 L120,250 L95,220 Z"
            fill="url(#snowGradient)"
            opacity="0.8"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 0 }}
          />

          {/* Peak 2 - Center (Hotel) - Highest */}
          <motion.path
            d="M480,400 L480,280 L720,120 L960,280 L960,400 Z"
            fill="url(#mountainGradient1)"
            opacity="0.9"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.path
            d="M720,120 L750,145 L720,180 L690,145 Z"
            fill="url(#snowGradient)"
            opacity="0.9"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          {/* Peak 3 - Right (Security) */}
          <motion.path
            d="M1200,400 L1200,300 L1320,190 L1440,300 L1440,400 Z"
            fill="url(#mountainGradient1)"
            opacity="0.8"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.path
            d="M1320,190 L1345,215 L1320,245 L1295,215 Z"
            fill="url(#snowGradient)"
            opacity="0.8"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </g>
      </svg>

      {/* Professional Cloud Platforms */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {clouds.map((cloud) => (
          <motion.div
            key={cloud.id}
            className="absolute"
            style={{
              left: `${cloud.x}%`,
              top: `${cloud.y}%`,
              width: cloud.width,
              height: cloud.height,
            }}
            animate={{
              x: [0, 10, 0],
              y: [0, -3, 0],
            }}
            transition={{
              duration: cloud.duration,
              repeat: Infinity,
              delay: cloud.delay,
              ease: "easeInOut"
            }}
          >
            {/* Professional cloud platform - sleek horizontal bar */}
            <div
              className="relative w-full h-full rounded-2xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                opacity: cloud.opacity * 10,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              {/* Subtle grid pattern */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Status indicators */}
              <div className="absolute bottom-2 left-3 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14]/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14]/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14]/20" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Professional Data Flow Signals */}
      <svg className="absolute inset-0 z-25 pointer-events-none" style={{ overflow: 'visible' }}>
        {dataFlows.map((flow) => (
          <g key={flow.id}>
            {/* Subtle connection line */}
            <path
              d={`M ${flow.startX}% ${flow.startY}% L ${flow.endX}% ${flow.endY}%`}
              stroke={flow.color}
              strokeWidth="0.3"
              fill="none"
              opacity={0.1}
            />

            {/* Professional data pulse */}
            <motion.circle
              r="1.5"
              fill={flow.color}
              animate={{
                cx: [`${flow.startX}%`, `${flow.endX}%`],
                cy: [`${flow.startY}%`, `${flow.endY}%`],
                opacity: [0, 0.8, 0],
                r: [1.5, 2, 1.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: flow.delay,
                ease: "linear"
              }}
              style={{ filter: `drop-shadow(0 0 2px ${flow.color})` }}
            />
          </g>
        ))}
      </svg>

      {/* Mountain-top Buildings - Realistic Structures */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {mountainBuildings.map((building) => {
          const Icon = building.icon;
          return (
            <motion.div
              key={building.id}
              className="absolute"
              style={{
                left: `${building.mountainX}%`,
                top: `${building.mountainY - 6}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: building.id === 'pos' ? 0 : building.id === 'hotel' ? 1.5 : 3
              }}
            >
              {/* Building base - realistic structure */}
              <div
                className="relative"
                style={{
                  width: 48,
                  height: 40,
                  background: `linear-gradient(180deg, ${building.color}30, ${building.color}15)`,
                  border: `1.5px solid ${building.color}50`,
                  borderRadius: '4px 4px 0 0',
                  boxShadow: `0 0 20px ${building.color}20`,
                }}
              >
                {/* Windows */}
                <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-100/40 rounded-sm" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-100/40 rounded-sm" />
                <div className="absolute top-6 left-2 w-2 h-2 bg-yellow-100/40 rounded-sm" />
                <div className="absolute top-6 right-2 w-2 h-2 bg-yellow-100/40 rounded-sm" />

                {/* Icon on roof */}
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${building.color}25`,
                    border: `1px solid ${building.color}60`,
                  }}
                >
                  <Icon className="w-3 h-3" style={{ color: building.color }} />
                </div>
              </div>

              {/* Subtle antenna */}
              <div
                className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                style={{
                  width: 2,
                  height: 6,
                  background: `${building.color}60`,
                }}
              />

              {/* Building label */}
              <div
                className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-white/70"
              >
                {building.name}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Premium Cursor - Visible and Professional */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-[#39FF14] pointer-events-none z-50 mix-blend-difference"
            style={{
              x: mousePosition.x * window.innerWidth - 16,
              y: mousePosition.y * window.innerHeight - 16,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Content - Centered */}
      <motion.div
        style={{
          y: y1,
          opacity
        }}
        className="relative z-40 h-full flex flex-col items-center justify-center px-4"
      >
        <div
          className="relative max-w-5xl w-full text-center"
          style={{
            transform: isHovering ? 'translateY(-20px)' : 'translateY(0)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Main Headline - Massive and Premium */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4"
          >
            <h1
              className="text-[12vw] sm:text-[9vw] leading-[0.95] font-black tracking-tighter"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 50%, #94A3B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 80px rgba(57, 255, 20, 0.3)',
              }}
            >
              WE BUILD
            </h1>

            <h1
              className="text-[12vw] sm:text-[9vw] leading-[0.95] font-black -mt-4"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 40px rgba(57, 255, 20, 0.5))',
              }}
            >
              <motion.span
                animate={{
                  background: [
                    'linear-gradient(135deg, #39FF14 0%, #10B981 50%, #06B6D4 100%)',
                    'linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #39FF14 100%)',
                    'linear-gradient(135deg, #06B6D4 0%, #39FF14 50%, #10B981 100%)',
                    'linear-gradient(135deg, #39FF14 0%, #10B981 50%, #06B6D4 100%)',
                  ],
                  backgroundSize: '200% 200%',
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                }}
              >
                DIGITAL WORLDS
              </motion.span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your business with enterprise-grade software and innovative digital solutions
          </motion.p>

          {/* Trust Indicators - Premium */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isLoaded ? { opacity: 1 } : {}}
            transition={{ delay: 0.7, duration: 1 }}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            {[
              { icon: Users, label: '350+ Clients', color: '#39FF14' },
              { icon: Award, label: '15+ Years', color: '#39FF14' },
              { icon: Zap, label: '99.9% Uptime', color: '#06B6D4' }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: `${item.color}20`,
                    border: `1px solid ${item.color}40`
                  }}
                >
                  <item.icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <span className="text-white font-semibold text-base">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons - Distinct & Professional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 1 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <motion.button
              onClick={() => router.push('/services')}
              className="group relative px-14 py-5 bg-gradient-to-r from-[#39FF14] to-[#10B981] rounded-2xl shadow-lg shadow-[#39FF14]/20 overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(57, 255, 20, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <span className="relative z-10 text-black font-bold tracking-wider text-sm uppercase flex items-center gap-3">
                View Our Services
                <ArrowRight className="w-5 h-5" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#10B981] to-[#06B6D4]"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.4 }}
              />
              <span className="absolute inset-0 flex items-center justify-center gap-3 text-white font-bold tracking-wider text-sm uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Explore Now
                <ArrowRight className="w-5 h-5" />
              </span>
            </motion.button>

            <motion.button
              onClick={() => router.push('/company/contact')}
              className="px-14 py-5 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all border-2 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              Get a Consultation
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Premium Glow Effects */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#39FF14] rounded-full opacity-10 blur-3xl"
          style={{
            animation: 'float 8s ease-in-out infinite',
            filter: 'blur(100px)'
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#10B981] rounded-full opacity-10 blur-3xl"
          style={{
            animation: 'float 6s ease-in-out infinite reverse',
            filter: 'blur(100px)'
          }}
        />
      </div>

      {/* CSS Animation for Floating */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
      `}</style>
    </div>
  );
}
