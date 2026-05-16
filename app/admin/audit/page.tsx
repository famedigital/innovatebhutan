"use client";

import { useEffect, useState } from "react";
import { Shield, Search, Filter, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";

interface AuditLog {
  id: number;
  operatorId: number | null;
  operatorName: string | null;
  operatorUserId: string | null;
  action: string;
  entityType: string;
  entityId: number | null;
  details: Record<string, any> | null;
  createdAt: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActionColor(action: string) {
  switch (action) {
    case "CREATE":
      return "bg-green-50 text-green-600 border-green-200";
    case "UPDATE":
      return "bg-blue-50 text-blue-600 border-blue-200";
    case "DELETE":
      return "bg-red-50 text-red-600 border-red-200";
    case "CHECK_IN":
      return "bg-purple-50 text-purple-600 border-purple-200";
    case "CHECK_OUT":
      return "bg-orange-50 text-orange-600 border-orange-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const supabase = createClient();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "50");
      if (actionFilter !== "all") params.append("action", actionFilter);
      if (entityFilter !== "all") params.append("entityType", entityFilter);

      const response = await fetch(`/api/audit?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
      } else if (response.status === 403) {
        alert("Access denied. Admin privileges required.");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(searchLower) ||
      log.entityType?.toLowerCase().includes(searchLower) ||
      log.operatorName?.toLowerCase().includes(searchLower) ||
      log.entityId?.toString().includes(searchLower)
    );
  });

  const entityTypes = Array.from(new Set(logs.map((l) => l.entityType).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Audit Logs
            </h1>
            <Badge className="bg-red-50 text-red-600 border-red-200 text-xs">Admin Only</Badge>
          </div>
          <p className="text-sm text-muted-foreground">System activity and compliance tracking</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="CHECK_IN">Check In</option>
              <option value="CHECK_OUT">Check Out</option>
            </select>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Entities</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="text-sm">{formatDate(log.createdAt)}</TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-xs text-muted-foreground ml-1">#{log.entityId}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{log.operatorName || "System"}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          alert(JSON.stringify(log.details, null, 2));
                        }}
                        className="h-7 text-xs"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
