"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateTransactionModalProps {
  onClose: () => void;
  onCreated: () => void;
  editTransaction?: any;
}

export function CreateTransactionModal({ onClose, onCreated, editTransaction }: CreateTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: editTransaction?.type || "",
    amount: editTransaction?.amount || "",
    category: editTransaction?.category || "",
    referenceId: editTransaction?.referenceId || "",
    notes: editTransaction?.notes || "",
    date: editTransaction?.date ? new Date(editTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const incomeCategories = [
    { value: "service_revenue", label: "Service Revenue" },
    { value: "product_sales", label: "Product Sales" },
    { value: "consulting_fees", label: "Consulting Fees" },
    { value: "amc_payment", label: "AMC Payment" },
    { value: "project_payment", label: "Project Payment" },
    { value: "other_income", label: "Other Income" },
  ];

  const expenseCategories = [
    { value: "salary", label: "Salary" },
    { value: "rent", label: "Rent" },
    { value: "utilities", label: "Utilities" },
    { value: "supplies", label: "Supplies" },
    { value: "equipment", label: "Equipment" },
    { value: "travel", label: "Travel" },
    { value: "marketing", label: "Marketing" },
    { value: "software", label: "Software" },
    { value: "insurance", label: "Insurance" },
    { value: "taxes", label: "Taxes" },
    { value: "other_expense", label: "Other Expense" },
  ];

  const availableCategories = formData.type === "INCOME" ? incomeCategories : expenseCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editTransaction ? `/api/transactions/${editTransaction.id}` : "/api/transactions";
      const method = editTransaction ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onCreated();
      } else {
        const result = await response.json();
        alert(result.error || "Failed to save transaction");
      }
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editTransaction ? "Edit Transaction" : "Create New Transaction"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value, category: "" })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
              disabled={!formData.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount (Nu.)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="referenceId">Reference ID (Optional)</Label>
            <Input
              id="referenceId"
              value={formData.referenceId}
              onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
              placeholder="Invoice ID, Order ID, etc."
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : editTransaction ? "Update Transaction" : "Create Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
