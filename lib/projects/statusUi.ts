/** Shared project status labels/colors for Wave A UI (ERP bible). */

export const PROJECT_STATUSES = [
  "needs_quote",
  "quoted",
  "demo",
  "advance_paid",
  "in_progress",
  "testing",
  "done",
  "on_hold",
  "cancelled",
] as const;

export type BibleProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  needs_quote: "Needs quote",
  quoted: "Quoted",
  demo: "Demo",
  advance_paid: "Advance paid",
  in_progress: "In progress",
  testing: "Testing / handover",
  done: "Done",
  on_hold: "On hold",
  cancelled: "Cancelled",
  // legacy
  planning: "Quoted",
  active: "In progress",
  complete: "Done",
};

/** Solid-enough fills so outline Badge does not read as plain white. */
export const PROJECT_STATUS_COLORS: Record<string, string> = {
  needs_quote: "bg-amber-100 text-amber-900 border-amber-300",
  quoted: "bg-slate-100 text-slate-800 border-slate-300",
  demo: "bg-violet-100 text-violet-900 border-violet-300",
  advance_paid: "bg-emerald-100 text-emerald-900 border-emerald-300",
  in_progress: "bg-green-100 text-green-900 border-green-300",
  testing: "bg-sky-100 text-sky-900 border-sky-300",
  done: "bg-blue-100 text-blue-900 border-blue-300",
  on_hold: "bg-orange-100 text-orange-900 border-orange-300",
  cancelled: "bg-red-100 text-red-900 border-red-300",
  planning: "bg-slate-100 text-slate-800 border-slate-300",
  active: "bg-green-100 text-green-900 border-green-300",
  complete: "bg-blue-100 text-blue-900 border-blue-300",
};

export const PRODUCT_OPTIONS = [
  { key: "rancelab", label: "RanceLab" },
  { key: "pelbu_pos", label: "Pelbu POS" },
  { key: "website", label: "Website" },
  { key: "cctv", label: "CCTV" },
  { key: "networking", label: "Networking" },
] as const;

/** Next statuses staff can pick from current (UI helper; server still validates). */
export function nextStatusOptions(current: string): string[] {
  const map: Record<string, string[]> = {
    needs_quote: ["quoted", "cancelled"],
    quoted: ["demo", "advance_paid", "in_progress", "on_hold", "cancelled"],
    demo: ["advance_paid", "quoted", "on_hold", "cancelled"],
    advance_paid: ["in_progress", "on_hold", "cancelled"],
    in_progress: ["testing", "on_hold", "cancelled"],
    testing: ["in_progress", "done", "on_hold"],
    done: [],
    on_hold: ["quoted", "demo", "advance_paid", "in_progress", "cancelled"],
    cancelled: [],
    planning: ["demo", "advance_paid", "in_progress", "on_hold", "cancelled"],
    active: ["testing", "on_hold", "cancelled"],
    complete: [],
  };
  return map[current] || [];
}

export function formatNu(value?: number | string | null) {
  if (value === undefined || value === null || value === "") return "—";
  const n = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(n)) return "—";
  return `Nu. ${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
