"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calculator, Building, Edit, Trash2, MoreVertical, Phone, Mail } from "lucide-react";
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

interface Party {
  id: number;
  publicId: string;
  name: string;
  partyType: string;
  taxpayerId?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

interface Payment {
  id: number;
  publicId: string;
  paymentNumber: string;
  partyName: string;
  amount: string;
  paidAmount: string;
  status: string;
  postingDate: Date;
}

interface PartyFormData {
  name: string;
  partyType: string;
  taxpayerId: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

const emptyPartyForm: PartyFormData = {
  name: "",
  partyType: "customer",
  taxpayerId: "",
  address: "",
  city: "",
  phone: "",
  email: "",
};

export default function AccountsPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"parties" | "payments" | "journal">("parties");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [deletingParty, setDeletingParty] = useState<Party | null>(null);
  const [formData, setFormData] = useState<PartyFormData>(emptyPartyForm);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "parties"
          ? "/api/accounts/parties"
          : activeTab === "payments"
            ? "/api/accounts/payments"
            : "/api/accounts/journal-entries";

      const response = await fetch(endpoint);
      const result = await response.json();
      if (result.success) {
        if (activeTab === "parties") setParties(result.data || []);
        else if (activeTab === "payments") setPayments(result.data || []);
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
    setEditingParty(null);
    setFormData({ ...emptyPartyForm });
    setDialogOpen(true);
  };

  const openEditDialog = (party: Party) => {
    setEditingParty(party);
    setFormData({
      name: party.name,
      partyType: party.partyType,
      taxpayerId: party.taxpayerId || "",
      address: party.address || "",
      city: party.city || "",
      phone: party.phone || "",
      email: party.email || "",
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (party: Party) => {
    setDeletingParty(party);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Party name is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        partyType: formData.partyType,
        taxpayerId: formData.taxpayerId.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
      };

      const url = editingParty
        ? `/api/accounts/parties/${editingParty.id}`
        : "/api/accounts/parties";
      const method = editingParty ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingParty ? "Party updated" : "Party created");
        setDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Failed to save party");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingParty) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/accounts/parties/${deletingParty.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Party deleted");
        setDeleteDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Delete failed");
      }
    } catch (error) {
      toast.error("Failed to delete party");
    } finally {
      setSubmitting(false);
    }
  };

  const getPartyTypeColor = (type: string) => {
    switch (type) {
      case "customer":
        return "default";
      case "supplier":
        return "secondary";
      default:
        return "outline";
    }
  };

  const customerCount = parties.filter((p) => p.partyType === "customer").length;
  const supplierCount = parties.filter((p) => p.partyType === "supplier").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">Financial management & accounting</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {activeTab === "parties" ? (
            <Button onClick={openCreateDialog}>
              <Calculator className="w-4 h-4 mr-2" />
              Add Party
            </Button>
          ) : (
            <Button onClick={() => window.location.href = `/admin/accounts/${activeTab}/create`}>
              <Calculator className="w-4 h-4 mr-2" />
              New {activeTab === "payments" ? "Payment" : "Entry"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {(["parties", "payments", "journal"] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "payments" ? "Payments" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Customers</span>
              <Building className="w-5 h-5 text-[#3ECF8E]" />
            </div>
            <p className="text-2xl font-bold mt-2">{customerCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Suppliers</span>
              <Building className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{supplierCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Parties</span>
              <Building className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold mt-2">{parties.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="capitalize">
            {activeTab === "payments" ? "Payments" : activeTab}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
            </div>
          ) : activeTab === "parties" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tax ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No parties found. Add your first party to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  parties.map((party) => (
                    <TableRow key={party.id}>
                      <TableCell className="font-medium">{party.name}</TableCell>
                      <TableCell>
                        <Badge variant={getPartyTypeColor(party.partyType)}>
                          {party.partyType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          {party.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {party.email}
                            </span>
                          )}
                          {party.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {party.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{party.city || "-"}</TableCell>
                      <TableCell>{party.taxpayerId || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={party.isActive ? "default" : "secondary"}>
                          {party.isActive ? "Active" : "Inactive"}
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
                            <DropdownMenuItem onClick={() => openEditDialog(party)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => openDeleteDialog(party)}
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
                  <TableHead>Payment Number</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                      <TableCell>{payment.partyName}</TableCell>
                      <TableCell>Nu.{Number(payment.amount).toLocaleString()}</TableCell>
                      <TableCell>Nu.{Number(payment.paidAmount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === "reconciled" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(payment.postingDate).toLocaleDateString()}</TableCell>
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
                              <Calculator className="w-4 h-4 mr-2" />
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

      {/* Create/Edit Party Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingParty ? "Edit Party" : "Add Party"}</DialogTitle>
            <DialogDescription>
              {editingParty ? "Update party details" : "Add a new customer or supplier"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Party Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., ABC Corporation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partyType">Party Type *</Label>
                <select
                  id="partyType"
                  value={formData.partyType}
                  onChange={(e) => setFormData({ ...formData, partyType: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2"
                >
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
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
                <Label htmlFor="taxpayerId">Tax ID</Label>
                <Input
                  id="taxpayerId"
                  value={formData.taxpayerId}
                  onChange={(e) => setFormData({ ...formData, taxpayerId: e.target.value })}
                  placeholder="Taxpayer ID"
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
              {submitting ? "Saving..." : editingParty ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Party?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingParty?.name}&quot;? This action cannot be undone.
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
