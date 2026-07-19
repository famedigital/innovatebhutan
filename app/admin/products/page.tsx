import Link from "next/link";
import { ArrowRight, Boxes } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PRODUCT_CATALOG } from "@/lib/config/products";

export default function ProductsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AdminPageHeader
        title="Products"
        description="Shared AMC, tickets, invoices, and fees across every product line"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Products" },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_CATALOG.map((product) => (
          <Link key={product.key} href={product.href} className="group">
            <Card className="h-full shadow-none transition-colors group-hover:border-premium/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Boxes className="h-4 w-4 text-primary" />
                  {product.name}
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <div className="flex flex-wrap gap-1 pt-2">
                  {product.billingTypes.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[10px] font-normal"
                    >
                      {t.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
