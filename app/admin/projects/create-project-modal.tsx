"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CreateClientModal, ClientData } from "@/app/admin/clients/create-client-modal";
import { useUserProfile } from "@/hooks/use-user-profile";
import { PRODUCT_OPTIONS } from "@/lib/projects/statusUi";

export function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { canSeeMoney } = useUserProfile();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clients, setClients] = useState<Array<{ id: number; name: string }>>([]);
  const [services, setServices] = useState<Array<{ id: number; name: string }>>([]);
  const [leads, setLeads] = useState<Array<{ id: string; name: string }>>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientId: "",
    serviceId: "",
    leadId: "",
    startDate: "",
    endDate: "",
    productKey: "rancelab",
    quotedAmount: "",
    advancePercent: "40",
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setInitializing(true);
        setFetchError(null);

        const [clientsRes, servicesRes, leadsRes] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/services"),
          fetch("/api/profiles?role=ADMIN,STAFF"),
        ]);

        const [clientsResult, servicesResult, leadsResult] = await Promise.all([
          clientsRes.json(),
          servicesRes.json(),
          leadsRes.json(),
        ]);

        if (clientsResult.success) {
          setClients(clientsResult.data || []);
        }
        if (servicesResult.success) {
          setServices(servicesResult.data || []);
        }
        if (leadsResult.success) {
          setLeads(
            leadsResult.data?.map((p: any) => ({
              id: p.userId,
              name: p.fullName || p.userId,
            })) || []
          );
        }

        if (!clientsResult.success && !servicesResult.success && !leadsResult.success) {
          setFetchError("Failed to load required data. Please refresh and try again.");
        }
      } catch (err) {
        console.error("[CreateProjectModal] Initialization error:", err);
        setFetchError("Network error: Could not load required data.");
      } finally {
        setInitializing(false);
      }
    };

    initializeData();
  }, []);

  const handleClientCreated = (client: ClientData) => {
    setClients([...clients, { id: client.id!, name: client.name }]);
    setFormData({ ...formData, clientId: client.id!.toString() });
    setShowAddClient(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.clientId || !formData.productKey) {
      toast.error("Name, client, and product are required");
      return;
    }

    if (canSeeMoney && !formData.quotedAmount) {
      toast.error("Quoted amount is required (or leave blank only if you cannot see money)");
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        clientId: parseInt(formData.clientId, 10),
        productKey: formData.productKey,
        createInvoice: true,
      };

      if (formData.description) payload.description = formData.description;
      if (formData.serviceId) payload.serviceId = parseInt(formData.serviceId, 10);
      if (formData.leadId) payload.leadId = formData.leadId;
      if (formData.startDate) payload.startDate = new Date(formData.startDate);
      if (formData.endDate) payload.endDate = new Date(formData.endDate);

      if (canSeeMoney && formData.quotedAmount) {
        payload.quotedAmount = parseFloat(formData.quotedAmount);
        payload.advancePercent = parseFloat(formData.advancePercent || "40");
      }

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        const status = result.data?.status;
        toast.success(
          status === "needs_quote"
            ? "Job created — Needs quote (sales head notified)"
            : "Project created with quote invoice"
        );
        onCreated();
      } else {
        toast.error(result.error || "Failed to create project");
      }
    } catch (err) {
      console.error("[CreateProjectModal] Submit error:", err);
      toast.error("Network error: Could not create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">New job / project</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Job name *</label>
            <Input
              placeholder="e.g. Dawai Tshongkhang RanceLab"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Description *</label>
            <Textarea
              placeholder="Short description of the work"
              className="min-h-[72px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Client *</label>
                {!showAddClient && (
                  <button
                    type="button"
                    onClick={() => setShowAddClient(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    + Add new
                  </button>
                )}
              </div>
              {initializing ? (
                <Skeleton className="h-9 w-full" />
              ) : fetchError ? (
                <div className="flex items-center gap-2 p-2 text-sm text-red-600 bg-red-50 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load clients</span>
                </div>
              ) : (
                <Select
                  value={formData.clientId}
                  onValueChange={(v) => setFormData({ ...formData, clientId: v })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Product *</label>
              <Select
                value={formData.productKey}
                onValueChange={(v) => setFormData({ ...formData, productKey: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_OPTIONS.map((p) => (
                    <SelectItem key={p.key} value={p.key}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {canSeeMoney ? (
            <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Quoted amount (Nu.) *
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="10000"
                  value={formData.quotedAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, quotedAmount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Advance % (default 40)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.advancePercent}
                  onChange={(e) =>
                    setFormData({ ...formData, advancePercent: e.target.value })
                  }
                />
              </div>
              <p className="col-span-2 text-xs text-muted-foreground">
                Creates a quote-time draft invoice with GST (template by product).
              </p>
            </div>
          ) : (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2">
              You cannot set prices. This job will be created as <strong>Needs quote</strong>{" "}
              and sales head will be notified.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Assignee</label>
              {initializing ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={formData.leadId}
                  onValueChange={(v) => setFormData({ ...formData, leadId: v })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Service (optional)</label>
              {initializing ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={formData.serviceId}
                  onValueChange={(v) => setFormData({ ...formData, serviceId: v })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Start</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">End</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || initializing}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create job
            </Button>
          </div>
        </form>

        <CreateClientModal
          open={showAddClient}
          onOpenChange={setShowAddClient}
          onClientCreated={handleClientCreated}
        />
      </div>
    </div>
  );
}
