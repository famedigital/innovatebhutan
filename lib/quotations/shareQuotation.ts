/**
 * Quotation share helpers — WhatsApp / email message + phone/email normalize.
 */

export function normalizeBhutanPhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 8) digits = `975${digits}`;
  if (digits.startsWith("00")) digits = digits.slice(2);
  return digits;
}

export function buildQuotationShareMessage(input: {
  quotationNumber: string;
  businessName: string;
  totalAmount: number;
  advanceAmount: number;
  advancePercent: number;
  publicUrl: string;
  quotationFor?: string | null;
  /** Opening line clients see (ERP setting), e.g. "Kuzu zangpola!" */
  greeting?: string | null;
}) {
  const greeting = (input.greeting || "Kuzu zangpola!").trim() || "Kuzu zangpola!";
  const lines = [
    greeting,
    ``,
    `Please find quotation *${input.quotationNumber}* from Innovates Bhutan.`,
    `Client: ${input.businessName}`,
    input.quotationFor ? `Regarding: ${input.quotationFor}` : null,
    `Total: Nu. ${input.totalAmount.toLocaleString()}`,
    `Advance (${input.advancePercent}%): Nu. ${input.advanceAmount.toLocaleString()}`,
    ``,
    `View quotation & pay advance (mBoB):`,
    input.publicUrl,
    ``,
    `Thank you — Innovates Bhutan`,
  ].filter((l) => l !== null);

  return lines.join("\n");
}

export function buildQuotationEmailSubject(quotationNumber: string) {
  return `Quotation ${quotationNumber} — Innovates Bhutan`;
}

export function buildWhatsAppShareUrl(phone: string, message: string) {
  const to = normalizeBhutanPhone(phone);
  if (!to) return null;
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
}

export function buildMailtoShareUrl(input: {
  email: string;
  subject: string;
  body: string;
}) {
  if (!input.email?.includes("@")) return null;
  return `mailto:${encodeURIComponent(input.email)}?subject=${encodeURIComponent(input.subject)}&body=${encodeURIComponent(input.body)}`;
}

export function quotationPublicPath(publicId: string) {
  return `/quote/${publicId}`;
}
