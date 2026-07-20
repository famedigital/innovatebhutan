"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { MANUAL_GROUPS, type ManualDoc } from "@/lib/manual/catalog";
import { cn } from "@/lib/utils";

export function ManualSidebar() {
  const pathname = usePathname();
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MANUAL_GROUPS;
    return MANUAL_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query) ||
          d.slug.includes(query)
      ),
    })).filter((g) => g.items.length > 0);
  }, [q]);

  const activeSlug = pathname?.replace(/^\/admin\/manual\/?/, "") || "overview";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="gap-3 border-b p-3">
        <Link
          href="/admin/manual"
          className="flex items-center gap-2 px-1 font-semibold tracking-tight"
        >
          <div className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
            <BookOpen className="size-3.5" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden">ERP Manual</span>
        </Link>
        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="text-muted-foreground absolute left-2 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search docs…"
            className="h-8 pl-7 text-xs"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((doc) => (
                  <ManualNavItem
                    key={doc.slug}
                    doc={doc}
                    active={activeSlug === doc.slug || activeSlug === `${doc.slug}/`}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function ManualNavItem({ doc, active }: { doc: ManualDoc; active: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={doc.title}>
        <Link
          href={`/admin/manual/${doc.slug}`}
          className={cn(active && "font-medium")}
        >
          <span className="truncate">{doc.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
