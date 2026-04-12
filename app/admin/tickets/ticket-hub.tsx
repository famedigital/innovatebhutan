"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Plus, Eye, Trash2, X, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export function TicketHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tickets, setTickets] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', clientId: '', priority: 'medium', description: '' });

  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
    fetchClients();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('tickets')
        .select(`*, clients(name)`)
        .order('created_at', { ascending: false });

      setTickets(data || []);
    } catch (err) {
      console.error("Ticket Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    const { data } = await supabase.from('clients').select('id, name').order('name');
    setClients(data || []);
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.clientId) {
      toast.error("Subject and client required");
      return;
    }

    const { error } = await supabase.from('tickets').insert({
      subject: newTicket.subject,
      client_id: parseInt(newTicket.clientId),
      priority: newTicket.priority,
      description: newTicket.description,
      status: 'open',
    });

    if (error) {
      toast.error("Failed to create ticket");
    } else {
      toast.success("Ticket created");
      setShowCreate(false);
      setNewTicket({ subject: '', clientId: '', priority: 'medium', description: '' });
      fetchTickets();
    }
  };

  const handleDeleteTicket = async (id: number) => {
    if (!confirm("Delete this ticket?")) return;
    
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Ticket deleted");
      fetchTickets();
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Status updated");
      fetchTickets();
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
            <Input 
              placeholder="Search tickets..." 
              className="pl-9 w-64 bg-[#F3F3F1] border-[#E5E5E1] h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-[#F3F3F1] border-[#E5E5E1] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E5E5E1]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32 bg-[#F3F3F1] border-[#E5E5E1] h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E5E5E1]">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={fetchTickets} variant="outline" className="border-[#E5E5E1]">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreate(true)} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="font-semibold text-lg">Create New Ticket</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Subject *</label>
                <Input 
                  placeholder="Enter ticket subject"
                  className="bg-[#F3F3F1] border-[#E5E5E1]"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Client *</label>
                <Select value={newTicket.clientId} onValueChange={(v) => setNewTicket({...newTicket, clientId: v})}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Priority</label>
                <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({...newTicket, priority: v})}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[#717171]">Description</label>
                <textarea 
                  placeholder="Describe the issue..."
                  className="w-full h-24 p-3 bg-[#F3F3F1] border-[#E5E5E1] rounded-lg text-sm resize-none"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-[#E5E5E1]" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-[#3ECF8E] hover:bg-[#34b27b] text-white" onClick={handleCreateTicket}>
                  Create Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E5E5E1] bg-[#F3F3F1]">
                <TableHead className="text-xs text-[#717171]">ID</TableHead>
                <TableHead className="text-xs text-[#717171]">Subject</TableHead>
                <TableHead className="text-xs text-[#717171]">Client</TableHead>
                <TableHead className="text-xs text-[#717171]">Priority</TableHead>
                <TableHead className="text-xs text-[#717171]">Status</TableHead>
                <TableHead className="text-xs text-[#717171]">Created</TableHead>
                <TableHead className="text-xs text-[#717171]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} className="border-[#E5E5E1] hover:bg-[#F3F3F1]">
                  <TableCell className="text-xs font-mono text-[#717171]">#{ticket.id}</TableCell>
                  <TableCell className="text-sm font-medium">{ticket.subject}</TableCell>
                  <TableCell className="text-sm">{ticket.clients?.name || '-'}</TableCell>
                  <TableCell>
                    <Badge className={`${
                      ticket.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200' :
                      ticket.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      'bg-blue-50 text-blue-600 border-blue-200'
                    } text-[10px] px-2`}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${
                      ticket.status === 'open' ? 'bg-green-50 text-green-600 border-green-200' :
                      ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      ticket.status === 'resolved' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                      'bg-gray-100 text-gray-400 border-gray-200'
                    } text-[10px] px-2`}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-[#717171]">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Select defaultValue={ticket.status} onValueChange={(v) => handleUpdateStatus(ticket.id, v)}>
                        <SelectTrigger className="h-8 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#E5E5E1]">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteTicket(ticket.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#717171]">
                    {loading ? 'Loading...' : (
                      <div className="flex flex-col items-center">
                        <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                        <p>No tickets found</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}