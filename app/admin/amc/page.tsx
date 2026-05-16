"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Plus, Search, Calendar, DollarSign, User, RefreshCw,
  AlertCircle, CheckCircle, Clock, X, Trash2, Eye, RotateCcw, BarChart3, Wifi
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

interface AMC {
  id: number;
  public_id: string;
  client_id: number;
  client_name?: string;
  client_logo?: string;
  service_id?: number;
  service_name?: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  amount?: string;
  status: 'active' | 'expired' | 'expiring' | 'cancelled';
  services_included?: string[];
  notes?: string;
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
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
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
      if (statusFilter) params.append("status", statusFilter);
      params.append("limit", "100");

      const [amcsRes, clientsRes, servicesRes] = await Promise.all([
        fetch(`/api/amc?${params}`),
        fetch("/api/clients/list"),
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
    if (!newAMC.clientId || !newAMC.amount) {
      toast.error("Please select client and enter contract value");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[AMC Page] Creating AMC...');

      const response = await fetch("/api/amc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: parseInt(newAMC.clientId),
          serviceId: newAMC.serviceId ? parseInt(newAMC.serviceId) : undefined,
          contractNumber: newAMC.contractNumber,
          startDate: newAMC.startDate,
          endDate: newAMC.endDate,
          amount: newAMC.amount,
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
    const oldEndDate = new Date(amc.end_date);
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
      notes: `Renewal of contract ${amc.contract_number}`
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

  const filteredAMCs = amcs.filter(amc =>
    amc.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amc.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            onClick={() => setShowCreate(true)}
            className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
            disabled={clients.length === 0}
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
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AMC List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-[#F3F3F1] border-b border-[#E5E5E1]">
              <tr>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Contract #</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Client</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Service</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Start Date</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">End Date</th>
                <th className="text-right text-xs font-medium text-[#717171] p-3">Value</th>
                <th className="text-center text-xs font-medium text-[#717171] p-3">Status</th>
                <th className="text-center text-xs font-medium text-[#717171] p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAMCs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#717171]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#A3A3A3]" />
                    <p>No AMC contracts found</p>
                  </td>
                </tr>
              ) : filteredAMCs.map((amc) => (
                <tr key={amc.id} className="border-b border-[#E5E5E1] hover:bg-[#F3F3F1]">
                  <td className="p-3 text-sm font-medium">{amc.contract_number}</td>
                  <td className="p-3 text-sm">{amc.client_name || 'Unknown'}</td>
                  <td className="p-3 text-sm text-[#717171]">{amc.service_name || '-'}</td>
                  <td className="p-3 text-sm text-[#717171]">{new Date(amc.start_date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm text-[#717171]">{new Date(amc.end_date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-medium text-right">Nu. {(parseFloat(amc.amount || '0') || 0).toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <Badge className={`${getStatusColor(amc.status)} text-[10px]`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(amc.status)}
                        {amc.status.replace('_', ' ')}
                      </span>
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {amc.status === 'active' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Renew Contract"
                          onClick={() => openRenewModal(amc)}
                          disabled={isSubmitting}
                        >
                          <RotateCcw className="w-3 h-3 text-blue-500" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" title="Create Invoice" disabled={isSubmitting}>
                        <DollarSign className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAMC(amc.id)}
                        disabled={isSubmitting}
                      >
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
                  <Select value={newAMC.clientId} onValueChange={(v) => setNewAMC({ ...newAMC, clientId: v })} disabled={isSubmitting}>
                    <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E5E1]">
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <label className="text-xs text-[#717171]">Contract Value (Nu.)</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={newAMC.amount}
                  onChange={(e) => setNewAMC({ ...newAMC, amount: e.target.value })}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  disabled={isSubmitting}
                />
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
                <p className="text-xs text-blue-700">Renewing: {selectedAMC.contract_number}</p>
                <p className="text-sm text-blue-900 font-medium">{selectedAMC.client_name}</p>
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
    </div>
  );
}
