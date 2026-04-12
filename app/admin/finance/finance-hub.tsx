"use client";

import { useEffect, useState, useRef } from "react";
import { DollarSign, TrendingUp, Receipt, Users, FileText, Calculator, Save, Plus, X, Upload, Camera, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function FinanceHub() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransaction, setShowTransaction] = useState(false);
  const [showPayroll, setShowPayroll] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [bankReconcile, setBankReconcile] = useState<any[]>([]);
  const [newTrans, setNewTrans] = useState({ type: 'income', description: '', amount: '', category: 'services' });
  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
    fetchReconciliation();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transData, empData] = await Promise.all([
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('employees').select('*').order('name')
      ]);
      setTransactions(transData.data || []);
      setEmployees(empData.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReconciliation = async () => {
    const { data } = await supabase.from('bank_reconciliation').select('*').order('date', { ascending: false }).limit(20);
    setBankReconcile(data || []);
  };

  const addTransaction = async () => {
    if (!newTrans.description || !newTrans.amount) {
      toast.error("Description and amount required");
      return;
    }
    await supabase.from('transactions').insert({
      type: newTrans.type,
      description: newTrans.description,
      amount: parseFloat(newTrans.amount),
      category: newTrans.category,
      status: 'complete'
    });
    toast.success("Transaction added");
    setShowTransaction(false);
    setNewTrans({ type: 'income', description: '', amount: '', category: 'services' });
    fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'bank' | 'receipt') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setOcrResult(data.result);
        toast.success("OCR Complete! Review and save the data.");
      } else {
        toast.error("OCR failed: " + data.error);
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveOCRTransaction = async () => {
    if (!ocrResult) return;
    
    await supabase.from('transactions').insert({
      type: ocrResult.type || 'expense',
      description: ocrResult.description || ocrResult.vendor || 'OCR Import',
      amount: parseFloat(ocrResult.amount) || 0,
      category: ocrResult.category || 'other',
      status: 'pending',
      source: 'ocr'
    });

    toast.success("Transaction saved from OCR");
    setOcrResult(null);
    setShowUpload(false);
    fetchData();
  };

  const calculatePayroll = () => {
    return employees.map(emp => {
      const baseSalary = Number(emp.baseSalary) || 0;
      const GIS = Math.round(baseSalary * 0.10);
      const PF = Math.round(baseSalary * 0.10);
      const netSalary = baseSalary - GIS - PF;
      return { ...emp, baseSalary, GIS, PF, netSalary };
    });
  };

  const payrollData = calculatePayroll();
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPayroll = payrollData.reduce((sum, e) => sum + e.baseSalary, 0);
  const totalGIS = payrollData.reduce((sum, e) => sum + e.GIS, 0);
  const totalPF = payrollData.reduce((sum, e) => sum + e.PF, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Total Income</p>
            <p className="text-lg font-semibold text-green-600">Nu. {income.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Total Expense</p>
            <p className="text-lg font-semibold text-red-500">Nu. {expense.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Net Balance</p>
            <p className="text-lg font-semibold text-[#3ECF8E]">Nu. {(income - expense).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Monthly Payroll</p>
            <p className="text-lg font-semibold">Nu. {totalPayroll.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">GIS + PF</p>
            <p className="text-lg font-semibold text-blue-600">Nu. {(totalGIS + totalPF).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setShowTransaction(true)} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white text-xs">
          <Plus className="w-3 h-3 mr-1" /> Add Transaction
        </Button>
        <Button onClick={() => setShowPayroll(true)} variant="outline" className="border-[#E5E5E1] text-xs">
          <Calculator className="w-3 h-3 mr-1" /> Process Payroll
        </Button>
        <Button onClick={() => setShowUpload(true)} variant="outline" className="border-[#E5E5E1] text-xs">
          <Upload className="w-3 h-3 mr-1" /> Bank Statement OCR
        </Button>
        <Button variant="outline" className="border-[#E5E5E1] text-xs">
          <Receipt className="w-3 h-3 mr-1" /> Receipt OCR
        </Button>
      </div>

      {/* Upload Modal with OCR */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Upload Document for OCR</h3>
              <Button variant="ghost" size="icon" onClick={() => { setShowUpload(false); setOcrResult(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {!ocrResult ? (
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-[#E5E5E1] rounded-xl p-8 text-center cursor-pointer hover:border-[#3ECF8E] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-[#717171]" />
                  <p className="text-sm font-medium">Upload Bank Statement</p>
                  <p className="text-xs text-[#717171]">PDF, PNG, JPG - AI will extract transactions</p>
                  <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={(e) => handleFileUpload(e, 'bank')} />
                </div>

                <div 
                  className="border-2 border-dashed border-[#E5E5E1] rounded-xl p-8 text-center cursor-pointer hover:border-[#3ECF8E] transition-colors"
                  onClick={() => receiptInputRef.current?.click()}
                >
                  <Receipt className="w-8 h-8 mx-auto mb-2 text-[#717171]" />
                  <p className="text-sm font-medium">Upload Receipt</p>
                  <p className="text-xs text-[#717171]">AI will extract vendor, amount, date</p>
                  <input ref={receiptInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={(e) => handleFileUpload(e, 'receipt')} />
                </div>

                {uploading && (
                  <div className="flex items-center justify-center gap-2 p-4 bg-[#F3F3F1] rounded-lg">
                    <div className="w-4 h-4 border-2 border-[#3ECF8E] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">AI is analyzing document...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">OCR Results</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-[#717171]">Date:</span> {ocrResult.date || 'N/A'}</p>
                    <p><span className="text-[#717171]">Description:</span> {ocrResult.description || ocrResult.vendor || 'N/A'}</p>
                    <p><span className="text-[#717171]">Amount:</span> Nu. {ocrResult.amount || '0'}</p>
                    <p><span className="text-[#717171]">Type:</span> {ocrResult.type || 'expense'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setOcrResult(null)}>Scan Another</Button>
                  <Button className="flex-1 bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={saveOCRTransaction}>
                    Save Transaction
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bank Reconciliation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Bank Reconciliation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="bg-[#F3F3F1]">
              <tr>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Description</th>
                <th className="text-right p-2">Bank Amount</th>
                <th className="text-right p-2">System Amount</th>
                <th className="text-center p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bankReconcile.length > 0 ? bankReconcile.map((item, i) => (
                <tr key={i} className="border-t border-[#E5E5E1]">
                  <td className="p-2">{item.date}</td>
                  <td className="p-2">{item.description}</td>
                  <td className="text-right p-2">Nu. {Number(item.bank_amount || 0).toLocaleString()}</td>
                  <td className="text-right p-2">Nu. {Number(item.system_amount || 0).toLocaleString()}</td>
                  <td className="text-center p-2">
                    {item.bank_amount === item.system_amount ? (
                      <Badge className="bg-green-50 text-green-600 text-[10px]">Matched</Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-600 text-[10px]">差异</Badge>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-8 text-center text-[#717171]">Upload bank statement to reconcile</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="bg-[#F3F3F1]">
              <tr>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Description</th>
                <th className="text-left p-2">Category</th>
                <th className="text-right p-2">Amount</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map((t, i) => (
                <tr key={i} className="border-t border-[#E5E5E1]">
                  <td className="p-2 text-[#717171]">{t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}</td>
                  <td className="p-2">{t.description}</td>
                  <td className="p-2"><Badge className="bg-[#F3F3F1] text-[10px]">{t.category}</Badge></td>
                  <td className={`text-right p-2 font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}Nu. {Number(t.amount).toLocaleString()}
                  </td>
                  <td className="p-2"><Badge className="bg-green-50 text-green-600 text-[10px]">{t.status}</Badge></td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="p-8 text-center text-[#717171]">No transactions</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      {showTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Add Transaction</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowTransaction(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              <Select value={newTrans.type} onValueChange={(v) => setNewTrans({...newTrans, type: v})}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E1]">
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Description" value={newTrans.description} onChange={(e) => setNewTrans({...newTrans, description: e.target.value})} />
              <Input type="number" placeholder="Amount (Nu.)" value={newTrans.amount} onChange={(e) => setNewTrans({...newTrans, amount: e.target.value})} />
              <Select value={newTrans.category} onValueChange={(v) => setNewTrans({...newTrans, category: v})}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E1]">
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="amc">AMC</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addTransaction} className="w-full bg-[#3ECF8E] hover:bg-[#34b27b] text-white">Add</Button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {showPayroll && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Payroll Processing - {payrollMonth}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowPayroll(false)}><X className="w-4 h-4" /></Button>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-[#F3F3F1]">
                <tr>
                  <th className="text-left p-2">Employee</th>
                  <th className="text-right p-2">Salary</th>
                  <th className="text-right p-2">GIS (10%)</th>
                  <th className="text-right p-2">PF (10%)</th>
                  <th className="text-right p-2">Net</th>
                </tr>
              </thead>
              <tbody>
                {payrollData.map((emp, i) => (
                  <tr key={i} className="border-t border-[#E5E5E1]">
                    <td className="p-2">{emp.name}</td>
                    <td className="text-right p-2">Nu. {emp.baseSalary.toLocaleString()}</td>
                    <td className="text-right p-2 text-blue-600">Nu. {emp.GIS.toLocaleString()}</td>
                    <td className="text-right p-2 text-blue-600">Nu. {emp.PF.toLocaleString()}</td>
                    <td className="text-right p-2 font-semibold">Nu. {emp.netSalary.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#F3F3F1] font-semibold">
                <tr>
                  <td className="p-2">TOTAL</td>
                  <td className="text-right p-2">Nu. {totalPayroll.toLocaleString()}</td>
                  <td className="text-right p-2">Nu. {totalGIS.toLocaleString()}</td>
                  <td className="text-right p-2">Nu. {totalPF.toLocaleString()}</td>
                  <td className="text-right p-2">Nu. {(totalPayroll - totalGIS - totalPF).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            <Button className="w-full mt-4 bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
              <FileText className="w-4 h-4 mr-2" /> Generate Payslip Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}