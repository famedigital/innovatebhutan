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

const SLUG: Partial<Record<ProductKey, string>> = {
  pelbu_pos: "pelbu-pos",
};

function productSlug(key: ProductKey) {
  return SLUG[key] || key;
}

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
            href: `/admin/amc/?productKey=${product.key}`,
            title: "AMC contracts",
            description: "All contracts, renewals, quotations, remittance",
            icon: ShieldCheck,
            primary: true,
          },
          {
            href: `/admin/amc/?productKey=${product.key}&owner=today`,
            title: "Today’s renewals",
            description: "Expiring within 30 days / unclaimed work",
            icon: CalendarClock,
            primary: false,
          },
        ]
      : []),
    {
      href: `/admin/tickets/?productKey=${product.key}`,
      title: "Tickets",
      description: `Support desk for ${product.shortName}`,
      icon: Ticket,
      primary: false,
    },
    {
      href: `/admin/invoice/?productKey=${product.key}`,
      title: "Invoices & fees",
      description: "AMC, training, development, one-time fees",
      icon: FileText,
      primary: false,
    },
    {
      href: "/admin/clients/",
      title: "Clients",
      description: "Ownership and WhatsApp groups",
      icon: Building2,
      primary: false,
    },
    {
      href: `/admin/products/${productSlug(product.key)}/invoice-design/`,
      title: "Invoice design",
      description: "Letterhead and numbering",
      icon: Wrench,
      primary: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title={product.name}
        description={product.description}
        actions={
          <div className="flex flex-wrap gap-2">
            {product.supportsAmc ? (
              <Button asChild>
                <Link href={`/admin/amc/?productKey=${product.key}`}>
                  Open AMC
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={`/admin/tickets/?productKey=${product.key}`}>
                Tickets
              </Link>
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border bg-muted/30 p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          Billing types
        </p>
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
        <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
          This hub routes into shared ERP desks filtered by{" "}
          <span className="font-medium text-foreground">{product.shortName}</span>.
          Use AMC for renewals, Tickets for support, and Invoices for fees.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card
                className={`h-full shadow-none transition-colors group-hover:border-primary/40 ${
                  item.primary ? "border-primary/25 bg-primary/5" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
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
