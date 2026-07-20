"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  Building2,
  DollarSign,
  Save,
  FileDown,
  LayoutList,
  Wallet,
  ListTodo,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/use-user-profile";
import { ProjectMoneyStatusPanel } from "./project-money-status-panel";
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
  formatNu,
} from "@/lib/projects/statusUi";
import { renderWorkOrderPdf } from "@/lib/projects/renderWorkOrderPdf";

type Task = {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  assignedName?: string;
  dueDate?: string;
  estimatedHours?: string;
  actualHours?: string;
  createdAt: string;
};

type Client = { id: number; name: string };
type Service = { id: number; name: string };

type ProjectStats = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  progressPercentage: number;
};

const priorityColors: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  high: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  urgent: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  todo: {
    label: "To Do",
    icon: Circle,
    color: "bg-muted/60 border-border",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    color:
      "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900",
  },
  blocked: {
    label: "Blocked",
    icon: AlertCircle,
    color: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
  },
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5 min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm font-medium break-words">{value || "—"}</div>
    </div>
  );
}

export function ProjectDetailModal({
  project,
  onClose,
  onUpdated,
}: {
  project: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { canSeeMoney } = useUserProfile();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [detailProject, setDetailProject] = useState<any>(project);
  const [moneySummary, setMoneySummary] = useState<any>(
    project.moneySummary || null
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "unassigned",
    dueDate: "",
    estimatedHours: "",
  });
  const [teamMembers, setTeamMembers] = useState<
    Array<{ id: string; fullName: string }>
  >([]);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: project.name || "",
    description: project.description || "",
    budget: project.budget || "",
    clientId: project.clientId ? String(project.clientId) : "",
    serviceId: project.serviceId ? String(project.serviceId) : "",
    leadId: project.leadId || "",
    startDate: project.startDate
      ? new Date(project.startDate).toISOString().split("T")[0]
      : "",
    endDate: project.endDate
      ? new Date(project.endDate).toISOString().split("T")[0]
      : "",
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [savingProject, setSavingProject] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      const [detailRes, tasksRes, statsRes] = await Promise.all([
        fetch(`/api/projects/${project.id}`),
        fetch(`/api/projects/${project.id}/tasks`),
        fetch(`/api/projects/${project.id}/progress`),
      ]);

      const detailResult = await detailRes.json();
      const tasksResult = await tasksRes.json();
      const statsResult = await statsRes.json();

      if (detailResult.success) {
        const p = detailResult.data?.project || detailResult.data;
        if (p) {
          setDetailProject({ ...project, ...p });
          setMoneySummary(
            p.moneySummary || detailResult.data?.moneySummary || null
          );
          setProjectForm({
            name: p.name || "",
            description: p.description || "",
            budget: p.budget || "",
            clientId: p.clientId ? String(p.clientId) : "",
            serviceId: p.serviceId ? String(p.serviceId) : "",
            leadId: p.leadId || "",
            startDate: p.startDate
              ? new Date(p.startDate).toISOString().split("T")[0]
              : "",
            endDate: p.endDate
              ? new Date(p.endDate).toISOString().split("T")[0]
              : "",
          });
        }
      }

      if (tasksResult.success) {
        setTasks(
          (tasksResult.data || []).map(
            (task: Task & { assigneeName?: string }) => ({
              ...task,
              assignedName: task.assignedName || task.assigneeName,
            })
          )
        );
      }

      if (statsResult.success && statsResult.data) {
        const raw = statsResult.data.stats || {};
        const progressPercentage =
          typeof raw.progressPercentage === "number"
            ? raw.progressPercentage
            : typeof statsResult.data.progress === "number"
              ? statsResult.data.progress
              : 0;
        setStats({
          totalTasks: Number(raw.totalTasks) || 0,
          completedTasks: Number(raw.completedTasks) || 0,
          inProgressTasks: Number(raw.inProgressTasks) || 0,
          todoTasks: Number(raw.todoTasks) || 0,
          progressPercentage,
        });
        if (typeof statsResult.data.progress === "number") {
          setDetailProject((prev: any) => ({
            ...prev,
            progress: statsResult.data.progress,
          }));
        }
      } else if (tasksResult.success) {
        // Fallback: derive % from loaded tasks if progress endpoint fails
        const list = (tasksResult.data || []) as Task[];
        const total = list.length;
        const done = list.filter((t) => t.status === "done").length;
        setStats({
          totalTasks: total,
          completedTasks: done,
          inProgressTasks: list.filter((t) => t.status === "in_progress").length,
          todoTasks: list.filter((t) => t.status === "todo").length,
          progressPercentage:
            total > 0 ? Math.round((done / total) * 100) : 0,
        });
      }
    } catch (err) {
      console.error("[ProjectDetailModal] Fetch error:", err);
      toast.error("Could not load project details");
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    void fetchProjectData();
    fetch("/api/profiles?role=ADMIN,STAFF")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          setTeamMembers(
            result.data?.map((p: any) => ({
              id: p.userId,
              fullName: p.fullName,
            })) || []
          );
        }
      });
    fetch("/api/clients")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setClients(result.data || []);
      });
    fetch("/api/services")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setServices(result.data || []);
      });
  }, [fetchProjectData]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) {
      toast.error("Task title is required");
      return;
    }
    try {
      const payload: Record<string, unknown> = {
        projectId: project.id,
        title: taskForm.title,
        priority: taskForm.priority,
      };
      if (taskForm.description) payload.description = taskForm.description;
      if (taskForm.assignedTo && taskForm.assignedTo !== "unassigned") {
        payload.assignedTo = taskForm.assignedTo;
      }
      if (taskForm.dueDate) payload.dueDate = new Date(taskForm.dueDate);
      if (taskForm.estimatedHours)
        payload.estimatedHours = taskForm.estimatedHours;

      const response = await fetch(`/api/projects/${project.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Task created");
        setShowTaskForm(false);
        setTaskForm({
          title: "",
          description: "",
          priority: "medium",
          assignedTo: "unassigned",
          dueDate: "",
          estimatedHours: "",
        });
        void fetchProjectData();
        onUpdated();
        setTab("tasks");
      } else {
        toast.error(result.error || "Failed to create task");
      }
    } catch {
      toast.error("Network error creating task");
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      setUpdatingStatus(taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId ? { ...t, status: newStatus as Task["status"] } : t
          )
        );
        void fetchProjectData();
        onUpdated();
      } else {
        toast.error(result.error || "Failed to update task");
      }
    } catch {
      toast.error("Network error updating task");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        toast.success("Task deleted");
        void fetchProjectData();
        onUpdated();
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    } catch {
      toast.error("Network error deleting task");
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      const payload: Record<string, unknown> = {};
      if (projectForm.name) payload.name = projectForm.name;
      if (projectForm.description !== undefined)
        payload.description = projectForm.description;
      if (canSeeMoney && projectForm.budget) payload.budget = projectForm.budget;
      if (projectForm.clientId) payload.clientId = Number(projectForm.clientId);
      if (projectForm.serviceId)
        payload.serviceId = Number(projectForm.serviceId);
      if (projectForm.leadId) payload.leadId = projectForm.leadId;
      if (projectForm.startDate)
        payload.startDate = new Date(projectForm.startDate);
      if (projectForm.endDate) payload.endDate = new Date(projectForm.endDate);

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Project updated");
        setEditMode(false);
        void fetchProjectData();
        onUpdated();
      } else {
        toast.error(result.error || "Failed to update");
      }
    } catch {
      toast.error("Network error saving project");
    } finally {
      setSavingProject(false);
    }
  };

  const downloadWorkOrder = async () => {
    try {
      const blob = await renderWorkOrderPdf({
        projectName: detailProject.name || project.name,
        projectId: project.id,
        clientName: detailProject.clientName || project.clientName || undefined,
        clientPhone:
          detailProject.clientPhone || project.clientPhone || undefined,
        productKey:
          detailProject.productKey || project.productKey || undefined,
        status: detailProject.status || project.status,
        description:
          detailProject.description || project.description || undefined,
        tasks: tasks.map((t) => ({ title: t.title, status: t.status })),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `WO-${project.id}-${(detailProject.name || "job")
        .replace(/\s+/g, "-")
        .slice(0, 40)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not generate work order PDF");
    }
  };

  const columns = [
    { key: "todo", ...statusConfig.todo },
    { key: "in_progress", ...statusConfig.in_progress },
    { key: "done", ...statusConfig.done },
    { key: "blocked", ...statusConfig.blocked },
  ];

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="rounded-lg border bg-card p-3 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm leading-snug flex-1">{task.title}</h4>
        <Badge
          variant="secondary"
          className={`text-[10px] shrink-0 ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </Badge>
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.estimatedHours && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.estimatedHours}h
          </span>
        )}
        <span className="flex items-center gap-1 min-w-0">
          <User className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {task.assignedName || "Unassigned"}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-1 pt-1">
        <Select
          value={task.status}
          onValueChange={(v) => void handleUpdateTaskStatus(task.id, v)}
          disabled={updatingStatus === task.id}
        >
          <SelectTrigger className="h-8 flex-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((c) => (
              <SelectItem key={c.key} value={c.key}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive shrink-0"
          onClick={() => void handleDeleteTask(task.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  if (loading && tasks.length === 0 && !detailProject?.name) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-background rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg mx-0 sm:mx-4 p-8 flex items-center justify-center">
          <Spinner className="w-8 h-8 text-primary" />
          <span className="ml-3 text-muted-foreground text-sm">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative bg-background rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-4xl lg:max-w-5xl sm:mx-4 flex flex-col
        h-[min(94dvh,100%)] sm:h-auto sm:max-h-[92vh] overflow-hidden
        pb-[env(safe-area-inset-bottom)]"
      >
        {/* Compact header */}
        <div className="shrink-0 border-b px-3 py-3 sm:px-5 sm:py-4">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold leading-tight truncate max-w-full">
                  {detailProject.name}
                </h2>
                <Badge
                  variant="outline"
                  className={
                    PROJECT_STATUS_COLORS[detailProject.status] || undefined
                  }
                >
                  {PROJECT_STATUS_LABELS[detailProject.status] ||
                    detailProject.status?.replace(/_/g, " ") ||
                    "—"}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 min-w-0">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">
                    {detailProject.clientName || project.clientName || "—"}
                  </span>
                </span>
                {(detailProject.productKey || project.productKey) && (
                  <span className="capitalize">
                    {(detailProject.productKey || project.productKey).replace(
                      /_/g,
                      " "
                    )}
                  </span>
                )}
                {stats && (
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <span
                      className="inline-block h-1.5 w-10 rounded-full bg-muted overflow-hidden"
                      aria-hidden
                    >
                      <span
                        className="block h-full rounded-full bg-emerald-600"
                        style={{
                          width: `${Math.min(100, Math.max(0, stats.progressPercentage ?? 0))}%`,
                        }}
                      />
                    </span>
                    {stats.progressPercentage ?? 0}% tasks done
                  </span>
                )}
                {canSeeMoney &&
                  (moneySummary?.quotedTotal || detailProject.budget) && (
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <DollarSign className="w-3 h-3" />
                      {moneySummary?.quotedTotal
                        ? formatNu(moneySummary.quotedTotal)
                        : `Nu. ${detailProject.budget}`}
                    </span>
                  )}
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => void fetchProjectData()}
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => void downloadWorkOrder()}
                title="Work order PDF"
              >
                <FileDown className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v);
            if (v === "details") setEditMode(true);
          }}
          className="flex flex-1 flex-col min-h-0 gap-0"
        >
          <div className="shrink-0 border-b px-2 sm:px-4">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="h-11 w-max min-w-full justify-start gap-1 bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="gap-1.5 data-[state=active]:bg-muted rounded-md px-3"
                >
                  <LayoutList className="size-3.5" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="status"
                  className="gap-1.5 data-[state=active]:bg-muted rounded-md px-3"
                >
                  <Wallet className="size-3.5" />
                  <span className="sm:hidden">Status</span>
                  <span className="hidden sm:inline">Status & money</span>
                </TabsTrigger>
                <TabsTrigger
                  value="tasks"
                  className="gap-1.5 data-[state=active]:bg-muted rounded-md px-3"
                >
                  <ListTodo className="size-3.5" />
                  Tasks
                  {stats && stats.totalTasks > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 min-w-5 px-1 text-[10px]"
                    >
                      {stats.totalTasks}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="gap-1.5 data-[state=active]:bg-muted rounded-md px-3"
                >
                  <Info className="size-3.5" />
                  Details
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {/* Overview */}
            <TabsContent value="overview" className="m-0 p-3 sm:p-5 space-y-4">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">Task progress</span>
                      <span className="tabular-nums text-muted-foreground">
                        {stats?.progressPercentage ?? 0}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, stats?.progressPercentage ?? 0)
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {stats?.completedTasks ?? 0} of {stats?.totalTasks ?? 0}{" "}
                      tasks marked done
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-lg border bg-slate-100 p-3 dark:bg-slate-900/50">
                      <div className="text-xl font-semibold tabular-nums">
                        {stats?.totalTasks ?? 0}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        Tasks
                      </div>
                    </div>
                    <div className="rounded-lg border bg-amber-100 p-3 dark:bg-amber-950/40">
                      <div className="text-xl font-semibold tabular-nums text-amber-900 dark:text-amber-100">
                        {stats?.todoTasks ?? 0}
                      </div>
                      <div className="text-[10px] text-amber-800/80 dark:text-amber-200/80 uppercase">
                        To do
                      </div>
                    </div>
                    <div className="rounded-lg border bg-sky-100 p-3 dark:bg-sky-950/40">
                      <div className="text-xl font-semibold tabular-nums text-sky-900 dark:text-sky-100">
                        {stats?.inProgressTasks ?? 0}
                      </div>
                      <div className="text-[10px] text-sky-800/80 dark:text-sky-200/80 uppercase">
                        Active
                      </div>
                    </div>
                    <div className="rounded-lg border bg-emerald-100 p-3 dark:bg-emerald-950/40">
                      <div className="text-xl font-semibold tabular-nums text-emerald-900 dark:text-emerald-100">
                        {stats?.completedTasks ?? 0}
                      </div>
                      <div className="text-[10px] text-emerald-800/80 dark:text-emerald-200/80 uppercase">
                        Done
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="rounded-lg border p-3 sm:p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoRow
                    label="Client"
                    value={
                      detailProject.clientName || project.clientName || "—"
                    }
                  />
                  <InfoRow
                    label="Lead"
                    value={detailProject.leadName || project.leadName || "—"}
                  />
                  <InfoRow
                    label="Product"
                    value={
                      (detailProject.productKey || project.productKey || "—")
                        .toString()
                        .replace(/_/g, " ")
                    }
                  />
                  <InfoRow
                    label="Service"
                    value={
                      detailProject.serviceName ||
                      project.serviceName ||
                      services.find(
                        (s) =>
                          String(s.id) ===
                          String(detailProject.serviceId || project.serviceId)
                      )?.name ||
                      "—"
                    }
                  />
                  <InfoRow
                    label="Start"
                    value={
                      detailProject.startDate
                        ? new Date(detailProject.startDate).toLocaleDateString()
                        : "—"
                    }
                  />
                  <InfoRow
                    label="End"
                    value={
                      detailProject.endDate
                        ? new Date(detailProject.endDate).toLocaleDateString()
                        : "—"
                    }
                  />
                </div>
                {detailProject.description && (
                  <div className="pt-2 border-t">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                      Description
                    </p>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {detailProject.description}
                    </p>
                  </div>
                )}
              </div>

              {canSeeMoney && moneySummary && (
                <button
                  type="button"
                  onClick={() => setTab("status")}
                  className="w-full text-left rounded-lg border p-3 sm:p-4 hover:bg-muted/40 transition-colors"
                >
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Money snapshot · tap for payments
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-[10px] text-muted-foreground">
                        Quoted
                      </span>
                      <p className="font-medium tabular-nums">
                        {formatNu(moneySummary.quotedTotal)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">
                        Advance
                      </span>
                      <p className="font-medium tabular-nums">
                        {formatNu(moneySummary.advancePaid)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">
                        Balance
                      </span>
                      <p className="font-medium tabular-nums">
                        {formatNu(moneySummary.balancePaid)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">
                        Outstanding
                      </span>
                      <p className="font-medium tabular-nums">
                        {formatNu(moneySummary.outstanding)}
                      </p>
                    </div>
                  </div>
                </button>
              )}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setTab("status")}>
                  Update status
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setTab("tasks");
                    setShowTaskForm(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add task
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditMode(true);
                    setTab("details");
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit details
                </Button>
              </div>
            </TabsContent>

            {/* Status & money */}
            <TabsContent value="status" className="m-0 p-3 sm:p-5">
              <ProjectMoneyStatusPanel
                projectId={project.id}
                status={detailProject.status || project.status}
                moneySummary={moneySummary}
                canSeeMoney={canSeeMoney}
                onUpdated={() => {
                  void fetchProjectData();
                  onUpdated();
                }}
              />
            </TabsContent>

            {/* Tasks */}
            <TabsContent value="tasks" className="m-0 p-3 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {tasks.length} task{tasks.length === 1 ? "" : "s"}
                </p>
                <Button size="sm" onClick={() => setShowTaskForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Mobile: stacked lists */}
              <div className="space-y-4 sm:hidden">
                {columns.map((column) => {
                  const colTasks = tasks.filter((t) => t.status === column.key);
                  return (
                    <div key={column.key} className="space-y-2">
                      <div
                        className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 ${column.color}`}
                      >
                        <column.icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {column.label}
                        </span>
                        <Badge variant="secondary" className="ml-auto h-5 text-[10px]">
                          {colTasks.length}
                        </Badge>
                      </div>
                      {colTasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground px-1 py-2">
                          No tasks
                        </p>
                      ) : (
                        colTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop: kanban */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {columns.map((column) => {
                  const colTasks = tasks.filter((t) => t.status === column.key);
                  return (
                    <div key={column.key} className="min-w-0 flex flex-col">
                      <div
                        className={`flex items-center gap-2 rounded-t-lg border border-b-0 px-2.5 py-2 ${column.color}`}
                      >
                        <column.icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">
                          {column.label}
                        </span>
                        <span className="ml-auto text-[10px] tabular-nums opacity-70">
                          {colTasks.length}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2 rounded-b-lg border border-t-0 bg-muted/20 p-2 min-h-[12rem]">
                        {colTasks.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                        {colTasks.length === 0 && (
                          <p className="text-center text-xs text-muted-foreground py-6">
                            Empty
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Details / edit */}
            <TabsContent value="details" className="m-0 p-3 sm:p-5">
              <form onSubmit={handleSaveProject} className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Job details</h3>
                  {!editMode ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm" disabled={savingProject}>
                        {savingProject ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5 mr-1" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-muted-foreground">Name</label>
                    <Input
                      value={projectForm.name}
                      disabled={!editMode}
                      onChange={(e) =>
                        setProjectForm({ ...projectForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Description
                    </label>
                    <Textarea
                      value={projectForm.description}
                      disabled={!editMode}
                      rows={3}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Client</label>
                    <Select
                      value={projectForm.clientId}
                      disabled={!editMode}
                      onValueChange={(v) =>
                        setProjectForm({ ...projectForm, clientId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Service
                    </label>
                    <Select
                      value={projectForm.serviceId || undefined}
                      disabled={!editMode}
                      onValueChange={(v) =>
                        setProjectForm({ ...projectForm, serviceId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Lead</label>
                    <Select
                      value={projectForm.leadId || undefined}
                      disabled={!editMode}
                      onValueChange={(v) =>
                        setProjectForm({ ...projectForm, leadId: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.fullName || m.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {canSeeMoney && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">
                        Budget (legacy)
                      </label>
                      <Input
                        value={projectForm.budget}
                        disabled={!editMode}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            budget: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Start date
                    </label>
                    <Input
                      type="date"
                      value={projectForm.startDate}
                      disabled={!editMode}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      End date
                    </label>
                    <Input
                      type="date"
                      value={projectForm.endDate}
                      disabled={!editMode}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </form>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between gap-2 border-t px-3 py-2.5 sm:px-5 sm:py-3 bg-muted/30">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-2">
            {tab === "tasks" && (
              <Button size="sm" onClick={() => setShowTaskForm(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Task
              </Button>
            )}
            {tab !== "status" && (
              <Button size="sm" variant="secondary" onClick={() => setTab("status")}>
                Status
              </Button>
            )}
          </div>
        </div>

        {/* Add task sheet */}
        {showTaskForm && (
          <div className="absolute inset-0 z-20 flex items-end sm:items-center justify-center bg-black/50">
            <div className="relative bg-background rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[90dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background">
                <h3 className="font-semibold text-sm">Add task</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowTaskForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <form onSubmit={handleCreateTask} className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Title *</label>
                  <Input
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    rows={3}
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Priority
                    </label>
                    <Select
                      value={taskForm.priority}
                      onValueChange={(v) =>
                        setTaskForm({ ...taskForm, priority: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Assign
                    </label>
                    <Select
                      value={taskForm.assignedTo}
                      onValueChange={(v) =>
                        setTaskForm({ ...taskForm, assignedTo: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teamMembers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.fullName || m.id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Due</label>
                    <Input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, dueDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Est. hours
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      value={taskForm.estimatedHours}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          estimatedHours: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowTaskForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add task
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
