"use client";

import { Suspense } from "react";
import AmcDeskPage from "@/app/admin/products/rancelab/amc/amc-desk";

/**
 * Canonical AMC entry — Commercial nav target.
 * Desk remains shared with product route until full multi-product desks land.
 */
export default function AmcPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading AMC desk…
        </div>
      }
    >
      <AmcDeskPage />
    </Suspense>
  );
}
