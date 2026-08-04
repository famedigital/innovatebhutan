"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { SocialIconLinks } from "@/components/social-icons";

interface ContentItem {
  id: number;
  page: string;
  section: string;
  content_key: string;
  value: string;
}

interface FooterLink {
  title: string;
  links: Array<{ name: string; href: string }>;
}

export function FooterSectionDynamic() {
  const [footerContent, setFooterContent] = useState<Record<string, string>>({
    copyright: "© 2026 INNOVATES.bt. All rights reserved.",
    designer_credit: "Design by FameDigital, Singapore",
    phone: "+975 17268753",
    website: "www.innovates.bt",
  });
  const [footerLinks] = useState<Record<string, FooterLink>>({
    services: {
      title: "Services",
      links: [
        { name: "POS Systems", href: "/services" },
        { name: "CCTV Solutions", href: "/services" },
        { name: "Biometric Access", href: "/services" },
        { name: "Hospitality Software", href: "/services" },
        { name: "Custom Development", href: "/services" },
      ]
    },
    support: {
      title: "Support",
      links: [
        { name: "Help Center", href: "/support/help" },
        { name: "Warranty", href: "/support/warranty" },
        { name: "Service Request", href: "/support/service" },
        { name: "WhatsApp Support", href: "https://wa.me/97517268753" },
      ]
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFooterContent() {
      try {
        const contentRes = await fetch("/api/website/content?page=home&section=footer");
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          if (contentData.success && contentData.data.length > 0) {
            const contentMap: Record<string, string> = {};
            contentData.data.forEach((item: ContentItem) => {
              contentMap[item.content_key] = item.value;
            });
            setFooterContent(prev => ({ ...prev, ...contentMap }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch footer content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFooterContent();
  }, []);

  if (loading) {
    return (
      <footer className="bg-[#030712] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-4">
            <div className="h-24 w-32 bg-white/10 rounded"></div>
            <div className="grid grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-white/10 rounded"></div>
                  <div className="h-3 w-16 bg-white/5 rounded"></div>
                  <div className="h-3 w-24 bg-white/5 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-[#030712] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-2 mb-8 lg:mb-0">
            <Link href="/" className="group relative z-10 transition-transform hover:scale-105 mb-6 inline-block">
              <motion.img
                src="https://res.cloudinary.com/dr9a371tx/image/upload/q_auto/f_auto/v1776706698/footerinnovates6_xwzura.png"
                alt="INNOVATES.bt"
                className="h-24 w-auto"
              />
            </Link>
            <div className="text-sm text-[#9CA3AF] mb-6 space-y-1">
              <p className="text-primary font-mono">{footerContent.phone || "+975 17268753"}</p>
              <p>
                <a href={`https://${footerContent.website || "www.innovates.bt"}`} className="hover:text-white transition-colors">
                  {footerContent.website || "www.innovates.bt"}
                </a>
              </p>
            </div>
            <SocialIconLinks />
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#9CA3AF] hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#6B7280]">
              {footerContent.copyright || "© 2026 INNOVATES.bt. All rights reserved."}
              <br className="sm:hidden" />
              <span className="sm:ml-2">
                Design by{" "}
                <a href="https://famedigital.netlify.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  FameDigital
                </a>
                , Singapore
              </span>
            </p>
            <div className="flex items-center gap-6 text-sm text-[#6B7280]">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
