"use client";

import { Suspense } from "react";
import AmcDeskPage from "./amc-desk";

export default function RanceLabAmcPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
          Loading AMC desk…
        </div>
      }
    >
      <AmcDeskPage defaultProductKey="rancelab" />
    </Suspense>
  );
}
