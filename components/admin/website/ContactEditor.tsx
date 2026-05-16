"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Share2,
  Globe,
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Helper function for safe API calls
async function safeFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error("Expected JSON response");
  }

  return response.json();
}

// Info type options with icons
const INFO_TYPE_OPTIONS = [
  { value: "phone", label: "Phone", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "address", label: "Address", icon: MapPin },
  { value: "working_hours", label: "Working Hours", icon: Clock },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { value: "social_media", label: "Social Media", icon: Share2 },
  { value: "website", label: "Website", icon: Globe },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

// Get icon component for info type
const getInfoTypeIcon = (infoType: string) => {
  const option = INFO_TYPE_OPTIONS.find((opt) => opt.value === infoType);
  return option ? option.icon : MoreHorizontal;
};

export interface ContactInfo {
  id: number;
  infoType: string;
  label: string | null;
  value: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContactEditorProps {
  onSuccess?: () => void;
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i} className="border-[#E5E5E1]">
          <TableCell>
            <div className="h-5 w-24 bg-[#F3F3F1] animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-20 bg-[#F3F3F1] animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-48 bg-[#F3F3F1] animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="h-6 w-16 bg-[#F3F3F1] animate-pulse rounded-full" />
          </TableCell>
          <TableCell>
            <div className="h-5 w-12 bg-[#F3F3F1] animate-pulse rounded" />
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <div className="h-8 w-8 bg-[#F3F3F1] animate-pulse rounded" />
              <div className="h-8 w-8 bg-[#F3F3F1] animate-pulse rounded" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function ContactEditor({ onSuccess }: ContactEditorProps) {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    infoType: "phone",
    label: "",
    value: "",
    displayOrder: 0,
    isActive: true,
  });

  // Fetch contact information
  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await safeFetch("/api/website/contact");

      if (result.success) {
        // Flatten grouped data into array
        const flatData = Object.values(result.data || {}).flat() as ContactInfo[];
        setContacts(flatData);
      } else {
        setError(result.error || "Failed to fetch contact information");
        toast.error(result.error || "Failed to load contact information");
      }
    } catch (err) {
      console.error("[ContactEditor] Fetch error:", err);
      setError("Network error: Could not load contact information");
      toast.error("Network error: Could not load contact information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Reset form
  const resetForm = () => {
    setFormData({
      infoType: "phone",
      label: "",
      value: "",
      displayOrder: 0,
      isActive: true,
    });
    setEditingContact(null);
  };

  // Open create modal
  const handleCreate = () => {
    resetForm();
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (contact: ContactInfo) => {
    setEditingContact(contact);
    setFormData({
      infoType: contact.infoType,
      label: contact.label || "",
      value: contact.value,
      displayOrder: contact.displayOrder,
      isActive: contact.isActive,
    });
    setShowModal(true);
  };

  // Delete contact
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact item?")) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/website/contact?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Contact item deleted successfully");
        await fetchContacts();
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to delete contact item");
      }
    } catch (err) {
      console.error("[ContactEditor] Delete error:", err);
      toast.error("Network error: Could not delete contact item");
    } finally {
      setSaving(false);
    }
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.value.trim()) {
      toast.error("Value is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        infoType: formData.infoType,
        label: formData.label.trim() || null,
        value: formData.value.trim(),
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
      };

      const body = editingContact ? { id: editingContact.id, ...payload } : payload;

      const response = await fetch("/api/website/contact", {
        method: editingContact ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingContact ? "Contact item updated successfully" : "Contact item created successfully");
        setShowModal(false);
        resetForm();
        await fetchContacts();
        onSuccess?.();
      } else {
        toast.error(result.error || `Failed to ${editingContact ? "update" : "create"} contact item`);
      }
    } catch (err) {
      console.error("[ContactEditor] Submit error:", err);
      toast.error(`Network error: Could not ${editingContact ? "update" : "create"} contact item`);
    } finally {
      setSaving(false);
    }
  };

  // Group contacts by info type for display
  const groupedContacts = contacts.reduce((acc, contact) => {
    if (!acc[contact.infoType]) {
      acc[contact.infoType] = [];
    }
    acc[contact.infoType].push(contact);
    return acc;
  }, {} as Record<string, ContactInfo[]>);

  // Sort each group by display order
  Object.keys(groupedContacts).forEach((type) => {
    groupedContacts[type].sort((a, b) => a.displayOrder - b.displayOrder);
  });

  // Get info type label
  const getInfoTypeLabel = (infoType: string) => {
    const option = INFO_TYPE_OPTIONS.find((opt) => opt.value === infoType);
    return option ? option.label : infoType;
  };

  // Get badge color for info type
  const getInfoTypeBadgeClass = (infoType: string) => {
    const colors: Record<string, string> = {
      phone: "bg-blue-100 text-blue-700 border-blue-200",
      email: "bg-green-100 text-green-700 border-green-200",
      address: "bg-orange-100 text-orange-700 border-orange-200",
      working_hours: "bg-purple-100 text-purple-700 border-purple-200",
      whatsapp: "bg-emerald-100 text-emerald-700 border-emerald-200",
      social_media: "bg-pink-100 text-pink-700 border-pink-200",
      website: "bg-indigo-100 text-indigo-700 border-indigo-200",
      other: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[infoType] || colors.other;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-48 bg-[#F3F3F1] animate-pulse rounded mb-2" />
            <div className="h-4 w-64 bg-[#F3F3F1] animate-pulse rounded" />
          </div>
          <div className="h-9 w-32 bg-[#F3F3F1] animate-pulse rounded" />
        </div>

        {/* Table skeleton */}
        <div className="border border-[#E5E5E1] rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-[#F3F3F1]">
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton />
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
          <div>
            <p className="text-sm font-medium text-red-700">Failed to load contact information</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <Button size="sm" variant="outline" onClick={fetchContacts}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A]">Contact Information</h3>
          <p className="text-sm text-[#717171]">Manage website contact details and information</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
          <Plus className="w-4 h-4 mr-1" />
          Add Contact
        </Button>
      </div>

      {/* Contact Information Table (Grouped by Type) */}
      {Object.keys(groupedContacts).length === 0 ? (
        <div className="border border-[#E5E5E1] rounded-lg p-8 text-center bg-white">
          <p className="text-[#717171]">No contact information yet. Create your first contact item.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {INFO_TYPE_OPTIONS.map((infoTypeOption) => {
            const typeContacts = groupedContacts[infoTypeOption.value];
            if (!typeContacts || typeContacts.length === 0) return null;

            const Icon = infoTypeOption.icon;

            return (
              <div key={infoTypeOption.value} className="space-y-2">
                {/* Type Header */}
                <div className="flex items-center gap-2 px-2">
                  <Icon className="w-4 h-4 text-[#3ECF8E]" />
                  <h4 className="text-sm font-semibold text-[#1A1A1A] capitalize">
                    {infoTypeOption.label}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {typeContacts.length}
                  </Badge>
                </div>

                {/* Table for this type */}
                <div className="border border-[#E5E5E1] rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader className="bg-[#F3F3F1]">
                      <TableRow>
                        <TableHead className="w-[150px]">Label</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="text-center">Active</TableHead>
                        <TableHead className="text-center">Order</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {typeContacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <span className="font-medium">{contact.label || "-"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-[#717171] break-all">
                              {contact.value}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                contact.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              )}
                            >
                              {contact.isActive ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm text-[#717171]">{contact.displayOrder}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => handleEdit(contact)}
                                disabled={saving}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => handleDelete(contact.id)}
                                disabled={saving}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingContact ? "Edit Contact Item" : "Create Contact Item"}</DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Update the contact information details below."
                : "Add a new contact information item to your website."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info Type */}
            <div className="space-y-2">
              <Label htmlFor="infoType">
                Information Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.infoType}
                onValueChange={(value) => setFormData({ ...formData, infoType: value })}
              >
                <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INFO_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Label (optional)</Label>
              <Input
                id="label"
                placeholder="e.g., Main Office, Sales, Support"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
              <p className="text-xs text-[#717171]">
                A display label to identify this contact item (e.g., &quot;Main Office&quot; for an address)
              </p>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="value">
                Value <span className="text-red-500">*</span>
              </Label>
              <Input
                id="value"
                placeholder="e.g., +975 2 123456, info@example.com"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
              <p className="text-xs text-[#717171]">
                The actual contact information (phone number, email, address, etc.)
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                min={0}
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-[#717171]">
                Lower numbers appear first within each type group
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="active" className="text-sm font-medium">
                  Active
                </Label>
                <p className="text-xs text-[#717171]">Show this contact item on the website</p>
              </div>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(v) => setFormData({ ...formData, isActive: v })}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-[#E5E5E1]"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : editingContact ? (
                  "Update Item"
                ) : (
                  "Create Item"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
