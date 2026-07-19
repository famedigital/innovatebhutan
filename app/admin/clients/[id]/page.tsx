"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Ticket,
  Wifi,
  Calendar,
  Edit,
  Plus,
  RotateCcw,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { EditClientModal } from "../edit-client-modal";

interface ClientDetails {
  id: number;
  name: string;
  active: boolean;
  contactPerson?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  whatsappGroupId?: string;
  whatsappGroupLink?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  notes?: string;
  amcs?: Array<{
    id: number;
    contractNumber: string;
    startDate: string;
    endDate: string;
    amount: string;
    status: string;
    renewedTo?: number | null;
  }>;
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

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "border-border bg-secondary",
    expiring: "border-amber-200 text-amber-800 bg-amber-50",
    expired: "border-destructive/30 text-destructive",
    cancelled: "text-muted-foreground",
    paid: "border-border bg-secondary",
    open: "border-border bg-secondary",
    in_progress: "border-amber-200 text-amber-800",
    resolved: "text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={map[status] || ""}>
      {status?.replace("_", " ")}
    </Badge>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id ? parseInt(String(params.id)) : null;

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [renewAmc, setRenewAmc] = useState<{
    id: number;
    contractNumber: string;
    endDate: string;
    amount: string;
  } | null>(null);
  const [renewing, setRenewing] = useState(false);
  const [renewForm, setRenewForm] = useState({
    startDate: "",
    endDate: "",
    amount: "",
    notes: "",
  });
  const [showTicket, setShowTicket] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    priority: "medium",
  });

  const fetchClientDetails = async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/clients/${clientId}/details`);
      const data = await response.json();
      if (data.success) setClient(data.data);
      else toast.error(data.error || "Failed to load client");
    } catch {
      toast.error("Failed to load client");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const openRenew = (amc: NonNullable<ClientDetails["amcs"]>[number]) => {
    const start = new Date(amc.endDate);
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    setRenewForm({
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      amount: amc.amount || "",
      notes: `Renewal of ${amc.contractNumber}`,
    });
    setRenewAmc(amc);
  };

  const submitRenew = async () => {
    if (!renewAmc) return;
    setRenewing(true);
    try {
      const res = await fetch(`/api/amc/${renewAmc.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: renewForm.startDate,
          endDate: renewForm.endDate,
          amount: renewForm.amount,
          copyHardwareDetails: true,
          copyServicesIncluded: true,
          notes: renewForm.notes,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Contract renewed — draft invoice created");
        setRenewAmc(null);
        fetchClientDetails();
      } else {
        toast.error(result.error || "Renewal failed");
      }
    } catch {
      toast.error("Renewal failed");
    } finally {
      setRenewing(false);
    }
  };

  const submitTicket = async () => {
    if (!clientId || !ticketForm.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    setCreatingTicket(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          subject: ticketForm.subject,
          description: ticketForm.description,
          priority: ticketForm.priority,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Ticket created");
        setShowTicket(false);
        setTicketForm({ subject: "", description: "", priority: "medium" });
        fetchClientDetails();
      } else {
        toast.error(result.error || "Failed to create ticket");
      }
    } catch {
      toast.error("Failed to create ticket");
    } finally {
      setCreatingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Loading client…
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-muted-foreground">Client not found</p>
        <Button variant="outline" asChild>
          <Link href="/admin/clients">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Link>
        </Button>
      </div>
    );
  }

  const liveAmcs =
    client.amcs?.map((amc) => {
      const end = new Date(amc.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
      let status = amc.status;
      if (status !== "cancelled" && !amc.renewedTo) {
        if (days < 0) status = "expired";
        else if (days <= 30) status = "expiring";
        else status = "active";
      }
      return { ...amc, status, days };
    }) || [];

  const activeAmcs = liveAmcs.filter((a) => a.status === "active" || a.status === "expiring");
  const contractValue = activeAmcs.reduce((s, a) => s + (parseFloat(a.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" asChild>
          <Link href="/admin/clients">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <AdminPageHeader
          className="flex-1"
          title={client.name}
          description={[client.contactPerson, client.industry, client.city]
            .filter(Boolean)
            .join(" · ") || "Client profile"}
          actions={
            <>
              <Badge variant="outline">
                {client.active ? "Active" : "Inactive"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button size="sm" onClick={() => setShowTicket(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New ticket
              </Button>
            </>
          }
        />
      </div>

      {/* Tools */}
      <div className="flex flex-wrap gap-2">
        {client.whatsapp && (
          <Button variant="outline" size="sm" asChild>
            <a href={`https://wa.me/${client.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <Phone className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>
        )}
        {client.whatsappGroupLink && (
          <Button variant="outline" size="sm" asChild>
            <a href={client.whatsappGroupLink} target="_blank" rel="noopener noreferrer">
              <Wifi className="w-4 h-4 mr-2" />
              Group chat
            </a>
          </Button>
        )}
        {client.email && (
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${client.email}`}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/amc?clientId=${client.id}`}>
            <FileText className="w-4 h-4 mr-2" />
            AMC desk
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/tickets?clientId=${client.id}`}>
            <Ticket className="w-4 h-4 mr-2" />
            Tickets
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/invoice?clientId=${client.id}`}>
            <DollarSign className="w-4 h-4 mr-2" />
            Invoices
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Live contracts</p>
            <p className="text-xl font-semibold">{activeAmcs.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Contract value</p>
            <p className="text-xl font-semibold">Nu. {(contractValue / 1000).toFixed(0)}k</p>
          </CardContent>
        </Card>
        <Card className="shadow-none col-span-2 sm:col-span-1">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Open tickets</p>
            <p className="text-xl font-semibold">
              {client.tickets?.filter((t) => t.status === "open" || t.status === "in_progress").length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Person</p>
                <p className="font-medium">{client.contactPerson || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{client.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium break-all">{client.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{client.whatsapp || "—"}</p>
              </div>
              {(client.address || client.city) && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </p>
                  <p className="font-medium">
                    {[client.address, client.city, client.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
              {client.notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-muted-foreground">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">AMC contracts</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/amc">
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {liveAmcs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No contracts yet</p>
              ) : (
                liveAmcs.map((amc) => (
                  <div
                    key={amc.id}
                    className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm">{amc.contractNumber}</span>
                        {statusBadge(amc.status)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Ends {new Date(amc.endDate).toLocaleDateString()}
                        {" · "}
                        Nu. {(parseFloat(amc.amount) || 0).toLocaleString()}
                      </p>
                    </div>
                    {amc.status !== "cancelled" && !amc.renewedTo && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => openRenew(amc)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Renew
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Support tickets</CardTitle>
              <Button size="sm" onClick={() => setShowTicket(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {!client.tickets?.length ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No tickets</p>
              ) : (
                client.tickets.slice(0, 8).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="w-full text-left flex items-center justify-between gap-2 rounded-md border p-3 hover:bg-accent/40"
                    onClick={() => router.push(`/admin/tickets?ticketId=${t.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        #{t.id} · {t.priority}
                      </p>
                    </div>
                    {statusBadge(t.status)}
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent invoices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!client.invoices?.length ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No invoices</p>
              ) : (
                client.invoices.slice(0, 6).map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{inv.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(inv.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Nu. {(parseFloat(inv.total) || 0).toLocaleString()}
                      </p>
                      {statusBadge(inv.status)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">WhatsApp group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {client.whatsappGroupLink ? (
                <>
                  <p className="text-muted-foreground break-all text-xs">
                    {client.whatsappGroupLink}
                  </p>
                  <Button className="w-full" asChild>
                    <a
                      href={client.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open group
                    </a>
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No group link set. Edit the client to add one.
                </p>
              )}
              <Separator />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowEdit(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Update group link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {showEdit && (
        <EditClientModal
          client={client}
          onClose={() => setShowEdit(false)}
          onUpdated={() => {
            setShowEdit(false);
            fetchClientDetails();
          }}
        />
      )}

      <Dialog open={!!renewAmc} onOpenChange={(o) => !o && setRenewAmc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renew {renewAmc?.contractNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Start date</label>
              <Input
                type="date"
                value={renewForm.startDate}
                onChange={(e) =>
                  setRenewForm({ ...renewForm, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">End date</label>
              <Input
                type="date"
                value={renewForm.endDate}
                onChange={(e) =>
                  setRenewForm({ ...renewForm, endDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amount (Nu.)</label>
              <Input
                value={renewForm.amount}
                onChange={(e) =>
                  setRenewForm({ ...renewForm, amount: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes</label>
              <Textarea
                value={renewForm.notes}
                onChange={(e) =>
                  setRenewForm({ ...renewForm, notes: e.target.value })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Renewing creates a new contract and a draft invoice for the amount.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewAmc(null)}>
              Cancel
            </Button>
            <Button onClick={submitRenew} disabled={renewing}>
              {renewing ? "Renewing…" : "Renew & invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTicket} onOpenChange={setShowTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New ticket — {client.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Subject</label>
              <Input
                value={ticketForm.subject}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, subject: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Priority</label>
              <Select
                value={ticketForm.priority}
                onValueChange={(v) =>
                  setTicketForm({ ...ticketForm, priority: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Description</label>
              <Textarea
                value={ticketForm.description}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicket(false)}>
              Cancel
            </Button>
            <Button onClick={submitTicket} disabled={creatingTicket}>
              {creatingTicket ? "Creating…" : "Create ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
