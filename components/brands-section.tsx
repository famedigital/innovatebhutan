"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Shield, X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

const brands = [
  {
    name: "Hikvision",
    category: "Security",
    description: "Global leader in video surveillance products and solutions. Known for cutting-edge AI-powered cameras, NVRs, and comprehensive security systems serving millions worldwide.",
    famousFor: "CCTV Cameras, NVRs, Video Analytics, AI Surveillance",
    priceRange: "Nu. 5,000 - Nu. 150,000",
    lifespan: "5-8 years with proper maintenance",
    images: [
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1563459809905-d7e6d8d8d1b0?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "Dahua",
    category: "Security",
    description: "Leading manufacturer of video surveillance equipment offering innovative solutions for government, enterprise, and SMB markets with AIoT capabilities.",
    famousFor: "IP Cameras, PTZ, Access Control, AI Solutions",
    priceRange: "Nu. 4,500 - Nu. 120,000",
    lifespan: "5-7 years",
    images: [
      "https://images.unsplash.com/photo-1557862921-37829c790f19?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1586190848861-99c8a3da799c?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "ZKTeco",
    category: "Biometric",
    description: "World's leading biometric access control and time attendance manufacturer providing integrated security solutions for enterprises worldwide.",
    famousFor: "Fingerprint & Face Recognition, Time Attendance, Turnstiles",
    priceRange: "Nu. 3,000 - Nu. 45,000",
    lifespan: "5-6 years",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "Rancelab",
    category: "Hospitality",
    description: "Comprehensive hotel management software designed for hotels, resorts, and hospitality businesses across Asia with cloud-based operations.",
    famousFor: "Property Management, Booking Engine, Restaurant POS",
    priceRange: "Nu. 15,000 - Nu. 80,000/year",
    lifespan: "Subscription-based (ongoing)",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "TYSSO",
    category: "POS",
    description: "Taiwan-based manufacturer of high-quality POS terminals and thermal printers trusted by retail and hospitality businesses globally.",
    famousFor: "POS Terminals, Thermal Printers, Receipt Printers",
    priceRange: "Nu. 8,000 - Nu. 50,000",
    lifespan: "6-8 years",
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "POSIFLEX",
    category: "POS",
    description: "Industry-leading POS hardware manufacturer offering reliable terminals, displays, and peripherals for retail and hospitality applications.",
    famousFor: "POS Terminals, Touch Screens, POS Peripherals",
    priceRange: "Nu. 10,000 - Nu. 60,000",
    lifespan: "6-8 years",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "APC",
    category: "Power",
    description: "Global leader in power protection and infrastructure solutions for home, business, and data center applications.",
    famousFor: "UPS Systems, Surge Protectors, Power Conditioning",
    priceRange: "Nu. 5,000 - Nu. 200,000",
    lifespan: "8-10 years",
    images: [
      "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1605256436498-4237ad244av2?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "Cisco",
    category: "Network",
    description: "World's leading networking solutions provider delivering enterprise-grade switches, routers, and security appliances.",
    famousFor: "Enterprise Switches, Routers, Firewalls, WiFi",
    priceRange: "Nu. 20,000 - Nu. 500,000+",
    lifespan: "7-10 years",
    images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "TP-Link",
    category: "Network",
    description: "Global provider of reliable networking products offering innovative WiFi solutions for home and business with best-in-class value.",
    famousFor: "WiFi Routers, Access Points, Switches, Smart Home",
    priceRange: "Nu. 1,500 - Nu. 25,000",
    lifespan: "4-6 years",
    images: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "Ubiquiti",
    category: "Network",
    description: "Technology company specializing in high-performance networking equipment offering enterprise-grade WiFi and routing solutions.",
    famousFor: "UniFi WiFi, Edge Routers, Security Gateways",
    priceRange: "Nu. 3,000 - Nu. 80,000",
    lifespan: "5-7 years",
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "Luminous",
    category: "Power",
    description: "India's leading power backup solutions brand offering inverters, batteries, and solar solutions for homes and businesses.",
    famousFor: "Inverters, Home UPS, Solar Inverters, Batteries",
    priceRange: "Nu. 8,000 - Nu. 75,000",
    lifespan: "5-8 years",
    images: [
      "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1619360264538-b9a19254777c?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=800&auto=format&fit=crop&q=60"
    ]
  },
  {
    name: "Suprema",
    category: "Biometric",
    description: "Global biometric and access control solutions provider offering fingerprint, face recognition, and mobile authentication technologies.",
    famousFor: "Biometric Readers, Access Control, Mobile Access",
    priceRange: "Nu. 5,000 - Nu. 40,000",
    lifespan: "5-6 years",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"
    ]
  }
];

function BrandModal({ brand, onClose, onNext, onPrev }: { 
  brand: typeof brands[0]; 
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-4xl bg-[#0f172a] rounded-3xl shadow-[0_0_50px_rgba(57,255,20,0.1)] overflow-hidden border border-white/10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#39FF14] hover:text-[#020617] text-white/70 transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left 60% - Image Slider */}
          <div className="w-full md:w-[60%] relative h-64 md:h-[480px] bg-black">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={brand.images[currentImage]}
                alt={brand.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover grayscale opacity-70"
              />
            </AnimatePresence>

            {/* Slider Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {brand.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImage 
                      ? "bg-[#39FF14] shadow-[0_0_10px_rgba(57,255,20,0.8)] w-6" 
                      : "bg-white/30 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            {/* Arrow Controls */}
            <button
              onClick={() => setCurrentImage((prev) => (prev === 0 ? brand.images.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#39FF14] text-white hover:text-[#020617] transition-all border border-white/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev === brand.images.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-[#39FF14] text-white hover:text-[#020617] transition-all border border-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Right 40% - Brand Details */}
          <div className="w-full md:w-[40%] p-6 md:p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-bl-full blur-2xl pointer-events-none" />
            
            {/* Header */}
            <div className="mb-6 relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded inline-block">
                {brand.category} Node
              </span>
              <h2 className="text-3xl font-bold text-white mt-3 tracking-tight uppercase">{brand.name}</h2>
            </div>

            {/* Description */}
            <div className="mb-5 relative z-10">
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Operational Spec</h3>
              <p className="text-sm text-white/60 leading-relaxed font-medium">{brand.description}</p>
            </div>

            {/* Famous For */}
            <div className="mb-5 relative z-10">
              <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Primary Arsenal</h3>
              <p className="text-sm text-white font-medium">{brand.famousFor}</p>
            </div>

            {/* Matrix Data */}
            <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <h3 className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] mb-1">Cap Range</h3>
                <p className="text-[11px] text-white font-mono">{brand.priceRange}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <h3 className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.2em] mb-1">Resilience</h3>
                <p className="text-[11px] text-white font-mono">{brand.lifespan}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto relative z-10">
              <a
                href="https://wa.me/97517000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#39FF14] text-[#020617] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]"
              >
                Initiate Link-Up
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function BrandsSection() {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);

  return (
    <div className="h-full">
      <div className="mb-6">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-[#39FF14] mb-2 block"
        >
          AUTHORIZED NODES
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold tracking-tighter text-white uppercase text-shadow-sm"
        >
          Partnership Matrix
        </motion.h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {brands.map((brand, index) => (
          <motion.button
            key={brand.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.03 }}
            onClick={() => setSelectedBrand(index)}
            className="group relative bg-[#0f172a]/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 text-center hover:border-[#39FF14]/40 hover:bg-[#39FF14]/5 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 text-base font-bold text-white mb-1 tracking-tight group-hover:text-[#39FF14] transition-colors">{brand.name}</div>
            <div className="relative z-10 text-[10px] font-mono uppercase tracking-widest text-[#39FF14]/50 group-hover:text-[#39FF14]/80">{brand.category}</div>
          </motion.button>
        ))}
      </div>

      {/* Brand Modal */}
      <AnimatePresence>
        {selectedBrand !== null && (
          <BrandModal
            brand={brands[selectedBrand]}
            onClose={() => setSelectedBrand(null)}
            onNext={() => setSelectedBrand((selectedBrand + 1) % brands.length)}
            onPrev={() => setSelectedBrand((selectedBrand - 1 + brands.length) % brands.length)}
          />
        )}
      </AnimatePresence>

      {/* Certification Badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-6 flex flex-wrap items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-widest">Authorized</div>
            <div className="text-[10px] font-mono text-[#39FF14]/60 uppercase mt-0.5">Matrix Command</div>
          </div>
        </div>
        <div className="w-px h-10 bg-white/10 hidden sm:block" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-xl flex items-center justify-center">
            <BadgeCheck className="w-5 h-5 text-[#39FF14]" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-widest">Resilience Guard</div>
            <div className="text-[10px] font-mono text-[#39FF14]/60 uppercase mt-0.5">Tier-1 Validation</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}