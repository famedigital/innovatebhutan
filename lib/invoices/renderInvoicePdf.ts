import { formatAmcDisplayDate } from "@/lib/amc/renewal";
import type { InvoiceTemplateDesign } from "@/lib/invoices/templateDefaults";
import { DEFAULT_RANCELAB_DESIGN } from "@/lib/invoices/templateDefaults";

export type InvoicePdfLine = {
  description: string;
  quantity: number;
  rate: number;
};

export type InvoicePdfInput = {
  design?: Partial<InvoiceTemplateDesign> | null;
  clientName: string;
  clientAddress?: string;
  contractNumber?: string;
  invoiceNumber?: string;
  issueDate?: string | Date;
  dueDate?: string | Date;
  lines: InvoicePdfLine[];
  /** If set, builds a single AMC-style description period line */
  periodLabel?: string;
};

function mergeDesign(
  partial?: Partial<InvoiceTemplateDesign> | null
): InvoiceTemplateDesign {
  return { ...DEFAULT_RANCELAB_DESIGN, ...(partial || {}) };
}

/** Browser-only jsPDF renderer driven by invoice template design */
export async function renderInvoicePdf(input: InvoicePdfInput): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("PDF generation is only available in the browser");
  }

  const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js");
  const design = mergeDesign(input.design);
  const gstRate = design.gstRate ?? 0.05;

  const taxable = Math.round(
    input.lines.reduce((s, l) => s + l.quantity * l.rate, 0) * 100
  ) / 100;
  const gst = Math.round(taxable * gstRate * 100) / 100;
  const total = Math.round((taxable + gst) * 100) / 100;

  const issue = input.issueDate
    ? formatAmcDisplayDate(input.issueDate)
    : formatAmcDisplayDate(new Date());
  const due = input.dueDate ? formatAmcDisplayDate(input.dueDate) : issue;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(design.accentColor || "#0A5F4E");
  doc.text(design.companyName, margin, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  y += 14;
  const addr = doc.splitTextToSize(design.companyAddress, 280);
  doc.text(addr, margin, y);
  y += addr.length * 11;
  if (design.companyPhone) {
    doc.text(`Tel: ${design.companyPhone}`, margin, y);
    y += 12;
  }
  if (design.gstTin) {
    doc.text(`GST/TIN: ${design.gstTin}`, margin, y);
    y += 12;
  }

  y = Math.max(y, margin + 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(design.documentTitle || "Quotation", 350, margin);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (input.invoiceNumber) {
    doc.text(`No: ${input.invoiceNumber}`, 350, margin + 18);
  }
  doc.text(`Date: ${issue}`, 350, margin + 32);
  doc.text(`Due: ${due}`, 350, margin + 46);

  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(input.clientName, margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (input.clientAddress) {
    doc.text(`Address: ${input.clientAddress}`, margin, y);
    y += 14;
  }
  if (input.contractNumber) {
    doc.text(input.contractNumber, margin, y);
    y += 14;
  }
  y += 10;

  if (design.dealerNotice) {
    doc.setFont("helvetica", "bold");
    doc.text("Important Notice", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    const notice = doc.splitTextToSize(design.dealerNotice, 500);
    doc.text(notice, margin, y);
    y += notice.length * 12 + 16;
  }

  doc.setFont("helvetica", "bold");
  doc.text("Description", margin, y);
  doc.text("Qty", 320, y);
  doc.text("Rate", 370, y);
  doc.text("Amount", 440, y);
  doc.text("GST", 510, y);
  y += 16;
  doc.setFont("helvetica", "normal");

  for (const line of input.lines) {
    const amount = Math.round(line.quantity * line.rate * 100) / 100;
    const lineGst = Math.round(amount * gstRate * 100) / 100;
    const desc = doc.splitTextToSize(line.description, 250);
    doc.text(desc, margin, y);
    doc.text(String(line.quantity), 320, y);
    doc.text(line.rate.toFixed(2), 370, y);
    doc.text(amount.toFixed(2), 440, y);
    doc.text(lineGst.toFixed(2), 510, y);
    y += Math.max(desc.length * 12, 16) + 8;
    if (y > 720) {
      doc.addPage();
      y = margin;
    }
  }

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text(`Taxable Amount : ${taxable.toFixed(2)}`, margin, y);
  y += 14;
  doc.text(`GST (${(gstRate * 100).toFixed(0)}%): ${gst.toFixed(2)}`, margin, y);
  y += 14;
  doc.text(`Total Invoice Value : ${total.toFixed(2)}`, margin, y);
  y += 20;

  if (design.paymentTerms) {
    doc.setFont("helvetica", "bold");
    doc.text("Payment", margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    const pay = doc.splitTextToSize(design.paymentTerms, 500);
    doc.text(pay, margin, y);
    y += pay.length * 12 + 12;
  }

  doc.setFont("helvetica", "bold");
  doc.text("Terms and Conditions", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  for (const t of design.termsAndConditions || []) {
    const lines = doc.splitTextToSize(`• ${t}`, 500);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 4;
    if (y > 760) {
      doc.addPage();
      y = margin;
    }
  }

  if (design.footerNote) {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(design.footerNote, margin, y);
  }

  return doc.output("blob");
}

/** Compatibility wrapper for AMC quotation desk */
export async function buildAmcQuotationPdf(input: {
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
}): Promise<Blob> {
  const period = `${formatAmcDisplayDate(input.startDate)} to ${formatAmcDisplayDate(input.endDate)}`;
  return renderInvoicePdf({
    design: input.design,
    clientName: input.clientName,
    clientAddress: input.clientAddress,
    contractNumber: input.contractNumber,
    invoiceNumber: input.invoiceNumber,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    periodLabel: period,
    lines: [
      {
        description: `Rancelab Yearly A.M.C\n${period} Location : ${input.clientName}`,
        quantity: 1,
        rate: input.amount,
      },
    ],
  });
}
