/**
 * Bhutan National QR (EMVCo Merchant-Presented Mode)
 * Used by mBoB Scan & Pay — Tag 54 prefills the transfer amount.
 *
 * Preferred setup: paste your official static Scan & Pay payload into
 * Admin → Settings (mbob_static_qr). We clone it, inject amount + bill ref,
 * and recalculate CRC so mBoB opens with amount prefilled.
 */

export const BTN_CURRENCY = "064"; // ISO 4217 Ngultrum
export const BT_COUNTRY = "BT";

export type EmvMap = Record<string, string>;

function padLen(value: string): string {
  const len = value.length;
  if (len > 99) {
    throw new Error(`EMV field too long (${len}): ${value.slice(0, 24)}…`);
  }
  return String(len).padStart(2, "0");
}

export function tlv(id: string, value: string): string {
  return `${id}${padLen(value)}${value}`;
}

/** CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) — EMVCo QRCPS */
export function crc16CcittFalse(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if (crc & 0x8000) crc = ((crc << 1) ^ 0x1021) & 0xffff;
      else crc = (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function parseEmvPayload(payload: string): EmvMap {
  const clean = (payload || "").trim();
  const map: EmvMap = {};
  if (!clean) return map;
  let i = 0;
  while (i + 4 <= clean.length) {
    const id = clean.slice(i, i + 2);
    const len = Number(clean.slice(i + 2, i + 4));
    if (!Number.isFinite(len) || len < 0 || i + 4 + len > clean.length) {
      throw new Error(`Invalid EMV TLV near offset ${i}`);
    }
    map[id] = clean.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  if (i !== clean.length) {
    throw new Error("Trailing bytes in EMV payload");
  }
  return map;
}

export function serializeEmvMap(map: EmvMap): string {
  const orderedIds = Object.keys(map)
    .filter((id) => id !== "63")
    .sort((a, b) => Number(a) - Number(b));

  let body = "";
  for (const id of orderedIds) {
    body += tlv(id, map[id]);
  }
  body += "6304";
  return body + crc16CcittFalse(body);
}

export function isEmvPayload(payload: string | null | undefined): boolean {
  if (!payload) return false;
  const p = payload.trim();
  return p.startsWith("000201") && p.includes("6304");
}

export function formatAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  // EMV allows optional decimals; keep up to 2 places without trailing zeros noise
  const rounded = Math.round(amount * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}

export type MbobQrInput = {
  /** Official static Scan & Pay EMV string (best — preserves BOB merchant template) */
  staticPayload?: string | null;
  /** Fallback if no static payload */
  accountNumber?: string | null;
  merchantName?: string | null;
  merchantCity?: string | null;
  mcc?: string | null;
  /** Globally Unique Identifier inside merchant account template (tag 26/00) */
  gui?: string | null;
  amount: number;
  /** Quotation / bill reference shown in remarks where supported */
  billNumber?: string | null;
};

/**
 * Build a dynamic mBoB / Bhutan National QR with amount prefilled (Tag 54).
 */
export function buildMbobPaymentQr(input: MbobQrInput): string {
  const amount = formatAmount(input.amount);
  const bill = (input.billNumber || "").replace(/[^\w\-\/]/g, "").slice(0, 25);

  if (input.staticPayload && isEmvPayload(input.staticPayload)) {
    const map = parseEmvPayload(input.staticPayload.trim());
    map["01"] = "12"; // dynamic QR (amount present)
    map["54"] = amount;
    if (bill) {
      let additional: EmvMap = {};
      try {
        additional = parseEmvPayload(map["62"] || "");
      } catch {
        additional = {};
      }
      // Sub-ID 05 = Reference Label
      additional["05"] = bill;
      map["62"] = Object.keys(additional)
        .sort()
        .map((id) => tlv(id, additional[id]))
        .join("");
    }
    // Ensure currency / country if missing on odd payloads
    if (!map["53"]) map["53"] = BTN_CURRENCY;
    if (!map["58"]) map["58"] = BT_COUNTRY;
    return serializeEmvMap(map);
  }

  const account = (input.accountNumber || "").replace(/\s+/g, "");
  if (!account) {
    throw new Error(
      "mBoB QR needs mbob_static_qr (paste Scan & Pay payload) or mbob_account_number in Settings"
    );
  }

  const merchantName = (input.merchantName || "INNOVATES").slice(0, 25);
  const merchantCity = (input.merchantCity || "THIMPHU").slice(0, 15);
  const mcc = (input.mcc || "5732").slice(0, 4); // electronics / computer
  const gui = (input.gui || "com.bob.bt").slice(0, 32);

  // Merchant Account Information template (ID 26)
  const mai = tlv("00", gui) + tlv("01", account);

  const additional = bill ? tlv("05", bill) : "";

  const map: EmvMap = {
    "00": "01",
    "01": "12",
    "26": mai,
    "52": mcc,
    "53": BTN_CURRENCY,
    "54": amount,
    "58": BT_COUNTRY,
    "59": merchantName,
    "60": merchantCity,
  };
  if (additional) map["62"] = additional;

  return serializeEmvMap(map);
}

export type MbobSettings = {
  staticPayload: string;
  accountNumber: string;
  merchantName: string;
  merchantCity: string;
  mcc: string;
  gui: string;
};

export function buildMbobPaymentQrFromSettings(
  settings: Partial<MbobSettings>,
  amount: number,
  billNumber?: string | null
): string {
  return buildMbobPaymentQr({
    staticPayload: settings.staticPayload,
    accountNumber: settings.accountNumber,
    merchantName: settings.merchantName,
    merchantCity: settings.merchantCity,
    mcc: settings.mcc,
    gui: settings.gui,
    amount,
    billNumber,
  });
}
