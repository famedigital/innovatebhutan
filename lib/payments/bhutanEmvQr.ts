/**
 * Bhutan National QR (EMVCo Merchant-Presented Mode) for mBoB Scan & Pay.
 *
 * CRITICAL: Do NOT invent merchant-account templates. mBoB rejects unknown GUIDs
 * with "Invalid QR Code". Always clone the official static sticker payload from
 * Bank of Bhutan, then inject Tag 54 (amount) + optional reference.
 */

export const BTN_CURRENCY = "064"; // ISO 4217 Ngultrum
export const BT_COUNTRY = "BT";

export type EmvMap = Record<string, string>;
export type EmvEntry = { id: string; value: string };

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

/** Parse EMV payload preserving original field order (excluding CRC). */
export function parseEmvEntries(payload: string): EmvEntry[] {
  const clean = (payload || "").trim();
  const entries: EmvEntry[] = [];
  if (!clean) return entries;
  let i = 0;
  while (i + 4 <= clean.length) {
    const id = clean.slice(i, i + 2);
    const len = Number(clean.slice(i + 2, i + 4));
    if (!Number.isFinite(len) || len < 0 || i + 4 + len > clean.length) {
      throw new Error(`Invalid EMV TLV near offset ${i}`);
    }
    const value = clean.slice(i + 4, i + 4 + len);
    i += 4 + len;
    if (id !== "63") entries.push({ id, value });
  }
  if (i !== clean.length) {
    throw new Error("Trailing bytes in EMV payload");
  }
  return entries;
}

export function parseEmvPayload(payload: string): EmvMap {
  const map: EmvMap = {};
  for (const entry of parseEmvEntries(payload)) {
    map[entry.id] = entry.value;
  }
  return map;
}

/** Serialize entries in given order and append CRC. */
export function serializeEmvEntries(entries: EmvEntry[]): string {
  let body = "";
  for (const { id, value } of entries) {
    if (id === "63") continue;
    body += tlv(id, value);
  }
  body += "6304";
  return body + crc16CcittFalse(body);
}

export function serializeEmvMap(map: EmvMap): string {
  const orderedIds = Object.keys(map)
    .filter((id) => id !== "63")
    .sort((a, b) => Number(a) - Number(b));
  return serializeEmvEntries(
    orderedIds.map((id) => ({ id, value: map[id] }))
  );
}

export function isEmvPayload(payload: string | null | undefined): boolean {
  if (!payload) return false;
  const p = payload.trim();
  if (!p.startsWith("000201") || !p.includes("6304")) return false;
  try {
    const entries = parseEmvEntries(p);
    const rebuilt = serializeEmvEntries(entries);
    // Accept if structure parses; CRC may differ if source omitted/wrong
    return rebuilt.startsWith("000201") && entries.some((e) => e.id === "59" || Number(e.id) >= 26);
  } catch {
    return false;
  }
}

export function validateEmvCrc(payload: string): boolean {
  const p = payload.trim();
  if (p.length < 8 || !p.includes("6304")) return false;
  const withoutCrc = p.slice(0, -4);
  const crc = p.slice(-4).toUpperCase();
  return crc16CcittFalse(withoutCrc) === crc;
}

export function formatAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  const rounded = Math.round(amount * 100) / 100;
  // Keep two decimals — many banking apps expect consistent amount format
  return rounded.toFixed(2);
}

function upsertEntry(entries: EmvEntry[], id: string, value: string) {
  const idx = entries.findIndex((e) => e.id === id);
  if (idx >= 0) entries[idx] = { id, value };
  else {
    // Insert before additional-data (62) if present, else append
    const at = entries.findIndex((e) => Number(e.id) > Number(id));
    if (at >= 0) entries.splice(at, 0, { id, value });
    else entries.push({ id, value });
  }
}

export type MbobQrInput = {
  /** Official static Scan & Pay EMV string from BOB sticker (required for valid mBoB scan) */
  staticPayload?: string | null;
  amount: number;
  billNumber?: string | null;
};

/**
 * Clone official Bhutan/mBoB static QR and inject amount (Tag 54).
 * Throws if static payload is missing — never invents merchant templates.
 */
export function buildMbobPaymentQr(input: MbobQrInput): string {
  const staticPayload = (input.staticPayload || "").trim();
  if (!staticPayload) {
    throw new Error(
      "Paste your official mBoB Scan & Pay QR payload in Admin → Settings → Payments (decode the Innovates sticker)."
    );
  }
  if (!staticPayload.startsWith("000201")) {
    throw new Error(
      "mBoB static QR must be an EMV payload starting with 000201. Decode the sticker with a QR reader app and paste the full text."
    );
  }

  const amount = formatAmount(input.amount);
  const bill = (input.billNumber || "").replace(/[^\w\-\/]/g, "").slice(0, 25);
  const entries = parseEmvEntries(staticPayload);

  // Dynamic QR when amount is present
  upsertEntry(entries, "01", "12");
  upsertEntry(entries, "54", amount);

  if (!entries.some((e) => e.id === "53")) {
    upsertEntry(entries, "53", BTN_CURRENCY);
  }
  if (!entries.some((e) => e.id === "58")) {
    upsertEntry(entries, "58", BT_COUNTRY);
  }

  if (bill) {
    const existing62 = entries.find((e) => e.id === "62")?.value || "";
    let additional: EmvEntry[] = [];
    try {
      additional = parseEmvEntries(existing62);
    } catch {
      additional = [];
    }
    upsertEntry(additional, "05", bill);
    upsertEntry(
      entries,
      "62",
      additional.map((e) => tlv(e.id, e.value)).join("")
    );
  }

  return serializeEmvEntries(entries);
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
    amount,
    billNumber,
  });
}

/** Extract merchant display hints from a static payload (for UI). */
export function readMerchantFromPayload(payload: string | null | undefined): {
  name?: string;
  city?: string;
} {
  if (!payload || !isEmvPayload(payload)) return {};
  try {
    const map = parseEmvPayload(payload);
    return { name: map["59"], city: map["60"] };
  } catch {
    return {};
  }
}
