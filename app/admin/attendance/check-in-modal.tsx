"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
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

interface CheckInModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckInModal({ onClose, onSuccess }: CheckInModalProps) {
  const [employees, setEmployees] = useState<Array<{ id: number; fullName?: string | null; designation?: string | null }>>([]);
  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch("/api/employees?status=active", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (err) {
      console.error("Fetch employees error:", err);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    setLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employeeId: parseInt(employeeId),
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to check in");
      }
    } catch (err) {
      console.error("Check-in error:", err);
      alert("Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Check In</DialogTitle>
          <DialogDescription>Record employee check-in time</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCheckIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <select
              id="employee"
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Select employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName || "Unknown"} {emp.designation ? `(${emp.designation})` : ""}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !employeeId}>
              {loading ? "Checking in..." : "Check In"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
