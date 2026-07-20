"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Plus, Eye, Trash2, X, MessageSquare, AlertTriangle, Clock } from "lucide-react";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle,
} from "@/components/ui/item";
import { ResponsiveDataList } from "@/components/admin/responsive-data-list";
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
  const [newTicket, setNewTicket] = useState({
    subject: "",
    clientId: "",
    priority: "medium",
    description: "",
    assignedTo: "",
    billable: false,
  });
  const [clientSearch, setClientSearch] = useState("");
  const [staff, setStaff] = useState<Array<{ id: number; fullName: string | null }>>([]);

  useEffect(() => {
    fetchTickets();
    fetchClients();
    fetchStaff();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get("ticketId");
    if (tid) {
      const id = parseInt(tid);
      if (!isNaN(id)) {
        setSelectedTicketId(id);
        setShowDetail(true);
      }
    }
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/profiles?role=ADMIN,STAFF");
      const result = await response.json();
      if (result.success) setStaff(result.data || []);
    } catch {
      /* ignore */
    }
  };

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
        assignedTo: newTicket.assignedTo
          ? parseInt(newTicket.assignedTo)
          : undefined,
        billable: newTicket.billable || undefined,
      }),
    });
    const result = await response.json();

    if (!result.success) {
      toast.error(result.error || "Failed to create ticket");
    } else {
      toast.success("Ticket created");
      setShowCreate(false);
      setNewTicket({
        subject: "",
        clientId: "",
        priority: "medium",
        description: "",
        assignedTo: "",
        billable: false,
      });
      setClientSearch("");
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

      {/* Filters — stack on mobile */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets or clients..."
              className="pl-9 w-full h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <Button onClick={fetchTickets} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowCreate(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create Modal — bottom sheet on mobile, scrollable body */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative bg-background rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[92dvh] flex flex-col border">
            <div className="flex items-center justify-between p-4 border-b shrink-0">
              <h3 className="font-semibold text-lg">Create New Ticket</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto overscroll-contain min-h-0 flex-1">
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-9 mb-2 h-9"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                </div>
                <Select
                  value={newTicket.clientId}
                  onValueChange={(v) => setNewTicket({ ...newTicket, clientId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {clients
                      .filter((c) =>
                        !clientSearch ||
                        (c.name || "")
                          .toLowerCase()
                          .includes(clientSearch.toLowerCase())
                      )
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Assign to</label>
                <Select
                  value={newTicket.assignedTo || "unassigned"}
                  onValueChange={(v) =>
                    setNewTicket({
                      ...newTicket,
                      assignedTo: v === "unassigned" ? "" : v,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.fullName || `Staff #${s.id}`}
                      </SelectItem>
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

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newTicket.billable}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, billable: e.target.checked })
                  }
                />
                Billable (non-AMC / chargeable support)
              </label>

            </div>

            <div className="flex gap-2 p-4 border-t shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreateTicket}>
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

      <ResponsiveDataList
        isEmpty={!loading && filteredTickets.length === 0}
        empty={
          <div className="flex flex-col items-center">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p>No tickets found</p>
          </div>
        }
        tableHeader={
          <>
            <TableHead className="text-xs text-muted-foreground">ID</TableHead>
            <TableHead className="text-xs text-muted-foreground">Subject</TableHead>
            <TableHead className="text-xs text-muted-foreground">Client</TableHead>
            <TableHead className="text-xs text-muted-foreground">Priority</TableHead>
            <TableHead className="text-xs text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs text-muted-foreground">SLA</TableHead>
            <TableHead className="text-xs text-muted-foreground">Created</TableHead>
            <TableHead className="text-xs text-muted-foreground">Actions</TableHead>
          </>
        }
        tableBody={
          loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            filteredTickets.map((ticket) => {
              const slaDeadline = ticket.sla_deadline
                ? new Date(ticket.sla_deadline)
                : null;
              const hoursRemaining = slaDeadline
                ? Math.round(
                    (slaDeadline.getTime() - Date.now()) / (1000 * 60 * 60)
                  )
                : null;

              return (
                <TableRow
                  key={ticket.id}
                  className={ticket.sla_breach ? "bg-destructive/5" : undefined}
                >
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    #{ticket.id}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {ticket.subject}
                  </TableCell>
                  <TableCell className="text-sm">
                    {ticket.clients?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] px-2">
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] px-2">
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.status === "open" ? (
                      ticket.sla_breach ? (
                        <Badge
                          variant="outline"
                          className="border-destructive/30 text-destructive text-[10px] flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Breached
                        </Badge>
                      ) : hoursRemaining !== null ? (
                        <span className="text-xs font-medium text-muted-foreground">
                          {hoursRemaining}h left
                        </span>
                      ) : null
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {ticket.created_at
                      ? new Date(ticket.created_at).toLocaleDateString()
                      : "-"}
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
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteTicket(ticket.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )
        }
        mobileItems={filteredTickets.map((ticket) => {
          const clientLabel =
            ticket.clients?.name || ticket.clientName || "No client";
          return (
            <Item
              key={ticket.id}
              size="sm"
              className="flex-nowrap rounded-none border-0 cursor-pointer hover:bg-accent/50 active:bg-accent"
              onClick={() => openTicketDetail(ticket.id)}
            >
              <ItemMedia variant="icon" className="bg-secondary shrink-0">
                <span className="text-xs font-semibold">
                  {clientLabel.charAt(0).toUpperCase()}
                </span>
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="w-full max-w-full justify-between gap-2">
                  <span className="truncate min-w-0">{ticket.subject}</span>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-[10px] capitalize"
                  >
                    {String(ticket.status || "").replace("_", " ")}
                  </Badge>
                </ItemTitle>
                <ItemDescription className="truncate">
                  #{ticket.id} · {clientLabel} · {ticket.priority}
                  {ticket.sla_breach ? " · SLA breached" : ""}
                </ItemDescription>
              </ItemContent>
              <ItemActions
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Open ticket"
                  onClick={() => openTicketDetail(ticket.id)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </ItemActions>
            </Item>
          );
        })}
      />

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