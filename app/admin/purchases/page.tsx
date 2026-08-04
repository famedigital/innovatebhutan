"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

type Purchase = {
  id: number;
  supplierName: string;
  billReferenceNo?: string | null;
  purchaseDate?: string | null;
  paymentTimeline?: string | null;
  totalLandedCost?: string | number | null;
  totalPurchaseAmount?: string | number | null;
  status: string;
};

type Line = {
  productName: string;
  quantity: number;
  costPrice: number;
  taxAmount: number;
  mrp?: number;
};

export default function PurchaseMasterPage() {
  const [list, setList] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    supplierName: "",
    billReferenceNo: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    paymentTimeline: "cash",
    creditDays: "",
    advancePayment: "",
    gstPaid: "",
    declarationFees: "",
    freightCharges: "",
    totalFreightCharges: "",
    salesRate: "",
  });
  const [lines, setLines] = useState<Line[]>([
    { productName: "", quantity: 1, costPrice: 0, taxAmount: 0 },
  ]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchases");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setList(data.data || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!form.supplierName.trim()) {
      toast.error("Supplier name required");
      return;
    }
    const validLines = lines.filter((l) => l.productName.trim());
    if (validLines.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierName: form.supplierName.trim(),
          billReferenceNo: form.billReferenceNo || undefined,
          purchaseDate: form.purchaseDate || undefined,
          paymentTimeline: form.paymentTimeline,
          creditDays: form.creditDays ? Number(form.creditDays) : 0,
          advancePayment: Number(form.advancePayment) || 0,
          gstPaid: Number(form.gstPaid) || 0,
          declarationFees: Number(form.declarationFees) || 0,
          freightCharges: Number(form.freightCharges) || 0,
          totalFreightCharges: Number(form.totalFreightCharges) || 0,
          salesRate: form.salesRate ? Number(form.salesRate) : undefined,
          items: validLines.map((l) => ({
            productName: l.productName,
            quantity: l.quantity,
            costPrice: l.costPrice,
            taxAmount: l.taxAmount,
            mrp: l.mrp,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      toast.success("Purchase saved");
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Purchase Master</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Supplier bills, freight &amp; landed cost (Nu.)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
          <Button size="sm" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> New Purchase</Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b bg-muted/30">
          <div className="col-span-3">Supplier</div>
          <div className="col-span-2">Bill Ref</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Payment</div>
          <div className="col-span-2">Landed (Nu.)</div>
          <div className="col-span-1">Status</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No purchases yet
          </div>
        ) : (
          list.map((p) => (
            <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b last:border-0 text-sm items-center">
              <div className="col-span-3 font-medium truncate">{p.supplierName}</div>
              <div className="col-span-2 truncate text-muted-foreground">{p.billReferenceNo || "—"}</div>
              <div className="col-span-2 text-muted-foreground">
                {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : "—"}
              </div>
              <div className="col-span-2 capitalize text-muted-foreground">{p.paymentTimeline || "cash"}</div>
              <div className="col-span-2 tabular-nums font-medium">{Number(p.totalLandedCost || 0).toLocaleString()}</div>
              <div className="col-span-1">
                <Badge variant="secondary" className="text-[10px]">{p.status}</Badge>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Management</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Supplier Name *</Label>
                <Input value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} />
              </div>
              <div>
                <Label>Bill Reference No</Label>
                <Input value={form.billReferenceNo} onChange={(e) => setForm({ ...form, billReferenceNo: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Purchase Date</Label>
                <Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
              </div>
              <div>
                <Label>Payment Timeline</Label>
                <Select value={form.paymentTimeline} onValueChange={(v) => setForm({ ...form, paymentTimeline: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.paymentTimeline === "days" && (
              <div>
                <Label>Credit Days</Label>
                <Input type="number" value={form.creditDays} onChange={(e) => setForm({ ...form, creditDays: e.target.value })} />
              </div>
            )}
            <div>
              <Label>Product Details</Label>
              <div className="space-y-2 mt-1">
                {lines.map((line, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-1">
                    <Input className="col-span-4" placeholder="Product name" value={line.productName}
                      onChange={(e) => setLines((prev) => prev.map((l, i) => i === idx ? { ...l, productName: e.target.value } : l))} />
                    <Input className="col-span-2" type="number" placeholder="Qty" value={line.quantity}
                      onChange={(e) => setLines((prev) => prev.map((l, i) => i === idx ? { ...l, quantity: Number(e.target.value) || 1 } : l))} />
                    <Input className="col-span-3" type="number" placeholder="Cost" value={line.costPrice || ""}
                      onChange={(e) => setLines((prev) => prev.map((l, i) => i === idx ? { ...l, costPrice: Number(e.target.value) || 0 } : l))} />
                    <Input className="col-span-3" type="number" placeholder="+ Tax" value={line.taxAmount || ""}
                      onChange={(e) => setLines((prev) => prev.map((l, i) => i === idx ? { ...l, taxAmount: Number(e.target.value) || 0 } : l))} />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setLines((p) => [...p, { productName: "", quantity: 1, costPrice: 0, taxAmount: 0 }])}>
                  + Add Product
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>GST Paid (Nu.)</Label>
                <Input type="number" value={form.gstPaid} onChange={(e) => setForm({ ...form, gstPaid: e.target.value })} />
              </div>
              <div>
                <Label>Declaration Fees</Label>
                <Input type="number" value={form.declarationFees} onChange={(e) => setForm({ ...form, declarationFees: e.target.value })} />
              </div>
              <div>
                <Label>Freight Charges</Label>
                <Input type="number" value={form.freightCharges} onChange={(e) => setForm({ ...form, freightCharges: e.target.value })} />
              </div>
              <div>
                <Label>Total Freight (Entry → Thimphu)</Label>
                <Input type="number" value={form.totalFreightCharges} onChange={(e) => setForm({ ...form, totalFreightCharges: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
