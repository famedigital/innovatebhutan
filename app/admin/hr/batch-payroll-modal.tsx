"use client";

import { useEffect, useState } from "react";
import {
  Users, Calendar, CheckCircle2, AlertCircle, RefreshCw,
  Download, FileText, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  designation?: string;
  department?: string;
  baseSalary?: number;
}

interface BatchResult {
  successful: Array<{
    employeeId: number;
    employeeName?: string;
    month: number;
    year: number;
    netSalary: number;
  }>;
  failed: Array<{ employeeId: number; error: string }>;
  skipped: Array<{ employeeId: number; reason: string }>;
  summary: {
    totalRequested: number;
    totalGenerated: number;
    totalNetSalary: number;
  };
}

interface BatchPayrollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function BatchPayrollModal({ open, onOpenChange, onComplete }: BatchPayrollModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [step, setStep] = useState<'configure' | 'confirm' | 'processing' | 'result'>('configure');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchResult | null>(null);

  const supabase = createClient();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (open) {
      fetchEmployees();
      setStep('configure');
      setResult(null);
      setSelectedEmployees([]);
    }
  }, [open]);

  const fetchEmployees = async () => {
    try {
      const { data } = await supabase
        .from('employees')
        .select('id, profiles(full_name), designation, department, base_salary')
        .eq('status', 'active')
        .order('profiles(full_name)', { ascending: true });

      const mappedEmployees = (data || []).map((e: any) => ({
        id: e.id,
        name: e.profiles?.full_name || 'Unknown',
        designation: e.designation,
        department: e.department,
        baseSalary: e.base_salary
      }));

      setEmployees(mappedEmployees);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load employees");
    }
  };

  const toggleEmployee = (id: number) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedEmployees(employees.map(e => e.id));
  };

  const clearAll = () => {
    setSelectedEmployees([]);
  };

  const handleGenerate = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("Select at least one employee");
      return;
    }

    setStep('processing');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required");
        setStep('configure');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/payroll/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          month,
          year,
          employeeIds: selectedEmployees,
          generateForAll: false
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setStep('result');
        toast.success(`Generated ${data.data.summary.totalGenerated} payslips`);
        onComplete?.();
      } else {
        toast.error(data.error || "Failed to generate payroll");
        setStep('configure');
      }
    } catch (err: any) {
      console.error("Batch error:", err);
      toast.error("Failed to generate batch payroll");
      setStep('configure');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    onOpenChange(false);
    setStep('configure');
    setResult(null);
    setSelectedEmployees([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-[#E5E5E1] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Batch Payroll Generation
          </DialogTitle>
          <DialogDescription>
            Generate payslips for multiple employees at once
          </DialogDescription>
        </DialogHeader>

        {step === 'configure' && (
          <div className="space-y-4 flex-1 overflow-auto">
            {/* Period Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Month *</label>
                <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                    {MONTHS.map((m, i) => (
                      <SelectItem key={m} value={(i + 1).toString()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Year *</label>
                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
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

            {/* Employee Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#717171]">
                  Select Employees ({selectedEmployees.length} selected)
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="border border-[#E5E5E1] rounded-lg max-h-64 overflow-auto">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => toggleEmployee(emp.id)}
                    className={`p-3 border-b border-[#E5E5E1] last:border-0 cursor-pointer hover:bg-[#F3F3F1] transition-colors ${
                      selectedEmployees.includes(emp.id) ? 'bg-[#E8F5E9]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-[#717171]">{emp.designation} {emp.department ? `• ${emp.department}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#717171]">
                          Nu. {Number(emp.baseSalary || 0).toLocaleString()}
                        </span>
                        {selectedEmployees.includes(emp.id) && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {selectedEmployees.length > 0 && (
              <Card className="bg-[#F3F3F1] border-[#E5E5E1]">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Generating payslips for</span>
                    <span className="font-bold">{selectedEmployees.length} employees</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span>Period</span>
                    <span className="font-medium">{MONTHS[month - 1]} {year}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin text-[#3ECF8E] mb-4" />
            <p className="text-lg font-medium">Generating Payslips</p>
            <p className="text-sm text-[#717171]">Processing {selectedEmployees.length} employees...</p>
          </div>
        )}

        {step === 'result' && result && (
          <div className="space-y-4 flex-1 overflow-auto">
            <Card className="bg-[#E8F5E9] border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium">Batch Generation Complete</p>
                    <p className="text-sm text-[#717171]">
                      {result.summary.totalGenerated} of {result.summary.totalRequested} payslips generated
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3 text-center">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-[#717171]">Successful</p>
                  <p className="text-lg font-bold">{result.successful.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <AlertCircle className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                  <p className="text-xs text-[#717171]">Skipped</p>
                  <p className="text-lg font-bold">{result.skipped.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <FileText className="w-5 h-5 mx-auto mb-1 text-red-600" />
                  <p className="text-xs text-[#717171]">Failed</p>
                  <p className="text-lg font-bold">{result.failed.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Total */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#717171]">Total Net Salary</span>
                  <span className="text-xl font-bold text-[#3ECF8E]">
                    Nu. {result.summary.totalNetSalary.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Errors */}
            {(result.failed.length > 0 || result.skipped.length > 0) && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#717171] uppercase">Issues</p>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {result.failed.map((f, i) => (
                    <div key={i} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Employee #{f.employeeId}: {f.error}
                    </div>
                  ))}
                  {result.skipped.map((s, i) => (
                    <div key={i} className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      Employee #{s.employeeId}: {s.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Successful List */}
            {result.successful.length > 0 && (
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer p-2 hover:bg-[#F3F3F1] rounded">
                  <span className="text-sm font-medium">View Generated Payslips</span>
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-2 space-y-1 max-h-32 overflow-auto">
                  {result.successful.map((s, i) => (
                    <div key={i} className="text-sm p-2 bg-[#F3F3F1] rounded flex justify-between">
                      <span>{s.employeeName || `Employee #${s.employeeId}`}</span>
                      <span className="font-medium">Nu. {s.netSalary.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'configure' && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
                onClick={() => setStep('confirm')}
                disabled={selectedEmployees.length === 0}
              >
                Continue
              </Button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('configure')}>Back</Button>
              <Button
                className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
                onClick={handleGenerate}
              >
                Generate Payslips
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={resetAndClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
