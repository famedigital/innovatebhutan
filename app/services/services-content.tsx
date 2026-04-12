"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, MapPin, Monitor, Shield, Fingerprint, Hotel, 
  Code2, Zap, Wifi, CheckCircle2, MessageSquare, 
  ChevronRight, Star, ArrowRight, LayoutGrid, Filter, X, Plus,
  Clock, Cpu, Settings, Box, BarChart3, ShieldCheck,
  Globe, ZapIcon, HardDrive, Layers, Workflow, Eye,
  ArrowLeft, ExternalLink, Play, ShoppingCart, Tag, Info
} from "lucide-react";
import { getMediaUrl } from "@/lib/cloudinary";
import { createClient } from "@/utils/supabase/client";

const getCategoryIcon = (cat: string) => {
  switch (cat) {
    case "POS Systems": return Monitor;
    case "Security": return Shield;
    case "Web/SaaS": return Code2;
    case "Maintenance": return Zap;
    case "Networking": return Wifi;
    default: return LayoutGrid;
  }
};


const categories = [
  { name: "POS Systems", icon: LayoutGrid },
  { name: "Networking", icon: Wifi },
  { name: "Security", icon: Shield },
  { name: "Maintenance", icon: Zap },
  { name: "Web/SaaS", icon: Code2 },
];

export function ServiceBrowser() {
  const [activeTab, setActiveTab] = useState("POS Systems");
  const [cart, setCart] = useState<Record<string, { item: any; qty: number }>>({});
  const [serviceData, setServiceData] = useState<any[]>([]);
  const router = useRouter();
  const checkoutRef = useRef<HTMLDivElement>(null);

  // 📡 Live Data Fetch from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from('services').select('*');
      if (data && !error) {
        const liveData = data.map(s => ({
          id: s.public_id,
          name: s.name,
          shortName: s.name.split(' ').slice(0, 2).join(' '),
          category: s.category,
          icon: getCategoryIcon(s.category),
          tagline: s.tagline || "",
          description: s.description || "",
          specs: ["Certified Node", "High-Performance"],
          rating: "4.9+",
          reviews: "500+",
          price: s.price ? `${s.currency} ${s.price}` : "Consultation",
          duration: "Varies",
          image: s.image_url ? getMediaUrl(s.image_url, false, true) : null
        }));
        setServiceData(liveData);
      }
    };
    fetchServices();
  }, []);

  // 🛰️ SERVICE MEDIA ARCHITECT
  const categoryHero = getMediaUrl('innovate_bhutan/services_main_hero');

  // 🖱️ Scroll to specific category section
  const scrollToCategory = (categoryName: string) => {
    setActiveTab(categoryName);
    const element = document.getElementById(`section-${categoryName.toLowerCase()}`);
    if (element) {
      const topOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // 👁️ Sync sidebar with scroll position
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-15% 0px -75% 0px",
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const category = entry.target.getAttribute("data-category");
          if (category) setActiveTab(category);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    categories.forEach((cat) => {
      const element = document.getElementById(`section-${cat.name.toLowerCase()}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const addToCart = (service: any) => {
    setCart(prev => {
      const key = service.id || service.name;
      const existing = prev[key];
      return { ...prev, [key]: { item: service, qty: (existing?.qty || 0) + 1 } };
    });
  };

  const removeFromCart = (key: string) => {
    setCart(prev => {
      const existing = prev[key];
      if (!existing || existing.qty <= 1) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { ...existing, qty: existing.qty - 1 } };
    });
  };

  const cartEntries = Object.entries(cart);
  const totalItems = cartEntries.reduce((s, [, v]) => s + v.qty, 0);

  const handleCheckout = () => {
    if (cartEntries.length === 0) return;
    const lines = cartEntries.map(([, { item, qty }]) =>
      `• ${item.name}${qty > 1 ? ` x${qty}` : ''} — ${item.price}`
    ).join('%0A');
    const msg = `*INNOVATE BHUTAN — DEPLOYMENT REQUEST*%0A%0AHello%2C I would like to deploy:%0A%0A${lines}%0A%0ATotal nodes: ${totalItems}%0A%0APlease initiate the calibration protocol.`;
    window.open(`https://wa.me/97517268753?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 pt-16 pb-20">
      
      {/* 🚀 THREE-COLUMN HOLY GRAIL LAYOUT */}
      <div className="max-w-[1300px] mx-auto grid grid-cols-[260px_1fr_300px] gap-6 px-5 items-start">
        
        {/* 1. SIDEBAR LEFT (STICKY NAVIGATION) */}
        <aside className="sticky top-28 h-fit">
           <div className="border border-border rounded-[8px] p-4 bg-card shadow-sm transition-colors duration-500">
              <p className="text-[14px] font-bold text-foreground/80 mb-6 uppercase tracking-wider">Select a service</p>
              
              <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                 {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = activeTab === cat.name;
                    return (
                      <div 
                        key={cat.name} 
                        onClick={() => scrollToCategory(cat.name)}
                        className={`flex flex-col items-center text-center cursor-pointer group relative`}
                      >
                         {cat.name === "Networking" && (
                           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm whitespace-nowrap z-10 scale-90 shadow-[0_0_10px_var(--primary)]">
                              PROMO
                           </div>
                         )}
                         <div className={`w-14 h-14 rounded-xl mb-2 flex items-center justify-center transition-all border-2 overflow-hidden
                            ${isActive 
                              ? "border-primary shadow-[0_0_15px_rgba(57,255,20,0.2)] bg-primary/10" 
                              : "border-transparent bg-muted"}
                         `}>
                            <Icon className={`w-6 h-6 ${isActive ? "text-primary neon-text" : "text-foreground/40 group-hover:text-foreground"}`} />
                         </div>
                         <span className={`text-[10px] font-bold uppercase tracking-tighter leading-none transition-colors
                            ${isActive ? "text-primary" : "text-foreground/40 group-hover:text-foreground"}
                         `}>
                            {cat.name}
                          </span>
                      </div>
                    );
                 })}
              </div>
           </div>

           <div className="mt-6 border border-border rounded-[8px] p-6 bg-primary/5 dark:bg-primary/10 transition-colors">
              <div className="flex items-center gap-3 text-primary">
                 <Tag className="w-4 h-4" />
                 <span className="text-xs font-black uppercase tracking-widest">Global Deals</span>
              </div>
              <p className="text-[10px] font-bold text-foreground/40 mt-2 leading-relaxed">Bundle & Save: Up to 15% on Multi-Node Engineering</p>
           </div>
        </aside>

        {/* 2. MAIN CONTENT (CENTER SCROLL) */}
        <main className="min-w-0">
           
           <div className="overflow-hidden rounded-[24px] border border-border shadow-2xl bg-card">
              {/* Hero Carousel Concept */}
              <section className="relative w-full aspect-[21/9] overflow-hidden bg-slate-900 group">
                 <img src="/services/innovatedisplay.jpeg" className="w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-[5s]" alt="Hero" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                 <div className="absolute bottom-10 left-10">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Enterprise Calibration</h2>
                    <p className="text-primary text-xs font-bold uppercase tracking-[0.2em] neon-text">Starting at Nu. 25,000</p>
                 </div>
              </section>

              {/* 🛡️ TRUST PROTOCOL BANNER (UNIFIED) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-2.5 px-8 flex items-center justify-between bg-muted/20 border-t border-border/50 transition-all hover:bg-muted/40 group cursor-default"
              >
                <div className="flex items-center gap-4">
                   <Shield className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform dark:neon-text" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 transition-colors group-hover:text-foreground">
                     Validated By <span className="text-primary">350+</span> Enterprises
                   </span>
                </div>
                <div className="flex items-center gap-6">
                   <div className="w-[1px] h-3 bg-border/50" />
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-foreground/20">Operational Resilience Verified</span>
                   </div>
                </div>
              </motion.div>
           </div>

           <div className="space-y-12 mt-10">
              {/* Categorized Feed */}
           {categories.map((cat) => {
              const categoryServices = serviceData.filter(s => s.category === cat.name);
              if (categoryServices.length === 0) return null;

              return (
                <section 
                  key={cat.name} 
                  id={`section-${cat.name.toLowerCase()}`}
                  data-category={cat.name}
                  className="space-y-8 scroll-mt-24"
                >
                  <div className="flex items-center justify-between border-b border-border pb-6">
                    <h2 className="text-[32px] font-black text-foreground uppercase tracking-tighter dark:neon-text">
                      {cat.name} Infrastructure
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {categoryServices.map((service, index) => (
                      <div key={service.id} className="flex border border-border rounded-[24px] overflow-hidden bg-card hover:shadow-2xl hover:border-primary/40 transition-all duration-500 dark:hover:shadow-[0_0_40px_rgba(57,255,20,0.1)] group">
                        
                        {/* Luxury Banner Side (45%) */}
                        <div className="bg-[#673ab7] dark:bg-primary/80 p-10 flex flex-col justify-between w-[45%] text-white dark:text-black shrink-0 transition-all duration-500 group-hover:bg-primary dark:group-hover:bg-primary">
                            <div>
                               <div className="flex items-center gap-2 mb-4">
                                  <service.icon className="w-5 h-5 opacity-80" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Certified Service</span>
                               </div>
                               <h3 className="text-3xl font-black uppercase leading-[0.9] tracking-tight mb-4">{service.name}</h3>
                               <p className="opacity-80 text-[14px] font-medium leading-relaxed">{service.description}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-8">
                               {service.specs.map(tag => (
                                 <span key={tag} className="px-4 py-1.5 bg-white/10 dark:bg-black/10 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap border border-white/5">
                                    {tag}
                                 </span>
                               ))}
                            </div>
                        </div>

                        {/* Info Side (55%) */}
                        <div className="flex-1 p-10 flex flex-col justify-between bg-card">
                            <div>
                               <div className="flex justify-between items-start mb-4">
                                  <h4 className="text-[18px] font-black text-foreground uppercase tracking-tight">{service.shortName}</h4>
                                  <button 
                                    onClick={() => addToCart(service)}
                                    className="px-8 py-2.5 border-2 border-[#673ab7] dark:border-primary rounded-xl text-[#673ab7] dark:text-primary text-[14px] font-black uppercase hover:bg-[#673ab7] dark:hover:bg-primary hover:text-white dark:hover:text-black transition-all shadow-lg active:scale-95"
                                  >
                                    Add
                                  </button>
                               </div>
                               <div className="flex items-center gap-2 mb-4">
                                  <Star className="w-4 h-4 text-primary fill-primary" />
                                  <span className="text-[14px] font-black text-foreground">{service.rating}</span>
                                  <span className="text-[14px] font-bold text-slate-400 dark:text-white/20">({service.reviews} reviews)</span>
                               </div>
                               <div className="flex items-center gap-3">
                                  <span className="text-xl font-black text-primary font-mono">{service.price}</span>
                                  <span className="w-1 h-1 bg-slate-300 dark:bg-white/10 rounded-full" />
                                  <span className="text-sm font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest">{service.duration}</span>
                               </div>
                            </div>

                            <div className="pt-8 mt-8 border-t border-border flex items-center justify-between">
                               <div className="flex -space-x-3">
                                  {[1,2,3,4].map(i => (
                                     <div key={i} className="w-10 h-10 rounded-full border-2 border-card bg-slate-100 overflow-hidden shadow-sm">
                                        <img src={`https://i.pravatar.cc/100?u=a${i+index}`} className="w-full h-full object-cover" alt="Analyst" />
                                     </div>
                                  ))}
                                  <div className="w-10 h-10 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                     +2k
                                  </div>
                               </div>
                               <button className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:underline decoration-2">
                                  <Info className="w-4 h-4" /> System Specs
                                </button>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
           );
        })}
      </div>
    </main>

        {/* 3. SIDEBAR RIGHT (STICKY CART) */}
        <aside className="sticky top-28 space-y-6">
           {/* 🛡️ THE OPS COMMAND CENTER (REIMAGINED CART) */}
           <div className="relative group">
              {/* Outer Glow Sync */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 rounded-[32px] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative border border-white/10 dark:border-white/5 rounded-[32px] overflow-hidden bg-white/80 dark:bg-[#050505]/80 backdrop-blur-2xl shadow-2xl transition-all duration-500">
                {/* Header Section: Hub Status */}
                <div className="p-6 border-b border-white/10 dark:border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        {totalItems > 0 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_var(--primary)]"
                          >
                            {totalItems}
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-black text-foreground uppercase tracking-wider">Ops Command</h4>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_var(--primary)]" />
                          <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] animate-pulse">System Live</span>
                        </div>
                      </div>
                    </div>

                    {cartEntries.length > 0 && (
                      <button 
                        onClick={() => setCart({})}
                        className="p-2 hover:bg-red-500/10 text-red-500/30 hover:text-red-500 transition-all rounded-lg"
                        title="Deactivate All Nodes"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Items Container */}
                <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {cartEntries.length === 0 ? (
                    <div className="py-10 text-center space-y-4">
                      <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center opacity-20">
                        <Zap className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] leading-relaxed px-4">
                        Awaiting infrastructure<br/>node selection...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {cartEntries.map(([key, { item, qty }]) => (
                          <motion.div 
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={key}
                            className="group/item flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-transparent hover:border-primary/20 transition-all duration-300"
                          >
                            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center group-hover/item:border-primary/20 transition-colors">
                              <item.icon className="w-5 h-5 text-foreground/40 group-hover/item:text-primary transition-colors" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-black text-foreground/80 truncate uppercase tracking-wide">{item.shortName}</p>
                              <p className="text-[9px] font-bold text-primary/60 uppercase">{item.price}</p>
                            </div>

                            <div className="flex items-center bg-white dark:bg-black/40 rounded-lg p-1 border border-border/50 group-hover/item:border-primary/20 transition-colors">
                              <button
                                onClick={() => removeFromCart(key)}
                                className="w-6 h-6 flex items-center justify-center text-foreground/40 hover:text-red-500 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-[10px] font-black text-foreground">{qty}</span>
                              <button
                                onClick={() => addToCart(item)}
                                className="w-6 h-6 flex items-center justify-center text-foreground/40 hover:text-primary transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Footer: Action Central */}
                {cartEntries.length > 0 && (
                  <div className="p-6 bg-gradient-to-t from-black/5 dark:from-white/5 to-transparent border-t border-white/10 dark:border-white/5">
                    <div className="flex justify-between items-center mb-6">
                       <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Deployment Readiness</span>
                       <span className="text-[14px] font-black text-primary neon-text tracking-widest">{totalItems} NODES</span>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCheckout}
                      className="relative w-full py-5 bg-primary overflow-hidden rounded-2xl group/btn"
                    >
                      {/* Sweeping Light Effect */}
                      <div className="absolute inset-0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                      
                      <div className="relative flex items-center justify-center gap-3">
                         <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                         <span className="text-[12px] font-black text-black uppercase tracking-[0.3em]">Deploy System</span>
                      </div>
                    </motion.button>
                  </div>
                )}
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

export function ServicesContent() {
  return (
    <Suspense fallback={<div className="h-screen bg-white flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#673ab7] border-t-transparent rounded-full animate-spin" /></div>}>
      <ServiceBrowser />
    </Suspense>
  );
}
