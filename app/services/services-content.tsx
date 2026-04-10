"use client";

import { motion } from "framer-motion";
import { 
  Monitor, 
  Shield, 
  Fingerprint, 
  Hotel, 
  Code2, 
  Zap, 
  Wifi, 
  ArrowRight,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock
} from "lucide-react";

const services = [
  {
    id: "pos",
    name: "POS Systems Engineering",
    shortName: "POS Mastery",
    tagline: "High-Performance Transaction Architecture",
    description: "Expert deployment of retail and restaurant POS pipelines. Trusted by Bhutan's top commercial units.",
    fullDescription: "Our engineering squad designs robust transaction architectures for any scale. Within Bhutan's complex trade landscape, we deploy optimized pipelines—touchscreen nodes, cloud-synced inventory, and multi-branch intelligence hubs. From Thimphu to Phuentsholing, we broker the sharpest tech minds for your retail infrastructure.",
    features: ["Node Deployment", "Logic Mapping", "Multi-Branch Sync", "Edge Backup", "Telemetry Analytics", "API Plumbing"],
    whyChoose: ["Bhutan's Core Tech Broker", "Nationwide Ops Network", "Neural interface options", "Offline synchronization mode"],
    brands: ["TYSSO", "POSIFLEX", "Nexus Custom"],
    priceRange: "Nu. 25K - 250K",
    icon: Monitor,
    color: "neon",
    stats: { clients: "200+", years: "15+" }
  },
  {
    id: "security",
    name: "AI Surveillance Architects",
    shortName: "Surveillance AI",
    tagline: "Autonomous Perimeter Defense",
    description: "Deep-learning vision clusters and night-vision arrays for ironclad protection across the kingdom.",
    fullDescription: "Protect your infrastructure with our autonomous vision solutions. We architect clusters featuring 4K neural nodes, color night-vision arrays, and AI-driven perimeter triggers. Our specialized architects consult on high-stakes security for hotels, homes, and industrial bastions across all 20 dzongkhags.",
    features: ["Neural 4K Optics", "Thermal Detection", "Object Logic", "Matrix App Control", "Cloud Mirroring", "Downtime Alerts"],
    whyChoose: ["Hikvision authorized elite", "24/7 Autonomous scan", "Solar power mesh", "Instant human response"],
    brands: ["Hikvision", "Dahua", "Uniview", "Imou"],
    priceRange: "Nu. 8K - 350K",
    icon: Shield,
    color: "neon",
    stats: { clients: "500+", nodes: "10K+" }
  },
  {
    id: "biometric",
    name: "Biometric Identity Masters",
    shortName: "Biometrics",
    tagline: "Secure-Link Identity Mapping",
    description: "Iris, face, and fingerprint gatekeepers for high-security facilities and modern office towers.",
    fullDescription: "Weaponize your security with iris and facial biometric mapping. Our specialists broker state-of-the-art gatekeepers for Bhutan's government bodies, corporate towers, and educational facilities. We map attendance, monitor visitor logic, and integrate your entire local mesh into a single control point.",
    features: ["Iris Scanning", "Facial Geometry", "RFID Mesh", "Attendance Core", "Gate Logic", "Direct API Link"],
    whyChoose: ["ZKTeco strategic partner", "Edge-only local storage", "Zero-latency auth", "Real-time audit log"],
    brands: ["ZKTeco", "Hikvision", "Suprema"],
    priceRange: "Nu. 5K - 75K",
    icon: Fingerprint,
    color: "neon",
    stats: { clients: "150+", dataLines: "50K+" }
  },
  {
    id: "hospitality",
    name: "Hospitality Tech Gurus",
    shortName: "Hotel Tech",
    tagline: "Next-Gen Guest UX Flow",
    description: "Cloud-hosted PMS and guest experience layers for the kingdom's luxury hotel sector.",
    fullDescription: "Master your hospitality operations with our cloud-hosted property management systems. We architect full guest UX flows—from digital booking engine nodes to kitchen display logic and property-wide audit arrays. Powering the elite hospitality brands across Thimphu, Paro, and Bumthang.",
    features: ["Edge Booking Engine", "Room Node Logic", "KDS Matrix", "Housekeeping Cloud", "Fin-Ops Audit", "Multi-Hotel Grid"],
    whyChoose: ["Bhutan's #1 PMS Broker", "Direct OTA Tunneling", "Cloud-first architecture", "24/7 Remote diagnostics"],
    brands: ["Rancelab", "Nexus Guest"],
    priceRange: "Nu. 20K - 120K/yr",
    icon: Hotel,
    color: "neon",
    stats: { hotels: "60+", rating: "5.0" }
  },
  {
    id: "software",
    name: "Full-stack Reality Builders",
    shortName: "Software Dev",
    tagline: "Forging the Digital Layer",
    description: "Bespoke code architectures for mobile, web, and enterprise-grade operational systems.",
    fullDescription: "We engineer the digital layer of your business. Our full-stack crew builds bespoke code architectures—high-performance mobile apps, enterprise ERP grids, and custom cloud-hosting environments. From Bhutan-specific inventory logic to global-scale e-commerce, we code your future.",
    features: ["iOS/Android Stacks", "Cloud Cluster builds", "API Gateways", "Database Sharding", "CI/CD Pipelines", "Operational Support"],
    whyChoose: ["Local elite dev crew", "Agile sprint logic", "Native Dzongkha support", "Strategic scale-up partners"],
    brands: ["In-house Elites"],
    priceRange: "Nu. 100K - 2M+",
    icon: Code2,
    color: "neon",
    projects: 150
  },
  {
    id: "power",
    name: "Energy Resilience Experts",
    shortName: "Power Grids",
    tagline: "Zero-Downtime Power Mesh",
    description: "Pure sine wave UPS and inverter clusters for mission-critical infrastructure across Bhutan.",
    fullDescription: "Ensure zero-downtime operations for your mission-critical infrastructure with our energy resilience arrays. We deploy smart UPS clusters and inverter meshes featuring load-balancing logic and battery analytics. Powering data centers and commercial hubs across all 20 dzongkhags.",
    features: ["Sine Wave Output", "Auto-Grid Sync", "Load Balancing", "Battery Telemetry", "Surge Filtering", "Gen-Set Mesh"],
    whyChoose: ["APC official distributor", "On-site battery cell sync", "20-dzongkhag tech crew", "AMC monitoring options"],
    brands: ["APC", "Luminous", "Microtek", "Exide"],
    priceRange: "Nu. 12K - 180K",
    icon: Zap,
    color: "neon",
    clients: "400+"
  },
  {
    id: "network",
    name: "Network Flow Architects",
    shortName: "Networking",
    tagline: "High-Speed Backbone Logic",
    description: "Enterprise fiber backbones and WiFi 6 mesh arrays for high-density traffic environments.",
    fullDescription: "Architect robust network flows with our enterprise fiber backbone solutions. We design high-speed infrastructure—structured cabling grids, gigabit core switching, and WiFi 6 mesh clusters. From Thimphu's tech hubs to Phuentsholing's industrial nodes, we keep the data flowing.",
    features: ["Fiber Cat6A Backbone", "Core Routing Logic", "WiFi 6 Mesh Grids", "Security Firewalls", "Zero-Trust VPN", "Matrix Monitoring"],
    whyChoose: ["CCIE level architects", "Enterprise hardware only", "Infinite scale capacity", "Local hub diagnostics"],
    brands: ["Cisco", "TP-Link", "Ubiquiti", "Netgear"],
    priceRange: "Nu. 15K - 600K+",
    icon: Wifi,
    color: "neon",
    projects: "300+"
  }
];

export function ServicesContent() {
  return (
    <div className="pt-20 bg-[#020617]">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#39FF14]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-full mb-8 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
              <Star className="w-4 h-4 text-[#39FF14]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#39FF14]">The Service Matrix</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-8 tracking-tighter leading-[0.9]">
              Elite <span className="text-[#39FF14]">Operational</span> Capabilities
            </h1>
            
            <p className="text-xl text-white/50 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
              We broker Bhutan's most advanced technical talents. From transactional engineering to neural surveillance, 
              we build the infrastructure of tomorrow.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {[
                "500+ Hubs Secured",
                "20/20 Dzongkhag Ops",
                "15+ Yr Industry Cycle"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 text-[#39FF14]" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="https://wa.me/97517000000"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#39FF14] text-[#020617] font-bold uppercase text-xs rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]"
              >
                <Phone className="w-4 h-4" />
                Initiate Consultation
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold uppercase text-xs rounded-2xl hover:bg-white/10 transition-all"
              >
                Enter Matrix
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {[
              { number: "500+", label: "DOMAINS", sub: "OPERATIONAL" },
              { number: "15+", label: "YEARS", sub: "DEVOPS" },
              { number: "20", label: "NODES", sub: "DZONGKHAGS" },
              { number: "99%", label: "UPTIME", sub: "NETWORK" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/5 text-center group hover:border-[#39FF14]/30 transition-all duration-500">
                <div className="text-4xl font-bold font-mono tracking-tighter text-[#39FF14] mb-2">{stat.number}</div>
                <div className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{stat.label}</div>
                <div className="text-white/20 text-[9px] uppercase tracking-tighter mt-1">{stat.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
 
      {/* Services Grid */}
      <section id="services" className="py-24 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight uppercase tracking-[0.2em]">Operational Capabilities</h2>
            <div className="h-1 w-20 bg-[#39FF14] mx-auto rounded-full" />
          </motion.div>

          <div className="space-y-12">
            {services.map((service, index) => {
              const Icon = service.icon;
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative group bg-white/[0.03] backdrop-blur-2xl rounded-[40px] overflow-hidden border border-white/5 hover:border-[#39FF14]/20 transition-all duration-700"
                >
                  <div className="grid lg:grid-cols-5 gap-0">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 p-8 lg:p-14">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-2xl flex items-center justify-center group-hover:bg-[#39FF14] transition-all duration-500">
                          <Icon className="w-8 h-8 text-[#39FF14] group-hover:text-[#020617] transition-all" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#39FF14] uppercase tracking-[0.3em]">
                            {service.shortName}
                          </span>
                          <h3 className="text-3xl font-bold text-white tracking-tighter">
                            {service.name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-[#39FF14]/80 font-bold uppercase tracking-widest text-xs mb-6">
                        {service.tagline}
                      </p>
                      
                      <p className="text-white/50 text-base mb-10 leading-relaxed font-medium">
                        {service.fullDescription}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                        {service.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-xl"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#39FF14] flex-shrink-0" />
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-tighter">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-white/5">
                        <div>
                          <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1 font-mono">ESTIMATED CYCLE</div>
                          <div className="text-2xl font-bold text-white font-mono tracking-tighter">{service.priceRange}</div>
                        </div>
                        <a
                          href={`https://wa.me/97517000000?text=I'M INTERESTED IN THE ${service.name.toUpperCase()} SPECIALIST.`}
                          className="inline-flex items-center gap-2 px-8 py-4 bg-[#39FF14] text-[#020617] text-xs font-bold uppercase rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(57,255,20,0.1)]"
                        >
                          Broker Talent
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Meta Data Area */}
                    <div className="lg:col-span-2 p-8 lg:p-14 bg-white/[0.02] border-l border-white/5">
                      <div className="h-full flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-8">System Analytics</h4>
                          <ul className="space-y-6 mb-12">
                            {service.whyChoose.map((item, i) => (
                              <li key={i} className="flex items-start gap-4">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#39FF14]/40" />
                                <span className="text-white/60 text-sm font-medium leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="flex flex-wrap gap-2">
                            {service.brands.map((brand) => (
                              <span
                                key={brand}
                                className="px-3 py-1 bg-[#39FF14]/5 border border-[#39FF14]/20 text-[#39FF14] text-[9px] font-bold uppercase tracking-widest rounded-full"
                              >
                                {brand}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                          {Object.entries(service.stats).map(([k, v]) => (
                            <div key={k}>
                              <div className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em] mb-1">{k}</div>
                              <div className="text-xl font-bold text-white font-mono">{v as string}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Matrix */}
      <section className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-[#39FF14]/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#39FF14]/10 rounded-full blur-[160px] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-5xl sm:text-7xl font-bold text-white mb-8 tracking-tighter leading-[0.9]">
            Ready to Forge <br/>Your <span className="text-[#39FF14]">Empire?</span>
          </h2>
          <p className="text-white/50 mb-12 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Join Bhutan's technical elite. We broker the skills that power high-stakes operations. 
            Connect with an architect now.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="https://wa.me/97517000000"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#22c55e] text-[#020617] font-bold uppercase text-xs rounded-2xl hover:bg-[#39FF14] transition-all shadow-[0_0_30px_rgba(57,255,20,0.2)]"
            >
              <Phone className="w-5 h-5" />
              WhatsApp Specialist
            </a>
            <a
              href="mailto:info@innovatebhutan.com"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/5 border border-white/20 text-white font-bold uppercase text-xs rounded-2xl hover:bg-white/10 transition-all"
            >
              <Mail className="w-5 h-5" />
              Email Hub
            </a>
          </div>
        </div>
      </section>

      {/* Grid of Contact Nodes */}
      <section className="py-24 bg-[#020617] border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-10 border border-white/5 text-center group hover:border-[#39FF14]/20 transition-all duration-500">
              <div className="w-16 h-16 bg-[#39FF14]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#39FF14]/20 group-hover:bg-[#39FF14] transition-all">
                <MapPin className="w-8 h-8 text-[#39FF14] group-hover:text-[#020617]" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-2">Central Node</h3>
              <p className="text-white font-bold">NORZIN LAM, THIMPHU, BHUTAN</p>
            </div>
            
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-10 border border-white/5 text-center group hover:border-[#39FF14]/20 transition-all duration-500">
              <div className="w-16 h-16 bg-[#39FF14]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#39FF14]/20 group-hover:bg-[#39FF14] transition-all">
                <Phone className="w-8 h-8 text-[#39FF14] group-hover:text-[#020617]" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-2">Secure Line</h3>
              <p className="text-white font-bold font-mono">+975 17 000 000</p>
            </div>
            
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-[32px] p-10 border border-white/5 text-center group hover:border-[#39FF14]/20 transition-all duration-500">
              <div className="w-16 h-16 bg-[#39FF14]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#39FF14]/20 group-hover:bg-[#39FF14] transition-all">
                <Clock className="w-8 h-8 text-[#39FF14] group-hover:text-[#020617]" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/30 mb-2">Operational Hours</h3>
              <p className="text-white font-bold font-mono">MON - SAT: 0900 - 1800</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}