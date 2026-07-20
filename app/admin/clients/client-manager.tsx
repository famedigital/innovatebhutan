"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  MoreVertical,
  Phone,
  RefreshCw,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ResponsiveDataList } from "@/components/admin/responsive-data-list";
import { toast } from "sonner";
import { EditClientModal } from "./edit-client-modal";
import { fetchAssignableStaff } from "@/lib/admin/fetch-assignable-staff";

type Ownership = {
  clientId: number;
  focal?: { employeeId: number; name: string };
  backups: Array<{ employeeId: number; name: string }>;
};

type StaffMember = {
  teamMemberId: number;
  teamMemberName: string;
};

type ClientRow = {
  id: number;
  name: string;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  active?: boolean;
  tier?: string | null;
  ownership?: Ownership;
};

export function ClientManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRole, setBulkRole] = useState<"focal-person" | "backup-team-member">(
    "focal-person"
  );
  const [bulkStaffId, setBulkStaffId] = useState<string>("");
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsRes, memberList] = await Promise.all([
        fetch("/api/clients"),
        fetchAssignableStaff(),
      ]);
      const clientsJson = await clientsRes.json();

      if (!clientsJson.success) {
        toast.error(clientsJson.error || "Failed to load clients");
        return;
      }

      const list: ClientRow[] = clientsJson.data || [];
      setStaff(memberList);
      if (memberList.length === 0) {
        toast.message("No staff employees found", {
          description:
            "Add staff under Users & Roles (with employee record) or Employees before assigning.",
        });
      }

      const ids = list.map((c) => c.id);
      let ownershipMap = new Map<number, Ownership>();
      if (ids.length > 0) {
        const ownRes = await fetch(
          `/api/team?view=ownership&clientIds=${ids.join(",")}`
        );
        const ownJson = await ownRes.json();
        if (ownJson.success && Array.isArray(ownJson.data)) {
          ownershipMap = new Map(
            ownJson.data.map((o: Ownership) => [o.clientId, o])
          );
        }
      }

      setClients(
        list.map((c) => ({
          ...c,
          ownership: ownershipMap.get(c.id) || {
            clientId: c.id,
            backups: [],
          },
        }))
      );
      setSelected(new Set());
    } catch (err) {
      console.error("Client fetch error:", err);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filteredClients = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return clients.filter((client) => {
      const matchesSearch =
        !q ||
        (client.name || "").toLowerCase().includes(q) ||
        (client.whatsapp || "").includes(q) ||
        (client.phone || "").includes(q);

      if (!matchesSearch) return false;

      if (staffFilter === "unassigned") {
        return !client.ownership?.focal;
      }
      if (staffFilter.startsWith("staff:")) {
        const id = parseInt(staffFilter.slice(6), 10);
        const o = client.ownership;
        return (
          o?.focal?.employeeId === id ||
          o?.backups?.some((b) => b.employeeId === id)
        );
      }
      return true;
    });
  }, [clients, searchTerm, staffFilter]);

  const allPageSelected =
    filteredClients.length > 0 &&
    filteredClients.every((c) => selected.has(c.id));

  const toggleAllPage = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredClients.forEach((c) => next.add(c.id));
      } else {
        filteredClients.forEach((c) => next.delete(c.id));
      }
      return next;
    });
  };

  const toggleOne = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Client deleted");
        fetchClients();
      } else {
        toast.error(result.error || "Failed to delete client");
      }
    } catch {
      toast.error("Failed to delete client");
    }
  };

  const runBulkAssign = async () => {
    if (!bulkStaffId || selected.size === 0) {
      toast.error("Select staff and clients");
      return;
    }
    setBulkBusy(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-assign",
          clientIds: Array.from(selected),
          teamMemberId: parseInt(bulkStaffId, 10),
          role: bulkRole,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || `Assigned ${result.assigned} clients`);
        setBulkOpen(false);
        setBulkStaffId("");
        fetchClients();
      } else {
        toast.error(result.error || "Bulk assign failed");
      }
    } catch {
      toast.error("Bulk assign failed");
    } finally {
      setBulkBusy(false);
    }
  };

  const runClearAssignments = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Clear staff assignments for ${selected.size} client(s)?`))
      return;
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "clear-assignments",
          clientIds: Array.from(selected),
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || "Assignments cleared");
        fetchClients();
      } else {
        toast.error(result.error || "Failed to clear");
      }
    } catch {
      toast.error("Failed to clear assignments");
    }
  };

  const ownershipChips = (o?: Ownership) => {
    if (!o?.focal && !o?.backups?.length) {
      return (
        <span className="text-xs text-muted-foreground">Unassigned</span>
      );
    }
    return (
      <div className="flex flex-wrap gap-1">
        {o.focal ? (
          <Badge variant="secondary" className="text-[10px] font-normal">
            Focal: {o.focal.name}
          </Badge>
        ) : null}
        {o.backups?.slice(0, 2).map((b) => (
          <Badge
            key={b.employeeId}
            variant="outline"
            className="text-[10px] font-normal"
          >
            {b.name}
          </Badge>
        ))}
        {(o.backups?.length || 0) > 2 ? (
          <Badge variant="outline" className="text-[10px]">
            +{o.backups!.length - 2}
          </Badge>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name or phone…"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={staffFilter} onValueChange={setStaffFilter}>
          <SelectTrigger className="w-full lg:w-56">
            <SelectValue placeholder="Staff filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            <SelectItem value="unassigned">Unassigned only</SelectItem>
            {staff.map((s) => (
              <SelectItem key={s.teamMemberId} value={`staff:${s.teamMemberId}`}>
                {s.teamMemberName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchClients} size="sm">
          <RefreshCw className={`w-3 h-3 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {selected.size > 0 ? (
        <div className="sticky top-14 z-10 flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-sm">
          <span className="text-sm font-medium">
            {selected.size} selected
          </span>
          <Button
            size="sm"
            onClick={() => {
              setBulkRole("focal-person");
              setBulkOpen(true);
            }}
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Assign focal
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setBulkRole("backup-team-member");
              setBulkOpen(true);
            }}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Assign backup
          </Button>
          <Button size="sm" variant="outline" onClick={runClearAssignments}>
            Clear assignment
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear selection
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
      ) : (
        <ResponsiveDataList
          isEmpty={filteredClients.length === 0}
          empty={
            clients.length === 0
              ? "No clients yet. Add a client to get started."
              : "No clients match your filters."
          }
          tableHeader={
            <>
              <TableHead className="w-10">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={(v) => toggleAllPage(!!v)}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </>
          }
          tableBody={filteredClients.map((client) => (
            <TableRow
              key={client.id}
              data-state={selected.has(client.id) ? "selected" : undefined}
              className="transition-colors"
            >
              <TableCell>
                <Checkbox
                  checked={selected.has(client.id)}
                  onCheckedChange={(v) => toggleOne(client.id, !!v)}
                  aria-label={`Select ${client.name}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
                    {(client.name || "?").charAt(0)}
                  </div>
                  <div>
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {client.name || "Unnamed Client"}
                    </Link>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {client.whatsapp || client.phone || "No phone"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{ownershipChips(client.ownership)}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {client.active === false ? "Inactive" : "Active"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/clients/${client.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open hub
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingClient(client);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          mobileItems={filteredClients.map((client) => (
            <Item
              key={client.id}
              size="sm"
              className="rounded-none border-0"
            >
              <div className="flex items-start gap-2 w-full py-1">
                <Checkbox
                  className="mt-2"
                  checked={selected.has(client.id)}
                  onCheckedChange={(v) => toggleOne(client.id, !!v)}
                />
                <Link
                  href={`/admin/clients/${client.id}`}
                  className="flex flex-1 min-w-0 items-start gap-2"
                >
                  <ItemMedia variant="icon" className="bg-secondary">
                    <span className="text-xs font-semibold">
                      {(client.name || "?").charAt(0)}
                    </span>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{client.name || "Unnamed"}</ItemTitle>
                    <ItemDescription>
                      {client.whatsapp || client.phone || "No phone"}
                    </ItemDescription>
                    <div className="mt-1">{ownershipChips(client.ownership)}</div>
                  </ItemContent>
                </Link>
                <ItemActions>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/clients/${client.id}`}>Open</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingClient(client);
                          setShowEditModal(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              </div>
            </Item>
          ))}
        />
      )}

      {showEditModal && editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => {
            setShowEditModal(false);
            setEditingClient(null);
          }}
          onUpdated={() => {
            fetchClients();
            setShowEditModal(false);
            setEditingClient(null);
          }}
        />
      )}

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkRole === "focal-person"
                ? "Assign focal person"
                : "Assign backup staff"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apply to {selected.size} selected client
            {selected.size === 1 ? "" : "s"}.
          </p>
          <Select value={bulkStaffId} onValueChange={setBulkStaffId}>
            <SelectTrigger>
              <SelectValue placeholder="Select staff member" />
            </SelectTrigger>
            <SelectContent>
              {staff.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  No staff in employees table. Create staff under Users & Roles
                  first.
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={runBulkAssign} disabled={bulkBusy || !bulkStaffId}>
              {bulkBusy ? "Assigning…" : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
