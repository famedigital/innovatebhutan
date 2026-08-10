"use client"

import Link from "next/link"
import Balancer from "react-wrap-balancer"
import { motion } from "framer-motion"
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Browse Products", href: "/products" },
      { label: "POS Systems", href: "/products" },
      { label: "CCTV & Security", href: "/products" },
      { label: "Networking", href: "/products" },
      { label: "Custom Software", href: "/services" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "For Hotels", href: "/services" },
      { label: "For Retail", href: "/services" },
      { label: "For Offices", href: "/services" },
      { label: "For Education", href: "/services" },
      { label: "For Government", href: "/services" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Support Center", href: "/support" },
      { label: "Help Guides", href: "/support/help" },
      { label: "Warranty", href: "/support/warranty" },
      { label: "Service Request", href: "/support/service" },
      { label: "WhatsApp Support", href: "https://wa.me/97517268753" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Home", href: "/" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/#contact" },
      { label: "Sign in", href: "/login" },
      { label: "Get Started", href: "/#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/privacy" },
      { label: "Cookie Policy", href: "/privacy" },
      { label: "Accessibility", href: "/privacy" },
      { label: "Sitemap", href: "/" },
    ],
  },
]

const social = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/innovates.bt",
    icon: Facebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/innovates.bt",
    icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@innovatesbt",
    icon: Youtube,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/innovates",
    icon: Linkedin,
  },
]

/**
 * shadcn.io Footer Mega
 * Source: https://www.shadcn.io/blocks/footer-mega
 *
 * Brand + 5 link columns + newsletter + social + copyright.
 */
export function FooterMega() {
  return (
    <footer className="w-full border-t bg-card">
      <motion.div
        className="mx-auto w-full max-w-6xl overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="border-b px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dr9a371tx/image/upload/q_auto/f_auto/v1776705871/weblogo_os6cni.png"
              alt="innovates.bt"
              className="h-7 w-auto"
            />
            <span className="text-sm font-medium">
              <span className="text-emerald-500">innovates</span>
              <span className="text-blue-500">.bt</span>
            </span>
          </Link>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            <Balancer>
              Technology experts for Bhutanese businesses. Websites, POS, CCTV,
              networking, and custom systems — built, installed, and supported
              locally.
            </Balancer>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 border-b px-4 py-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
          {columns.map((column) => (
            <div key={column.title}>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {column.title}
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-start gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-muted-foreground">
            Subscribe to our newsletter for product updates and support tips.
          </p>
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              window.open(
                "https://wa.me/97517268753?text=Hi%2C%20please%20add%20me%20to%20product%20updates",
                "_blank",
                "noopener,noreferrer"
              )
            }}
          >
            <Input
              type="email"
              placeholder="you@example.com"
              className="h-8 w-48 text-xs"
              required
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 text-xs"
            >
              Subscribe
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <div className="flex items-center gap-1">
            {social.map((item) => (
              <Button
                key={item.label}
                asChild
                variant="ghost"
                size="icon"
                className="size-7"
              >
                <a
                  href={item.href}
                  aria-label={item.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <item.icon className="size-3.5" />
                </a>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:+97517268753"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              +975 17268753
            </a>
            <Link
              href="/support"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Support
            </Link>
          </div>
        </div>

        <div className="px-4 py-3 sm:px-6">
          <p className="text-xs text-muted-foreground">
            © 2026 INNOVATES.bt. All rights reserved. Design by{" "}
            <a
              href="https://famedigital.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              FameDigital
            </a>
            , Singapore
          </p>
        </div>
      </motion.div>
    </footer>
  )
}

export default FooterMega
