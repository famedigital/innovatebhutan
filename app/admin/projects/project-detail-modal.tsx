"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, Trash2, Edit2, Calendar, Clock, User, CheckCircle2, Circle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Task = {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string; // User ID (string) from Supabase Auth
  assignedName?: string;
  dueDate?: string;
  estimatedHours?: string;
  actualHours?: string;
  createdAt: string;
};

type ProjectStats = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  progressPercentage: number;
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-50 text-blue-600",
  high: "bg-orange-50 text-orange-600",
  urgent: "bg-red-50 text-red-600",
};

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  todo: { label: "To Do", icon: Circle, color: "bg-gray-50 border-gray-200" },
  in_progress: { label: "In Progress", icon: Clock, color: "bg-blue-50 border-blue-200" },
  done: { label: "Done", icon: CheckCircle2, color: "bg-green-50 border-green-200" },
  blocked: { label: "Blocked", icon: AlertCircle, color: "bg-red-50 border-red-200" },
};

export function ProjectDetailModal({
  project,
  onClose,
  onUpdated,
}: {
  project: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
    estimatedHours: "",
  });
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; fullName: string }>>([]);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);

      const [tasksRes, statsRes] = await Promise.all([
        fetch(`/api/projects/${project.id}/tasks`),
        fetch(`/api/projects/${project.id}/progress`),
      ]);

      const tasksResult = await tasksRes.json();
      const statsResult = await statsRes.json();

      if (tasksResult.success) {
        // Enrich tasks with assignee names
        const enrichedTasks = await Promise.all(
          tasksResult.data.map(async (task: Task) => {
            if (task.assignedTo) {
              try {
                const profileRes = await fetch(`/api/profiles/${task.assignedTo}`);
                const profileResult = await profileRes.json();
                return { ...task, assignedName: profileResult.data?.fullName || "Unknown" };
              } catch {
                return task;
              }
            }
            return task;
          })
        );
        setTasks(enrichedTasks);
      }

      if (statsResult.success) {
        setStats(statsResult.data.stats);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch project data");
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    fetchProjectData();

    // Fetch team members - use userId as value
    fetch("/api/profiles?role=ADMIN,STAFF")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          // Map to use userId as value
          setTeamMembers(result.data?.map((p: any) => ({ id: p.userId, fullName: p.fullName })) || []);
        }
      });
  }, [fetchProjectData]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskForm.title) {
      toast.error("Task title is required");
      return;
    }

    try {
      const payload: any = {
        projectId: project.id,
        title: taskForm.title,
        priority: taskForm.priority,
      };

      if (taskForm.description) payload.description = taskForm.description;
      if (taskForm.assignedTo) payload.assignedTo = taskForm.assignedTo; // Keep as string (userId)
      if (taskForm.dueDate) payload.dueDate = new Date(taskForm.dueDate);
      if (taskForm.estimatedHours) payload.estimatedHours = taskForm.estimatedHours;

      const response = await fetch("/api/projects/" + project.id + "/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Task created");
        setShowTaskForm(false);
        setTaskForm({ title: "", description: "", priority: "medium", assignedTo: "", dueDate: "", estimatedHours: "" });
        fetchProjectData();
      } else {
        toast.error(result.error || "Failed to create task");
      }
    } catch (err) {
      console.error("Create task error:", err);
      toast.error("Failed to create task");
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
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
        );
        fetchProjectData();
      } else {
        toast.error(result.error || "Failed to update task");
      }
    } catch (err) {
      console.error("Update task error:", err);
      toast.error("Failed to update task");
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
        fetchProjectData();
      } else {
        toast.error(result.error || "Failed to delete task");
      }
    } catch (err) {
      console.error("Delete task error:", err);
      toast.error("Failed to delete task");
    }
  };

  const handleUpdateProject = async (field: string, value: any) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Project updated");
        onUpdated();
      } else {
        toast.error(result.error || "Failed to update project");
      }
    } catch (err) {
      console.error("Update project error:", err);
      toast.error("Failed to update project");
    }
  };

  const columns: Array<{ key: string; label: string; icon: React.ElementType; color: string }> = [
    { key: "todo", ...statusConfig.todo },
    { key: "in_progress", ...statusConfig.in_progress },
    { key: "done", ...statusConfig.done },
    { key: "blocked", ...statusConfig.blocked },
  ];

  if (loading && tasks.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#3ECF8E]" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-7xl mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1] bg-gradient-to-r from-[#3ECF8E]/5 to-transparent">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <Badge className={statusConfig[project.status]?.color || ""}>
                {project.status?.replace("_", " ") || "Unknown"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-[#717171]">
              <span>Client: {project.clientName || "-"}</span>
              <span>Lead: {project.leadName || "-"}</span>
              <span>Progress: {stats?.progressPercentage || 0}%</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F3F3F1] rounded-lg p-3">
                <div className="text-2xl font-semibold">{stats.totalTasks}</div>
                <div className="text-xs text-[#717171]">Total Tasks</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-semibold">{stats.todoTasks}</div>
                <div className="text-xs text-[#717171]">To Do</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-semibold">{stats.inProgressTasks}</div>
                <div className="text-xs text-[#717171]">In Progress</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-semibold">{stats.completedTasks}</div>
                <div className="text-xs text-[#717171]">Completed</div>
              </div>
            </div>
          )}

          {/* Kanban Board */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <div key={column.key} className="flex-shrink-0 w-72">
                <div className={`flex items-center gap-2 p-2 rounded-t-lg border border-b-0 ${column.color}`}>
                  <column.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{column.label}</span>
                  <span className="ml-auto text-xs bg-white/50 px-2 py-0.5 rounded-full">
                    {tasks.filter((t) => t.status === column.key).length}
                  </span>
                </div>
                <div className="border border-t-0 rounded-b-lg bg-gray-50/50 p-2 min-h-[400px] space-y-2">
                  {tasks
                    .filter((t) => t.status === column.key)
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm flex-1">{task.title}</h4>
                          <Badge className={`text-[10px] px-1.5 ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </Badge>
                        </div>

                        {task.description && (
                          <p className="text-xs text-[#717171] mb-2 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-[#717171] mb-3">
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
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-[#717171]">
                            {task.assignedName ? (
                              <>
                                <User className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">{task.assignedName}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">Unassigned</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Select
                              value={task.status}
                              onValueChange={(v) => handleUpdateTaskStatus(task.id, v)}
                              disabled={updatingStatus === task.id}
                            >
                              <SelectTrigger className="h-6 w-16 text-xs">
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
                              className="h-6 w-6 text-red-500"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                  {tasks.filter((t) => t.status === column.key).length === 0 && (
                    <div className="text-center py-8 text-sm text-[#717171]">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#E5E5E1] bg-gray-50">
          <Button
            variant="outline"
            onClick={() => setShowTaskForm(true)}
            className="border-[#E5E5E1]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>

          <div className="flex items-center gap-2">
            <Select
              value={project.status}
              onValueChange={(v) => handleUpdateProject("status", v)}
            >
              <SelectTrigger className="w-40 bg-white border-[#E5E5E1] h-9">
                <SelectValue placeholder="Change status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchProjectData} variant="outline" size="sm" className="border-[#E5E5E1]">
              Refresh
            </Button>
            <Button onClick={onClose} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
              Close
            </Button>
          </div>
        </div>

        {/* Add Task Modal */}
        {showTaskForm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
                <h3 className="font-semibold">Add New Task</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowTaskForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleCreateTask} className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#717171]">Title *</label>
                  <Input
                    placeholder="Task title"
                    className="bg-[#F3F3F1] border-[#E5E5E1]"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#717171]">Description</label>
                  <Textarea
                    placeholder="Task description..."
                    className="bg-[#F3F3F1] border-[#E5E5E1] min-h-[60px]"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#717171]">Priority</label>
                    <Select
                      value={taskForm.priority}
                      onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}
                    >
                      <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
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

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#717171]">Assign To</label>
                    <Select
                      value={taskForm.assignedTo}
                      onValueChange={(v) => setTaskForm({ ...taskForm, assignedTo: v })}
                    >
                      <SelectTrigger className="bg-[#F3F3F1] border-[#E5E5E1]">
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#717171]">Due Date</label>
                    <Input
                      type="date"
                      className="bg-[#F3F3F1] border-[#E5E5E1]"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#717171]">Est. Hours</label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="0"
                      className="bg-[#F3F3F1] border-[#E5E5E1]"
                      value={taskForm.estimatedHours}
                      onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowTaskForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#3ECF8E] hover:bg-[#34b27b] text-white">
                    Add Task
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
