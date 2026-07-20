"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  RefreshCw,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PayrollStats {
  totalEmployees?: number;
  draftPayslips?: number;
  approvedPayslips?: number;
  paidPayslips?: number;
  totalPayroll?: number;
}

type LoadingState = "idle" | "loading" | "success" | "error";

type EmployeeRow = {
  id: number;
  name?: string | null;
  designation?: string | null;
  department?: string | null;
  base_salary?: number | string | null;
  status?: string | null;
  additional_docs?: { status?: string; department?: string } | null;
  profiles?: { full_name?: string | null } | null;
};

function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  loading,
}: {
  title: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  subtitle?: string;
  loading?: boolean;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
            {title}
          </span>
          <div className="flex size-7 items-center justify-center rounded-md border bg-muted/40 sm:size-8">
            <Icon className="size-3.5 text-primary sm:size-4" />
          </div>
        </div>
        {loading ? (
          <Skeleton className="mt-2 h-7 w-16" />
        ) : (
          <p className="mt-1 truncate text-lg font-semibold sm:text-xl">
            {value}
          </p>
        )}
        {subtitle ? (
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            {subtitle}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "inactive":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";
    case "on_leave":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function HRDashboard() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [payrollStats, setPayrollStats] = useState<PayrollStats>({});
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [statsLoadingState, setStatsLoadingState] =
    useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const supabase = createClient();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    void fetchEmployees();
  }, []);

  useEffect(() => {
    void fetchPayrollStats();
  }, [selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      setLoadingState("loading");
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("employees")
        .select("*, profiles(full_name)")
        .order("join_date", { ascending: false });

      if (fetchError) throw fetchError;

      setEmployees((data as EmployeeRow[]) || []);
      setLoadingState("success");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch employees. Please try again.";
      setError(message);
      setLoadingState("error");
    }
  };

  const fetchPayrollStats = async () => {
    try {
      setStatsLoadingState("loading");

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setStatsLoadingState("error");
        return;
      }

      const response = await fetch(
        `/api/payroll/batch?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to fetch payroll stats (${response.status})`
        );
      }

      const result = await response.json();
      if (result.success && result.data) {
        setPayrollStats({
          totalEmployees: result.data.totalEmployees || 0,
          draftPayslips:
            result.data.pendingCount || result.data.draftCount || 0,
          approvedPayslips:
            result.data.processedCount || result.data.approvedCount || 0,
          paidPayslips: result.data.paidCount || 0,
          totalPayroll: result.data.totalNetSalary || 0,
        });
        setStatsLoadingState("success");
      } else {
        throw new Error(result.error || "Invalid response from server");
      }
    } catch {
      setStatsLoadingState("error");
    }
  };

  const getStatus = (emp: EmployeeRow) =>
    emp.additional_docs?.status || emp.status || "active";

  const totalPayrollAmount = employees.reduce(
    (sum, emp) => sum + (Number(emp.base_salary) || 0),
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {error && loadingState === "error" ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchEmployees()}
            >
              <RefreshCw className="mr-2 size-4" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          title="Team"
          value={employees.length}
          icon={Users}
          subtitle="Total employees"
          loading={loadingState === "loading"}
        />
        <MetricCard
          title="Active"
          value={employees.filter((e) => getStatus(e) === "active").length}
          icon={CheckCircle2}
          loading={loadingState === "loading"}
        />
        <MetricCard
          title="Payroll"
          value={`Nu. ${(totalPayrollAmount / 1000).toFixed(1)}k`}
          icon={DollarSign}
          subtitle="Monthly base"
          loading={loadingState === "loading"}
        />
        <MetricCard
          title="On leave"
          value={employees.filter((e) => getStatus(e) === "on_leave").length}
          icon={Clock}
          loading={loadingState === "loading"}
        />
      </div>

      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="size-4" />
              Payroll · {months[selectedMonth - 1]} {selectedYear}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v, 10))}
              >
                <SelectTrigger className="h-8 w-[7.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, i) => (
                    <SelectItem key={m} value={(i + 1).toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v, 10))}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {statsLoadingState === "loading" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border p-3 text-center">
                  <Skeleton className="mx-auto mb-2 h-3 w-12" />
                  <Skeleton className="mx-auto h-6 w-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Draft</p>
                <p className="text-lg font-semibold">
                  {payrollStats.draftPayslips || 0}
                </p>
              </div>
              <div className="rounded-lg border border-blue-200/60 bg-blue-50/50 p-3 text-center dark:border-blue-900 dark:bg-blue-950/30">
                <p className="text-xs text-muted-foreground">Approved</p>
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {payrollStats.approvedPayslips || 0}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/50 p-3 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {payrollStats.paidPayslips || 0}
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                <p className="text-xs text-muted-foreground">Net total</p>
                <p className="text-sm font-semibold text-primary sm:text-lg">
                  Nu. {((payrollStats.totalPayroll || 0) / 1000).toFixed(1)}k
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile employee cards */}
      <div className="space-y-2 md:hidden">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-sm font-semibold">Team members</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void fetchEmployees()}
            disabled={loadingState === "loading"}
          >
            <RefreshCw
              className={`size-4 ${loadingState === "loading" ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        {loadingState === "loading" ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-none">
              <CardContent className="space-y-2 p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))
        ) : employees.length === 0 ? (
          <Card className="shadow-none">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No employees yet. Add your first team member.
            </CardContent>
          </Card>
        ) : (
          employees.map((emp) => {
            const status = getStatus(emp);
            return (
              <Card key={emp.id} className="shadow-none">
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium">
                      {emp.profiles?.full_name || emp.name || "Unknown"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {emp.designation || "—"} ·{" "}
                      {emp.additional_docs?.department ||
                        emp.department ||
                        "—"}
                    </p>
                    <p className="text-sm font-medium">
                      Nu. {Number(emp.base_salary || 0).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 capitalize ${statusBadgeClass(status)}`}
                  >
                    {status.replace("_", " ")}
                  </Badge>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden shadow-none md:block">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Team members</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void fetchEmployees()}
              disabled={loadingState === "loading"}
            >
              <RefreshCw
                className={`size-4 ${loadingState === "loading" ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Base salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingState === "loading" ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : employees.length > 0 ? (
                employees.map((emp) => {
                  const status = getStatus(emp);
                  return (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">
                        {emp.profiles?.full_name || emp.name || "Unknown"}
                      </TableCell>
                      <TableCell>{emp.designation || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {emp.additional_docs?.department ||
                          emp.department ||
                          "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        Nu. {Number(emp.base_salary || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusBadgeClass(status)}`}
                        >
                          {status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No employees yet. Add your first team member.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
