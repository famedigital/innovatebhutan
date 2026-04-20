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
              <motion.img
                src="https://res.cloudinary.com/dr9a371tx/image/upload/q_auto/f_auto/v1776705871/weblogo_os6cni.png"
                alt="INNOVATES.bt"
                className="h-10 w-auto"
              />
              <div className="text-xl font-bold tracking-tighter leading-none relative mt-2">
                <span style={{ color: '#10B981' }}>INNOVATES</span><span style={{ color: '#3B82F6' }}>.bt</span>
              </div>
            </Link>
            <div className="text-sm text-[#9CA3AF] mb-6 space-y-1">
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
                Design by <a href="https://famedigital.netlify.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">FameDigital</a>
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
