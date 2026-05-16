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

interface CreateExpenseModalProps {
  onClose: () => void;
  onCreated: () => void;
  editExpense?: any;
}

interface Employee {
  id: number;
  fullName: string | null;
  email: string | null;
}

export function CreateExpenseModal({ onClose, onCreated, editExpense }: CreateExpenseModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: editExpense?.employeeId || "",
    amount: editExpense?.amount || "",
    category: editExpense?.category || "",
    description: editExpense?.description || "",
    receiptUrl: editExpense?.receiptUrl || "",
    notes: editExpense?.notes || "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees");
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editExpense ? `/api/expenses/${editExpense.id}` : "/api/expenses";
      const method = editExpense ? "PATCH" : "POST";

      const payload = {
        ...formData,
        employeeId: formData.employeeId ? parseInt(formData.employeeId) : undefined,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onCreated();
      } else {
        const result = await response.json();
        alert(result.error || "Failed to save expense");
      }
    } catch (error) {
      console.error("Failed to save expense:", error);
      alert("Failed to save expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editExpense ? "Edit Expense" : "Create New Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="employeeId">Employee</Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.fullName || "Unknown"} ({employee.email || "No email"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="meals">Meals</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="other">Other</SelectItem>
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
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="receiptUrl">Receipt URL</Label>
            <Input
              id="receiptUrl"
              type="url"
              value={formData.receiptUrl}
              onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
              placeholder="https://..."
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
              {loading ? "Saving..." : editExpense ? "Update Expense" : "Create Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
