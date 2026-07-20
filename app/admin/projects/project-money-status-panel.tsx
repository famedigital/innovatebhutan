"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
  formatNu,
  nextStatusOptions,
} from "@/lib/projects/statusUi";
import { fetchOrQueue, isQueuedResult } from "@/lib/pwa/offline-queue";

type MoneySummary = {
  quotedTotal: number;
  advanceDue: number;
  advancePaid: number;
  balanceDue: number;
  balancePaid: number;
  writeOff: number;
  outstanding: number;
};

export function ProjectMoneyStatusPanel({
  projectId,
  status,
  moneySummary,
  canSeeMoney,
  onUpdated,
}: {
  projectId: number;
  status: string;
  moneySummary?: MoneySummary | null;
  canSeeMoney: boolean;
  onUpdated: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [nextStatus, setNextStatus] = useState("");
  const [holdReason, setHoldReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [refundStatus, setRefundStatus] = useState<"refunded" | "non_refundable" | "none">(
    "none"
  );
  const [overrideAdvance, setOverrideAdvance] = useState(false);

  const [paySlot, setPaySlot] = useState<"advance" | "balance">("advance");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"mbob" | "cheque" | "other">("mbob");
  const [proofUrl, setProofUrl] = useState("");

  const [writeOffAmount, setWriteOffAmount] = useState("");
  const [writeOffReason, setWriteOffReason] = useState("");

  const options = nextStatusOptions(status);

  const patchStatus = async () => {
    if (!nextStatus) {
      toast.error("Pick a status");
      return;
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = { status: nextStatus };
      if (nextStatus === "on_hold") body.holdReason = holdReason || "On hold";
      if (nextStatus === "cancelled") {
        body.cancelReason = cancelReason || "Cancelled";
        body.refundStatus = refundStatus;
      }
      if (nextStatus === "in_progress" && overrideAdvance) {
        body.overrideAdvanceGate = true;
      }

      const res = await fetchOrQueue(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        queueLabel: `Status → ${nextStatus}`,
      });
      if (isQueuedResult(res)) {
        toast.message("Status queued offline — will sync when online");
        setNextStatus("");
        return;
      }
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || "Status update failed");
        return;
      }
      toast.success(`Moved to ${PROJECT_STATUS_LABELS[nextStatus] || nextStatus}`);
      setNextStatus("");
      onUpdated();
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const recordPayment = async () => {
    if (!canSeeMoney) return;
    const n = parseFloat(amount);
    if (!n || n <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: paySlot,
          amount: n,
          method,
          proofUrl: proofUrl || undefined,
        }),
      });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || "Payment failed");
        return;
      }
      toast.success(`${paySlot === "advance" ? "Advance" : "Balance"} recorded`);
      setAmount("");
      setProofUrl("");
      onUpdated();
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  const writeOff = async () => {
    const n = parseFloat(writeOffAmount);
    if (!n || !writeOffReason.trim()) {
      toast.error("Amount and reason required");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "write_off",
          amount: n,
          reason: writeOffReason,
        }),
      });
      const result = await res.json();
      if (!result.success) {
        toast.error(result.error || "Write-off failed");
        return;
      }
      toast.success("Write-off recorded");
      setWriteOffAmount("");
      setWriteOffReason("");
      onUpdated();
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded-lg p-3 sm:p-4 space-y-4 bg-muted/20">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Status</span>
        <Badge
          variant="outline"
          className={PROJECT_STATUS_COLORS[status] || ""}
        >
          {PROJECT_STATUS_LABELS[status] || status}
        </Badge>
      </div>

      {canSeeMoney && moneySummary ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <div className="rounded-md border bg-background p-2">
            <div className="text-xs text-muted-foreground">Quoted</div>
            <div className="font-medium tabular-nums">
              {formatNu(moneySummary.quotedTotal)}
            </div>
          </div>
          <div className="rounded-md border bg-background p-2">
            <div className="text-xs text-muted-foreground">Advance</div>
            <div className="font-medium tabular-nums">
              {formatNu(moneySummary.advancePaid)}
              <span className="text-xs text-muted-foreground">
                {" "}
                / {formatNu(moneySummary.advanceDue)}
              </span>
            </div>
          </div>
          <div className="rounded-md border bg-background p-2">
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="font-medium tabular-nums">
              {formatNu(moneySummary.balancePaid)}
              <span className="text-xs text-muted-foreground">
                {" "}
                / {formatNu(moneySummary.balanceDue)}
              </span>
            </div>
          </div>
          <div className="rounded-md border bg-background p-2">
            <div className="text-xs text-muted-foreground">Outstanding</div>
            <div className="font-medium tabular-nums">
              {formatNu(moneySummary.outstanding)}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Money hidden for your role.</p>
      )}

      {options.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <div className="text-xs font-medium text-muted-foreground">Move status</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={nextStatus} onValueChange={setNextStatus}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Next status" />
              </SelectTrigger>
              <SelectContent>
                {options.map((s) => (
                  <SelectItem key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s] || s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={patchStatus} disabled={busy || !nextStatus} size="sm">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update"}
            </Button>
          </div>
          {nextStatus === "in_progress" && canSeeMoney && (
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={overrideAdvance}
                onChange={(e) => setOverrideAdvance(e.target.checked)}
              />
              Override advance gate (warn-and-continue)
            </label>
          )}
          {nextStatus === "on_hold" && (
            <Input
              placeholder="Hold reason *"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
            />
          )}
          {nextStatus === "cancelled" && canSeeMoney && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Cancel reason *"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <Select
                value={refundStatus}
                onValueChange={(v) =>
                  setRefundStatus(v as "refunded" | "non_refundable" | "none")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Refund status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No advance / N/A</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="non_refundable">Non-refundable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {canSeeMoney && (
        <div className="space-y-2 border-t pt-3">
          <div className="text-xs font-medium text-muted-foreground">
            Record payment (M-BoB / Cheque + proof URL)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select
              value={paySlot}
              onValueChange={(v) => setPaySlot(v as "advance" | "balance")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advance">Advance</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as "mbob" | "cheque" | "other")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mbob">M-BoB</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={recordPayment} disabled={busy}>
              Save
            </Button>
          </div>
          <Input
            placeholder="Proof URL (optional)"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
          />
        </div>
      )}

      {canSeeMoney && (
        <div className="space-y-2 border-t pt-3">
          <div className="text-xs font-medium text-muted-foreground">
            Write-off remaining balance
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Amount"
              value={writeOffAmount}
              onChange={(e) => setWriteOffAmount(e.target.value)}
            />
            <Input
              placeholder="Reason"
              value={writeOffReason}
              onChange={(e) => setWriteOffReason(e.target.value)}
            />
            <Button size="sm" variant="outline" onClick={writeOff} disabled={busy}>
              Write off
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
