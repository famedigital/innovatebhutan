"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  MoreVertical,
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Calendar,
  FileText,
  UserCheck,
  Settings,
  Activity,
  Zap
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface Client {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry?: string;
  companySize?: string;
  tier?: 'gold' | 'silver' | 'bronze';
  preferredContactMethod?: string;
  timezone?: string;
  slaLevel?: string;
  responseTimeTarget?: number;
  clientHealthScore?: number;
  lastCommunicationDate?: string;
  nextFollowUpDate?: string;
  notes?: string;
  tags?: any;
  status: string;
  created_at: string;
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  healthScore: number;
  criticalIssues: number;
  followUps: number;
}

export default function EnhancedClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState({
    tier: "all",
    industry: "all",
    status: "all"
  });
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    activeClients: 0,
    healthScore: 0,
    criticalIssues: 0,
    followUps: 0
  });

  const supabase = createClient();

  // 📡 Real-time Data Sync
  useEffect(() => {
    fetchClients();
    fetchStats();

    const channel = supabase
      .channel('clients-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchClients();
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error("Client Fetch Error:", err);
      toast.error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get basic stats
      const { count: totalCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      const { count: activeCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get health scores
      const { data: healthData } = await supabase
        .from('clients')
        .select('client_health_score')
        .not('client_health_score', 'is', null);

      const avgHealth = healthData && healthData.length > 0
        ? healthData.reduce((sum, c) => sum + (c.client_health_score || 0), 0) / healthData.length
        : 0;

      setStats({
        totalClients: totalCount || 0,
        activeClients: activeCount || 0,
        healthScore: Math.round(avgHealth),
        criticalIssues: 0, // Will fetch from problems table
        followUps: 0 // Will fetch from communications table
      });
    } catch (err) {
      console.error("Stats Fetch Error:", err);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = filters.tier === "all" || client.tier === filters.tier;
    const matchesIndustry = filters.industry === "all" || client.industry === filters.industry;
    const matchesStatus = filters.status === "all" || client.status === filters.status;

    return matchesSearch && matchesTier && matchesIndustry && matchesStatus;
  });

  const getHealthColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-600";
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getHealthIcon = (score?: number) => {
    if (!score) return <AlertTriangle className="w-3 h-3" />;
    if (score >= 80) return <TrendingUp className="w-3 h-3" />;
    if (score >= 60) return <Activity className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  const getTierBadgeColor = (tier?: string) => {
    switch (tier) {
      case 'gold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'silver': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'bronze': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const handleQuickAction = async (action: string, client: Client) => {
    switch (action) {
      case 'whatsapp':
        window.open(`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:${client.email}`, '_blank');
        break;
      case 'call':
        window.open(`tel:${client.phone}`, '_blank');
        break;
      case 'view-profile':
        setSelectedClient(client);
        setActiveTab('profile');
        break;
      case 'view-communications':
        setSelectedClient(client);
        setActiveTab('communications');
        break;
      case 'view-problems':
        setSelectedClient(client);
        setActiveTab('problems');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Client Management</h1>
          <p className="text-sm text-gray-500">Enhanced client support with 360° visibility</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-black">
            <Zap className="w-4 h-4 mr-2" />
            AI Insights
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Total Clients</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Active</p>
                <p className="text-2xl font-bold text-green-700">{stats.activeClients}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Avg Health</p>
                <p className="text-2xl font-bold text-purple-700">{stats.healthScore}%</p>
              </div>
              <Heart className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-medium">Critical Issues</p>
                <p className="text-2xl font-bold text-red-700">{stats.criticalIssues}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 font-medium">Follow-ups</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.followUps}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-gray-100 border-gray-200">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Client Profile</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-200">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Tier</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilters({...filters, tier: 'all'})}>
                  All Tiers
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, tier: 'gold'})}>
                  Gold Clients
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, tier: 'silver'})}>
                  Silver Clients
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilters({...filters, tier: 'bronze'})}>
                  Bronze Clients
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={fetchClients}
              className="border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search clients by name, contact, email..."
                    className="pl-10 bg-white border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="w-[200px]">Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Health Score</TableHead>
                    <TableHead>Last Communication</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No clients found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClients.map((client) => (
                      <TableRow key={client.id} className="border-gray-100 hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-black">{client.name}</p>
                            {client.companySize && (
                              <p className="text-xs text-gray-500">{client.companySize}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{client.contactPerson || '-'}</p>
                            <p className="text-xs text-gray-500">{client.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {client.tier && (
                            <Badge className={getTierBadgeColor(client.tier)}>
                              {client.tier.charAt(0).toUpperCase() + client.tier.slice(1)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">{client.industry || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getHealthColor(client.clientHealthScore)}>
                            <div className="flex items-center gap-1">
                              {getHealthIcon(client.clientHealthScore)}
                              <span className="font-medium">{client.clientHealthScore || 'N/A'}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {client.lastCommunicationDate
                              ? new Date(client.lastCommunicationDate).toLocaleDateString()
                              : 'Never'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            client.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }>
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleQuickAction('whatsapp', client)}>
                                <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                                WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickAction('email', client)}>
                                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickAction('call', client)}>
                                <Phone className="w-4 h-4 mr-2 text-purple-600" />
                                Call
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleQuickAction('view-profile', client)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickAction('view-communications', client)}>
                                <FileText className="w-4 h-4 mr-2" />
                                Communications
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleQuickAction('view-problems', client)}>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Problems
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Profile Tab */}
        <TabsContent value="profile">
          {selectedClient ? (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedClient.name} - Profile</span>
                  <Button variant="outline" size="sm" onClick={() => setSelectedClient(null)}>
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Back to Overview
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedClient.contactPerson}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedClient.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{selectedClient.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Business Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Industry:</span>
                        <span className="text-sm font-medium capitalize">{selectedClient.industry || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Company Size:</span>
                        <span className="text-sm font-medium">{selectedClient.companySize || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tier:</span>
                        <Badge className={getTierBadgeColor(selectedClient.tier)}>
                          {selectedClient.tier?.toUpperCase() || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Service Level</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">SLA Level:</span>
                        <span className="text-sm font-medium">{selectedClient.slaLevel || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Response Target:</span>
                        <span className="text-sm font-medium">{selectedClient.responseTimeTarget ? `${selectedClient.responseTimeTarget}h` : '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Preferred Contact:</span>
                        <span className="text-sm font-medium capitalize">{selectedClient.preferredContactMethod || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Health & Activity</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Health Score:</span>
                        <Badge className={getHealthColor(selectedClient.clientHealthScore)}>
                          {selectedClient.clientHealthScore || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Communication:</span>
                        <span className="text-sm font-medium">
                          {selectedClient.lastCommunicationDate
                            ? new Date(selectedClient.lastCommunicationDate).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Follow-up:</span>
                        <span className="text-sm font-medium">
                          {selectedClient.nextFollowUpDate
                            ? new Date(selectedClient.nextFollowUpDate).toLocaleDateString()
                            : 'Not scheduled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedClient.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-gray-200">
              <CardContent className="p-12 text-center">
                <UserCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Select a client to view their profile</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Communications Tab */}
        <TabsContent value="communications">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Communication Timeline</CardTitle>
              <p className="text-sm text-gray-500">View all interactions across channels</p>
            </CardHeader>
            <CardContent>
              {selectedClient ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{selectedClient.name} - Communications</h3>
                    <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-black">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Log Communication
                    </Button>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Communication timeline will be loaded from the API</p>
                    <p className="text-sm">Use the communications API endpoint to fetch data</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a client to view their communication timeline</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Problems Tab */}
        <TabsContent value="problems">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Problem History</CardTitle>
              <p className="text-sm text-gray-500">Track issues, resolutions, and root cause analysis</p>
            </CardHeader>
            <CardContent>
              {selectedClient ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{selectedClient.name} - Problems</h3>
                    <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-black">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Create Problem
                    </Button>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <p>Problem history will be loaded from the API</p>
                    <p className="text-sm">Use the problems API endpoint to fetch data</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a client to view their problem history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle>Team Assignments</CardTitle>
              <p className="text-sm text-gray-500">Manage focal persons and team assignments</p>
            </CardHeader>
            <CardContent>
              {selectedClient ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{selectedClient.name} - Team</h3>
                    <Button className="bg-[#3ECF8E] hover:bg-[#34b27b] text-black">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Assign Team Member
                    </Button>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4" />
                    <p>Team assignments will be loaded from the API</p>
                    <p className="text-sm">Use the team management API endpoint to fetch data</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a client to view their assigned team</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}