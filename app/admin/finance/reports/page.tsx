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
  DollarSign, Download, Calendar as CalendarIcon, TrendingUp,
  TrendingDown, AlertCircle, CheckCircle, Clock, Loader2, FileText
} from "lucide-react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinanceKPIs {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    pendingInvoices: number;
    overdueInvoices: number;
    paidThisMonth: number;
    outstandingAmount: number;
  };
  invoiceAging: {
    period: string;
    count: number;
    amount: number;
  }[];
  revenueTrends: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  topClients: {
    clientName: string;
    totalInvoiced: number;
    paidAmount: number;
    outstandingAmount: number;
    invoiceCount: number;
  }[];
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export default function FinanceReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [kpis, setKpis] = useState<FinanceKPIs | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reportType, setReportType] = useState<string>("kpis");

  useEffect(() => {
    fetchReportData();
  }, [dateRange, statusFilter, reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (dateRange?.from) params.append("startDate", dateRange.from.toISOString());
      if (dateRange?.to) params.append("endDate", dateRange.to.toISOString());
      params.append("type", reportType);

      const response = await fetch(`/api/reports/finance?${params}`);
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
        ["Finance Report - " + new Date().toLocaleDateString()],
        [],
        ["Summary"],
        ["Total Revenue", kpis.summary.totalRevenue.toFixed(2)],
        ["Total Expenses", kpis.summary.totalExpenses.toFixed(2)],
        ["Net Profit", kpis.summary.netProfit.toFixed(2)],
        ["Profit Margin", kpis.summary.profitMargin.toFixed(1) + "%"],
        ["Pending Invoices", kpis.summary.pendingInvoices.toString()],
        ["Overdue Invoices", kpis.summary.overdueInvoices.toString()],
        ["Paid This Month", kpis.summary.paidThisMonth.toFixed(2)],
        ["Outstanding Amount", kpis.summary.outstandingAmount.toFixed(2)],
        [],
        ["Invoice Aging"],
        ["Period", "Count", "Amount"],
        ...kpis.invoiceAging.map(a => [a.period, a.count.toString(), a.amount.toFixed(2)]),
        [],
        ["Top Clients"],
        ["Client", "Total Invoiced", "Paid", "Outstanding", "Invoices"],
        ...kpis.topClients.map(c => [
          c.clientName,
          c.totalInvoiced.toFixed(2),
          c.paidAmount.toFixed(2),
          c.outstandingAmount.toFixed(2),
          c.invoiceCount.toString()
        ]),
        [],
        ["Expense Breakdown"],
        ["Category", "Amount", "Percentage"],
        ...kpis.expenseBreakdown.map(e => [e.category, e.amount.toFixed(2), e.percentage.toFixed(1) + "%"])
      ];

      const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const getAgingColor = (period: string) => {
    switch (period) {
      case "Current": return "bg-green-100 text-green-700";
      case "1-30 Days": return "bg-yellow-100 text-yellow-700";
      case "31-60 Days": return "bg-orange-100 text-orange-700";
      case "61-90 Days": return "bg-red-100 text-red-700";
      case "90+ Days": return "bg-red-200 text-red-800";
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
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Finance Reports</h1>
          <p className="text-sm text-[#717171]">Revenue, expenses, and financial analytics</p>
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
              <Label>Invoice Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-end">
              <Button variant="outline" onClick={() => {
                setDateRange(undefined);
                setStatusFilter("all");
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
                    <p className="text-sm text-[#717171]">Total Revenue</p>
                    <p className="text-2xl font-bold">Nu. {(kpis.summary.totalRevenue / 1000).toFixed(0)}k</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Margin: {kpis.summary.profitMargin.toFixed(0)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Net Profit</p>
                    <p className={`text-2xl font-bold ${kpis.summary.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      Nu. {(kpis.summary.netProfit / 1000).toFixed(0)}k
                    </p>
                  </div>
                  {kpis.summary.netProfit >= 0 ? (
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Expenses: Nu. {(kpis.summary.totalExpenses / 1000).toFixed(0)}k
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Outstanding</p>
                    <p className="text-2xl font-bold">Nu. {(kpis.summary.outstandingAmount / 1000).toFixed(0)}k</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  {kpis.summary.pendingInvoices} pending invoices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#717171]">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{kpis.summary.overdueInvoices}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="aging" className="space-y-4">
            <TabsList>
              <TabsTrigger value="aging">Invoice Aging</TabsTrigger>
              <TabsTrigger value="clients">Top Clients</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="aging">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Aging Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {kpis.invoiceAging.map((aging) => (
                      <Card key={aging.period}>
                        <CardContent className="p-4 text-center">
                          <Badge className={`mb-2 ${getAgingColor(aging.period)}`}>
                            {aging.period}
                          </Badge>
                          <p className="text-lg font-bold">{aging.count}</p>
                          <p className="text-sm text-[#717171]">Nu. {aging.amount.toLocaleString()}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients">
              <Card>
                <CardHeader>
                  <CardTitle>Top Clients by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead className="text-right">Invoiced</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Outstanding</TableHead>
                        <TableHead className="text-right">Invoices</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.topClients.map((client) => (
                        <TableRow key={client.clientName}>
                          <TableCell className="font-medium">{client.clientName}</TableCell>
                          <TableCell className="text-right">Nu. {client.totalInvoiced.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-green-600">Nu. {client.paidAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-yellow-600">Nu. {client.outstandingAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{client.invoiceCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kpis.expenseBreakdown.map((expense) => (
                      <div key={expense.category} className="flex items-center gap-3">
                        <div className="w-40 text-sm font-medium truncate">
                          {expense.category}
                        </div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${expense.percentage}%` }}
                          />
                        </div>
                        <div className="w-32 text-right text-sm">
                          Nu. {expense.amount.toLocaleString()}
                        </div>
                        <div className="w-16 text-right text-sm text-[#717171]">
                          {expense.percentage.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Expenses</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                        <TableHead className="text-right">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {kpis.revenueTrends.map((trend) => (
                        <TableRow key={trend.month}>
                          <TableCell className="font-medium">{trend.month}</TableCell>
                          <TableCell className="text-right text-green-600">Nu. {trend.revenue.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-red-600">Nu. {trend.expenses.toLocaleString()}</TableCell>
                          <TableCell className={`text-right ${trend.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            Nu. {trend.profit.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {((trend.profit / trend.revenue) * 100).toFixed(0)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
