/**
 * Staff ERP Manual — navigation catalog.
 * Files resolve under process.cwd() (repo root).
 */

export type ManualDoc = {
  slug: string;
  title: string;
  description?: string;
  /** Path relative to repo root */
  file: string;
  updated?: string;
};

export type ManualGroup = {
  title: string;
  items: ManualDoc[];
};

export const MANUAL_GROUPS: ManualGroup[] = [
  {
    title: "Start here",
    items: [
      {
        slug: "overview",
        title: "Overview",
        description: "What this ERP is and how to use this manual",
        file: "docs/manual/overview.md",
        updated: "2026-07-21",
      },
      {
        slug: "getting-started",
        title: "Getting started",
        description: "Login, roles, and first-day checklist",
        file: "docs/manual/getting-started.md",
        updated: "2026-07-21",
      },
      {
        slug: "senior-demo",
        title: "Senior demo path",
        description: "Acceptance walkthrough for Waves A–C",
        file: "docs/manual/senior-demo.md",
        updated: "2026-07-21",
      },
    ],
  },
  {
    title: "Company operating system",
    items: [
      {
        slug: "bible-os",
        title: "How the company runs",
        description: "Owner interview — operating rules",
        file: "docs/erp-bible/00-company-operating-system.md",
        updated: "2026-07-21",
      },
      {
        slug: "bible-modules",
        title: "Module requirements",
        description: "Fields, stages, RBAC per module",
        file: "docs/erp-bible/01-module-requirements.md",
        updated: "2026-07-21",
      },
      {
        slug: "gap-map",
        title: "Gap map (bible ↔ code)",
        description: "Drawing-board priorities and wave status",
        file: "docs/erp-bible/02-gap-map.md",
        updated: "2026-07-21",
      },
    ],
  },
  {
    title: "How to use modules",
    items: [
      {
        slug: "module-clients",
        title: "Clients",
        file: "docs/manual/modules/clients.md",
        updated: "2026-07-21",
      },
      {
        slug: "module-projects",
        title: "Projects & money",
        file: "docs/manual/modules/projects.md",
        updated: "2026-07-21",
      },
      {
        slug: "module-invoices",
        title: "Invoices & payments",
        file: "docs/manual/modules/invoices.md",
        updated: "2026-07-21",
      },
      {
        slug: "module-amc",
        title: "AMC",
        file: "docs/manual/modules/amc.md",
        updated: "2026-07-21",
      },
      {
        slug: "module-tickets",
        title: "Tickets",
        file: "docs/manual/modules/tickets.md",
        updated: "2026-07-21",
      },
      {
        slug: "module-inventory",
        title: "Inventory",
        file: "docs/manual/modules/inventory.md",
        updated: "2026-07-21",
      },
      {
        slug: "module-portal",
        title: "Client portal",
        file: "docs/manual/modules/portal.md",
        updated: "2026-07-21",
      },
      {
        slug: "module-pwa",
        title: "Mobile PWA",
        file: "docs/manual/modules/pwa.md",
        updated: "2026-07-21",
      },
    ],
  },
  {
    title: "Waves & migrations",
    items: [
      {
        slug: "wave-a",
        title: "Wave A — Money & stages",
        file: "docs/erp-bible/WAVE_A_NOTES.md",
        updated: "2026-07-21",
      },
      {
        slug: "wave-b",
        title: "Wave B — Ops harden",
        file: "docs/erp-bible/WAVE_B_NOTES.md",
        updated: "2026-07-21",
      },
      {
        slug: "wave-c",
        title: "Wave C — Portal",
        file: "docs/erp-bible/WAVE_C_NOTES.md",
        updated: "2026-07-21",
      },
      {
        slug: "migrations",
        title: "SQL migrations to run",
        file: "docs/manual/migrations.md",
        updated: "2026-07-21",
      },
    ],
  },
  {
    title: "History & engineering",
    items: [
      {
        slug: "timeline",
        title: "Timeline & commits",
        description: "Project history, interviews, major ships",
        file: "docs/manual/timeline.md",
        updated: "2026-07-21",
      },
      {
        slug: "debugs",
        title: "Debugs & fixes log",
        file: "docs/manual/debugs.md",
        updated: "2026-07-21",
      },
      {
        slug: "architecture",
        title: "Architecture notes",
        file: "docs/manual/architecture.md",
        updated: "2026-07-21",
      },
    ],
  },
  {
    title: "Ops & runbooks",
    items: [
      {
        slug: "go-live",
        title: "Go-live checklist",
        file: "docs/ERP_GO_LIVE_CHECKLIST.md",
        updated: "2026-05-12",
      },
      {
        slug: "smoke",
        title: "Admin smoke checklist",
        file: "docs/ADMIN_SMOKE_CHECKLIST.md",
        updated: "2026-05-12",
      },
      {
        slug: "pwa-ops",
        title: "PWA ops notes",
        file: "docs/MOBILE_PWA.md",
        updated: "2026-05-12",
      },
      {
        slug: "security",
        title: "Security fixes (2026-05)",
        file: "docs/SECURITY_FIXES_2026-05-12.md",
        updated: "2026-05-12",
      },
      {
        slug: "known-issues",
        title: "Known issues",
        file: "docs/ERP_KNOWN_ISSUES.md",
        updated: "2026-05-12",
      },
    ],
  },
  {
    title: "Reference docs",
    items: [
      {
        slug: "schema",
        title: "Database schema",
        file: "docs/ERP_DATABASE_SCHEMA.md",
        updated: "2026-05-12",
      },
      {
        slug: "uml",
        title: "UML diagrams",
        file: "docs/uml/ERP_UML_DIAGRAMS.md",
        updated: "2026-05-12",
      },
      {
        slug: "payroll",
        title: "Payroll module",
        file: "docs/payroll-module-implementation.md",
        updated: "2026-04-19",
      },
      {
        slug: "projects-deep",
        title: "Projects deep scan",
        file: "docs/projects-module-deep-scan.md",
        updated: "2026-04-19",
      },
      {
        slug: "admin-ui",
        title: "Admin UI notes",
        file: "docs/ADMIN_UI.md",
        updated: "2026-05-12",
      },
    ],
  },
];

export function allManualDocs(): ManualDoc[] {
  return MANUAL_GROUPS.flatMap((g) => g.items);
}

export function getManualDoc(slug: string): ManualDoc | undefined {
  return allManualDocs().find((d) => d.slug === slug);
}

export const MANUAL_DEFAULT_SLUG = "overview";
