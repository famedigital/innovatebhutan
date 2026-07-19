import { InvoiceDesignEditor } from "@/components/admin/invoice-design-editor";

export default function RanceLabInvoiceDesignPage() {
  return (
    <InvoiceDesignEditor
      productKey="rancelab"
      title="RanceLab invoice design"
      description="Form + live preview. Saving creates a new active version used by AMC quotations and invoices."
    />
  );
}
