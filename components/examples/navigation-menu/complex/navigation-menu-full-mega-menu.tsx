"use client"

import Link from "next/link"
import {
  ArrowRight,
  BarChart,
  BookOpen,
  Code,
  FileText,
  Headphones,
  Moon,
  Palette,
  Shield,
  Sparkles,
  Sun,
  Video,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useTheme } from "@/components/PureThemeProvider"
import { useEffect, useState } from "react"

const coreFeatures = [
  {
    icon: Sparkles,
    label: "Browse Products",
    description: "POS, CCTV, networking & more",
    href: "/products",
  },
  {
    icon: Code,
    label: "Custom Software",
    description: "Websites, CRM and ERP builds",
    href: "/services",
  },
  {
    icon: Palette,
    label: "Design & Branding",
    description: "Digital presence that converts",
    href: "/services",
  },
]

const advancedFeatures = [
  {
    icon: BarChart,
    label: "Business Analytics",
    description: "Live ops and reporting insights",
    href: "/products",
  },
  {
    icon: Shield,
    label: "Security Systems",
    description: "CCTV and access control",
    href: "/products",
  },
  {
    icon: Zap,
    label: "Automation",
    description: "Workflow and process automation",
    href: "/services",
  },
]

const resources = [
  { icon: FileText, label: "Support Center", href: "/support" },
  { icon: Video, label: "Help Guides", href: "/support/help" },
  { icon: BookOpen, label: "Service Desk", href: "/support/service" },
]

const company = [
  { label: "Home", href: "/" },
  { label: "Contact", href: "/#contact" },
  { label: "Sign in", href: "/login" },
]

const sidebar = {
  tutorial: {
    title: "Browse Catalog",
    description: "Explore products and services we deliver across Bhutan",
    button: { label: "View Products", icon: ArrowRight, href: "/products" },
  },
  contact: {
    title: "Need Help?",
    description: "Talk to our team on WhatsApp",
    button: { label: "Contact Sales", href: "https://wa.me/97517268753" },
  },
}

/**
 * shadcn.io Full Mega Menu — wired for innovates.bt public navigation.
 * Source: https://www.shadcn.io/examples/navigation-menu-full-mega-menu
 */
export function NavigationMenuFullMegaMenu() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode =
    mounted &&
    (theme === "dark" ||
      (theme === "system" &&
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches))

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light")
    else if (theme === "light") setTheme("dark")
    else {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches
      setTheme(systemPrefersDark ? "light" : "dark")
    }
  }

  return (
    <div className="flex w-full items-center justify-between gap-4 rounded-lg border bg-card px-3 py-2 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 px-1">
          <img
            src="https://res.cloudinary.com/dr9a371tx/image/upload/q_auto/f_auto/v1776705871/weblogo_os6cni.png"
            alt="innovates.bt"
            className="h-6 w-auto"
          />
          <span className="text-sm font-medium">
            <span className="text-emerald-500">innovates</span>
            <span className="text-blue-500">.bt</span>
          </span>
        </Link>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[900px] p-6">
                  <div className="grid grid-cols-[2fr_1fr_1fr] gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-3 font-semibold text-muted-foreground text-sm">
                          CORE FEATURES
                        </h4>
                        <div className="space-y-2">
                          {coreFeatures.map((feature) => {
                            const Icon = feature.icon
                            return (
                              <NavigationMenuLink
                                className="flex flex-row items-start gap-2"
                                href={feature.href}
                                key={feature.label}
                              >
                                <Icon className="size-5" />
                                <div>
                                  <span className="block font-medium">
                                    {feature.label}
                                  </span>
                                  <span className="block text-muted-foreground">
                                    {feature.description}
                                  </span>
                                </div>
                              </NavigationMenuLink>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-3 font-semibold text-muted-foreground text-sm">
                          ADVANCED
                        </h4>
                        <div className="space-y-2">
                          {advancedFeatures.map((feature) => {
                            const Icon = feature.icon
                            return (
                              <NavigationMenuLink
                                className="flex flex-row items-start gap-2"
                                href={feature.href}
                                key={feature.label}
                              >
                                <Icon className="size-5" />
                                <div>
                                  <span className="block font-medium">
                                    {feature.label}
                                  </span>
                                  <span className="block text-muted-foreground">
                                    {feature.description}
                                  </span>
                                </div>
                              </NavigationMenuLink>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-3 font-semibold text-muted-foreground text-sm">
                          RESOURCES
                        </h4>
                        <div className="space-y-2">
                          {resources.map((resource) => {
                            const Icon = resource.icon
                            return (
                              <NavigationMenuLink
                                className="flex flex-row items-start gap-2"
                                href={resource.href}
                                key={resource.label}
                              >
                                <Icon className="size-4" />
                                <span className="font-medium text-sm">
                                  {resource.label}
                                </span>
                              </NavigationMenuLink>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-3 font-semibold text-muted-foreground text-sm">
                          COMPANY
                        </h4>
                        <div className="space-y-2">
                          {company.map((item) => (
                            <NavigationMenuLink href={item.href} key={item.label}>
                              <span className="font-medium text-sm">
                                {item.label}
                              </span>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-lg bg-muted p-4">
                        <div className="aspect-video rounded bg-background" />
                        <div className="mt-3 space-y-2">
                          <h4 className="font-semibold">
                            {sidebar.tutorial.title}
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            {sidebar.tutorial.description}
                          </p>
                          <Button className="w-full" size="sm" asChild>
                            <Link href={sidebar.tutorial.button.href}>
                              {sidebar.tutorial.button.label}
                              <sidebar.tutorial.button.icon />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-lg bg-primary/5 p-4">
                        <h4 className="font-semibold">
                          {sidebar.contact.title}
                        </h4>
                        <p className="mt-1 text-muted-foreground text-sm">
                          {sidebar.contact.description}
                        </p>
                        <Button
                          className="mt-3 w-full"
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={sidebar.contact.button.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {sidebar.contact.button.label}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                href="/products"
                className={navigationMenuTriggerStyle()}
              >
                Products
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/services"
                className={navigationMenuTriggerStyle()}
              >
                Services
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/support"
                className={navigationMenuTriggerStyle()}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Headphones className="size-3.5" />
                  Support
                </span>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/#contact">Get started</Link>
        </Button>
      </div>
    </div>
  )
}

export default NavigationMenuFullMegaMenu
