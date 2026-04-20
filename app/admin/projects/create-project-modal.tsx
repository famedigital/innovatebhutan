"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clients, setClients] = useState<Array<{ id: number; name: string }>>([]);
  const [services, setServices] = useState<Array<{ id: number; name: string }>>([]);
  const [leads, setLeads] = useState<Array<{ id: string; name: string }>>([]);
  const [newClientName, setNewClientName] = useState("");
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
    // Fetch clients
    fetch("/api/clients")
      .then(r => r.json())
      .then(result => {
        if (result.success) setClients(result.data || []);
      });

    // Fetch services
    fetch("/api/services")
      .then(r => r.json())
      .then(result => {
        if (result.success) setServices(result.data || []);
      });

    // Fetch leads (profiles with STAFF or ADMIN role) - use userId as value
    fetch("/api/profiles?role=ADMIN,STAFF")
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          // Map to use userId as value and fullName as label
          setLeads(result.data?.map((p: any) => ({ id: p.userId, name: p.fullName || p.userId })) || []);
        }
      });
  }, []);

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
      console.error("Create error:", err);
      toast.error("Failed to create project");
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

              {showAddClient ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="New client name"
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white"
                    onClick={async () => {
                      if (!newClientName.trim()) return;
                      try {
                        const res = await fetch("/api/clients", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name: newClientName }),
                        });
                        const result = await res.json();
                        if (result.success) {
                          setClients([...clients, result.data]);
                          setFormData({ ...formData, clientId: result.data.id.toString() });
                          setNewClientName("");
                          setShowAddClient(false);
                          toast.success("Client added");
                        }
                      } catch {
                        toast.error("Failed to add client");
                      }
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddClient(false)}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })} required>
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
              <Select value={formData.serviceId} onValueChange={(v) => setFormData({ ...formData, serviceId: v })}>
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#717171]">Project Lead</label>
              <Select value={formData.leadId} onValueChange={(v) => setFormData({ ...formData, leadId: v })}>
                <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E5E5E1]">
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="button" variant="outline" className="flex-1 border-[#E5E5E1]" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-[#3ECF8E] hover:bg-[#34b27b] text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
