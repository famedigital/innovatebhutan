"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { ServiceDirectory } from "@/components/service-directory";
import { StatsSection } from "@/components/stats-section";
import { BrandsSection } from "@/components/brands-section";
import { ContactSection } from "@/components/contact-section";
import { FooterSection } from "@/components/footer-section";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("pos");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-[#020617] selection:bg-[#39FF14]/30 selection:text-[#39FF14] overflow-x-hidden">
      <Navigation />
      
      {/* Hero Section - 35/65 Split */}
      <section className="pt-32 pb-20 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-5" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#39FF14]/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            {/* Left 45% - Search + Hero */}
            <div className="w-full lg:w-[45%] lg:pr-8">
              <HeroSection 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
              />
            </div>
            
            {/* Right 55% - Matrix / Directory */}
            <div className="w-full lg:w-[55%]">
              <ServiceDirectory 
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Analytics + Partners */}
      <section className="py-24 relative overflow-hidden bg-white/[0.02] border-y border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
            {/* Left 60% - Brands */}
            <div className="w-full lg:w-[60%]">
              <BrandsSection />
            </div>
            
            {/* Right 40% - Stats */}
            <div className="w-full lg:w-[40%]">
              <StatsSection />
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
      <FooterSection />
      <WhatsAppButton />
    </main>
  );
}