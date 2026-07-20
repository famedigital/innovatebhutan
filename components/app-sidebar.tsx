"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserProfile } from "@/hooks/use-user-profile";
import { navigationConfig } from "@/lib/config/navigation";

function pathActive(pathname: string, href: string) {
  const clean = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (target === "/admin") return clean === "/admin";
  return clean === target || clean.startsWith(`${target}/`);
}

/**
 * Standard shadcn sidebar (collapsible icon + rail), wired to ERP nav.
 * @see https://ui.shadcn.com/docs/components/sidebar
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { profile, loading } = useUserProfile();
  const { isMobile, setOpenMobile } = useSidebar();
  const userRole = profile?.role || "CLIENT";

  const filteredNav = React.useMemo(
    () =>
      navigationConfig
        .filter((group) => !group.roles || group.roles.includes(userRole))
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) => !item.roles || item.roles.includes(userRole)
          ),
        }))
        .filter((group) => group.items.length > 0),
    [userRole]
  );

  const closeMobile = React.useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin" onClick={closeMobile}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">innovates.bt</span>
                  <span className="truncate text-xs">ERP Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {filteredNav.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathActive(pathname, item.href)}
                      tooltip={item.title}
                    >
                      <Link href={item.href} onClick={closeMobile} prefetch>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="bg-sidebar-accent flex aspect-square size-8 items-center justify-center rounded-lg">
                <span className="text-sm font-medium">
                  {profile?.fullName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {loading ? "…" : profile?.fullName || "User"}
                </span>
                <span className="truncate text-xs">
                  {loading ? "…" : profile?.role || "—"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
