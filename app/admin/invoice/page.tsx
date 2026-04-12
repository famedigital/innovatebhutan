"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Plus, Search, Download, Send, Eye, Trash2, 
  Calendar, DollarSign, User, RefreshCw, CheckCircle, Clock, 
  AlertCircle, X, Printer, CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  client_name?: string;
  issue_date: string;
  due_date: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
}

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientId: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: "", quantity: 1, rate: 0 }] as InvoiceItem[]
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, clientsRes] = await Promise.all([
        supabase.from('invoices').select('*, clients(name)').order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name').eq('active', true)
      ]);

      const invoicesWithClient = (invoicesRes.data || []).map((inv: any) => ({
        ...inv,
        client_name: inv.clients?.name
      }));

      setInvoices(invoicesWithClient);
      setClients(clientsRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async () => {
    if (!newInvoice.clientId) {
      toast.error("Select a client");
      return;
    }

    const validItems = newInvoice.items.filter(i => i.description && i.rate > 0);
    if (validItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    const total = validItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const invoiceNumber = `INV-${Date.now().toString().slice(6)}`;

    try {
      const { data, error } = await supabase.from('invoices').insert({
        invoice_number: invoiceNumber,
        client_id: parseInt(newInvoice.clientId),
        issue_date: newInvoice.issueDate,
        due_date: newInvoice.dueDate,
        total,
        status: 'draft',
        items: validItems
      }).select().single();

      if (error) throw error;

      toast.success("Invoice created!");
      setShowCreate(false);
      setNewInvoice({
        clientId: "",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{ description: "", quantity: 1, rate: 0 }]
      });
      fetchData();
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
    if (!error) {
      toast.success("Status updated");
      fetchData();
    }
  };

  const deleteInvoice = async (id: number) => {
    if (!confirm("Delete this invoice?")) return;
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (!error) {
      toast.success("Deleted");
      fetchData();
    }
  };

  const addItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: "", quantity: 1, rate: 0 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...newInvoice.items];
    (items[index] as any)[field] = value;
    if (field === 'quantity' || field === 'rate') {
      items[index].amount = items[index].quantity * items[index].rate;
    }
    setNewInvoice({ ...newInvoice, items });
  };

  const removeItem = (index: number) => {
    if (newInvoice.items.length > 1) {
      setNewInvoice({
        ...newInvoice,
        items: newInvoice.items.filter((_, i) => i !== index)
      });
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Stats
  const totalPending = invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);

  if (loading) {
    return <div className="p-6 flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" /></div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Invoices</h1>
          <p className="text-sm text-[#717171]">Manage client invoices and payments</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Total Invoices</p>
            <p className="text-xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Pending</p>
            <p className="text-xl font-bold text-blue-600">Nu. {totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Overdue</p>
            <p className="text-xl font-bold text-red-600">Nu. {totalOverdue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Paid This Month</p>
            <p className="text-xl font-bold text-green-600">Nu. {totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
          <Input 
            placeholder="Search invoices..." 
            className="pl-9 bg-[#F3F3F1] border-[#E5E5E1]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-[#F3F3F1] border-[#E5E5E1]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E5E5E1]">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-[#F3F3F1] border-b border-[#E5E5E1]">
              <tr>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Invoice #</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Client</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Issue Date</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Due Date</th>
                <th className="text-right text-xs font-medium text-[#717171] p-3">Amount</th>
                <th className="text-center text-xs font-medium text-[#717171] p-3">Status</th>
                <th className="text-center text-xs font-medium text-[#717171] p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#717171]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#A3A3A3]" />
                    <p>No invoices found</p>
                  </td>
                </tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-[#E5E5E1] hover:bg-[#F3F3F1]">
                  <td className="p-3 text-sm font-medium">{inv.invoice_number}</td>
                  <td className="p-3 text-sm">{inv.client_name || 'Unknown Client'}</td>
                  <td className="p-3 text-sm text-[#717171]">{new Date(inv.issue_date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm text-[#717171]">{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-medium text-right">Nu. {inv.total.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <Badge className={`${getStatusColor(inv.status)} text-[10px]`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(inv.status)}
                        {inv.status}
                      </span>
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(inv.id, 'sent')}>
                        <Send className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(inv.id, 'paid')}>
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteInvoice(inv.id)}>
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Invoice Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-semibold">Create New Invoice</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>×</Button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Client & Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Client *</label>
                  <Select value={newInvoice.clientId} onValueChange={(v) => setNewInvoice({...newInvoice, clientId: v})}>
                    <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E1]">
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Issue Date</label>
                  <Input 
                    type="date" 
                    value={newInvoice.issueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, issueDate: e.target.value})}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Due Date</label>
                  <Input 
                    type="date" 
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Invoice Items</label>
                <div className="border border-[#E5E5E1] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F3F3F1]">
                      <tr>
                        <th className="text-left p-2">Description</th>
                        <th className="text-center p-2 w-20">Qty</th>
                        <th className="text-right p-2 w-28">Rate</th>
                        <th className="text-right p-2 w-28">Amount</th>
                        <th className="p-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {newInvoice.items.map((item, index) => (
                        <tr key={index} className="border-t border-[#E5E5E1]">
                          <td className="p-2">
                            <Input 
                              placeholder="Service description"
                              value={item.description}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              className="border-0 bg-transparent"
                            />
                          </td>
                          <td className="p-2">
                            <Input 
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="border-0 bg-transparent text-center"
                            />
                          </td>
                          <td className="p-2">
                            <Input 
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                              className="border-0 bg-transparent text-right"
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            Nu. {(item.quantity * item.rate).toLocaleString()}
                          </td>
                          <td className="p-2">
                            <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" size="sm" onClick={addItem} className="border-[#E5E5E1]">
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </div>

              {/* Total */}
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-[#717171]">Total Amount</p>
                  <p className="text-2xl font-bold text-[#3ECF8E]">
                    Nu. {newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5E1] flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={createInvoice}>
                <FileText className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}