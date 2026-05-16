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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"po" | "suppliers" | "rfq">("suppliers");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<SupplierFormData>(emptySupplierForm);

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
        else setOrders(result.data || []);
      } else {
        toast.error(result.error || "Failed to load data");
      }
    } catch (error) {
      toast.error("Failed to load data - tables may not exist yet");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingSupplier(null);
    setFormData({ ...emptySupplierForm });
    setDialogOpen(true);
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Procurement</h1>
          <p className="text-muted-foreground">Purchase orders & suppliers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {activeTab === "suppliers" ? (
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          ) : (
            <Button onClick={() => window.location.href = `/admin/procurement/${activeTab === "po" ? "purchase-orders" : "rfq"}/create`}>
              <Plus className="w-4 h-4 mr-2" />
              New {activeTab === "po" ? "PO" : "RFQ"}
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
              <Users className="w-5 h-5 text-[#3ECF8E]" />
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
              <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
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
    </div>
  );
}
