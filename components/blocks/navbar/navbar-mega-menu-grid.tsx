"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRightIcon,
  BarChart3Icon,
  BlocksIcon,
  BriefcaseIcon,
  BuildingIcon,
  CloudIcon,
  CodeIcon,
  CpuIcon,
  DatabaseIcon,
  GlobeIcon,
  HeartPulseIcon,
  LandmarkIcon,
  LockIcon,
  Moon,
  RocketIcon,
  ShoppingCartIcon,
  Sun,
  ZapIcon,
} from "lucide-react"
import { useTheme } from "@/components/PureThemeProvider"

const products = [
  {
    icon: <BarChart3Icon className="size-4" />,
    title: "Analytics",
    description: "Real-time dashboards and metrics",
    href: "/products",
  },
  {
    icon: <DatabaseIcon className="size-4" />,
    title: "Database",
    description: "Managed PostgreSQL at scale",
    href: "/products",
  },
  {
    icon: <CloudIcon className="size-4" />,
    title: "Cloud",
    description: "Deploy to global edge network",
    href: "/products",
  },
  {
    icon: <LockIcon className="size-4" />,
    title: "Auth",
    description: "Authentication and authorization",
    href: "/products",
  },
  {
    icon: <ZapIcon className="size-4" />,
    title: "Functions",
    description: "Serverless compute platform",
    href: "/products",
  },
  {
    icon: <BlocksIcon className="size-4" />,
    title: "Integrations",
    description: "Connect with 200+ services",
    href: "/products",
  },
  {
    icon: <CpuIcon className="size-4" />,
    title: "AI Engine",
    description: "ML inference at the edge",
    href: "/products",
  },
  {
    icon: <CodeIcon className="size-4" />,
    title: "DevTools",
    description: "CLI and local development",
    href: "/products",
  },
  {
    icon: <RocketIcon className="size-4" />,
    title: "Deploy",
    description: "Zero-config CI/CD pipeline",
    href: "/products",
  },
]

const solutions = [
  {
    icon: <ShoppingCartIcon className="size-4" />,
    title: "E-commerce",
    description: "High-performance storefronts and checkout flows",
    href: "/services",
  },
  {
    icon: <LandmarkIcon className="size-4" />,
    title: "Financial Services",
    description: "Compliant infrastructure for fintech teams",
    href: "/services",
  },
  {
    icon: <HeartPulseIcon className="size-4" />,
    title: "Healthcare",
    description: "HIPAA-ready platform for health applications",
    href: "/services",
  },
  {
    icon: <BriefcaseIcon className="size-4" />,
    title: "SaaS",
    description: "Multi-tenant architecture for B2B products",
    href: "/services",
  },
  {
    icon: <GlobeIcon className="size-4" />,
    title: "Media & Publishing",
    description: "Content delivery at global scale",
    href: "/services",
  },
  {
    icon: <BuildingIcon className="size-4" />,
    title: "Enterprise",
    description: "Custom solutions with dedicated support",
    href: "/services",
  },
]

const links = [
  { label: "Home", href: "/" },
  { label: "Support", href: "/support" },
]

export function NavbarMegaMenuGrid() {
  const [active, setActive] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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

  const open = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setActive(label)
  }

  const close = () => {
    timeoutRef.current = setTimeout(() => {
      setActive(null)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="relative w-full overflow-visible rounded-2xl border border-slate-200/80 bg-white/90 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-black/80 md:rounded-lg md:border-border md:bg-card">
      <div className="relative overflow-visible">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dr9a371tx/image/upload/q_auto/f_auto/v1776705871/weblogo_os6cni.png"
                alt="innovates.bt"
                className="h-6 w-auto"
              />
              <span className="font-medium text-sm">
                <span className="text-emerald-500">innovates</span>
                <span className="text-blue-500">.bt</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              {["Products", "Solutions"].map((label) => (
                <div
                  key={label}
                  className="relative"
                  onMouseEnter={() => open(label)}
                  onMouseLeave={close}
                >
                  <button
                    type="button"
                    aria-expanded={active === label}
                    className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                      active === label
                        ? "bg-muted/50 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </button>
                </div>
              ))}
              {links.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
                  onMouseEnter={() => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current)
                    setActive(null)
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/#contact"
              className="rounded-md bg-foreground px-3 py-1.5 text-background text-sm transition-colors hover:bg-foreground/90"
            >
              Get started
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {active === "Products" && (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 left-0 z-[60] overflow-visible rounded-b-2xl border border-t border-slate-200/80 bg-white shadow-xl dark:border-white/10 dark:bg-black"
              onMouseEnter={() => open("Products")}
              onMouseLeave={close}
            >
              <div className="grid grid-cols-3 gap-1 p-2">
                {products.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <span className="mt-0.5 text-muted-foreground">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="font-medium text-sm">{item.title}</span>
                      <p className="mt-0.5 text-muted-foreground text-xs">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t px-4 py-2.5">
                <Link
                  href="/products"
                  className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
                >
                  View all products
                  <ArrowRightIcon className="size-3" />
                </Link>
              </div>
            </motion.div>
          )}

          {active === "Solutions" && (
            <motion.div
              key="solutions"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 left-0 z-[60] overflow-visible rounded-b-2xl border border-t border-slate-200/80 bg-white shadow-xl dark:border-white/10 dark:bg-black"
              onMouseEnter={() => open("Solutions")}
              onMouseLeave={close}
            >
              <div className="grid grid-cols-2 gap-1 p-2">
                {solutions.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="flex items-start gap-3 rounded-md p-3 text-left transition-colors hover:bg-muted/50"
                  >
                    <span className="mt-0.5 text-muted-foreground">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="font-medium text-sm">{item.title}</span>
                      <p className="mt-0.5 text-muted-foreground text-xs">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="border-t px-4 py-2.5">
                <Link
                  href="/services"
                  className="flex items-center gap-1 text-muted-foreground text-xs transition-colors hover:text-foreground"
                >
                  View all solutions
                  <ArrowRightIcon className="size-3" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default NavbarMegaMenuGrid
