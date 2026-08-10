"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Package,
  RefreshCw,
  Pencil,
  Trash2,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = ["software", "hardware", "supply", "services"] as const;

type Product = {
  id: number;
  name: string;
  category: string;
  brand?: string | null;
  unitPrice?: string | number | null;
  masterStatus?: string | null;
  isActive?: boolean | null;
  sku?: string | null;
  description?: string | null;
  unit?: string | null;
};

const emptyForm = {
  name: "",
  category: "software",
  brand: "",
  unitPrice: "",
  sku: "",
  description: "",
  unit: "pcs",
  masterStatus: "completed",
  isActive: true,
};

export default function ProductMasterPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("true");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      if (activeFilter !== "all") params.set("active", activeFilter);
      const res = await fetch(`/api/product-master?${params}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load");
      setItems(data.data || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [category, search, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const resetDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    resetDialog();
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name || "",
      category: p.category || "software",
      brand: p.brand || "",
      unitPrice: String(p.unitPrice ?? ""),
      sku: p.sku || "",
      description: p.description || "",
      unit: p.unit || "pcs",
      masterStatus: p.masterStatus || "completed",
      isActive: p.isActive !== false,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        brand: form.brand.trim() || null,
        sku: form.sku.trim() || null,
        description: form.description.trim() || null,
        unitPrice: form.unitPrice ? Number(form.unitPrice) : 0,
        unit: form.unit || "pcs",
        masterStatus: form.masterStatus,
        isActive: form.isActive,
      };

      const isEdit = editingId != null;
      const res = await fetch(
        isEdit ? `/api/product-master/${editingId}` : "/api/product-master",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isEdit ? "Update failed" : "Create failed"));
      }

      toast.success(isEdit ? "Product updated" : "Product added");
      setOpen(false);
      resetDialog();
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/product-master/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Delete failed");
      }
      toast.success(`“${deleteTarget.name}” deactivated`);
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const reactivate = async (p: Product) => {
    try {
      const res = await fetch(`/api/product-master/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Reactivate failed");
      }
      toast.success(`“${p.name}” reactivated`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reactivate failed");
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Product Master
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Software, hardware, supply &amp; services catalog for quotations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-muted-foreground border-b bg-muted/30">
          <div className="col-span-3">Product</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Brand</div>
          <div className="col-span-2">Price (Nu.)</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No products found
          </div>
        ) : (
          items.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 border-b last:border-0 text-sm items-center"
            >
              <div className="sm:col-span-3 font-medium truncate">
                {p.name}
                {p.sku ? (
                  <span className="block text-[11px] text-muted-foreground font-normal">
                    {p.sku}
                  </span>
                ) : null}
              </div>
              <div className="sm:col-span-2 capitalize text-muted-foreground">
                {p.category}
              </div>
              <div className="sm:col-span-2 truncate text-muted-foreground">
                {p.brand || "—"}
              </div>
              <div className="sm:col-span-2 tabular-nums">
                {Number(p.unitPrice || 0).toLocaleString()}
              </div>
              <div className="sm:col-span-1 flex flex-wrap gap-1">
                <Badge
                  variant={p.isActive === false ? "outline" : "secondary"}
                  className="text-[10px]"
                >
                  {p.isActive === false ? "inactive" : "active"}
                </Badge>
              </div>
              <div className="sm:col-span-2 flex justify-start sm:justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => openEdit(p)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                {p.isActive === false ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => reactivate(p)}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetDialog();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Rancelab Offline"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
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
              <div>
                <Label>Brand</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unit Price (Nu.)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm({ ...form, unitPrice: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="pcs"
                />
              </div>
              <div>
                <Label>Master status</Label>
                <Select
                  value={form.masterStatus}
                  onValueChange={(v) => setForm({ ...form, masterStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">completed</SelectItem>
                    <SelectItem value="pending">pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            {editingId ? (
              <div>
                <Label>Active</Label>
                <Select
                  value={form.isActive ? "true" : "false"}
                  onValueChange={(v) =>
                    setForm({ ...form, isActive: v === "true" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
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
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Saving…
                </>
              ) : editingId ? (
                "Save Changes"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate product?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.name}” will be marked inactive and hidden from new
              quotations. Past quotations stay linked. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
