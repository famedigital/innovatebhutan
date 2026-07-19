"use client";

import { InvoiceDesignEditor } from "@/components/admin/invoice-design-editor";

export default function PelbuInvoiceDesignPage() {
  return (
    <InvoiceDesignEditor
      productKey="pelbu_pos"
      title="Pelbu POS invoice design"
    />
  );
}
