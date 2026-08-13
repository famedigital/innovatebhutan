"use client";

import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { MbobDepositQrCard } from "@/components/admin/mbob-deposit-qr";
import { Button } from "@/components/ui/button";
import {
  downloadBlob,
  renderQuotationPdf,
} from "@/lib/quotations/renderQuotationPdf";
import { toast } from "sonner";

type PublicQuote = {
  publicId: string;
  quotationNumber: string;
  category: string;
  businessName?: string | null;
  customerName?: string | null;
  quotationFor?: string | null;
  validityDays?: number | null;
  subtotal?: string | number | null;
  taxRate?: string | number | null;
  taxAmount?: string | number | null;
  totalAmount?: string | number | null;
  advancePercent?: string | number | null;
  advanceAmount?: string | number | null;
  status: string;
  notes?: string | null;
  items?: Array<{
    name: string;
    brand?: string | null;
    quantity: number;
    unitPrice: string | number;
    amount: string | number;
  }>;
  depositQrPayload?: string | null;
  mbobAccountNumber?: string | null;
  mbobSetupError?: string | null;
};

const formatNu = (n: number) =>
  `Nu. ${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export function PublicQuoteClient({ publicId }: { publicId: string }) {
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/quotations/public/${publicId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Quotation not found");
        }
        if (!cancelled) setQuote(data.data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load quotation");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [publicId]);

  const download = async () => {
    if (!quote) return;
    setDownloading(true);
    try {
      const subtotal = Number(quote.subtotal || 0);
      const taxRate = Number(quote.taxRate || 0);
      const taxAmount = Number(quote.taxAmount || 0);
      const blob = await renderQuotationPdf({
        quotationNumber: quote.quotationNumber,
        category: quote.category,
        businessName: quote.businessName || quote.customerName || "Client",
        customerName: quote.customerName,
        quotationFor: quote.quotationFor,
        validityDays: quote.validityDays,
        items: (quote.items || []).map((item) => ({
          name: item.name,
          brand: item.brand,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          amount: Number(item.amount),
        })),
        subtotal: subtotal || Number(quote.totalAmount || 0),
        taxRate,
        taxAmount,
        totalAmount: Number(quote.totalAmount || 0),
        advancePercent: Number(quote.advancePercent || 0),
        advanceAmount: Number(quote.advanceAmount || 0),
        notes: quote.notes,
        publicUrl:
          typeof window !== "undefined" ? window.location.href : undefined,
        depositQrPayload: quote.depositQrPayload,
        mbobAccountNumber: quote.mbobAccountNumber,
      });
      downloadBlob(
        blob,
        `${quote.quotationNumber.replace(/\//g, "-")}.pdf`
      );
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF failed");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading quotation…
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-2">
          <h1 className="text-xl font-semibold">Quotation unavailable</h1>
          <p className="text-sm text-muted-foreground">
            {error || "This link may be invalid or cancelled."}
          </p>
        </div>
      </div>
    );
  }

  const taxRate = Number(quote.taxRate || 0);
  const taxAmount = Number(quote.taxAmount || 0);
  const subtotal = Number(quote.subtotal || 0);

  return (
    <main className="min-h-screen bg-[#F7FBFD] text-[#111]">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-[#00B5E2] font-black tracking-tight text-lg">
              INNOVATES
            </p>
            <h1 className="text-2xl font-semibold mt-1">Quotation</h1>
            <p className="text-sm text-muted-foreground">
              {quote.quotationNumber} · {quote.category}
            </p>
          </div>
          <Button onClick={download} disabled={downloading}>
            <Download className="w-4 h-4 mr-1" />
            {downloading ? "Preparing…" : "Download PDF"}
          </Button>
        </header>

        <section className="rounded-2xl border bg-white p-5 space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Bill to
            </p>
            <p className="font-semibold text-lg">
              {quote.businessName || quote.customerName || "Client"}
            </p>
            {quote.quotationFor ? (
              <p className="text-sm text-muted-foreground mt-1">
                {quote.quotationFor}
              </p>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border">
            <div className="grid grid-cols-[1fr_48px_88px_72px] gap-1 border-b bg-[#F7FBFD] px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Amount</span>
              <span className="text-right">GST</span>
            </div>
            <ul className="divide-y">
              {(quote.items || []).map((item, i) => {
                const amount = Number(item.amount);
                const lineGst =
                  Math.round(amount * (taxRate / 100) * 100) / 100;
                return (
                  <li
                    key={i}
                    className="grid grid-cols-[1fr_48px_88px_72px] items-start gap-1 px-3 py-2.5 text-sm bg-white"
                  >
                    <span className="min-w-0 leading-snug">
                      {item.name}
                      {item.brand ? (
                        <span className="text-muted-foreground">
                          {" "}
                          ({item.brand})
                        </span>
                      ) : null}
                    </span>
                    <span className="text-center tabular-nums text-muted-foreground">
                      {item.quantity}
                    </span>
                    <span className="text-right tabular-nums font-medium">
                      {formatNu(amount)}
                    </span>
                    <span className="text-right tabular-nums text-muted-foreground">
                      {formatNu(lineGst)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="text-sm space-y-1.5 pt-1">
            <p className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">{formatNu(subtotal)}</span>
            </p>
            {(taxAmount > 0 || taxRate > 0) && (
              <p className="flex justify-between">
                <span className="text-muted-foreground">GST ({taxRate}%)</span>
                <span className="tabular-nums">{formatNu(taxAmount)}</span>
              </p>
            )}
            <p className="flex justify-between text-base pt-1 border-t">
              <span className="font-semibold">Total</span>
              <strong className="tabular-nums">
                {formatNu(Number(quote.totalAmount || 0))}
              </strong>
            </p>
            <p className="flex justify-between text-[#00B5E2]">
              <span>Advance ({Number(quote.advancePercent || 0)}%)</span>
              <strong className="tabular-nums">
                {formatNu(Number(quote.advanceAmount || 0))}
              </strong>
            </p>
            {quote.validityDays ? (
              <p className="text-xs text-muted-foreground pt-1">
                Valid for {quote.validityDays} days
              </p>
            ) : null}
          </div>
        </section>

        <MbobDepositQrCard
          payload={quote.depositQrPayload}
          amount={Number(quote.advanceAmount || 0)}
          accountLabel={quote.mbobAccountNumber || undefined}
          merchantName="INNOVATES"
          quotationNumber={quote.quotationNumber}
          setupError={quote.mbobSetupError}
        />

        {quote.notes ? (
          <section className="rounded-2xl border bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Notes
            </p>
            <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
          </section>
        ) : null}

        <p className="text-center text-xs text-muted-foreground pb-8">
          Innovates Bhutan · innovates.bt
        </p>
      </div>
    </main>
  );
}
