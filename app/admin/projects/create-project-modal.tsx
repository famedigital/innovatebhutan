"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CreateClientModal, ClientData } from "@/app/admin/clients/create-client-modal";

export function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
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
    budget: "",
    status: "planning",
  });

  useEffect(() => {
    const initializeData = async () => {
      try {
        setInitializing(true);
        setFetchError(null);

        // Fetch all dropdown data in parallel
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

        // Check for errors and set data
        if (clientsResult.success) {
          setClients(clientsResult.data || []);
        } else {
          console.error("[CreateProjectModal] Clients fetch error:", clientsResult.error);
        }

        if (servicesResult.success) {
          setServices(servicesResult.data || []);
        } else {
          console.error("[CreateProjectModal] Services fetch error:", servicesResult.error);
        }

        if (leadsResult.success) {
          // Map to use userId as value and fullName as label
          setLeads(leadsResult.data?.map((p: any) => ({ id: p.userId, name: p.fullName || p.userId })) || []);
        } else {
          console.error("[CreateProjectModal] Leads fetch error:", leadsResult.error);
        }

        // If all failed, show error
        if (!clientsResult.success && !servicesResult.success && !leadsResult.success) {
          setFetchError("Failed to load required data. Please refresh and try again.");
        }
      } catch (err) {
        console.error("[CreateProjectModal] Initialization error:", err);
        setFetchError("Network error: Could not load required data. Please check your connection.");
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

    if (!formData.name || !formData.clientId) {
      toast.error("Name and client are required");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: formData.name,
        clientId: parseInt(formData.clientId),
        status: formData.status,
      };

      if (formData.description) payload.description = formData.description;
      if (formData.serviceId) payload.serviceId = parseInt(formData.serviceId);
      if (formData.leadId) payload.leadId = formData.leadId; // Keep as string (userId)
      if (formData.startDate) payload.startDate = new Date(formData.startDate);
      if (formData.endDate) payload.endDate = new Date(formData.endDate);
      if (formData.budget) payload.budget = formData.budget;

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Project created successfully");
        onCreated();
      } else {
        toast.error(result.error || "Failed to create project");
      }
    } catch (err) {
      console.error("[CreateProjectModal] Submit error:", err);
      toast.error("Network error: Could not create project. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
          <h3 className="font-semibold text-lg">Create New Project</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#717171]">Project Name *</label>
            <Input
              placeholder="Enter project name"
              className="bg-[#F3F3F1] border-[#E5E5E1]"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#717171]">Description</label>
            <Textarea
              placeholder="Project description..."
              className="bg-[#F3F3F1] border-[#E5E5E1] min-h-[80px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#717171]">Client *</label>
                {!showAddClient && (
                  <button
                    type="button"
                    onClick={() => setShowAddClient(true)}
                    className="text-xs text-[#3ECF8E] hover:underline"
                  >
                    + Add new
                  </button>
                )}
              </div>

              {initializing ? (
                <Skeleton className="h-9 w-full bg-[#F3F3F1]" />
              ) : fetchError ? (
                <div className="flex items-center gap-2 p-2 text-sm text-red-500 bg-red-50 rounded">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed to load clients</span>
                </div>
              ) : (
                <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })} required disabled={loading}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue placeholder={clients.length === 0 ? "No clients - add one" : "Select client"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                    {clients.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No clients available</div>
                    ) : (
                      clients.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Service</label>
              {initializing ? (
                <Skeleton className="h-9 w-full bg-[#F3F3F1]" />
              ) : (
                <Select value={formData.serviceId} onValueChange={(v) => setFormData({ ...formData, serviceId: v })} disabled={loading}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
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
              <label className="text-xs font-medium text-[#717171]">Project Lead</label>
              {initializing ? (
                <Skeleton className="h-9 w-full bg-[#F3F3F1]" />
              ) : (
                <Select value={formData.leadId} onValueChange={(v) => setFormData({ ...formData, leadId: v })} disabled={loading}>
                  <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
                    {leads.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No team members available</div>
                    ) : (
                      leads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Budget (Nu.)</label>
              <Input
                type="number"
                placeholder="0.00"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Start Date</label>
              <Input
                type="date"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">End Date</label>
              <Input
                type="date"
                className="bg-[#F3F3F1] border-[#E5E5E1]"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#717171]">Initial Status</label>
            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
              <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-[#E5E5E1]">
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1 border-[#E5E5E1]" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-[#3ECF8E] hover:bg-[#34b27b] text-white" disabled={loading || initializing}>
              {loading || initializing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Project
            </Button>
          </div>
        </form>

        {/* Client Creation Modal */}
        <CreateClientModal
          open={showAddClient}
          onOpenChange={setShowAddClient}
          onClientCreated={handleClientCreated}
        />
      </div>
    </div>
  );
}
