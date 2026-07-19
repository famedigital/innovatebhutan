import { AMC_GST_RATE, formatAmcDisplayDate } from "@/lib/amc/renewal";

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
};

/** Build RanceLab AMC quotation PDF (browser-only; dynamic jspdf import avoids SSR/Turbopack node worker) */
export async function buildAmcQuotationPdf(input: QuotationPdfInput): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("PDF generation is only available in the browser");
  }

  // Dynamic import of browser build — never resolve jspdf.node (fflate Worker breaks Turbopack SSR)
  const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js");

  const taxable = Math.round(input.amount * 100) / 100;
  const gst = Math.round(taxable * AMC_GST_RATE * 100) / 100;
  const total = Math.round((taxable + gst) * 100) / 100;
  const period = `${formatAmcDisplayDate(input.startDate)} to ${formatAmcDisplayDate(input.endDate)}`;
  const issue = input.issueDate
    ? formatAmcDisplayDate(input.issueDate)
    : formatAmcDisplayDate(new Date());
  const due = input.dueDate ? formatAmcDisplayDate(input.dueDate) : issue;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Quotation", margin, y);
  y += 28;

  doc.setFontSize(14);
  doc.text(input.clientName, margin, y);
  y += 18;
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
  doc.text(`Date Of Quotation: ${issue}`, margin, y);
  y += 14;
  doc.text(`Due Date: ${due}`, margin, y);
  if (input.invoiceNumber) {
    y += 14;
    doc.text(`Ref: ${input.invoiceNumber}`, margin, y);
  }
  y += 22;

  doc.setFont("helvetica", "bold");
  doc.text("Important Notice", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  const notice = doc.splitTextToSize(
    "Innovates is an Authorized Dealer to sell and support Rancelab Software Products in the territory of Kingdom of Bhutan.",
    500
  );
  doc.text(notice, margin, y);
  y += notice.length * 12 + 16;

  doc.setFont("helvetica", "bold");
  doc.text("Description", margin, y);
  doc.text("Qty", 320, y);
  doc.text("Rate", 370, y);
  doc.text("Amount", 440, y);
  doc.text("GST", 510, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  const desc = doc.splitTextToSize(
    `Rancelab Yearly A.M.C\n${period} Location : ${input.clientName}`,
    250
  );
  doc.text(desc, margin, y);
  doc.text("1", 320, y);
  doc.text(taxable.toFixed(2), 370, y);
  doc.text(taxable.toFixed(2), 440, y);
  doc.text(gst.toFixed(2), 510, y);
  y += Math.max(desc.length * 12, 16) + 20;

  doc.setFont("helvetica", "bold");
  doc.text(`Taxable Amount : ${taxable.toFixed(2)}`, margin, y);
  y += 14;
  doc.text(`GST Amount: ${gst.toFixed(2)}`, margin, y);
  y += 14;
  doc.text(`Total Invoice Value : ${total.toFixed(2)}`, margin, y);
  y += 24;

  doc.setFont("helvetica", "bold");
  doc.text("Terms and Conditions", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  const terms = [
    "The AMC agreement must be renewed and signed every year.",
    "Payment of the AMC will be considered as acceptance of the AMC terms and conditions.",
    "Failure to renew or pay the AMC before the expiry date will result in automatic disconnection or suspension of the software services.",
    "Work is Executed on Non-Refundable Basis.",
    "We Do Not Accept Cash — only M-BoB or Cheque Issued in Favor of Innovates.",
    "All AMC payments once made are non-refundable under any circumstances.",
    "SUBJECT TO THIMPHU JURISDICTION",
  ];
  for (const t of terms) {
    const lines = doc.splitTextToSize(`• ${t}`, 500);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 4;
    if (y > 760) {
      doc.addPage();
      y = margin;
    }
  }

  return doc.output("blob");
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

  if (params.groupLink) {
    // Group invite links open the group; staff pastes message + attaches PDF
    return params.groupLink;
  }
  const phone = (params.phoneOrGroupLink || "").replace(/\D/g, "");
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
