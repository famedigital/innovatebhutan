"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, Users, Target, DollarSign, Phone, Mail, MessageSquare,
  Plus, RefreshCw, MoreVertical, Clock, CheckCircle, XCircle, Star,
  Zap, Filter, Download, Send, Bot, ChevronRight, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  priority: 'hot' | 'warm' | 'cold';
  value: number;
  notes: string;
  assigned_to: string;
  last_contact: string;
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'completed';
  leads: number;
  conversion: number;
  budget: number;
  spent: number;
}

export default function MarketingPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leads");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '', phone: '', email: '', source: 'whatsapp', notes: '', value: ''
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, campaignsRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('campaigns').select('*').order('created_at', { ascending: false })
      ]);
      setLeads(leadsRes.data || []);
      setCampaigns(campaignsRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addLead = async () => {
    if (!newLead.name || !newLead.phone) {
      toast.error("Name and phone required");
      return;
    }

    await supabase.from('leads').insert({
      name: newLead.name,
      phone: newLead.phone,
      email: newLead.email,
      source: newLead.source,
      notes: newLead.notes,
      value: parseFloat(newLead.value) || 0,
      status: 'new',
      priority: 'warm'
    });

    toast.success("Lead added!");
    setShowAddLead(false);
    setNewLead({ name: '', phone: '', email: '', source: 'whatsapp', notes: '', value: '' });
    fetchData();
  };

  const updateLeadStatus = async (id: string, status: string) => {
    await supabase.from('leads').update({ status: status }).eq('id', id);
    fetchData();
    toast.success("Status updated");
  };

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id);
    fetchData();
    toast.success("Lead deleted");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hot': return 'bg-red-100 text-red-700';
      case 'warm': return 'bg-orange-100 text-orange-700';
      case 'cold': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-700';
      case 'contacted': return 'bg-blue-100 text-blue-700';
      case 'qualified': return 'bg-purple-100 text-purple-700';
      case 'proposal': return 'bg-orange-100 text-orange-700';
      case 'won': return 'bg-green-600 text-white';
      case 'lost': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'whatsapp': return <MessageSquare className="w-3 h-3" />;
      case 'website': return <Zap className="w-3 h-3" />;
      case 'referral': return <Users className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  const filteredLeads = filterStatus === "all" 
    ? leads 
    : leads.filter(l => l.status === filterStatus);

  // Stats
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.priority === 'hot').length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  if (loading) {
    return <div className="p-6 flex items-center justify-center"><RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" /></div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Lead Command Center</h1>
          <p className="text-sm text-[#717171]">Manage leads, track campaigns, and automate follow-ups</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#E5E5E1]" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowAddLead(true)} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Total Leads</p>
            <p className="text-xl font-bold">{totalLeads}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Hot Leads</p>
            <p className="text-xl font-bold text-red-600">{hotLeads}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Pipeline Value</p>
            <p className="text-xl font-bold">Nu. {(totalValue/1000).toFixed(1)}k</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3">
            <p className="text-[10px] text-[#717171] uppercase">Conversion Rate</p>
            <p className="text-xl font-bold">{conversionRate}%</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[#3ECF8E]">
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#717171] uppercase">Bot Active</p>
              <p className="text-lg font-bold text-[#3ECF8E]">Yes</p>
            </div>
            <Bot className="w-5 h-5 text-[#3ECF8E]" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-[#E5E5E1]">
          <TabsTrigger value="leads">Leads Pipeline</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        {/* Leads List */}
        <TabsContent value="leads" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">All Leads</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32 h-8 bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredLeads.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 mx-auto text-[#A3A3A3] mb-2" />
                  <p className="text-sm text-[#717171]">No leads found</p>
                  <Button onClick={() => setShowAddLead(true)} className="mt-2 bg-[#3ECF8E] text-white">
                    Add your first lead
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E5E1]">
                  {filteredLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between p-4 hover:bg-[#F3F3F1]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#3ECF8E]/10 flex items-center justify-center text-[#3ECF8E] font-bold">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{lead.name}</p>
                            <Badge className={`text-[10px] ${getPriorityColor(lead.priority)}`}>
                              {lead.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[#717171]">
                            <span className="flex items-center gap-1">
                              {getSourceIcon(lead.source)}
                              {lead.source}
                            </span>
                            <span>{lead.phone}</span>
                            {lead.email && <span>{lead.email}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {lead.value > 0 && (
                          <span className="text-sm font-medium">Nu. {lead.value.toLocaleString()}</span>
                        )}
                        <Badge className={`text-[10px] ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </Badge>
                        <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v)}>
                          <SelectTrigger className="w-8 h-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-[#E5E5E1]">
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kanban Board */}
        <TabsContent value="kanban" className="mt-4">
          <div className="grid grid-cols-6 gap-3">
            {['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((status) => (
              <div key={status}>
                <div className={`p-2 rounded-t-lg text-center text-xs font-medium uppercase ${
                  status === 'new' ? 'bg-green-100 text-green-700' :
                  status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                  status === 'qualified' ? 'bg-purple-100 text-purple-700' :
                  status === 'proposal' ? 'bg-orange-100 text-orange-700' :
                  status === 'won' ? 'bg-green-600 text-white' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {status} ({leads.filter(l => l.status === status).length})
                </div>
                <div className="space-y-2 p-2 bg-[#F3F3F1] min-h-[400px]">
                  {leads.filter(l => l.status === status).map(lead => (
                    <div key={lead.id} className="bg-white p-3 rounded-lg shadow-sm border border-[#E5E5E1]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{lead.name}</span>
                        <Badge className={`text-[8px] ${getPriorityColor(lead.priority)}`}>
                          {lead.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#717171] mb-2">{lead.phone}</p>
                      {lead.value > 0 && (
                        <p className="text-xs font-medium text-[#3ECF8E]">Nu. {lead.value.toLocaleString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Campaigns */}
        <TabsContent value="campaigns" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Button size="sm" className="bg-[#3ECF8E] text-white">+ New</Button>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-8 h-8 mx-auto text-[#A3A3A3] mb-2" />
                    <p className="text-sm text-[#717171]">No campaigns yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map(campaign => (
                      <div key={campaign.id} className="p-3 bg-[#F3F3F1] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{campaign.name}</span>
                          <Badge className={campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-[#717171]">Leads</p>
                            <p className="font-medium">{campaign.leads}</p>
                          </div>
                          <div>
                            <p className="text-[#717171]">Conv.</p>
                            <p className="font-medium">{campaign.conversion}%</p>
                          </div>
                          <div>
                            <p className="text-[#717171]">Budget</p>
                            <p className="font-medium">Nu. {campaign.budget}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start border-[#E5E5E1] h-11">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Broadcast WhatsApp
                </Button>
                <Button variant="outline" className="w-full justify-start border-[#E5E5E1] h-11">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start border-[#E5E5E1] h-11">
                  <Download className="w-4 h-4 mr-2" />
                  Export Leads
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation */}
        <TabsContent value="automation" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Auto-Responder Rules</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { trigger: 'New WhatsApp Lead', action: 'Send welcome message', status: 'active' },
                  { trigger: 'Lead not contacted 24h', action: 'Alert team via WhatsApp', status: 'active' },
                  { trigger: 'Lead goes cold', action: 'Move to nurture sequence', status: 'paused' },
                  { trigger: 'Lead requests demo', action: 'Create follow-up task', status: 'active' },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#F3F3F1] rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{rule.trigger}</p>
                      <p className="text-xs text-[#717171]">{rule.action}</p>
                    </div>
                    <Badge className={rule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                      {rule.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Webhook Integration</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-[#F3F3F1] rounded-lg">
                  <p className="text-sm font-medium mb-1">Make.com / n8n Webhook</p>
                  <code className="text-xs bg-white px-2 py-1 rounded block overflow-x">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/leads/webhook
                  </code>
                  <p className="text-[10px] text-[#717171] mt-1">Send POST requests here to add leads</p>
                </div>
                <div className="p-3 bg-[#F3F3F1] rounded-lg">
                  <p className="text-sm font-medium mb-1">WhatsApp Integration</p>
                  <p className="text-xs text-[#717171]">Connected via /api/whatsapp</p>
                  <Badge className="bg-green-100 text-green-700 mt-1">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-semibold">Add New Lead</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddLead(false)}>×</Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Name *</label>
                <Input 
                  placeholder="Lead name"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Phone *</label>
                <Input 
                  placeholder="+975xxxxxxxx"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Email</label>
                <Input 
                  type="email"
                  placeholder="email@example.bt"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Source</label>
                <Select value={newLead.source} onValueChange={(v) => setNewLead({...newLead, source: v})}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="campaign">Campaign</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Est. Value (Nu.)</label>
                <Input 
                  type="number"
                  placeholder="0"
                  value={newLead.value}
                  onChange={(e) => setNewLead({...newLead, value: e.target.value})}
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#717171]">Notes</label>
                <textarea 
                  className="w-full h-20 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                  placeholder="Additional notes..."
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#E5E5E1] flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddLead(false)}>Cancel</Button>
              <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={addLead}>
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}