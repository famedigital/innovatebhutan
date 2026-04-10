"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, MessageCircle, Star, CheckCircle2, Play, X } from "lucide-react";
import { CategoryFilter } from "@/components/category-filter";

const services = [
  {
    id: 1,
    name: "POS Systems Engineering",
    category: "pos",
    description: "Highly skilled technicians for retail and restaurant POS architectures, inventory sync, and hardware setup.",
    features: ["Touch Terminal Ops", "Database Mapping", "Cloud Sync", "Hardware Tuning"],
    brands: ["TYSSO", "POSIFLEX", "Custom Apps"],
    rating: 4.9,
    reviews: 124,
    popular: true,
    image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&auto=format&fit=crop&q=80",
    video: "https://www.youtube.com/embed/65K5377k9MM",
    color: "neon",
  },
  {
    id: 2,
    name: "AI Surveillance Architects",
    category: "security",
    description: "Experts in deep-learning surveillance, facial recognition clusters, and 24/7 autonomous monitoring.",
    features: ["4K AI Detection", "Neural Night Vision", "Remote Matrix", "Local Storage"],
    brands: ["Hikvision", "Dahua", "Uniview"],
    rating: 4.8,
    reviews: 89,
    popular: true,
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
    video: "https://www.youtube.com/embed/p3W6r0x6kYI",
    color: "neon",
  },
  {
    id: 3,
    name: "Biometric Identity Masters",
    category: "biometric",
    description: "Specialists in iris, fingerprint, and facial gatekeepers for secure-access facilities and enterprises.",
    features: ["Biometric Gateways", "Attendance Logs", "Identity Mapping", "System Mesh"],
    brands: ["ZKTeco", "Hikvision", "Suprema"],
    rating: 4.7,
    reviews: 67,
    popular: false,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80",
    video: "https://www.youtube.com/embed/JfV_o6G7E_s",
    color: "neon",
  },
  {
    id: 4,
    name: "Hospitality Tech Gurus",
    category: "hospitality",
    description: "Rancelab certified experts for hotel flow optimization, reservation logic, and guest experience tech.",
    features: ["OTA Management", "PMS Logistics", "Guest Link Control", "Property Audit"],
    brands: ["Rancelab"],
    rating: 4.9,
    reviews: 45,
    popular: true,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&auto=format&fit=crop&q=80",
    video: "https://www.youtube.com/embed/OaXnA-8S7mM",
    color: "neon",
  },
  {
    id: 5,
    name: "Full-stack Reality Builders",
    category: "software",
    description: "Bespoke developers creating the digital layer of your business—from mobile apps to complex web clusters.",
    features: ["Edge Apps", "API Plumbing", "UI/UX Flows", "Cloud Deployment"],
    brands: ["In-house Elites"],
    rating: 5.0,
    reviews: 32,
    popular: false,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    video: "https://www.youtube.com/embed/OK_jNwG1sEQ",
    color: "neon",
  },
  {
    id: 6,
    name: "Energy Resilience Experts",
    category: "power",
    description: "Power systems engineers ensuring zero-downtime Ops with smart UPS and inverter backup grids.",
    features: ["Pure Sine Wave", "Load Balancing", "Battery Analytics", "Auto-grid Sync"],
    brands: ["APC", "Luminous", "Microtek"],
    rating: 4.6,
    reviews: 78,
    popular: false,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    video: "https://www.youtube.com/embed/FOAXLFdXuxk",
    color: "neon",
  },
  {
    id: 7,
    name: "Network Flow Architects",
    category: "security",
    description: "Elite networking crew for high-speed fiber backbones, WiFi 6 mesh, and ironclad firewall builds.",
    features: ["Gigabit Core", "WiFi 6 Meshing", "Tunnel Setup", "Traffic Shifting"],
    brands: ["Cisco", "TP-Link", "Ubiquiti"],
    rating: 4.8,
    reviews: 56,
    popular: false,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
    video: "https://www.youtube.com/embed/2gqQ7TCzRjk",
    color: "neon",
  },
];

interface ServiceDirectoryProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchQuery: string;
}

export function ServiceDirectory({ activeCategory, setActiveCategory, searchQuery }: ServiceDirectoryProps) {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  const filteredServices = services.filter((service) => {
    const matchesCategory = activeCategory === "all" || service.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.brands.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Compact Category Filter */}
      <CategoryFilter activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Services Grid - Max 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
        {filteredServices.slice(0, 4).map((service, index) => {
          return (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="group relative bg-[#0f172a]/50 backdrop-blur-xl rounded-3xl border border-white/5 hover:border-[#39FF14]/30 transition-all duration-500 overflow-hidden"
          >
            {/* Image with Video Button */}
            <div className="relative h-40 overflow-hidden">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />
              
              {service.popular && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#39FF14] text-[#020617] text-[10px] font-bold uppercase tracking-widest rounded-full">
                  Elite
                </div>
              )}
              
              {/* Video Play Button */}
              <button
                onClick={() => setSelectedVideo(service.video)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <Play className="w-5 h-5 text-[#39FF14] fill-[#39FF14] ml-0.5" />
                </div>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-[#39FF14] text-[#39FF14]" />
                  <span className="text-sm font-bold text-white">{service.rating}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-xs text-white/40 uppercase tracking-widest font-bold">{service.reviews} Ops</span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#39FF14] transition-colors">
                {service.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-white/50 mb-6 line-clamp-2 leading-relaxed font-medium">
                {service.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-tighter border border-white/5 rounded-lg"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#39FF14]" />
                    {feature}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/97517000000?text=Hi, I'm interested in the ${encodeURIComponent(service.name)} specialist.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#39FF14] text-[#020617] text-xs font-bold uppercase rounded-xl hover:bg-white transition-all shadow-[0_0_15px_rgba(57,255,20,0.1)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)] hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  Request Talent
                </a>
              </div>
            </div>
          </motion.div>
          );
        })}
      </div>

      {/* View All Button */}
      {filteredServices.length > 0 && (
        <div className="mt-8 text-center sm:text-right">
          <a
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-[#39FF14] text-white hover:text-[#020617] text-[10px] font-bold uppercase tracking-[0.3em] rounded-full border border-white/10 hover:border-transparent transition-all"
          >
            View All Services
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <div className="w-16 h-16 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Search className="w-6 h-6 text-white/20" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Talent Found</h3>
          <p className="text-sm text-white/40 font-medium">Try adjusting your skill search parameters</p>
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-[#39FF14] text-white hover:text-[#020617] rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                src={selectedVideo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Search(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  );
}