import { AMC_GST_RATE, formatAmcDisplayDate } from "@/lib/amc/renewal";
import { buildAmcQuotationPdf as renderFromTemplate } from "@/lib/invoices/renderInvoicePdf";
import type { InvoiceTemplateDesign } from "@/lib/invoices/templateDefaults";

export type QuotationPdfInput = {
  clientName: string;
  clientAddress?: string;
  contractNumber?: string;
  invoiceNumber?: string;
  issueDate?: string | Date;
  dueDate?: string | Date;
  startDate: string;
  endDate: string;
  amount: number;
  design?: Partial<InvoiceTemplateDesign> | null;
};

/** Build RanceLab AMC quotation PDF from active/design template */
export async function buildAmcQuotationPdf(input: QuotationPdfInput): Promise<Blob> {
  return renderFromTemplate(input);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildWhatsAppQuotationUrl(params: {
  phoneOrGroupLink?: string | null;
  groupLink?: string | null;
  clientName: string;
  amount: number;
  startDate: string;
  endDate: string;
  pdfUrl?: string | null;
}): string | null {
  const taxable = params.amount;
  const total = Math.round(taxable * (1 + AMC_GST_RATE) * 100) / 100;
  const period = `${formatAmcDisplayDate(params.startDate)} to ${formatAmcDisplayDate(params.endDate)}`;
  const text = [
    `Dear ${params.clientName},`,
    ``,
    `Please find the RanceLab Yearly AMC quotation for ${period}.`,
    `Amount (incl. 5% GST): Nu. ${total.toLocaleString()}`,
    params.pdfUrl ? `Quotation PDF: ${params.pdfUrl}` : null,
    ``,
    `Payment via M-BoB or Cheque only (no cash).`,
    `— Innovates`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  if (params.groupLink) return params.groupLink;
  const phone = (params.phoneOrGroupLink || "").replace(/\D/g, "");
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
