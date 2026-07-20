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
    <div className="mx-auto max-w-6xl space-y-6">
      <AdminPageHeader
        title="Products"
        description="Shared AMC, tickets, invoices, and fees across every product line"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_CATALOG.map((product) => (
          <Link key={product.key} href={product.href} className="group">
            <Card className="h-full min-h-[9.5rem] shadow-none transition-colors group-hover:border-primary/40">
              <CardHeader className="h-full">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Boxes className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">{product.name}</span>
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 shrink-0" />
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
                <div className="mt-auto flex flex-wrap gap-1 pt-3">
                  {product.billingTypes.map((t) => (
                    <Badge
                      key={t}
                      variant="secondary"
                      className="text-[10px] font-normal"
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
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
