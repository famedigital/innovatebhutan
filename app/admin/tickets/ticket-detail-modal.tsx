"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Send, Clock, AlertCircle, CheckCircle2,
  User, Calendar, Tag, X, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_id: string;
  sender_name?: string;
  message: string;
  is_system: boolean;
  created_at: string;
}

interface Ticket {
  id: number;
  client_id: number;
  client_name?: string;
  client_whatsapp?: string | null;
  client_whatsapp_group?: string | null;
  subject: string;
  description: string;
  status: 'open' | 'started' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: number;
  assigned_name?: string;
  created_at: string;
  updated_at: string;
  sla_breach?: boolean;
}

interface TicketDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: number | null;
  onTicketUpdate?: () => void;
}

const PRIORITY_SLA_HOURS: Record<string, number> = {
  high: 4,
  medium: 24,
  low: 72,
};

export function TicketDetailModal({ open, onOpenChange, ticketId, onTicketUpdate }: TicketDetailModalProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [staff, setStaff] = useState<Array<{ id: number; fullName: string | null }>>([]);
  const [followUpNote, setFollowUpNote] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && ticketId) {
      fetchTicketDetails();
      fetchMessages();
      fetchStaff();
    }
  }, [open, ticketId]);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/profiles?role=ADMIN,STAFF");
      const result = await response.json();
      if (result.success) setStaff(result.data || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTicketDetails = async () => {
    if (!ticketId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`);
      const result = await response.json();
      if (result.success && result.data) {
        const data = result.data;
        setTicket({
          id: data.id,
          client_id: data.clientId,
          client_name: data.clientName,
          client_whatsapp: data.clientWhatsapp,
          client_whatsapp_group: data.clientWhatsappGroupLink,
          subject: data.subject,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assigned_to: data.assignedTo,
          assigned_name: data.assignedName,
          created_at: data.createdAt,
          updated_at: data.updatedAt,
          sla_breach: data.slaBreach,
        });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!ticketId) return;

    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`);
      const result = await response.json();
      const messagesWithNames = (result.data || []).map((msg: any) => ({
        id: msg.id,
        ticket_id: msg.ticketId,
        sender_id: String(msg.senderId),
        sender_name: msg.senderName || "Unknown",
        message: msg.message,
        is_system: false,
        created_at: msg.createdAt,
      }));
      setMessages(messagesWithNames);
    } catch (err) {
      console.error("Messages fetch error:", err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !ticketId) return;

    setSending(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed");

      setNewMessage("");
      fetchMessages();

      if (ticket?.status === "closed") {
        await updateStatus("open");
      }
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!ticketId) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed");

      toast.success(`Status updated to ${newStatus}`);
      fetchTicketDetails();
      onTicketUpdate?.();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const updateAssignee = async (assignedTo: string) => {
    if (!ticketId) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedTo: assignedTo === "unassigned" ? null : parseInt(assignedTo),
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed");
      toast.success("Assignee updated");
      fetchTicketDetails();
      onTicketUpdate?.();
    } catch {
      toast.error("Failed to assign");
    } finally {
      setUpdating(false);
    }
  };

  const postFollowUp = async () => {
    if (!ticketId || !followUpNote.trim()) {
      toast.error("Add a follow-up note");
      return;
    }
    setSending(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Follow-up: ${followUpNote.trim()}`,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed");
      setFollowUpNote("");
      toast.success("Follow-up logged");
      fetchMessages();
      if (ticket?.status === "open") await updateStatus("in_progress");
    } catch {
      toast.error("Failed to log follow-up");
    } finally {
      setSending(false);
    }
  };

  const updatePriority = async (newPriority: string) => {
    if (!ticketId) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed");

      toast.success(`Priority updated to ${newPriority}`);
      fetchTicketDetails();
      onTicketUpdate?.();
    } catch (err) {
      toast.error("Failed to update priority");
    } finally {
      setUpdating(false);
    }
  };

  const getSlaInfo = () => {
    if (!ticket) return null;

    const createdAt = new Date(ticket.created_at);
    const slaHours = PRIORITY_SLA_HOURS[ticket.priority] || 24;
    const slaDeadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
    const now = new Date();
    const hoursUntilDeadline = (slaDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    return {
      deadline: slaDeadline,
      hoursRemaining: Math.round(hoursUntilDeadline),
      isBreached: hoursUntilDeadline < 0
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-50 text-green-600 border-green-200';
      case 'started': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'closed': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-600 border-blue-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const slaInfo = ticket ? getSlaInfo() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="!flex !flex-col gap-0 overflow-hidden p-0
          w-[calc(100%-0.75rem)] sm:w-full max-w-3xl
          h-[min(94dvh,920px)] max-h-[94dvh]
          top-[3dvh] translate-y-0 sm:top-[50%] sm:translate-y-[-50%]
          rounded-xl"
      >
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
          </div>
        ) : ticket ? (
          <>
            <DialogHeader className="shrink-0 space-y-3 border-b px-4 pb-3 pt-4 pr-12 text-left sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-base sm:text-lg leading-snug break-words">
                      {ticket.subject}
                    </DialogTitle>
                    <Badge className={`${getPriorityColor(ticket.priority)} text-[10px] shrink-0`}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(ticket.status)} text-[10px] shrink-0 capitalize`}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <DialogDescription className="sr-only">
                    Ticket #{ticket.id} for {ticket.client_name || "client"}
                  </DialogDescription>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{ticket.client_name || "Unknown Client"}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                    {ticket.assigned_name ? (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-3 w-3 shrink-0" />
                        {ticket.assigned_name}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Assign staff</p>
                  <Select
                    value={ticket.assigned_to ? String(ticket.assigned_to) : "unassigned"}
                    onValueChange={updateAssignee}
                    disabled={updating}
                  >
                    <SelectTrigger className="h-9">
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
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Priority</p>
                  <Select
                    value={ticket.priority}
                    onValueChange={updatePriority}
                    disabled={updating}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {(ticket.status === "started" || ticket.status === "open") && (
                  <Button
                    size="sm"
                    className="min-h-10"
                    disabled={updating}
                    onClick={async () => {
                      setUpdating(true);
                      try {
                        const res = await fetch(`/api/tickets/${ticketId}/actions`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "acknowledge" }),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) throw new Error(data.error);
                        toast.success("Acknowledged — On process");
                        fetchTicketDetails();
                        onTicketUpdate?.();
                      } catch (e: unknown) {
                        toast.error(e instanceof Error ? e.message : "Failed");
                      } finally {
                        setUpdating(false);
                      }
                    }}
                  >
                    Acknowledge → On process
                  </Button>
                )}
                {ticket.status === "in_progress" && (
                  <Button
                    size="sm"
                    className="min-h-10"
                    disabled={updating}
                    onClick={async () => {
                      setUpdating(true);
                      try {
                        const res = await fetch(`/api/tickets/${ticketId}/actions`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "resolve" }),
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) throw new Error(data.error);
                        const notify = data.data?.notify;
                        if (notify?.text) {
                          try {
                            await navigator.clipboard.writeText(notify.text);
                          } catch {
                            /* ignore */
                          }
                          if (notify.whatsappUrl || notify.groupLink) {
                            window.open(
                              notify.whatsappUrl || notify.groupLink,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          }
                          toast.success("Resolved — paste message in WhatsApp group");
                        } else {
                          toast.success("Resolved");
                        }
                        fetchTicketDetails();
                        onTicketUpdate?.();
                      } catch (e: unknown) {
                        toast.error(e instanceof Error ? e.message : "Failed");
                      } finally {
                        setUpdating(false);
                      }
                    }}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark resolved + notify group
                  </Button>
                )}
              </div>

              {(ticket.client_whatsapp_group || ticket.client_whatsapp) && (
                <div className="flex flex-wrap gap-2">
                  {ticket.client_whatsapp_group && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={ticket.client_whatsapp_group}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp group
                      </a>
                    </Button>
                  )}
                  {ticket.client_whatsapp && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`https://wa.me/${ticket.client_whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Message client
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {slaInfo && (ticket.status === "open" || ticket.status === "started") && (
                <Card
                  className={
                    slaInfo.isBreached
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                  }
                >
                  <CardContent className="flex flex-col gap-1 p-2 sm:flex-row sm:items-center sm:gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {slaInfo.isBreached ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 shrink-0 text-blue-600" />
                      )}
                      <span className="text-xs font-medium">
                        {slaInfo.isBreached
                          ? `SLA breached — overdue by ${Math.abs(slaInfo.hoursRemaining)}h`
                          : `${slaInfo.hoursRemaining}h until SLA deadline`}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground sm:ml-auto">
                      {slaInfo.deadline.toLocaleString()}
                    </span>
                  </CardContent>
                </Card>
              )}
            </DialogHeader>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
                {messages.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_system ? "justify-center" : "justify-start"}`}
                    >
                      {msg.is_system ? (
                        <div className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                          {msg.message}
                        </div>
                      ) : (
                        <div className="max-w-[90%] sm:max-w-[80%]">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium">{msg.sender_name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="rounded-lg bg-muted p-3">
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0 space-y-3 border-t p-3 sm:p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Log a follow-up note…"
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    className="h-9 min-w-0 flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={postFollowUp}
                    disabled={sending || !followUpNote.trim()}
                  >
                    Follow-up
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="min-h-[56px] flex-1 resize-none"
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="shrink-0 self-end"
                    size="icon"
                    aria-label="Send message"
                  >
                    {sending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="shrink-0 border-t px-3 py-3 sm:px-6 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="shrink-0 text-xs text-muted-foreground">Status</span>
                  <Select
                    value={ticket.status}
                    onValueChange={updateStatus}
                    disabled={updating}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="started">Started</SelectItem>
                      <SelectItem value="in_progress">On process</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  className="w-full sm:ml-auto sm:w-auto"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center py-16">
            <p className="text-muted-foreground">No ticket selected</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
