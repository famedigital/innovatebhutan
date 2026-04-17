"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronRight, Store, Utensils, Hotel, Code, Wrench, LayoutGrid, Shield, Zap, Wifi, Clock, Smartphone, FileText, Users, Database } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getMediaUrl } from "@/lib/cloudinary";

const locations = ["Thimphu", "Paro", "Punakha", "Phuentsholing", "Others"];

const heroSlides = [
  { image: "/hero/restaurantpos.png", name: "Restaurant POS" },
  { image: "/hero/hotelpms.png", name: "Hotel PMS" },
  { image: "/hero/cctv.png", name: "CCTV Security" },
  { image: "/hero/hardware.png", name: "Hardware Solutions" },
];

// SVG Illustration Components with advanced realistic effects
const RetailPOSIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      {/* Advanced realistic gradients */}
      <linearGradient id="metal-body" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4A5568"/>
        <stop offset="30%" stopColor="#718096"/>
        <stop offset="70%" stopColor="#4A5568"/>
        <stop offset="100%" stopColor="#2D3748"/>
      </linearGradient>

      <linearGradient id="screen-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#10B981"/>
        <stop offset="50%" stopColor="#059669"/>
        <stop offset="100%" stopColor="#047857"/>
      </linearGradient>

      <linearGradient id="digital-display" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.9"/>
        <stop offset="50%" stopColor="#34D399" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#10B981" stopOpacity="0.9"/>
      </linearGradient>

      {/* Glow effects */}
      <filter id="screen-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="button-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feFlood floodColor="#10B981" floodOpacity="0.5"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <radialGradient id="counter-reflection" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#718096" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="#2D3748" stopOpacity="0"/>
      </radialGradient>

      {/* Pattern for realistic texture */}
      <pattern id="brushed-metal" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="4" y2="4" stroke="#718096" strokeWidth="0.3" opacity="0.3"/>
      </pattern>
    </defs>

    {/* Background shadow/grounding */}
    <ellipse cx="100" cy="175" rx="70" ry="8" fill="#1A202C" opacity="0.4"/>
    <ellipse cx="100" cy="173" rx="65" ry="6" fill="#0F1419" opacity="0.3"/>

    {/* Counter base with realistic metal finish */}
    <path d="M30 140 L30 160 L170 160 L170 140 L160 120 L40 120 Z" fill="url(#metal-body)"/>
    <path d="M30 140 L30 160 L170 160 L170 140 L160 120 L40 120 Z" fill="url(#counter-reflection)"/>
    <path d="M30 140 L30 160 L170 160 L170 140 L160 120 L40 120 Z" fill="url(#brushed-metal)" opacity="0.5"/>

    {/* Counter edge highlight */}
    <path d="M40 120 L160 120 L170 140 L30 140 Z" stroke="#718096" strokeWidth="1" opacity="0.6"/>

    {/* POS Terminal - main body */}
    <rect x="50" y="70" width="100" height="60" rx="6" fill="#1A202C"/>
    <rect x="52" y="72" width="96" height="56" rx="4" fill="#0F1419"/>

    {/* Screen with digital display */}
    <rect x="58" y="80" width="84" height="35" rx="2" fill="url(#digital-display)" filter="url(#screen-glow)">
      <animate attributeName="opacity" values="0.95;1;0.95" dur="2s" repeatCount="indefinite"/>
    </rect>

    {/* Screen content */}
    <text x="100" y="95" textAnchor="middle" fill="#064E3B" fontSize="8" fontWeight="bold" opacity="0.8">TOTAL</text>
    <text x="100" y="110" textAnchor="middle" fill="#065F46" fontSize="14" fontWeight="900" filter="url(#button-glow)">Nu.1,250</text>

    {/* Screen reflection */}
    <path d="M58 80 L100 80 L90 115 L58 115 Z" fill="white" opacity="0.08"/>

    {/* Button panel */}
    <rect x="58" y="118" width="84" height="8" rx="1" fill="#2D3748"/>

    {/* Individual buttons with realistic highlights */}
    {[...Array(12)].map((_, i) => (
      <g key={i}>
        <rect
          x={60 + (i % 6) * 13.5}
          y={119 + Math.floor(i / 6) * 3}
          width="10"
          height="2"
          rx="0.5"
          fill="#4A5568"
        />
        <rect
          x={60 + (i % 6) * 13.5}
          y={119}
          width="10"
          height="1"
          rx="0.5"
          fill="#718096"
          opacity="0.5"
        />
        <circle
          cx={65 + (i % 6) * 13.5}
          cy={120 + Math.floor(i / 6) * 3}
          r="0.8"
          fill="#10B981"
          opacity="0.8"
        >
          <animate
            attributeName="opacity"
            values="0.8;1;0.8"
            dur={`${1 + Math.random()}s`}
            repeatCount="indefinite"
          />
        </circle>
      </g>
    ))}

    {/* Card reader slot */}
    <rect x="70" y="60" width="50" height="4" rx="1" fill="#0F1419"/>
    <rect x="72" y="61" width="46" height="2" rx="0.5" fill="#2D3748"/>

    {/* Receipt printer with paper */}
    <rect x="120" y="50" width="25" height="35" rx="2" fill="#1A202C"/>
    <path d="M122 52 L122 82 L143 82 L143 52 Z" fill="#2D3748"/>

    {/* Paper coming out with animation */}
    <g>
      <path
        d="M122 75 Q132.5 70 143 75 L143 85 Q132.5 80 122 85 Z"
        fill="#F7FAFC"
      >
        <animate
          attributeName="d"
          values="M122 75 Q132.5 70 143 75 L143 85 Q132.5 80 122 85 Z;M122 70 Q132.5 65 143 70 L143 80 Q132.5 75 122 80 Z;M122 75 Q132.5 70 143 75 L143 85 Q132.5 80 122 85 Z"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
      {/* Receipt text lines */}
      <line x1="126" y1="77" x2="139" y2="77" stroke="#CBD5E0" strokeWidth="0.5" opacity="0.6"/>
      <line x1="126" y1="79" x2="137" y2="79" stroke="#CBD5E0" strokeWidth="0.5" opacity="0.6"/>
      <line x1="126" y1="81" x2="138" y2="81" stroke="#CBD5E0" strokeWidth="0.5" opacity="0.6"/>
    </g>

    {/* Status indicators with realistic glow */}
    <circle cx="60" cy="78" r="3" fill="#10B981" filter="url(#button-glow)">
      <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="140" cy="78" r="2" fill="#10B981" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.5;0.8" dur="2s" repeatCount="indefinite"/>
    </circle>

    {/* Branding */}
    <text x="100" y="145" textAnchor="middle" fill="#718096" fontSize="5" fontWeight="600" opacity="0.6">INNOVATE POS</text>
  </svg>
);

const HotelPMSIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      {/* Realistic material gradients */}
      <linearGradient id="wood-floor" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B4513"/>
        <stop offset="20%" stopColor="#A0522D"/>
        <stop offset="40%" stopColor="#8B4513"/>
        <stop offset="60%" stopColor="#A0522D"/>
        <stop offset="80%" stopColor="#8B4513"/>
        <stop offset="100%" stopColor="#A0522D"/>
      </linearGradient>

      <linearGradient id="desk-surface" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4A5568"/>
        <stop offset="30%" stopColor="#718096"/>
        <stop offset="60%" stopColor="#4A5568"/>
        <stop offset="100%" stopColor="#2D3748"/>
      </linearGradient>

      <linearGradient id="screen-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981"/>
        <stop offset="50%" stopColor="#34D399"/>
        <stop offset="100%" stopColor="#059669"/>
      </linearGradient>

      <radialGradient id="screen-reflection" cx="30%" cy="20%" r="50%">
        <stop offset="0%" stopColor="white" stopOpacity="0.15"/>
        <stop offset="100%" stopColor="white" stopOpacity="0"/>
      </radialGradient>

      <filter id="glow-emerald" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feFlood floodColor="#10B981" floodOpacity="0.6"/>
        <feComposite in2="coloredBlur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="pillar-shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
    </defs>

    {/* Floor shadow */}
    <ellipse cx="100" cy="180" rx="85" ry="10" fill="#1A202C" opacity="0.4"/>

    {/* Hardwood floor */}
    <rect x="15" y="165" width="170" height="20" fill="url(#wood-floor)" opacity="0.8"/>
    {/* Floor grain texture */}
    {[...Array(8)].map((_, i) => (
      <line
        key={i}
        x1={15 + i * 22}
        y1="165"
        x2={15 + i * 22}
        y2="185"
        stroke="#5D3A1A"
        strokeWidth="1"
        opacity="0.3"
      />
    ))}

    {/* Traditional Bhutanese pillar */}
    <rect x="150" y="40" width="30" height="130" fill="#2D3748"/>
    <rect x="152" y="42" width="26" height="126" fill="#4A5568"/>
    {/* Carved patterns */}
    {[...Array(8)].map((_, i) => (
      <g key={i}>
        <rect
          x="154"
          y={48 + i * 15}
          width="22"
          height="3"
          rx="1"
          fill="#1A202C"
          opacity="0.8"
        />
        <rect
          x="154"
          y={48 + i * 15}
          width="22"
          height="1"
          fill="#718096"
          opacity="0.3"
        />
      </g>
    ))}
    {/* Capital at top */}
    <rect x="148" y="35" width="34" height="8" rx="2" fill="#10B981" opacity="0.6" filter="url(#glow-emerald)"/>

    {/* Reception desk */}
    <path d="M35 130 L35 160 L165 160 L165 130 L155 100 L45 100 Z" fill="url(#desk-surface)"/>
    <path d="M35 130 L35 160 L165 160 L165 130 L155 100 L45 100 Z" fill="url(#screen-reflection)" opacity="0.5"/>

    {/* Desk edge highlight */}
    <path d="M45 100 L155 100 L165 130 L35 130 Z" stroke="#718096" strokeWidth="1" opacity="0.6"/>

    {/* Desk brand plate */}
    <rect x="85" y="155" width="30" height="3" rx="0.5" fill="#10B981" opacity="0.8" filter="url(#glow-emerald)"/>

    {/* Monitor stand */}
    <rect x="90" y="115" width="20" height="15" fill="#1A202C"/>
    <ellipse cx="100" cy="130" rx="15" ry="3" fill="#0F1419"/>

    {/* Monitor - sleek design */}
    <rect x="55" y="60" width="90" height="55" rx="4" fill="#0F1419"/>
    <rect x="57" y="62" width="86" height="51" rx="2" fill="url(#screen-emerald)" opacity="0.15"/>

    {/* Screen display */}
    <rect x="60" y="67" width="80" height="40" rx="2" fill="url(#screen-emerald)" filter="url(#glow-emerald)">
      <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite"/>
    </rect>
    <rect x="60" y="67" width="80" height="40" rx="2" fill="url(#screen-reflection)"/>

    {/* Screen content */}
    <text x="100" y="80" textAnchor="middle" fill="#064E3B" fontSize="7" fontWeight="bold">HOTEL PMS</text>
    <text x="100" y="92" textAnchor="middle" fill="#065F46" fontSize="6">GUEST CHECK-IN</text>
    <rect x="65" y="97" width="30" height="6" rx="1" fill="#047857" opacity="0.6"/>
    <rect x="105" y="97" width="30" height="6" rx="1" fill="#047857" opacity="0.6"/>

    {/* Monitor bezel highlight */}
    <rect x="55" y="60" width="90" height="2" rx="1" fill="#718096" opacity="0.4"/>

    {/* Keycard reader */}
    <rect x="40" y="110" width="15" height="25" rx="2" fill="#1A202C"/>
    <rect x="42" y="112" width="11" height="18" rx="1" fill="#0F1419"/>
    <rect x="43" y="125" width="9" height="3" rx="0.5" fill="#10B981" opacity="0.8" filter="url(#glow-emerald)">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
    </rect>

    {/* Khadar (scarf) draping */}
    <path
      d="M60 100 Q70 105 75 120 Q70 125 65 130 L60 130 Q50 120 60 100"
      fill="#10B981"
      opacity="0.3"
    >
      <animate attributeName="opacity" values="0.3;0.4;0.3" dur="3s" repeatCount="indefinite"/>
    </path>

    {/* Bell with realistic shine */}
    <g transform="translate(130, 95)">
      <ellipse cx="10" cy="15" rx="12" ry="4" fill="#1A202C" opacity="0.3"/>
      <path d="M5 12 Q10 2 15 12 L13 15 L7 15 Z" fill="#F59E0B"/>
      <ellipse cx="10" cy="12" rx="5" ry="2" fill="#FBBF24"/>
      <circle cx="10" cy="6" r="2" fill="#FCD34D">
        <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
      </circle>
    </g>

    {/* Decorative plant */}
    <g transform="translate(160, 120)">
      <rect x="0" y="20" width="8" height="15" rx="2" fill="#718096"/>
      <ellipse cx="4" cy="10" rx="12" ry="8" fill="#10B981" opacity="0.3"/>
      {[...Array(5)].map((_, i) => (
        <ellipse
          key={i}
          cx={4 + Math.cos(i * 72 * Math.PI / 180) * 6}
          cy={10 + Math.sin(i * 72 * Math.PI / 180) * 4}
          rx="6"
          ry="3"
          fill="#10B981"
          opacity="0.7"
          transform={`rotate(${i * 36} 4 10)`}
        />
      ))}
    </g>
  </svg>
);

const LaborInstallationIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      {/* Realistic cable and equipment gradients */}
      <linearGradient id="cable-glow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
        <stop offset="50%" stopColor="#34D399" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#10B981" stopOpacity="0.2"/>
      </linearGradient>

      <linearGradient id="server-rack" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1A202C"/>
        <stop offset="50%" stopColor="#2D3748"/>
        <stop offset="100%" stopColor="#1A202C"/>
      </linearGradient>

      <linearGradient id="safety-vest" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B"/>
        <stop offset="30%" stopColor="#FBBF24"/>
        <stop offset="70%" stopColor="#F59E0B"/>
        <stop offset="100%" stopColor="#D97706"/>
      </linearGradient>

      <filter id="cable-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feFlood floodColor="#10B981" floodOpacity="0.5"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <radialGradient id="wall-light" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.1"/>
        <stop offset="100%" stopColor="#1A202C" stopOpacity="0"/>
      </radialGradient>
    </defs>

    {/* Background wall */}
    <rect x="15" y="15" width="170" height="140" fill="#1A202C" rx="3"/>
    <rect x="15" y="15" width="170" height="140" fill="url(#wall-light)"/>

    {/* Wall panels */}
    {[...Array(4)].map((_, i) => (
      <g key={i}>
        <rect x={20 + i * 42} y="20" width="38" height="60" fill="#2D3748" opacity="0.3" rx="2"/>
        <rect x={22 + i * 42} y="22" width="34" height="56" fill="#1A202C" opacity="0.5" rx="1"/>
      </g>
    ))}

    {/* Network cables with realistic glow */}
    {[...Array(6)].map((_, i) => (
      <g key={i}>
        <path
          d="M25 55 L175 55"
          stroke="url(#cable-glow)"
          strokeWidth="2"
          filter="url(#cable-glow-filter)"
          opacity={0.4 + i * 0.1}
        >
          <animate
            attributeName="opacity"
            values={`${0.4 + i * 0.1};${0.7 + i * 0.1};${0.4 + i * 0.1}`}
            dur={`${1.5 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </path>
        {/* Data packet animation */}
        <circle cx={25} cy="55" r="2" fill="#10B981">
          <animate
            attributeName="cx"
            values="25;175;25"
            dur={`${2 + i * 0.5}s`}
            repeatCount="indefinite"
            begin={`${i * 0.3}s`}
          />
        </circle>
      </g>
    ))}

    {/* Server rack */}
    <rect x="135" y="90" width="50" height="65" rx="3" fill="url(#server-rack)"/>
    <rect x="137" y="92" width="46" height="61" fill="#0F1419"/>

    {/* Server units */}
    {[...Array(4)].map((_, i) => (
      <g key={i}>
        <rect
          x="139"
          y={94 + i * 14.5}
          width="42"
          height="12"
          rx="1"
          fill="#2D3748"
        />
        <rect
          x="139"
          y={94 + i * 14.5}
          width="42"
          height="2"
          fill="#4A5568"
          opacity="0.5"
        />
        {/* LED indicators */}
        {[...Array(5)].map((_, j) => (
          <circle
            key={j}
            cx={142 + j * 8}
            cy={98 + i * 14.5}
            r="1.5"
            fill="#10B981"
            filter="url(#cable-glow-filter)"
          >
            <animate
              attributeName="opacity"
              values="1;0.3;1"
              dur={`${0.5 + j * 0.2 + i * 0.3}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    ))}

    {/* Rack branding */}
    <text x="160" y="148" textAnchor="middle" fill="#4A5568" fontSize="5" fontWeight="600">NETWORK</text>

    {/* Ladder with realistic details */}
    <g transform="translate(40, 80)">
      {/* Side rails */}
      <rect x="0" y="0" width="3" height="70" fill="#718096"/>
      <rect x="20" y="0" width="3" height="70" fill="#718096"/>
      {/* Rails highlight */}
      <rect x="0" y="0" width="1" height="70" fill="#9CA3AF" opacity="0.3"/>
      <rect x="22" y="0" width="1" height="70" fill="#9CA3AF" opacity="0.3"/>
      {/* Rungs */}
      {[...Array(7)].map((_, i) => (
        <rect key={i} x="3" y={5 + i * 10} width="17" height="2" rx="0.5" fill="#6B7280"/>
      ))}
    </g>

    {/* Ladder shadow */}
    <rect x="38" y="148" width="28" height="4" rx="1" fill="#1A202C" opacity="0.3"/>

    {/* Technician on ladder */}
    <g transform="translate(52, 55)">
      {/* Head */}
      <circle cx="3" cy="0" r="8" fill="#FDBF6F"/>
      <ellipse cx="3" cy="-2" rx="7" ry="5" fill="#FDBF6F"/>
      {/* Hair */}
      <path d="M-4 -4 Q3 -8 10 -4 Q10 0 8 2" fill="#1A202C"/>

      {/* Body - realistic shirt */}
      <rect x="-4" y="8" width="14" height="18" rx="2" fill="#4B5563"/>
      <rect x="-4" y="8" width="14" height="4" fill="#374151"/>

      {/* Safety vest with high-vis color */}
      <rect x="-5" y="9" width="16" height="16" rx="2" fill="url(#safety-vest)" opacity="0.9"/>
      {/* Vest reflective strips */}
      <rect x="-5" y="12" width="16" height="2" fill="#FEF3C7" opacity="0.9"/>
      <rect x="-5" y="19" width="16" height="2" fill="#FEF3C7" opacity="0.9"/>
      {/* Logo */}
      <text x="3" y="18" textAnchor="middle" fill="#1A202C" fontSize="4" fontWeight="bold">IB</text>

      {/* Arms */}
      <line x1="-4" y1="12" x2="-12" y2="8" stroke="#FDBF6F" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="-13" cy="7" r="3" fill="#FDBF6F"/>
      <line x1="10" y1="12" x2="18" y2="5" stroke="#FDBF6F" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="19" cy="4" r="3" fill="#FDBF6F"/>

      {/* Tool belt */}
      <rect x="-5" y="24" width="16" height="3" rx="1" fill="#1A202C"/>
      <rect x="-2" y="25" width="4" height="3" fill="#10B981" opacity="0.8"/>
      <rect x="5" y="25" width="4" height="3" fill="#10B981" opacity="0.8"/>
    </g>

    {/* Ground technician */}
    <g transform="translate(100, 140)">
      <circle cx="0" cy="0" r="7" fill="#FDBF6F"/>
      <ellipse cx="0" cy="-2" rx="6" ry="4" fill="#FDBF6F"/>
      <path d="M-5 -3 Q0 -6 5 -3 Q5 0 3 2" fill="#1A202C"/>

      <rect x="-6" y="7" width="12" height="14" rx="2" fill="#4B5563"/>
      <rect x="-7" y="8" width="14" height="12" rx="2" fill="url(#safety-vest)" opacity="0.9"/>
      <rect x="-7" y="11" width="14" height="2" fill="#FEF3C7" opacity="0.9"/>

      <line x1="-6" y1="10" x2="-14" y2="15" stroke="#FDBF6F" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="6" y1="10" x2="14" y2="15" stroke="#FDBF6F" strokeWidth="2.5" strokeLinecap="round"/>

      <text x="0" y="17" textAnchor="middle" fill="#1A202C" fontSize="3" fontWeight="bold">IB</text>
    </g>

    {/* Tool on the floor */}
    <g transform="translate(80, 155)">
      <rect x="0" y="0" width="20" height="5" rx="1" fill="#F59E0B"/>
      <rect x="5" y="1" width="3" height="3" fill="#1A202C"/>
      <rect x="12" y="1" width="3" height="3" fill="#1A202C"/>
    </g>

    {/* Floor */}
    <rect x="15" y="155" width="170" height="20" fill="#2D3748"/>
    {[...Array(10)].map((_, i) => (
      <line
        key={i}
        x1={15 + i * 17}
        y1="155"
        x2={15 + i * 17}
        y2="175"
        stroke="#1A202C"
        strokeWidth="1"
        opacity="0.3"
      />
    ))}
  </svg>
);

const SecurityAIIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      {/* Advanced display gradients */}
      <linearGradient id="monitor-frame" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1A202C"/>
        <stop offset="50%" stopColor="#2D3748"/>
        <stop offset="100%" stopColor="#1A202C"/>
      </linearGradient>

      <linearGradient id="screen-grid" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.05"/>
        <stop offset="100%" stopColor="#059669" stopOpacity="0.1"/>
      </linearGradient>

      <linearGradient id="ai-highlight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0"/>
        <stop offset="50%" stopColor="#34D399" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
      </linearGradient>

      <filter id="ai-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feFlood floodColor="#10B981" floodOpacity="0.8"/>
        <feComposite in2="coloredBlur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>

      <filter id="monitor-reflection" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2"/>
        <feOffset dx="2" dy="2"/>
      </filter>
    </defs>

    {/* Desk surface */}
    <rect x="25" y="145" width="150" height="15" rx="3" fill="url(#monitor-frame)"/>
    <path d="M25 148 L175 148 L172 152 L28 152 Z" fill="#718096" opacity="0.2"/>

    {/* Monitor - modern curved design */}
    <path
      d="M35 45 Q35 35 45 35 L155 35 Q165 35 165 45 L165 115 Q165 125 155 125 L45 125 Q35 125 35 115 Z"
      fill="url(#monitor-frame)"
    />
    <path
      d="M38 42 Q38 42 48 42 L152 42 Q162 42 162 48 L162 112 Q162 122 152 122 L48 122 Q38 122 38 112 Z"
      fill="#0F1419"
    />

    {/* Screen - divided into 4 camera feeds */}
    <g>
      {/* Top left feed */}
      <rect x="42" y="47" width="55" height="35" fill="url(#screen-grid)"/>
      <rect x="42" y="47" width="55" height="35" fill="#0A1628" opacity="0.7"/>
      {/* Simulated camera content */}
      <rect x="48" y="52" width="20" height="25" fill="#1A202C" opacity="0.5"/>
      <ellipse cx="58" cy="70" rx="8" ry="4" fill="#10B981" opacity="0.3"/>

      {/* AI detection box - animated */}
      <rect
        x="50"
        y="54"
        width="16"
        height="21"
        fill="none"
        stroke="#10B981"
        strokeWidth="1.5"
        filter="url(#ai-glow)"
      >
        <animate
          attributeName="stroke-opacity"
          values="0.6;1;0.6"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Corner detection markers */}
      {[...Array(4)].map((_, i) => {
        const positions = [
          [50, 54], [64, 54], [50, 73], [64, 73]
        ];
        const [x, y] = positions[i];
        return (
          <circle key={i} cx={x} cy={y} r="1.5" fill="#10B981" filter="url(#ai-glow)">
            <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="1s"
              repeatCount="indefinite"
              begin={`${i * 0.2}s`}
            />
          </circle>
        );
      })}

      {/* Top right feed */}
      <rect x="103" y="47" width="55" height="35" fill="url(#screen-grid)"/>
      <rect x="103" y="47" width="55" height="35" fill="#0A1628" opacity="0.7"/>
      <rect x="108" y="52" width="45" height="28" fill="#1A202C" opacity="0.5"/>

      {/* Bottom left feed */}
      <rect x="42" y="86" width="55" height="33" fill="url(#screen-grid)"/>
      <rect x="42" y="86" width="55" height="33" fill="#0A1628" opacity="0.7"/>
      <rect x="48" y="90" width="22" height="25" fill="#1A202C" opacity="0.5"/>

      {/* Multiple detection boxes */}
      {[...Array(2)].map((_, i) => (
        <rect
          key={i}
          x={50 + i * 12}
          y={92}
          width="10"
          height="18"
          fill="none"
          stroke="#10B981"
          strokeWidth="1"
          filter="url(#ai-glow)"
          opacity="0.7"
        >
          <animate
            attributeName="opacity"
            values="0.7;1;0.7"
            dur="1.5s"
            repeatCount="indefinite"
            begin={`${i * 0.5}s`}
          />
        </rect>
      ))}

      {/* Bottom right feed */}
      <rect x="103" y="86" width="55" height="33" fill="url(#screen-grid)"/>
      <rect x="103" y="86" width="55" height="33" fill="#0A1628" opacity="0.7"/>

      {/* Heat map effect */}
      <circle cx="130" cy="103" r="12" fill="url(#ai-highlight)">
        <animate
          attributeName="r"
          values="10;14;10"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="125" cy="98" r="8" fill="#10B981" opacity="0.1"/>
      <circle cx="138" cy="108" r="6" fill="#10B981" opacity="0.15"/>
    </g>

    {/* Monitor stand */}
    <rect x="90" y="125" width="20" height="15" fill="#1A202C"/>
    <ellipse cx="100" cy="140" rx="20" ry="3" fill="#2D3748"/>

    {/* Screen reflection */}
    <path
      d="M40 45 Q45 42 60 42 L100 42 L100 120 L40 120 Q35 120 35 115 Z"
      fill="white"
      opacity="0.03"
    />

    {/* Control panel on desk */}
    <rect x="35" y="150" width="30" height="8" rx="1" fill="#1A202C"/>
    {[...Array(5)].map((_, i) => (
      <circle
        key={i}
        cx={38 + i * 6}
        cy="154"
        r="2"
        fill="#10B981"
        filter="url(#ai-glow)"
      >
        <animate
          attributeName="opacity"
          values="1;0.4;1"
          dur={`${0.8 + i * 0.2}s`}
          repeatCount="indefinite"
        />
      </circle>
    ))}

    {/* Status text */}
    <text x="150" y="156" fill="#10B981" fontSize="5" fontWeight="bold" filter="url(#ai-glow)">
      AI ACTIVE
      <animate
        attributeName="opacity"
        values="1;0.7;1"
        dur="2s"
        repeatCount="indefinite"
      />
    </text>

    {/* Camera icon in corner */}
    <g transform="translate(155, 50)">
      <rect x="0" y="0" width="12" height="8" rx="1" fill="#1A202C" opacity="0.8"/>
      <circle cx="6" cy="4" r="2" fill="#10B981" filter="url(#ai-glow)">
        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
      </circle>
      <rect x="4" y="8" width="4" height="2" fill="#1A202C"/>
    </g>

    {/* Alert indicator */}
    <g transform="translate(40, 130)">
      <circle cx="0" cy="0" r="6" fill="#DC2626" opacity="0.2">
        <animate attributeName="r" values="6;8;6" dur="1s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="1s" repeatCount="indefinite"/>
      </circle>
      <circle cx="0" cy="0" r="3" fill="#DC2626"/>
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
  { name: "Retail POS", icon: Store, badge: null, color: "from-orange-500 to-red-500", bgColor: "bg-orange-500", category: "POS Systems" },
  { name: "Restaurant POS", icon: Utensils, badge: null, color: "from-amber-500 to-yellow-500", bgColor: "bg-amber-500", category: "POS Systems" },
  { name: "Hotel PMS", icon: Hotel, badge: null, color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-500", category: "POS Systems" },
  { name: "Web Development", icon: Code, badge: null, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500", category: "Web/SaaS" },
  { name: "SaaS Development", icon: Database, badge: null, color: "from-violet-500 to-purple-600", bgColor: "bg-violet-500", category: "Web/SaaS" },
  { name: "ERP Development", icon: LayoutGrid, badge: null, color: "from-indigo-500 to-blue-600", bgColor: "bg-indigo-500", category: "Web/SaaS" },
  { name: "Hardware Solutions", icon: Wrench, badge: null, color: "from-slate-500 to-zinc-500", bgColor: "bg-slate-600", category: "Maintenance" },
  { name: "Security Systems", icon: Shield, badge: null, color: "from-red-500 to-rose-600", bgColor: "bg-red-500", category: "Security" },
  { name: "Network Infrastructure", icon: Wifi, badge: null, color: "from-cyan-500 to-teal-500", bgColor: "bg-cyan-500", category: "Networking" },
  { name: "Technical Maintenance", icon: Zap, badge: null, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500", category: "Maintenance" },
  { name: "Payroll & HR Whitelabel", icon: Users, badge: null, color: "from-rose-500 to-pink-600", bgColor: "bg-rose-500", category: "Web/SaaS" },
  { name: "Mobile App Dev", icon: Smartphone, badge: null, color: "from-teal-500 to-cyan-600", bgColor: "bg-teal-500", category: "Web/SaaS" },
  { name: "Brochure & Catalogue Design", icon: FileText, badge: null, color: "from-yellow-500 to-amber-600", bgColor: "bg-yellow-500", category: "Web/SaaS" },
];

const serviceToImageMap: Record<string, string> = {
  "Retail POS": "/hero/resturant.png",
  "Restaurant POS": "/hero/restaurant.png",
  "Hotel PMS": "/hero/hotelpms.png",
  "Web Development": "/hero/software.png",
  "SaaS Development": "/hero/software.png",
  "ERP Development": "/hero/software.png",
  "Hardware Solutions": "/hero/hardware.png",
  "Security Systems": "/hero/cctv.png",
  "Network Infrastructure": "/hero/hardware1.png",
  "Technical Maintenance": "/hero/tech_maintaince.png",
  "Payroll & HR Whitelabel": "/hero/software.png",
  "Mobile App Dev": "/hero/software.png",
  "Brochure & Catalogue Design": "/hero/software.png",
};

export function HeroSection() {
  const [location, setLocation] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
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
    <div className="relative flex flex-col lg:flex-row max-w-[1300px] mx-auto pt-6 lg:pt-10 pb-20 lg:pb-24 px-5 items-center gap-10 lg:gap-[50px] transition-colors rounded-[32px] overflow-visible">
      
      {/* 🏙️ LEFT SIDE: SERVICES */}
      <div className="flex-1 w-full">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[32px] lg:text-[44px] font-bold text-foreground leading-[1.1] mb-8 transition-colors"
          >
            Enterprise Technology Solutions Across{" "}
              <span className="text-primary animate-text-color">
                BHUTAN
              </span>
            </motion.h1>

        <div className="bg-white dark:bg-[#050505] border border-[#ebebeb] dark:border-white/10 rounded-[16px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-none transition-all">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[16px] lg:text-[18px] font-bold text-foreground/80">Select Your Industry Solution</h2>
            
            <div className="relative">
              <div 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full border border-slate-100 dark:border-white/10 cursor-pointer hover:border-[#10B981] dark:hover:border-primary dark:hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all"
              >
                <MapPin className="w-4 h-4 text-[#10B981] dark:text-primary" />
                <span className="text-xs font-bold text-foreground/60">
                   {location || "Select Location"}
                </span>
                <ChevronRight className={`w-3 h-3 text-slate-300 transition-transform ${showDropdown ? "rotate-90" : ""}`} />
              </div>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#111] border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                  >
                    {locations.map((loc) => (
                      <div
                        key={loc}
                        onClick={() => { setLocation(loc); setShowDropdown(false); }}
                        className="px-6 py-3 hover:bg-primary/10 cursor-pointer text-xs font-bold text-foreground/80 transition-colors"
                      >
                        {loc}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-[15px]">
            {mainServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => {
                    router.push(`/services?category=${encodeURIComponent((service as any).category)}`);
                  }}
                  onMouseEnter={() => setHoveredService(service.name)}
                  onMouseLeave={() => setHoveredService(null)}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className={`
                    relative rounded-[12px] p-[15px_10px]
                    flex flex-col items-center text-center cursor-pointer group transition-all overflow-hidden
                    ${(service as any).wide ? "col-span-2 flex-row gap-4 text-left px-5" : "col-span-1"}
                  `}
                  style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* White/light overlay for text readability */}
                  <div className={`absolute inset-0 bg-white/90 dark:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className={`relative z-10 ${(service as any).wide ? "flex-shrink-0" : ""}`}>
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300
                      ${(service as any).wide ? "" : ""}
                    `}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </div>

                    <span className="text-[13px] font-bold text-foreground/70 group-hover:text-foreground transition-all duration-300 block">
                      {service.name}
                    </span>
                  </div>

                  {service.badge && (
                    <div className="absolute -top-2 right-2 bg-primary/10 text-primary text-[11px] font-black px-2 py-0.5 rounded-sm border border-primary/20 whitespace-nowrap z-20">
                      {service.badge}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🖼️ RIGHT SIDE: SERVICES ILLUSTRATION GRID */}
      <div className="flex-1 w-full">
        {hoveredService && serviceToImageMap[hoveredService] ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-square rounded-3xl overflow-hidden"
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
              <p className="text-white/60 text-sm">Innovate Bhutan</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
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
                  whileHover={{ scale: 1.1 }}
                  className="relative aspect-square rounded-3xl overflow-hidden cursor-pointer group"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  }}
                >
                  {/* SVG Illustration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
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
