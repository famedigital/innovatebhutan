"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw, Eye, CheckCircle, DollarSign, Calendar,
  Filter, Download, FileText, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Payslip {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeDesignation?: string;
  month: number;
  year: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'paid' | 'cancelled';
  basicSalary?: number;
  grossSalary?: number;
  allowances?: Record<string, number>;
  bonuses?: number;
  pfEmployee?: number;
  pfEmployer?: number;
  gisDeduction?: number;
  taxableIncome?: number;
  pitDeduction?: number;
  additionalDeductions?: Record<string, number>;
  paymentDate?: string;
  paymentMethod?: string;
  createdAt: string;
}

interface PayslipListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: number;
  employeeName?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function PayslipListModal({ open, onOpenChange, employeeId, employeeName }: PayslipListModalProps) {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const supabase = createClient();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (open) {
      fetchPayslips();
    }
  }, [open, employeeId]);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', employeeId.toString());

      const response = await fetch(`/api/payroll/generate?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const result = await response.json();

      if (result.success) {
        setPayslips(result.data || []);
      } else {
        toast.error(result.error || "Failed to load payslips");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  const approvePayslip = async (payslipId: number) => {
    setActionLoading(prev => ({ ...prev, [payslipId]: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`/api/payroll/${payslipId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          payslipId,
          approverId: session.user.id
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Payslip approved");
        fetchPayslips();
        if (showDetail) setShowDetail(false);
      } else {
        toast.error(result.error || "Failed to approve payslip");
      }
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [payslipId]: false }));
    }
  };

  const markAsPaid = async (payslipId: number) => {
    setActionLoading(prev => ({ ...prev, [payslipId]: true }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch(`/api/payroll/${payslipId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          payslipId,
          paymentMethod: 'bank',
          paymentDate: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Payslip marked as paid");
        fetchPayslips();
        if (showDetail) setShowDetail(false);
      } else {
        toast.error(result.error || "Failed to mark as paid");
      }
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [payslipId]: false }));
    }
  };

  const openDetailModal = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    setShowDetail(true);
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredPayslips = payslips.filter(p => {
    const matchesMonth = monthFilter === "all" || p.month === parseInt(monthFilter);
    const matchesYear = yearFilter === "all" || p.year === parseInt(yearFilter);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesMonth && matchesYear && matchesStatus;
  });

  const totalNetSalary = filteredPayslips.reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white border-[#E5E5E1] max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {employeeName ? `Payslips - ${employeeName}` : "All Payslips"}
            </DialogTitle>
            <DialogDescription>View and manage payroll records</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-auto">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-32 bg-[#F3F3F1] border-[#E5E5E1]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E1]">
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-28 bg-[#F3F3F1] border-[#E5E5E1]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E1]">
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map(y => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-[#F3F3F1] border-[#E5E5E1]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E1]">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={fetchPayslips}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3">
                  <p className="text-[10px] text-[#717171] uppercase">Total Records</p>
                  <p className="text-xl font-bold">{filteredPayslips.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-[10px] text-[#717171] uppercase">Net Salary</p>
                  <p className="text-xl font-bold text-green-600">Nu. {totalNetSalary.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3">
                  <p className="text-[10px] text-[#717171] uppercase">Pending</p>
                  <p className="text-xl font-bold text-amber-600">
                    {filteredPayslips.filter(p => p.status === 'draft' || p.status === 'approved').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payslips Table */}
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
                  </div>
                ) : filteredPayslips.length === 0 ? (
                  <div className="text-center py-12 text-[#717171]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#A3A3A3]" />
                    <p>No payslips found</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-[#F3F3F1] border-b border-[#E5E5E1]">
                      <tr>
                        <th className="text-left text-xs font-medium text-[#717171] p-3">Employee</th>
                        <th className="text-left text-xs font-medium text-[#717171] p-3">Period</th>
                        <th className="text-right text-xs font-medium text-[#717171] p-3">Net Salary</th>
                        <th className="text-center text-xs font-medium text-[#717171] p-3">Status</th>
                        <th className="text-center text-xs font-medium text-[#717171] p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayslips.map((payslip) => (
                        <>
                          <tr key={payslip.id} className="border-b border-[#E5E5E1] hover:bg-[#F3F3F1]">
                            <td className="p-3">
                              <div>
                                <p className="text-sm font-medium">{payslip.employeeName || 'Unknown'}</p>
                                <p className="text-xs text-[#717171]">{payslip.employeeDesignation || ''}</p>
                              </div>
                            </td>
                            <td className="p-3 text-sm">
                              {MONTHS[(payslip.month || 1) - 1]} {payslip.year}
                            </td>
                            <td className="p-3 text-sm font-medium text-right">
                              Nu. {Number(payslip.netSalary || 0).toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <Badge className={`${getStatusColor(payslip.status)} text-[10px]`}>
                                {payslip.status}
                              </Badge>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => toggleRow(payslip.id)}
                                >
                                  {expandedRows[payslip.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openDetailModal(payslip)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {payslip.status === 'draft' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => approvePayslip(payslip.id)}
                                    disabled={actionLoading[payslip.id]}
                                  >
                                    {actionLoading[payslip.id] ? (
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="w-4 h-4 text-blue-600" />
                                    )}
                                  </Button>
                                )}
                                {payslip.status === 'approved' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsPaid(payslip.id)}
                                    disabled={actionLoading[payslip.id]}
                                  >
                                    {actionLoading[payslip.id] ? (
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <DollarSign className="w-4 h-4 text-green-600" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {expandedRows[payslip.id] && (
                            <tr className="bg-[#F8F8F6]">
                              <td colSpan={5} className="p-4">
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-[10px] text-[#717171] uppercase">Basic Salary</p>
                                    <p className="font-medium">Nu. {Number(payslip.basicSalary || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[#717171] uppercase">Gross Salary</p>
                                    <p className="font-medium">Nu. {Number(payslip.grossSalary || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[#717171] uppercase">PF Deduction</p>
                                    <p className="font-medium">Nu. {Number(payslip.pfEmployee || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-[#717171] uppercase">PIT Deduction</p>
                                    <p className="font-medium">Nu. {Number(payslip.pitDeduction || 0).toLocaleString()}</p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payslip Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-white border-[#E5E5E1] max-w-lg">
          {selectedPayslip && (
            <>
              <DialogHeader>
                <DialogTitle>Payslip Details</DialogTitle>
                <DialogDescription>
                  {selectedPayslip.employeeName} • {MONTHS[(selectedPayslip.month || 1) - 1]} {selectedPayslip.year}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Earnings */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#717171] uppercase">Earnings</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Basic Salary</span>
                      <span className="font-medium">Nu. {Number(selectedPayslip.basicSalary || 0).toLocaleString()}</span>
                    </div>
                    {selectedPayslip.allowances && Object.entries(selectedPayslip.allowances).some(([_, v]) => v > 0) && (
                      <>
                        <p className="text-xs text-[#717171]">Allowances:</p>
                        {(Object.entries(selectedPayslip.allowances) as [string, number][]).map(([key, value]) => (
                          value > 0 && (
                            <div key={key} className="flex justify-between text-sm pl-4">
                              <span className="capitalize">{key}</span>
                              <span>Nu. {value.toLocaleString()}</span>
                            </div>
                          )
                        ))}
                      </>
                    )}
                    {(selectedPayslip.bonuses || 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Bonuses</span>
                        <span>Nu. {Number(selectedPayslip.bonuses || 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-medium pt-1 border-t">
                      <span>Gross Salary</span>
                      <span className="text-green-600">Nu. {Number(selectedPayslip.grossSalary || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#717171] uppercase">Deductions</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>PF (Employee 5%)</span>
                      <span>Nu. {Number(selectedPayslip.pfEmployee || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GIS</span>
                      <span>Nu. {Number(selectedPayslip.gisDeduction || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PIT</span>
                      <span>Nu. {Number(selectedPayslip.pitDeduction || 0).toLocaleString()}</span>
                    </div>
                    {selectedPayslip.additionalDeductions && Object.entries(selectedPayslip.additionalDeductions).some(([_, v]) => v > 0) && (
                      <>
                        <p className="text-xs text-[#717171]">Other Deductions:</p>
                        {(Object.entries(selectedPayslip.additionalDeductions) as [string, number][]).map(([key, value]) => (
                          value > 0 && (
                            <div key={key} className="flex justify-between text-sm pl-4">
                              <span className="capitalize">{key}</span>
                              <span>Nu. {value.toLocaleString()}</span>
                            </div>
                          )
                        ))}
                      </>
                    )}
                    <div className="flex justify-between text-sm font-medium pt-1 border-t">
                      <span>Total Deductions</span>
                      <span className="text-red-600">
                        Nu. {(
                          (Number(selectedPayslip.pfEmployee || 0) +
                          Number(selectedPayslip.gisDeduction || 0) +
                          Number(selectedPayslip.pitDeduction || 0))
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Salary */}
                <div className="bg-[#F3F3F1] p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">Net Salary</span>
                    <span className="text-lg font-bold text-[#3ECF8E]">
                      Nu. {Number(selectedPayslip.netSalary || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <Badge className={`${getStatusColor(selectedPayslip.status)} px-3 py-1`}>
                    {selectedPayslip.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
                {selectedPayslip.status === 'draft' && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      approvePayslip(selectedPayslip.id);
                      setShowDetail(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
                {selectedPayslip.status === 'approved' && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      markAsPaid(selectedPayslip.id);
                      setShowDetail(false);
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
