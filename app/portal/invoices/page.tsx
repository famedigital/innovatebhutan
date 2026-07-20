"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ExternalLink, Upload } from "lucide-react";

type Invoice = {
  id: number;
  invoiceNumber: string | null;
  status: string | null;
  total: string | null;
  dueDate: string | null;
  pdfUrl: string | null;
};

type PayInstructions = {
  note: string;
  payee: string;
  gstTin: string;
};

export default function PortalInvoicesPage() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [pay, setPay] = useState<PayInstructions | null>(null);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [method, setMethod] = useState("mbob");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const res = await fetch("/api/portal/invoices");
    const json = await res.json();
    if (json.success) {
      setRows(json.data || []);
      setPay(json.payInstructions || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const submitProof = async () => {
    if (!selected || !file) {
      toast.error("Choose a screenshot");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("invoiceId", String(selected.id));
      form.append("method", method);
      form.append("file", file);
      const res = await fetch("/api/portal/payments/proof", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Upload failed");
        return;
      }
      toast.success("Payment screenshot submitted — we will confirm soon");
      setPayOpen(false);
      setFile(null);
      setSelected(null);
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Invoices</h1>
      {pay && (
        <Card>
          <CardContent className="p-4 text-sm space-y-1">
            <p className="font-medium">Payment instructions</p>
            <p className="text-xs text-muted-foreground">{pay.note}</p>
            <p className="text-xs">
              Payee: {pay.payee} · GST/TIN: {pay.gstTin}
            </p>
          </CardContent>
        </Card>
      )}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No invoices yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {inv.invoiceNumber || `INV-${inv.id}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Nu. {Number(inv.total || 0).toLocaleString()}
                    {inv.dueDate
                      ? ` · due ${new Date(inv.dueDate).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{inv.status}</Badge>
                  {inv.pdfUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={inv.pdfUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        PDF
                      </a>
                    </Button>
                  )}
                  {["sent", "overdue", "draft"].includes(inv.status || "") && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelected(inv);
                        setPayOpen(true);
                      }}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Pay proof
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Upload payment proof · {selected?.invoiceNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Method</Label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="mbob">M-BoB</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <Label>Screenshot</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                className="mt-1"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button disabled={submitting} onClick={() => void submitProof()}>
              {submitting ? "Uploading…" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
