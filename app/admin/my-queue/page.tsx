"use client";

import { useCallback, useEffect, useState } from "react";
import { ListTodo, RefreshCw, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type QueueProject = {
  id: number;
  name: string;
  status: string;
  productKey?: string | null;
  categoryType?: string | null;
  assigneeRole?: string | null;
  productMasterStatus?: string | null;
  trainingPlan?: Array<{ day: number; title: string; status: string }> | null;
  preferredInstallDate?: string | null;
  clientName?: string | null;
  leadId?: string | null;
};

const DEFAULT_DAYS = [
  { day: 1, title: "Training on Product Master" },
  { day: 2, title: "Training on Purchase/Sales" },
  { day: 3, title: "Training on Warehouse/Finance" },
  { day: 4, title: "Implementation" },
  { day: 5, title: "Project completed → Accountant" },
];

export default function MyQueuePage() {
  const [items, setItems] = useState<QueueProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("all");
  const [mineOnly, setMineOnly] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (mineOnly) params.set("me", "1");
      if (role !== "all") params.set("assigneeRole", role);
      const res = await fetch(`/api/projects/queue?${params}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed");
      setItems(data.data || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  }, [mineOnly, role]);

  useEffect(() => {
    load();
  }, [load]);

  const handoffAccountant = async (projectId: number) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigneeRole: "accountant",
          productMasterStatus: "completed",
          status: "testing",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Handoff failed");
      toast.success("Handed off to accountant for payment follow-up");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Handoff failed");
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">My Queue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Projects for implementors, accountants &amp; trainees — training Day 1–5
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="implementor">Implementor</SelectItem>
              <SelectItem value="accountant">Accountant</SelectItem>
              <SelectItem value="trainee">Trainee</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={mineOnly ? "default" : "outline"} size="sm" onClick={() => setMineOnly((v) => !v)}>
            {mineOnly ? "Assigned to me" : "All staff"}
          </Button>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" /> Refresh</Button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
            <ListTodo className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No projects in this queue. Ticket queue remains at{" "}
            <a className="underline" href="/admin/tickets?scope=mine">Tickets → Mine</a>.
          </div>
        ) : (
          items.map((p) => {
            const plan = (p.trainingPlan && p.trainingPlan.length > 0)
              ? p.trainingPlan
              : DEFAULT_DAYS.map((d) => ({ ...d, status: "pending" }));
            const masterDone = p.productMasterStatus === "completed";
            return (
              <div key={p.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={`/admin/projects`} className="font-semibold hover:underline">{p.name}</a>
                      <Badge variant="secondary" className="text-[10px]">{p.status}</Badge>
                      {p.assigneeRole && (
                        <Badge className="text-[10px] capitalize">{p.assigneeRole}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.clientName || "Client"} · {p.categoryType || p.productKey || "—"}
                      {p.preferredInstallDate ? ` · Install ${new Date(p.preferredInstallDate).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={masterDone ? "default" : "outline"} className="text-[10px]">
                      Product master: {p.productMasterStatus || "pending"}
                    </Badge>
                    {masterDone && p.assigneeRole !== "accountant" && (
                      <Button size="sm" variant="outline" onClick={() => handoffAccountant(p.id)}>
                        <UserCheck className="w-3.5 h-3.5 mr-1" /> To accountant
                      </Button>
                    )}
                  </div>
                </div>

                {masterDone && (
                  <div className="grid sm:grid-cols-5 gap-2">
                    {plan.map((day) => (
                      <div key={day.day} className="rounded-lg border p-2 text-center bg-muted/20">
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Day {day.day}</div>
                        <div className="text-xs font-medium mt-1 leading-snug">{day.title}</div>
                        <Badge variant="secondary" className="mt-2 text-[9px]">{day.status || "pending"}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {!masterDone && (
                  <p className="text-xs text-muted-foreground">
                    Complete product master setup to unlock Day 1–5 training schedule.
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
