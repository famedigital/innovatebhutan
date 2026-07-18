"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Ticket,
  Building2,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const TABS = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/amc", label: "AMC", icon: ShieldCheck },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/clients", label: "Clients", icon: Building2 },
] as const;

function pathMatches(pathname: string, href: string, exact?: boolean) {
  const clean = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (exact) return clean === target;
  return clean === target || clean.startsWith(target + "/");
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setOpenMobile, openMobile } = useSidebar();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]"
      aria-label="Staff mobile navigation"
    >
      <div className="grid grid-cols-5 h-16">
        {TABS.map((tab) => {
          const active = pathMatches(pathname, tab.href, "exact" in tab && tab.exact);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "stroke-[2.5]")} />
              {tab.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpenMobile(!openMobile)}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground"
        >
          <Menu className="w-5 h-5" />
          More
        </button>
      </div>
    </nav>
  );
}
