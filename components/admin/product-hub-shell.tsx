"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  FileText,
  Ticket,
  ShieldCheck,
  GraduationCap,
  Wrench,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  getProduct,
  type ProductKey,
  type ProductBillingType,
} from "@/lib/config/products";

const BILLING_LABEL: Record<ProductBillingType, string> = {
  amc: "AMC",
  one_time: "One-time",
  training: "Training",
  development: "Development",
};

export function ProductHubShell({ productKey }: { productKey: ProductKey }) {
  const product = getProduct(productKey);
  if (!product) {
    return (
      <p className="text-sm text-muted-foreground">Unknown product.</p>
    );
  }

  const links = [
    ...(product.supportsAmc
      ? [
          {
            href: `/admin/amc?productKey=${product.key}`,
            title: "AMC contracts",
            description: "All contracts, renewals, quotations",
            icon: ShieldCheck,
          },
          {
            href: `/admin/amc?productKey=${product.key}&owner=today`,
            title: "Today’s renewals",
            description: "Expiring within 30 days / unclaimed",
            icon: CalendarClock,
          },
        ]
      : []),
    {
      href: `/admin/tickets?productKey=${product.key}`,
      title: "Tickets",
      description: `Support desk for ${product.shortName}`,
      icon: Ticket,
    },
    {
      href: `/admin/invoice?productKey=${product.key}`,
      title: "Invoices & fees",
      description: "AMC, training, development, one-time fees",
      icon: FileText,
    },
    {
      href: "/admin/clients",
      title: "Clients",
      description: "Ownership and WhatsApp groups",
      icon: Building2,
    },
    {
      href: `/admin/products/${product.key === "pelbu_pos" ? "pelbu-pos" : product.key === "networking" ? "networking" : product.key}/invoice-design`,
      title: "Invoice design",
      description: "Letterhead and numbering",
      icon: Wrench,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title={product.name}
        description={product.description}
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products", href: "/admin/products" },
          { label: product.shortName },
        ]}
        actions={
          product.supportsAmc ? (
            <Button asChild>
              <Link href={`/admin/amc?productKey=${product.key}`}>
                Open AMC contracts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        {product.billingTypes.map((t) => (
          <Badge key={t} variant="outline" className="gap-1 font-normal">
            {t === "training" ? (
              <GraduationCap className="h-3 w-3" />
            ) : null}
            {BILLING_LABEL[t]}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((item) => {
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
                  <span className="text-xs text-muted-foreground group-hover:text-foreground">
                    Open →
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
