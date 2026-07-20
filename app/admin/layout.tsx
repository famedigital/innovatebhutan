"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileBottomNav } from "@/components/admin/mobile-bottom-nav";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, User, Settings, Search, LogOut, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/utils/supabase/client";
import { AdminBreadcrumbs } from "@/components/admin/admin-breadcrumbs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Clear stuck dialog/sheet body locks that can block all clicks after nav
  useEffect(() => {
    document.body.style.pointerEvents = "";
    document.body.removeAttribute("data-scroll-locked");
    document.body.style.overflow = "";
  }, [pathname]);

  useEffect(() => {
    void checkUser();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-1 hidden h-4 sm:block"
          />
          <AdminBreadcrumbs />

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="hidden sm:block">
              <InstallAppButton size="sm" variant="ghost" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="hidden gap-2 text-muted-foreground sm:inline-flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4" />
              <span className="text-xs">Search</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href="/admin/notifications">
                <Bell className="size-4" />
              </Link>
            </Button>
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto rounded-full p-1">
                  <div className="bg-primary flex size-8 items-center justify-center rounded-full">
                    {loading ? (
                      <Loader2 className="size-4 animate-spin text-primary-foreground" />
                    ) : (
                      <User className="size-4 text-primary-foreground" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user?.email?.split("@")[0] || "Admin"}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email || "admin@innovates.bt"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 sm:hidden">
                  <InstallAppButton fullWidth size="sm" />
                </div>
                <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                  <Key className="mr-2 size-4" />
                  API Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/admin/notifications")}
                >
                  <Settings className="mr-2 size-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {searchOpen ? (
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20">
            <button
              type="button"
              className="absolute inset-0 bg-black/20"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            />
            <div className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-background shadow-lg">
              <div className="flex items-center gap-3 border-b p-4">
                <Search className="size-5 text-muted-foreground" />
                <Input
                  placeholder="Search clients, tickets, AMC..."
                  className="border-none focus-visible:ring-0"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-1 p-2">
                {[
                  { label: "RanceLab", href: "/admin/products/rancelab" },
                  { label: "AMC", href: "/admin/amc" },
                  { label: "Tickets", href: "/admin/tickets" },
                  { label: "Clients", href: "/admin/clients" },
                  { label: "Projects", href: "/admin/projects" },
                  { label: "Invoices", href: "/admin/invoice" },
                  { label: "Payroll", href: "/admin/hr" },
                ].map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(item.href);
                    }}
                    className="rounded-lg px-3 py-3 text-left text-sm font-medium hover:bg-muted"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col gap-4 p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </div>

        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
