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
        className="relative w-full max-w-4xl bg-white dark:bg-[#0f172a] rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#10B981] hover:text-white text-white transition-all border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left 60% - Image Slider */}
          <div className="w-full md:w-[60%] relative h-72 md:h-[520px] bg-black">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={brand.images[currentImage]}
                alt={brand.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover opacity-90"
              />
            </AnimatePresence>

            {/* Slider Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {brand.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`h-1.5 transition-all rounded-full ${
                    idx === currentImage 
                      ? "bg-[#10B981] w-8 shadow-[0_0_15px_#10B981]" 
                      : "bg-white/30 hover:bg-white/60 w-4"
                  }`}
                />
              ))}
            </div>

            {/* Arrow Controls */}
            <button
              onClick={() => setCurrentImage((prev) => (prev === 0 ? brand.images.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#10B981] text-white transition-all border border-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev === brand.images.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#10B981] text-white transition-all border border-white/10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Right 40% - Brand Details */}
          <div className="w-full md:w-[40%] p-8 md:p-10 flex flex-col relative overflow-hidden bg-white dark:bg-[#0f172a]">
            {/* Header */}
            <div className="mb-8 relative z-10">
              <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full inline-block">
                {brand.category} Excellence
              </span>
              <h2 className="text-4xl font-black text-[#0F172A] dark:text-white mt-4 tracking-tighter uppercase leading-none">{brand.name}</h2>
            </div>

            {/* Description */}
            <div className="mb-6 relative z-10">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] mb-3">Service Narrative</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{brand.description}</p>
            </div>

            {/* Matrix Data */}
            <div className="grid grid-cols-1 gap-4 mb-10 relative z-10">
              <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <h3 className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] mb-1">Primary Specialty</h3>
                <p className="text-xs text-[#0F172A] dark:text-white font-bold">{brand.famousFor}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                  <h3 className="text-[8px] font-black text-slate-400 uppercase mb-1">Scale</h3>
                  <p className="text-[10px] text-[#0F172A] dark:text-white font-mono font-bold tracking-tight">{brand.priceRange}</p>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
                  <h3 className="text-[8px] font-black text-slate-400 uppercase mb-1">Index</h3>
                  <p className="text-[10px] text-[#0F172A] dark:text-white font-mono font-bold tracking-tight">{brand.lifespan}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto relative z-10">
              <a
                href="https://wa.me/97517268753"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-[#10B981] text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#059669] hover:scale-[1.02] transition-all shadow-xl shadow-emerald-100 dark:shadow-none"
              >
                Sync with Expert
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

  const trustedClients = [
    "Chimi Jamyang Pvt Ltd", "Baleno", "T.T Extra", "YOYO Bhutan",
    "Malaya Jewelry", "Capital P.M.S", "Hayate Ramen", "Namsey Medical",
    "Khuenphen Pharmacy", "Yangki Enterprise Paro", "Idesire", "Smilers Bistero",
    "E-World Digital", "Shoe Space", "Dokar Mart", "SPCG", "Explore Pizza",
    "Lilly Traders", "Urban Dumra", "Kuensel Corporation", "Zeeling Tshongkhang",
    "DSB Book Store", "Paro Canteen", "Paro Momo Corner", "Zeppo Sales",
    "Shopper's Store", "Daily Chew Cafe", "Lhoden Automobile Workshop", "Shoponline.Bt",
    "Indra & Kausila Pvt Ltd", "Sakten Tours & Treks", "Namgay Venture Pvt Ltd",
    "Druk Main Liquor Shop", "Burger Point", "Druk Pizza Thimphu"
  ];

  return (
    <div className="h-full">
      {/* Enterprise Verification Marquee */}
      <div className="mb-12 overflow-hidden border-y border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] py-4 -mx-4 sm:-mx-0 sm:rounded-[32px] transition-colors">
        <div className="flex items-center gap-4 px-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-white/30 mb-3">
          <Shield className="w-4 h-4 text-[#10B981]" />
          Validated By 350+ Enterprises
        </div>
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-12 py-2">
            {[...trustedClients, ...trustedClients].map((client, i) => (
              <span key={i} className="text-xl font-black tracking-tighter text-slate-300 dark:text-white/20 hover:text-[#10B981] dark:hover:text-primary dark:hover:neon-text transition-all cursor-default uppercase">
                {client}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] dark:text-primary mb-2 block"
        >
          AUTHORIZED SUPPLY CHAIN
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-black tracking-tighter text-[#0F172A] dark:text-white uppercase dark:neon-text"
        >
          Hardware Alliances
        </motion.h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {brands.map((brand, index) => (
          <motion.button
            key={brand.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.03 }}
            onClick={() => setSelectedBrand(index)}
            className="group relative bg-white dark:bg-[#0A0A0A] backdrop-blur-md border border-slate-100 dark:border-white/10 rounded-2xl p-5 text-center hover:border-[#10B981] dark:hover:border-primary dark:hover:shadow-[0_0_20px_rgba(57,255,20,0.1)] transition-all duration-300 cursor-pointer overflow-hidden shadow-sm"
          >
            <div className="relative z-10 text-base font-black text-[#0F172A] dark:text-white mb-1 tracking-tight group-hover:text-[#10B981] dark:group-hover:text-primary transition-colors">{brand.name}</div>
            <div className="relative z-10 text-[9px] font-bold uppercase tracking-widest text-[#10B981]/50 dark:text-primary/50 group-hover:text-[#10B981] dark:group-hover:text-primary">{brand.category}</div>
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
        className="mt-8 flex flex-wrap items-center gap-6 p-6 bg-[#10B981]/5 rounded-[32px] border border-[#10B981]/10 backdrop-blur-sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <div className="text-sm font-black text-[#0F172A] dark:text-white uppercase tracking-tight">Authorized</div>
            <div className="text-[10px] font-bold text-[#10B981]/60 uppercase tracking-widest mt-0.5">Supply Matrix</div>
          </div>
        </div>
        <div className="w-px h-10 bg-[#10B981]/10 hidden sm:block" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center shadow-sm">
            <BadgeCheck className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <div className="text-sm font-black text-[#0F172A] dark:text-white uppercase tracking-tight">Tier-1 Partner</div>
            <div className="text-[10px] font-bold text-[#10B981]/60 uppercase tracking-widest mt-0.5">Nationwide Support</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
