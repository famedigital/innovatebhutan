"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUserProfile } from "@/hooks/use-user-profile";
import { navigationConfig } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileMoreDrawer({ open, onOpenChange }: Props) {
  const pathname = usePathname();
  const { profile } = useUserProfile();
  const userRole = profile?.role || "CLIENT";

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

  const cleanPath = pathname.replace(/\/$/, "") || "/";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="md:hidden max-h-[85vh] pb-[env(safe-area-inset-bottom)]">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerDescription>All admin modules</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="max-h-[65vh] px-4 pb-6">
          <div className="space-y-5">
            {filteredNav.map((group) => (
              <div key={group.title}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const target = item.href.replace(/\/$/, "") || "/";
                    const active =
                      cleanPath === target ||
                      cleanPath.startsWith(target + "/");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-accent text-foreground font-medium"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span className="flex-1">{item.title}</span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-premium" />
                        )}
                      </Link>
                    );
                  })}
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
