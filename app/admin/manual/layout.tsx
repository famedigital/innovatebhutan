"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ManualSidebar } from "@/components/manual/manual-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function ManualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <SidebarProvider>
      <ManualSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              Admin
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/admin/manual" className="truncate font-medium">
              Manual
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => router.push("/admin")}
          >
            Back to ERP
          </Button>
          <ThemeToggle />
        </header>
        <div className="flex-1 px-4 py-8 sm:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
