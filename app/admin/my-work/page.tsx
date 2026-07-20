"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, ExternalLink, CheckSquare } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveDataList } from "@/components/admin/responsive-data-list";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { toast } from "sonner";

type MyTask = {
  id: number;
  projectId: number;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  projectName?: string | null;
  clientName?: string | null;
};

export default function MyWorkPage() {
  const [tasks, setTasks] = useState<MyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks/?scope=mine");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load tasks");
      setTasks(json.data || []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="My Tasks"
        description="Project tasks assigned to you"
        actions={
          <Button variant="outline" size="sm" onClick={() => load()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md">
        <Card className="shadow-none">
          <CardContent className="p-3">
            <p className="text-xl font-semibold tabular-nums">{open.length}</p>
            <p className="text-[10px] text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-3">
            <p className="text-xl font-semibold tabular-nums">{done.length}</p>
            <p className="text-[10px] text-muted-foreground">Done</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : (
        <ResponsiveDataList
          isEmpty={tasks.length === 0}
          empty="No project tasks assigned to you yet."
          tableHeader={
            <>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Open</TableHead>
            </>
          }
          tableBody={tasks.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-medium">{t.title}</TableCell>
              <TableCell>{t.projectName || `Project #${t.projectId}`}</TableCell>
              <TableCell>{t.clientName || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize text-[10px]">
                  {t.status?.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="capitalize text-sm">{t.priority}</TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/projects/`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          mobileItems={tasks.map((t) => (
            <Item key={t.id} size="sm" asChild>
              <Link href="/admin/projects/">
                <ItemMedia variant="icon">
                  <CheckSquare className="h-4 w-4" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{t.title}</ItemTitle>
                  <ItemDescription>
                    {t.projectName || `Project #${t.projectId}`}
                    {t.clientName ? ` · ${t.clientName}` : ""}
                  </ItemDescription>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {t.status?.replace("_", " ")}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {t.priority}
                    </span>
                  </div>
                </ItemContent>
                <ItemActions>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </ItemActions>
              </Link>
            </Item>
          ))}
        />
      )}
    </div>
  );
}
