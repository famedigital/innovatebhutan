"use client";

import { useState, useEffect } from "react";
import {
  FileText, Plus, Search, Send, Eye, Trash2,
  Calendar, DollarSign, RefreshCw, CheckCircle, Clock,
  AlertCircle, X, CreditCard, Ban, XCircle, AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  clientName?: string;
  issueDate: string;
  dueDate: string;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
}

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  rate: number;
  amount?: number;
}

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientId: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: "", quantity: 1, rate: 0 }] as InvoiceItem[],
    notes: ""
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setLoadingState('loading');
    setError(null);

    console.log('[Invoice Page] Fetching data...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const errorMsg = "Authentication required. Please log in.";
        console.error('[Invoice Page]', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoadingState('error');
        setLoading(false);
        return;
      }

      console.log('[Invoice Page] User authenticated, fetching invoices and clients...');

      const [invoicesRes, clientsRes] = await Promise.all([
        fetch('/api/invoices', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }).then(async r => {
          const data = await r.json();
          console.log('[Invoice Page] Invoices API response:', { status: r.status, data });
          return { status: r.status, data };
        }).catch(err => {
          console.error('[Invoice Page] Invoices fetch error:', err);
          return { status: 0, data: { success: false, error: 'Network error. Please check your connection.' } };
        }),
        supabase.from('clients').select('id, name').eq('active', true)
      ]);

      if (!invoicesRes.data.success) {
        const errorMsg = invoicesRes.data.error || 'Failed to load invoices';
        console.error('[Invoice Page]', errorMsg);
        setError(errorMsg);
        toast.error(errorMsg);
        setLoadingState('error');
      } else {
        console.log('[Invoice Page] Invoices loaded successfully:', invoicesRes.data.data?.length || 0);
        const rows = (invoicesRes.data.data || []).map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber ?? inv.invoice_number ?? "",
          clientId: inv.clientId ?? inv.client_id,
          clientName: inv.clientName ?? inv.client_name,
          issueDate: inv.issueDate ?? inv.issue_date,
          dueDate: inv.dueDate ?? inv.due_date,
          total: Number(inv.total) || 0,
          status: inv.status,
          items: inv.items || [],
          notes: inv.notes,
        }));
        setInvoices(rows);
        setLoadingState('success');
      }

      setClients(clientsRes.data || []);
      console.log('[Invoice Page] Clients loaded:', clientsRes.data?.length || 0);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to load invoices. Please try again.';
      console.error('[Invoice Page] Unexpected error:', err);
      setError(errorMsg);
      toast.error(errorMsg);
      setLoadingState('error');
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

    setIsSubmitting(true);

    console.log('[Invoice Page] Creating invoice:', { clientId: newInvoice.clientId, itemCount: validItems.length });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          clientId: parseInt(newInvoice.clientId),
          issueDate: newInvoice.issueDate,
          dueDate: newInvoice.dueDate,
          items: validItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate
          })),
          notes: newInvoice.notes || undefined
        })
      });

      const result = await response.json();

      console.log('[Invoice Page] Create invoice response:', { status: response.status, result });

      if (result.success) {
        toast.success("Invoice created!");
        setShowCreate(false);
        setNewInvoice({
          clientId: "",
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [{ description: "", quantity: 1, rate: 0 }],
          notes: ""
        });
        fetchData();
      } else {
        console.error('[Invoice Page] Create invoice failed:', result.error);
        toast.error(result.error || "Failed to create invoice");
      }
    } catch (err: any) {
      console.error('[Invoice Page] Create invoice error:', err);
      toast.error("Failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: number, status: InvoiceStatus) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));

    console.log('[Invoice Page] Updating invoice status:', { id, status });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required");
        setActionLoading(prev => ({ ...prev, [id]: false }));
        return;
      }

      const response = await fetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status })
      });

      const result = await response.json();

      console.log('[Invoice Page] Update status response:', { status: response.status, result });

      if (result.success) {
        toast.success(`Invoice marked as ${status}`);
        fetchData();
      } else {
        console.error('[Invoice Page] Update status failed:', result.error);
        toast.error(result.error || "Failed to update status");
      }
    } catch (err: any) {
      console.error('[Invoice Page] Update status error:', err);
      toast.error("Failed: " + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const deleteInvoice = async (id: number) => {
    if (!confirm("Delete this invoice? This action cannot be undone.")) return;

    setActionLoading(prev => ({ ...prev, [id]: true }));

    console.log('[Invoice Page] Deleting invoice:', id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication required");
        setActionLoading(prev => ({ ...prev, [id]: false }));
        return;
      }

      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      const result = await response.json();

      console.log('[Invoice Page] Delete invoice response:', { status: response.status, result });

      if (result.success) {
        toast.success("Invoice deleted");
        fetchData();
      } else {
        console.error('[Invoice Page] Delete invoice failed:', result.error);
        toast.error(result.error || "Failed to delete invoice");
      }
    } catch (err: any) {
      console.error('[Invoice Page] Delete invoice error:', err);
      toast.error("Failed: " + err.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getDaysUntilDue = (dueDate: string, status: InvoiceStatus): number | null => {
    if (status === 'paid' || status === 'cancelled' || status === 'draft') {
      return null;
    }
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  const openDetailModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetail(true);
  };

  const filteredInvoices = invoices.filter(inv => {
    const number = (inv.invoiceNumber || "").toLowerCase();
    const client = (inv.clientName || "").toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || number.includes(q) || client.includes(q);
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'overdue': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'sent': return <Send className="w-3.5 h-3.5" />;
      case 'cancelled': return <XCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  // Stats
  const totalPending = invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  if (error && loadingState === 'error') {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Load Invoices</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchData} className="bg-primary hover:bg-[#34b27b] text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Invoices"
        description="Manage client invoices and payments"
        actions={
          <Button onClick={() => setShowCreate(true)} disabled={clients.length === 0}>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        }
      />

      {clients.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            No active clients found. Please create a client first before creating invoices.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Total Invoices</p>
            <p className="text-xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Pending</p>
            <p className="text-xl font-bold text-blue-600">Nu. {totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Overdue</p>
            <p className="text-xl font-bold text-red-600">Nu. {totalOverdue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Collected</p>
            <p className="text-xl font-bold text-green-600">Nu. {totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-9 bg-muted border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-muted border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-border">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Invoice #</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Client</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Issue Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Due Date</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-3">Amount</th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">Status</th>
                <th className="text-center text-xs font-medium text-muted-foreground p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#A3A3A3]" />
                    <p>No invoices found</p>
                  </td>
                </tr>
              ) : filteredInvoices.map((inv) => {
                const daysUntilDue = getDaysUntilDue(inv.dueDate, inv.status);
                return (
                  <tr key={inv.id} className="border-b border-border hover:bg-muted">
                    <td className="p-3 text-sm font-medium">{inv.invoiceNumber}</td>
                    <td className="p-3 text-sm">{inv.clientName || 'Unknown Client'}</td>
                    <td className="p-3 text-sm text-muted-foreground">{new Date(inv.issueDate).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-1">
                        <span className={daysUntilDue !== null && daysUntilDue < 0 ? "text-red-600" : "text-muted-foreground"}>
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                        {daysUntilDue !== null && daysUntilDue < 0 && (
                          <Badge className="bg-red-100 text-red-700 text-[9px] px-1">Overdue</Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm font-medium text-right">Nu. {Number(inv.total || 0).toLocaleString()}</td>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDetailModal(inv)}
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {inv.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(inv.id, 'sent')}
                            disabled={actionLoading[inv.id]}
                            title="Send invoice"
                          >
                            {actionLoading[inv.id] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          </Button>
                        )}
                        {(inv.status === 'sent' || inv.status === 'overdue') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(inv.id, 'paid')}
                            disabled={actionLoading[inv.id]}
                            title="Mark as paid"
                          >
                            {actionLoading[inv.id] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                          </Button>
                        )}
                        {(inv.status === 'draft' || inv.status === 'sent') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(inv.id, 'cancelled')}
                            disabled={actionLoading[inv.id]}
                            title="Cancel invoice"
                          >
                            {actionLoading[inv.id] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5 text-red-500" />}
                          </Button>
                        )}
                        {inv.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteInvoice(inv.id)}
                            disabled={actionLoading[inv.id]}
                            title="Delete invoice"
                          >
                            {actionLoading[inv.id] ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-red-500" />}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Create Invoice Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-white border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>Create a new invoice for a client</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Client & Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Client *</label>
                <Select value={newInvoice.clientId} onValueChange={(v) => setNewInvoice({ ...newInvoice, clientId: v })}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border">
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Issue Date</label>
                <Input
                  type="date"
                  value={newInvoice.issueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, issueDate: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                <Input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  className="bg-muted border-border"
                />
              </div>
            </div>

            {/* Invoice Items */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Invoice Items</label>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
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
                      <tr key={index} className="border-t border-border">
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
              <Button variant="outline" size="sm" onClick={addItem} className="border-border">
                <Plus className="w-3 h-3 mr-1" /> Add Item
              </Button>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Notes</label>
              <Input
                placeholder="Payment terms, bank details, etc."
                value={newInvoice.notes}
                onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                className="bg-muted border-border"
              />
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-primary">
                  Nu. {newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)} disabled={isSubmitting}>Cancel</Button>
            <Button
              className="bg-primary hover:bg-[#34b27b] text-white"
              onClick={createInvoice}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-white border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedInvoice.invoiceNumber}</DialogTitle>
                <DialogDescription>
                  {selectedInvoice.clientName} • {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p className="text-sm font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="text-sm font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Line Items</p>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2">Description</th>
                          <th className="text-center p-2 w-16">Qty</th>
                          <th className="text-right p-2 w-20">Rate</th>
                          <th className="text-right p-2 w-20">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedInvoice.items || []).map((item, index) => (
                          <tr key={index} className="border-t border-border">
                            <td className="p-2">{item.description}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">Nu. {item.rate?.toLocaleString() || 0}</td>
                            <td className="p-2 text-right font-medium">
                              Nu. {((item.quantity || 0) * (item.rate || 0)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted">
                        <tr>
                          <td colSpan={3} className="p-2 text-right font-medium">Total</td>
                          <td className="p-2 text-right font-bold text-primary">
                            Nu. {Number(selectedInvoice.total || 0).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="text-sm">{selectedInvoice.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <Badge className={`${getStatusColor(selectedInvoice.status)} px-3 py-1`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedInvoice.status)}
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </Badge>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetail(false)}>Close</Button>
                {selectedInvoice.status === 'draft' && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      updateStatus(selectedInvoice.id, 'sent');
                      setShowDetail(false);
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Invoice
                  </Button>
                )}
                {(selectedInvoice.status === 'sent' || selectedInvoice.status === 'overdue') && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      updateStatus(selectedInvoice.id, 'paid');
                      setShowDetail(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}