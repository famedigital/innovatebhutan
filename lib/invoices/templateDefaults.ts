/** Shared invoice / quotation template design (product letterheads) */

export type ProductKey = "rancelab" | "website" | "cctv";

export type InvoiceTemplateDesign = {
  logoUrl?: string | null;
  companyName: string;
  companyAddress: string;
  companyPhone?: string;
  companyEmail?: string;
  gstTin?: string;
  documentTitle: string;
  accentColor: string;
  numberPrefix: string;
  numberPattern: string; // e.g. "{PREFIX}-{YYYY}{MM}-{SEQ}"
  gstRate: number; // 0.05
  dealerNotice: string;
  paymentTerms: string;
  termsAndConditions: string[];
  footerNote?: string;
};

export const DEFAULT_RANCELAB_DESIGN: InvoiceTemplateDesign = {
  logoUrl: null,
  companyName: "Innovates",
  companyAddress: "Thimphu, Kingdom of Bhutan",
  companyPhone: "",
  companyEmail: "",
  gstTin: "",
  documentTitle: "Quotation",
  accentColor: "#0A5F4E",
  numberPrefix: "RL-AMC",
  numberPattern: "{PREFIX}-{YYYY}{MM}-{SEQ}",
  gstRate: 0.05,
  dealerNotice:
    "Innovates is an Authorized Dealer to sell and support Rancelab Software Products in the territory of Kingdom of Bhutan.",
  paymentTerms:
    "We Do Not Accept Cash — only M-BoB or Cheque Issued in Favor of Innovates.",
  termsAndConditions: [
    "The AMC agreement must be renewed and signed every year.",
    "Payment of the AMC will be considered as acceptance of the AMC terms and conditions.",
    "Failure to renew or pay the AMC before the expiry date will result in automatic disconnection or suspension of the software services.",
    "Work is Executed on Non-Refundable Basis.",
    "We Do Not Accept Cash — only M-BoB or Cheque Issued in Favor of Innovates.",
    "All AMC payments once made are non-refundable under any circumstances.",
    "SUBJECT TO THIMPHU JURISDICTION",
  ],
  footerNote: "SUBJECT TO THIMPHU JURISDICTION",
};

export const DEFAULT_WEBSITE_DESIGN: InvoiceTemplateDesign = {
  ...DEFAULT_RANCELAB_DESIGN,
  documentTitle: "Tax Invoice",
  numberPrefix: "WEB",
  dealerNotice:
    "Innovates designs and maintains websites and digital products for clients in Bhutan.",
  termsAndConditions: [
    "Work is executed on a non-refundable basis once development has started.",
    "Payment via M-BoB or Cheque in favor of Innovates only.",
    "Hosting and domain renewals are billed separately unless included.",
    "SUBJECT TO THIMPHU JURISDICTION",
  ],
};

export const DEFAULT_CCTV_DESIGN: InvoiceTemplateDesign = {
  ...DEFAULT_RANCELAB_DESIGN,
  documentTitle: "Tax Invoice",
  numberPrefix: "CCTV",
  dealerNotice:
    "Innovates supplies and maintains CCTV and security systems in the Kingdom of Bhutan.",
  termsAndConditions: [
    "Hardware warranty follows manufacturer terms.",
    "AMC / maintenance is billed separately unless stated.",
    "Payment via M-BoB or Cheque in favor of Innovates only.",
    "SUBJECT TO THIMPHU JURISDICTION",
  ],
};

export function defaultDesignForProduct(productKey: ProductKey): InvoiceTemplateDesign {
  if (productKey === "website") return { ...DEFAULT_WEBSITE_DESIGN };
  if (productKey === "cctv") return { ...DEFAULT_CCTV_DESIGN };
  return { ...DEFAULT_RANCELAB_DESIGN };
}

/** Build invoice number from pattern tokens */
export function formatInvoiceNumber(params: {
  pattern: string;
  prefix: string;
  seq: number;
  date?: Date;
}): string {
  const d = params.date || new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const seq = String(params.seq).padStart(4, "0");
  return params.pattern
    .replace(/\{PREFIX\}/g, params.prefix)
    .replace(/\{YYYY\}/g, yyyy)
    .replace(/\{MM\}/g, mm)
    .replace(/\{DD\}/g, dd)
    .replace(/\{SEQ\}/g, seq)
    .replace(/\{SHORT\}/g, Date.now().toString(36).slice(-4).toUpperCase());
}
