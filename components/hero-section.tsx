"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronRight, Store, Utensils, Hotel, Code, Wrench, LayoutGrid, Shield, Zap, Wifi, Clock } from "lucide-react";
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

// SVG Illustration Components with animations
const RetailPOSIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <pattern id="bhutan-pattern-1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10 L10 0 L20 10 L10 20 Z" fill="none" stroke="#1E3A2F" strokeWidth="0.5" opacity="0.3"/>
      </pattern>
      <linearGradient id="green-glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00FF00" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#00CC00" stopOpacity="0.4"/>
      </linearGradient>
      <linearGradient id="screen-pulse" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00FF00" stopOpacity="0.3"/>
        <stop offset="50%" stopColor="#00FF00" stopOpacity="0.1"/>
        <stop offset="100%" stopColor="#00FF00" stopOpacity="0.3"/>
      </linearGradient>
    </defs>
    
    {/* Animated background glow */}
    <rect x="20" y="160" width="160" height="20" rx="4" fill="url(#green-glow)" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite"/>
    </rect>
    <rect x="20" y="160" width="160" height="20" rx="4" fill="url(#bhutan-pattern-1)"/>
    
    {/* Counter */}
    <path d="M30 140 L30 160 L170 160 L170 140 Z" fill="#2D3748"/>
    <path d="M30 140 L170 140 L160 120 L40 120 Z" fill="#4A5568"/>
    
    {/* Cash Register - isometric style */}
    <rect x="60" y="80" width="80" height="50" rx="6" fill="#1A202C"/>
    <rect x="65" y="85" width="70" height="35" fill="url(#screen-pulse)">
      <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite"/>
    </rect>
    <text x="100" y="107" textAnchor="middle" fill="#00FF00" fontSize="12" fontWeight="bold" opacity="0.9">Nu. 1,234</text>
    
    {/* Screen border glow */}
    <rect x="65" y="85" width="70" height="35" rx="2" fill="none" stroke="#00FF00" strokeWidth="1" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
    </rect>
    
    {/* Receipt with animation */}
    <rect x="85" y="130" width="30" height="25" fill="#F7FAFC">
      <animate attributeName="y" values="130;125;130" dur="4s" repeatCount="indefinite"/>
    </rect>
    <path d="M85 130 Q100 135 115 130" stroke="#CBD5E0" strokeWidth="1" fill="none"/>
    <line x1="90" y1="135" x2="110" y2="135" stroke="#CBD5E0" strokeWidth="1"/>
    <line x1="90" y1="140" x2="105" y2="140" stroke="#CBD5E0" strokeWidth="1"/>
    <line x1="90" y1="145" x2="108" y2="145" stroke="#CBD5E0" strokeWidth="1"/>
    
    {/* Bhutanese geometric accent with pulse */}
    <circle cx="100" cy="60" r="15" fill="none" stroke="#00FF00" strokeWidth="2" opacity="0.6">
      <animate attributeName="r" values="15;18;15" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0.9;0.6" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="100" cy="60" r="8" fill="none" stroke="#00FF00" strokeWidth="1" opacity="0.4">
      <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

const HotelPMSIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <pattern id="carving-pattern" x="0" y="0" width="15" height="30" patternUnits="userSpaceOnUse">
        <path d="M7.5 0 L15 7.5 L7.5 15 L0 7.5 Z" fill="none" stroke="#1E3A2F" strokeWidth="0.5" opacity="0.2"/>
      </pattern>
      <linearGradient id="desk-glow" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#00FF00" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#00FF00" stopOpacity="0"/>
      </linearGradient>
    </defs>
    
    {/* Floor with carving pattern */}
    <rect x="20" y="170" width="160" height="15" fill="#2D3748">
      <animate attributeName="opacity" values="1;0.8;1" dur="4s" repeatCount="indefinite"/>
    </rect>
    <rect x="20" y="170" width="160" height="15" fill="url(#carving-pattern)"/>
    
    {/* Carved pillar in background */}
    <rect x="150" y="40" width="30" height="130" fill="#4A5568"/>
    <rect x="155" y="45" width="20" height="120" fill="#2D3748"/>
    {/* Carving details */}
    <rect x="157" y="55" width="16" height="4" fill="#1A202C"/>
    <rect x="157" y="65" width="16" height="4" fill="#1A202C"/>
    <rect x="157" y="110" width="16" height="4" fill="#1A202C"/>
    <rect x="157" y="120" width="16" height="4" fill="#1A202C"/>
    
    {/* Floating reception desk */}
    <path d="M40 140 L40 160 L160 160 L160 140 Z" fill="#1A202C"/>
    <path d="M40 140 L160 140 L150 100 L50 100 Z" fill="#2D3748"/>
    
    {/* Desk glow */}
    <path d="M50 100 L150 100 L160 140 L40 140 Z" fill="url(#desk-glow)" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite"/>
    </path>
    
    {/* Touchscreen PC */}
    <rect x="70" y="70" width="60" height="35" rx="3" fill="#1A202C">
      <animate attributeName="opacity" values="1;0.9;1" dur="2s" repeatCount="indefinite"/>
    </rect>
    <rect x="73" y="73" width="54" height="29" fill="#00FF00" opacity="0.15">
      <animate attributeName="opacity" values="0.15;0.25;0.15" dur="2.5s" repeatCount="indefinite"/>
    </rect>
    <rect x="73" y="73" width="54" height="29" rx="2" fill="none" stroke="#00FF00" strokeWidth="0.5">
      <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
    </rect>
    <text x="100" y="92" textAnchor="middle" fill="#00FF00" fontSize="8" fontWeight="bold">CHECK-IN</text>
    
    {/* Khadar draped */}
    <path d="M130 100 Q140 110 145 130 Q140 140 135 145 L130 145 Q125 130 130 100" fill="#00FF00" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3s" repeatCount="indefinite"/>
    </path>
    <path d="M130 100 Q140 110 145 130" stroke="#00FF00" strokeWidth="1" fill="none" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
    </path>
    
    {/* Decorative lines */}
    <line x1="50" y1="105" x2="150" y2="105" stroke="#00FF00" strokeWidth="0.5" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2.5s" repeatCount="indefinite"/>
    </line>
  </svg>
);

const LaborInstallationIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <linearGradient id="vest-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00FF00" stopOpacity="0.4"/>
        <stop offset="50%" stopColor="#00FF00" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#00FF00" stopOpacity="0.4"/>
      </linearGradient>
    </defs>
    
    {/* Wall with cable runs */}
    <rect x="20" y="20" width="160" height="140" fill="#2D3748" rx="4"/>
    {/* Traditional pattern on wall */}
    <path d="M30 30 L50 30 L50 40 L30 40 Z M35 35 L45 35 L45 38 L35 38 Z" fill="#00FF00" opacity="0.2">
      <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite"/>
    </path>
    <path d="M60 30 L80 30 L80 40 L60 40 Z M65 35 L75 35 L75 38 L65 38 Z" fill="#00FF00" opacity="0.2">
      <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" begin="0.5s"/>
    </path>
    
    {/* Network cables with pulse */}
    <path d="M40 60 L160 60" stroke="#00FF00" strokeWidth="2" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
    </path>
    <path d="M40 70 L160 70" stroke="#00FF00" strokeWidth="2" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.3s"/>
    </path>
    <path d="M40 80 L160 80" stroke="#00FF00" strokeWidth="2" opacity="0.6">
      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" begin="0.6s"/>
    </path>
    
    {/* Server rack with Bhutanese base */}
    <rect x="130" y="100" width="45" height="70" rx="3" fill="#1A202C"/>
    <rect x="133" y="103" width="39" height="15" fill="#2D3748">
      <animate attributeName="fill" values="#2D3748;#3D4758;#2D3748" dur="4s" repeatCount="indefinite"/>
    </rect>
    <rect x="133" y="120" width="39" height="15" fill="#2D3748"/>
    <rect x="133" y="137" width="39" height="15" fill="#2D3748"/>
    {/* Server lights with blink */}
    <circle cx="140" cy="110" r="2" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="145" cy="110" r="2" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" begin="0.2s"/>
    </circle>
    <circle cx="150" cy="110" r="2" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" begin="0.4s"/>
    </circle>
    <circle cx="140" cy="128" r="2" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="145" cy="128" r="2" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.5s"/>
    </circle>
    {/* Base carving */}
    <rect x="130" y="165" width="45" height="8" rx="2" fill="#00FF00" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2.5s" repeatCount="indefinite"/>
    </rect>
    
    {/* Technician on ladder */}
    <rect x="45" y="85" width="3" height="60" fill="#718096"/>
    <rect x="40" y="140" width="13" height="5" fill="#718096"/>
    {/* Body */}
    <circle cx="52" cy="75" r="10" fill="#F7FAFC"/>
    {/* Vest */}
    <rect x="42" y="85" width="20" height="25" rx="2" fill="url(#vest-gradient)"/>
    <text x="52" y="100" textAnchor="middle" fill="#00FF00" fontSize="6" fontWeight="bold">INNOVATE</text>
    {/* Arm reaching up */}
    <line x1="55" y1="88" x2="70" y2="65" stroke="#F7FAFC" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="72" cy="63" r="4" fill="#F7FAFC"/>
    
    {/* Second technician */}
    <circle cx="100" cy="145" r="10" fill="#F7FAFC"/>
    <rect x="90" y="155" width="20" height="25" rx="2" fill="url(#vest-gradient)"/>
    <text x="100" y="168" textAnchor="middle" fill="#00FF00" fontSize="5" fontWeight="bold">IB</text>
  </svg>
);

const SecurityAIIllustration = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full">
    <defs>
      <pattern id="desk-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M0 10 L5 5 L10 10 L5 15 Z" fill="none" stroke="#00FF00" strokeWidth="0.3" opacity="0.2"/>
      </pattern>
      <linearGradient id="monitor-glow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00FF00" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="#00FF00" stopOpacity="0.1"/>
      </linearGradient>
    </defs>
    
    {/* Control desk */}
    <rect x="30" y="150" width="140" height="25" rx="4" fill="#1A202C"/>
    <rect x="30" y="150" width="140" height="25" rx="4" fill="url(#desk-pattern)">
      <animate attributeName="opacity" values="1;0.7;1" dur="3s" repeatCount="indefinite"/>
    </rect>
    
    {/* Curved monitor */}
    <path d="M40 50 Q40 40 50 40 L150 40 Q160 40 160 50 L160 120 Q160 130 150 130 L50 130 Q40 130 40 120 Z" fill="#1A202C"/>
    <path d="M45 45 Q45 45 55 45 L145 45 Q155 45 155 55 L155 115 Q155 125 145 125 L55 125 Q45 125 45 115 Z" fill="#0F1419"/>
    
    {/* Monitor glow pulse */}
    <path d="M45 45 Q45 45 55 45 L145 45 Q155 45 155 55 L155 115 Q155 125 145 125 L55 125 Q45 125 45 115 Z" fill="url(#monitor-glow)" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite"/>
    </path>
    
    {/* Camera feeds */}
    <rect x="48" y="48" width="45" height="30" fill="#1A202C">
      <animate attributeName="opacity" values="1;0.9;1" dur="2s" repeatCount="indefinite"/>
    </rect>
    <rect x="98" y="48" width="45" height="30" fill="#1A202C"/>
    <rect x="48" y="82" width="45" height="30" fill="#1A202C"/>
    <rect x="98" y="82" width="45" height="30" fill="#1A202C"/>
    
    {/* AI bounding boxes - green with pulse */}
    <rect x="50" y="50" width="20" height="25" fill="none" stroke="#00FF00" strokeWidth="1.5" opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite"/>
    </rect>
    <rect x="52" y="52" width="4" height="4" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
    </rect>
    <rect x="66" y="52" width="4" height="4" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" begin="0.2s"/>
    </rect>
    <rect x="52" y="71" width="4" height="4" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" begin="0.4s"/>
    </rect>
    <rect x="66" y="71" width="4" height="4" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" begin="0.6s"/>
    </rect>
    
    <rect x="100" y="84" width="18" height="22" fill="none" stroke="#00FF00" strokeWidth="1.5" opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" begin="0.5s"/>
    </rect>
    <rect x="102" y="86" width="4" height="4" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" begin="0.3s"/>
    </rect>
    <rect x="114" y="86" width="4" height="4" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" begin="0.5s"/>
    </rect>
    
    {/* Heat map overlay with animation */}
    <circle cx="115" cy="105" r="8" fill="#00FF00" opacity="0.15">
      <animate attributeName="r" values="8;10;8" dur="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.15;0.25;0.15" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="100" cy="95" r="6" fill="#00FF00" opacity="0.1">
      <animate attributeName="r" values="6;8;6" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="125" cy="100" r="5" fill="#00FF00" opacity="0.08">
      <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" begin="0.5s"/>
    </circle>
    
    {/* Connection lines */}
    <line x1="70" y1="78" x2="70" y2="130" stroke="#00FF00" strokeWidth="0.5" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite"/>
    </line>
    <line x1="120" y1="112" x2="120" y2="130" stroke="#00FF00" strokeWidth="0.5" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2s" repeatCount="indefinite" begin="0.3s"/>
    </line>
    
    {/* Status indicators */}
    <circle cx="50" cy="118" r="3" fill="#00FF00">
      <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite"/>
    </circle>
    <circle cx="60" cy="118" r="3" fill="#00FF00" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1s" repeatCount="indefinite" begin="0.5s"/>
    </circle>
    <text x="75" y="121" fill="#00FF00" fontSize="6">AI ACTIVE</text>
    
    {/* Bhutanese pattern on desk edge */}
    <rect x="35" y="168" width="130" height="4" rx="2" fill="#00FF00" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.5s" repeatCount="indefinite"/>
    </rect>
  </svg>
);

const servicesVisual = [
  { name: "Retail POS", icon: RetailPOSIllustration, desc: "Modern POS Systems" },
  { name: "Hotel PMS", icon: HotelPMSIllustration, desc: "Hospitality Management" },
  { name: "Installation", icon: LaborInstallationIllustration, desc: "Professional Teams" },
  { name: "Security AI", icon: SecurityAIIllustration, desc: "Advanced Monitoring" },
];

const mainServices = [
  { name: "Retail POS", icon: Store, badge: null, color: "from-orange-500 to-red-500", bgColor: "bg-orange-500" },
  { name: "Restaurant POS", icon: Utensils, badge: null, color: "from-amber-500 to-yellow-500", bgColor: "bg-amber-500" },
  { name: "Hotel PMS", icon: Hotel, badge: null, color: "from-blue-500 to-indigo-500", bgColor: "bg-blue-500" },
  { name: "Web Devs", icon: Code, badge: "20% OFF", color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500" },
  { name: "Hardware", icon: Wrench, badge: null, color: "from-slate-500 to-zinc-500", bgColor: "bg-slate-600" },
  { name: "Security AI", icon: Shield, badge: "16 mins", color: "from-red-500 to-rose-600", bgColor: "bg-red-500" },
  { name: "Deep Network & Infrastructure Mapping", icon: Wifi, badge: "46 mins", wide: true, color: "from-cyan-500 to-teal-500", bgColor: "bg-cyan-500" },
  { name: "Full Home & Office Tech Maintenance", icon: Zap, wide: true, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500" },
];

const serviceToImageMap: Record<string, string> = {
  "Retail POS": "/hero/resturant.png",
  "Restaurant POS": "/hero/restaurant.png",
  "Hotel PMS": "/hero/hotelpms.png",
  "Web Devs": "/hero/software.png",
  "Hardware": "/hero/hardware.png",
  "Security AI": "/hero/cctv.png",
  "Deep Network & Infrastructure Mapping": "/hero/hardware1.png",
  "Full Home & Office Tech Maintenance": "/hero/tech_maintaince.png",
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
            Your space, professionally managed, anywhere in{" "}
              <span className="text-primary animate-text-color">
                BHUTAN
              </span>
            </motion.h1>

        <div className="bg-white dark:bg-[#050505] border border-[#ebebeb] dark:border-white/10 rounded-[16px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-none transition-all">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[16px] lg:text-[18px] font-bold text-foreground/80">What are you looking for?</h2>
            
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
                  onClick={() => router.push("/services")}
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

        <div className="relative bg-gradient-to-r from-black/90 via-slate-950/95 to-black/90 dark:from-black dark:via-[#030712] dark:to-black backdrop-blur-md py-3">
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

          <div className="max-w-[1300px] mx-auto px-5 flex items-center gap-8">
             <div className="flex items-center gap-2.5 shrink-0 border-r border-primary/30 pr-8">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50">350+ Enterprise Nodes</span>
             </div>
             
             <div className="flex-1 overflow-hidden relative">
                <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
                   {[...clients, ...clients].map((client, i) => {
                     const realIdx = i % clients.length;
                     const isLit = realIdx === highlightIdx;
                     return (
                       <span
                         key={i}
                         className={`relative text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 cursor-default ${
                           isLit
                             ? 'text-primary scale-110'
                             : 'text-white/90 hover:text-white'
                         }`}
                         style={isLit ? {
                           textShadow: '0 0 10px var(--primary), 0 0 25px var(--primary), 0 0 50px rgba(57,255,20,0.5)',
                         } : {}}
                       >
                         {isLit && (
                           <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 mb-0.5 shadow-[0_0_8px_var(--primary)] animate-pulse" />
                         )}
                         {client}
                       </span>
                     );
                   })}
                </div>
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/90 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/90 to-transparent z-10" />
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
