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
};

/**
 * mBoB-style Scan & Pay card for quotation deposit.
 */
export function MbobDepositQrCard({
  payload,
  amount,
  accountLabel,
  merchantName = "INNOVATES",
  quotationNumber,
}: Props) {
  const [copied, setCopied] = useState(false);
  const ready = Boolean(payload && isEmvPayload(payload));
  const qrSrc = payload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(payload)}`
    : null;

  const copyPayload = async () => {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success("QR payload copied");
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
          <div className="w-52 h-52 border border-dashed border-[#00B5E2]/50 rounded-lg flex items-center justify-center text-center text-xs text-[#717171] p-4">
            Configure mBoB QR in Admin → Settings → Payments
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

        {!ready && payload ? (
          <p className="text-[11px] text-amber-700 bg-amber-50 rounded-md px-2 py-1.5 text-center">
            This QR is not yet an mBoB EMV payload. Paste your Scan &amp; Pay sticker
            payload in Settings so amount prefills in mBoB.
          </p>
        ) : (
          <p className="text-[11px] text-[#717171] text-center leading-relaxed">
            Open <strong>mBoB</strong> → Scan this QR. Advance amount is prefilled.
          </p>
        )}

        {payload ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={copyPayload}
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
