"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, User, Settings, Search, ChevronRight, LogOut, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
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
      const { data: { user: authUser } } = await supabase.auth.getUser();
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
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Innovate Org</span>
              <ChevronRight size={14} />
              <span className="font-medium">ERP Project</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs">Search...</span>
              <div className="flex items-center gap-1 ml-2">
                <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-background rounded border text-[10px]">K</kbd>
              </div>
            </button>

            <Button variant="ghost" size="icon">
              <Bell size={18} />
            </Button>
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 h-auto rounded-full">
                  <div className="w-8 h-8 rounded-full bg-[#3ECF8E] flex items-center justify-center">
                    {loading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.email?.split('@')[0] || 'Admin'}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email || 'admin@innovates.bt'}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => alert('Profile page coming soon!')}>
                  <User className="w-4 h-4 mr-2" />
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => router.push('/admin/settings')}>
                  <Key className="w-4 h-4 mr-2" />
                  API Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => alert('Preferences page coming soon!')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
            <div className="absolute inset-0 bg-black/20" onClick={() => setSearchOpen(false)} />
            <div className="relative w-full max-w-lg bg-background rounded-xl shadow-2xl overflow-hidden border">
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search anything..."
                  className="border-none focus:ring-0 text-sm"
                  autoFocus
                />
                <kbd className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">ESC</kbd>
              </div>
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-3 py-2">Quick searches</p>
                <button onClick={() => { setSearchOpen(false); router.push('/admin/clients'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left">
                  <span className="text-sm">Go to Clients</span>
                </button>
                <button onClick={() => { setSearchOpen(false); router.push('/admin/tickets'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left">
                  <span className="text-sm">Go to Tickets</span>
                </button>
                <button onClick={() => { setSearchOpen(false); router.push('/admin/settings'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left">
                  <span className="text-sm">View Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-8 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
