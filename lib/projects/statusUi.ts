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

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  needs_quote: "bg-amber-50 text-amber-800 border-amber-200",
  quoted: "bg-slate-50 text-slate-700 border-slate-200",
  demo: "bg-violet-50 text-violet-700 border-violet-200",
  advance_paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-green-50 text-green-700 border-green-200",
  testing: "bg-sky-50 text-sky-700 border-sky-200",
  done: "bg-blue-50 text-blue-700 border-blue-200",
  on_hold: "bg-orange-50 text-orange-700 border-orange-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  planning: "bg-slate-50 text-slate-700 border-slate-200",
  active: "bg-green-50 text-green-700 border-green-200",
  complete: "bg-blue-50 text-blue-700 border-blue-200",
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
