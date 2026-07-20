"use client";

import { useCallback, useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  flushOfflineQueue,
  queuedCount,
} from "@/lib/pwa/offline-queue";

export function OfflineQueueBadge() {
  const [count, setCount] = useState(0);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setCount(await queuedCount());
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    void refresh();
    const onOnline = () => {
      setOnline(true);
      void (async () => {
        const r = await flushOfflineQueue();
        if (r.flushed > 0) {
          toast.success(`Synced ${r.flushed} offline update(s)`);
        }
        await refresh();
      })();
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const t = setInterval(() => void refresh(), 15_000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(t);
    };
  }, [refresh]);

  if (count === 0 && online) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-xs text-muted-foreground"
      disabled={syncing || !online || count === 0}
      onClick={async () => {
        setSyncing(true);
        try {
          const r = await flushOfflineQueue();
          if (r.flushed > 0) toast.success(`Synced ${r.flushed}`);
          if (r.failed > 0) toast.error(`${r.failed} failed to sync`);
          await refresh();
        } finally {
          setSyncing(false);
        }
      }}
      title={
        online
          ? `${count} queued — tap to sync`
          : `Offline · ${count} queued`
      }
    >
      {syncing ? (
        <RefreshCw className="size-3.5 animate-spin" />
      ) : (
        <CloudOff className="size-3.5" />
      )}
      {!online ? "Offline" : count > 0 ? `${count}` : null}
    </Button>
  );
}
