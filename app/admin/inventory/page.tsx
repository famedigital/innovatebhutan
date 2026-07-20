"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Package, Warehouse, AlertCircle, Edit, Trash2, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface Item {
  id: number;
  publicId: string;
  name: string;
  sku: string;
  category?: string;
  unit: string;
  costPrice?: string;
  sellingPrice?: string;
  reorderLevel?: number;
  isActive: boolean;
}

interface ItemFormData {
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: string;
  sellingPrice: string;
  reorderLevel: string;
}

const emptyForm: ItemFormData = {
  name: "",
  sku: "",
  category: "",
  unit: "pcs",
  costPrice: "",
  sellingPrice: "",
  reorderLevel: "10",
};

export default function InventoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [stockForm, setStockForm] = useState({
    itemId: "",
    warehouseId: "1",
    quantity: "1",
    operation: "receipt",
    remarks: "",
    projectId: "",
    serialNo: "",
  });
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>(emptyForm);

  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/inventory/");
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        const msg =
          result.error || `Failed to load inventory (HTTP ${response.status})`;
        setLoadError(msg);
        toast.error(msg);
        setItems([]);
        return;
      }
      setItems(result.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      const msg = "Failed to load inventory";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEditDialog = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category || "",
      unit: item.unit,
      costPrice: item.costPrice || "",
      sellingPrice: item.sellingPrice || "",
      reorderLevel: String(item.reorderLevel || 10),
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: Item) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.sku.trim() || !formData.unit.trim()) {
      toast.error("Name, SKU, and Unit are required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category.trim() || undefined,
        unit: formData.unit.trim(),
        costPrice: formData.costPrice || undefined,
        sellingPrice: formData.sellingPrice || undefined,
        reorderLevel: parseInt(formData.reorderLevel) || 10,
      };

      const url = editingItem ? `/api/inventory/${editingItem.id}` : "/api/inventory";
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingItem ? "Item updated" : "Item created");
        setDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/inventory/${deletingItem.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Item deleted");
        setDeleteDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Delete failed");
      }
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setSubmitting(false);
    }
  };

  const totalValue = items.reduce(
    (sum, i) => sum + (parseFloat(i.costPrice || "0")),
    0
  );
  const lowStockCount = items.filter((i) => (i.reorderLevel || 0) < 10).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            <a href="/admin" className="hover:underline">Admin</a>
            {" / "}
            Stock
            {" / "}
            Inventory
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Items, stock levels, and movements</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setStockOpen(true)}>
            <Package className="w-4 h-4 mr-2" />
            Stock entry
          </Button>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Items</span>
              <Package className="w-5 h-5 text-[#3ECF8E]" />
            </div>
            <p className="text-2xl font-bold mt-2">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Low Stock Items</span>
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{lowStockCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Est. Value</span>
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-2">
              Nu.{totalValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Cost Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Reorder Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      {loadError ? (
                        <span className="text-destructive">{loadError}</span>
                      ) : (
                        "No items found. Add your first item to get started."
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                      <TableCell>{item.category || "-"}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        {item.costPrice ? `Nu.${parseFloat(item.costPrice).toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        {item.sellingPrice ? `Nu.${parseFloat(item.sellingPrice).toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.reorderLevel && item.reorderLevel < 10 ? "destructive" : "outline"}>
                          {item.reorderLevel || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? "default" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openDeleteDialog(item)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "Update item details" : "Create a new inventory item"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Cat6 Cable"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="e.g., CAT6-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Cables"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., pcs, meters"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                placeholder="10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingItem?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={submitting} className="bg-destructive">
              {submitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={stockOpen} onOpenChange={setStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stock entry</DialogTitle>
            <DialogDescription>
              Receipt or issue stock against an item (warehouse id required).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Item</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={stockForm.itemId}
                onChange={(e) =>
                  setStockForm({ ...stockForm, itemId: e.target.value })
                }
              >
                <option value="">Select item…</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.sku})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Operation</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={stockForm.operation}
                onChange={(e) =>
                  setStockForm({ ...stockForm, operation: e.target.value })
                }
              >
                <option value="receipt">Receipt (in)</option>
                <option value="issue">Issue (out)</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Warehouse ID</Label>
                <Input
                  value={stockForm.warehouseId}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, warehouseId: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={stockForm.quantity}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, quantity: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Remarks</Label>
              <Input
                value={stockForm.remarks}
                onChange={(e) =>
                  setStockForm({ ...stockForm, remarks: e.target.value })
                }
              />
            </div>
            {stockForm.operation === "issue" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Project ID (optional)</Label>
                  <Input
                    placeholder="e.g. 12"
                    value={stockForm.projectId}
                    onChange={(e) =>
                      setStockForm({ ...stockForm, projectId: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Serial no. (optional)</Label>
                  <Input
                    value={stockForm.serialNo}
                    onChange={(e) =>
                      setStockForm({ ...stockForm, serialNo: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={submitting}
              onClick={async () => {
                if (!stockForm.itemId) {
                  toast.error("Select an item");
                  return;
                }
                setSubmitting(true);
                try {
                  const res = await fetch("/api/inventory/stock/entry", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      operation: stockForm.operation,
                      itemId: parseInt(stockForm.itemId, 10),
                      warehouseId: parseInt(stockForm.warehouseId, 10) || 1,
                      quantity: parseFloat(stockForm.quantity) || 1,
                      remarks: stockForm.remarks || undefined,
                      ...(stockForm.operation === "issue" && stockForm.projectId
                        ? {
                            referenceType: "project",
                            referenceId: parseInt(stockForm.projectId, 10),
                          }
                        : {}),
                      ...(stockForm.serialNo
                        ? { serialNo: stockForm.serialNo }
                        : {}),
                    }),
                  });
                  const json = await res.json();
                  if (!json.success) throw new Error(json.error || "Failed");
                  toast.success("Stock entry recorded");
                  setStockOpen(false);
                  setStockForm({
                    itemId: "",
                    warehouseId: "1",
                    quantity: "1",
                    operation: "receipt",
                    remarks: "",
                    projectId: "",
                    serialNo: "",
                  });
                  fetchData();
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Stock entry failed"
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {submitting ? "Saving…" : "Post entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
