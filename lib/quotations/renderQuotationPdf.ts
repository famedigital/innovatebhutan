/**
 * Client quotation PDF — browser-only jsPDF (same pattern as invoices).
 */

export type QuotationPdfItem = {
  name: string;
  brand?: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type QuotationPdfInput = {
  quotationNumber: string;
  category: string;
  businessName: string;
  customerName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  quotationFor?: string | null;
  validityDays?: number | null;
  items: QuotationPdfItem[];
  subtotal: number;
  /** GST percent */
  taxRate?: number | null;
  taxAmount?: number | null;
  totalAmount: number;
  advancePercent: number;
  advanceAmount: number;
  notes?: string | null;
  /** Public client link */
  publicUrl?: string | null;
  /** mBoB EMV payload — embedded as QR image when present */
  depositQrPayload?: string | null;
  mbobAccountNumber?: string | null;
};

function money(n: number) {
  return `Nu. ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function loadQrDataUrl(payload: string): Promise<string | null> {
  try {
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&ecc=M&data=${encodeURIComponent(payload)}`;
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || null));
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function renderQuotationPdf(input: QuotationPdfInput): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("PDF generation is only available in the browser");
  }

  const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = 595;
  let y = margin;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 181, 226);
  doc.text("INNOVATES", margin, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  y += 14;
  doc.text("Express Highway, Thimphu, Bhutan", margin, y);
  y += 12;
  doc.text("innovates.bt  ·  support via WhatsApp / email", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("QUOTATION", pageWidth - margin, margin, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(input.quotationNumber, pageWidth - margin, margin + 18, { align: "right" });
  doc.text(
    `Date: ${new Date().toLocaleDateString("en-GB")}`,
    pageWidth - margin,
    margin + 32,
    { align: "right" }
  );
  if (input.validityDays) {
    doc.text(
      `Valid: ${input.validityDays} days`,
      pageWidth - margin,
      margin + 46,
      { align: "right" }
    );
  }

  y += 28;
  doc.setDrawColor(0, 181, 226);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 22;

  // Bill to
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Bill To", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(input.businessName || "Client", margin, y);
  y += 13;
  if (input.customerName) {
    doc.text(`Attn: ${input.customerName}`, margin, y);
    y += 13;
  }
  if (input.phone) {
    doc.text(`Phone: ${input.phone}`, margin, y);
    y += 13;
  }
  if (input.email) {
    doc.text(`Email: ${input.email}`, margin, y);
    y += 13;
  }
  if (input.address) {
    const addr = doc.splitTextToSize(input.address, 280);
    doc.text(addr, margin, y);
    y += addr.length * 12;
  }
  if (input.quotationFor) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Regarding", margin, y);
    y += 13;
    doc.setFont("helvetica", "normal");
    const regarding = doc.splitTextToSize(input.quotationFor, 500);
    doc.text(regarding, margin, y);
    y += regarding.length * 12;
  }

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setFillColor(245, 248, 250);
  doc.rect(margin, y - 10, pageWidth - margin * 2, 18, "F");
  doc.text("Item", margin + 4, y);
  doc.text("Qty", 320, y);
  doc.text("Rate", 380, y);
  doc.text("Amount", pageWidth - margin, y, { align: "right" });
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  for (const item of input.items) {
    const label = item.brand ? `${item.name} (${item.brand})` : item.name;
    const desc = doc.splitTextToSize(label, 250);
    const rowH = Math.max(desc.length * 12, 14);
    if (y + rowH > 720) {
      doc.addPage();
      y = margin;
    }
    doc.text(desc, margin + 4, y);
    doc.text(String(item.quantity), 320, y);
    doc.text(Number(item.unitPrice).toFixed(2), 380, y);
    doc.text(Number(item.amount).toFixed(2), pageWidth - margin, y, {
      align: "right",
    });
    y += rowH + 6;
  }

  y += 8;
  doc.setDrawColor(220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Subtotal", 360, y);
  doc.text(money(input.subtotal), pageWidth - margin, y, { align: "right" });
  y += 14;
  const taxRate = Number(input.taxRate || 0);
  const taxAmount = Number(input.taxAmount || 0);
  if (taxAmount > 0 || taxRate > 0) {
    doc.text(`GST (${taxRate}%)`, 360, y);
    doc.text(money(taxAmount), pageWidth - margin, y, { align: "right" });
    y += 14;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", 360, y);
  doc.text(money(input.totalAmount), pageWidth - margin, y, { align: "right" });
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 120, 160);
  doc.text(
    `Advance (${input.advancePercent}%): ${money(input.advanceAmount)}`,
    360,
    y
  );
  doc.setTextColor(0, 0, 0);
  y += 22;

  // Payment / mBoB
  if (y > 560) {
    doc.addPage();
    y = margin;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Payment — mBoB Scan & Pay", margin, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const payLines = [
    `Please deposit the advance of ${money(input.advanceAmount)} to INNOVATES.`,
    input.mbobAccountNumber
      ? `BoB account: ${input.mbobAccountNumber}`
      : null,
    "Scan the QR with mBoB (amount is prefilled when configured).",
    input.publicUrl ? `Online copy: ${input.publicUrl}` : null,
  ].filter(Boolean) as string[];

  for (const line of payLines) {
    const wrapped = doc.splitTextToSize(line, 300);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 11 + 2;
  }

  if (input.depositQrPayload) {
    const qr = await loadQrDataUrl(input.depositQrPayload);
    if (qr) {
      doc.addImage(qr, "PNG", pageWidth - margin - 120, y - 70, 110, 110);
    }
  }

  y = Math.max(y + 40, y);
  if (input.notes) {
    y += 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Notes", margin, y);
    y += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const notes = doc.splitTextToSize(input.notes, 500);
    doc.text(notes, margin, y);
    y += notes.length * 11;
  }

  y += 24;
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    "Thank you for choosing Innovates Bhutan. This quotation is computer generated.",
    margin,
    Math.min(y, 800)
  );

  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
