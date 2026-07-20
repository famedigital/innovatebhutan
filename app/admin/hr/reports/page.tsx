"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Users,
  Download,
  Calendar as CalendarIcon,
  DollarSign,
  Briefcase,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { HRReportKPIs } from "@/lib/repositories/reportRepository";

interface HRViewModel {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    onLeave: number;
    newHiresThisMonth: number;
    totalPayroll: number;
    averageSalary: number;
    attendanceRate: number;
    departments: number;
  };
  byDepartment: {
    department: string;
    employeeCount: number;
    totalSalary: number;
    averageSalary: number;
    onLeaveCount: number;
  }[];
  payrollSummary: {
    month: string;
    totalPayroll: number;
    paidAmount: number;
    pendingAmount: number;
    employeeCount: number;
  }[];
  attendanceData: {
    employeeName: string;
    department: string;
    daysPresent: number;
    daysAbsent: number;
    daysOnLeave: number;
    attendanceRate: number;
  }[];
  byDesignation: { designation: string; count: number }[];
  payslipStats: {
    draft: number;
    approved: number;
    paid: number;
    total: number;
  };
}

function normalizeHRReport(raw: unknown): HRViewModel | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  if (
    data.summary &&
    typeof data.summary === "object" &&
    "totalEmployees" in (data.summary as object)
  ) {
    return raw as HRViewModel;
  }

  const kpis = data as unknown as HRReportKPIs;
  const byDept = Object.entries(kpis.employeesByDepartment || {}).map(
    ([department, employeeCount]) => ({
      department: department || "Unassigned",
      employeeCount: Number(employeeCount) || 0,
      totalSalary: 0,
      averageSalary: 0,
      onLeaveCount: 0,
    })
  );
  const byDesignation = Object.entries(kpis.employeesByDesignation || {}).map(
    ([designation, count]) => ({
      designation: designation || "Unassigned",
      count: Number(count) || 0,
    })
  );

  return {
    summary: {
      totalEmployees: Number(kpis.totalEmployees) || 0,
      activeEmployees: Number(kpis.activeEmployees) || 0,
      onLeave: Number(kpis.inactiveEmployees) || 0,
      newHiresThisMonth: Number(kpis.newHiresThisPeriod) || 0,
      totalPayroll: Number(kpis.totalPayroll) || 0,
      averageSalary: Number(kpis.avgSalary) || 0,
      attendanceRate: Number(kpis.attendanceStats?.avgAttendanceRate) || 0,
      departments: byDept.length,
    },
    byDepartment: byDept,
    payrollSummary: [
      {
        month: "Current period",
        totalPayroll: Number(kpis.totalPayroll) || 0,
        paidAmount: 0,
        pendingAmount: Number(kpis.payslipStats?.draft) || 0,
        employeeCount: Number(kpis.activeEmployees) || 0,
      },
    ],
    attendanceData: [],
    byDesignation,
    payslipStats: {
      draft: Number(kpis.payslipStats?.draft) || 0,
      approved: Number(kpis.payslipStats?.approved) || 0,
      paid: Number(kpis.payslipStats?.paid) || 0,
      total: Number(kpis.payslipStats?.total) || 0,
    },
  };
}

function formatNu(amount: number) {
  if (Math.abs(amount) >= 1000) {
    return `Nu. ${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  }
  return `Nu. ${amount.toLocaleString()}`;
}

export default function HRReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [kpis, setKpis] = useState<HRViewModel | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (departmentFilter && departmentFilter !== "all") {
        params.append("department", departmentFilter);
      }
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString());
      }
      params.append("type", "kpis");

      const response = await fetch(`/api/reports/hr/?${params}`);
      const data = await response.json();

      if (data.success) {
        const normalized = normalizeHRReport(data.data);
        if (!normalized) {
          toast.error("Unexpected report payload");
          setKpis(null);
          return;
        }
        setKpis(normalized);
      } else {
        toast.error(data.error || "Failed to load report data");
        setKpis(null);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report data");
      setKpis(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, departmentFilter]);

  useEffect(() => {
    void fetchReportData();
  }, [fetchReportData]);

  const exportToCSV = () => {
    setExporting(true);
    try {
      if (!kpis) return;

      const rows = [
        ["HR Report - " + new Date().toLocaleDateString()],
        [],
        ["Summary"],
        ["Total Employees", kpis.summary.totalEmployees.toString()],
        ["Active Employees", kpis.summary.activeEmployees.toString()],
        ["Inactive / Other", kpis.summary.onLeave.toString()],
        ["New Hires This Period", kpis.summary.newHiresThisMonth.toString()],
        ["Total Payroll", kpis.summary.totalPayroll.toFixed(2)],
        ["Average Salary", kpis.summary.averageSalary.toFixed(2)],
        ["Attendance Rate", kpis.summary.attendanceRate.toFixed(1) + "%"],
        ["Departments", kpis.summary.departments.toString()],
        [],
        ["By Department"],
        ["Department", "Employees"],
        ...kpis.byDepartment.map((d) => [
          d.department,
          d.employeeCount.toString(),
        ]),
        [],
        ["By Designation"],
        ["Designation", "Count"],
        ...kpis.byDesignation.map((d) => [d.designation, d.count.toString()]),
        [],
        ["Payslip Status"],
        ["Draft", kpis.payslipStats.draft.toString()],
        ["Approved", kpis.payslipStats.approved.toString()],
        ["Paid", kpis.payslipStats.paid.toString()],
      ];

      const csvContent = rows
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hr-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported successfully");
    } catch {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <AdminPageHeader
        title="HR Reports"
        description="Headcount, payroll, and department analytics"
        actions={
          <Button onClick={exportToCSV} disabled={exporting || !kpis}>
            {exporting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            Export CSV
          </Button>
        }
      />

      <Card className="shadow-none">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-56 justify-start">
                    <CalendarIcon className="mr-2 size-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} –{" "}
                          {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      "Select date range"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {(kpis?.byDepartment || []).map((dept) => (
                    <SelectItem key={dept.department} value={dept.department}>
                      {dept.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDateRange(undefined);
                  setDepartmentFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!kpis ? (
        <Card className="shadow-none">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <AlertCircle className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No HR report data available.
            </p>
            <Button variant="outline" onClick={() => void fetchReportData()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Card className="shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Employees
                    </p>
                    <p className="text-xl font-semibold sm:text-2xl">
                      {kpis.summary.totalEmployees}
                    </p>
                  </div>
                  <Users className="size-7 shrink-0 text-primary" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {kpis.summary.activeEmployees} active ·{" "}
                  {kpis.summary.onLeave} inactive
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Payroll base
                    </p>
                    <p className="truncate text-xl font-semibold sm:text-2xl">
                      {formatNu(kpis.summary.totalPayroll)}
                    </p>
                  </div>
                  <DollarSign className="size-7 shrink-0 text-blue-500" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Avg {formatNu(kpis.summary.averageSalary)}/mo
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Attendance
                    </p>
                    <p className="text-xl font-semibold sm:text-2xl">
                      {kpis.summary.attendanceRate.toFixed(0)}%
                    </p>
                  </div>
                  <Clock className="size-7 shrink-0 text-amber-500" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Average attendance rate
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Departments
                    </p>
                    <p className="text-xl font-semibold sm:text-2xl">
                      {kpis.summary.departments}
                    </p>
                  </div>
                  <Briefcase className="size-7 shrink-0 text-violet-500" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {kpis.summary.newHiresThisMonth} new this period
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="departments" className="space-y-4">
            <TabsList className="h-auto w-full flex-wrap justify-start sm:w-auto">
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="designations">Designations</TabsTrigger>
              <TabsTrigger value="payslips">Payslips</TabsTrigger>
            </TabsList>

            <TabsContent value="departments">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Headcount by department</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {kpis.byDepartment.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No department data yet.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead className="text-right">Employees</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpis.byDepartment.map((dept) => (
                          <TableRow key={dept.department}>
                            <TableCell className="font-medium">
                              {dept.department}
                            </TableCell>
                            <TableCell className="text-right">
                              {dept.employeeCount}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="designations">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">
                    Headcount by designation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {kpis.byDesignation.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No designation data yet.
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {kpis.byDesignation.map((item) => (
                        <div
                          key={item.designation}
                          className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                        >
                          <span className="truncate text-sm font-medium">
                            {item.designation}
                          </span>
                          <Badge variant="secondary">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payslips">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Payslip status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: "Draft",
                        value: kpis.payslipStats.draft,
                        className: "bg-muted",
                      },
                      {
                        label: "Approved",
                        value: kpis.payslipStats.approved,
                        className: "bg-blue-50 dark:bg-blue-950/40",
                      },
                      {
                        label: "Paid",
                        value: kpis.payslipStats.paid,
                        className: "bg-emerald-50 dark:bg-emerald-950/40",
                      },
                      {
                        label: "Total",
                        value: kpis.payslipStats.total,
                        className: "bg-primary/5",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`rounded-lg p-4 text-center ${item.className}`}
                      >
                        <p className="text-xs text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
