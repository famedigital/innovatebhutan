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
import { AdminPageHeader } from "@/components/admin/admin-page-header";

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
      <AdminPageHeader
        title="Attendance"
        description="Track employee check-ins and check-outs"
        actions={
          <Button onClick={() => setShowCheckInModal(true)} className="gap-2">
            <Clock className="w-4 h-4" />
            Check In
          </Button>
        }
      />

      {/* Filters */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by employee name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {loading ? (
          <Card className="shadow-none">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Loading...
            </CardContent>
          </Card>
        ) : attendance.length === 0 ? (
          <Card className="shadow-none">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No attendance records found.
            </CardContent>
          </Card>
        ) : (
          attendance.map((record) => {
            const isCheckedIn = !record.checkOut;
            return (
              <Card key={record.id} className="shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {record.employeeName || "Unknown"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {record.employeeDesignation || ""}
                        {record.employeeDepartment
                          ? ` · ${record.employeeDepartment}`
                          : ""}
                      </p>
                    </div>
                    {isCheckedIn ? (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        Checked in
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="shrink-0">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p>{formatDate(record.date)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p>
                        {calculateDuration(record.checkIn, record.checkOut)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">In</p>
                      <p>{formatTime(record.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Out</p>
                      <p>{formatTime(record.checkOut)}</p>
                    </div>
                  </div>
                  {isCheckedIn ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCheckOut(record)}
                    >
                      Check out
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden shadow-none md:block">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
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
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : attendance.length > 0 ? (
                attendance.map((record) => {
                  const isCheckedIn = !record.checkOut;
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {record.employeeName || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {record.employeeDesignation || ""}{" "}
                            {record.employeeDepartment
                              ? `· ${record.employeeDepartment}`
                              : ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{formatTime(record.checkIn)}</TableCell>
                      <TableCell>{formatTime(record.checkOut)}</TableCell>
                      <TableCell>
                        {calculateDuration(record.checkIn, record.checkOut)}
                      </TableCell>
                      <TableCell>
                        {isCheckedIn ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Completed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isCheckedIn ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckOut(record)}
                            className="h-8"
                          >
                            Check Out
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
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
