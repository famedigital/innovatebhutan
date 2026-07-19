"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Send, Clock, AlertCircle, CheckCircle2,
  User, Calendar, Tag, Paperclip, X, RefreshCw
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
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
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
      case 'in_progress': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'resolved': return 'bg-amber-50 text-amber-600 border-amber-200';
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
      <DialogContent className="bg-white border-[#E5E5E1] max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
          </div>
        ) : ticket ? (
          <>
            <DialogHeader className="pb-4 border-b border-[#E5E5E1]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <DialogTitle className="text-lg">{ticket.subject}</DialogTitle>
                    <Badge className={`${getPriorityColor(ticket.priority)} text-[10px]`}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <DialogDescription className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {ticket.client_name || 'Unknown Client'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(ticket.created_at).toLocaleString()}
                    </span>
                    {ticket.assigned_name && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {ticket.assigned_name}
                      </span>
                    )}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(ticket.status)} text-[10px]`}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
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

              {(ticket.client_whatsapp_group || ticket.client_whatsapp) && (
                <div className="mt-3 flex flex-wrap gap-2">
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

              {/* SLA Warning */}
              {slaInfo && ticket.status === 'open' && (
                <Card className={`mt-3 ${slaInfo.isBreached ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                  <CardContent className="p-2 flex items-center gap-2">
                    {slaInfo.isBreached ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-xs font-medium">
                      {slaInfo.isBreached
                        ? `SLA Breached! Overdue by ${Math.abs(slaInfo.hoursRemaining)} hours`
                        : `${slaInfo.hoursRemaining} hours remaining until SLA deadline`}
                    </span>
                    <span className="text-[10px] text-[#717171] ml-auto">
                      Deadline: {slaInfo.deadline.toLocaleString()}
                    </span>
                  </CardContent>
                </Card>
              )}
            </DialogHeader>

            <div className="flex-1 overflow-auto flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-[#717171] py-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_system ? 'justify-center' : 'justify-start'}`}
                    >
                      {msg.is_system ? (
                        <div className="bg-[#F3F3F1] px-3 py-1 rounded-full text-xs text-[#717171]">
                          {msg.message}
                        </div>
                      ) : (
                        <div className="max-w-[80%]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{msg.sender_name}</span>
                            <span className="text-[10px] text-[#717171]">
                              {new Date(msg.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-[#F3F3F1] rounded-lg p-3">
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Follow-up + reply */}
              <div className="p-4 border-t space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Log a follow-up note…"
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    className="flex-1 h-9"
                  />
                  <Button
                    variant="outline"
                    size="sm"
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
                    className="flex-1 min-h-[60px] resize-none"
                    disabled={sending}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="self-end"
                  >
                    {sending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-[#E5E5E1]">
              <div className="flex items-center gap-3 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#717171]">Status:</span>
                  <Select
                    value={ticket.status}
                    onValueChange={updateStatus}
                    disabled={updating}
                  >
                    <SelectTrigger className="h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#717171]">Priority:</span>
                  <Select
                    value={ticket.priority}
                    onValueChange={updatePriority}
                    disabled={updating}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="ml-auto">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[#717171]">No ticket selected</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
