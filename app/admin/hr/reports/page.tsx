"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  Users, Download, Calendar as CalendarIcon, TrendingUp,
  DollarSign, Briefcase, Clock, Loader2, UserCheck, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HRKPIs {
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
  newHires: {
    employeeName: string;
    department: string;
    designation: string;
    joinDate: string;
  }[];
}

export default function HRReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [kpis, setKpis] = useState<HRKPIs | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [reportType, setReportType] = useState<string>("kpis");

  useEffect(() => {
    fetchReportData();
  }, [dateRange, departmentFilter, reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (departmentFilter) params.append("department", departmentFilter);
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());
      params.append("type", reportType);

      const response = await fetch(`/api/reports/hr?${params}`);
      const data = await response.json();

      if (data.success) {
        setKpis(data.data);
      } else {
        toast.error(data.error || "Failed to load report data");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

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
        ["On Leave", kpis.summary.onLeave.toString()],
        ["New Hires This Month", kpis.summary.newHiresThisMonth.toString()],
        ["Total Payroll", kpis.summary.totalPayroll.toFixed(2)],
        ["Average Salary", kpis.summary.averageSalary.toFixed(2)],
        ["Attendance Rate", kpis.summary.attendanceRate.toFixed(1) + "%"],
        ["Departments", kpis.summary.departments.toString()],
        [],
        ["By Department"],
        ["Department", "Employees", "Total Salary", "Avg Salary", "On Leave"],
        ...kpis.byDepartment.map(d => [
          d.department,
          d.employeeCount.toString(),
          d.totalSalary.toFixed(2),
          d.averageSalary.toFixed(2),
          d.onLeaveCount.toString()
        ]),
        [],
        ["Payroll Summary"],
        ["Month", "Total Payroll", "Paid", "Pending", "Employees"],
        ...kpis.payrollSummary.map(p => [
          p.month,
          p.totalPayroll.toFixed(2),
          p.paidAmount.toFixed(2),
          p.pendingAmount.toFixed(2),
          p.employeeCount.toString()
        ]),
        [],
        ["Attendance Data"],
        ["Employee", "Department", "Days Present", "Days Absent", "Days On Leave", "Attendance Rate"],
        ...kpis.attendanceData.map(a => [
          a.employeeName,
          a.department,
          a.daysPresent.toString(),
          a.daysAbsent.toString(),
          a.daysOnLeave.toString(),
          a.attendanceRate.toFixed(1) + "%"
        ])
      ];

      const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hr-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#3ECF8E]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">HR Reports</h1>
          <p className="text-sm text-[#717171]">Employee, attendance, and payroll analytics</p>
        </div>
        <Button
          onClick={exportToCSV}
          disabled={exporting || !kpis}
          className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
        >
          {exporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-56 justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
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
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {kpis?.byDepartment.map((dept) => (
                    <SelectItem key={dept.department} value={dept.department}>
                      {dept.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-end">
              <Button variant="outline" onClick={() => {
                setDateRange(undefined);
                setDepartmentFilter("");
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {kpis && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Total Employees</p>
                    <p className="text-2xl font-bold">{kpis.summary.totalEmployees}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#3ECF8E]" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.summary.activeEmployees} active, {kpis.summary.onLeave} on leave
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Total Payroll</p>
                    <p className="text-2xl font-bold">Nu. {(kpis.summary.totalPayroll / 1000).toFixed(0)}k</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Avg: Nu. {(kpis.summary.averageSalary / 1000).toFixed(0)}k/mo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Attendance Rate</p>
                    <p className="text-2xl font-bold">{kpis.summary.attendanceRate.toFixed(0)}%</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.summary.departments} departments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">New Hires</p>
                    <p className="text-2xl font-bold">{kpis.summary.newHiresThisMonth}</p>
                  </div>
                  <Briefcase className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="departments" className="space-y-4">
            <TabsList>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="hires">New Hires</TabsTrigger>
            </TabsList>

            <TabsContent value="departments">
              <Card>
                <CardHeader>
                  <CardTitle>Department Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Employees</TableHead>
                        <TableHead className="text-right">Total Salary</TableHead>
                        <TableHead className="text-right">Avg Salary</TableHead>
                        <TableHead className="text-right">On Leave</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.byDepartment.map((dept) => (
                        <TableRow key={dept.department}>
                          <TableCell className="font-medium">{dept.department}</TableCell>
                          <TableCell className="text-right">{dept.employeeCount}</TableCell>
                          <TableCell className="text-right">Nu. {dept.totalSalary.toLocaleString()}</TableCell>
                          <TableCell className="text-right">Nu. {dept.averageSalary.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            {dept.onLeaveCount > 0 ? (
                              <Badge variant="secondary">{dept.onLeaveCount}</Badge>
                            ) : (
                              <span className="text-[#717171]">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payroll">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Total Payroll</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Pending</TableHead>
                        <TableHead className="text-right">Employees</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.payrollSummary.map((payroll) => (
                        <TableRow key={payroll.month}>
                          <TableCell className="font-medium">{payroll.month}</TableCell>
                          <TableCell className="text-right">Nu. {payroll.totalPayroll.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-green-600">Nu. {payroll.paidAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-yellow-600">Nu. {payroll.pendingAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{payroll.employeeCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-right">Present</TableHead>
                        <TableHead className="text-right">Absent</TableHead>
                        <TableHead className="text-right">On Leave</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.attendanceData.map((record) => (
                        <TableRow key={record.employeeName}>
                          <TableCell className="font-medium">{record.employeeName}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell className="text-right text-green-600">{record.daysPresent}</TableCell>
                          <TableCell className="text-right text-red-600">{record.daysAbsent}</TableCell>
                          <TableCell className="text-right">{record.daysOnLeave}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={record.attendanceRate >= 90 ? "default" : "secondary"}>
                              {record.attendanceRate.toFixed(0)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hires">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Hires</CardTitle>
                </CardHeader>
                <CardContent>
                  {kpis.newHires.length === 0 ? (
                    <div className="text-center py-8 text-[#717171]">
                      <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No new hires this month</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Designation</TableHead>
                          <TableHead>Join Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpis.newHires.map((hire) => (
                          <TableRow key={hire.employeeName}>
                            <TableCell className="font-medium">{hire.employeeName}</TableCell>
                            <TableCell>{hire.department}</TableCell>
                            <TableCell>{hire.designation}</TableCell>
                            <TableCell>{new Date(hire.joinDate).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
