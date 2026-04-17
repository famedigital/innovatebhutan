"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Store, Hotel, Code, Wrench, LayoutGrid, Shield, Zap, Smartphone, FileText, Users, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getMediaUrl } from "@/lib/cloudinary";

// Typewriter Hook
function useTypewriter(phrases: string[], typingSpeed = 80, deletingSpeed = 40, pauseDuration = 2000) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimer);
    }

    if (isDeleting) {
      if (text.length > 0) {
        const deleteTimer = setTimeout(() => {
          setText(text.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(deleteTimer);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    } else {
      if (text.length < currentPhrase.length) {
        const typeTimer = setTimeout(() => {
          setText(currentPhrase.slice(0, text.length + 1));
        }, typingSpeed);
        return () => clearTimeout(typeTimer);
      } else {
        setIsPaused(true);
      }
    }
  }, [text, isDeleting, isPaused, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return { text, isDeleting, isPaused };
}

// iOS App Store Style Service Card
function MorphingBlobCard({ service, onClick, index, onHover, onLeave }: {
  service: any;
  onClick: () => void;
  index: number;
  onHover?: (name: string) => void;
  onLeave?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showSubs, setShowSubs] = useState(false);
  const Icon = service.icon;
  const hasSubs = (service as any).subs;
  const subCount = hasSubs ? (service as any).subs.length : 0;

  // Extract first color from gradient
  const gradient = service.gradient || 'linear-gradient(145deg, #10B981, #059669)';
  const colorMatch = gradient.match(/#[A-F0-9]{6}/gi);
  const primaryColor = colorMatch?.[0] || '#10B981';

  return (
    <div
      className="group"
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(service.name);
        if (hasSubs) setShowSubs(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onLeave?.();
        setShowSubs(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {/* App Icon */}
      <div
        className="relative mb-2 mx-auto"
        style={{ width: '64px', height: '64px' }}
      >
        {/* Outer glow on hover */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.5, scale: 1 }}
            className="absolute inset-0 rounded-3xl blur-xl"
            style={{ background: gradient }}
          />
        )}

        {/* Main icon container */}
        <motion.div
          className="relative w-full h-full rounded-3xl flex items-center justify-center shadow-lg cursor-pointer"
          style={{
            background: gradient,
            boxShadow: isHovered
              ? `0 16px 32px -8px ${primaryColor}50`
              : '0 4px 16px -4px rgba(0,0,0,0.15)',
          }}
          animate={{
            scale: isPressed ? 0.92 : isHovered ? 1.08 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
        >
          <Icon className="w-8 h-8 text-white" />

          {/* Sub-services indicator */}
          {hasSubs && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-md"
            >
              <span className="text-[9px]" style={{ color: primaryColor }}>
                {subCount}
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Service name - with word wrap */}
      <h3 className="text-center text-xs text-foreground mb-0.5 leading-tight line-clamp-2">
        {service.name}
      </h3>

      {/* Category */}
      <p className="text-center text-[10px] text-foreground/40 line-clamp-1">
        {service.category}
      </p>

      {/* Sub-services flyout menu - higher z-index */}
      {hasSubs && showSubs && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="absolute z-[9999] left-1/2 -translate-x-1/2 bottom-full mb-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-white/10 p-2 min-w-[140px]"
        >
          <div className="flex flex-col gap-0.5">
            {(service as any).subs.map((sub: string, i: number) => (
              <motion.div
                key={sub}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="px-3 py-2 rounded-xl text-xs text-foreground/70 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer text-center"
              >
                {sub}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

const heroSlides = [
  { image: "/hero/restaurantpos.png", name: "Restaurant POS" },
  { image: "/hero/hotelpms.png", name: "Hotel PMS" },
  { image: "/hero/cctv.png", name: "CCTV Security" },
  { image: "/hero/hardware.png", name: "Hardware Solutions" },
];

// SVG Illustration Components - Light theme with animations
const RetailPOSIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="bg-light" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ECFDF5"/>
        <stop offset="100%" stopColor="#D1FAE5"/>
      </linearGradient>

      <linearGradient id="pos-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981"/>
        <stop offset="50%" stopColor="#34D399"/>
        <stop offset="100%" stopColor="#059669"/>
      </linearGradient>

      <linearGradient id="screen-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6EE7B7"/>
        <stop offset="100%" stopColor="#34D399"/>
      </linearGradient>

      <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="soft-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="6"/>
      </filter>
    </defs>

    {/* Animated background */}
    <rect width="200" height="200" fill="url(#bg-light)" opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="4s" repeatCount="indefinite"/>
    </rect>

    {/* Floating particles */}
    {[...Array(8)].map((_, i) => (
      <circle
        key={i}
        cx={30 + Math.random() * 140}
        cy={30 + Math.random() * 140}
        r="2"
        fill="#10B981"
        opacity="0.3"
      >
        <animate
          attributeName="cy"
          values={`${30 + Math.random() * 140};${20 + Math.random() * 100};${30 + Math.random() * 140}`}
          dur={`${3 + Math.random() * 2}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3;0.6;0.3"
          dur={`${2 + Math.random()}s`}
          repeatCount="indefinite"
        />
      </circle>
    ))}

    {/* POS Base - modern design */}
    <ellipse cx="100" cy="165" rx="75" ry="12" fill="#10B981" opacity="0.2">
      <animate attributeName="rx" values="75;78;75" dur="3s" repeatCount="indefinite"/>
    </ellipse>

    {/* Main POS Unit */}
    <g>
      <rect x="50" y="80" width="100" height="70" rx="12" fill="url(#pos-body)" filter="url(#glow-effect)">
        <animate attributeName="fill-opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite"/>
      </rect>

      {/* Screen */}
      <rect x="58" y="88" width="84" height="45" rx="6" fill="#ECFDF5">
        <animate attributeName="fill" values="#ECFDF5;#F0FDFA;#ECFDF5" dur="3s" repeatCount="indefinite"/>
      </rect>

      {/* Animated screen content */}
      <g>
        <text x="100" y="108" textAnchor="middle" fill="#059669" fontSize="9" fontWeight="bold">TOTAL</text>
        <text x="100" y="125" textAnchor="middle" fill="#10B981" fontSize="16" fontWeight="900">
          Nu.1,250
          <animate attributeName="font-size" values="16;17;16" dur="1s" repeatCount="indefinite"/>
        </text>
      </g>

      {/* Animated buttons */}
      {[...Array(9)].map((_, i) => (
        <circle
          key={i}
          cx={65 + (i % 3) * 25}
          cy={138 + Math.floor(i / 3) * 8}
          r="4"
          fill="#34D399"
        >
          <animate
            attributeName="r"
            values="4;5;4"
            dur={`${0.8 + i * 0.1}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill"
            values="#34D399;#6EE7B7;#34D399"
            dur={`${1 + i * 0.15}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* Status LED */}
      <circle cx="58" cy="92" r="4" fill="#10B981" filter="url(#soft-glow)">
        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
      </circle>
    </g>

    {/* Receipt Printer */}
    <g>
      <rect x="115" y="55" width="35" height="30" rx="6" fill="url(#pos-body)"/>
      {/* Animated paper */}
      <rect x="120" y="58" width="25" height="20" rx="2" fill="white">
        <animate
          attributeName="height"
          values="20;25;20"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>
      {[...Array(4)].map((_, i) => (
        <line
          key={i}
          x1="124"
          y1={62 + i * 5}
          x2="141"
          y2={62 + i * 5}
          stroke="#10B981"
          strokeWidth="1"
          opacity="0.5"
        >
          <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite"/>
        </line>
      ))}
    </g>

    {/* Card reader */}
    <rect x="55" y="70" width="50" height="8" rx="4" fill="#059669">
      <animate attributeName="fill" values="#059669;#10B981;#059669" dur="2s" repeatCount="indefinite"/>
    </rect>
  </svg>
);

const HotelPMSIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="hotel-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EFF6FF"/>
        <stop offset="100%" stopColor="#DBEAFE"/>
      </linearGradient>

      <linearGradient id="hotel-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6"/>
        <stop offset="100%" stopColor="#1D4ED8"/>
      </linearGradient>

      <linearGradient id="monitor-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA"/>
        <stop offset="100%" stopColor="#3B82F6"/>
      </linearGradient>

      <filter id="blue-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feFlood floodColor="#3B82F6" floodOpacity="0.6"/>
        <feComposite in2="coloredBlur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Animated background */}
    <rect width="200" height="200" fill="url(#hotel-bg)" opacity="0.85">
      <animate attributeName="opacity" values="0.85;1;0.85" dur="5s" repeatCount="indefinite"/>
    </rect>

    {/* Floating bubbles */}
    {[...Array(10)].map((_, i) => (
      <circle
        key={i}
        cx={20 + Math.random() * 160}
        cy={20 + Math.random() * 160}
        r={3 + Math.random() * 5}
        fill="#3B82F6"
        opacity="0.2"
      >
        <animate
          attributeName="cy"
          values={`${20 + Math.random() * 160};${10 + Math.random() * 120};${20 + Math.random() * 160}`}
          dur={`${4 + Math.random() * 2}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="r"
          values={`${3 + Math.random() * 5};${5 + Math.random() * 3};${3 + Math.random() * 5}`}
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
    ))}

    {/* Floor shadow */}
    <ellipse cx="100" cy="170" rx="80" ry="10" fill="#3B82F6" opacity="0.2">
      <animate attributeName="rx" values="80;83;80" dur="4s" repeatCount="indefinite"/>
    </ellipse>

    {/* Reception desk - modern style */}
    <path d="M35 135 L35 160 L165 160 L165 135 L155 105 L45 105 Z" fill="url(#hotel-accent)"/>

    {/* Desk counter */}
    <ellipse cx="100" cy="135" rx="60" ry="8" fill="#60A5FA" opacity="0.4"/>

    {/* Monitor stand */}
    <rect x="90" y="120" width="20" height="15" rx="3" fill="#1E40AF"/>
    <ellipse cx="100" cy="135" rx="18" ry="4" fill="#1E3A8A"/>

    {/* Monitor */}
    <g>
      <rect x="50" y="50" width="100" height="65" rx="8" fill="url(#monitor-grad)" filter="url(#blue-glow)">
        <animate attributeName="fill-opacity" values="0.9;1;0.9" dur="2.5s" repeatCount="indefinite"/>
      </rect>

      {/* Screen display */}
      <rect x="55" y="55" width="90" height="55" rx="4" fill="#EFF6FF"/>

      {/* Animated content */}
      <g>
        <rect x="62" y="62" width="76" height="12" rx="3" fill="#3B82F6" opacity="0.2">
          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="2s" repeatCount="indefinite"/>
        </rect>
        <text x="100" y="72" textAnchor="middle" fill="#1D4ED8" fontSize="7" fontWeight="bold">HOTEL PMS</text>

        <rect x="62" y="78" width="35" height="8" rx="2" fill="#60A5FA" opacity="0.5"/>
        <rect x="102" y="78" width="35" height="8" rx="2" fill="#60A5FA" opacity="0.5"/>

        <rect x="62" y="90" width="76" height="15" rx="3" fill="#3B82F6" opacity="0.15">
          <animate attributeName="width" values="76;70;76" dur="3s" repeatCount="indefinite"/>
        </rect>
      </g>
    </g>

    {/* Room key cards */}
    <g transform="translate(30, 95)">
      {[...Array(3)].map((_, i) => (
        <g key={i}>
          <rect
            x={i * 18}
            y={0}
            width="15"
            height="25"
            rx="3"
            fill="#60A5FA"
            opacity="0.7"
          >
            <animate
              attributeName="opacity"
              values="0.7;1;0.7"
              dur={`${1.5 + i * 0.3}s`}
              repeatCount="indefinite"
            />
          </rect>
          <circle cx={i * 18 + 7.5} cy="8" r="2" fill="#EFF6FF"/>
        </g>
      ))}
    </g>

    {/* Bell icon */}
    <g transform="translate(145, 100)">
      <ellipse cx="10" cy="18" rx="10" ry="3" fill="#1E40AF" opacity="0.3"/>
      <path d="M3 12 Q10 0 17 12 L15 16 L5 16 Z" fill="#F59E0B">
        <animate attributeName="fill" values="#F59E0B;#FBBF24;#F59E0B" dur="2s" repeatCount="indefinite"/>
      </path>
      <circle cx="10" cy="5" r="3" fill="#FCD34D">
        <animate attributeName="r" values="3;4;3" dur="1s" repeatCount="indefinite"/>
      </circle>
    </g>

    {/* Status indicators */}
    <circle cx="55" cy="60" r="4" fill="#10B981" filter="url(#blue-glow)">
      <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

const LaborInstallationIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="labor-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEF3C7"/>
        <stop offset="100%" stopColor="#FDE68A"/>
      </linearGradient>

      <linearGradient id="labor-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B"/>
        <stop offset="100%" stopColor="#D97706"/>
      </linearGradient>

      <linearGradient id="cable-flow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
        <stop offset="50%" stopColor="#34D399" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#10B981" stopOpacity="0.3"/>
      </linearGradient>

      <filter id="warm-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
        <feFlood floodColor="#F59E0B" floodOpacity="0.5"/>
        <feComposite in2="coloredBlur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Animated background */}
    <rect width="200" height="200" fill="url(#labor-bg)" opacity="0.9">
      <animate attributeName="opacity" values="0.9;1;0.9" dur="4s" repeatCount="indefinite"/>
    </rect>

    {/* Animated data flow lines */}
    {[...Array(8)].map((_, i) => {
      const yPos = 40 + i * 15;
      return (
        <g key={i}>
          <path
            d={`M20 ${yPos} L180 ${yPos}`}
            stroke="url(#cable-flow)"
            strokeWidth="2"
            opacity="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.8;0.3"
            dur={`${2 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </path>
        <circle cx={20} cy={yPos} r="3" fill="#10B981">
          <animate
            attributeName="cx"
            values="20;180;20"
            dur={`${3 + i * 0.4}s`}
            repeatCount="indefinite"
          />
        </circle>
        </g>
      );
    })}

    {/* Server rack */}
    <g transform="translate(130, 70)">
      <rect x="0" y="0" width="55" height="70" rx="6" fill="#1F2937"/>
      <rect x="3" y="3" width="49" height="64" rx="4" fill="#374151"/>

      {/* Server units with animated LEDs */}
      {[...Array(4)].map((_, i) => (
        <g key={i}>
          <rect x="6" y={6 + i * 15} width="43" height="12" rx="2" fill="#4B5563"/>
          {[...Array(6)].map((_, j) => (
            <circle
              key={j}
              cx={10 + j * 7}
              cy={12 + i * 15}
              r="2"
              fill="#10B981"
            >
              <animate
                attributeName="fill"
                values="#10B981;#34D399;#10B981"
                dur={`${0.5 + j * 0.15 + i * 0.2}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      ))}
    </g>

    {/* Ladder */}
    <g transform="translate(35, 75)">
      {[...Array(2)].map((_, i) => (
        <rect
          key={i}
          x={i * 22}
          y="0"
          width="4"
          height="75"
          rx="2"
          fill="#6B7280"
        >
          <animate attributeName="fill" values="#6B7280;#9CA3AF;#6B7280" dur="4s" repeatCount="indefinite"/>
        </rect>
      ))}
      {[...Array(8)].map((_, i) => (
        <rect
          key={i}
          x="4"
          y={4 + i * 9}
          width="18"
          height="3"
          rx="1"
          fill="#9CA3AF"
        />
      ))}
    </g>

    {/* Technician on ladder - animated */}
    <g transform="translate(47, 50)">
      {/* Head */}
      <circle cx="5" cy="0" r="10" fill="#FBBF24">
        <animate attributeName="fill" values="#FBBF24;#FCD34D;#FBBF24" dur="3s" repeatCount="indefinite"/>
      </circle>

      {/* Safety vest */}
      <rect x="-5" y="12" width="20" height="20" rx="4" fill="url(#labor-accent)" filter="url(#warm-glow)"/>

      {/* Vest reflective strips */}
      <rect x="-5" y="16" width="20" height="3" fill="#FEF3C7">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite"/>
      </rect>
      <rect x="-5" y="25" width="20" height="3" fill="#FEF3C7">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="1s" repeatCount="indefinite" begin="0.5s"/>
      </rect>

      {/* Arms working */}
      <g>
        <line x1="-5" y1="18" x2="-18" y2="12" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round">
          <animate attributeName="x2" values="-18;-15;-18" dur="1s" repeatCount="indefinite"/>
        </line>
        <circle cx="-18" cy="12" r="4" fill="#FBBF24">
          <animate attributeName="cx" values="-18;-15;-18" dur="1s" repeatCount="indefinite"/>
        </circle>
        <line x1="15" y1="18" x2="28" y2="10" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round">
          <animate attributeName="x2" values="28;25;28" dur="1s" repeatCount="indefinite"/>
        </line>
        <circle cx="28" cy="10" r="4" fill="#FBBF24">
          <animate attributeName="cx" values="28;25;28" dur="1s" repeatCount="indefinite"/>
        </circle>
      </g>

      {/* Tool in hand */}
      <g transform="translate(22, 6)">
        <rect x="0" y="0" width="8" height="3" rx="1" fill="#6B7280"/>
      </g>
    </g>

    {/* Ground technician */}
    <g transform="translate(90, 145)">
      <circle cx="0" cy="0" r="9" fill="#FBBF24"/>
      <rect x="-8" y="10" width="16" height="18" rx="4" fill="url(#labor-accent)"/>
      <rect x="-8" y="14" width="16" height="3" fill="#FEF3C7">
        <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
      </rect>

      <line x1="-8" y1="14" x2="-20" y2="20" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"/>
      <line x1="8" y1="14" x2="20" y2="20" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"/>
    </g>

    {/* Tool box */}
    <g transform="translate(25, 150)">
      <rect x="0" y="0" width="30" height="18" rx="3" fill="#6B7280"/>
      <rect x="3" y="-3" width="24" height="3" rx="1" fill="#4B5563"/>
      <circle cx="8" cy="9" r="2" fill="#F59E0B">
        <animate attributeName="fill" values="#F59E0B;#FBBF24;#F59E0B" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="15" cy="9" r="2" fill="#10B981">
        <animate attributeName="fill" values="#10B981;#34D399;#10B981" dur="0.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="22" cy="9" r="2" fill="#EF4444">
        <animate attributeName="fill" values="#EF4444;#F87171;#EF4444" dur="1.2s" repeatCount="indefinite"/>
      </circle>
    </g>

    {/* Floor */}
    <rect x="0" y="165" width="200" height="35" fill="#D1D5DB"/>
    {[...Array(12)].map((_, i) => (
      <line
        key={i}
        x1={i * 17}
        y1="165"
        x2={i * 17}
        y2="200"
        stroke="#9CA3AF"
        strokeWidth="1"
        opacity="0.3"
      />
    ))}
  </svg>
);

const SecurityAIIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="security-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FEE2E2"/>
        <stop offset="100%" stopColor="#FECACA"/>
      </linearGradient>

      <linearGradient id="security-accent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EF4444"/>
        <stop offset="100%" stopColor="#DC2626"/>
      </linearGradient>

      <linearGradient id="ai-scan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#EF4444" stopOpacity="0"/>
        <stop offset="50%" stopColor="#EF4444" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#EF4444" stopOpacity="0"/>
      </linearGradient>

      <filter id="red-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feFlood floodColor="#EF4444" floodOpacity="0.6"/>
        <feComposite in2="coloredBlur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Animated background */}
    <rect width="200" height="200" fill="url(#security-bg)" opacity="0.9">
      <animate attributeName="opacity" values="0.9;1;0.9" dur="4s" repeatCount="indefinite"/>
    </rect>

    {/* Radar scan effect */}
    <g opacity="0.3">
      {[...Array(4)].map((_, i) => (
        <circle
          key={i}
          cx="100"
          cy="100"
          r={30 + i * 20}
          fill="none"
          stroke="#EF4444"
          strokeWidth="1"
        >
          <animate
            attributeName="r"
            values="30;100;30"
            dur="4s"
            repeatCount="indefinite"
            begin={`${i}s`}
          />
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="4s"
            repeatCount="indefinite"
            begin={`${i}s`}
          />
        </circle>
      ))}
    </g>

    {/* Monitor */}
    <g transform="translate(35, 45)">
      {/* Monitor frame */}
      <rect x="0" y="0" width="130" height="85" rx="8" fill="#1F2937"/>
      <rect x="4" y="4" width="122" height="77" rx="5" fill="#111827"/>

      {/* Screen grid - 4 camera feeds */}
      <g>
        {/* Top left */}
        <rect x="6" y="6" width="57" height="35" rx="2" fill="#374151"/>
        <rect x="10" y="10" width="20" height="25" rx="2" fill="#4B5563" opacity="0.5"/>

        {/* AI detection box - animated */}
        <rect
          x="8"
          y="8"
          width="24"
          height="29"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          filter="url(#red-glow)"
        >
          <animate
            attributeName="stroke-opacity"
            values="0.5;1;0.5"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Corner markers */}
        {[...Array(4)].map((_, i) => {
          const corners = [[8, 8], [30, 8], [8, 35], [30, 35]];
          const [cx, cy] = corners[i];
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="3"
              fill="#EF4444"
              filter="url(#red-glow)"
            >
              <animate
                attributeName="r"
                values="2;4;2"
                dur="0.8s"
                repeatCount="indefinite"
                begin={`${i * 0.2}s`}
              />
            </circle>
          );
        })}

        {/* Top right */}
        <rect x="67" y="6" width="57" height="35" rx="2" fill="#374151"/>
        <rect x="71" y="10" width="45" height="28" rx="2" fill="#4B5563" opacity="0.5"/>

        {/* Scanning line */}
        <rect
          x="67"
          y="6"
          width="57"
          height="2"
          fill="#EF4444"
          opacity="0.5"
        >
          <animate
            attributeName="y"
            values="6;39;6"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Bottom left */}
        <rect x="6" y="45" width="57" height="33" rx="2" fill="#374151"/>
        <rect x="12" y="50" width="28" height="22" rx="2" fill="#4B5563" opacity="0.5"/>

        {/* Multiple detection boxes */}
        {[...Array(2)].map((_, i) => (
          <rect
            key={i}
            x={10 + i * 18}
            y="48"
            width="14"
            height="24"
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.5"
            filter="url(#red-glow)"
          >
            <animate
              attributeName="stroke-opacity"
              values="0.4;0.9;0.4"
              dur="1.8s"
              repeatCount="indefinite"
              begin={`${i * 0.4}s`}
            />
          </rect>
        ))}

        {/* Bottom right - heat map */}
        <rect x="67" y="45" width="57" height="33" rx="2" fill="#374151"/>
        <circle cx="95" cy="62" r="15" fill="url(#ai-scan)">
          <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="90" cy="56" r="8" fill="#EF4444" opacity="0.3"/>
        <circle cx="100" cy="68" r="6" fill="#EF4444" opacity="0.25"/>
      </g>

      {/* Monitor stand */}
      <rect x="55" y="85" width="20" height="12" fill="#1F2937"/>
      <ellipse cx="65" cy="97" rx="20" ry="4" fill="#374151"/>
    </g>

    {/* Status indicators */}
    <g transform="translate(40, 145)">
      {[...Array(5)].map((_, i) => (
        <circle
          key={i}
          cx={i * 12}
          cy="0"
          r="4"
          fill="#EF4444"
          filter="url(#red-glow)"
        >
          <animate
            attributeName="fill"
            values="#EF4444;#F87171;#EF4444"
            dur={`${0.6 + i * 0.15}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>

    {/* AI status text */}
    <text x="140" y="150" fill="#EF4444" fontSize="8" fontWeight="bold" filter="url(#red-glow)">
      AI ACTIVE
      <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
    </text>

    {/* Floating cameras */}
    {[...Array(3)].map((_, i) => (
      <g key={i} transform={`translate(${30 + i * 50}, 165)`}>
        <rect x="0" y="0" width="20" height="14" rx="3" fill="#1F2937"/>
        <circle cx="10" cy="7" r="4" fill="#EF4444" filter="url(#red-glow)">
          <animate
            attributeName="fill"
            values="#EF4444;#FCA5A5;#EF4444"
            dur={`${1 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </circle>
        <rect x="7" y="14" width="6" height="4" fill="#374151"/>
      </g>
    ))}

    {/* Alert pulse */}
    <g transform="translate(175, 35)">
      <circle cx="0" cy="0" r="12" fill="#EF4444" opacity="0.3">
        <animate attributeName="r" values="8;16;8" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="0" r="6" fill="#EF4444"/>
      <text x="0" y="2" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">!</text>
    </g>
  </svg>
);

const servicesVisual = [
  { name: "Retail POS", icon: RetailPOSIllustration, desc: "Modern POS Systems" },
  { name: "Hotel PMS", icon: HotelPMSIllustration, desc: "Hospitality Management" },
  { name: "Installation", icon: LaborInstallationIllustration, desc: "Professional Teams" },
  { name: "Security AI", icon: SecurityAIIllustration, desc: "Advanced Monitoring" },
];

const mainServices = [
  { name: "POS Solutions", icon: Store, gradient: "linear-gradient(145deg, #FF6B35, #DC2626, #B91C1C)", category: "POS Systems", subs: ["Retail POS", "Restaurant POS"] },
  { name: "Hotel PMS", icon: Hotel, gradient: "linear-gradient(145deg, #3B82F6, #4F46E5, #4338CA)", category: "POS Systems" },
  { name: "Web Development", icon: Code, gradient: "linear-gradient(145deg, #A855F7, #EC4899, #DB2777)", category: "Web/SaaS" },
  { name: "SaaS Development", icon: Database, gradient: "linear-gradient(145deg, #8B5CF6, #7C3AED, #6D28D9)", category: "Web/SaaS" },
  { name: "ERP Development", icon: LayoutGrid, gradient: "linear-gradient(145deg, #6366F1, #2563EB, #1D4ED8)", category: "Web/SaaS" },
  { name: "Mobile App Development", icon: Smartphone, gradient: "linear-gradient(145deg, #14B8A6, #0891B2, #0E7490)", category: "Web/SaaS" },
  { name: "Infrastructure Solutions", icon: Wrench, gradient: "linear-gradient(145deg, #64748B, #71717A, #52525B)", category: "Infrastructure", subs: ["Hardware Solutions", "Network Infrastructure", "Power Solutions"] },
  { name: "Security Systems", icon: Shield, gradient: "linear-gradient(145deg, #EF4444, #E11D48, #BE123C)", category: "Security", subs: ["Security Systems", "Anti Theft System"] },
  { name: "Technical Maintenance", icon: Zap, gradient: "linear-gradient(145deg, #22C55E, #10B981, #059669)", category: "Maintenance" },
  { name: "Payroll & HR Whitelabel", icon: Users, gradient: "linear-gradient(145deg, #F43F5E, #EC4899, #BE185D)", category: "Web/SaaS" },
  { name: "GST Services", icon: FileText, gradient: "linear-gradient(145deg, #EAB308, #D97706, #B45309)", category: "Business Services" },
  { name: "IT Consulting", icon: Search, gradient: "linear-gradient(145deg, #06B6D4, #3B82F6, #2563EB)", category: "Consulting" },
];

const serviceToImageMap: Record<string, string> = {
  "POS Solutions": "/hero/resturant.png",
  "Hotel PMS": "/hero/hotelpms.png",
  "Web Development": "/hero/software.png",
  "SaaS Development": "/hero/software.png",
  "ERP Development": "/hero/software.png",
  "Mobile App Development": "/hero/software.png",
  "Infrastructure Solutions": "/hero/hardware.png",
  "Security Systems": "/hero/cctv.png",
  "Technical Maintenance": "/hero/tech_maintaince.png",
  "Payroll & HR Whitelabel": "/hero/software.png",
  "GST Services": "/hero/software.png",
  "IT Consulting": "/hero/software.png",
};

export function HeroSection() {
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [clients, setClients] = useState<string[]>([
    "Chimi Jamyang Pvt Ltd", "Baleno", "T.T Extra", "YOYO Bhutan",
    "Malaya Jewelry", "Capital P.M.S", "Hayate Ramen", "Namsey Medical",
    "Khuenphen Pharmacy", "Yangki Enterprise", "Idesire", "Smilers Bistero",
    "E-World Digital", "Shoe Space", "Dokar Mart", "SPCG", "Explore Pizza",
    "Lilly Traders", "Urban Dumra", "Kuensel Corporation", "DSB Book Store",
    "Paro Canteen", "Paro Momo Corner", "Zeppo Sales", "Shopper's Store",
    "Daily Chew Cafe", "Lhoden Automobile", "Shoponline.Bt", "Burger Point", "Druk Pizza Thimphu"
  ]);
  const router = useRouter();

  // Typewriter effect for slogan
  const typewriterPhrases = useMemo(() => [
    "Bhutan's tomorrow",
    "your business growth",
    "enterprise success",
    "digital transformation",
  ], []);
  const { text: typewriterText, isDeleting, isPaused } = useTypewriter(typewriterPhrases, 80, 40, 2000);

  // 📡 Live fetch from Supabase
  useEffect(() => {
    const supabase = createClient();
    supabase.from('clients').select('name').eq('active', true).order('id').then(({ data }) => {
      if (data && data.length > 0) {
        setClients(data.map(c => c.name));
      }
    });
  }, []);

  // 💡 LED neon highlight — scans through clients sequentially
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIdx(prev => (prev + 1) % (clients.length || 1));
    }, 1800);
    return () => clearInterval(interval);
  }, [clients.length]);

  // Auto slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // 🛰️ CLOUDINARY ASSET MAPPING
  const CLOUD = 'dr9a371tx';
  const videoUrl = (id: string) =>
    `https://res.cloudinary.com/${CLOUD}/video/upload/f_auto,q_auto,br_auto,vc_auto/${id}.mp4`;
  const imageUrl = (id: string) =>
    `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,fl_progressive,w_1200/innovate_bhutan/${id}`;

  const assets = {
    enterpriseHero: videoUrl('innovate_bhutan/hero_main_video'),
    securityGuardian: imageUrl('security_ai_node'),
    posTech: videoUrl('innovate_bhutan/pos_systems_video'),
    networkMesh: imageUrl('network_flow'),
  };

  return (
    <div className="relative flex flex-col max-w-[1300px] mx-auto pt-6 lg:pt-10 pb-20 lg:pb-24 px-5 transition-colors rounded-[32px] overflow-visible">

      {/* Title - full width with Typewriter Effect */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[32px] lg:text-[44px] font-bold text-foreground leading-[1.2] mb-8 transition-colors"
      >
        Innovating today for{" "}
        <span className="relative text-primary">
          {typewriterText}
          <motion.span
            animate={{
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "steps(1)",
            }}
            className="absolute -right-1 top-0 h-full w-0.5 bg-primary"
          />
        </span>
      </motion.h1>

      {/* Two columns - same height, aligned */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-[50px]">

      {/* 🏙️ LEFT SIDE: SERVICES - iOS App Store Grid - 4 Columns Only */}
      <div className="flex-1 w-full min-h-[550px]">
        <div className="bg-white dark:bg-[#050505] border border-[#ebebeb] dark:border-white/10 rounded-[16px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-none transition-all h-full">
          <div className="mb-6">
            <h2 className="text-[14px] lg:text-[16px] text-foreground/50">Select Your Industry Solution</h2>
          </div>

          {/* App Store Grid - Responsive: 3 on mobile, up to 6 on desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 gap-y-6 justify-items-center">
            {mainServices.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: i * 0.04,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <MorphingBlobCard
                  service={service}
                  index={i}
                  onClick={() => {
                    router.push(`/services?category=${encodeURIComponent((service as any).category)}`);
                  }}
                  onHover={(name) => setHoveredService(name)}
                  onLeave={() => setHoveredService(null)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 🖼️ RIGHT SIDE: SERVICES ILLUSTRATION GRID */}
      <div className="flex-1 w-full min-h-[550px]">
        {hoveredService && serviceToImageMap[hoveredService] ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-[550px] rounded-3xl overflow-hidden"
            style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
          >
            <img
              src={serviceToImageMap[hoveredService]}
              alt={hoveredService}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/40 backdrop-blur-sm border-t border-white/10">
              <h3 className="text-white text-xl font-semibold">{hoveredService}</h3>
              <p className="text-white/60 text-sm">innovates.bt</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-6 h-[550px]">
            {servicesVisual.map((service, idx) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.name}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    delay: idx * 0.1, 
                    duration: 0.6, 
                    stiffness: 100, 
                    damping: 15 
                  }}
                  whileHover={{ scale: 1.02 }}
                  className="relative w-full h-full rounded-3xl overflow-hidden cursor-pointer group"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  }}
                >
                  {/* SVG Illustration */}
                  <div className="absolute inset-0 bg-white/50 dark:bg-white/10">
                    <IconComponent />
                  </div>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-[#00FF00]/20 via-transparent to-transparent" />
                  
                  {/* Glass overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 backdrop-blur-sm border-t border-white/10">
                    <h3 className="text-white font-semibold text-sm">{service.name}</h3>
                    <p className="text-white/50 text-xs">{service.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Close two-column flex container */}
      </div>

      {/* 🛡️ TRUST MARQUEE — LED NEON HIGHLIGHT */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        {/* flickering top border */}
        <div className="animate-border-flicker w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="relative bg-gradient-to-r from-black/95 via-slate-950/98 to-black/95 dark:from-black dark:via-[#030712] dark:to-black backdrop-blur-md py-6">
          {/* ⚡ Electric pulse beam sweeping L→R */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="animate-electric-pulse absolute top-0 left-0 h-full w-1/4"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(57,255,20,0.04) 20%, rgba(57,255,20,0.18) 50%, rgba(57,255,20,0.04) 80%, transparent 100%)',
                filter: 'blur(4px)',
              }}
            />
          </div>

          <div className="max-w-[1300px] mx-auto px-5 flex items-center gap-10">
             <div className="flex items-center gap-3 shrink-0 border-r border-primary/40 pr-10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary)]" />
                <Shield className="w-5 h-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[12px] font-black uppercase tracking-[0.3em] text-white/60">Trusted By</span>
                  <span className="text-[16px] font-black uppercase tracking-[0.2em] text-primary neon-text">350+ Enterprises</span>
                </div>
             </div>

             <div className="flex-1 overflow-hidden relative">
                <div className="flex items-center gap-16 animate-marquee whitespace-nowrap">
                   {[...clients, ...clients].map((client, i) => {
                     const realIdx = i % clients.length;
                     const isLit = realIdx === highlightIdx;
                     return (
                       <span
                         key={i}
                         className={`relative text-[13px] font-black uppercase tracking-[0.15em] transition-all duration-500 cursor-default ${
                           isLit
                             ? 'text-primary scale-110'
                             : 'text-white/90 hover:text-white'
                         }`}
                         style={isLit ? {
                           textShadow: '0 0 10px var(--primary), 0 0 25px var(--primary), 0 0 50px rgba(57,255,20,0.5)',
                         } : {}}
                       >
                         {isLit && (
                           <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2 mb-0.5 shadow-[0_0_10px_var(--primary)] animate-pulse" />
                         )}
                         {client}
                       </span>
                     );
                   })}
                </div>
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/95 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/95 to-transparent z-10" />
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
