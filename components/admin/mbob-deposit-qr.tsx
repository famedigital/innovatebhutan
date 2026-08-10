"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { isEmvPayload } from "@/lib/payments/bhutanEmvQr";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  payload?: string | null;
  amount: number;
  accountLabel?: string;
  merchantName?: string;
  quotationNumber?: string;
  setupError?: string | null;
};

/**
 * mBoB-style Scan & Pay card for quotation deposit.
 * Only renders a scannable QR when payload is valid EMV — otherwise mBoB shows "Invalid QR Code".
 */
export function MbobDepositQrCard({
  payload,
  amount,
  accountLabel,
  merchantName = "INNOVATES",
  quotationNumber,
  setupError,
}: Props) {
  const [copied, setCopied] = useState(false);
  const ready = Boolean(payload && isEmvPayload(payload));
  const qrSrc = ready
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&ecc=M&data=${encodeURIComponent(payload!)}`
    : null;

  const copyText = async (text: string, ok: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(ok);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="rounded-2xl border border-[#00B5E2]/30 overflow-hidden bg-white text-[#111]">
      <div className="px-4 pt-5 pb-3 text-center space-y-1">
        <div className="text-2xl font-black tracking-tight">
          <span className="text-[#00B5E2] italic font-serif">m</span>
          <span>BOB</span>
        </div>
        <p className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#333]">
          Mobile Banking
        </p>
        <div className="inline-flex mt-2 px-4 py-1.5 rounded-md bg-[#00B5E2] text-white text-xs font-bold tracking-widest uppercase">
          Scan &amp; Pay
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col items-center gap-3">
        {qrSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrSrc}
            alt="mBoB Scan & Pay QR"
            className="w-52 h-52 bg-white border border-[#E5E5E5] p-2 rounded-lg"
          />
        ) : (
          <div className="w-full border border-dashed border-amber-400/60 bg-amber-50 rounded-lg p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-amber-900">
              Official sticker payload required
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              {setupError ||
                "mBoB rejects home-made QR codes. Decode your Innovates Scan & Pay sticker (text starts with 000201) and paste it in Admin → Settings → Payments."}
            </p>
            <ol className="text-[11px] text-amber-800 list-decimal pl-4 space-y-1">
              <li>Open any QR reader (not mBoB) on the sticker</li>
              <li>Copy the full text starting with <code>000201</code></li>
              <li>Paste + Save in Settings → Payments</li>
              <li>Re-open this quotation</li>
            </ol>
          </div>
        )}

        <div className="text-center space-y-0.5">
          <p className="font-bold text-sm tracking-wide">{merchantName}</p>
          {accountLabel ? (
            <p className="text-xs text-[#555] font-mono">{accountLabel}</p>
          ) : null}
          <p className="text-base font-black text-[#00B5E2] pt-1">
            Nu. {amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          {quotationNumber ? (
            <p className="text-[11px] text-[#717171]">Ref: {quotationNumber}</p>
          ) : null}
        </div>

        {ready ? (
          <p className="text-[11px] text-[#717171] text-center leading-relaxed">
            Open <strong>mBoB</strong> → scan this QR. Advance amount is prefilled.
          </p>
        ) : (
          <div className="w-full space-y-2">
            <p className="text-[11px] text-[#717171] text-center">
              Meanwhile, client can pay manually in mBoB → FT to BoB Account:
            </p>
            {accountLabel ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => copyText(accountLabel, "Account copied")}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <Copy className="w-3.5 h-3.5 mr-1" />
                )}
                Copy account {accountLabel}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                copyText(String(amount), "Advance amount copied")
              }
            >
              Copy amount Nu. {amount.toLocaleString()}
            </Button>
          </div>
        )}

        {ready && payload ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => copyText(payload, "QR payload copied")}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 mr-1" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" />
            )}
            Copy QR data
          </Button>
        ) : null}
      </div>

      <div className="bg-[#00B5E2] text-white text-center text-[10px] font-bold tracking-[0.3em] uppercase py-2">
        We Accept
      </div>
      <div className="px-3 py-2 text-center text-[10px] text-[#555] bg-[#F7FCFD]">
        mBoB · mPay · B-Wallet · T-Bank · ePAY · BHIM / UPI
      </div>
    </div>
  );
}
