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

interface CreateEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEmployeeModal({ onClose, onSuccess }: CreateEmployeeModalProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    profileId: "",
    designation: "",
    baseSalary: "",
    department: "",
    phone: "",
    email: "",
    tin: "",
    pfNumber: "",
    bankAccountNumber: "",
    bankName: "",
    bankBranch: "",
    status: "active",
  });
  const supabase = createClient();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, userId, fullName")
        .order("created_at", { ascending: false });
      setProfiles(data || []);
    } catch (err) {
      console.error("Fetch profiles error:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      // Clean the salary string - remove non-numeric except decimal
      const cleanSalary = formData.baseSalary.replace(/[^\d.]/g, "");

      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          profileId: parseInt(formData.profileId),
          baseSalary: cleanSalary || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create employee");
      }
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee record. Link to an existing user profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Selection */}
          <div className="space-y-2">
            <Label htmlFor="profileId">User Profile *</Label>
            <select
              id="profileId"
              required
              value={formData.profileId}
              onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Select a profile...</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.fullName || profile.userId}
                </option>
              ))}
            </select>
          </div>

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
              {loading ? "Creating..." : "Create Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
