"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Users, UserPlus, Edit, Trash2, Search, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateEmployeeModal } from "./create-employee-modal";
import { EditEmployeeModal } from "./edit-employee-modal";
import { createClient } from "@/utils/supabase/client";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

interface Employee {
  id: number;
  profileId: number;
  fullName?: string | null;
  designation: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  tin: string | null;
  pfNumber: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankBranch: string | null;
  status: string;
  baseSalary?: string | null;
  photoUrl: string | null;
  userId: string | null;
}

interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
  terminatedEmployees: number;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
            {title}
          </span>
          <div className="flex size-7 items-center justify-center rounded-md border bg-muted/40 sm:size-8">
            <Icon className={`size-3.5 sm:size-4 ${color}`} />
          </div>
        </div>
        <p className="mt-2 text-xl font-semibold sm:text-2xl">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const supabase = createClient();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(`/api/employees?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data || []);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/employees/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error("Stats Error:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, [search, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchEmployees();
        fetchStats();
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-600 border-green-200";
      case "inactive":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "on_leave":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "terminated":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Employees"
        description="Manage your team members"
        actions={
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Button>
        }
      />

      {stats ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard title="Total" value={stats.totalEmployees} icon={Users} color="text-foreground" />
          <MetricCard title="Active" value={stats.activeEmployees} icon={Users} color="text-foreground" />
          <MetricCard title="On Leave" value={stats.onLeaveEmployees} icon={Users} color="text-amber-700" />
          <MetricCard title="Inactive" value={stats.inactiveEmployees} icon={Users} color="text-muted-foreground" />
        </div>
      ) : null}

      {/* Filters */}
      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {loading ? (
          <Card className="shadow-none">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Loading...
            </CardContent>
          </Card>
        ) : employees.length === 0 ? (
          <Card className="shadow-none">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No employees found. Add your first team member to get started.
            </CardContent>
          </Card>
        ) : (
          employees.map((emp) => (
            <Card key={emp.id} className="shadow-none">
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">
                    {emp.fullName || "Unknown"}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {emp.designation || "—"} · {emp.department || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {emp.phone || "No phone"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge className={getStatusColor(emp.status)}>
                    {emp.status?.replace("_", " ") || "active"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingEmployee(emp)}>
                        <Edit className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(emp.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden shadow-none md:block">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Name</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : employees.length > 0 ? (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                          {emp.photoUrl ? (
                            <img
                              src={emp.photoUrl}
                              alt=""
                              className="size-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium">
                              {emp.fullName?.charAt(0).toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">
                          {emp.fullName || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{emp.designation || "—"}</TableCell>
                    <TableCell>{emp.department || "—"}</TableCell>
                    <TableCell>{emp.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(emp.status)}>
                        {emp.status?.replace("_", " ") || "active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingEmployee(emp)}>
                            <Edit className="mr-2 size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(emp.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No employees found. Add your first team member to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEmployees();
            fetchStats();
          }}
        />
      )}

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSuccess={() => {
            setEditingEmployee(null);
            fetchEmployees();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
