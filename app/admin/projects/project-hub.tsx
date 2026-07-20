"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, Plus, Eye, Trash2, Filter, MoreVertical, Calendar, User, List, LayoutGrid, AlertCircle } from "lucide-react";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ProjectDetailModal } from "./project-detail-modal";
import { CreateProjectModal } from "./create-project-modal";
import { ResponsiveDataList } from "@/components/admin/responsive-data-list";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Project = {
  id: number;
  name: string;
  description?: string;
  status: string;
  progress: number;
  startDate?: string;
  endDate?: string;
  budget?: string;
  clientName?: string;
  clientId?: number;
  leadName?: string;
  leadId?: string;
  serviceName?: string;
  publicId?: string;
};

type Client = { id: number; name: string };
type Lead = { id: string; name: string };

type ViewMode = "table" | "calendar";

const statusColors: Record<string, string> = {
  planning: "bg-gray-50 text-gray-600 border-gray-200",
  active: "bg-green-50 text-green-600 border-green-200",
  testing: "bg-amber-50 text-amber-600 border-amber-200",
  complete: "bg-blue-50 text-blue-600 border-blue-200",
  on_hold: "bg-orange-50 text-orange-600 border-orange-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

function formatBudget(value?: string) {
  if (!value) return "—";
  const n = parseFloat(value);
  if (Number.isNaN(n)) return "—";
  if (n >= 1_000_000) return `Nu. ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `Nu. ${(n / 1_000).toFixed(1)}k`;
  return `Nu. ${n.toLocaleString()}`;
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="h-1.5 flex-1 min-w-[3rem] max-w-[6rem] rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
        {pct}%
      </span>
    </div>
  );
}

export function ProjectHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Advanced filters
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [leadFilter, setLeadFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Filter options
  const [clients, setClients] = useState<Client[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (clientFilter !== "all") {
        params.append("clientId", clientFilter);
      }
      if (leadFilter !== "all") {
        params.append("leadId", leadFilter);
      }
      if (dateFromFilter) {
        params.append("startDateFrom", dateFromFilter);
      }
      if (dateToFilter) {
        params.append("startDateTo", dateToFilter);
      }

      const response = await fetch(`/api/projects?${params}`);
      const result = await response.json();

      if (result.success) {
        setProjects(result.data);
        setTotal(result.pagination?.total || 0);
      } else {
        toast.error(result.error || "Failed to fetch projects");
      }
    } catch (err) {
      console.error("[ProjectHub] Fetch error:", err);
      toast.error("Network error: Could not fetch projects. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTerm, limit, clientFilter, leadFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch filter options
  useEffect(() => {
    // Fetch clients
    fetch("/api/clients")
      .then(r => r.json())
      .then(result => {
        if (result.success) setClients(result.data || []);
      });

    // Fetch leads (profiles with STAFF or ADMIN role)
    fetch("/api/profiles?role=ADMIN,STAFF")
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          setLeads(result.data?.map((p: any) => ({ id: p.userId, name: p.fullName || p.userId })) || []);
        }
      });
  }, []);

  const handleDeleteProject = async (id: number) => {
    if (!confirm("Delete this project and all its tasks?")) return;

    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const result = await response.json();

      if (result.success) {
        toast.success("Project deleted");
        fetchProjects();
      } else {
        toast.error(result.error || "Failed to delete project");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete project");
    }
  };

  const handleProjectCreated = () => {
    setShowCreate(false);
    fetchProjects();
  };

  const handleProjectUpdated = () => {
    setShowDetail(false);
    fetchProjects();
  };

  const totalPages = Math.ceil(total / limit);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek, year, month };
  };

  const getProjectsForDay = (day: number, month: number, year: number) => {
    return projects.filter((p) => {
      if (!p.startDate) return false;
      const startDate = new Date(p.startDate);
      return (
        startDate.getDate() === day &&
        startDate.getMonth() === month &&
        startDate.getFullYear() === year
      );
    });
  };

  const CalendarView = () => {
    const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    const dayLabelsFull = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-14 sm:min-h-20 md:min-h-24 border border-border/60 bg-muted/20"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayProjects = getProjectsForDay(day, month, year);
      const isToday =
        new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            "min-h-14 sm:min-h-20 md:min-h-24 border border-border/60 p-0.5 sm:p-1 overflow-hidden",
            isToday && "bg-primary/5 ring-1 ring-inset ring-primary/30"
          )}
        >
          <div
            className={cn(
              "text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1",
              isToday && "text-primary"
            )}
          >
            {day}
          </div>
          <div className="space-y-0.5 hidden sm:block">
            {dayProjects.slice(0, 2).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject(p);
                  setShowDetail(true);
                }}
                className={cn(
                  "w-full text-left text-[10px] px-1 py-0.5 rounded truncate",
                  statusColors[p.status] || "bg-muted text-muted-foreground"
                )}
              >
                {p.name}
              </button>
            ))}
            {dayProjects.length > 2 && (
              <div className="text-[10px] text-muted-foreground pl-0.5">
                +{dayProjects.length - 2}
              </div>
            )}
          </div>
          {dayProjects.length > 0 && (
            <div className="sm:hidden flex flex-wrap gap-0.5 mt-0.5">
              {dayProjects.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-label={p.name}
                  onClick={() => {
                    setSelectedProject(p);
                    setShowDetail(true);
                  }}
                  className={cn(
                    "size-1.5 rounded-full",
                    p.status === "active"
                      ? "bg-emerald-500"
                      : p.status === "complete"
                        ? "bg-blue-500"
                        : "bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Card className="shadow-none overflow-hidden">
        <CardHeader className="border-b border-border p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base sm:text-lg">
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex-1 sm:flex-none"
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex-1 sm:flex-none"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex-1 sm:flex-none"
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[280px]">
            <div className="grid grid-cols-7 border-b border-border">
              {dayLabelsFull.map((day, i) => (
                <div
                  key={day}
                  className="p-1.5 sm:p-2 text-[10px] sm:text-xs font-medium text-muted-foreground text-center bg-muted/40"
                >
                  <span className="sm:hidden">{dayLabels[i]}</span>
                  <span className="hidden sm:inline">{day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">{days}</div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setShowDetail(true);
  };

  const totalBudget = projects
    .filter((p) => p.budget)
    .reduce((sum, p) => sum + parseFloat(p.budget || "0"), 0);

  const activeCount = projects.filter((p) => p.status === "active").length;
  const completeCount = projects.filter((p) => p.status === "complete").length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9 h-10 w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[min(100%,9.5rem)] shrink-0">
              <Filter className="size-4 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="size-4 mr-1.5" />
            Filters
            {(clientFilter !== "all" ||
              leadFilter !== "all" ||
              dateFromFilter ||
              dateToFilter) && (
              <span className="ml-1.5 size-1.5 rounded-full bg-primary" />
            )}
          </Button>

          <div className="flex items-center border rounded-md overflow-hidden ml-auto sm:ml-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("table")}
              className={cn(
                "h-9 rounded-none px-2.5",
                viewMode === "table" && "bg-secondary"
              )}
              aria-label="List view"
            >
              <List className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={cn(
                "h-9 rounded-none px-2.5",
                viewMode === "calendar" && "bg-secondary"
              )}
              aria-label="Calendar view"
            >
              <Calendar className="size-4" />
            </Button>
          </div>

          <Button
            onClick={fetchProjects}
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </Button>

          <Button
            onClick={() => setShowCreate(true)}
            size="sm"
            className="h-9 shrink-0"
          >
            <Plus className="size-4 mr-1.5" />
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">New Project</span>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {total} project{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card className="shadow-none bg-muted/30">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setClientFilter("all");
                  setLeadFilter("all");
                  setDateFromFilter("");
                  setDateToFilter("");
                }}
              >
                Clear
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Client
                </label>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Project Lead
                </label>
                <Select value={leadFilter} onValueChange={setLeadFilter}>
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="All leads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leads</SelectItem>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Start From
                </label>
                <Input
                  type="date"
                  className="h-9 bg-background"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Start To
                </label>
                <Input
                  type="date"
                  className="h-9 bg-background"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-none">
              <CardContent className="p-3 sm:p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <Card className="shadow-none">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xl sm:text-2xl font-semibold tabular-nums">
                {total}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Total
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xl sm:text-2xl font-semibold tabular-nums text-emerald-600">
                {activeCount}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Active
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardContent className="p-3 sm:p-4">
              <p className="text-xl sm:text-2xl font-semibold tabular-nums">
                {completeCount}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Done
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardContent className="p-3 sm:p-4">
              <p className="text-lg sm:text-xl font-semibold tabular-nums truncate">
                {formatBudget(String(totalBudget))}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Budget (page)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List / Calendar */}
      {viewMode === "table" ? (
        <>
          {loading ? (
            <Card className="shadow-none">
              <CardContent className="py-16 flex justify-center">
                <Spinner />
              </CardContent>
            </Card>
          ) : (
            <ResponsiveDataList
              isEmpty={projects.length === 0}
              empty={
                <div className="flex flex-col items-center gap-2 py-4">
                  <AlertCircle className="size-8 text-muted-foreground/50" />
                  <span>No projects found</span>
                  <span className="text-xs">
                    Adjust filters or create a new project
                  </span>
                </div>
              }
              tableHeader={
                <>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </>
              }
              tableBody={projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() => openProject(project)}
                >
                  <TableCell className="font-medium">
                    <div className="min-w-0">
                      <div className="truncate max-w-[220px]">{project.name}</div>
                      {project.description ? (
                        <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                          {project.description}
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {project.clientName || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {project.leadName ? (
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3 text-muted-foreground" />
                        {project.leadName}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] capitalize",
                        statusColors[project.status]
                      )}
                    >
                      {project.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ProgressBar value={project.progress || 0} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatBudget(project.budget)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openProject(project)}>
                          <Eye className="size-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              mobileItems={projects.map((project) => (
                <Item
                  key={project.id}
                  size="sm"
                  className="cursor-pointer active:bg-muted/60"
                  onClick={() => openProject(project)}
                >
                  <ItemMedia variant="icon">
                    <LayoutGrid className="size-4" />
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="truncate">{project.name}</ItemTitle>
                    <ItemDescription className="line-clamp-1">
                      {project.clientName || "No client"}
                      {project.leadName ? ` · ${project.leadName}` : ""}
                    </ItemDescription>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] capitalize",
                          statusColors[project.status]
                        )}
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                      <div className="flex-1 min-w-[5rem] max-w-[8rem]">
                        <ProgressBar value={project.progress || 0} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatBudget(project.budget)}
                      </span>
                    </div>
                  </ItemContent>
                  <ItemActions onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openProject(project)}>
                          <Eye className="size-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </ItemActions>
                </Item>
              ))}
            />
          )}

          {totalPages > 1 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
                {total}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <CalendarView />
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {showDetail && selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setShowDetail(false)}
          onUpdated={handleProjectUpdated}
        />
      )}
    </div>
  );
}
