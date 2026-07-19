/** AMC renewal pipeline helpers (quotation → payment → RanceLab → license) */

export const AMC_GST_RATE = 0.05;
export const AMC_RENEWAL_NOTE_TAG = "AMC_RENEWAL";

export type RancelabRemittance = {
  remitted: boolean;
  amount?: string;
  date?: string;
  reference?: string;
  notes?: string;
  remittedAt?: string;
};

export type AmcRenewalPipeline = {
  quotationInvoiceId?: number;
  startDate?: string;
  endDate?: string;
  amount?: string;
  rancelab?: RancelabRemittance;
};

export type AmcMeta = {
  renewal?: AmcRenewalPipeline;
  [key: string]: unknown;
};

export type RenewalStepKey = "quotation" | "payment" | "rancelab" | "license";
export type RenewalStepState = "done" | "current" | "locked";

export function parseAmcMeta(meta: unknown): AmcMeta {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return {};
  return meta as AmcMeta;
}

export function getRenewalPipeline(meta: unknown): AmcRenewalPipeline {
  return parseAmcMeta(meta).renewal || {};
}

export function withRenewalPipeline(
  meta: unknown,
  renewal: AmcRenewalPipeline
): AmcMeta {
  return { ...parseAmcMeta(meta), renewal };
}

/** Add one year to a YYYY-MM-DD (or Date), preserving calendar day where possible */
export function addOneYear(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return "";
  const next = new Date(d);
  next.setFullYear(next.getFullYear() + 1);
  return next.toISOString().slice(0, 10);
}

export function formatAmcDisplayDate(dateInput: string | Date): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function buildQuotationLineItems(params: {
  amount: number;
  startDate: string;
  endDate: string;
  clientName: string;
}): Array<{ description: string; quantity: number; rate: number }> {
  const taxable = Math.round(params.amount * 100) / 100;
  const gst = Math.round(taxable * AMC_GST_RATE * 100) / 100;
  const period = `${formatAmcDisplayDate(params.startDate)} to ${formatAmcDisplayDate(params.endDate)}`;
  return [
    {
      description: `Rancelab Yearly A.M.C\n${period} Location : ${params.clientName}`,
      quantity: 1,
      rate: taxable,
    },
    {
      description: "GST 5%",
      quantity: 1,
      rate: gst,
    },
  ];
}

export function buildQuotationNotes(amcId: number, contractNumber?: string | null): string {
  return [
    `${AMC_RENEWAL_NOTE_TAG}:${amcId}`,
    contractNumber ? `Contract: ${contractNumber}` : null,
    "Quotation — Rancelab Yearly A.M.C",
    "We Do Not Accept Cash — only M-BoB or Cheque issued in favor of Innovates.",
    "All AMC payments once made are non-refundable.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function computeRenewalSteps(params: {
  pipeline: AmcRenewalPipeline;
  invoiceStatus?: string | null;
  alreadyRenewed: boolean;
}): Record<RenewalStepKey, RenewalStepState> {
  const { pipeline, invoiceStatus, alreadyRenewed } = params;
  const hasQuote = !!pipeline.quotationInvoiceId;
  const paid = invoiceStatus === "paid";
  const remitted = !!pipeline.rancelab?.remitted;

  if (alreadyRenewed) {
    return { quotation: "done", payment: "done", rancelab: "done", license: "done" };
  }

  if (!hasQuote) {
    return { quotation: "current", payment: "locked", rancelab: "locked", license: "locked" };
  }
  if (!paid) {
    return { quotation: "done", payment: "current", rancelab: "locked", license: "locked" };
  }
  if (!remitted) {
    return { quotation: "done", payment: "done", rancelab: "current", license: "locked" };
  }
  return { quotation: "done", payment: "done", rancelab: "done", license: "current" };
}
