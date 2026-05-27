"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import {
  Users,
  Briefcase,
  Ticket,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  Download,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subMonths } from "date-fns";
import { toast } from "sonner";

interface DashboardData {
  stats: {
    clients: number;
    projects: number;
    openTickets: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
    activeProjects: number;
    pendingInvoices: number;
    totalEmployees: number;
    pendingPayroll: number;
    activeAMC: number;
    expiringAMC: number;
  };
  revenueData: {
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }[];
  recentActivity: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subMonths(new Date(), 6),
    to: new Date(),
  });
  const [months, setMonths] = useState(6);

  useEffect(() => {
    fetchData();
  }, [months]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/summary?months=${months}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error || "Failed to load dashboard");
      }
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    if (range.from && range.to) {
      setDateRange({ from: range.from, to: range.to });
      const diffTime = Math.abs(range.to.getTime() - range.from.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      setMonths(Math.max(1, diffMonths));
    }
  };

  const presetRanges = [
    { label: "Last 3 Months", value: 3 },
    { label: "Last 6 Months", value: 6 },
    { label: "Last 12 Months", value: 12 },
  ];

  const exportDashboard = () => {
    setExporting(true);
    try {
      if (!data) return;

      const rows = [
        ["innovates.bt - Dashboard Summary", new Date().toLocaleDateString()],
        [],
        ["Key Metrics"],
        ["Clients", data.stats.clients.toString()],
        ["Projects", data.stats.projects.toString()],
        ["Active Projects", data.stats.activeProjects.toString()],
        ["Open Tickets", data.stats.openTickets.toString()],
        ["Total Employees", data.stats.totalEmployees.toString()],
        ["Pending Invoices", data.stats.pendingInvoices.toString()],
        ["Pending Payroll", data.stats.pendingPayroll.toString()],
        ["Active AMC", data.stats.activeAMC.toString()],
        ["Expiring AMC (30 days)", data.stats.expiringAMC.toString()],
        [],
        ["Financials (This Month)"],
        ["Revenue", `Nu.${data.stats.monthlyRevenue.toLocaleString()}`],
        ["Expenses", `Nu.${data.stats.monthlyExpenses.toLocaleString()}`],
        ["Profit", `Nu.${(data.stats.monthlyRevenue - data.stats.monthlyExpenses).toLocaleString()}`],
        [],
        ["Monthly Revenue"],
        ["Month", "Revenue", "Expenses", "Profit"],
        ...data.revenueData.map((d) => [
          d.month,
          `Nu.${d.revenue.toLocaleString()}`,
          `Nu.${d.expenses.toLocaleString()}`,
          `Nu.${d.profit.toLocaleString()}`,
        ]),
      ];

      const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Dashboard exported");
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#3ECF8E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Executive Dashboard</h1>
          <p className="text-gray-400">Real-time business overview</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/5 justify-start text-left font-normal"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-900 border-white/10" align="end">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => range?.from && range?.to && handleDateRangeChange(range)}
                numberOfMonths={2}
                className="bg-transparent"
              />
            </PopoverContent>
          </Popover>

          {/* Preset Ranges */}
          <div className="flex gap-2">
            {presetRanges.map((preset) => (
              <Button
                key={preset.label}
                variant={months === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setMonths(preset.value);
                  setDateRange({
                    from: subMonths(new Date(), preset.value),
                    to: new Date(),
                  });
                }}
                className={months === preset.value
                  ? "bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
                  : "border-white/20 text-white hover:bg-white/5"
                }
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="border-white/20 text-white hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={exportDashboard}
            disabled={exporting}
            className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
          >
            {exporting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Clients"
          value={data?.stats.clients || 0}
          icon={Users}
          color="text-purple-400"
        />
        <MetricCard
          title="Projects"
          value={data?.stats.projects || 0}
          icon={Briefcase}
          color="text-blue-400"
          subtitle={`${data?.stats.activeProjects || 0} active`}
        />
        <MetricCard
          title="Tickets"
          value={data?.stats.openTickets || 0}
          icon={Ticket}
          color={data?.stats.openTickets ? "text-orange-400" : "text-green-400"}
        />
        <MetricCard
          title="Revenue"
          value={`Nu.${((data?.stats.monthlyRevenue || 0) / 1000).toFixed(0)}k`}
          icon={DollarSign}
          color="text-[#3ECF8E]"
        />
        <MetricCard
          title="Team"
          value={data?.stats.totalEmployees || 0}
          icon={Users}
          color="text-cyan-400"
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Invoices"
          value={data?.stats.pendingInvoices || 0}
          icon={FileText}
          color="text-yellow-400"
        />
        <MetricCard
          title="Pending Payroll"
          value={data?.stats.pendingPayroll || 0}
          icon={CheckCircle2}
          color="text-orange-400"
        />
        <MetricCard
          title="Active AMC"
          value={data?.stats.activeAMC || 0}
          icon={Briefcase}
          color="text-emerald-400"
        />
        <MetricCard
          title="Expiring AMC"
          value={data?.stats.expiringAMC || 0}
          icon={AlertCircle}
          color={data?.stats.expiringAMC ? "text-red-400" : "text-green-400"}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={data?.revenueData || []} loading={loading} />
        </div>
        <div>
          <ActivityFeed activities={data?.recentActivity || []} loading={loading} />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="backdrop-blur-xl bg-white/5 border-white/10">
        <CardContent className="p-4">
          <h3 className="text-white font-medium mb-3">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/5"
              onClick={() => (window.location.href = "/admin/clients")}
            >
              <Users className="w-4 h-4 mr-2" />
              Add Client
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/5"
              onClick={() => (window.location.href = "/admin/projects")}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              New Project
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/5"
              onClick={() => (window.location.href = "/admin/invoice")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/5"
              onClick={() => (window.location.href = "/admin/tickets")}
            >
              <Ticket className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
