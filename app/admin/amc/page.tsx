"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Plus, Search, Calendar, DollarSign, User, RefreshCw, 
  AlertCircle, CheckCircle, Clock, X, Trash2, Eye
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

interface AMC {
  id: number;
  client_id: number;
  client_name?: string;
  contract_number: string;
  start_date: string;
  end_date: string;
  contract_value: number;
  status: 'active' | 'expired' | 'expiring_soon' | 'cancelled';
  services_included: string[];
}

export default function AMCPage() {
  const [amcs, setAMCs] = useState<AMC[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newAMC, setNewAMC] = useState({
    clientId: "",
    contractNumber: `AMC-${Date.now().toString().slice(6)}`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    contractValue: "",
    services: [] as string[]
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [amcsRes, clientsRes] = await Promise.all([
        supabase.from('amcs').select('*, clients(name)').order('created_at', { ascending: false }),
        supabase.from('clients').select('id, name').eq('active', true)
      ]);

      const amcsWithStatus = (amcsRes.data || []).map((amc: any) => {
        const endDate = new Date(amc.end_date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: string = amc.status;
        if (amc.status === 'active') {
          if (daysUntilExpiry < 0) status = 'expired';
          else if (daysUntilExpiry < 30) status = 'expiring_soon';
        }

        return { ...amc, status, client_name: amc.clients?.name };
      });

      setAMCs(amcsWithStatus);
      setClients(clientsRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const createAMC = async () => {
    if (!newAMC.clientId || !newAMC.contractValue) {
      toast.error("Select client and enter contract value");
      return;
    }

    try {
      const { error } = await supabase.from('amcs').insert({
        client_id: parseInt(newAMC.clientId),
        contract_number: newAMC.contractNumber,
        start_date: newAMC.startDate,
        end_date: newAMC.endDate,
        contract_value: parseFloat(newAMC.contractValue),
        status: 'active',
        services_included: newAMC.services.length > 0 ? newAMC.services : ['Technical Support', 'System Maintenance']
      });

      if (error) throw error;

      toast.success("AMC Contract created!");
      setShowCreate(false);
      setNewAMC({
        clientId: "",
        contractNumber: `AMC-${Date.now().toString().slice(6)}`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contractValue: "",
        services: []
      });
      fetchData();
    } catch (err: any) {
      toast.error("Failed: " + err.message);
    }
  };

  const deleteAMC = async (id: number) => {
    if (!confirm("Delete this AMC contract?")) return;
    const { error } = await supabase.from('amcs').delete().eq('id', id);
    if (!error) {
      toast.success("Deleted");
      fetchData();
    }
  };

  const filteredAMCs = amcs.filter(amc => 
    amc.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amc.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'expired': return 'bg-red-100 text-red-700';
      case 'expiring_soon': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'expiring_soon': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Stats
  const activeAMCs = amcs.filter(a => a.status === 'active').length;
  const expiringSoon = amcs.filter(a => a.status === 'expiring_soon').length;
  const totalValue = amcs.filter(a => a.status === 'active').reduce((sum, a) => sum + a.contract_value, 0);

  if (loading) {
    return <div className="p-6 flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" /></div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">AMC Contracts</h1>
          <p className="text-sm text-[#717171]">Manage Annual Maintenance Contracts with clients</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
          <Plus className="w-4 h-4 mr-2" />
          New AMC
        </Button>
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
            <p className="text-xl font-bold">Nu. {(totalValue/1000).toFixed(1)}k</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">This Month Revenue</p>
            <p className="text-xl font-bold text-[#3ECF8E]">Nu. {(totalValue/12).toFixed(0)}k</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
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
      </div>

      {/* AMC List */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-[#F3F3F1] border-b border-[#E5E5E1]">
              <tr>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Contract #</th>
                <th className="text-left text-xs font-medium text-[#717171] p-3">Client</th>
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
                  <td colSpan={7} className="text-center py-12 text-[#717171]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#A3A3A3]" />
                    <p>No AMC contracts found</p>
                  </td>
                </tr>
              ) : filteredAMCs.map((amc) => (
                <tr key={amc.id} className="border-b border-[#E5E5E1] hover:bg-[#F3F3F1]">
                  <td className="p-3 text-sm font-medium">{amc.contract_number}</td>
                  <td className="p-3 text-sm">{amc.client_name || 'Unknown'}</td>
                  <td className="p-3 text-sm text-[#717171]">{new Date(amc.start_date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm text-[#717171]">{new Date(amc.end_date).toLocaleDateString()}</td>
                  <td className="p-3 text-sm font-medium text-right">Nu. {amc.contract_value.toLocaleString()}</td>
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
                      <Button size="sm" variant="ghost" title="Create Invoice">
                        <DollarSign className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteAMC(amc.id)}>
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
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>×</Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Client *</label>
                <Select value={newAMC.clientId} onValueChange={(v) => setNewAMC({...newAMC, clientId: v})}>
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
                <label className="text-xs text-[#717171]">Contract Number</label>
                <Input 
                  value={newAMC.contractNumber}
                  onChange={(e) => setNewAMC({...newAMC, contractNumber: e.target.value})}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">Start Date</label>
                  <Input 
                    type="date" 
                    value={newAMC.startDate}
                    onChange={(e) => setNewAMC({...newAMC, startDate: e.target.value})}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-[#717171]">End Date</label>
                  <Input 
                    type="date" 
                    value={newAMC.endDate}
                    onChange={(e) => setNewAMC({...newAMC, endDate: e.target.value})}
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Contract Value (Nu.)</label>
                <Input 
                  type="number"
                  placeholder="50000"
                  value={newAMC.contractValue}
                  onChange={(e) => setNewAMC({...newAMC, contractValue: e.target.value})}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>

              <div className="p-3 bg-[#F3F3F1] rounded-lg">
                <p className="text-xs text-[#717171] mb-2">Default Services:</p>
                <p className="text-sm">Technical Support, System Maintenance, Remote Assistance</p>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5E1] flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={createAMC}>
                <FileText className="w-4 h-4 mr-2" />
                Create Contract
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}