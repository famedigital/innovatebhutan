"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { navigationConfig } from "@/lib/config/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  clients: "Clients",
  tickets: "Tickets",
  projects: "Projects",
  orders: "Orders",
  amc: "AMC",
  invoice: "Invoices",
  invoices: "Invoices",
  expenses: "Expenses",
  transactions: "Ledger",
  accounts: "Accounts",
  finance: "Finance",
  reports: "Reports",
  inventory: "Inventory",
  procurement: "Procurement",
  assets: "Assets",
  employees: "Employees",
  attendance: "Attendance",
  hr: "Payroll",
  services: "Services",
  products: "Products",
  rancelab: "RanceLab",
  "pelbu-pos": "Pelbu POS",
  website: "Website",
  cctv: "CCTV",
  networking: "Networking",
  users: "Users & Roles",
  settings: "Settings",
  audit: "Audit Logs",
  notifications: "Notifications",
  whatsapp: "WhatsApp",
  blog: "Blog",
  media: "Media",
  marketing: "Marketing",
  ai: "AI",
  "bot-training": "Bot Training",
  "invoice-design": "Invoice design",
  support: "Support",
};

function labelForSegment(segment: string, hrefSoFar: string): string {
  const navItems = navigationConfig.flatMap((g) => g.items);
  const exact = navItems.find((item) => {
    const clean = item.href.split("?")[0].replace(/\/$/, "");
    return clean === hrefSoFar;
  });
  if (exact) return exact.title;

  if (SEGMENT_LABELS[segment]) return SEGMENT_LABELS[segment];

  // uuid / numeric ids → "Detail"
  if (/^\d+$/.test(segment) || /^[0-9a-f-]{8,}$/i.test(segment)) {
    return "Detail";
  }

  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();

  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return [];

    const items: { label: string; href: string }[] = [];
    let acc = "";
    for (const part of parts) {
      acc += `/${part}`;
      items.push({
        label: labelForSegment(part, acc),
        href: acc,
      });
    }
    return items;
  }, [pathname]);

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap overflow-hidden">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={crumb.href}>
              {i > 0 ? <BreadcrumbSeparator className="shrink-0" /> : null}
              <BreadcrumbItem className="min-w-0">
                {isLast ? (
                  <BreadcrumbPage className="truncate font-medium">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="truncate">
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
