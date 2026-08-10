import { describe, expect, it } from "vitest";
import {
  buildMbobPaymentQr,
  crc16CcittFalse,
  isEmvPayload,
  parseEmvEntries,
  parseEmvPayload,
  serializeEmvEntries,
  validateEmvCrc,
} from "@/lib/payments/bhutanEmvQr";

/** Minimal plausible static sticker (order matters). */
function sampleStaticSticker() {
  const entries = [
    { id: "00", value: "01" },
    { id: "01", value: "11" },
    {
      id: "26",
      value: "0012com.example.bt011520312345678903",
    },
    { id: "52", value: "5732" },
    { id: "53", value: "064" },
    { id: "58", value: "BT" },
    { id: "59", value: "INNOVATES" },
    { id: "60", value: "THIMPHU" },
  ];
  return serializeEmvEntries(entries);
}

describe("bhutanEmvQr", () => {
  it("validates CRC of generated payloads", () => {
    const sticker = sampleStaticSticker();
    expect(validateEmvCrc(sticker)).toBe(true);
    expect(isEmvPayload(sticker)).toBe(true);
  });

  it("injects amount while preserving merchant template", () => {
    const sticker = sampleStaticSticker();
    const original26 = parseEmvPayload(sticker)["26"];

    const dynamic = buildMbobPaymentQr({
      staticPayload: sticker,
      amount: 12500.5,
      billNumber: "QT-26/001",
    });

    expect(validateEmvCrc(dynamic)).toBe(true);
    const map = parseEmvPayload(dynamic);
    expect(map["01"]).toBe("12");
    expect(map["54"]).toBe("12500.50");
    expect(map["26"]).toBe(original26);
    expect(map["62"]).toContain("QT-26/001");
    expect(dynamic.endsWith(crc16CcittFalse(dynamic.slice(0, -4)))).toBe(true);

    // Original field order for 00/01/26 preserved at start
    const entries = parseEmvEntries(dynamic);
    expect(entries[0]?.id).toBe("00");
    expect(entries[1]?.id).toBe("01");
    expect(entries[2]?.id).toBe("26");
  });

  it("refuses to invent QR without official sticker payload", () => {
    expect(() =>
      buildMbobPaymentQr({ amount: 100, staticPayload: "" })
    ).toThrow(/official mBoB Scan & Pay/);
  });
});
