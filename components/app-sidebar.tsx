"use client";

import * as React from "react";
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
} from "@/components/ui/sidebar";
import { useUserProfile } from "@/hooks/use-user-profile";
import { navigationConfig, type NavGroup } from "@/lib/config/navigation";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

export function AppSidebar() {
  const { profile, loading } = useUserProfile();
  const userRole = profile?.role || "CLIENT";
  const pathname = usePathname();

  // Filter navigation based on user role
  const filteredNav = navigationConfig
    .filter((group) => {
      if (!group.roles) return true;
      return group.roles.includes(userRole);
    })
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(userRole);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#3ECF8E]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Innovate ERP
          </span>
        </div>
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
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <a href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs">{item.badge}</span>
                        )}
                      </a>
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3ECF8E]">
                <span className="text-sm font-medium text-white">
                  {profile?.fullName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {profile?.fullName || loading ? "Loading..." : "User"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profile?.role || loading ? "..." : "CLIENT"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
