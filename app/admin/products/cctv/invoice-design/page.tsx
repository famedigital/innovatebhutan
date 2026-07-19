import { InvoiceDesignEditor } from "@/components/admin/invoice-design-editor";

export default function CctvInvoiceDesignPage() {
  return (
    <InvoiceDesignEditor
      productKey="cctv"
      title="CCTV invoice design"
      description="Letterhead for CCTV product invoices."
    />
  );
}
