"use client";

import { useState } from "react";
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
import { MobileMoreDrawer } from "@/components/admin/mobile-more-drawer";

const TABS = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/products/rancelab", label: "RanceLab", icon: ShieldCheck },
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
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)]"
        aria-label="Staff mobile navigation"
      >
        <div className="grid grid-cols-5 h-16">
          {TABS.map((tab) => {
            const active = pathMatches(
              pathname,
              tab.href,
              "exact" in tab && tab.exact
            );
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", active && "text-primary")} />
                {tab.label}
                {active && (
                  <span className="absolute bottom-1 h-0.5 w-4 rounded-full bg-premium" />
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
              moreOpen ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Menu className={cn("w-5 h-5", moreOpen && "text-primary")} />
            More
            {moreOpen && (
              <span className="absolute bottom-1 h-0.5 w-4 rounded-full bg-premium" />
            )}
          </button>
        </div>
      </nav>
      <MobileMoreDrawer open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
