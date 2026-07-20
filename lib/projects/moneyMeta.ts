/**
 * Project commercial money pipeline (ERP bible Wave A).
 */

export type PaymentMethod = "mbob" | "cheque" | "other";

export type PaymentSlot = {
  amount: number;
  paidAt?: string | null;
  method?: PaymentMethod | null;
  proofUrl?: string | null;
  recordedBy?: string | null;
};

export type WriteOffSlot = {
  amount: number;
  reason: string;
  at: string;
  by?: string | null;
};

export type ProjectMoneyMeta = {
  quotedAmount?: number;
  advanceDueAmount?: number;
  balanceDueAmount?: number;
  advance?: PaymentSlot | null;
  balance?: PaymentSlot | null;
  writeOff?: WriteOffSlot | null;
  holdReason?: string | null;
  cancelReason?: string | null;
  refundStatus?: "refunded" | "non_refundable" | "none" | null;
  invoiceId?: number | null;
  priceChangeReason?: string | null;
  freeSupportDays?: number | null;
};

export function parseMoneyMeta(raw: unknown): ProjectMoneyMeta {
  if (!raw || typeof raw !== "object") return {};
  return raw as ProjectMoneyMeta;
}

export function buildInitialMoneyMeta(params: {
  quotedAmount: number;
  advancePercent?: number;
}): ProjectMoneyMeta {
  const quoted = Math.round(params.quotedAmount * 100) / 100;
  const pct = params.advancePercent ?? 40;
  const advanceDue =
    Math.round(quoted * (Math.min(Math.max(pct, 0), 100) / 100) * 100) / 100;
  const balanceDue = Math.round((quoted - advanceDue) * 100) / 100;
  return {
    quotedAmount: quoted,
    advanceDueAmount: advanceDue,
    balanceDueAmount: balanceDue,
    advance: null,
    balance: null,
    writeOff: null,
  };
}

export function isAdvanceRecorded(meta: ProjectMoneyMeta): boolean {
  return Boolean(meta.advance?.paidAt && (meta.advance.amount ?? 0) > 0);
}

export function isBalanceSettled(meta: ProjectMoneyMeta): boolean {
  if (meta.writeOff?.at) return true;
  return Boolean(meta.balance?.paidAt && (meta.balance.amount ?? 0) >= 0);
}

export function moneySummary(meta: ProjectMoneyMeta) {
  const quoted = meta.quotedAmount ?? 0;
  const advanceDue = meta.advanceDueAmount ?? 0;
  const balanceDue = meta.balanceDueAmount ?? 0;
  const advancePaid = meta.advance?.paidAt ? meta.advance.amount ?? 0 : 0;
  const balancePaid = meta.balance?.paidAt ? meta.balance.amount ?? 0 : 0;
  const writeOff = meta.writeOff?.amount ?? 0;
  return {
    quotedTotal: quoted,
    advanceDue,
    advancePaid,
    balanceDue,
    balancePaid,
    writeOff,
    outstanding: Math.max(0, quoted - advancePaid - balancePaid - writeOff),
  };
}
