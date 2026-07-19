"use client";

import { Suspense } from "react";
import InvoicePageClient from "./invoice-page";

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading invoices…
        </div>
      }
    >
      <InvoicePageClient />
    </Suspense>
  );
}
