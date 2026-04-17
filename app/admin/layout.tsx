"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSidebar } from "@/components/app-sidebar";
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
    <div className="flex h-screen w-full bg-[#F9F9F7] dark:bg-black">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#E5E5E1] dark:border-[#2A2A2A] px-6 bg-white dark:bg-[#0A0A0A] z-20 sticky top-0">
          <div className="flex items-center gap-2 text-sm text-[#717171] dark:text-[#A3A3A3]">
            <span className="font-medium">Innovate Org</span>
            <ChevronRight size={14} />
            <span className="font-medium">ERP Project</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#F3F3F1] dark:bg-[#1A1A1A] rounded-lg text-sm text-[#717171] dark:text-[#A3A3A3] hover:bg-[#E5E5E1] dark:hover:bg-[#2A2A2A] transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs">Search...</span>
              <div className="flex items-center gap-1 ml-2">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2A2A2A] rounded border border-[#E5E5E1] dark:border-[#3A3A3A] text-[10px]">⌘</kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#2A2A2A] rounded border border-[#E5E5E1] dark:border-[#3A3A3A] text-[10px]">K</kbd>
              </div>
            </button>

            <Button variant="ghost" size="icon" className="text-[#717171] hover:text-black">
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
              <DropdownMenuContent align="end" className="w-56 bg-white border-[#E5E5E1]">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.email?.split('@')[0] || 'Admin'}</span>
                    <span className="text-xs text-[#717171] font-normal">{user?.email || 'admin@innovates.bt'}</span>
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
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-[#E5E5E1]">
                <Search className="w-5 h-5 text-[#717171]" />
                <Input 
                  placeholder="Search anything..." 
                  className="border-none focus:ring-0 text-sm"
                  autoFocus
                />
                <kbd className="px-2 py-1 bg-[#F3F3F1] rounded text-xs text-[#717171]">ESC</kbd>
              </div>
              <div className="p-2">
                <p className="text-xs text-[#717171] dark:text-[#A3A3A3] px-3 py-2">Quick searches</p>
                <button onClick={() => { setSearchOpen(false); router.push('/admin/clients'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F3F3F1] dark:hover:bg-[#1A1A1A] text-left">
                  <span className="text-sm">Go to Clients</span>
                </button>
                <button onClick={() => { setSearchOpen(false); router.push('/admin/tickets'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F3F3F1] dark:hover:bg-[#1A1A1A] text-left">
                  <span className="text-sm">Go to Tickets</span>
                </button>
                <button onClick={() => { setSearchOpen(false); router.push('/admin/settings'); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F3F3F1] dark:hover:bg-[#1A1A1A] text-left">
                  <span className="text-sm">View Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-8 bg-[#F9F9F7] dark:bg-black">
          {children}
        </main>
      </div>
    </div>
  );
}