"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, ShoppingCart, Users, FileText, Edit, Trash2, MoreVertical, Phone, Mail } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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

interface Supplier {
  id: number;
  publicId: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  isActive: boolean;
}

interface PurchaseOrder {
  id: number;
  publicId: string;
  orderNumber: string;
  supplierName: string;
  totalAmount: string;
  status: string;
  orderDate: Date;
}

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  taxId: string;
}

const emptySupplierForm: SupplierFormData = {
  name: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  taxId: "",
};

export default function ProcurementPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [rfqs, setRfqs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"po" | "suppliers" | "rfq">("suppliers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [poDialogOpen, setPoDialogOpen] = useState(false);
  const [rfqDialogOpen, setRfqDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>(emptySupplierForm);
  const [poForm, setPoForm] = useState({
    supplierId: "",
    notes: "",
    itemDescription: "",
    quantity: "1",
    rate: "0",
  });
  const [rfqForm, setRfqForm] = useState({
    title: "",
    description: "",
    supplierId: "",
    itemDescription: "",
    quantity: "1",
    unit: "pcs",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "suppliers"
          ? "/api/procurement/suppliers"
          : activeTab === "po"
            ? "/api/procurement/purchase-orders"
            : "/api/procurement/rfq";

      const response = await fetch(endpoint);
      const result = await response.json();
      if (result.success) {
        if (activeTab === "suppliers") setSuppliers(result.data || []);
        else if (activeTab === "po") setOrders(result.data || []);
        else setRfqs(result.data || []);
      } else {
        toast.error(result.error || "Failed to load data");
      }
    } catch (error) {
      toast.error("Failed to load data - tables may not exist yet");
    } finally {
      setLoading(false);
    }
  };

  const ensureSuppliersLoaded = async () => {
    if (suppliers.length > 0) return;
    try {
      const response = await fetch("/api/procurement/suppliers");
      const result = await response.json();
      if (result.success) setSuppliers(result.data || []);
    } catch {
      /* ignore */
    }
  };

  const openCreateDialog = () => {
    setEditingSupplier(null);
    setFormData({ ...emptySupplierForm });
    setDialogOpen(true);
  };

  const openPoDialog = async () => {
    await ensureSuppliersLoaded();
    setPoForm({
      supplierId: "",
      notes: "",
      itemDescription: "",
      quantity: "1",
      rate: "0",
    });
    setPoDialogOpen(true);
  };

  const openRfqDialog = async () => {
    await ensureSuppliersLoaded();
    setRfqForm({
      title: "",
      description: "",
      supplierId: "",
      itemDescription: "",
      quantity: "1",
      unit: "pcs",
    });
    setRfqDialogOpen(true);
  };

  const handleCreatePo = async () => {
    const supplierId = Number(poForm.supplierId);
    if (!supplierId) {
      toast.error("Supplier is required");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/procurement/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          notes: poForm.notes || undefined,
          items: [
            {
              itemId: 1,
              description: poForm.itemDescription || "Line item",
              quantity: Number(poForm.quantity) || 1,
              rate: poForm.rate || "0",
            },
          ],
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Purchase order created");
        setPoDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Failed to create PO");
      }
    } catch {
      toast.error("Failed to create PO");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateRfq = async () => {
    if (!rfqForm.title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/procurement/rfq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rfqForm.title.trim(),
          description: rfqForm.description || undefined,
          suppliers: rfqForm.supplierId
            ? [{ supplierId: Number(rfqForm.supplierId) }]
            : [],
          items: [
            {
              description: rfqForm.itemDescription || rfqForm.title,
              quantity: Number(rfqForm.quantity) || 1,
              unit: rfqForm.unit || "pcs",
            },
          ],
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("RFQ created");
        setRfqDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Failed to create RFQ");
      }
    } catch {
      toast.error("Failed to create RFQ");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      city: supplier.city || "",
      address: "",
      taxId: "",
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        city: formData.city.trim() || undefined,
        address: formData.address.trim() || undefined,
        taxId: formData.taxId.trim() || undefined,
      };

      const url = editingSupplier
        ? `/api/procurement/suppliers/${editingSupplier.id}`
        : "/api/procurement/suppliers";
      const method = editingSupplier ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingSupplier ? "Supplier updated" : "Supplier created");
        setDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Failed to save supplier");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/procurement/suppliers/${deletingSupplier.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Supplier deleted");
        setDeleteDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Delete failed");
      }
    } catch (error) {
      toast.error("Failed to delete supplier");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "received":
        return "default";
      case "rejected":
        return "destructive";
      case "issued":
        return "secondary";
      default:
        return "outline";
    }
  };

  const totalOrders = orders.length;
  const activeSuppliers = suppliers.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Procurement</h1>
          <p className="text-sm text-muted-foreground">Purchase orders & suppliers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {activeTab === "suppliers" ? (
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          ) : activeTab === "po" ? (
            <Button onClick={openPoDialog}>
              <Plus className="w-4 h-4 mr-2" />
              New PO
            </Button>
          ) : (
            <Button onClick={openRfqDialog}>
              <Plus className="w-4 h-4 mr-2" />
              New RFQ
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {(["suppliers", "po", "rfq"] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "po" ? "Purchase Orders" : tab === "suppliers" ? "Suppliers" : "RFQs"}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Suppliers</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-2">{activeSuppliers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Orders</span>
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending Orders</span>
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold mt-2">
              {orders.filter((o) => o.status === "draft" || o.status === "submitted").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "po" ? "Purchase Orders" : activeTab === "suppliers" ? "Suppliers" : "Requests for Quotation"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : activeTab === "suppliers" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No suppliers found. Add your first supplier to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          {supplier.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {supplier.email}
                            </span>
                          )}
                          {supplier.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {supplier.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{supplier.city || "No location"}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.isActive ? "default" : "secondary"}>
                          {supplier.isActive ? "Active" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => openEditDialog(supplier)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openDeleteDialog(supplier)}
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No purchase orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.supplierName}</TableCell>
                      <TableCell>Nu.{Number(order.totalAmount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              View Details
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

      {/* Create/Edit Supplier Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? "Update supplier details" : "Add a new supplier to your database"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tech Supplies Bhutan"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+975-2-12345"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Thimphu"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="Tax ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingSupplier ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingSupplier?.name}&quot;? This action cannot be undone.
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

      <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
            <DialogDescription>Create a draft purchase order</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Supplier *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={poForm.supplierId}
                onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Item description</Label>
              <Input
                value={poForm.itemDescription}
                onChange={(e) => setPoForm({ ...poForm, itemDescription: e.target.value })}
                placeholder="Line item description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={poForm.quantity}
                  onChange={(e) => setPoForm({ ...poForm, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Rate (Nu.)</Label>
                <Input
                  type="number"
                  value={poForm.rate}
                  onChange={(e) => setPoForm({ ...poForm, rate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={poForm.notes}
                onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPoDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePo} disabled={submitting}>
              {submitting ? "Saving..." : "Create PO"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rfqDialogOpen} onOpenChange={setRfqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New RFQ</DialogTitle>
            <DialogDescription>Request quotations from suppliers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={rfqForm.title}
                onChange={(e) => setRfqForm({ ...rfqForm, title: e.target.value })}
                placeholder="e.g., POS hardware Q3"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={rfqForm.description}
                onChange={(e) => setRfqForm({ ...rfqForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier (optional)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={rfqForm.supplierId}
                onChange={(e) => setRfqForm({ ...rfqForm, supplierId: e.target.value })}
              >
                <option value="">None</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Item description</Label>
              <Input
                value={rfqForm.itemDescription}
                onChange={(e) => setRfqForm({ ...rfqForm, itemDescription: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={rfqForm.quantity}
                  onChange={(e) => setRfqForm({ ...rfqForm, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={rfqForm.unit}
                  onChange={(e) => setRfqForm({ ...rfqForm, unit: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRfqDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRfq} disabled={submitting}>
              {submitting ? "Saving..." : "Create RFQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
