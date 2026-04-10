"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Award, 
  CheckCircle2, 
  Star, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  Phone,
  ExternalLink
} from "lucide-react";

const brands = [
  {
    name: "Hikvision",
    category: "Security",
    tagline: "Global Surveillance Backbone",
    description: "The definitive global leader in video analytics and surveillance nodes. Deploying 4K neural optics and high-stakes perimeter AI across Bhutan's critical infrastructure.",
    famousFor: "Neural Optics, NVR clusters, AI Analytics, Thermal Mesh",
    bhutanPresence: "Dominant node provider with 60%+ kingdom-wide coverage.",
    features: ["Deep Learning Vision", "ChromaNight Tech", "8K Resolution Support", "Matrix Mobile Auth", "Edge-to-Cloud Sync", "Intrusion Logic"],
    priceRange: "Nu. 5K - 450K+",
    warranty: "3 Cycle Shield",
    lifespan: "0x008 Years",
    images: [
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1563459809905-d7e6d8d8d1b0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "ZKTeco",
    category: "Biometric",
    tagline: "Identity Mapping Standard",
    description: "Architecting the world's most secure identity gatekeepers. From iris scanning arrays to facial geometry mapping for government clusters.",
    famousFor: "Iris & Face Mapping, Access Flow, High-Security Gates",
    bhutanPresence: "Primary gatekeeper for Bhutan's corporate and gov nodes.",
    features: ["Facial Geometry", "Iris Pulse Scan", "Biometric Mesh", "Attendance Node", "Logic Controllers", "Gate Sync"],
    priceRange: "Nu. 4K - 85K",
    warranty: "2 Cycle Shield",
    lifespan: "0x006 Years",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Rancelab",
    category: "Hospitality",
    tagline: "Hospitality Ops Core",
    description: "The operational OS for luxury hotels. Managing guest cycles, financial nodes, and property-wide audit arrays with zero-latency cloud architecture.",
    famousFor: "Master PMS, Node Booking, Flow Auditing",
    bhutanPresence: "Operational core for 60+ elite Bhutanese assets.",
    features: ["Cloud-First PMS", "Neural Booking Engine", "Audit Logic", "KDS Matrix", "Housekeeping Flow", "Multi-Asset Grid"],
    priceRange: "Nu. 20K - 150K+",
    warranty: "Eternal Link",
    lifespan: "Infinite Cycle",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "TYSSO",
    category: "POS",
    tagline: "High-Load POS Forge",
    description: "Engineered in Taiwan for high-frequency retail nodes. Robust touchscreen terminals and thermal print arrays for infinite transaction cycles.",
    famousFor: "Touch Terminals, Thermal Arrays, Data Cash Flow",
    bhutanPresence: "Preferred hardware node for 150+ commercial sectors.",
    features: ["Zero-Touch UI", "Thermal Logic", "Cash Vault Link", "Laser Scanners", "Telemetry Display", "Shielded Housing"],
    priceRange: "Nu. 12K - 65K",
    warranty: "2 Cycle Shield",
    lifespan: "0x008 Years",
    images: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "Cisco",
    category: "Network",
    tagline: "The Global Backbone",
    description: "The definitive standard in networking logic. Architecting the kingdom's fiber backbones, gigabit core switches, and zero-trust security firewalls.",
    famousFor: "Core Switching, Fiber Routing, Firewall Logic",
    bhutanPresence: "The bedrock of Bhutan's banking and gov data flows.",
    features: ["Catalyst Mesh", "Meraki Cloud", "Ironclad Firewall", "Neural VPN", "SD-WAN Ops", "Quantum Security"],
    priceRange: "Nu. 25K - 1M+",
    warranty: "Lifetime Guard",
    lifespan: "0x010 Years",
    images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    name: "APC",
    category: "Power",
    tagline: "Energy Resilience Grid",
    description: "Energy stability systems for mission-critical nodes. Providing pure sine wave power protection for data centers and commercial hubs.",
    famousFor: "UPS Grids, Surge Shields, Power Filtering",
    bhutanPresence: "The standard for power resilience in the kingdom.",
    features: ["Grid-Sync UPS", "Neural Filter", "Pure Sine Output", "Battery Telemetry", "Surge Pulse Guard", "Remote Diagnostics"],
    priceRange: "Nu. 6K - 300K+",
    warranty: "3 Cycle Shield",
    lifespan: "0x010 Years",
    images: [
      "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1605256436498-4237ad244av2?w=800&auto=format&fit=crop&q=80"
    ]
  }
];

const categories = ["All Units", "Security", "Biometric", "POS", "Hospitality", "Power", "Network"];

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
      <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" onClick={onClose} />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-6xl bg-[#0f172a] rounded-[48px] border border-white/10 shadow-[0_0_50px_rgba(57,255,20,0.1)] overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/5 hover:bg-[#39FF14] text-white hover:text-[#020617] rounded-full flex items-center justify-center transition-all duration-300 border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid lg:grid-cols-2">
          {/* Visual Container */}
          <div className="relative h-[400px] lg:h-[650px] bg-[#020617]/50 border-r border-white/5">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={brand.images[currentImage]}
                alt={brand.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-cover grayscale opacity-40"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent " />

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              {brand.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === currentImage ? "w-10 bg-[#39FF14]" : "w-4 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentImage((prev) => (prev === 0 ? brand.images.length - 1 : prev - 1))}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setCurrentImage((prev) => (prev === brand.images.length - 1 ? 0 : prev + 1))}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Details Container */}
          <div className="p-10 lg:p-16 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="px-4 py-1.5 bg-[#39FF14]/5 text-[#39FF14] text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-[#39FF14]/20">
                {brand.category} NODE
              </span>
              <span className="px-4 py-1.5 bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-white/10 flex items-center gap-2">
                <Award className="w-3.5 h-3.5" />
                Strategic Partner
              </span>
            </div>

            <h2 className="text-5xl font-bold text-white mb-4 tracking-tighter">{brand.name}</h2>
            <p className="text-[#39FF14] text-xs font-bold uppercase tracking-[0.4em] mb-8">{brand.tagline}</p>
            <p className="text-white/50 text-base leading-relaxed mb-10 font-medium">
              {brand.description}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-[#39FF14]/20 transition-all group">
                <div className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em] mb-2">Cycle Estimate</div>
                <div className="text-2xl font-bold text-white font-mono tracking-tighter group-hover:text-[#39FF14] transition-colors">{brand.priceRange}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:border-[#39FF14]/20 transition-all group">
                <div className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em] mb-2">Resilience Guard</div>
                <div className="text-2xl font-bold text-white font-mono tracking-tighter group-hover:text-[#39FF14] transition-colors">{brand.warranty}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-12">
              {brand.features.map((feature) => (
                <span key={feature} className="px-3 py-1.5 bg-white/[0.03] text-white/40 text-[9px] font-bold uppercase tracking-widest rounded-xl border border-white/5">
                  {feature}
                </span>
              ))}
            </div>

            <a
              href={`https://wa.me/97517000000?text=I AM INTERESTED IN DEPLOYING THE ${brand.name.toUpperCase()} NODE.`}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#39FF14] text-[#020617] font-bold uppercase text-xs rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(57,255,20,0.2)]"
            >
              Broker Node
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Modal Navigation Footer */}
        <div className="absolute bottom-10 right-10 flex gap-4 hidden lg:flex">
          <button
            onClick={onPrev}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all border border-white/5"
          >
            ← Previous Node
          </button>
          <button
            onClick={onNext}
            className="px-6 py-3 bg-[#39FF14] text-[#020617] text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]"
          >
            Next Node →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function BrandsContent() {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("All Units");

  const filteredBrands = activeCategory === "All Units" 
    ? brands 
    : brands.filter(b => b.category === activeCategory);

  return (
    <div className="pt-20 bg-[#020617]">
      {/* Hero Section */}
      <section className="relative py-28 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#39FF14]/5 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-full mb-10 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
              <Star className="w-4 h-4 text-[#39FF14] fill-[#39FF14]/20" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#39FF14]">Official Partnership Matrix</span>
            </div>
            
            <h1 className="text-5xl sm:text-8xl font-bold text-white mb-8 tracking-tighter leading-[0.85]">
              The Global <br/><span className="text-[#39FF14]">Elite </span> Hardware Grid
            </h1>
            
            <p className="text-xl text-white/50 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              Authorized brokerage for the kingdom's most mission-critical technology nodes. 
              Genuinity hardlinked to every deployment across all 20 dzongkhags.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 max-w-2xl mx-auto">
              {[
                { n: "12+", l: "GLOBAL NODES" },
                { n: "100%", l: "AUTHENTICATED" },
                { n: "3Y", l: "MAX RESILIENCE" }
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-4xl font-bold text-white font-mono tracking-tighter mb-1 group-hover:text-[#39FF14] transition-colors">{stat.n}</div>
                  <div className="text-[#39FF14]/40 text-[9px] font-bold uppercase tracking-[0.3em]">{stat.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Matrix */}
      <section className="sticky top-20 z-40 py-6 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[#39FF14] text-[#020617] shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Matrix */}
      <section className="py-24 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredBrands.map((brand, index) => (
              <motion.button
                key={brand.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                onClick={() => setSelectedBrand(index)}
                className="relative group bg-white/[0.03] backdrop-blur-3xl rounded-[40px] p-8 text-left border border-white/5 hover:border-[#39FF14]/30 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-bl-[120px] -mr-10 -mt-10 group-hover:bg-[#39FF14]/10 transition-all" />

                <div className="relative h-48 mb-8 rounded-[32px] overflow-hidden border border-white/5">
                  <img
                    src={brand.images[0]}
                    alt={brand.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent " />
                  <div className="absolute bottom-5 left-5">
                    <span className="px-3 py-1 bg-[#39FF14] text-[#020617] text-[9px] font-bold uppercase tracking-widest rounded-lg">
                      {brand.category}
                    </span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 tracking-tighter group-hover:text-[#39FF14] transition-colors">{brand.name}</h3>
                <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.3em] mb-6">{brand.tagline}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className="text-[10px] text-white/20 uppercase font-mono tracking-widest">MIN CYCL: {brand.priceRange.split(' - ')[0]}</span>
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-[#39FF14] transition-all duration-500">
                    <ArrowRight className="w-5 h-5 text-white group-hover:text-[#020617]" />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security Nodes */}
      <section className="py-24 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { i: Shield, t: "Node Security", d: "Genuinity hardlinked to every deployment node." },
              { i: Award, t: "Official Sync", d: "Direct factory-to-hub authorized link." },
              { i: CheckCircle2, t: "Local Presence", d: "Diagnostic clusters in all 20 dzongkhags." }
            ].map((node, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-[#39FF14]/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#39FF14]/20 group-hover:bg-[#39FF14] transition-all duration-500">
                  <node.i className="w-10 h-10 text-[#39FF14] group-hover:text-[#020617] transition-all" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.3em] mb-4">{node.t}</h3>
                <p className="text-xs text-white/40 font-medium uppercase tracking-tighter leading-relaxed">{node.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Global */}
      <section className="py-32 bg-gradient-to-b from-[#020617] to-[#0f172a] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#39FF14]/50 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl font-bold text-white mb-8 tracking-tighter">Enter the Global Node Network</h2>
          <p className="text-white/50 mb-12 text-lg font-medium">
            Link your infrastructure to the world's most resilient technology brands.
          </p>
          <a
            href="https://wa.me/97517000000"
            className="inline-flex items-center justify-center gap-4 px-12 py-5 bg-[#39FF14] text-[#020617] font-bold uppercase text-xs rounded-2xl hover:bg-white hover:scale-110 transition-all shadow-[0_0_30px_rgba(57,255,20,0.3)]"
          >
            <Phone className="w-5 h-5" />
            Initiate Contact
          </a>
        </div>
      </section>

      {/* Modal Integration */}
      <AnimatePresence>
        {selectedBrand !== null && (
          <BrandModal
            brand={filteredBrands[selectedBrand]}
            onClose={() => setSelectedBrand(null)}
            onNext={() => setSelectedBrand((selectedBrand + 1) % filteredBrands.length)}
            onPrev={() => setSelectedBrand((selectedBrand - 1 + filteredBrands.length) % filteredBrands.length)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}