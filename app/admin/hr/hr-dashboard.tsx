"use client";

import { useEffect, useState } from "react";
import { Users, Clock, CreditCard, CheckCircle2, XCircle, RefreshCw, MoreVertical, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/utils/supabase/client";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

interface PayrollStats {
  totalEmployees?: number;
  draftPayslips?: number;
  approvedPayslips?: number;
  paidPayslips?: number;
  totalPayroll?: number;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

function MetricCard({ title, value, icon: Icon, color, subtitle, loading }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#717171] uppercase tracking-wider">{title}</span>
          <div className="w-6 h-6 rounded bg-[#F3F3F1] flex items-center justify-center">
            <Icon className={`w-3 h-3 ${color}`} />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-6 w-16 mt-1" />
        ) : (
          <p className="text-lg font-semibold mt-1">{value}</p>
        )}
        {subtitle && <p className="text-[9px] text-[#717171]">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export function HRDashboard() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollStats, setPayrollStats] = useState<PayrollStats>({});
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [statsLoadingState, setStatsLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const supabase = createClient();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchPayrollStats();
  }, [selectedMonth, selectedYear]);

  const fetchEmployees = async () => {
    try {
      console.log("[HR Dashboard] Fetching employees");
      setLoadingState('loading');
      setError(null);

      const { data, error } = await supabase
        .from('employees')
        .select('*, profiles(full_name)')
        .order('join_date', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("[HR Dashboard] Fetched", data?.length || 0, "employees");
      setEmployees(data || []);
      setLoadingState('success');
    } catch (err: any) {
      console.error("[HR Dashboard] Fetch error:", err);
      setError(err?.message || 'Failed to fetch employees. Please try again.');
      setLoadingState('error');
    }
  };

  const fetchPayrollStats = async () => {
    try {
      console.log("[HR Dashboard] Fetching payroll stats for", { month: selectedMonth, year: selectedYear });
      setStatsLoadingState('loading');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("[HR Dashboard] No session found");
        return;
      }

      const response = await fetch(`/api/payroll/batch?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch payroll stats (${response.status})`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        console.log("[HR Dashboard] Payroll stats fetched:", result.data);
        setPayrollStats({
          totalEmployees: result.data.totalEmployees || 0,
          draftPayslips: result.data.pendingCount || result.data.draftCount || 0,
          approvedPayslips: result.data.processedCount || result.data.approvedCount || 0,
          paidPayslips: result.data.paidCount || 0,
          totalPayroll: result.data.totalNetSalary || 0
        });
        setStatsLoadingState('success');
      } else {
        throw new Error(result.error || 'Invalid response from server');
      }
    } catch (err: any) {
      console.error("[HR Dashboard] Payroll stats error:", err);
      // Don't show error alert for stats, just log it
      setStatsLoadingState('error');
    }
  };

  const totalPayrollAmount = employees.reduce((sum, emp) => sum + (Number(emp.base_salary) || 0), 0);
  const isNetworkError = error?.includes('fetch') || error?.includes('network');

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && loadingState === 'error' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchEmployees} className="ml-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Team"
          value={employees.length}
          icon={Users}
          color="text-[#3ECF8E]"
          subtitle="Total employees"
          loading={loadingState === 'loading'}
        />
        <MetricCard
          title="Active"
          value={employees.filter(e => {
            const status = e.additional_docs?.status || e.status || 'active';
            return status === 'active';
          }).length}
          icon={CheckCircle2}
          color="text-green-600"
          loading={loadingState === 'loading'}
        />
        <MetricCard
          title="Payroll"
          value={`Nu. ${(totalPayrollAmount/1000).toFixed(1)}k`}
          icon={DollarSign}
          color="text-[#3ECF8E]"
          subtitle="Monthly base"
          loading={loadingState === 'loading'}
        />
        <MetricCard
          title="On Leave"
          value={employees.filter(e => {
            const status = e.additional_docs?.status || e.status;
            return status === 'on_leave';
          }).length}
          icon={Clock}
          color="text-amber-600"
          loading={loadingState === 'loading'}
        />
      </div>

      {/* Payroll Status for Period */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Payroll Status - {months[selectedMonth - 1]} {selectedYear}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                <SelectTrigger className="w-28 h-7 bg-[#F3F3F1] border-[#E5E5E1]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E1]">
                  {months.map((m, i) => (
                    <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-20 h-7 bg-[#F3F3F1] border-[#E5E5E1]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E1]">
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          {statsLoadingState === 'loading' ? (
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center p-2 bg-gray-50 rounded">
                  <Skeleton className="h-4 w-12 mx-auto mb-2" />
                  <Skeleton className="h-6 w-8 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-[#717171]">Draft</p>
                <p className="text-lg font-bold text-gray-600">{payrollStats.draftPayslips || 0}</p>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded">
                <p className="text-xs text-[#717171]">Approved</p>
                <p className="text-lg font-bold text-blue-600">{payrollStats.approvedPayslips || 0}</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <p className="text-xs text-[#717171]">Paid</p>
                <p className="text-lg font-bold text-green-600">{payrollStats.paidPayslips || 0}</p>
              </div>
              <div className="text-center p-2 bg-[#E8F5E9] rounded">
                <p className="text-xs text-[#717171]">Total Amount</p>
                <p className="text-sm font-bold text-green-600">Nu. {((payrollStats.totalPayroll || 0) / 1000).toFixed(1)}k</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchEmployees}
              disabled={loadingState === 'loading'}
            >
              <RefreshCw className={`w-4 h-4 ${loadingState === 'loading' ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E5E5E1] bg-[#F3F3F1]">
                <TableHead className="text-xs text-[#717171]">Name</TableHead>
                <TableHead className="text-xs text-[#717171]">Designation</TableHead>
                <TableHead className="text-xs text-[#717171]">Department</TableHead>
                <TableHead className="text-xs text-[#717171]">Base Salary</TableHead>
                <TableHead className="text-xs text-[#717171]">Status</TableHead>
                <TableHead className="text-xs text-[#717171]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingState === 'loading' ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-7 w-7" /></TableCell>
                  </TableRow>
                ))
              ) : employees.length > 0 ? employees.map((emp) => {
                const status = emp.additional_docs?.status || emp.status || 'active';
                return (
                  <TableRow key={emp.id} className="border-[#E5E5E1] hover:bg-[#F3F3F1]">
                    <TableCell className="text-sm font-medium">{emp.profiles?.full_name || emp.name || 'Unknown'}</TableCell>
                    <TableCell className="text-sm">{emp.designation || '-'}</TableCell>
                    <TableCell className="text-sm text-[#717171]">{emp.additional_docs?.department || emp.department || '-'}</TableCell>
                    <TableCell className="text-sm font-medium">Nu. {Number(emp.base_salary || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`${
                        status === 'active' ? 'bg-green-50 text-green-600 border-green-200' :
                        status === 'inactive' ? 'bg-red-50 text-red-600 border-red-200' :
                        status === 'on_leave' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      } text-[10px] px-2`}>
                        {status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#717171]">
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