"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Plus, Eye, Trash2, X, MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { TicketDetailModal } from "./ticket-detail-modal";

export function TicketHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tickets, setTickets] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', clientId: '', priority: 'medium', description: '' });

  useEffect(() => {
    fetchTickets();
    fetchClients();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tickets?limit=100");
      const result = await response.json();
      if (!result.success) {
        toast.error(result.error || "Failed to load tickets");
        setTickets([]);
        return;
      }
      setTickets(
        (result.data || []).map((ticket: any) => ({
          ...ticket,
          clients: { name: ticket.clientName },
          sla_breach: ticket.slaBreach,
          created_at: ticket.createdAt,
        }))
      );
    } catch (err) {
      console.error("Ticket Fetch Error:", err);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients?limit=200");
      const result = await response.json();
      if (result.success) {
        setClients(result.data || result.clients || []);
      }
    } catch {
      /* ignore */
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.clientId) {
      toast.error("Subject and client required");
      return;
    }

    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: newTicket.subject,
        clientId: parseInt(newTicket.clientId),
        priority: newTicket.priority,
        description: newTicket.description || undefined,
      }),
    });
    const result = await response.json();

    if (!result.success) {
      toast.error(result.error || "Failed to create ticket");
    } else {
      toast.success("Ticket created");
      setShowCreate(false);
      setNewTicket({ subject: '', clientId: '', priority: 'medium', description: '' });
      fetchTickets();
    }
  };

  const handleDeleteTicket = async (id: number) => {
    if (!confirm("Delete this ticket?")) return;

    const response = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!result.success) {
      toast.error(result.error || "Failed to delete");
    } else {
      toast.success("Ticket deleted");
      fetchTickets();
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    const response = await fetch(`/api/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (!result.success) {
      toast.error(result.error || "Failed to update");
    } else {
      toast.success("Status updated");
      fetchTickets();
    }
  };

  const openTicketDetail = (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setShowDetail(true);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Stats
  const openTickets = filteredTickets.filter(t => t.status === 'open').length;
  const breachedTickets = filteredTickets.filter(t => t.sla_breach).length;
  const inProgressTickets = filteredTickets.filter(t => t.status === 'in_progress').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Open</p>
                <p className="text-lg font-bold">{openTickets}</p>
              </div>
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">In Progress</p>
                <p className="text-lg font-bold">{inProgressTickets}</p>
              </div>
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className={breachedTickets > 0 ? "bg-red-50 border-red-200" : ""}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">SLA Breached</p>
                <p className={`text-lg font-bold ${breachedTickets > 0 ? "text-red-600" : ""}`}>{breachedTickets}</p>
              </div>
              <AlertTriangle className={`w-5 h-5 ${breachedTickets > 0 ? "text-red-600" : "text-gray-400"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-9 w-64 bg-muted border-border h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-muted border-border h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32 bg-muted border-border h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-white border-border">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={fetchTickets} variant="outline" className="border-border">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-[#34b27b] text-white">
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
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-lg">Create New Ticket</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Subject *</label>
                <Input
                  placeholder="Enter ticket subject"
                  className="bg-muted border-border"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Client *</label>
                <Select value={newTicket.clientId} onValueChange={(v) => setNewTicket({...newTicket, clientId: v})}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border">
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Priority</label>
                <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({...newTicket, priority: v})}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border">
                    <SelectItem value="high">High (4h SLA)</SelectItem>
                    <SelectItem value="medium">Medium (24h SLA)</SelectItem>
                    <SelectItem value="low">Low (72h SLA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea
                  placeholder="Describe the issue..."
                  className="w-full h-24 p-3 bg-muted border-border rounded-lg text-sm resize-none"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 border-border" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-primary hover:bg-[#34b27b] text-white" onClick={handleCreateTicket}>
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
              <TableRow className="border-border bg-muted">
                <TableHead className="text-xs text-muted-foreground">ID</TableHead>
                <TableHead className="text-xs text-muted-foreground">Subject</TableHead>
                <TableHead className="text-xs text-muted-foreground">Client</TableHead>
                <TableHead className="text-xs text-muted-foreground">Priority</TableHead>
                <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                <TableHead className="text-xs text-muted-foreground">SLA</TableHead>
                <TableHead className="text-xs text-muted-foreground">Created</TableHead>
                <TableHead className="text-xs text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length > 0 ? filteredTickets.map((ticket) => {
                const slaDeadline = ticket.sla_deadline ? new Date(ticket.sla_deadline) : null;
                const hoursRemaining = slaDeadline ? Math.round((slaDeadline.getTime() - Date.now()) / (1000 * 60 * 60)) : null;

                return (
                  <TableRow key={ticket.id} className={`border-border hover:bg-muted ${ticket.sla_breach ? 'bg-red-50' : ''}`}>
                    <TableCell className="text-xs font-mono text-muted-foreground">#{ticket.id}</TableCell>
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
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ticket.status === 'open' ? (
                        ticket.sla_breach ? (
                          <Badge className="bg-red-100 text-red-700 border-red-300 text-[10px] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Breached
                          </Badge>
                        ) : hoursRemaining !== null ? (
                          <span className={`text-xs font-medium ${hoursRemaining < 4 ? 'text-red-600' : hoursRemaining < 12 ? 'text-amber-600' : 'text-green-600'}`}>
                            {hoursRemaining}h left
                          </span>
                        ) : null
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openTicketDetail(ticket.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select
                          value={ticket.status}
                          onValueChange={(v) => handleUpdateStatus(ticket.id, v)}
                        >
                          <SelectTrigger className="h-8 w-24 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-border">
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDeleteTicket(ticket.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        open={showDetail}
        onOpenChange={setShowDetail}
        ticketId={selectedTicketId}
        onTicketUpdate={fetchTickets}
      />
    </div>
  );
}