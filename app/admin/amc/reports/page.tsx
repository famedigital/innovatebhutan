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
  FileText, Download, Calendar as CalendarIcon, TrendingUp,
  DollarSign, AlertCircle, CheckCircle, Clock, Loader2, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AMCKPIs {
  summary: {
    totalContracts: number;
    activeContracts: number;
    expiringContracts: number;
    expiredContracts: number;
    totalMonthlyRevenue: number;
    totalAnnualValue: number;
    upcomingRenewals: number;
    averageContractValue: number;
  };
  byStatus: {
    status: string;
    count: number;
    totalValue: number;
    percentage: number;
  }[];
  byClient: {
    clientName: string;
    contractCount: number;
    totalValue: number;
    activeContracts: number;
    monthlyRevenue: number;
  }[];
  renewalTimeline: {
    month: string;
    contractsExpiring: number;
    valueAtRisk: number;
  }[];
  expiryAlert: {
    contractNumber: string;
    clientName: string;
    serviceName: string;
    endDate: string;
    daysUntilExpiry: number;
    value: number;
  }[];
}

export default function AMCReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [kpis, setKpis] = useState<AMCKPIs | null>(null);
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

      const response = await fetch(`/api/reports/amc?${params}`);
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
        ["AMC Report - " + new Date().toLocaleDateString()],
        [],
        ["Summary"],
        ["Total Contracts", kpis.summary.totalContracts.toString()],
        ["Active Contracts", kpis.summary.activeContracts.toString()],
        ["Expiring Soon", kpis.summary.expiringContracts.toString()],
        ["Expired", kpis.summary.expiredContracts.toString()],
        ["Monthly Recurring Revenue", kpis.summary.totalMonthlyRevenue.toFixed(2)],
        ["Total Annual Value", kpis.summary.totalAnnualValue.toFixed(2)],
        ["Upcoming Renewals", kpis.summary.upcomingRenewals.toString()],
        ["Average Contract Value", kpis.summary.averageContractValue.toFixed(2)],
        [],
        ["By Status"],
        ["Status", "Count", "Total Value", "Percentage"],
        ...kpis.byStatus.map(s => [
          s.status,
          s.count.toString(),
          s.totalValue.toFixed(2),
          s.percentage.toFixed(1) + "%"
        ]),
        [],
        ["By Client"],
        ["Client", "Contracts", "Total Value", "Active", "Monthly Revenue"],
        ...kpis.byClient.map(c => [
          c.clientName,
          c.contractCount.toString(),
          c.totalValue.toFixed(2),
          c.activeContracts.toString(),
          c.monthlyRevenue.toFixed(2)
        ]),
        [],
        ["Renewal Timeline"],
        ["Month", "Contracts Expiring", "Value at Risk"],
        ...kpis.renewalTimeline.map(r => [
          r.month,
          r.contractsExpiring.toString(),
          r.valueAtRisk.toFixed(2)
        ]),
        [],
        ["Expiry Alerts"],
        ["Contract #", "Client", "Service", "End Date", "Days Until Expiry", "Value"],
        ...kpis.expiryAlert.map(e => [
          e.contractNumber,
          e.clientName,
          e.serviceName || "N/A",
          e.endDate,
          e.daysUntilExpiry.toString(),
          e.value.toFixed(2)
        ])
      ];

      const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `amc-report-${new Date().toISOString().split("T")[0]}.csv`;
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
      case "expiring": return "bg-orange-100 text-orange-700";
      case "expired": return "bg-red-100 text-red-700";
      case "cancelled": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return "bg-red-100 text-red-700";
    if (days <= 30) return "bg-orange-100 text-orange-700";
    if (days <= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">AMC Reports</h1>
          <p className="text-sm text-[#717171]">Contract status, revenue, and renewal analytics</p>
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
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
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
                    <p className="text-sm text-[#717171]">Total Contracts</p>
                    <p className="text-2xl font-bold">{kpis.summary.totalContracts}</p>
                  </div>
                  <FileText className="w-8 h-8 text-[#3ECF8E]" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.summary.activeContracts} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Monthly Revenue</p>
                    <p className="text-2xl font-bold">Nu. {(kpis.summary.totalMonthlyRevenue / 1000).toFixed(0)}k</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Annual: Nu. {(kpis.summary.totalAnnualValue / 1000).toFixed(0)}k
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Expiring Soon</p>
                    <p className="text-2xl font-bold">{kpis.summary.expiringContracts}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.summary.upcomingRenewals} renewals pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Avg Contract</p>
                    <p className="text-2xl font-bold">Nu. {(kpis.summary.averageContractValue / 1000).toFixed(0)}k</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Per contract value
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clients">By Client</TabsTrigger>
              <TabsTrigger value="renewals">Renewals</TabsTrigger>
              <TabsTrigger value="alerts">Expiry Alerts</TabsTrigger>
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
                    <CardTitle>Contract Value by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">Total Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpis.byStatus.map((status) => (
                          <TableRow key={status.status}>
                            <TableCell>
                              <Badge className={getStatusColor(status.status)}>
                                {status.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{status.count}</TableCell>
                            <TableCell className="text-right">Nu. {status.totalValue.toLocaleString()}</TableCell>
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
                  <CardTitle>Top Clients by Contract Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Contracts</TableHead>
                        <TableHead className="text-right">Active</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                        <TableHead className="text-right">Monthly Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.byClient.map((client) => (
                        <TableRow key={client.clientName}>
                          <TableCell className="font-medium">{client.clientName}</TableCell>
                          <TableCell className="text-right">{client.contractCount}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{client.activeContracts}</Badge>
                          </TableCell>
                          <TableCell className="text-right">Nu. {client.totalValue.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-green-600">Nu. {client.monthlyRevenue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="renewals">
              <Card>
                <CardHeader>
                  <CardTitle>Renewal Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Contracts Expiring</TableHead>
                        <TableHead className="text-right">Value at Risk</TableHead>
                        <TableHead className="text-right">Action Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.renewalTimeline.map((timeline) => (
                        <TableRow key={timeline.month}>
                          <TableCell className="font-medium">{timeline.month}</TableCell>
                          <TableCell className="text-right">
                            {timeline.contractsExpiring > 0 ? (
                              <Badge variant={timeline.contractsExpiring > 5 ? "destructive" : "secondary"}>
                                {timeline.contractsExpiring}
                              </Badge>
                            ) : (
                              <span className="text-[#717171]">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {timeline.valueAtRisk > 0 ? (
                              <span className="text-orange-600 font-medium">
                                Nu. {timeline.valueAtRisk.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[#717171]">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {timeline.contractsExpiring > 0 && (
                              <Button size="sm" variant="outline">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Prepare
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Contracts Requiring Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {kpis.expiryAlert.length === 0 ? (
                    <div className="text-center py-8 text-[#717171]">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No contracts expiring soon</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contract #</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead className="text-right">Days Left</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpis.expiryAlert.map((alert) => (
                          <TableRow key={alert.contractNumber}>
                            <TableCell className="font-medium">{alert.contractNumber}</TableCell>
                            <TableCell>{alert.clientName}</TableCell>
                            <TableCell>{alert.serviceName || "N/A"}</TableCell>
                            <TableCell>{new Date(alert.endDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Badge className={getExpiryColor(alert.daysUntilExpiry)}>
                                {alert.daysUntilExpiry} days
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">Nu. {alert.value.toLocaleString()}</TableCell>
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
