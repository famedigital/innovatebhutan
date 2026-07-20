"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="md:hidden flex h-[85vh] max-h-[85vh] flex-col gap-0 rounded-t-xl p-0"
      >
        <SheetHeader className="shrink-0 border-b px-4 py-3 text-left">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>All admin modules</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="space-y-4">
            {filteredNav.map((group, index) => (
              <div key={group.title}>
                <p className="mb-1.5 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </p>
                <div className="flex flex-col">
                  {group.items.map((item) => {
                    const target = item.href.replace(/\/$/, "") || "/";
                    const active =
                      cleanPath === target ||
                      (target !== "/admin" &&
                        cleanPath.startsWith(target + "/")) ||
                      (target === "/admin" && cleanPath === "/admin");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm",
                          active
                            ? "bg-accent font-medium text-accent-foreground"
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
                      </Link>
                    );
                  })}
                </div>
                {index < filteredNav.length - 1 ? (
                  <Separator className="mt-3" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
