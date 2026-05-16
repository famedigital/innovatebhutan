"use client";

import { useState } from "react";
import { LogOut as ClockOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName?: string | null;
  checkIn: string | null;
}

interface CheckOutModalProps {
  record: AttendanceRecord;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckOutModal({ record, onClose, onSuccess }: CheckOutModalProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attendanceId: record.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to check out");
      }
    } catch (err) {
      console.error("Check-out error:", err);
      alert("Failed to check out");
    } finally {
      setLoading(false);
    }
  };

  const checkInTime = record.checkIn
    ? new Date(record.checkIn).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Check Out</DialogTitle>
          <DialogDescription>
            Record check-out for {record.employeeName || "Employee"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Checked in at</p>
            <p className="text-lg font-semibold">{checkInTime}</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCheckOut} disabled={loading}>
              {loading ? "Checking out..." : "Check Out"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
