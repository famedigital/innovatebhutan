"use client";

import * as React from "react";
import { UserPlus, ShieldCheck, RefreshCw, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type ProfileOption = { id: number; fullName: string | null; userId: string };

export function OperatorOnboardingModal({
  trigger,
  onCreated,
}: {
  trigger: React.ReactNode;
  onCreated?: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [profiles, setProfiles] = React.useState<ProfileOption[]>([]);
  const [form, setForm] = React.useState({
    profileId: "",
    phone: "",
    designation: "",
    department: "",
    baseSalary: "",
    cid: "",
    joinDate: "",
    status: "active",
  });

  React.useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch("/api/profiles?role=ADMIN,STAFF");
        const json = await res.json();
        if (json.success) setProfiles(json.data || []);
      } catch {
        toast.error("Failed to load profiles");
      }
    })();
  }, [open]);

  const handleAddEmployee = async () => {
    if (!form.profileId || !form.designation) {
      toast.error("Select a user profile and designation");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: parseInt(form.profileId, 10),
          designation: form.designation.trim(),
          department: form.department || undefined,
          phone: form.phone.trim() || undefined,
          baseSalary: form.baseSalary || undefined,
          nationalIdMasked: form.cid || undefined,
          joinDate: form.joinDate || undefined,
          status: form.status,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to add employee");
      }

      toast.success("Employee added successfully");
      setOpen(false);
      setForm({
        profileId: "",
        phone: "",
        designation: "",
        department: "",
        baseSalary: "",
        cid: "",
        joinDate: "",
        status: "active",
      });
      onCreated?.();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Add New Employee
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Link a STAFF/ADMIN profile. Create login users under Users &amp;
                Roles first.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              User profile *
            </label>
            <Select
              value={form.profileId}
              onValueChange={(v) => setForm({ ...form, profileId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select profile…" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.fullName || p.userId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Designation *
              </label>
              <Input
                placeholder="e.g., Systems Engineer"
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Department
              </label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm({ ...form, department: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Phone
              </label>
              <Input
                placeholder="+975xxxxxxxx"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Bhutan CID
              </label>
              <Input
                placeholder="XXXXXXXXXX"
                value={form.cid}
                onChange={(e) => setForm({ ...form, cid: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Base Salary (Nu.)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={form.baseSalary}
                onChange={(e) =>
                  setForm({ ...form, baseSalary: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Join Date
              </label>
              <Input
                type="date"
                value={form.joinDate}
                onChange={(e) =>
                  setForm({ ...form, joinDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <p className="text-xs text-muted-foreground">
              Uses `/api/employees` — no direct browser database writes.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={handleAddEmployee}>
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Add Employee
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
