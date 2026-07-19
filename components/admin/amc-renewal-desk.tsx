"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  Loader2,
  RotateCcw,
  Upload,
  MessageCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { addOneYear, AMC_GST_RATE, formatAmcDisplayDate, type RenewalStepKey, type RenewalStepState } from "@/lib/amc/renewal";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

async function uploadRenewalFile(params: {
  file: Blob;
  filename: string;
  purpose: "amc-quotation" | "amc-payment";
  amcId: number;
}): Promise<{ url: string; folder?: string }> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not signed in — refresh and try again");
  }

  const typed =
    params.file.type && params.file.type !== "application/octet-stream"
      ? params.file
      : new File([params.file], params.filename, {
          type: params.filename.toLowerCase().endsWith(".pdf")
            ? "application/pdf"
            : params.file.type || "application/octet-stream",
        });

  const fd = new FormData();
  fd.append("file", typed, params.filename);
  fd.append("purpose", params.purpose);
  fd.append("amcId", String(params.amcId));

  // trailingSlash: true — must include trailing slash or Next redirects and drops Authorization
  const up = await fetch("/api/media/upload/", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: fd,
  });
  const upData = await up.json();
  if (!up.ok || !upData?.success || !upData?.url) {
    throw new Error(upData?.error || `Upload failed (${up.status})`);
  }
  return { url: upData.url as string, folder: upData.folder as string | undefined };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildWhatsAppQuotationUrl(params: {
  phoneOrGroupLink?: string | null;
  groupLink?: string | null;
  clientName: string;
  amount: number;
  startDate: string;
  endDate: string;
  pdfUrl?: string | null;
}): string | null {
  const total = Math.round(params.amount * (1 + AMC_GST_RATE) * 100) / 100;
  const period = `${formatAmcDisplayDate(params.startDate)} to ${formatAmcDisplayDate(params.endDate)}`;
  const text = [
    `Dear ${params.clientName},`,
    ``,
    `Please find the RanceLab Yearly AMC quotation for ${period}.`,
    `Amount (incl. 5% GST): Nu. ${total.toLocaleString()}`,
    params.pdfUrl ? `Quotation PDF: ${params.pdfUrl}` : null,
    ``,
    `Payment via M-BoB or Cheque only (no cash).`,
    `— Innovates`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  if (params.groupLink) return params.groupLink;
  const phone = (params.phoneOrGroupLink || "").replace(/\D/g, "");
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export type AmcRenewalTarget = {
  id: number;
  clientId: number;
  clientName?: string;
  clientWhatsapp?: string;
  clientWhatsappGroupLink?: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  amount?: string;
  status: string;
  renewedTo?: number | null;
};

type RenewalStatus = {
  pipeline: {
    quotationInvoiceId?: number;
    startDate?: string;
    endDate?: string;
    amount?: string;
    quotationPdfUrl?: string;
    quotationSharedAt?: string;
    payment?: { proofUrl?: string; proofNote?: string; paidAt?: string };
    rancelab?: {
      remitted: boolean;
      amount?: string;
      date?: string;
      reference?: string;
      notes?: string;
    };
  };
  quotationInvoice: {
    id: number;
    invoiceNumber: string;
    status: string | null;
    total: string;
    dueDate: string;
  } | null;
  steps: Record<RenewalStepKey, RenewalStepState>;
  canRenew: boolean;
};

const TAB_META: { key: RenewalStepKey; label: string }[] = [
  { key: "quotation", label: "Quotation" },
  { key: "payment", label: "Payment" },
  { key: "rancelab", label: "RanceLab" },
  { key: "license", label: "License" },
];

function defaultDates(amc: AmcRenewalTarget) {
  const start = new Date(amc.endDate);
  start.setDate(start.getDate() + 1);
  const startDate = start.toISOString().slice(0, 10);
  return { startDate, endDate: addOneYear(startDate), amount: amc.amount || "" };
}

function currentTab(steps?: Record<RenewalStepKey, RenewalStepState>): RenewalStepKey {
  if (!steps) return "quotation";
  for (const t of TAB_META) {
    if (steps[t.key] === "current") return t.key;
  }
  if (steps.license === "done") return "license";
  return "quotation";
}

type Props = {
  amc: AmcRenewalTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenewed?: () => void;
};

export function AmcRenewalDesk({ amc, open, onOpenChange, onRenewed }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<RenewalStatus | null>(null);
  const [tab, setTab] = useState<RenewalStepKey>("quotation");
  const [form, setForm] = useState({ startDate: "", endDate: "", amount: "", notes: "" });
  const [rancelab, setRancelab] = useState({
    remitted: true,
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    reference: "",
    notes: "",
  });
  const [proofNote, setProofNote] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const loadStatus = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/amc/${id}/renewal`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load");
      const payload = data.data as RenewalStatus;
      setStatus(payload);
      setTab(currentTab(payload.steps));
      const defaults = amc ? defaultDates(amc) : { startDate: "", endDate: "", amount: "" };
      setForm({
        startDate: payload.pipeline.startDate || defaults.startDate,
        endDate: payload.pipeline.endDate || defaults.endDate,
        amount: payload.pipeline.amount || defaults.amount,
        notes: "",
      });
      setPdfUrl(payload.pipeline.quotationPdfUrl || null);
      if (payload.pipeline.rancelab) {
        setRancelab({
          remitted: payload.pipeline.rancelab.remitted ?? true,
          amount: payload.pipeline.rancelab.amount || payload.pipeline.amount || defaults.amount,
          date: payload.pipeline.rancelab.date || new Date().toISOString().slice(0, 10),
          reference: payload.pipeline.rancelab.reference || "",
          notes: payload.pipeline.rancelab.notes || "",
        });
      } else {
        setRancelab((p) => ({ ...p, amount: payload.pipeline.amount || defaults.amount }));
      }
      setProofNote(payload.pipeline.payment?.proofNote || "");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load renewal");
    } finally {
      setLoading(false);
    }
  }, [amc]);

  useEffect(() => {
    if (open && amc) {
      setForm({ ...defaultDates(amc), notes: "" });
      void loadStatus(amc.id);
    }
    if (!open) {
      setStatus(null);
      setProofFile(null);
      setPdfUrl(null);
    }
  }, [open, amc, loadStatus]);

  const setStartDate = (startDate: string) => {
    setForm((prev) => ({
      ...prev,
      startDate,
      endDate: startDate ? addOneYear(startDate) : prev.endDate,
    }));
  };

  const claimIfNeeded = async () => {
    if (!amc) return;
    try {
      await fetch(`/api/amc/${amc.id}/renewal/claim`, { method: "POST" });
    } catch {
      /* optional — employee record may be missing */
    }
  };

  const markQuotationShared = async (opts?: { pdfUrl?: string }) => {
    if (!amc) return;
    await fetch(`/api/amc/${amc.id}/renewal`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        opts?.pdfUrl
          ? { quotationPdfUrl: opts.pdfUrl }
          : { markShared: true }
      ),
    });
  };

  const createQuotation = async () => {
    if (!amc) return;
    setSubmitting(true);
    try {
      await claimIfNeeded();
      const res = await fetch(`/api/amc/${amc.id}/renewal/quotation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: form.startDate,
          endDate: form.endDate,
          amount: form.amount,
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Quotation failed");
      toast.success("Quotation created — download PDF or send via WhatsApp next");
      await loadStatus(amc.id);
      setTab("quotation");
      onRenewed?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Quotation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!amc) return;
    setSubmitting(true);
    try {
      const amount = parseFloat(form.amount) || 0;
      let design = null;
      try {
        const tplRes = await fetch(
          "/api/invoice-templates?product=rancelab&active=true"
        );
        const tplData = await tplRes.json();
        if (tplData.success && tplData.data?.design) {
          design = tplData.data.design;
        }
      } catch {
        /* use defaults inside renderer */
      }
      const { buildAmcQuotationPdf } = await import("@/lib/amc/quotationPdf");
      const blob = await buildAmcQuotationPdf({
        clientName: amc.clientName || `Client #${amc.clientId}`,
        contractNumber: amc.contractNumber,
        invoiceNumber: status?.quotationInvoice?.invoiceNumber,
        startDate: form.startDate,
        endDate: form.endDate,
        amount,
        design,
      });
      const filename = `AMC-Quotation-${amc.contractNumber || amc.id}.pdf`;
      downloadBlob(blob, filename);

      // Upload to Cloudinary for WhatsApp link; always unlock Payment after download
      try {
        const uploaded = await uploadRenewalFile({
          file: blob,
          filename,
          purpose: "amc-quotation",
          amcId: amc.id,
        });
        setPdfUrl(uploaded.url);
        await markQuotationShared({ pdfUrl: uploaded.url });
        toast.success(
          uploaded.folder
            ? `PDF downloaded · Cloudinary (${uploaded.folder}) · Payment unlocked`
            : "PDF downloaded · Payment unlocked"
        );
      } catch (uploadErr: unknown) {
        console.error(uploadErr);
        await markQuotationShared();
        toast.success("PDF downloaded · Payment unlocked");
        toast.error(
          uploadErr instanceof Error
            ? `Cloudinary upload: ${uploadErr.message}`
            : "Cloudinary upload failed"
        );
      }
      await loadStatus(amc.id);
      setTab("quotation");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "PDF failed");
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = async () => {
    if (!amc) return;
    const url = buildWhatsAppQuotationUrl({
      phoneOrGroupLink: amc.clientWhatsapp,
      groupLink: amc.clientWhatsappGroupLink,
      clientName: amc.clientName || "Client",
      amount: parseFloat(form.amount) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
      pdfUrl,
    });
    if (!url) {
      toast.error("No WhatsApp number or group link on this client");
      return;
    }
    try {
      await markQuotationShared(pdfUrl ? { pdfUrl } : undefined);
      await loadStatus(amc.id);
      setTab("quotation");
      toast.success("WhatsApp opened · Payment unlocked");
    } catch {
      /* still open WA even if meta patch fails */
    }
    if (amc.clientWhatsappGroupLink) {
      toast.message("Group opened — paste the message and attach the PDF");
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const recordPayment = async () => {
    if (!amc || !proofFile) {
      toast.error("Upload a payment screenshot first");
      return;
    }
    setSubmitting(true);
    try {
      const uploaded = await uploadRenewalFile({
        file: proofFile,
        filename: proofFile.name || `payment-proof-${amc.id}.jpg`,
        purpose: "amc-payment",
        amcId: amc.id,
      });

      const res = await fetch(`/api/amc/${amc.id}/renewal/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofUrl: uploaded.url,
          proofNote: proofNote || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Payment failed");
      toast.success(
        uploaded.folder
          ? `Payment saved · proof in ${uploaded.folder}`
          : "Payment marked with proof"
      );
      setProofFile(null);
      await loadStatus(amc.id);
      onRenewed?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const saveRancelab = async () => {
    if (!amc) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/amc/${amc.id}/renewal/rancelab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rancelab),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Remittance failed");
      toast.success("RanceLab remittance saved");
      await loadStatus(amc.id);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Remittance failed");
    } finally {
      setSubmitting(false);
    }
  };

  const completeLicense = async () => {
    if (!amc) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/amc/${amc.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: form.startDate,
          endDate: form.endDate,
          amount: form.amount,
          copyHardwareDetails: true,
          copyServicesIncluded: true,
          notes: form.notes || "License renewed after RanceLab remittance",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "License renewal failed");
      toast.success("License renewed — new contract created");
      onRenewed?.();
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "License renewal failed");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = status?.steps;
  const canOpenTab = (key: RenewalStepKey) =>
    !steps || steps[key] === "done" || steps[key] === "current";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-1 border-b px-6 py-4 text-left">
          <DialogTitle className="text-lg">
            Renewal — {amc?.clientName || `Client #${amc?.clientId}`}
          </DialogTitle>
          <DialogDescription>
            {amc?.contractNumber} · finish quotation, payment, RanceLab, and license here
            {loading ? " · loading…" : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              if (canOpenTab(v as RenewalStepKey)) setTab(v as RenewalStepKey);
            }}
          >
            <TabsList className="mb-4 grid h-auto w-full grid-cols-4 gap-1">
              {TAB_META.map((t) => (
                <TabsTrigger
                  key={t.key}
                  value={t.key}
                  disabled={!canOpenTab(t.key)}
                  className="flex flex-col gap-0.5 py-2 text-xs data-[state=active]:shadow-none"
                >
                  <span className="flex items-center gap-1">
                    {steps?.[t.key] === "done" ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : null}
                    {t.label}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-normal capitalize text-muted-foreground",
                      steps?.[t.key] === "current" && "text-primary"
                    )}
                  >
                    {steps?.[t.key] || "—"}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="quotation" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Start date</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    disabled={submitting || !!status?.pipeline.quotationInvoiceId}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">End date (start + 1 year)</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    disabled={submitting || !!status?.pipeline.quotationInvoiceId}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Taxable amount (Nu.)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  disabled={submitting || !!status?.pipeline.quotationInvoiceId}
                  onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                />
                {form.amount ? (
                  <p className="text-[10px] text-muted-foreground">
                    Invoice ≈ Nu.{" "}
                    {(parseFloat(form.amount) * 1.05 || 0).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    incl. 5% GST
                  </p>
                ) : null}
              </div>

              {status?.quotationInvoice ? (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  <p className="text-xs text-muted-foreground">Quotation invoice</p>
                  <p className="font-medium">
                    {status.quotationInvoice.invoiceNumber}{" "}
                    <Badge variant="outline" className="ml-1 capitalize">
                      {status.quotationInvoice.status}
                    </Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Also on{" "}
                    <Link href="/admin/invoice" className="text-primary underline-offset-2 hover:underline">
                      master Invoices
                    </Link>
                  </p>
                </div>
              ) : (
                <Button
                  className="w-full"
                  disabled={submitting || !form.amount}
                  onClick={createQuotation}
                >
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create quotation invoice
                </Button>
              )}

              {status?.quotationInvoice ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={submitting}
                    onClick={handleDownloadPdf}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={submitting}
                    onClick={() => void openWhatsApp()}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp client
                  </Button>
                </div>
              ) : null}

              {status?.quotationInvoice && !status.pipeline.quotationSharedAt ? (
                <p className="rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
                  Stay on Quotation — download the PDF or send via WhatsApp to unlock the Payment
                  tab.
                </p>
              ) : null}

              {status?.pipeline.quotationSharedAt && steps?.payment === "current" ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setTab("payment")}
                >
                  Continue to Payment
                </Button>
              ) : null}
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 mt-0">
              <p className="text-sm text-muted-foreground">
                Mark payment received and attach M-BoB / cheque screenshot. Stays in this modal.
              </p>
              {status?.quotationInvoice ? (
                <div className="rounded-lg border p-3 text-sm">
                  Due: Nu.{" "}
                  {(parseFloat(status.quotationInvoice.total) || 0).toLocaleString()} ·{" "}
                  <span className="capitalize">{status.quotationInvoice.status}</span>
                </div>
              ) : null}
              {status?.pipeline.payment?.proofUrl ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm">
                  <p className="font-medium text-emerald-800">Proof on file</p>
                  <a
                    href={status.pipeline.payment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline"
                  >
                    View screenshot
                  </a>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Payment screenshot</Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      disabled={submitting}
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Receipt note</Label>
                    <Textarea
                      rows={2}
                      value={proofNote}
                      disabled={submitting}
                      placeholder="M-BoB ref, cheque no…"
                      onChange={(e) => setProofNote(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={submitting || !proofFile || steps?.payment !== "current"}
                    onClick={recordPayment}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Mark paid + save proof
                  </Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="rancelab" className="space-y-4 mt-0">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remitted"
                  checked={rancelab.remitted}
                  onCheckedChange={(v) =>
                    setRancelab((p) => ({ ...p, remitted: v === true }))
                  }
                />
                <Label htmlFor="remitted">Amount sent to RanceLab</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    value={rancelab.amount}
                    disabled={submitting}
                    onChange={(e) => setRancelab((p) => ({ ...p, amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={rancelab.date}
                    disabled={submitting}
                    onChange={(e) => setRancelab((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Reference / UTR</Label>
                <Input
                  value={rancelab.reference}
                  disabled={submitting}
                  onChange={(e) => setRancelab((p) => ({ ...p, reference: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea
                  rows={2}
                  value={rancelab.notes}
                  disabled={submitting}
                  onChange={(e) => setRancelab((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
              <Button
                className="w-full"
                disabled={submitting || !rancelab.remitted || steps?.rancelab !== "current"}
                onClick={saveRancelab}
              >
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save remittance
              </Button>
            </TabsContent>

            <TabsContent value="license" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">New start</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    disabled={submitting}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">New end</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    disabled={submitting}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <Button
                className="w-full"
                disabled={submitting || steps?.license !== "current"}
                onClick={completeLicense}
              >
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-4 w-4" />
                )}
                Complete license renewal
              </Button>
              {steps?.license === "done" ? (
                <p className="text-sm text-emerald-700">Renewal complete.</p>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
