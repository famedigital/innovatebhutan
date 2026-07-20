"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Plus, Search, AlertCircle, CheckCircle, Clock, Trash2, RotateCcw, BarChart3, Upload, MoreVertical, MessageCircle, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  TableCell, TableHead, TableRow
} from "@/components/ui/table";
import {
  Item, ItemContent, ItemDescription, ItemActions, ItemMedia, ItemTitle
} from "@/components/ui/item";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ResponsiveDataList } from "@/components/admin/responsive-data-list";
import { AmcRenewalDesk } from "@/components/admin/amc-renewal-desk";
import { toast } from "sonner";
import { BulkImportModal } from "@/app/admin/amc/bulk-import-modal";
import { useSearchParams } from "next/navigation";

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
  renewedTo?: number | null;
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

export default function AmcDeskPage({
  defaultProductKey,
}: {
  defaultProductKey?: string;
}) {
  const searchParams = useSearchParams();
  const [amcs, setAMCs] = useState<AMC[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // Prefer explicit URL owner; otherwise show full list (not "today")
  const [ownerFilter, setOwnerFilter] = useState<string>(
    searchParams.get("owner") || "all"
  );
  const productKeyFilter =
    searchParams.get("productKey") || defaultProductKey || undefined;
  const [showCreate, setShowCreate] = useState(false);
  const [showClientCreate, setShowClientCreate] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [creatingClient, setCreatingClient] = useState(false);
  const [renewAMC, setRenewAMC] = useState<AMC | null>(null);
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

  const fetchData = useCallback(async () => {
    setLoadingState('loading');
    setError(null);
    try {
      console.log('[AMC Page] Fetching data...');

      // Fetch AMCs with filters
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (ownerFilter && ownerFilter !== "all") params.append("owner", ownerFilter);
      const clientIdParam = searchParams.get("clientId");
      if (clientIdParam) params.append("clientId", clientIdParam);
      if (productKeyFilter) params.append("productKey", productKeyFilter);
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
  }, [statusFilter, ownerFilter, searchParams, productKeyFilter]);

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
          productKey: productKeyFilter || "rancelab",
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
    setRenewAMC(amc);
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
      case 'active': return 'border-border bg-secondary text-foreground';
      case 'expired': return 'border-destructive/30 bg-destructive/10 text-destructive';
      case 'expiring': return 'border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200';
      case 'cancelled': return 'border-border bg-muted text-muted-foreground';
      case 'renewed': return 'border-border bg-muted text-muted-foreground';
      default: return 'border-border bg-muted text-muted-foreground';
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
  const expiredCount = amcs.filter(a => a.status === 'expired').length;
  const totalValue = amcs.filter(a => a.status === 'active' || a.status === 'expiring').reduce((sum, a) => sum + (parseFloat(a.amount || '0') || 0), 0);

  const canRenew = (amc: AMC) =>
    amc.status !== "cancelled" && !amc.renewedTo;

  // Loading state
  if (loadingState === 'loading') {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading AMC contracts...</p>
      </div>
    );
  }

  // Error state
  if (loadingState === 'error') {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Failed to load AMC contracts</h2>
          <p className="text-muted-foreground mt-1">{error}</p>
        </div>
        <Button onClick={fetchData} className="bg-primary hover:bg-[#34b27b] text-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={productKeyFilter ? `AMC · ${productKeyFilter}` : "AMC"}
        description="Renewals stay in one modal · invoices roll up to master Invoices"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Commercial" },
          { label: "AMC" },
        ]}
        actions={
          <>
            {searchParams.get("from") === "client" &&
            searchParams.get("clientId") ? (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/admin/clients/${searchParams.get("clientId")}?tab=amc`}
                >
                  Back to client
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products">Products</Link>
            </Button>
            <Link href="/admin/amc/reports">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
            </Link>
            <Button
              onClick={() => setShowBulkImport(true)}
              variant="outline"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </Button>
            <Button onClick={() => setShowCreate(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New AMC
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "today", label: "Today" },
            { id: "mine", label: "Mine" },
            { id: "unclaimed", label: "Unclaimed" },
            { id: "all", label: "All" },
          ] as const
        ).map((o) => (
          <Button
            key={o.id}
            size="sm"
            variant={ownerFilter === o.id ? "default" : "outline"}
            onClick={() => setOwnerFilter(o.id)}
          >
            {o.label}
          </Button>
        ))}
      </div>

      {/* Stats — clickable filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter("active")}
          className="text-left"
        >
          <Card className={`shadow-none transition-colors ${statusFilter === "active" ? "border-primary ring-1 ring-primary/30" : "hover:bg-accent/40"}`}>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Active Contracts</p>
              <p className="text-xl font-semibold text-foreground">{activeAMCs}</p>
            </CardContent>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("expiring")}
          className="text-left"
        >
          <Card className={`shadow-none transition-colors ${statusFilter === "expiring" ? "border-amber-500 ring-1 ring-amber-500/30" : "hover:bg-accent/40"}`}>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Expiring Soon</p>
              <p className="text-xl font-semibold text-amber-700 dark:text-amber-300">{expiringSoon}</p>
            </CardContent>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("expired")}
          className="text-left"
        >
          <Card className={`shadow-none transition-colors ${statusFilter === "expired" ? "border-destructive ring-1 ring-destructive/30" : "hover:bg-accent/40"}`}>
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase">Expired</p>
              <p className="text-xl font-semibold text-destructive">{expiredCount}</p>
            </CardContent>
          </Card>
        </button>
        <Card className="shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Contract Value</p>
            <p className="text-xl font-semibold">Nu. {(totalValue / 1000).toFixed(1)}k</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert Section */}
      {expiringSoon > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <AlertCircle className="w-4 h-4" />
              {expiringSoon} Contract{expiringSoon > 1 ? "s" : ""} Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatusFilter("expiring")}
              >
                View Expiring
              </Button>
              <Link href="/admin/amc/reports">
                <Button size="sm" variant="outline">
                  Full Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clients loading warning */}
      {clients.length === 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 shadow-none">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">No clients available. Create a client first to add AMC contracts.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
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

      <ResponsiveDataList
        isEmpty={filteredAMCs.length === 0}
        empty="No AMC contracts found. Create your first contract to get started."
        tableHeader={
          <>
            <TableHead>Client</TableHead>
            <TableHead>Contract</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>End date</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </>
        }
        tableBody={filteredAMCs.map((amc) => {
          const daysLeft = amc.endDate
            ? Math.ceil(
                (new Date(amc.endDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;
          const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;
          return (
            <TableRow
              key={amc.id}
              className="cursor-pointer"
              onClick={() => setRenewAMC(amc)}
            >
              <TableCell className="font-medium">
                {amc.clientName || `Client #${amc.clientId}`}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {amc.contractNumber || `AMC-${amc.id}`}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className={getStatusColor(amc.status)}>
                    {amc.status?.replace("_", " ") || "Unknown"}
                  </Badge>
                  {isExpiringSoon && (
                    <Badge variant="outline" className="border-amber-200 text-amber-800">
                      Expiring
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {amc.endDate
                  ? new Date(amc.endDate).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell className="text-right font-medium">
                Nu. {(parseFloat(amc.amount || "0") || 0).toLocaleString()}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setRenewAMC(amc)}>
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/clients/${amc.clientId}?tab=amc`}>
                        AMC log on client
                      </Link>
                    </DropdownMenuItem>
                    {amc.clientWhatsapp && (
                      <DropdownMenuItem asChild>
                        <a
                          href={`https://wa.me/${amc.clientWhatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          WhatsApp
                        </a>
                      </DropdownMenuItem>
                    )}
                    {canRenew(amc) && (
                      <DropdownMenuItem onClick={() => openRenewModal(amc)}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Renew
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteAMC(amc.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
        mobileItems={filteredAMCs.map((amc) => {
          const daysLeft = amc.endDate
            ? Math.ceil(
                (new Date(amc.endDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0;
          const isExpiringSoon = daysLeft > 0 && daysLeft <= 30;
          const metaBits = [
            amc.endDate
              ? `Ends ${new Date(amc.endDate).toLocaleDateString()}`
              : null,
            `Nu. ${(parseFloat(amc.amount || "0") || 0).toLocaleString()}`,
            amc.clientMeta?.yearsWithUs
              ? `${amc.clientMeta.yearsWithUs}y tenure`
              : null,
            amc.tickets?.length ? `${amc.tickets.length} tickets` : null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <Item
              key={amc.id}
              variant="default"
              size="sm"
              className="rounded-none border-0 cursor-pointer hover:bg-accent/50"
              onClick={() => setRenewAMC(amc)}
            >
              <ItemMedia variant="icon" className="bg-secondary">
                <span className="text-xs font-semibold text-foreground">
                  {amc.clientName?.charAt(0) || "C"}
                </span>
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="w-full justify-between gap-2">
                  <span className="truncate">
                    {amc.clientName || `Client #${amc.clientId}`}
                  </span>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(amc.status)} shrink-0`}
                  >
                    {amc.status?.replace("_", " ") || "Unknown"}
                  </Badge>
                </ItemTitle>
                <ItemDescription>
                  {amc.contractNumber || `AMC-${amc.id}`}
                  {isExpiringSoon ? " · Expiring soon" : ""}
                  {metaBits ? ` · ${metaBits}` : ""}
                </ItemDescription>
              </ItemContent>
              <ItemActions onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setRenewAMC(amc)}>
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/clients/${amc.clientId}?tab=amc`}>
                        AMC log on client
                      </Link>
                    </DropdownMenuItem>
                    {amc.clientWhatsapp && (
                      <DropdownMenuItem asChild>
                        <a
                          href={`https://wa.me/${amc.clientWhatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </DropdownMenuItem>
                    )}
                    {canRenew(amc) && (
                      <DropdownMenuItem onClick={() => openRenewModal(amc)}>
                        Renew
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteAMC(amc.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ItemActions>
            </Item>
          );
        })}
      />

      <AmcRenewalDesk
        amc={renewAMC}
        open={!!renewAMC}
        onOpenChange={(o) => !o && setRenewAMC(null)}
        onRenewed={fetchData}
      />

      {/* Create AMC Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Create New AMC Contract</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)} disabled={isSubmitting}>×</Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Client *</label>
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
                      <SelectTrigger className="bg-muted border-border">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-border">
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
                <label className="text-xs text-muted-foreground">Service</label>
                {services.length === 0 ? (
                  <div className="text-sm text-muted-foreground italic">No services available (optional)</div>
                ) : (
                  <Select value={newAMC.serviceId} onValueChange={(v) => setNewAMC({ ...newAMC, serviceId: v })} disabled={isSubmitting}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Select service (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border">
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id.toString()}>{service.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Contract Number</label>
                <Input
                  value={newAMC.contractNumber}
                  onChange={(e) => setNewAMC({ ...newAMC, contractNumber: e.target.value })}
                  className="bg-muted border-border"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={newAMC.startDate}
                    onChange={(e) => setNewAMC({ ...newAMC, startDate: e.target.value })}
                    className="bg-muted border-border"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">End Date</label>
                  <Input
                    type="date"
                    value={newAMC.endDate}
                    onChange={(e) => setNewAMC({ ...newAMC, endDate: e.target.value })}
                    className="bg-muted border-border"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Contract Value (Nu.) *</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={newAMC.amount}
                  onChange={(e) => setNewAMC({ ...newAMC, amount: e.target.value })}
                  className="bg-muted border-border"
                  disabled={isSubmitting}
                  min="0"
                  step="0.01"
                />
                {newAMC.amount && (
                  <p className="text-xs text-emerald-600 font-medium">Nu. {Number(newAMC.amount).toLocaleString()}</p>
                )}
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Default Services:</p>
                <p className="text-sm">Technical Support, System Maintenance, Remote Assistance</p>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)} disabled={isSubmitting}>Cancel</Button>
              <Button
                className="bg-primary hover:bg-[#34b27b] text-white"
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

      {/* Quick Client Creation Modal */}
      {showClientCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                Add New Client
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowClientCreate(false)} disabled={creatingClient}>×</Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Client Name *</label>
                <Input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Enter client company name"
                  className="bg-muted border-border"
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

            <div className="p-4 border-t border-border flex justify-end gap-2">
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
