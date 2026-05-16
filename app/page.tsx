"use client";

import { useState } from "react";
import { NavigationDynamic } from "@/components/navigation-dynamic";
import { TopMarquee } from "@/components/top-marquee";
import { HeroSection } from "@/components/hero-section-dynamic";
import { ServiceDirectoryDynamic } from "@/components/service-directory-dynamic";
import { StatsSectionDynamic } from "@/components/stats-section-dynamic";
import { ContactSectionDynamic } from "@/components/contact-section-dynamic";
import { FooterSectionDynamic } from "@/components/footer-section-dynamic";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#10B981] selection:text-white dark:selection:bg-primary dark:selection:text-black transition-colors duration-500">
      <NavigationDynamic />
      <TopMarquee />

      {/* Hero Section */}
      <section className="pt-16 sm:pt-20 pb-8 relative bg-background transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 relative">
          <HeroSection />
        </div>
      </section>

      {/* Analytics Column Flow - Compact Stats Only */}
      <section className="py-6 sm:py-12 bg-background border-b border-border transition-colors">
        <div className="max-w-[1300px] mx-auto px-5">
           <StatsSectionDynamic />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-background">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive technology solutions tailored for your business needs
            </p>
          </div>
          <ServiceDirectoryDynamic />
        </div>
      </section>

      <ContactSectionDynamic />
      <FooterSectionDynamic />
      <WhatsAppButton />
    </main>
  );
}