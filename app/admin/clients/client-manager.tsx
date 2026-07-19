"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  MoreVertical,
  Phone,
  RefreshCw,
} from "lucide-react";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ResponsiveDataList } from "@/components/admin/responsive-data-list";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { EditClientModal } from "./edit-client-modal";

export function ClientManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchClients();

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        () => {
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select(
          `
          *,
          amcs(*)
        `
        )
        .order("name", { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error("Client Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    (client.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setShowEditModal(true);
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Client deleted successfully");
        fetchClients();
      } else {
        toast.error(result.error || "Failed to delete client");
      }
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Failed to delete client");
    }
  };

  const statusBadge = (status?: string) => {
    if (!status) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Off-contract
        </Badge>
      );
    }
    if (status === "active") {
      return (
        <Badge variant="outline" className="border-border bg-secondary">
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-destructive/30 text-destructive">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={fetchClients} size="sm">
          <RefreshCw className={`w-3 h-3 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

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
              : "No clients match your search."
          }
          tableHeader={
            <>
              <TableHead>Client</TableHead>
              <TableHead>Hardware</TableHead>
              <TableHead>AMC</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </>
          }
          tableBody={filteredClients.map((client) => {
            const latestAMC = client.amcs?.[0];
            return (
              <TableRow key={client.id}>
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
                        {client.whatsapp || "No phone"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {latestAMC?.hardware_details?.model || "—"}
                </TableCell>
                <TableCell>{statusBadge(latestAMC?.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono">
                  {latestAMC?.expiry_date || latestAMC?.end_date
                    ? new Date(
                        latestAMC.expiry_date || latestAMC.end_date
                      ).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {client.whatsapp && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          window.open(`https://wa.me/${client.whatsapp}`, "_blank")
                        }
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
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
                            View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
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
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          mobileItems={filteredClients.map((client) => {
            const latestAMC = client.amcs?.[0];
            const expiry =
              latestAMC?.expiry_date || latestAMC?.end_date
                ? new Date(
                    latestAMC.expiry_date || latestAMC.end_date
                  ).toLocaleDateString()
                : null;
            return (
              <Item
                key={client.id}
                size="sm"
                className="rounded-none border-0 cursor-pointer hover:bg-accent/50"
                onClick={() => {
                  window.location.href = `/admin/clients/${client.id}`;
                }}
              >
                  <ItemMedia variant="icon" className="bg-secondary">
                    <span className="text-xs font-semibold">
                      {(client.name || "?").charAt(0)}
                    </span>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="w-full justify-between gap-2">
                      <span className="truncate">
                        {client.name || "Unnamed Client"}
                      </span>
                      {statusBadge(latestAMC?.status)}
                    </ItemTitle>
                    <ItemDescription>
                      {[client.whatsapp || "No phone", expiry && `Expires ${expiry}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/clients/${client.id}`}>View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditClient(client)}
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
                  </ItemActions>
              </Item>
            );
          })}
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
    </div>
  );
}
