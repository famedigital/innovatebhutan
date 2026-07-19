"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Ticket,
  Building2,
  CalendarClock,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

const LINKS = [
  {
    href: "/admin/products/rancelab/amc?owner=today",
    title: "Today’s renewals",
    description: "Your expiring/expired contracts first, then unclaimed",
    icon: CalendarClock,
  },
  {
    href: "/admin/products/rancelab/amc",
    title: "AMC contracts",
    description: "Full RanceLab AMC desk — renew in one modal",
    icon: ShieldCheck,
  },
  {
    href: "/admin/products/rancelab/tickets",
    title: "Tickets",
    description: "Call-centre desk for RanceLab clients",
    icon: Ticket,
  },
  {
    href: "/admin/products/rancelab/invoice-design",
    title: "Invoice design",
    description: "Letterhead, numbering, GST — used by quotations & invoices",
    icon: FileText,
  },
  {
    href: "/admin/clients",
    title: "Clients",
    description: "Assign focal staff and WhatsApp groups",
    icon: Building2,
  },
  {
    href: "/admin/invoice",
    title: "Master invoices",
    description: "All product invoices (quotations roll up here)",
    icon: FileText,
  },
];

export default function RanceLabHubPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="RanceLab"
        description="Product desk — AMC renewals, tickets, and client ownership"
        actions={
          <Button asChild>
            <Link href="/admin/products/rancelab/amc?owner=today">
              Open today’s work
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full shadow-none transition-colors group-hover:border-premium/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-xs font-medium text-primary underline-offset-2 group-hover:underline">
                    Open
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Website and CCTV product desks will use the same pattern later. Finance stays on master
        Invoices.
      </p>
    </div>
  );
}
