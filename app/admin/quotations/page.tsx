"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Pencil,
  Trash2,
  Download,
  MessageCircle,
  Mail,
  Link2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MbobDepositQrCard } from "@/components/admin/mbob-deposit-qr";
import {
  downloadBlob,
  renderQuotationPdf,
} from "@/lib/quotations/renderQuotationPdf";
import { quotationPublicPath } from "@/lib/quotations/shareQuotation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = ["software", "hardware", "supply", "services"] as const;

type CatalogProduct = {
  id: number;
  name: string;
  category: string;
  brand?: string | null;
  unitPrice?: string | number | null;
};

type QuotationItem = {
  productMasterId?: number | null;
  name: string;
  brand?: string | null;
  quantity: number;
  unitPrice: string | number;
  amount?: string | number;
};

type Quotation = {
  id: number;
  publicId?: string;
  quotationNumber: string;
  category: string;
  businessName?: string | null;
  customerName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  address2?: string | null;
  state?: string | null;
  totalAmount?: string | number | null;
  subtotal?: string | number | null;
  advancePercent?: string | number | null;
  advanceAmount?: string | number | null;
  validityDays?: number | null;
  status: string;
  depositQrPayload?: string | null;
  mbobAccountNumber?: string | null;
  mbobSetupError?: string | null;
  quotationFor?: string | null;
  notes?: string | null;
  items?: QuotationItem[];
};

const emptyForm = {
  category: "software",
  businessName: "",
  customerName: "",
  phone: "",
  email: "",
  address: "",
  address2: "",
  state: "Thimphu",
  quotationFor: "",
  advancePercent: "50",
  productId: "",
  quantity: "1",
};

export default function QuotationsPage() {
  const [list, setList] = useState<Quotation[]>([]);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState<string | null>(null);
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [lineItems, setLineItems] = useState<
    Array<{
      productMasterId?: number;
      name: string;
      brand?: string;
      quantity: number;
      unitPrice: number;
    }>
  >([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, pRes] = await Promise.all([
        fetch("/api/quotations"),
        fetch("/api/product-master?active=true"),
      ]);
      const qData = await qRes.json();
      const pData = await pRes.json();
      if (qRes.ok && qData.success) setList(qData.data || []);
      if (pRes.ok && pData.success) setCatalog(pData.data || []);
    } catch {
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredCatalog = useMemo(
    () => catalog.filter((p) => p.category === form.category),
    [catalog, form.category]
  );

  const canEdit = (status: string) =>
    status === "draft" || status === "sent" || status === "advance_paid";

  const resetDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setLineItems([]);
  };

  const openCreate = () => {
    resetDialog();
    setOpen(true);
  };

  const openEdit = (q: Quotation) => {
    if (!canEdit(q.status)) {
      toast.error("Converted or cancelled quotations cannot be edited");
      return;
    }
    setEditingId(q.id);
    setForm({
      category: q.category || "software",
      businessName: q.businessName || "",
      customerName: q.customerName || "",
      phone: q.phone || "",
      email: q.email || "",
      address: q.address || "",
      address2: q.address2 || "",
      state: q.state || "Thimphu",
      quotationFor: q.quotationFor || q.notes || "",
      advancePercent: String(q.advancePercent ?? 50),
      productId: "",
      quantity: "1",
    });
    setLineItems(
      (q.items || []).map((item) => ({
        productMasterId: item.productMasterId || undefined,
        name: item.name,
        brand: item.brand || undefined,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
      }))
    );
    setOpen(true);
  };

  const addLine = () => {
    const product = catalog.find((p) => String(p.id) === form.productId);
    if (!product) {
      toast.error("Select a product");
      return;
    }
    const qty = Math.max(1, Number(form.quantity) || 1);
    setLineItems((prev) => [
      ...prev,
      {
        productMasterId: product.id,
        name: product.name,
        brand: product.brand || undefined,
        quantity: qty,
        unitPrice: Number(product.unitPrice || 0),
      },
    ]);
  };

  const removeLine = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!form.businessName.trim() || lineItems.length === 0) {
      toast.error("Business name and at least one product required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        category: form.category,
        businessName: form.businessName.trim(),
        customerName: form.customerName.trim() || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        address2: form.address2 || undefined,
        state: form.state || undefined,
        quotationFor: form.quotationFor || lineItems[0]?.name,
        advancePercent: Number(form.advancePercent) || 50,
        items: lineItems,
      };

      const isEdit = editingId != null;
      const res = await fetch(
        isEdit ? `/api/quotations/${editingId}` : "/api/quotations",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isEdit ? "Update failed" : "Create failed"));
      }

      toast.success(
        isEdit
          ? `Quotation ${data.data.quotationNumber} updated`
          : `Quotation ${data.data.quotationNumber} created`
      );
      setOpen(false);
      resetDialog();
      await load();
      setSelected(data.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const downloadPdf = async (q: Quotation) => {
    setSharing("download");
    try {
      const blob = await renderQuotationPdf({
        quotationNumber: q.quotationNumber,
        category: q.category,
        businessName: q.businessName || q.customerName || "Client",
        customerName: q.customerName,
        phone: q.phone,
        email: q.email,
        address: q.address,
        quotationFor: q.quotationFor,
        validityDays: q.validityDays,
        items: (q.items || []).map((item) => ({
          name: item.name,
          brand: item.brand,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          amount: Number(
            item.amount ?? Number(item.quantity) * Number(item.unitPrice)
          ),
        })),
        subtotal: Number(q.subtotal || q.totalAmount || 0),
        totalAmount: Number(q.totalAmount || 0),
        advancePercent: Number(q.advancePercent || 0),
        advanceAmount: Number(q.advanceAmount || 0),
        notes: q.notes,
        publicUrl: q.publicId
          ? `${window.location.origin}${quotationPublicPath(q.publicId)}`
          : undefined,
        depositQrPayload: q.depositQrPayload,
        mbobAccountNumber: q.mbobAccountNumber,
      });
      downloadBlob(blob, `${q.quotationNumber.replace(/\//g, "-")}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setSharing(null);
    }
  };

  const shareQuotation = async (
    q: Quotation,
    channel: "whatsapp" | "email" | "link"
  ) => {
    setSharing(channel);
    try {
      const res = await fetch(`/api/quotations/${q.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          phone: q.phone,
          email: q.email,
          sendViaApi: true,
          markSent: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Share failed");
      }

      if (data.data?.quotation) {
        setSelected({ ...q, ...data.data.quotation });
      }
      await load();

      if (channel === "link") {
        await navigator.clipboard.writeText(data.data.publicUrl);
        toast.success("Client link copied");
      } else if (data.data.shareUrl) {
        window.open(data.data.shareUrl, "_blank", "noopener,noreferrer");
        if (data.data.api?.success && !data.data.api?.skipped) {
          toast.success(
            channel === "whatsapp"
              ? "Opened WhatsApp · Cloud API message sent"
              : "Opened email · API email sent"
          );
        } else {
          toast.success(
            channel === "whatsapp"
              ? "WhatsApp opened with quotation message"
              : "Email draft opened"
          );
          if (data.data.api?.error && !data.data.api?.skipped) {
            toast.message(String(data.data.api.error));
          }
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Share failed");
    } finally {
      setSharing(null);
    }
  };

  const markAdvance = async (id: number) => {
    try {
      const res = await fetch(`/api/quotations/${id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      toast.success("Advance marked — dashboard notified");
      load();
      setSelected(data.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const convert = async (id: number) => {
    try {
      const res = await fetch(`/api/quotations/${id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Convert failed");
      toast.success("Converted to project");
      if (data.data?.projectId) {
        window.location.href = `/admin/projects?highlight=${data.data.projectId}`;
      } else {
        load();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Convert failed");
    }
  };

  const selectQuotation = async (q: Quotation) => {
    setSelected(q);
    try {
      const res = await fetch(`/api/quotations/${q.id}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setSelected(data.data);
      }
    } catch {
      // keep list row selection
    }
  };

  const statusColor = (s: string) => {
    if (s === "advance_paid") return "default";
    if (s === "converted") return "secondary";
    if (s === "sent") return "outline";
    return "secondary";
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Quotations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Software / hardware / supply / services quotes with deposit QR
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> New Quotation
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <div className="rounded-xl border bg-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No quotations yet
            </div>
          ) : (
            list.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => selectQuotation(q)}
                className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/40 flex items-center justify-between gap-3 ${selected?.id === q.id ? "bg-muted/50" : ""}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{q.quotationNumber}</span>
                    <Badge variant={statusColor(q.status)} className="text-[10px]">
                      {q.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {q.businessName || q.customerName || "—"} · {q.category}
                  </p>
                </div>
                <div className="text-sm font-medium tabular-nums shrink-0">
                  Nu. {Number(q.totalAmount || 0).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-3 min-h-[280px]">
          {!selected ? (
            <p className="text-sm text-muted-foreground pt-8 text-center">Select a quotation</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{selected.quotationNumber}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selected.quotationFor || selected.businessName}
                  </p>
                </div>
                {canEdit(selected.status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(selected)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                )}
              </div>
              <div className="text-sm space-y-1">
                <p>
                  Total:{" "}
                  <strong>
                    Nu. {Number(selected.totalAmount || 0).toLocaleString()}
                  </strong>
                </p>
                <p>
                  Advance:{" "}
                  <strong>
                    Nu. {Number(selected.advanceAmount || 0).toLocaleString()}
                  </strong>
                </p>
                <p className="capitalize">Status: {selected.status}</p>
              </div>
              {selected.items && selected.items.length > 0 && (
                <ul className="text-xs space-y-1 rounded-lg border p-2 bg-muted/20">
                  {selected.items.map((item, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span>
                        {item.quantity}× {item.name}
                      </span>
                      <span className="tabular-nums shrink-0">
                        Nu.{" "}
                        {Number(
                          item.amount ?? Number(item.quantity) * Number(item.unitPrice)
                        ).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <MbobDepositQrCard
                payload={selected.depositQrPayload}
                amount={Number(selected.advanceAmount || 0)}
                accountLabel={selected.mbobAccountNumber || undefined}
                merchantName="INNOVATES"
                quotationNumber={selected.quotationNumber}
                setupError={selected.mbobSetupError}
              />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sharing === "download"}
                  onClick={() => downloadPdf(selected)}
                >
                  {sharing === "download" ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 mr-1" />
                  )}
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sharing === "link" || !selected.publicId}
                  onClick={() => shareQuotation(selected, "link")}
                >
                  <Link2 className="w-3.5 h-3.5 mr-1" /> Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sharing === "whatsapp"}
                  onClick={() => shareQuotation(selected, "whatsapp")}
                >
                  {sharing === "whatsapp" ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <MessageCircle className="w-3.5 h-3.5 mr-1" />
                  )}
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sharing === "email"}
                  onClick={() => shareQuotation(selected, "email")}
                >
                  {sharing === "email" ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <Mail className="w-3.5 h-3.5 mr-1" />
                  )}
                  Email
                </Button>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {selected.status !== "advance_paid" &&
                  selected.status !== "converted" && (
                    <Button onClick={() => markAdvance(selected.id)}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Mark Advance Deposited
                    </Button>
                  )}
                {(selected.status === "advance_paid" ||
                  selected.status === "converted") &&
                  selected.status !== "converted" && (
                    <Button onClick={() => convert(selected.id)}>
                      Convert to Project <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                {selected.status === "converted" && (
                  <Button variant="outline" onClick={() => convert(selected.id)}>
                    Open / Re-link Project
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetDialog();
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Quotation" : "New Quotation"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Quotation for (category)</Label>
              <Select
                value={form.category}
                onValueChange={(v) => {
                  setForm({ ...form, category: v, productId: "" });
                  if (!editingId) setLineItems([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Business Name *</Label>
                <Input
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Select product</Label>
              <div className="flex gap-2">
                <Select
                  value={form.productId}
                  onValueChange={(v) => setForm({ ...form, productId: v })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pick from product master" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCatalog.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} — Nu. {Number(p.unitPrice || 0).toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="w-20"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
                <Button type="button" variant="outline" onClick={addLine}>
                  Add
                </Button>
              </div>
            </div>
            {lineItems.length > 0 && (
              <ul className="text-sm space-y-1 rounded-lg border p-2">
                {lineItems.map((li, i) => (
                  <li key={i} className="flex justify-between items-center gap-2">
                    <span>
                      {li.quantity}× {li.name}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="tabular-nums">
                        Nu. {(li.quantity * li.unitPrice).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeLine(i)}
                        aria-label="Remove line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div>
              <Label>Advance %</Label>
              <Input
                value={form.advancePercent}
                onChange={(e) =>
                  setForm({ ...form, advancePercent: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Notes / Quotation for</Label>
              <Textarea
                value={form.quotationFor}
                onChange={(e) =>
                  setForm({ ...form, quotationFor: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetDialog();
              }}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Create Quotation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
