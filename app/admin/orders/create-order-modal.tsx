"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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

type Service = {
  id: number;
  name: string;
  category: string;
  price?: string;
};

type OrderItemForm = {
  serviceId: number;
  quantity: number;
  unitPrice: string;
};

interface CreateOrderModalProps {
  onClose: () => void;
  onCreated: () => void;
  editOrder?: {
    id: number;
    customerName: string;
    customerPhone: string;
    customerLocation?: string;
    status: string;
  } | null;
}

export function CreateOrderModal({ onClose, onCreated, editOrder }: CreateOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [formData, setFormData] = useState({
    customerName: editOrder?.customerName || "",
    customerPhone: editOrder?.customerPhone || "",
    customerLocation: editOrder?.customerLocation || "",
    notes: "",
  });

  const [items, setItems] = useState<OrderItemForm[]>([]);
  const [newItem, setNewItem] = useState<OrderItemForm>({
    serviceId: 0,
    quantity: 1,
    unitPrice: "",
  });

  const isEdit = !!editOrder;

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      const response = await fetch("/api/services");
      const result = await response.json();

      if (result.success) {
        setServices(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    if (newItem.serviceId === 0) {
      toast.error("Please select a service");
      return;
    }
    if (!newItem.unitPrice) {
      toast.error("Please enter a unit price");
      return;
    }

    setItems((prev) => [...prev, { ...newItem }]);
    setNewItem({ serviceId: 0, quantity: 1, unitPrice: "" });
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0)
      .toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }
    if (!formData.customerPhone.trim()) {
      toast.error("Customer phone is required");
      return;
    }
    if (items.length === 0 && !isEdit) {
      toast.error("At least one item is required");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerLocation: formData.customerLocation || null,
        totalAmount: calculateTotal(),
        meta: formData.notes ? { notes: formData.notes } : undefined,
        items: items.length > 0 ? items : undefined,
      };

      const url = isEdit ? `/api/orders/${editOrder.id}` : "/api/orders";
      const method = isEdit ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(isEdit ? "Order updated successfully" : "Order created successfully");
        onCreated();
        onClose();
      } else {
        toast.error(result.error || "Failed to save order");
      }
    } catch (error) {
      console.error("Failed to save order:", error);
      toast.error("Failed to save order");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const service = services.find((s) => s.id === Number(serviceId));
    setNewItem((prev) => ({
      ...prev,
      serviceId: Number(serviceId),
      unitPrice: service?.price || prev.unitPrice,
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{isEdit ? "Edit Order" : "Create New Order"}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name *</label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <Input
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={formData.customerLocation}
                onChange={(e) => handleInputChange("customerLocation", e.target.value)}
                placeholder="Enter customer location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          {/* Order Items */}
          {!isEdit && (
            <div className="space-y-4">
              <h3 className="font-semibold">Order Items</h3>

              {/* Add Item Form */}
              <div className="flex gap-2 items-end border p-4 rounded-lg bg-gray-50">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Service</label>
                  <Select
                    value={newItem.serviceId > 0 ? String(newItem.serviceId) : ""}
                    onValueChange={handleServiceChange}
                    disabled={servicesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={servicesLoading ? "Loading..." : "Select a service"} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={String(service.id)}>
                          {service.name} - {service.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-24">
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                  />
                </div>

                <div className="w-32">
                  <label className="block text-sm font-medium mb-1">Unit Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem((prev) => ({ ...prev, unitPrice: e.target.value }))}
                  />
                </div>

                <Button type="button" onClick={handleAddItem} disabled={!newItem.serviceId || !newItem.unitPrice}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {items.map((item, index) => {
                    const service = services.find((s) => s.id === item.serviceId);
                    return (
                      <div key={index} className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <p className="font-medium">{service?.name || `Service #${item.serviceId}`}</p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × Nu. {item.unitPrice}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-semibold">Nu. {(Number(item.unitPrice) * item.quantity).toFixed(2)}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <span className="font-semibold">Total Amount</span>
            <span className="text-2xl font-bold">Nu. {calculateTotal()}</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!isEdit && items.length === 0)}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? "Update Order" : "Create Order"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
