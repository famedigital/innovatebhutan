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
import { getMediaUrl } from "@/lib/cloudinary";

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
      getMediaUrl("innovate_bhutan/surveillance_ai", false, true)
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
      getMediaUrl("innovate_bhutan/biometric_id", false, true)
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
      getMediaUrl("innovate_bhutan/hospitality_tech", false, true)
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
      getMediaUrl("innovate_bhutan/pos_engineering", false, true)
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
      getMediaUrl("innovate_bhutan/network_flow", false, true)
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
      getMediaUrl("innovate_bhutan/power_resilience", false, true)
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
        className="relative w-full max-w-6xl bg-card rounded-[48px] border border-border shadow-[0_0_50px_rgba(57,255,20,0.1)] overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/5 hover:bg-primary text-white hover:text-[#020617] rounded-full flex items-center justify-center transition-all duration-300 border border-white/10"
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
                    idx === currentImage ? "w-10 bg-primary" : "w-4 bg-white/20 hover:bg-white/40"
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
              <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-primary/20">
                {brand.category} NODE
              </span>
              <span className="px-4 py-1.5 bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-white/10 flex items-center gap-2">
                <Award className="w-3.5 h-3.5" />
                Strategic Partner
              </span>
            </div>

            <h2 className="text-5xl font-bold text-foreground mb-4 tracking-tighter">{brand.name}</h2>
            <p className="text-primary text-xs font-bold uppercase tracking-[0.4em] mb-8">{brand.tagline}</p>
            <p className="text-foreground/50 text-base leading-relaxed mb-10 font-medium">
              {brand.description}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-muted/50 border border-border rounded-3xl p-6 hover:border-primary/20 transition-all group">
                <div className="text-[10px] text-foreground/20 uppercase font-bold tracking-[0.2em] mb-2">Cycle Estimate</div>
                <div className="text-2xl font-bold text-foreground font-mono tracking-tighter group-hover:text-primary transition-colors">{brand.priceRange}</div>
              </div>
              <div className="bg-muted/50 border border-border rounded-3xl p-6 hover:border-primary/20 transition-all group">
                <div className="text-[10px] text-foreground/20 uppercase font-bold tracking-[0.2em] mb-2">Resilience Guard</div>
                <div className="text-2xl font-bold text-foreground font-mono tracking-tighter group-hover:text-primary transition-colors">{brand.warranty}</div>
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
              href={`https://wa.me/97517268753?text=I AM INTERESTED IN DEPLOYING THE ${brand.name.toUpperCase()} NODE.`}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-[#020617] font-bold uppercase text-xs rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(57,255,20,0.2)]"
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
            className="px-6 py-3 bg-primary text-[#020617] text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]"
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
    <div className="pt-16 bg-background text-foreground transition-colors duration-500">
      {/* 🚀 COMPACT HERO SECTION */}
      <section className="relative py-16 overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-6">
              <Star className="w-3.5 h-3.5 text-primary fill-primary/20" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Strategic Partnership Matrix</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-6 tracking-tighter leading-none dark:neon-text">
              Global <span className="text-primary">Elite</span> Hardware
            </h1>
            
            <p className="text-base text-foreground/50 mb-10 leading-relaxed max-w-xl mx-auto font-medium">
              Authorized brokerage for the kingdom's most mission-critical technology nodes. 
              Genuinity hardlinked to every deployment node.
            </p>

            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto border-t border-border pt-8">
              {[
                { n: "12+", l: "GLOBAL NODES" },
                { n: "100%", l: "AUTHENTICATED" },
                { n: "3Y", l: "RESILIENCE" }
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-2xl font-bold text-foreground font-mono tracking-tighter mb-1 group-hover:text-primary transition-colors">{stat.n}</div>
                  <div className="text-primary/40 text-[8px] font-black uppercase tracking-[0.2em]">{stat.l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🚥 COMPACT FILTER MATRIX */}
      <section className="sticky top-16 z-40 py-3 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                    : "bg-muted text-foreground/40 hover:text-foreground border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 📦 BRANDS GRID */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-5">
          <motion.div 
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredBrands.map((brand, index) => (
              <motion.button
                key={brand.name}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSelectedBrand(index)}
                className="relative group bg-card rounded-3xl p-6 text-left border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[80px] -mr-8 -mt-8 group-hover:bg-primary/10 transition-all" />

                <div className="relative h-40 mb-6 rounded-2xl overflow-hidden border border-border">
                  <img
                    src={brand.images[0]}
                    alt={brand.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 bg-primary text-black text-[8px] font-black uppercase tracking-widest rounded-md">
                      {brand.category}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-1 tracking-tighter group-hover:text-primary transition-colors uppercase">{brand.name}</h3>
                <p className="text-foreground/30 text-[9px] font-black uppercase tracking-[0.2em] mb-4">{brand.tagline}</p>
                
                <div className="flex items-center justify-between pt-5 border-t border-border">
                  <span className="text-[9px] text-foreground/40 uppercase font-mono tracking-widest leading-none">Min Cycle: {brand.priceRange.split(' - ')[0]}</span>
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                    <ArrowRight className="w-4 h-4 text-foreground/40 group-hover:text-black" />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 🛡️ SECURITY NODES */}
      <section className="py-12 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { i: Shield, t: "Node Security", d: "Genuinity hardlinked to every deployment node." },
              { i: Award, t: "Official Sync", d: "Direct factory-to-hub authorized link." },
              { i: CheckCircle2, t: "Presence", d: "Diagnostic clusters in all 20 dzongkhags." }
            ].map((node, i) => (
              <div key={i} className="flex items-center gap-5 group">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary transition-all duration-300">
                  <node.i className="w-5 h-5 text-primary group-hover:text-black transition-all" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-1">{node.t}</h3>
                  <p className="text-[11px] text-foreground/40 leading-relaxed max-w-[200px]">{node.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📞 COMPACT CTA */}
      <section className="py-20 bg-background border-t border-border relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl lg:text-5xl font-black text-foreground mb-6 tracking-tighter uppercase leading-none dark:neon-text">Global Node Network</h2>
          <p className="text-base text-foreground/40 mb-10 font-medium">
            Link your infrastructure to the world's most resilient technology brands.
          </p>
          <a
            href="https://wa.me/97517268753"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            <Phone className="w-4 h-4" />
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
