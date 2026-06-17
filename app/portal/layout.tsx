"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageCircle, Ticket, ShoppingCart, User, Settings, LogOut, Loader2, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login?redirect=/portal');
        return;
      }

      // Check if user has CLIENT role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('userId', session.user.id)
        .single();

      if (!profile || (profile.role !== 'CLIENT' && profile.role !== 'ADMIN' && profile.role !== 'STAFF')) {
        router.push('/');
        return;
      }

      setUser(session.user);
    } catch (err) {
      console.error("Error:", err);
      router.push('/login?redirect=/portal');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/portal",
      icon: Home,
    },
    {
      name: "Live Chat",
      href: "/portal/chat",
      icon: MessageCircle,
      badge: "Online",
    },
    {
      name: "Support Tickets",
      href: "/portal/tickets",
      icon: Ticket,
    },
    {
      name: "My Orders",
      href: "/portal/orders",
      icon: ShoppingCart,
    },
    {
      name: "Settings",
      href: "/portal/settings",
      icon: Settings,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu trigger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">IB</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline-block">Innovate Bhutan</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-[10px] font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* User avatar */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="text-xs">
                <div className="font-medium">{user?.email?.split('@')[0] || 'Client'}</div>
                <div className="text-muted-foreground">Client Portal</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-3 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="container py-6 md:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Innovate Bhutan. All rights reserved.</p>
          <p className="mt-1">Client Portal - Secure support & communication hub</p>
        </div>
      </footer>
    </div>
  );
}
