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
        subtotal: Number(quote.subtotal || quote.totalAmount || 0),
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

          <ul className="divide-y border rounded-xl overflow-hidden">
            {(quote.items || []).map((item, i) => (
              <li
                key={i}
                className="flex justify-between gap-3 px-3 py-2.5 text-sm bg-white"
              >
                <span>
                  {item.quantity}× {item.name}
                  {item.brand ? (
                    <span className="text-muted-foreground"> ({item.brand})</span>
                  ) : null}
                </span>
                <span className="tabular-nums shrink-0 font-medium">
                  Nu. {Number(item.amount).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>

          <div className="text-sm space-y-1 pt-1">
            <p className="flex justify-between">
              <span>Total</span>
              <strong>
                Nu. {Number(quote.totalAmount || 0).toLocaleString()}
              </strong>
            </p>
            <p className="flex justify-between text-[#00B5E2]">
              <span>Advance ({Number(quote.advancePercent || 0)}%)</span>
              <strong>
                Nu. {Number(quote.advanceAmount || 0).toLocaleString()}
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
