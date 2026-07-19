"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ExternalLink,
  Loader2,
  RotateCcw,
  Wifi,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { addOneYear, type RenewalStepKey, type RenewalStepState } from "@/lib/amc/renewal";
import { toast } from "sonner";

export type AmcDetail = {
  id: number;
  clientId: number;
  clientName?: string;
  clientWhatsapp?: string;
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

const STEP_LABELS: { key: RenewalStepKey; title: string; hint: string }[] = [
  { key: "quotation", title: "Send quotation", hint: "Invoice with 5% GST" },
  { key: "payment", title: "Receive payment", hint: "Mark invoice paid" },
  { key: "rancelab", title: "Send to RanceLab", hint: "Amount, date, reference" },
  { key: "license", title: "Renew license", hint: "Create new contract" },
];

function defaultRenewalDates(amc: AmcDetail) {
  const start = new Date(amc.endDate);
  start.setDate(start.getDate() + 1);
  const startDate = start.toISOString().slice(0, 10);
  return { startDate, endDate: addOneYear(startDate), amount: amc.amount || "" };
}

function StepIcon({ state }: { state: RenewalStepState }) {
  if (state === "done") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Check className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xs font-semibold text-primary">
        •
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-muted-foreground/30 text-xs text-muted-foreground">
      ○
    </span>
  );
}

type Props = {
  amc: AmcDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenewed?: () => void;
  getStatusColor?: (status: string) => string;
};

export function AmcDetailSheet({
  amc,
  open,
  onOpenChange,
  onRenewed,
  getStatusColor,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<RenewalStatus | null>(null);
  const [form, setForm] = useState({ startDate: "", endDate: "", amount: "", notes: "" });
  const [rancelab, setRancelab] = useState({
    remitted: true,
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    reference: "",
    notes: "",
  });

  const loadStatus = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/amc/${id}/renewal`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load renewal status");
      }
      const payload = data.data as RenewalStatus;
      setStatus(payload);
      const defaults = amc ? defaultRenewalDates(amc) : { startDate: "", endDate: "", amount: "" };
      setForm({
        startDate: payload.pipeline.startDate || defaults.startDate,
        endDate: payload.pipeline.endDate || defaults.endDate,
        amount: payload.pipeline.amount || defaults.amount,
        notes: "",
      });
      if (payload.pipeline.rancelab) {
        setRancelab({
          remitted: payload.pipeline.rancelab.remitted ?? true,
          amount: payload.pipeline.rancelab.amount || payload.pipeline.amount || defaults.amount,
          date: payload.pipeline.rancelab.date || new Date().toISOString().slice(0, 10),
          reference: payload.pipeline.rancelab.reference || "",
          notes: payload.pipeline.rancelab.notes || "",
        });
      } else {
        setRancelab((prev) => ({
          ...prev,
          amount: payload.pipeline.amount || defaults.amount,
        }));
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load renewal");
    } finally {
      setLoading(false);
    }
  }, [amc]);

  useEffect(() => {
    if (open && amc) {
      setForm({ ...defaultRenewalDates(amc), notes: "" });
      void loadStatus(amc.id);
    }
    if (!open) {
      setStatus(null);
    }
  }, [open, amc, loadStatus]);

  const setStartDate = (startDate: string) => {
    setForm((prev) => ({
      ...prev,
      startDate,
      endDate: startDate ? addOneYear(startDate) : prev.endDate,
    }));
  };

  const createQuotation = async () => {
    if (!amc) return;
    setSubmitting(true);
    try {
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create quotation");
      }
      toast.success("Quotation invoice sent");
      await loadStatus(amc.id);
      onRenewed?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Quotation failed");
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
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save remittance");
      }
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
          notes: form.notes || `License renewed after RanceLab remittance`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to renew license");
      }
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
  const canEditDates =
    !status?.pipeline.quotationInvoiceId ||
    steps?.quotation === "current" ||
    steps?.license === "current";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-md">
        {amc && (
          <>
            <SheetHeader className="space-y-1 border-b px-6 py-5 pr-12 text-left">
              <SheetTitle className="text-lg leading-snug">
                {amc.clientName || `Client #${amc.clientId}`}
              </SheetTitle>
              <SheetDescription>
                {amc.contractNumber || `AMC-${amc.id}`}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 px-6 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(getStatusColor?.(amc.status))}
                >
                  {amc.status}
                </Badge>
                {amc.renewedTo ? (
                  <Badge variant="secondary">Already renewed</Badge>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">End date</p>
                  <p className="font-medium">
                    {amc.endDate ? new Date(amc.endDate).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contract value</p>
                  <p className="font-medium">
                    Nu. {(parseFloat(amc.amount || "0") || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="justify-start">
                  <Link href={`/admin/clients/${amc.clientId}`}>
                    Open client
                    <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-60" />
                  </Link>
                </Button>
                {amc.clientWhatsapp ? (
                  <Button asChild variant="outline" className="justify-start">
                    <a
                      href={`https://wa.me/${amc.clientWhatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Wifi className="mr-2 h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                ) : null}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Renewal process</h3>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : null}
                </div>

                {!status?.canRenew && !amc.renewedTo ? (
                  <p className="text-sm text-muted-foreground">
                    This contract cannot be renewed.
                  </p>
                ) : null}

                {steps ? (
                  <ol className="space-y-3">
                    {STEP_LABELS.map((step) => (
                      <li key={step.key} className="flex gap-3">
                        <StepIcon state={steps[step.key]} />
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p
                            className={cn(
                              "text-sm font-medium",
                              steps[step.key] === "locked" && "text-muted-foreground"
                            )}
                          >
                            {step.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{step.hint}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : null}

                {status?.quotationInvoice ? (
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    <p className="text-xs text-muted-foreground">Quotation invoice</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <Link
                        href={`/admin/invoice?invoiceId=${status.quotationInvoice.id}`}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                      >
                        {status.quotationInvoice.invoiceNumber}
                      </Link>
                      <Badge variant="outline" className="capitalize">
                        {status.quotationInvoice.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Nu.{" "}
                      {(parseFloat(status.quotationInvoice.total) || 0).toLocaleString()}{" "}
                      · incl. 5% GST
                    </p>
                    {status.quotationInvoice.status !== "paid" ? (
                      <Button asChild size="sm" variant="secondary" className="mt-2 w-full">
                        <Link href={`/admin/invoice?invoiceId=${status.quotationInvoice.id}`}>
                          Mark payment on invoices
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                ) : null}

                {/* Dates / amount — editable before quotation and for license */}
                {(steps?.quotation === "current" || steps?.license === "current") && (
                  <div className="space-y-3 rounded-lg border p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="renew-start" className="text-xs">
                          Start date
                        </Label>
                        <Input
                          id="renew-start"
                          type="date"
                          value={form.startDate}
                          disabled={!canEditDates || submitting}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="renew-end" className="text-xs">
                          End date
                        </Label>
                        <Input
                          id="renew-end"
                          type="date"
                          value={form.endDate}
                          disabled={submitting}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Defaults to start + 1 year
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="renew-amount" className="text-xs">
                        Amount (Nu.) — taxable
                      </Label>
                      <Input
                        id="renew-amount"
                        type="number"
                        value={form.amount}
                        disabled={submitting || !!status?.pipeline.quotationInvoiceId}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, amount: e.target.value }))
                        }
                      />
                      {form.amount && steps?.quotation === "current" ? (
                        <p className="text-[10px] text-muted-foreground">
                          Invoice total ≈ Nu.{" "}
                          {(
                            parseFloat(form.amount) * 1.05 || 0
                          ).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
                          (incl. GST)
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}

                {steps?.quotation === "current" ? (
                  <Button
                    className="w-full"
                    disabled={submitting || !form.amount || !form.startDate}
                    onClick={createQuotation}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Send quotation invoice
                  </Button>
                ) : null}

                {steps?.rancelab === "current" ? (
                  <div className="space-y-3 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remitted"
                        checked={rancelab.remitted}
                        onCheckedChange={(v) =>
                          setRancelab((prev) => ({ ...prev, remitted: v === true }))
                        }
                      />
                      <Label htmlFor="remitted" className="text-sm font-medium">
                        Amount sent to RanceLab
                      </Label>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Amount</Label>
                        <Input
                          type="number"
                          value={rancelab.amount}
                          disabled={submitting}
                          onChange={(e) =>
                            setRancelab((prev) => ({ ...prev, amount: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={rancelab.date}
                          disabled={submitting}
                          onChange={(e) =>
                            setRancelab((prev) => ({ ...prev, date: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Reference / UTR</Label>
                      <Input
                        value={rancelab.reference}
                        disabled={submitting}
                        placeholder="Transfer ref"
                        onChange={(e) =>
                          setRancelab((prev) => ({ ...prev, reference: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={rancelab.notes}
                        disabled={submitting}
                        rows={2}
                        placeholder="Anything else…"
                        onChange={(e) =>
                          setRancelab((prev) => ({ ...prev, notes: e.target.value }))
                        }
                      />
                    </div>
                    <Button
                      className="w-full"
                      disabled={submitting || !rancelab.remitted}
                      onClick={saveRancelab}
                    >
                      {submitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Save remittance
                    </Button>
                  </div>
                ) : null}

                {steps?.license === "current" ? (
                  <Button
                    className="w-full"
                    disabled={submitting || !form.amount}
                    onClick={completeLicense}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    )}
                    Complete license renewal
                  </Button>
                ) : null}

                {steps?.license === "done" ? (
                  <p className="text-sm text-emerald-700">Renewal complete.</p>
                ) : null}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
