"use client";

import { useEffect, useState } from "react";
import { Clock, LogOut, Calendar, Search, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckInModal } from "./check-in-modal";
import { CheckOutModal } from "./check-out-modal";
import { createClient } from "@/utils/supabase/client";

interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName?: string | null;
  employeeDesignation?: string | null;
  employeeDepartment?: string | null;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
}

function formatTime(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calculateDuration(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || !checkOut) return "-";
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkOutRecord, setCheckOutRecord] = useState<AttendanceRecord | null>(null);
  const supabase = createClient();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("limit", "50");

      const response = await fetch(`/api/attendance?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendance(data.data || []);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [search]);

  const handleCheckOut = (record: AttendanceRecord) => {
    if (record.checkOut) {
      alert("Already checked out");
      return;
    }
    setCheckOutRecord(record);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground">Track employee check-ins and check-outs</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowCheckInModal(true)} className="gap-2">
            <Clock className="w-4 h-4" />
            Check In
          </Button>
          <Button onClick={() => setShowCheckInModal(true)} className="gap-2">
            <LogOut className="w-4 h-4" />
            Check Out
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : attendance.length > 0 ? (
                attendance.map((record) => {
                  const isCheckedIn = !record.checkOut;
                  return (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.employeeName || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">
                            {record.employeeDesignation || ""} {record.employeeDepartment ? `• ${record.employeeDepartment}` : ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{formatTime(record.checkIn)}</TableCell>
                      <TableCell>{formatTime(record.checkOut)}</TableCell>
                      <TableCell>{calculateDuration(record.checkIn, record.checkOut)}</TableCell>
                      <TableCell>
                        {isCheckedIn ? (
                          <Badge className="bg-green-50 text-green-600 border-green-200">
                            Checked In
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-50 text-gray-600 border-gray-200">
                            Completed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isCheckedIn && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckOut(record)}
                            className="h-8"
                          >
                            Check Out
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No attendance records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCheckInModal && (
        <CheckInModal
          onClose={() => setShowCheckInModal(false)}
          onSuccess={() => {
            setShowCheckInModal(false);
            fetchAttendance();
          }}
        />
      )}

      {checkOutRecord && (
        <CheckOutModal
          record={checkOutRecord}
          onClose={() => setCheckOutRecord(null)}
          onSuccess={() => {
            setCheckOutRecord(null);
            fetchAttendance();
          }}
        />
      )}
    </div>
  );
}
