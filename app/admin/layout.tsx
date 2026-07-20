"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/utils/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkUser();

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
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="min-h-svh">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 sm:px-6 bg-background z-20 sticky top-0">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <SidebarTrigger className="-ml-1 hidden md:inline-flex" />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">Innovates ERP</span>
              <span className="text-[10px] text-muted-foreground md:hidden">
                Mobile desk · open on desktop for detail
              </span>
              <span className="hidden md:inline text-xs text-muted-foreground">
                Admin · full detail workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:block">
              <InstallAppButton size="sm" variant="ghost" />
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-muted rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Search...</span>
            </button>

            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" asChild>
              <a href="/admin/notifications/">
                <Bell size={18} />
              </a>
            </Button>
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 h-auto rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    {loading ? (
                      <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                    ) : (
                      <User className="w-4 h-4 text-primary-foreground" />
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
                    <span className="text-xs text-muted-foreground font-normal">
                      {user?.email || "admin@innovates.bt"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 sm:hidden">
                  <InstallAppButton fullWidth size="sm" />
                </div>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/admin/settings")}
                >
                  <Key className="w-4 h-4 mr-2" />
                  API Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/admin/notifications")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <div className="absolute inset-0 bg-black/20" onClick={() => setSearchOpen(false)} />
            <div className="relative w-full max-w-lg bg-background rounded-xl shadow-2xl overflow-hidden border">
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search clients, tickets, AMC..."
                  className="border-none focus-visible:ring-0 text-sm"
                  autoFocus
                />
              </div>
              <div className="p-2 grid grid-cols-2 gap-1">
                {[
                  { label: "RanceLab", href: "/admin/products/rancelab" },
                  { label: "AMC", href: "/admin/products/rancelab/amc" },
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
                    className="flex items-center px-3 py-3 rounded-lg hover:bg-muted text-left text-sm font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-background pb-24 md:pb-8">
          {children}
        </main>

        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
