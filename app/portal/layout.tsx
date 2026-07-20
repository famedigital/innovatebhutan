"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  Ticket,
  Shield,
  LogOut,
  Loader2,
  Home,
  Menu,
  X,
  MessageCircle,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/portal", icon: Home },
  { name: "Projects", href: "/portal/projects", icon: Briefcase },
  { name: "Invoices", href: "/portal/invoices", icon: FileText },
  { name: "Tickets", href: "/portal/tickets", icon: Ticket },
  { name: "AMC", href: "/portal/amc", icon: Shield },
  { name: "Chat", href: "/portal/chat", icon: MessageCircle },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const isAccept = pathname?.startsWith("/portal/accept");

  useEffect(() => {
    if (isAccept) {
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login?redirect=/portal");
          return;
        }
        const res = await fetch("/api/portal/me");
        if (!res.ok) {
          router.push("/login?redirect=/portal");
          return;
        }
        setUser(session.user);
      } catch {
        router.push("/login?redirect=/portal");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAccept, router, supabase.auth]);

  if (isAccept) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/portal" className="font-semibold tracking-tight">
              Innovate Bhutan
            </Link>
            <nav className="ml-4 hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/portal" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="max-w-[140px] truncate text-xs text-muted-foreground">
                {user?.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="grid grid-cols-3 gap-2 border-t px-4 py-3 md:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col items-center gap-1 rounded-lg py-2 text-xs text-muted-foreground hover:bg-accent"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
