"use client";

import { useState, useEffect } from "react";
import { X, Package, User, Phone, MapPin, Calendar, DollarSign, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type OrderItem = {
  id: number;
  orderId: number;
  serviceId: number;
  quantity: number;
  unitPrice: string;
  serviceName?: string;
};

type Order = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerLocation: string | null;
  status: "pending" | "deploying" | "complete" | "cancelled";
  totalAmount: string;
  meta: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  deploying: "bg-blue-100 text-blue-800 border-blue-200",
  complete: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  deploying: "Deploying",
  complete: "Complete",
  cancelled: "Cancelled",
};

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
  onEdit: () => void;
}

export function OrderDetailModal({ order, onClose, onUpdated, onEdit }: OrderDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [deletingItem, setDeletingItem] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrderItems();
  }, [order.id]);

  const fetchOrderItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${order.id}/items`);
      const result = await response.json();

      if (result.success) {
        setItems(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch order items:", error);
      toast.error("Failed to load order items");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
      setDeletingItem(itemId);
      const response = await fetch(`/api/order-items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Item removed successfully");
        fetchOrderItems();
        onUpdated();
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to remove item");
    } finally {
      setDeletingItem(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === order.status) return;

    try {
      setUpdatingStatus(true);
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Status updated to ${statusLabels[newStatus]}`);
        onUpdated();
        onClose();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    return `Nu. ${Number(amount).toLocaleString()}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Order #{order.id}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Created on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <Badge className={statusColors[order.status]}>
                {statusLabels[order.status]}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                Edit Order
              </Button>
              {order.status === "pending" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("deploying")}
                  disabled={updatingStatus}
                >
                  Start Deployment
                </Button>
              )}
              {order.status === "deploying" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("complete")}
                  disabled={updatingStatus}
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            </div>
            {order.customerLocation && (
              <div className="flex items-start gap-3 col-span-2">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{order.customerLocation}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({items.length})
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading items...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border rounded-lg">
                No items in this order
              </div>
            ) : (
              <div className="border rounded-lg divide-y">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <p className="font-medium">{item.serviceName || `Service #${item.serviceId}`}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">
                        {formatCurrency(Number(item.unitPrice) * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deletingItem === item.id}
                      >
                        {deletingItem === item.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Meta Information */}
          {order.meta && Object.keys(order.meta).length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Additional Information</h3>
              <div className="border rounded-lg p-4 bg-gray-50">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(order.meta, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-400 flex justify-between">
            <span>Created: {new Date(order.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(order.updatedAt).toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
