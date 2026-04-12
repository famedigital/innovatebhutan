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
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#10B981] selection:text-white dark:selection:bg-primary dark:selection:text-black overflow-x-hidden transition-colors duration-500">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 relative bg-background transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative">
          <HeroSection />
        </div>
      </section>

      {/* Analytics Column Flow - Compact Stats Only */}
      <section className="py-12 bg-background border-b border-border transition-colors">
        <div className="max-w-[1300px] mx-auto px-5">
           <StatsSection />
        </div>
      </section>

      <ContactSection />
      <FooterSection />
      <WhatsAppButton />
    </main>
  );
}