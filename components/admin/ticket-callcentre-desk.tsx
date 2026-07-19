"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2, Plus, RefreshCw, Search, MessageSquare, CheckCircle2, ArrowLeft,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle,
} from "@/components/ui/item";
import { ResponsiveDataList } from "@/components/admin/responsive-data-list";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { TicketDetailModal } from "@/app/admin/tickets/ticket-detail-modal";
import type { ProductKey } from "@/lib/invoices/templateDefaults";

type Queue = "all" | "mine" | "unassigned" | "started" | "in_progress" | "resolved";

type TicketRow = {
  id: number;
  subject: string;
  status: string;
  priority: string;
  clientName?: string;
  assignedName?: string;
  assignedTo?: number | null;
  productKey?: string | null;
  slaBreach?: boolean;
  createdAt?: string;
};

export function TicketCallCentreDesk({
  productKey,
  title = "Tickets",
  description = "Call-centre desk — log, assign, start, acknowledge, resolve",
}: {
  productKey?: ProductKey;
  title?: string;
  description?: string;
}) {
  const [queue, setQueue] = useState<Queue>("all");
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [returnClientId, setReturnClientId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Array<{ id: number; name: string }>>([]);
  const [staff, setStaff] = useState<Array<{ id: number; fullName: string | null }>>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    clientId: "",
    assignedTo: "",
    priority: "medium",
    description: "",
    startAndNotify: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (queue !== "all") params.set("queue", queue);
      if (productKey) params.set("productKey", productKey);
      if (search) params.set("search", search);
      if (clientFilter) params.set("clientId", clientFilter);
      const res = await fetch(`/api/tickets?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed");
      setTickets(data.data || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [queue, productKey, search, clientFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("clientId");
    if (cid) {
      setClientFilter(cid);
      setForm((f) => ({ ...f, clientId: cid }));
    }
    if (params.get("from") === "client" && cid) {
      setReturnClientId(cid);
    }
    const scope = params.get("scope");
    if (scope === "mine") setQueue("mine");
    const tid = params.get("ticketId");
    if (tid) {
      const id = parseInt(tid);
      if (!isNaN(id)) {
        setSelectedId(id);
        setShowDetail(true);
      }
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const [c, s] = await Promise.all([
          fetch("/api/clients?limit=200").then((r) => r.json()),
          fetch("/api/profiles?role=ADMIN,STAFF").then((r) => r.json()),
        ]);
        if (c.success) setClients(c.data || c.clients || []);
        if (s.success) setStaff(s.data || []);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const createTicket = async () => {
    if (!form.subject || !form.clientId) {
      toast.error("Subject and client required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject,
          clientId: parseInt(form.clientId),
          assignedTo: form.assignedTo ? parseInt(form.assignedTo) : undefined,
          priority: form.priority,
          description: form.description || undefined,
          productKey: productKey || "rancelab",
          source: "call_centre",
          startAndNotify: form.startAndNotify && !!form.assignedTo,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");

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
          toast.success("Ticket started — paste message in WhatsApp group");
        } else {
          toast.success("Ticket started — group message copied (no group link on client)");
        }
      } else {
        toast.success("Ticket created");
      }
      setShowCreate(false);
      setForm({
        subject: "",
        clientId: "",
        assignedTo: "",
        priority: "medium",
        description: "",
        startAndNotify: true,
      });
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  const runAction = async (id: number, action: "start" | "acknowledge" | "resolve") => {
    try {
      const res = await fetch(`/api/tickets/${id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
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
        toast.success(
          action === "resolve"
            ? "Resolved — paste resolve message in WhatsApp group"
            : "Started — paste message in WhatsApp group"
        );
      } else {
        toast.success(
          action === "acknowledge" ? "Acknowledged — On process" : "Updated"
        );
      }
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  const statusLabel = (s: string) => s.replace(/_/g, " ");

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={title}
        description={
          clientFilter
            ? `${description} · filtered to client #${clientFilter}`
            : description
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          ...(returnClientId
            ? [
                { label: "Clients", href: "/admin/clients" },
                {
                  label: "Client",
                  href: `/admin/clients/${returnClientId}?tab=tickets`,
                },
              ]
            : []),
          { label: "Tickets" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            {returnClientId ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/clients/${returnClientId}?tab=tickets`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to client
                </Link>
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Log ticket
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={queue} onValueChange={(v) => setQueue(v as Queue)}>
          <SelectTrigger className="h-9 w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="mine">My tickets</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="started">Started (awaiting ack)</SelectItem>
            <SelectItem value="in_progress">On process</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveDataList
        isEmpty={!loading && tickets.length === 0}
        empty={
          <div className="flex flex-col items-center py-8 text-muted-foreground">
            <MessageSquare className="mb-2 h-8 w-8 opacity-50" />
            No tickets in this queue
          </div>
        }
        tableHeader={
          <>
            <TableHead>ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Actions</TableHead>
          </>
        }
        tableBody={
          loading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">#{t.id}</TableCell>
                <TableCell className="font-medium">{t.subject}</TableCell>
                <TableCell>{t.clientName || "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {statusLabel(t.status)}
                  </Badge>
                </TableCell>
                <TableCell>{t.assignedName || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedId(t.id);
                        setShowDetail(true);
                      }}
                    >
                      Open
                    </Button>
                    {t.status === "open" && t.assignedTo ? (
                      <Button size="sm" variant="outline" onClick={() => runAction(t.id, "start")}>
                        Start
                      </Button>
                    ) : null}
                    {t.status === "started" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runAction(t.id, "acknowledge")}
                      >
                        Ack
                      </Button>
                    ) : null}
                    {t.status === "in_progress" ? (
                      <Button
                        size="sm"
                        onClick={() => runAction(t.id, "resolve")}
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Resolve
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )
        }
        mobileItems={tickets.map((t) => (
          <Item
            key={t.id}
            size="sm"
            className="flex-nowrap rounded-none border-0 cursor-pointer"
            onClick={() => {
              setSelectedId(t.id);
              setShowDetail(true);
            }}
          >
            <ItemMedia variant="icon" className="bg-secondary">
              <span className="text-xs font-semibold">
                {(t.clientName || "?").charAt(0)}
              </span>
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle className="w-full justify-between gap-2">
                <span className="truncate">{t.subject}</span>
                <Badge variant="secondary" className="shrink-0 text-[10px] capitalize">
                  {statusLabel(t.status)}
                </Badge>
              </ItemTitle>
              <ItemDescription className="truncate">
                #{t.id} · {t.clientName || "No client"} · {t.priority}
              </ItemDescription>
            </ItemContent>
            <ItemActions className="shrink-0" onClick={(e) => e.stopPropagation()}>
              {t.status === "started" ? (
                <Button size="sm" variant="outline" onClick={() => runAction(t.id, "acknowledge")}>
                  Ack
                </Button>
              ) : t.status === "in_progress" ? (
                <Button size="sm" onClick={() => runAction(t.id, "resolve")}>
                  Done
                </Button>
              ) : null}
            </ItemActions>
          </Item>
        ))}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Subject *</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Client *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Assign staff</Label>
              <Select
                value={form.assignedTo || "none"}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    assignedTo: v === "none" ? "" : v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.fullName || `Staff #${s.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
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
            <div className="space-y-1.5">
              <Label className="text-xs">Complaint / notes</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={form.startAndNotify}
                onChange={(e) =>
                  setForm((p) => ({ ...p, startAndNotify: e.target.checked }))
                }
              />
              Start now & open WhatsApp group notify (needs assignee)
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={createTicket} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TicketDetailModal
        open={showDetail}
        onOpenChange={setShowDetail}
        ticketId={selectedId}
        onTicketUpdate={() => void load()}
      />
    </div>
  );
}
