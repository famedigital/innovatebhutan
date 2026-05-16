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
  Ticket, Download, Calendar as CalendarIcon, TrendingUp,
  MessageSquare, Clock, CheckCircle, AlertCircle, Loader2, Activity
} from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SupportKPIs {
  summary: {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    slaComplianceRate: number;
    highPriorityTickets: number;
  };
  byStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  byPriority: {
    priority: string;
    count: number;
    averageResolutionTime: number;
  }[];
  byClient: {
    clientName: string;
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
  }[];
  responseTrends: {
    date: string;
    ticketsCreated: number;
    ticketsResolved: number;
    averageResponseTime: number;
  }[];
  slaBreaches: {
    ticketId: string;
    clientName: string;
    subject: string;
    priority: string;
    overdueBy: number;
  }[];
}

export default function TicketsReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [kpis, setKpis] = useState<SupportKPIs | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");

  useEffect(() => {
    fetchReportData();
  }, [dateRange, statusFilter, priorityFilter]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());

      const response = await fetch(`/api/reports/support?${params}`);
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
        ["Support Tickets Report - " + new Date().toLocaleDateString()],
        [],
        ["Summary"],
        ["Total Tickets", kpis.summary.totalTickets.toString()],
        ["Open Tickets", kpis.summary.openTickets.toString()],
        ["In Progress", kpis.summary.inProgressTickets.toString()],
        ["Resolved", kpis.summary.resolvedTickets.toString()],
        ["Avg Response Time", kpis.summary.averageResponseTime.toFixed(0) + " minutes"],
        ["Avg Resolution Time", kpis.summary.averageResolutionTime.toFixed(0) + " hours"],
        ["SLA Compliance", kpis.summary.slaComplianceRate.toFixed(1) + "%"],
        ["High Priority", kpis.summary.highPriorityTickets.toString()],
        [],
        ["By Status"],
        ["Status", "Count", "Percentage"],
        ...kpis.byStatus.map(s => [s.status, s.count.toString(), s.percentage.toFixed(1) + "%"]),
        [],
        ["By Priority"],
        ["Priority", "Count", "Avg Resolution Time (hrs)"],
        ...kpis.byPriority.map(p => [p.priority, p.count.toString(), p.averageResolutionTime.toFixed(1)]),
        [],
        ["By Client"],
        ["Client", "Total Tickets", "Open", "Resolved", "Avg Response Time (min)"],
        ...kpis.byClient.map(c => [
          c.clientName,
          c.totalTickets.toString(),
          c.openTickets.toString(),
          c.resolvedTickets.toString(),
          c.averageResponseTime.toFixed(0)
        ]),
        [],
        ["SLA Breaches"],
        ["Ticket ID", "Client", "Subject", "Priority", "Overdue By (hrs)"],
        ...kpis.slaBreaches.map(b => [
          b.ticketId,
          b.clientName,
          b.subject,
          b.priority,
          b.overdueBy.toFixed(1)
        ])
      ];

      const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `support-report-${new Date().toISOString().split("T")[0]}.csv`;
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
      case "open": return "bg-blue-100 text-blue-700";
      case "in_progress": return "bg-yellow-100 text-yellow-700";
      case "resolved": return "bg-green-100 text-green-700";
      case "closed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-700";
      case "high": return "bg-orange-100 text-orange-700";
      case "medium": return "bg-yellow-100 text-yellow-700";
      case "low": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Support Reports</h1>
          <p className="text-sm text-[#717171]">Ticket volume, SLA compliance, and response analytics</p>
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
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-end">
              <Button variant="outline" onClick={() => {
                setDateRange(undefined);
                setStatusFilter("");
                setPriorityFilter("");
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
                    <p className="text-sm text-[#717171]">Total Tickets</p>
                    <p className="text-2xl font-bold">{kpis.summary.totalTickets}</p>
                  </div>
                  <Ticket className="w-8 h-8 text-[#3ECF8E]" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.summary.openTickets} open, {kpis.summary.inProgressTickets} in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Avg Response</p>
                    <p className="text-2xl font-bold">{kpis.summary.averageResponseTime.toFixed(0)}m</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Resolution: {kpis.summary.averageResolutionTime.toFixed(0)}h avg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">SLA Compliance</p>
                    <p className="text-2xl font-bold">{kpis.summary.slaComplianceRate.toFixed(0)}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.slaBreaches.length} breaches
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">High Priority</p>
                    <p className="text-2xl font-bold">{kpis.summary.highPriorityTickets}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clients">By Client</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="sla">SLA Breaches</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <Card>
                  <CardHeader>
                    <CardTitle>Priority Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Priority</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">Avg Resolution</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpis.byPriority.map((priority) => (
                          <TableRow key={priority.priority}>
                            <TableCell>
                              <Badge className={getPriorityColor(priority.priority)}>
                                {priority.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{priority.count}</TableCell>
                            <TableCell className="text-right">{priority.averageResolutionTime.toFixed(1)}h</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Tickets by Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Open</TableHead>
                        <TableHead className="text-right">Resolved</TableHead>
                        <TableHead className="text-right">Avg Response</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.byClient.map((client) => (
                        <TableRow key={client.clientName}>
                          <TableCell className="font-medium">{client.clientName}</TableCell>
                          <TableCell className="text-right">{client.totalTickets}</TableCell>
                          <TableCell className="text-right">
                            {client.openTickets > 0 ? (
                              <Badge variant="secondary">{client.openTickets}</Badge>
                            ) : (
                              <span className="text-[#717171]">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-green-600">{client.resolvedTickets}</TableCell>
                          <TableCell className="text-right">{client.averageResponseTime.toFixed(0)}m</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Response Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Created</TableHead>
                        <TableHead className="text-right">Resolved</TableHead>
                        <TableHead className="text-right">Avg Response Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.responseTrends.map((trend) => (
                        <TableRow key={trend.date}>
                          <TableCell className="font-medium">{trend.date}</TableCell>
                          <TableCell className="text-right">{trend.ticketsCreated}</TableCell>
                          <TableCell className="text-right text-green-600">{trend.ticketsResolved}</TableCell>
                          <TableCell className="text-right">{trend.averageResponseTime.toFixed(0)}m</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sla">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    SLA Breaches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {kpis.slaBreaches.length === 0 ? (
                    <div className="text-center py-8 text-[#717171]">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No SLA breaches - Great job!</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket ID</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead className="text-right">Overdue By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpis.slaBreaches.map((breach) => (
                          <TableRow key={breach.ticketId}>
                            <TableCell className="font-medium">{breach.ticketId}</TableCell>
                            <TableCell>{breach.clientName}</TableCell>
                            <TableCell className="max-w-xs truncate">{breach.subject}</TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(breach.priority)}>
                                {breach.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-red-600 font-medium">
                              {breach.overdueBy.toFixed(1)}h
                            </TableCell>
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
