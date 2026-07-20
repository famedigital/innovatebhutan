"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PROJECT_STATUS_LABELS } from "@/lib/projects/statusUi";

type Project = {
  id: number;
  name: string;
  status: string | null;
  productKey: string | null;
  description: string | null;
  updatedAt: string | null;
};

export default function PortalProjectsPage() {
  const [rows, setRows] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/portal/projects");
      const json = await res.json();
      if (json.success) setRows(json.data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Projects</h1>
      <p className="text-sm text-muted-foreground">Status of your jobs (no pricing).</p>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  {p.productKey && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.productKey}
                    </p>
                  )}
                  {p.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0">
                  {PROJECT_STATUS_LABELS[p.status || ""] ||
                    p.status?.replace(/_/g, " ") ||
                    "—"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
