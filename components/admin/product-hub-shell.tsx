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
    <div className="w-full max-w-none space-y-6 lg:space-y-8">
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
            <Button asChild variant="ghost" className="hidden lg:inline-flex">
              <Link href="/admin/products/">All products</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="rounded-xl border bg-muted/20 p-5 sm:p-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
          <p className="mt-4 max-w-xl text-sm text-muted-foreground">
            This hub routes into shared ERP desks filtered by{" "}
            <span className="font-medium text-foreground">
              {product.shortName}
            </span>
            . Use AMC for renewals, Tickets for support, and Invoices for fees.
          </p>
        </div>

        <div className="hidden rounded-xl border bg-card p-5 sm:p-6 lg:block">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Quick open
          </p>
          <div className="flex flex-col gap-2">
            {links.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-sm transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <Icon className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {item.title}
                  </span>
                  <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="border-b bg-muted/30 px-4 py-3 sm:px-5">
          <h3 className="text-sm font-semibold">Desks</h3>
          <p className="text-xs text-muted-foreground">
            Product-scoped entry points for day-to-day work
          </p>
        </div>
        <div className="grid divide-y sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group border-border p-4 transition-colors hover:bg-muted/40 sm:border-b sm:border-r sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border ${
                      item.primary
                        ? "border-primary/30 bg-primary/10"
                        : "bg-background"
                    }`}
                  >
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                      Open
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
