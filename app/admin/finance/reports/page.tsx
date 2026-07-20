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
  Download,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Loader2,
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
import type { FinanceReportKPIs } from "@/lib/repositories/reportRepository";

interface FinanceViewModel {
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
  invoiceAging: { period: string; count: number; amount: number }[];
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

/** Map API FinanceReportKPIs (flat) into the nested view model the UI expects. */
function normalizeFinanceReport(raw: unknown): FinanceViewModel | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;

  // Already nested (legacy / summary wrapper)
  if (
    data.summary &&
    typeof data.summary === "object" &&
    "totalRevenue" in (data.summary as object)
  ) {
    return raw as FinanceViewModel;
  }

  const kpis = data as unknown as FinanceReportKPIs;
  const totalRevenue = Number(kpis.totalRevenue) || 0;
  const totalExpenses = Number(kpis.totalExpenses) || 0;
  const netProfit = Number(kpis.netIncome) || 0;
  const expenseEntries = Object.entries(kpis.expenseByCategory || {});
  const expenseTotal =
    expenseEntries.reduce((sum, [, amount]) => sum + Number(amount), 0) || 1;

  return {
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin:
        totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0,
      pendingInvoices:
        Number(kpis.invoiceStats?.sent || 0) +
        Number(kpis.invoiceStats?.draft || 0),
      overdueInvoices: Number(kpis.invoiceStats?.overdue) || 0,
      paidThisMonth: Number(kpis.paidAmount) || 0,
      outstandingAmount: Number(kpis.pendingPayments) || 0,
    },
    invoiceAging: [
      {
        period: "Paid",
        count: Number(kpis.invoiceStats?.paid) || 0,
        amount: Number(kpis.paidAmount) || 0,
      },
      {
        period: "Pending",
        count:
          Number(kpis.invoiceStats?.sent || 0) +
          Number(kpis.invoiceStats?.draft || 0),
        amount: Number(kpis.pendingPayments) || 0,
      },
      {
        period: "Overdue",
        count: Number(kpis.invoiceStats?.overdue) || 0,
        amount: Number(kpis.overdueAmount) || 0,
      },
    ],
    revenueTrends: (kpis.revenueByMonth || []).map((row) => ({
      month: `${row.month} ${row.year}`,
      revenue: Number(row.revenue) || 0,
      expenses: Number(row.expenses) || 0,
      profit: (Number(row.revenue) || 0) - (Number(row.expenses) || 0),
    })),
    topClients: (kpis.topClients || []).map((c) => ({
      clientName: c.clientName || "Unknown",
      totalInvoiced: Number(c.totalAmount) || 0,
      paidAmount: 0,
      outstandingAmount: Number(c.totalAmount) || 0,
      invoiceCount: 0,
    })),
    expenseBreakdown: expenseEntries.map(([category, amount]) => {
      const value = Number(amount) || 0;
      return {
        category,
        amount: value,
        percentage: Math.round((value / expenseTotal) * 100),
      };
    }),
  };
}

function formatNu(amount: number) {
  if (Math.abs(amount) >= 1000) {
    return `Nu. ${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
  }
  return `Nu. ${amount.toLocaleString()}`;
}

export default function FinanceReportsPage() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [kpis, setKpis] = useState<FinanceViewModel | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString());
      }
      params.append("type", "kpis");

      const response = await fetch(`/api/reports/finance/?${params}`);
      const data = await response.json();

      if (data.success) {
        const normalized = normalizeFinanceReport(data.data);
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
  }, [dateRange, statusFilter]);

  useEffect(() => {
    void fetchReportData();
  }, [fetchReportData]);

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
        ["Paid Amount", kpis.summary.paidThisMonth.toFixed(2)],
        ["Outstanding Amount", kpis.summary.outstandingAmount.toFixed(2)],
        [],
        ["Invoice Status"],
        ["Period", "Count", "Amount"],
        ...kpis.invoiceAging.map((a) => [
          a.period,
          a.count.toString(),
          a.amount.toFixed(2),
        ]),
        [],
        ["Top Clients"],
        ["Client", "Total Invoiced"],
        ...kpis.topClients.map((c) => [
          c.clientName,
          c.totalInvoiced.toFixed(2),
        ]),
        [],
        ["Expense Breakdown"],
        ["Category", "Amount", "Percentage"],
        ...kpis.expenseBreakdown.map((e) => [
          e.category,
          e.amount.toFixed(2),
          e.percentage.toFixed(1) + "%",
        ]),
      ];

      const csvContent = rows
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported successfully");
    } catch {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const getAgingColor = (period: string) => {
    switch (period) {
      case "Paid":
      case "Current":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "Pending":
      case "1-30 Days":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "Overdue":
      case "90+ Days":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
      default:
        return "bg-muted text-muted-foreground";
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
        title="Finance Reports"
        description="Revenue, expenses, and invoice analytics"
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
              <Button
                variant="outline"
                onClick={() => {
                  setDateRange(undefined);
                  setStatusFilter("all");
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
              No report data available. Try clearing filters or check ledger
              entries.
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
                      Total Revenue
                    </p>
                    <p className="truncate text-xl font-semibold sm:text-2xl">
                      {formatNu(kpis.summary.totalRevenue)}
                    </p>
                  </div>
                  <TrendingUp className="size-7 shrink-0 text-emerald-500" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Margin: {kpis.summary.profitMargin}%
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Net Profit
                    </p>
                    <p
                      className={`truncate text-xl font-semibold sm:text-2xl ${
                        kpis.summary.netProfit >= 0
                          ? "text-emerald-600"
                          : "text-destructive"
                      }`}
                    >
                      {formatNu(kpis.summary.netProfit)}
                    </p>
                  </div>
                  {kpis.summary.netProfit >= 0 ? (
                    <TrendingUp className="size-7 shrink-0 text-emerald-500" />
                  ) : (
                    <TrendingDown className="size-7 shrink-0 text-destructive" />
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Expenses: {formatNu(kpis.summary.totalExpenses)}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Outstanding
                    </p>
                    <p className="truncate text-xl font-semibold sm:text-2xl">
                      {formatNu(kpis.summary.outstandingAmount)}
                    </p>
                  </div>
                  <Clock className="size-7 shrink-0 text-amber-500" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {kpis.summary.pendingInvoices} open invoices
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Overdue
                    </p>
                    <p className="text-xl font-semibold text-destructive sm:text-2xl">
                      {kpis.summary.overdueInvoices}
                    </p>
                  </div>
                  <AlertCircle className="size-7 shrink-0 text-destructive" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="aging" className="space-y-4">
            <TabsList className="h-auto w-full flex-wrap justify-start sm:w-auto">
              <TabsTrigger value="aging">Invoice status</TabsTrigger>
              <TabsTrigger value="clients">Top clients</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="aging">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Invoice status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {kpis.invoiceAging.map((aging) => (
                      <div
                        key={aging.period}
                        className="rounded-lg border p-4 text-center"
                      >
                        <Badge
                          className={`mb-2 ${getAgingColor(aging.period)}`}
                        >
                          {aging.period}
                        </Badge>
                        <p className="text-lg font-semibold">{aging.count}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNu(aging.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">
                    Top clients by invoiced amount
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {kpis.topClients.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No client invoice totals for this period.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead className="text-right">Invoiced</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kpis.topClients.map((client) => (
                          <TableRow key={client.clientName}>
                            <TableCell className="font-medium">
                              {client.clientName}
                            </TableCell>
                            <TableCell className="text-right">
                              Nu. {client.totalInvoiced.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Expense breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  {kpis.expenseBreakdown.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No expenses categorized for this period.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {kpis.expenseBreakdown.map((expense) => (
                        <div
                          key={expense.category}
                          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
                        >
                          <div className="w-full truncate text-sm font-medium sm:w-40">
                            {expense.category}
                          </div>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${Math.min(expense.percentage, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between gap-3 text-sm sm:w-40 sm:justify-end">
                            <span>
                              Nu. {expense.amount.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              {expense.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends">
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Revenue trends</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {kpis.revenueTrends.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Monthly trend data is not available yet.
                    </p>
                  ) : (
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
                            <TableCell className="font-medium">
                              {trend.month}
                            </TableCell>
                            <TableCell className="text-right text-emerald-600">
                              Nu. {trend.revenue.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-destructive">
                              Nu. {trend.expenses.toLocaleString()}
                            </TableCell>
                            <TableCell
                              className={`text-right ${
                                trend.profit >= 0
                                  ? "text-emerald-600"
                                  : "text-destructive"
                              }`}
                            >
                              Nu. {trend.profit.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {trend.revenue > 0
                                ? (
                                    (trend.profit / trend.revenue) *
                                    100
                                  ).toFixed(0)
                                : 0}
                              %
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
