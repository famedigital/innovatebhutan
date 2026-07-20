"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type Amc = {
  id: number;
  contractNumber: string | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  amount: string | null;
  productKey: string | null;
};

export default function PortalAmcPage() {
  const [rows, setRows] = useState<Amc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/portal/amcs");
      const json = await res.json();
      if (json.success) setRows(json.data || []);
      setLoading(false);
    })();
  }, []);

  const requestRenew = async (amcId: number) => {
    setBusyId(amcId);
    try {
      const res = await fetch("/api/portal/amcs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amcId }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Request failed");
        return;
      }
      toast.success("Renewal requested — our team will follow up");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">AMC</h1>
      <p className="text-sm text-muted-foreground">
        See contract expiry and request renewal.
      </p>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No AMC contracts.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((a) => {
            const end = a.endDate ? new Date(a.endDate) : null;
            const days = end
              ? Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;
            const soon = days !== null && days >= 0 && days <= 30;
            return (
              <Card key={a.id} className={soon ? "border-amber-300" : ""}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">
                      {a.contractNumber || `AMC-${a.id}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.productKey || "software"}
                      {end ? ` · ends ${end.toLocaleDateString()}` : ""}
                      {days !== null ? ` · ${days}d` : ""}
                    </p>
                    {a.amount && (
                      <p className="text-xs mt-0.5">
                        Nu. {Number(a.amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{a.status}</Badge>
                    <Button
                      size="sm"
                      variant={soon ? "default" : "outline"}
                      disabled={busyId === a.id}
                      onClick={() => void requestRenew(a.id)}
                    >
                      {busyId === a.id ? "…" : "Request renew"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
