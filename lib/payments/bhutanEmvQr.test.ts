import { describe, expect, it } from "vitest";
import {
  buildMbobPaymentQr,
  crc16CcittFalse,
  isEmvPayload,
  parseEmvPayload,
  serializeEmvMap,
} from "@/lib/payments/bhutanEmvQr";

describe("bhutanEmvQr", () => {
  it("computes EMV CRC for known sample", () => {
    // Payload without CRC hex; CRC of body ending with 6304
    const body =
      "00020101021126370012com.example.bt01151234567890123455204573253030645802BT5909INNOVATES6007THIMPHU6304";
    const crc = crc16CcittFalse(body);
    expect(crc).toMatch(/^[0-9A-F]{4}$/);
  });

  it("round-trips serialize/parse and injects amount", () => {
    const staticPayload = buildMbobPaymentQr({
      accountNumber: "2031234503",
      merchantName: "INNOVATES",
      merchantCity: "THIMPHU",
      amount: 1,
      billNumber: "QT-SEED",
    });

    expect(isEmvPayload(staticPayload)).toBe(true);
    const map = parseEmvPayload(staticPayload);
    expect(map["53"]).toBe("064");
    expect(map["58"]).toBe("BT");
    expect(map["54"]).toBe("1");

    // Simulate sticker without amount (static)
    delete map["54"];
    map["01"] = "11";
    const sticker = serializeEmvMap(map);
    expect(parseEmvPayload(sticker)["54"]).toBeUndefined();

    const withAdvance = buildMbobPaymentQr({
      staticPayload: sticker,
      amount: 12500.5,
      billNumber: "QT-26/001",
    });
    const dynamic = parseEmvPayload(withAdvance);
    expect(dynamic["01"]).toBe("12");
    expect(dynamic["54"]).toBe("12500.50");
    expect(dynamic["62"]).toContain("QT-26/001");
    expect(withAdvance.endsWith(crc16CcittFalse(withAdvance.slice(0, -4)))).toBe(
      true
    );
  });
});
