"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
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
  UserPlus,
  Users,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Separator } from "@/components/ui/separator";
import { AmcRenewalDesk } from "@/components/admin/amc-renewal-desk";
import { toast } from "sonner";
import { fetchAssignableStaff } from "@/lib/admin/fetch-assignable-staff";
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
    productKey?: string | null;
    renewedFrom?: number | null;
    renewedTo?: number | null;
    createdAt?: string;
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

type TeamRow = {
  id: number;
  teamMemberId: number;
  role: string;
  isFocalPerson?: boolean;
  isPrimaryBackup?: boolean;
  isActive?: boolean;
  name?: string;
};

type StaffMember = { teamMemberId: number; teamMemberName: string };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "border-border bg-secondary",
    expiring: "border-amber-200 text-amber-800 bg-amber-50",
    expired: "border-destructive/30 text-destructive",
    cancelled: "text-muted-foreground",
    renewed: "border-border bg-muted text-muted-foreground",
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
  const searchParams = useSearchParams();
  const clientId = params.id ? parseInt(String(params.id), 10) : null;
  const initialTab = searchParams.get("tab") || "overview";

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(initialTab);
  const [showEdit, setShowEdit] = useState(false);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [assignStaffId, setAssignStaffId] = useState("");
  const [assignRole, setAssignRole] = useState<"focal-person" | "backup-team-member">(
    "focal-person"
  );
  const [assignBusy, setAssignBusy] = useState(false);
  const [renewAmc, setRenewAmc] = useState<{
    id: number;
    clientId: number;
    clientName?: string;
    clientWhatsapp?: string;
    clientWhatsappGroupLink?: string;
    contractNumber: string;
    startDate: string;
    endDate: string;
    amount: string;
    status: string;
    renewedTo?: number | null;
  } | null>(null);
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
      const [detailsRes, teamRes, memberList] = await Promise.all([
        fetch(`/api/clients/${clientId}/details`),
        fetch(`/api/team?view=client&clientId=${clientId}`),
        fetchAssignableStaff(),
      ]);
      const details = await detailsRes.json();
      const teamJson = await teamRes.json();

      if (details.success) setClient(details.data);
      else toast.error(details.error || "Failed to load client");

      if (teamJson.success) setTeam(teamJson.data || []);
      setStaff(memberList);
    } catch {
      toast.error("Failed to load client");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const onTabChange = (value: string) => {
    setTab(value);
    if (clientId) {
      router.replace(`/admin/clients/${clientId}?tab=${value}`, {
        scroll: false,
      });
    }
  };

  const openRenew = (amc: NonNullable<ClientDetails["amcs"]>[number]) => {
    if (!client) return;
    setRenewAmc({
      id: amc.id,
      clientId: client.id,
      clientName: client.name,
      clientWhatsapp: client.whatsapp,
      clientWhatsappGroupLink: client.whatsappGroupLink,
      contractNumber: amc.contractNumber,
      startDate: amc.startDate,
      endDate: amc.endDate,
      amount: amc.amount || "",
      status: amc.status,
      renewedTo: amc.renewedTo,
    });
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
        onTabChange("tickets");
      } else {
        toast.error(result.error || "Failed to create ticket");
      }
    } catch {
      toast.error("Failed to create ticket");
    } finally {
      setCreatingTicket(false);
    }
  };

  const assignStaff = async () => {
    if (!clientId || !assignStaffId) return;
    setAssignBusy(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign",
          clientId,
          teamMemberId: parseInt(assignStaffId, 10),
          role: assignRole,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Staff assigned");
        setAssignStaffId("");
        fetchClientDetails();
      } else {
        toast.error(result.error || "Assign failed");
      }
    } catch {
      toast.error("Assign failed");
    } finally {
      setAssignBusy(false);
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
          <Link href="/admin/clients">Back to Clients</Link>
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
      if (amc.renewedTo) {
        status = "renewed";
      } else if (status !== "cancelled") {
        if (days < 0) status = "expired";
        else if (days <= 30) status = "expiring";
        else status = "active";
      }
      return { ...amc, status, days };
    }) || [];

  const tipAmcs = liveAmcs.filter((a) => !a.renewedTo);
  const activeAmcs = tipAmcs.filter(
    (a) => a.status === "active" || a.status === "expiring"
  );
  const amcLog = [...liveAmcs].sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  );
  const contractValue = activeAmcs.reduce(
    (s, a) => s + (parseFloat(a.amount) || 0),
    0
  );
  const staffName = (id: number) =>
    staff.find((s) => s.teamMemberId === id)?.teamMemberName || `Staff #${id}`;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-1 sm:px-0">
      <AdminPageHeader
        title={client.name}
        description={
          [client.contactPerson, client.industry, client.city]
            .filter(Boolean)
            .join(" · ") || "Client hub"
        }
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Clients", href: "/admin/clients" },
          { label: client.name },
        ]}
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase text-muted-foreground">
              Live contracts
            </p>
            <p className="text-xl font-semibold">{activeAmcs.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase text-muted-foreground">
              Contract value
            </p>
            <p className="text-xl font-semibold">
              Nu. {(contractValue / 1000).toFixed(0)}k
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase text-muted-foreground">
              Open tickets
            </p>
            <p className="text-xl font-semibold">
              {client.tickets?.filter(
                (t) => t.status === "open" || t.status === "in_progress"
              ).length || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Staff</p>
            <p className="text-sm font-medium truncate mt-1">
              {team.find((t) => t.isFocalPerson || t.role === "focal-person")
                ? staffName(
                    team.find(
                      (t) => t.isFocalPerson || t.role === "focal-person"
                    )!.teamMemberId
                  )
                : "Unassigned"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={onTabChange} className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="amc">AMC</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="comms">Comms</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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
                    {[client.address, client.city, client.country]
                      .filter(Boolean)
                      .join(", ")}
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
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => onTabChange("amc")}>
              <FileText className="w-4 h-4 mr-2" />
              AMC
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange("tickets")}
            >
              <Ticket className="w-4 h-4 mr-2" />
              Tickets
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange("invoices")}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Invoices
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/admin/amc?clientId=${client.id}&from=client`}>
                Open AMC desk
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assigned staff</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {team.filter((t) => t.isActive !== false).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No staff assigned yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {team
                    .filter((t) => t.isActive !== false)
                    .map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="font-medium">
                          {staffName(t.teamMemberId)}
                        </span>
                        <Badge variant="secondary">
                          {t.isFocalPerson || t.role === "focal-person"
                            ? "Focal"
                            : t.isPrimaryBackup ||
                                t.role === "backup-team-member"
                              ? "Backup"
                              : t.role}
                        </Badge>
                      </li>
                    ))}
                </ul>
              )}
              <Separator />
              <div className="grid gap-3 sm:grid-cols-3">
                <Select value={assignStaffId} onValueChange={setAssignStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground">
                        No staff employees found. Add them under Users & Roles.
                      </div>
                    ) : (
                      staff.map((s) => (
                        <SelectItem
                          key={s.teamMemberId}
                          value={String(s.teamMemberId)}
                        >
                          {s.teamMemberName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Select
                  value={assignRole}
                  onValueChange={(v) =>
                    setAssignRole(v as "focal-person" | "backup-team-member")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="focal-person">Focal person</SelectItem>
                    <SelectItem value="backup-team-member">Backup</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={assignStaff}
                  disabled={assignBusy || !assignStaffId}
                >
                  {assignRole === "focal-person" ? (
                    <UserPlus className="w-4 h-4 mr-2" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  {assignBusy ? "Saving…" : "Assign"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amc" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Current year on top · full renewal history in the log below
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/amc?clientId=${client.id}&from=client`}>
                <Plus className="w-4 h-4 mr-1" />
                AMC desk
              </Link>
            </Button>
          </div>

          {liveAmcs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-md">
              No contracts yet
            </p>
          ) : (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Current contracts</h3>
                {tipAmcs.length === 0 ? (
                  <p className="text-sm text-muted-foreground rounded-md border px-3 py-6 text-center">
                    No live tip-of-chain contracts
                  </p>
                ) : (
                  tipAmcs.map((amc) => (
                    <div
                      key={amc.id}
                      className="flex flex-col gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-sm">
                            {amc.contractNumber}
                          </span>
                          {statusBadge(amc.status)}
                          {amc.productKey ? (
                            <Badge variant="secondary" className="text-[10px]">
                              {amc.productKey}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(amc.startDate).toLocaleDateString()} –{" "}
                          {new Date(amc.endDate).toLocaleDateString()}
                          {" · "}
                          Nu. {(parseFloat(amc.amount) || 0).toLocaleString()}
                        </p>
                      </div>
                      {amc.status !== "cancelled" && (
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
              </section>

              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">AMC log</h3>
                  <p className="text-xs text-muted-foreground">
                    Renewal chain for this client (Y01 → Y02…). Superseded years
                    stay here for history — not on the main AMC desk.
                  </p>
                </div>
                <ol className="relative space-y-0 border-l border-border ml-2">
                  {amcLog.map((amc, index) => {
                    const next = amc.renewedTo
                      ? liveAmcs.find((x) => x.id === amc.renewedTo)
                      : null;
                    const isTip = !amc.renewedTo;
                    return (
                      <li key={amc.id} className="relative pb-5 pl-5 last:pb-0">
                        <span
                          className={`absolute -left-1.5 top-1.5 size-3 rounded-full border-2 border-background ${
                            isTip
                              ? "bg-primary"
                              : amc.status === "renewed"
                                ? "bg-muted-foreground/40"
                                : "bg-muted-foreground"
                          }`}
                        />
                        <div className="rounded-md border bg-card px-3 py-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                              {amc.contractNumber}
                            </span>
                            {statusBadge(amc.status)}
                            {isTip ? (
                              <Badge className="text-[10px]">Current</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(amc.startDate).toLocaleDateString()} –{" "}
                            {new Date(amc.endDate).toLocaleDateString()}
                            {" · "}
                            Nu. {(parseFloat(amc.amount) || 0).toLocaleString()}
                          </p>
                          {next ? (
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              Renewed →{" "}
                              <span className="font-medium text-foreground">
                                {next.contractNumber}
                              </span>
                            </p>
                          ) : null}
                          {amc.renewedFrom && !next ? (
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              Continues from prior year
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            </>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowTicket(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          </div>
          {!client.tickets?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-md">
              No tickets
            </p>
          ) : (
            <div className="space-y-2">
              {client.tickets.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="w-full text-left flex items-center justify-between gap-2 rounded-md border p-3 hover:bg-muted/50 transition-colors"
                  onClick={() =>
                    router.push(
                      `/admin/tickets?ticketId=${t.id}&clientId=${client.id}&from=client`
                    )
                  }
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      #{t.id} · {t.priority}
                    </p>
                  </div>
                  {statusBadge(t.status)}
                </button>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/invoice?clientId=${client.id}&from=client`}>
                Invoice desk
              </Link>
            </Button>
          </div>
          {!client.invoices?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center border rounded-md">
              No invoices
            </p>
          ) : (
            <div className="space-y-2">
              {client.invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/admin/invoice?invoiceId=${inv.id}&clientId=${client.id}&from=client`}
                  className="flex items-center justify-between gap-2 rounded-md border p-3 text-sm transition-colors hover:bg-muted/50"
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
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comms" className="space-y-4">
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">WhatsApp & email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {client.whatsapp && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://wa.me/${client.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                )}
                {client.whatsappGroupLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={client.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
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
              </div>
              <Separator />
              {client.whatsappGroupLink ? (
                <>
                  <p className="text-xs text-muted-foreground break-all">
                    {client.whatsappGroupLink}
                  </p>
                  <Button className="w-full sm:w-auto" asChild>
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
                <p className="text-sm text-muted-foreground">
                  No group link set. Edit the client to add one.
                </p>
              )}
              <Button variant="outline" onClick={() => setShowEdit(true)}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Update group link
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      <AmcRenewalDesk
        amc={renewAmc}
        open={!!renewAmc}
        onOpenChange={(o) => !o && setRenewAmc(null)}
        onRenewed={fetchClientDetails}
      />

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
              <label className="text-xs text-muted-foreground">
                Description
              </label>
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
