/**
 * IndexedDB offline mutation queue for field staff (Wave B).
 * Queues PATCH/POST when offline; flushes when back online.
 */

const DB_NAME = "innovates-offline-v1";
const STORE = "mutations";

export type QueuedMutation = {
  id?: number;
  method: "POST" | "PUT" | "PATCH";
  url: string;
  body?: unknown;
  createdAt: string;
  label?: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueMutation(
  mutation: Omit<QueuedMutation, "id" | "createdAt"> & { createdAt?: string }
): Promise<number> {
  const db = await openDb();
  const row: QueuedMutation = {
    ...mutation,
    createdAt: mutation.createdAt || new Date().toISOString(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).add(row);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function listQueuedMutations(): Promise<QueuedMutation[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as QueuedMutation[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function removeQueuedMutation(id: number): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function queuedCount(): Promise<number> {
  const rows = await listQueuedMutations();
  return rows.length;
}

/** Flush queue; returns how many succeeded. */
export async function flushOfflineQueue(): Promise<{
  flushed: number;
  failed: number;
}> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { flushed: 0, failed: 0 };
  }
  const rows = await listQueuedMutations();
  let flushed = 0;
  let failed = 0;
  for (const row of rows) {
    if (row.id == null) continue;
    try {
      const res = await fetch(row.url, {
        method: row.method,
        headers: { "Content-Type": "application/json" },
        body: row.body !== undefined ? JSON.stringify(row.body) : undefined,
      });
      if (!res.ok) {
        failed++;
        continue;
      }
      await removeQueuedMutation(row.id);
      flushed++;
    } catch {
      failed++;
    }
  }
  return { flushed, failed };
}

/**
 * Fetch wrapper: if offline (or network error on mutating request), enqueue.
 */
export async function fetchOrQueue(
  url: string,
  init: RequestInit & { queueLabel?: string }
): Promise<Response | { queued: true; id: number }> {
  const method = (init.method || "GET").toUpperCase();
  const isMutating = method === "POST" || method === "PUT" || method === "PATCH";

  if (isMutating && typeof navigator !== "undefined" && !navigator.onLine) {
    let body: unknown;
    if (typeof init.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    }
    const id = await enqueueMutation({
      method: method as "POST" | "PUT" | "PATCH",
      url,
      body,
      label: init.queueLabel,
    });
    return { queued: true, id };
  }

  try {
    return await fetch(url, init);
  } catch (err) {
    if (isMutating) {
      let body: unknown;
      if (typeof init.body === "string") {
        try {
          body = JSON.parse(init.body);
        } catch {
          body = init.body;
        }
      }
      const id = await enqueueMutation({
        method: method as "POST" | "PUT" | "PATCH",
        url,
        body,
        label: init.queueLabel,
      });
      return { queued: true, id };
    }
    throw err;
  }
}

export function isQueuedResult(
  r: Response | { queued: true; id: number }
): r is { queued: true; id: number } {
  return "queued" in r && r.queued === true;
}
