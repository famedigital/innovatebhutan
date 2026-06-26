"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Plus, Search, Calendar, DollarSign, User, RefreshCw,
  AlertCircle, CheckCircle, Clock, X, Trash2, Eye, RotateCcw, BarChart3, Wifi, UserPlus, Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { BulkImportModal } from "./bulk-import-modal";

interface AMC {
  id: number;
  publicId: string;
  clientId: number;
  clientName?: string;
  clientLogo?: string;
  clientWhatsapp?: string;
  clientWhatsappGroupLink?: string;
  clientMeta?: {
    yearsWithUs?: number;
    totalPaid?: number;
  };
  serviceId?: number;
  serviceName?: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  amount?: string;
  status: 'active' | 'expired' | 'expiring' | 'cancelled';
  servicesIncluded?: string[];
  notes?: string;
  invoices?: Array<{
    id: number;
    invoiceNumber: string;
    total: string;
    status: string;
    dueDate: string;
  }>;
  tickets?: Array<{
    id: number;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  }>;
}

interface Client {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  category: string;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function AMCPage() {
  const [amcs, setAMCs] = useState<AMC[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [showClientCreate, setShowClientCreate] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [creatingClient, setCreatingClient] = useState(false);
  const [selectedAMC, setSelectedAMC] = useState<AMC | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAMC, setNewAMC] = useState({
    clientId: "",
    serviceId: "",
    contractNumber: `AMC-${Date.now().toString().slice(6)}`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: "",
    notes: ""
  });
  const [renewalData, setRenewalData] = useState({
    startDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: "",
    copyHardwareDetails: true,
    copyServicesIncluded: true,
    notes: ""
  });

  const fetchData = useCallback(async () => {
    setLoadingState('loading');
    setError(null);
    try {
      console.log('[AMC Page] Fetching data...');

      // Fetch AMCs with filters
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      params.append("limit", "100");

      const [amcsRes, clientsRes, servicesRes] = await Promise.all([
        fetch(`/api/amc?${params}`),
        fetch("/api/clients"),
        fetch("/api/services")
      ]);

      // Check AMCs response
      if (!amcsRes.ok) {
        const errorData = await amcsRes.json().catch(() => ({}));
        console.error('[AMC Page] AMCs API error:', amcsRes.status, errorData);
        throw new Error(errorData.error || `Failed to load AMCs (${amcsRes.status})`);
      }

      // Check clients response
      if (!clientsRes.ok) {
        const errorData = await clientsRes.json().catch(() => ({}));
        console.warn('[AMC Page] Clients API error:', clientsRes.status, errorData);
        setClients([]);
      }

      // Check services response
      if (!servicesRes.ok) {
        const errorData = await servicesRes.json().catch(() => ({}));
        console.warn('[AMC Page] Services API error:', servicesRes.status, errorData);
        setServices([]);
      }

      const amcsData = await amcsRes.json();
      const clientsData = clientsRes.ok ? await clientsRes.json() : { success: true, data: [] };
      const servicesData = servicesRes.ok ? await servicesRes.json() : { success: true, data: [] };

      console.log('[AMC Page] Data loaded:', {
        amcs: amcsData.data?.length || 0,
        clients: clientsData.data?.length || 0,
        services: servicesData.data?.length || 0
      });

      // Debug: Log first AMC to see the data structure
      if (amcsData.data && amcsData.data.length > 0) {
        console.log('[AMC Page] First AMC data:', amcsData.data[0]);
        console.log('[AMC Page] Client fields:', {
          clientName: amcsData.data[0].clientName,
          clientId: amcsData.data[0].clientId,
          clientWhatsapp: amcsData.data[0].clientWhatsapp,
          clientWhatsappGroupLink: amcsData.data[0].clientWhatsappGroupLink,
          clientMeta: amcsData.data[0].clientMeta
        });
      }

      if (amcsData.success) {
        setAMCs(amcsData.data || []);
        setLoadingState('success');
      } else {
        throw new Error(amcsData.error || 'Failed to load AMCs');
      }

      if (clientsData.success && clientsData.data) {
        setClients(clientsData.data);
      }

      if (servicesData.success && servicesData.data) {
        setServices(servicesData.data);
      }
    } catch (err: any) {
      console.error('[AMC Page] Fetch error:', err);
      setError(err.message || 'Failed to load data');
      setLoadingState('error');
      toast.error(err.message || 'Failed to load data');
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createAMC = async () => {
    const clientIdNum = parseInt(newAMC.clientId);
    const amountNum = parseFloat(newAMC.amount);

    if (!newAMC.clientId || isNaN(clientIdNum)) {
      toast.error("Please select a client");
      return;
    }

    if (!newAMC.amount || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid contract amount");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[AMC Page] Creating AMC...');

      const response = await fetch("/api/amc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientIdNum,
          serviceId: newAMC.serviceId ? parseInt(newAMC.serviceId) : undefined,
          contractNumber: newAMC.contractNumber,
          startDate: newAMC.startDate,
          endDate: newAMC.endDate,
          amount: amountNum.toString(),
          notes: newAMC.notes,
          servicesIncluded: ["Technical Support", "System Maintenance", "Remote Assistance"]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[AMC Page] Create AMC error:', response.status, data);
        throw new Error(data.error || `Failed to create AMC (${response.status})`);
      }

      if (data.success) {
        toast.success("AMC Contract created!");
        setShowCreate(false);
        resetForm();
        fetchData();
      } else {
        throw new Error(data.error || "Failed to create AMC");
      }
    } catch (err: any) {
      console.error('[AMC Page] Create AMC error:', err);
      toast.error(err.message || "Failed to create AMC");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRenewModal = (amc: AMC) => {
    setSelectedAMC(amc);
    const oldEndDate = new Date(amc.endDate);
    const newStartDate = new Date(oldEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    const newEndDate = new Date(newStartDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);

    setRenewalData({
      startDate: newStartDate.toISOString().split('T')[0],
      endDate: newEndDate.toISOString().split('T')[0],
      amount: amc.amount || "",
      copyHardwareDetails: true,
      copyServicesIncluded: true,
      notes: `Renewal of contract ${amc.contractNumber}`
    });
    setShowRenew(true);
  };

  const renewAMC = async () => {
    if (!selectedAMC) return;

    setIsSubmitting(true);
    try {
      console.log('[AMC Page] Renewing AMC:', selectedAMC.id);

      const response = await fetch(`/api/amc/${selectedAMC.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(renewalData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[AMC Page] Renew AMC error:', response.status, data);
        throw new Error(data.error || `Failed to renew AMC (${response.status})`);
      }

      if (data.success) {
        toast.success("AMC renewed successfully!");
        setShowRenew(false);
        setSelectedAMC(null);
        fetchData();
      } else {
        throw new Error(data.error || "Failed to renew AMC");
      }
    } catch (err: any) {
      console.error('[AMC Page] Renew AMC error:', err);
      toast.error(err.message || "Failed to renew AMC");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAMC = async (id: number) => {
    if (!confirm("Delete this AMC contract?")) return;

    setIsSubmitting(true);
    try {
      console.log('[AMC Page] Deleting AMC:', id);

      const response = await fetch(`/api/amc/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        console.error('[AMC Page] Delete AMC error:', response.status, data);
        throw new Error(data.error || `Failed to delete AMC (${response.status})`);
      }

      if (data.success) {
        toast.success("AMC deleted successfully");
        fetchData();
      } else {
        throw new Error(data.error || "Failed to delete AMC");
      }
    } catch (err: any) {
      console.error('[AMC Page] Delete AMC error:', err);
      toast.error(err.message || "Failed to delete AMC");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setIsSubmitting(true);
    try {
      console.log('[AMC Page] Updating AMC status:', id, 'to', status);

      const response = await fetch(`/api/amc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[AMC Page] Update status error:', response.status, data);
        throw new Error(data.error || `Failed to update status (${response.status})`);
      }

      if (data.success) {
        toast.success("Status updated successfully");
        fetchData();
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (err: any) {
      console.error('[AMC Page] Update status error:', err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewAMC({
      clientId: "",
      serviceId: "",
      contractNumber: `AMC-${Date.now().toString().slice(6)}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: "",
      notes: ""
    });
  };

  const createQuickClient = async () => {
    if (!newClientName.trim()) {
      toast.error("Client name is required");
      return;
    }

    setCreatingClient(true);
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName.trim() })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Client created successfully");
        const newClient = result.data;
        // Refresh clients list
        const clientsRes = await fetch("/api/clients");
        const clientsData = await clientsRes.json();
        if (clientsData.success && clientsData.data) {
          setClients(clientsData.data);
        }
        // Auto-select the new client
        setNewAMC(prev => ({ ...prev, clientId: newClient.id.toString() }));
        setNewClientName("");
        setShowClientCreate(false);
      } else {
        toast.error(result.error || "Failed to create client");
      }
    } catch (error) {
      console.error("Failed to create client:", error);
      toast.error("Failed to create client");
    } finally {
      setCreatingClient(false);
    }
  };

  const filteredAMCs = amcs.filter(amc => {
    // If no search term, show all AMCs
    if (!searchTerm || searchTerm.trim() === '') return true;

    // Search in contract number or client name
    return (
      (amc.contractNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (amc.clientName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'expiring': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'expiring': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Stats
  const activeAMCs = amcs.filter(a => a.status === 'active').length;
  const expiringSoon = amcs.filter(a => a.status === 'expiring').length;
  const totalValue = amcs.filter(a => a.status === 'active').reduce((sum, a) => sum + (parseFloat(a.amount || '0') || 0), 0);

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#3ECF8E]" />
        <p className="text-[#717171]">Loading AMC contracts...</p>
      </div>
    );
  }

  // Error state
  if (loadingState === 'error') {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Failed to load AMC contracts</h2>
          <p className="text-[#717171] mt-1">{error}</p>
        </div>
        <Button onClick={fetchData} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">AMC Contracts</h1>
          <p className="text-sm text-[#717171]">Manage Annual Maintenance Contracts with clients</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/amc/reports">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </Link>
          <Button
            onClick={() => setShowBulkImport(true)}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New AMC
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Active Contracts</p>
            <p className="text-xl font-bold text-green-600">{activeAMCs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Expiring Soon</p>
            <p className="text-xl font-bold text-orange-600">{expiringSoon}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Total Contract Value</p>
            <p className="text-xl font-bold">Nu. {(totalValue / 1000).toFixed(1)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Annual Revenue</p>
            <p className="text-xl font-bold text-[#3ECF8E]">Nu. {(totalValue / 12).toFixed(0)}k/mo</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert Section */}
      {expiringSoon > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-4 h-4" />
              {expiringSoon} Contract{expiringSoon > 1 ? "s" : ""} Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100"
                onClick={() => setStatusFilter("expiring")}
              >
                View Expiring
              </Button>
              <Link href="/admin/amc/reports">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100"
                >
                  Full Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients loading warning */}
      {clients.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">No clients available. Please create a client first to create AMC contracts.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
          <Input
            placeholder="Search contracts..."
            className="pl-9 bg-[#F3F3F1] border-[#E5E5E1]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-[#F3F3F1] border-[#E5E5E1]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AMC List - Modern Compact Dashboard */}
      <Card className="border-gray-200/60 shadow-sm">
        <CardContent className="p-0">
          {filteredAMCs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-900">No AMC contracts found</p>
              <p className="text-xs mt-1 text-gray-500">Create your first AMC contract to get started</p>
            </div>
          ) : (
            <div>
              {filteredAMCs.map((amc) => {
                const daysLeft = amc.endDate ? Math.ceil((new Date(amc.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
                const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;
                const isExpired = daysLeft < 0;

                return (
                  <div
                    key={amc.id}
                    className="group border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-transparent transition-all duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Modern Avatar */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white font-bold text-base">
                            {amc.clientName?.charAt(0) || 'C'}
                          </div>
                          {amc.status === 'active' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/admin/clients/${amc.clientId}`}
                              className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors hover:underline"
                            >
                              {amc.clientName || `Client #${amc.clientId}`}
                            </Link>
                            <Badge className={`${getStatusColor(amc.status)} text-[9px] px-2 py-0.5 h-auto font-semibold tracking-wide uppercase rounded-full`}>
                              {amc.status?.replace('_', ' ') || 'Unknown'}
                            </Badge>
                            {isExpiringSoon && (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50 text-[9px] px-2 py-0.5 h-auto font-semibold uppercase rounded-full">
                                ⚡ Expiring
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-mono">{amc.contractNumber || `AMC-${amc.id}`}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="hidden md:flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">End Date</p>
                            <p className={`text-sm font-semibold ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-500' : 'text-gray-700'}`}>
                              {amc.endDate ? new Date(amc.endDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Value</p>
                            <p className="text-sm font-bold text-gray-900">Nu. {(parseFloat(amc.amount || '0') || 0).toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {amc.clientWhatsapp && (
                            <a
                              href={`https://wa.me/${amc.clientWhatsapp}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                              title="WhatsApp"
                            >
                              <Wifi className="w-4 h-4" />
                            </a>
                          )}
                          {amc.status === 'active' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openRenewModal(amc)}
                              disabled={isSubmitting}
                              className="h-9 w-9 rounded-xl hover:bg-blue-50 transition-colors"
                              title="Renew Contract"
                            >
                              <RotateCcw className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteAMC(amc.id)}
                            disabled={isSubmitting}
                            className="h-9 w-9 rounded-xl hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {/* Smart Details */}
                      {(amc.clientWhatsappGroupLink || (amc.invoices && amc.invoices.length > 0) || (amc.tickets && amc.tickets.length > 0) || amc.clientMeta?.yearsWithUs) && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-4">
                            {amc.clientWhatsappGroupLink && (
                              <a
                                href={amc.clientWhatsappGroupLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 border border-green-200 text-xs font-medium text-green-700 transition-all hover:shadow-sm"
                              >
                                <Wifi className="w-3.5 h-3.5" />
                                Group Chat
                              </a>
                            )}
                            {amc.invoices && amc.invoices.length > 0 && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-medium text-gray-600">
                                <FileText className="w-3.5 h-3.5" />
                                {amc.invoices.length} Invoice{amc.invoices.length > 1 ? 's' : ''}
                              </div>
                            )}
                            {amc.tickets && amc.tickets.length > 0 && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {amc.tickets.length} Ticket{amc.tickets.length > 1 ? 's' : ''}
                              </div>
                            )}
                            {amc.clientMeta?.yearsWithUs && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
                                🏆 {amc.clientMeta.yearsWithUs} Year{amc.clientMeta.yearsWithUs > 1 ? 's' : ''}
                              </div>
                            )}
                            {amc.clientMeta?.totalPaid && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                                💰 Nu. {amc.clientMeta.totalPaid.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create AMC Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-semibold">Create New AMC Contract</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} disabled={isSubmitting}>×</Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Client *</label>
                {clients.length === 0 ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    No clients available. Please create a client first.
                  </div>
                ) : (
                  <>
                    <Select
                      value={newAMC.clientId}
                      onValueChange={(v) => {
                        if (v === "new") {
                          setShowClientCreate(true);
                        } else {
                          setNewAMC({ ...newAMC, clientId: v });
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-[#E5E5E1]">
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                        ))}
                        <SelectItem value="new" className="text-emerald-600 font-semibold">
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Add new client
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Service</label>
                {services.length === 0 ? (
                  <div className="text-sm text-[#717171] italic">No services available (optional)</div>
                ) : (
                  <Select value={newAMC.serviceId} onValueChange={(v) => setNewAMC({ ...newAMC, serviceId: v })} disabled={isSubmitting}>
                    <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                      <SelectValue placeholder="Select service (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E1]">
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id.toString()}>{service.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Contract Number</label>
                <Input
                  value={newAMC.contractNumber}
                  onChange={(e) => setNewAMC({ ...newAMC, contractNumber: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Start Date</label>
                  <Input
                    type="date"
                    value={newAMC.startDate}
                    onChange={(e) => setNewAMC({ ...newAMC, startDate: e.target.value })}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">End Date</label>
                  <Input
                    type="date"
                    value={newAMC.endDate}
                    onChange={(e) => setNewAMC({ ...newAMC, endDate: e.target.value })}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Contract Value (Nu.) *</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={newAMC.amount}
                  onChange={(e) => setNewAMC({ ...newAMC, amount: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  disabled={isSubmitting}
                  min="0"
                  step="0.01"
                />
                {newAMC.amount && (
                  <p className="text-xs text-emerald-600 font-medium">Nu. {Number(newAMC.amount).toLocaleString()}</p>
                )}
              </div>

              <div className="p-3 bg-[#F3F3F1] rounded-lg">
                <p className="text-xs text-[#717171] mb-1">Default Services:</p>
                <p className="text-sm">Technical Support, System Maintenance, Remote Assistance</p>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5E1] flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} disabled={isSubmitting}>Cancel</Button>
              <Button
                className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
                onClick={createAMC}
                disabled={isSubmitting || !newAMC.clientId || !newAMC.amount}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Create Contract
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Renew AMC Modal */}
      {showRenew && selectedAMC && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-semibold">Renew AMC Contract</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowRenew(false)} disabled={isSubmitting}>×</Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">Renewing: {selectedAMC.contractNumber}</p>
                <p className="text-sm text-blue-900 font-medium">{selectedAMC.clientName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">New Start Date</label>
                  <Input
                    type="date"
                    value={renewalData.startDate}
                    onChange={(e) => setRenewalData({ ...renewalData, startDate: e.target.value })}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">New End Date</label>
                  <Input
                    type="date"
                    value={renewalData.endDate}
                    onChange={(e) => setRenewalData({ ...renewalData, endDate: e.target.value })}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">New Contract Value (Nu.)</label>
                <Input
                  type="number"
                  placeholder={selectedAMC.amount || "50000"}
                  value={renewalData.amount}
                  onChange={(e) => setRenewalData({ ...renewalData, amount: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Notes</label>
                <Input
                  placeholder="Renewal notes..."
                  value={renewalData.notes}
                  onChange={(e) => setRenewalData({ ...renewalData, notes: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5E1] flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowRenew(false)} disabled={isSubmitting}>Cancel</Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={renewAMC}
                disabled={isSubmitting || !renewalData.amount}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Renewing...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Renew Contract
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Client Creation Modal */}
      {showClientCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Add New Client
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowClientCreate(false)} disabled={creatingClient}>×</Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Client Name *</label>
                <Input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Enter client company name"
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  disabled={creatingClient}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newClientName.trim()) {
                      createQuickClient();
                    }
                  }}
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5E1] flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowClientCreate(false)} disabled={creatingClient}>Cancel</Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={createQuickClient}
                disabled={creatingClient || !newClientName.trim()}
              >
                {creatingClient ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Client
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportModal
          onClose={() => setShowBulkImport(false)}
          onImported={() => {
            fetchData();
            setShowBulkImport(false);
          }}
        />
      )}
    </div>
  );
}
