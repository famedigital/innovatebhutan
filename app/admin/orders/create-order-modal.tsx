"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, ShoppingBag, User, Phone, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      toast.error("Failed to load services");
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
    toast.success("Item added to order");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isEdit ? "Edit Order" : "Create New Order"}</h2>
              <p className="text-sm text-gray-500">{isEdit ? "Update order details" : "Fill in the order details below"}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Customer Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={formData.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      placeholder="Enter customer name"
                      required
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                      placeholder="Enter phone number"
                      required
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="w-4 h-4" />
                  Location
                </label>
                <Input
                  value={formData.customerLocation}
                  onChange={(e) => handleInputChange("customerLocation", e.target.value)}
                  placeholder="Enter customer location"
                  className="h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Order Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Additional notes or special instructions..."
                  rows={3}
                  className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Order Items */}
            {!isEdit && (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                  {items.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {items.length} {items.length === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>

                {/* Add Item Form */}
                <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Service</label>
                      <Select
                        value={newItem.serviceId > 0 ? String(newItem.serviceId) : ""}
                        onValueChange={handleServiceChange}
                        disabled={servicesLoading}
                      >
                        <SelectTrigger className="h-12 border-gray-300">
                          <SelectValue placeholder={servicesLoading ? "Loading..." : "Select a service"} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200 shadow-lg max-h-60">
                          {services.map((service) => (
                            <SelectItem key={service.id} value={String(service.id)} className="cursor-pointer">
                              <div>
                                <div className="font-medium">{service.name}</div>
                                <div className="text-xs text-gray-500">{service.category}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
                      <Input
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                        className="h-12 border-gray-300 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Unit Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newItem.unitPrice}
                          onChange={(e) => setNewItem((prev) => ({ ...prev, unitPrice: e.target.value }))}
                          className="pl-9 h-12 border-gray-300 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button
                      type="button"
                      onClick={handleAddItem}
                      disabled={!newItem.serviceId || !newItem.unitPrice}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Items List */}
                {items.length > 0 && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-medium text-gray-700">Added Items</h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {items.map((item, index) => {
                        const service = services.find((s) => s.id === item.serviceId);
                        const lineTotal = (Number(item.unitPrice) * item.quantity).toFixed(2);
                        return (
                          <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{service?.name || `Service #${item.serviceId}`}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span>{service?.category || 'Service'}</span>
                                <span>•</span>
                                <span>Qty: {item.quantity}</span>
                                <span>•</span>
                                <span>Nu. {item.unitPrice} each</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-lg font-bold text-emerald-600">Nu. {lineTotal}</p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-emerald-600">Nu. {calculateTotal()}</p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="h-12 px-6 border-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || (!isEdit && items.length === 0)}
                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={(e) => {
                  e.currentTarget.blur(); // Remove focus to prevent double submission
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {isEdit ? (
                      <>
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        Update Order
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Create Order
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
