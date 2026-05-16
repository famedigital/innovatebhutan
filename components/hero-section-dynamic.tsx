"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getMediaUrl } from "@/lib/cloudinary";
import { PremiumHeroSlider } from "@/components/premium-hero-slider";
import { toast } from "sonner";

interface HeroContent {
  main_heading: string;
  sub_heading: string;
  cta_text: string;
  cta_link: string;
}

interface Client {
  id: number;
  name: string;
  logo_url?: string;
}

interface Service {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  icon_name: string;
  icon_color: string;
  gradient_from: string;
  gradient_to: string;
}

export function HeroSection() {
  const router = useRouter();
  const [heroContent, setHeroContent] = useState<HeroContent>({
    main_heading: "Bhutan's Tomorrow, Delivered Today",
    sub_heading: "Transform your business with innovative technology solutions",
    cta_text: "Get Free Consultation",
    cta_link: "/contact",
  });
  const [typewriterPhrases, setTypewriterPhrases] = useState<string[]>([
    "your business growth",
    "enterprise success",
    "digital transformation",
    "innovative technology",
  ]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch hero content from API
  useEffect(() => {
    async function fetchHeroContent() {
      try {
        // Fetch hero content
        const contentRes = await fetch("/api/website/content?page=home&section=hero");
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          if (contentData.success && contentData.data.length > 0) {
            const contentMap: Record<string, string> = {};
            contentData.data.forEach((item: any) => {
              contentMap[item.content_key] = item.value;
            });

            setHeroContent({
              main_heading: contentMap.main_heading || heroContent.main_heading,
              sub_heading: contentMap.sub_heading || heroContent.sub_heading,
              cta_text: contentMap.cta_text || heroContent.cta_text,
              cta_link: contentMap.cta_link || heroContent.cta_link,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch hero content:", error);
      }
    }

    // Fetch clients from database
    async function fetchClients() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("clients")
          .select("id, name, logo_url")
          .eq("is_active", true)
          .order("display_order")
          .limit(30);

        if (!error && data) {
          setClients(data);
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    }

    // Fetch services
    async function fetchServices() {
      try {
        const servicesRes = await fetch("/api/website/services");
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          if (servicesData.success) {
            setServices(servicesData.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    }

    setLoading(false);
    fetchHeroContent();
    fetchClients();
    fetchServices();
  }, []);

  const handleContactClick = () => {
    router.push(heroContent.cta_link);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Premium Hero Slider */}
      <PremiumHeroSlider
        heading={heroContent.main_heading}
        description={heroContent.sub_heading}
        ctaText={heroContent.cta_text}
        ctaLink={heroContent.cta_link}
        onContact={handleContactClick}
      />

      {/* Clients Scrolling Marquee */}
      {clients.length > 0 && (
        <div className="mt-6 overflow-hidden">
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border p-6">
            <h3 className="text-sm font-semibold text-center mb-4 text-muted-foreground uppercase tracking-wider">
              Trusted by Industry Leaders
            </h3>
            <div className="overflow-hidden">
              <div className="flex gap-6 py-3 animate-scroll">
                {clients.map((client, index) => (
                  <div
                    key={client.id}
                    className="flex-shrink-0 w-32 h-16 flex items-center justify-center"
                  >
                    {client.logo_url ? (
                      <img
                        src={getMediaUrl(client.logo_url)}
                        alt={client.name}
                        className="h-8 w-auto object-contain filter brightness-0 dark:brightness-0 invert dark:invert-0 opacity-80 hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        {client.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
