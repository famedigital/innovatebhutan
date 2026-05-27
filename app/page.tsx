"use client";

import { useState, useEffect } from "react";
import { TopMarquee } from "@/components/top-marquee";
import { AdaptiveHero } from "@/components/adaptive-hero/adaptive-hero";
import { StatsSection } from "@/components/stats-section";
import { ClientTrustBar } from "@/components/client-trust-bar";
import { ServiceDirectoryDynamic } from "@/components/service-directory-dynamic";
import { ContactSectionDynamic } from "@/components/contact-section-dynamic";
import { FooterSectionDynamic } from "@/components/footer-section-dynamic";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroContent, setHeroContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic hero content
  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const response = await fetch('/api/website/hero');
        if (response.ok) {
          const data = await response.json();
          setHeroContent(data.data);
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
        // Keep default content if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchHeroContent();
  }, []);

  // Use dynamic content or fallback to defaults
  const heading = heroContent?.headline || "Your Complete Technology Partner";
  const description = heroContent?.subheadline || "From Custom Software to Complete IT Operations";
  const ctaText = heroContent?.primaryCtaText || "Explore Services";
  const ctaLink = heroContent?.primaryCtaLink || "/services";
  const secondaryCtaText = heroContent?.secondaryCtaText || "Get Free Quote";
  const secondaryCtaLink = heroContent?.secondaryCtaLink || "https://wa.me/97512345678";

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#10B981] selection:text-white dark:selection:bg-primary dark:selection:text-black transition-colors duration-500">
      <TopMarquee />

      {/* Hero Section - Fullscreen adaptive experience */}
      <section className="relative min-h-screen transition-colors duration-500">
        {!loading && (
          <AdaptiveHero
            heading={heading}
            description={description}
            ctaText={ctaText}
            ctaLink={ctaLink}
            secondaryCtaText={secondaryCtaText}
            secondaryCtaLink={secondaryCtaLink}
            showPerformanceInfo={false}
            heroContent={heroContent}
          />
        )}
      </section>

      {/* Client Trust Bar - Social Proof */}
      {heroContent && heroContent.showTrustIndicators && (
        <ClientTrustBar
          clientCount={heroContent.clientCount || 350}
          yearsInBusiness={heroContent.yearsInBusiness || 12}
          showProducts={true}
          featuredProducts={heroContent.featuredProducts || undefined}
        />
      )}

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