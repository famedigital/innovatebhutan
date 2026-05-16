"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";

interface Profile {
  id: number;
  userId: string;
  fullName: string | null;
}

interface Employee {
  id: number;
  profileId: number;
  fullName?: string | null;
  designation: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  tin: string | null;
  pfNumber: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankBranch: string | null;
  status: string;
  baseSalary?: string | null;
}

interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditEmployeeModal({ employee, onClose, onSuccess }: EditEmployeeModalProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    designation: employee.designation || "",
    baseSalary: employee.baseSalary || "",
    department: employee.department || "",
    phone: employee.phone || "",
    email: employee.email || "",
    tin: employee.tin || "",
    pfNumber: employee.pfNumber || "",
    bankAccountNumber: employee.bankAccountNumber || "",
    bankName: employee.bankName || "",
    bankBranch: employee.bankBranch || "",
    status: employee.status || "active",
  });
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const cleanSalary = formData.baseSalary?.replace(/[^\d.]/g, "");

      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          baseSalary: cleanSalary || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update employee");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update employee information for {employee.fullName || "Employee"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Engineering"
              />
            </div>
          </div>

          {/* Salary & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseSalary">Base Salary (Nu.)</Label>
              <Input
                id="baseSalary"
                type="text"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                placeholder="e.g., 25000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+975 17 123 456"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="employee@example.com"
              />
            </div>
          </div>

          {/* Tax & Bank Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tin">TIN</Label>
              <Input
                id="tin"
                value={formData.tin}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                placeholder="Tax Identification Number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pfNumber">PF Number</Label>
              <Input
                id="pfNumber"
                value={formData.pfNumber}
                onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                placeholder="Provident Fund Number"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankAccountNumber">Account Number</Label>
              <Input
                id="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                placeholder="Account Number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g., BNB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankBranch">Branch</Label>
              <Input
                id="bankBranch"
                value={formData.bankBranch}
                onChange={(e) => setFormData({ ...formData, bankBranch: e.target.value })}
                placeholder="e.g., Thimphu"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
