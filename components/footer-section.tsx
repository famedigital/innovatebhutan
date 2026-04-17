"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const footerLinks = {
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
  directory: {
    title: "Directory",
    links: [
      { name: "Browse All", href: "/directory" },
      { name: "By Category", href: "/directory" },
      { name: "By Location", href: "/directory" },
      { name: "List Your Business", href: "/directory" },
    ]
  },
  company: {
    title: "Company",
    links: [
      { name: "About Us", href: "/company" },
      { name: "Our Team", href: "/company/team" },
      { name: "Careers", href: "/company/careers" },
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
};

export function FooterSection() {
  return (
    <footer className="bg-[#030712] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
            <Link href="/" className="flex flex-col group relative z-10 transition-transform hover:scale-105 w-fit mb-6">
              <div className="absolute -inset-2 bg-primary rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="text-3xl font-bold tracking-tighter text-white leading-none relative">
                INNOVATES<span className="text-primary [text-shadow:0_0_15px_var(--primary)]">.</span>bt
              </div>
              <div className="text-[10px] font-mono tracking-[0.4em] text-primary uppercase ml-1 opacity-80 group-hover:opacity-100 group-hover:[text-shadow:0_0_10px_var(--primary)] transition-all">
                by infiniteknot
              </div>
            </Link>
            <div className="text-sm text-[#9CA3AF] mb-6 space-y-1">
              <p className="font-bold text-white mb-2">Manish Sharma as Founder</p>
              <p>Thimphu, Bhutan</p>
              <p className="text-primary font-mono">+975 17268753</p>
              <p><a href="https://www.innovates.bt" className="hover:text-white transition-colors">www.innovates.bt</a></p>
            </div>
            <div className="flex items-center gap-3">
              {["FB", "IG", "LI"].map((social) => (
                <button
                  key={social}
                  className="w-9 h-9 bg-[#1F2937] rounded-lg flex items-center justify-center text-xs font-medium text-[#9CA3AF] hover:bg-[#14532D] hover:text-white transition-colors"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
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

      {/* Bottom Bar */}
      <div className="border-t border-[#1F2937]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#6B7280]">
              2026 INNOVATES.bt. All rights reserved. <br className="sm:hidden" />
              <span className="sm:ml-2">
                by <a href="https://infiniteknot.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">infiniteknot</a>
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
