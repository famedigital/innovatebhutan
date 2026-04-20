"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, Plus, Eye, Edit2, Trash2, Filter, X, MoreVertical, Calendar, User, DollarSign, List, ChevronDown, LayoutGrid } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        toast.error("Failed to fetch projects");
      }
    } catch (err) {
      console.error("Project Fetch Error:", err);
      toast.error("Failed to fetch projects");
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

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100 bg-gray-50/30" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayProjects = getProjectsForDay(day, month, year);
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={cn(
            "h-24 border border-gray-100 p-1 overflow-hidden",
            isToday && "bg-blue-50/50"
          )}
        >
          <div className={cn("text-xs font-medium mb-1", isToday && "text-[#3ECF8E]")}>
            {day}
          </div>
          <div className="space-y-1">
            {dayProjects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject(p);
                  setShowDetail(true);
                }}
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80",
                  statusColors[p.status] || "bg-gray-50 text-gray-600"
                )}
              >
                {p.name}
              </div>
            ))}
            {dayProjects.length > 3 && (
              <div className="text-[10px] text-[#717171] pl-1">
                +{dayProjects.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <Card>
        <CardHeader className="border-b border-[#E5E5E1]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                className="border-[#E5E5E1]"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
                className="border-[#E5E5E1]"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                className="border-[#E5E5E1]"
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#E5E5E1]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="p-2 text-xs font-medium text-[#717171] text-center bg-[#F3F3F1]">
                {day}
              </div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7">{days}</div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717171]" />
            <Input
              placeholder="Search projects..."
              className="pl-9 w-64 bg-[#F3F3F1] border-[#E5E5E1] h-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-32 bg-[#F3F3F1] border-[#E5E5E1] h-9">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#E5E5E1]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={cn(
              "border-[#E5E5E1] h-9",
              showAdvancedFilters && "bg-[#3ECF8E]/10 border-[#3ECF8E] text-[#3ECF8E]"
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(clientFilter !== "all" || leadFilter !== "all" || dateFromFilter || dateToFilter) && (
              <span className="ml-1 w-2 h-2 bg-[#3ECF8E] rounded-full" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-[#E5E5E1] rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("table")}
              className={cn(
                "h-9 rounded-none border-none",
                viewMode === "table" ? "bg-[#3ECF8E] text-white" : "bg-white"
              )}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("calendar")}
              className={cn(
                "h-9 rounded-none border-none",
                viewMode === "calendar" ? "bg-[#3ECF8E] text-white" : "bg-white"
              )}
            >
              <Calendar className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-sm text-[#717171]">
            {total} project{total !== 1 ? "s" : ""}
          </div>
          <Button onClick={fetchProjects} variant="outline" className="border-[#E5E5E1]" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreate(true)} className="bg-[#3ECF8E] hover:bg-[#34b27b] text-white" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card className="border-[#E5E5E1] bg-[#F9F9F7]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm">Advanced Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setClientFilter("all");
                  setLeadFilter("all");
                  setDateFromFilter("");
                  setDateToFilter("");
                }}
                className="text-xs text-[#3ECF8E] hover:text-[#34b27b]"
              >
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#717171]">Client</label>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="bg-white border-[#E5E5E1] h-9">
                    <SelectValue placeholder="All clients" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
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
                <label className="text-xs font-medium text-[#717171]">Project Lead</label>
                <Select value={leadFilter} onValueChange={setLeadFilter}>
                  <SelectTrigger className="bg-white border-[#E5E5E1] h-9">
                    <SelectValue placeholder="All leads" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E1]">
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
                <label className="text-xs font-medium text-[#717171]">Start Date From</label>
                <Input
                  type="date"
                  className="bg-white border-[#E5E5E1] h-9"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#717171]">Start Date To</label>
                <Input
                  type="date"
                  className="bg-white border-[#E5E5E1] h-9"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <MoreVertical className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{total}</p>
                <p className="text-xs text-[#717171]">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{projects.filter(p => p.status === "active").length}</p>
                <p className="text-xs text-[#717171]">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{projects.filter(p => p.status === "complete").length}</p>
                <p className="text-xs text-[#717171]">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {projects
                    .filter(p => p.budget)
                    .reduce((sum, p) => sum + parseFloat(p.budget || "0"), 0)
                    .toLocaleString("bt-BT", { style: "currency", currency: "BTN" })}
                </p>
                <p className="text-xs text-[#717171]">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects View - Table or Calendar */}
      {viewMode === "table" ? (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E5E5E1] bg-[#F3F3F1]">
                <TableHead className="text-xs text-[#717171]">Project</TableHead>
                <TableHead className="text-xs text-[#717171]">Client</TableHead>
                <TableHead className="text-xs text-[#717171]">Lead</TableHead>
                <TableHead className="text-xs text-[#717171]">Status</TableHead>
                <TableHead className="text-xs text-[#717171]">Progress</TableHead>
                <TableHead className="text-xs text-[#717171]">Budget</TableHead>
                <TableHead className="text-xs text-[#717171]">Start Date</TableHead>
                <TableHead className="text-xs text-[#717171]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length > 0 ? projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="border-[#E5E5E1] hover:bg-[#F3F3F1] cursor-pointer"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowDetail(true);
                  }}
                >
                  <TableCell className="font-medium text-sm">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-[#717171] truncate max-w-[200px]">{project.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{project.clientName || "-"}</TableCell>
                  <TableCell className="text-sm">
                    {project.leadName ? (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#717171]" />
                        {project.leadName}
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] px-2 ${statusColors[project.status] || ""}`}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#F3F3F1] rounded-full overflow-hidden">
                        <div className="h-full bg-[#3ECF8E] rounded-full transition-all" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                      <span className="text-xs text-[#717171]">{project.progress || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#717171]">
                    {project.budget ? parseFloat(project.budget).toLocaleString("bt-BT", { style: "currency", currency: "BTN" }) : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-[#717171]">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#717171]">
                    {loading ? "Loading..." : "No projects found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E1]">
              <div className="text-sm text-[#717171]">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-[#E5E5E1]"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-[#E5E5E1]"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      ) : (
        <CalendarView />
      )}

      {/* Create Project Modal */}
      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleProjectCreated}
        />
      )}

      {/* Project Detail Modal */}
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
