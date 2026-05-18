"use client";

import { useState } from "react";
import { TopMarquee } from "@/components/top-marquee";
import { AdaptiveHero } from "@/components/adaptive-hero/adaptive-hero";
import { StatsSection } from "@/components/stats-section";
import { ServiceDirectoryDynamic } from "@/components/service-directory-dynamic";
import { ContactSectionDynamic } from "@/components/contact-section-dynamic";
import { FooterSectionDynamic } from "@/components/footer-section-dynamic";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#10B981] selection:text-white dark:selection:bg-primary dark:selection:text-black transition-colors duration-500">
      <TopMarquee />

      {/* Hero Section - Fullscreen adaptive experience */}
      <section className="relative min-h-screen transition-colors duration-500">
        <AdaptiveHero
          heading="WE BUILD DIGITAL WORLDS"
          description="Premium IT solutions for the Himalayan region"
          ctaText="Explore Our Services"
          ctaLink="/services"
          showPerformanceInfo={false}
        />
      </section>

      {/* Trusted Section - Stats */}
      <section className="py-6 sm:py-12 bg-background border-b border-border transition-colors">
        <div className="max-w-[1300px] mx-auto px-5">
           <StatsSection />
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