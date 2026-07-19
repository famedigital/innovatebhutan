import { InvoiceDesignEditor } from "@/components/admin/invoice-design-editor";

export default function WebsiteInvoiceDesignPage() {
  return (
    <InvoiceDesignEditor
      productKey="website"
      title="Website invoice design"
      description="Letterhead for Website product invoices. Same designer as RanceLab."
    />
  );
}
