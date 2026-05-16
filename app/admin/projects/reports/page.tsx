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
  BarChart3, Download, Calendar as CalendarIcon, TrendingUp,
  DollarSign, Clock, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";

interface ProjectKPIs {
  summary: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    totalBudget: number;
    totalActualCost: number;
    averageProgress: number;
    overdueProjects: number;
  };
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  byClient: {
    clientName: string;
    projectCount: number;
    totalBudget: number;
    totalActualCost: number;
    averageProgress: number;
  }[];
  completionTrends: {
    month: string;
    completed: number;
    started: number;
  }[];
  budgetVsActual: {
    projectName: string;
    clientName: string;
    budget: number;
    actualCost: number;
    variance: number;
    progress: number;
  }[];
}

export default function ProjectsReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [kpis, setKpis] = useState<ProjectKPIs | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchReportData();
  }, [dateRange, statusFilter]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());

      const response = await fetch(`/api/reports/projects?${params}`);
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
        ["Projects Report - " + new Date().toLocaleDateString()],
        [],
        ["Summary"],
        ["Total Projects", kpis.summary.totalProjects],
        ["Active Projects", kpis.summary.activeProjects],
        ["Completed Projects", kpis.summary.completedProjects],
        ["On Hold Projects", kpis.summary.onHoldProjects],
        ["Total Budget", kpis.summary.totalBudget.toFixed(2)],
        ["Total Actual Cost", kpis.summary.totalActualCost.toFixed(2)],
        ["Average Progress", kpis.summary.averageProgress.toFixed(1) + "%"],
        ["Overdue Projects", kpis.summary.overdueProjects],
        [],
        ["By Status"],
        ["Status", "Count", "Percentage"],
        ...kpis.byStatus.map(s => [s.status, s.count.toString(), s.percentage.toFixed(1) + "%"]),
        [],
        ["By Client"],
        ["Client", "Projects", "Total Budget", "Actual Cost", "Avg Progress"],
        ...kpis.byClient.map(c => [
          c.clientName,
          c.projectCount.toString(),
          c.totalBudget.toFixed(2),
          c.totalActualCost.toFixed(2),
          c.averageProgress.toFixed(1) + "%"
        ]),
        [],
        ["Budget vs Actual"],
        ["Project", "Client", "Budget", "Actual Cost", "Variance", "Progress"],
        ...kpis.budgetVsActual.map(b => [
          b.projectName,
          b.clientName,
          b.budget.toFixed(2),
          b.actualCost.toFixed(2),
          b.variance.toFixed(2),
          b.progress.toFixed(1) + "%"
        ])
      ];

      const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `projects-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "complete": return "bg-blue-100 text-blue-700";
      case "on_hold": return "bg-yellow-100 text-yellow-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "text-green-600";
    if (variance < 0) return "text-red-600";
    return "text-gray-600";
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Projects Reports</h1>
          <p className="text-sm text-[#717171]">Project performance and budget analytics</p>
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
              <Label>Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-end">
              <Button variant="outline" onClick={() => {
                setDateRange(undefined);
                setStatusFilter("");
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
                    <p className="text-sm text-[#717171]">Total Projects</p>
                    <p className="text-2xl font-bold">{kpis.summary.totalProjects}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-[#3ECF8E]" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.summary.activeProjects} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Total Budget</p>
                    <p className="text-2xl font-bold">Nu. {(kpis.summary.totalBudget / 1000).toFixed(0)}k</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Actual: Nu. {(kpis.summary.totalActualCost / 1000).toFixed(0)}k
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Avg Progress</p>
                    <p className="text-2xl font-bold">{kpis.summary.averageProgress.toFixed(0)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.summary.completedProjects} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Overdue</p>
                    <p className="text-2xl font-bold">{kpis.summary.overdueProjects}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.summary.onHoldProjects} on hold
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpis.byStatus.map((status) => (
                  <div key={status.status} className="flex items-center gap-3">
                    <div className="w-28 text-sm font-medium capitalize">
                      {status.status.replace("_", " ")}
                    </div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3ECF8E] rounded-full transition-all"
                        style={{ width: `${status.percentage}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-sm">
                      {status.count} ({status.percentage.toFixed(0)}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Budget vs Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Actual</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpis.budgetVsActual.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-[#717171]">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    kpis.budgetVsActual.map((item) => (
                      <TableRow key={item.projectName}>
                        <TableCell className="font-medium">{item.projectName}</TableCell>
                        <TableCell>{item.clientName}</TableCell>
                        <TableCell className="text-right">Nu. {item.budget.toLocaleString()}</TableCell>
                        <TableCell className="text-right">Nu. {item.actualCost.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-medium ${getVarianceColor(item.variance)}`}>
                          {item.variance > 0 ? "+" : ""}{item.variance.toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right">{item.progress.toFixed(0)}%</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* By Client Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Performance by Client</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Projects</TableHead>
                    <TableHead className="text-right">Total Budget</TableHead>
                    <TableHead className="text-right">Actual Cost</TableHead>
                    <TableHead className="text-right">Avg Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpis.byClient.map((client) => (
                    <TableRow key={client.clientName}>
                      <TableCell className="font-medium">{client.clientName}</TableCell>
                      <TableCell className="text-right">{client.projectCount}</TableCell>
                      <TableCell className="text-right">Nu. {client.totalBudget.toLocaleString()}</TableCell>
                      <TableCell className="text-right">Nu. {client.totalActualCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{client.averageProgress.toFixed(0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
