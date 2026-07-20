import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  Boxes,
  Camera,
  Globe,
  Network,
  Package,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  PRODUCT_CATALOG,
  type ProductDefinition,
  type ProductKey,
} from "@/lib/config/products";

const PRODUCT_ICONS: Record<
  ProductKey,
  ComponentType<{ className?: string }>
> = {
  rancelab: Shield,
  pelbu_pos: Package,
  website: Globe,
  cctv: Camera,
  networking: Network,
};

function ProductRow({ product }: { product: ProductDefinition }) {
  const Icon = PRODUCT_ICONS[product.key] || Boxes;

  return (
    <Link
      href={product.href}
      className="group flex flex-col gap-3 border-b border-border px-4 py-4 transition-colors last:border-b-0 hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-6 sm:px-5 sm:py-5"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background sm:size-11">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {product.name}
            </h2>
            {product.key === "rancelab" ? (
              <Badge variant="secondary" className="text-[10px] font-normal">
                Primary
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
            {product.description}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1 sm:hidden">
            {product.billingTypes.map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="text-[10px] font-normal capitalize"
              >
                {t.replace("_", " ")}
              </Badge>
            ))}
            {product.supportsAmc ? (
              <Badge variant="outline" className="text-[10px] font-normal">
                AMC
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="hidden min-w-0 flex-1 flex-wrap gap-1.5 md:flex">
        {product.billingTypes.map((t) => (
          <Badge
            key={t}
            variant="outline"
            className="text-[10px] font-normal capitalize"
          >
            {t.replace("_", " ")}
          </Badge>
        ))}
        {product.supportsAmc ? (
          <Badge variant="outline" className="text-[10px] font-normal">
            AMC desk
          </Badge>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end sm:pl-2">
        <span className="text-xs text-muted-foreground sm:hidden">Open hub</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
          Open
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function ProductsIndexPage() {
  const primary = PRODUCT_CATALOG.find((p) => p.key === "rancelab");

  return (
    <div className="w-full max-w-none space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="Products"
        description="Open a product hub for AMC, tickets, invoices, and fees — shared desks filtered by product line"
        actions={
          primary ? (
            <Button asChild className="hidden sm:inline-flex">
              <Link href={primary.href}>
                Open RanceLab
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          ) : null
        }
      />

      {/* Desktop featured band */}
      {primary ? (
        <section className="hidden overflow-hidden rounded-xl border bg-muted/20 md:block">
          <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-background">
                <Shield className="size-6 text-primary" />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Featured product
                </p>
                <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
                  {primary.name}
                </h2>
                <p className="max-w-xl text-sm text-muted-foreground">
                  {primary.description}. Jump straight into renewals or the
                  support desk without hunting through the sidebar.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {primary.billingTypes.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[10px] font-normal capitalize"
                    >
                      {t.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button asChild>
                <Link href={`/admin/amc/?productKey=${primary.key}`}>
                  AMC contracts
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/admin/tickets/?productKey=${primary.key}`}>
                  Tickets
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={primary.href}>
                  Full hub
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Catalog — list on all breakpoints (reads as ERP directory on desktop) */}
      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
          <div>
            <h3 className="text-sm font-semibold">All products</h3>
            <p className="text-xs text-muted-foreground">
              {PRODUCT_CATALOG.length} lines · shared AMC / tickets / invoices
            </p>
          </div>
          <Boxes className="hidden size-4 text-muted-foreground sm:block" />
        </div>
        <div>
          {PRODUCT_CATALOG.map((product) => (
            <ProductRow key={product.key} product={product} />
          ))}
        </div>
      </section>

      {/* Mobile primary CTA if featured band is hidden */}
      {primary ? (
        <div className="flex gap-2 md:hidden">
          <Button asChild className="flex-1">
            <Link href={primary.href}>Open RanceLab</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/admin/amc/?productKey=${primary.key}`}>AMC</Link>
          </Button>
        </div>
      ) : null}

      <p className="hidden text-xs text-muted-foreground lg:block">
        Tip: each hub opens the same desks with{" "}
        <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
          ?productKey=
        </code>{" "}
        applied so lists stay product-scoped.
      </p>
    </div>
  );
}
