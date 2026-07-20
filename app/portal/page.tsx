"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, FileText, Ticket, Shield, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABELS } from "@/lib/projects/statusUi";

type Dash = {
  clientName?: string;
  stats: {
    projects: number;
    unpaidInvoices: number;
    openTickets: number;
    expiringAmc: number;
  };
  projects: Array<{ id: number; name: string; status: string | null }>;
  invoices: Array<{
    id: number;
    invoiceNumber: string | null;
    status: string | null;
    total: string | null;
  }>;
  tickets: Array<{ id: number; subject: string; status: string | null }>;
  amcs: Array<{
    id: number;
    contractNumber: string | null;
    status: string | null;
    endDate: string | null;
  }>;
  payInstructions?: { note: string; payee: string; gstTin: string };
};

export default function PortalHomePage() {
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/portal/me");
      const json = await res.json();
      if (!json.success) {
        setError(json.error || "Failed to load");
        return;
      }
      setData(json.data);
    })();
  }, []);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }
  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {data.clientName || "Client portal"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Projects, invoices, support, and AMC — invite-only access.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Projects", value: data.stats.projects, href: "/portal/projects" },
          {
            label: "Unpaid invoices",
            value: data.stats.unpaidInvoices,
            href: "/portal/invoices",
          },
          {
            label: "Open tickets",
            value: data.stats.openTickets,
            href: "/portal/tickets",
          },
          {
            label: "AMC · 30 days",
            value: data.stats.expiringAmc,
            href: "/portal/amc",
          },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:bg-muted/40 transition-colors">
              <CardContent className="p-4">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </p>
                <p className="text-2xl font-semibold tabular-nums mt-1">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {data.payInstructions && (
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-sm font-medium">How to pay</p>
            <p className="text-xs text-muted-foreground">{data.payInstructions.note}</p>
            <p className="text-xs">
              Payee: {data.payInstructions.payee} · GST/TIN:{" "}
              {data.payInstructions.gstTin}
            </p>
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link href="/portal/invoices">
                View invoices <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Section
          title="Recent projects"
          icon={Briefcase}
          href="/portal/projects"
          empty="No projects yet"
        >
          {data.projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
            >
              <span className="text-sm truncate">{p.name}</span>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {PROJECT_STATUS_LABELS[p.status || ""] ||
                  p.status?.replace(/_/g, " ") ||
                  "—"}
              </Badge>
            </div>
          ))}
        </Section>
        <Section
          title="Invoices"
          icon={FileText}
          href="/portal/invoices"
          empty="No invoices"
        >
          {data.invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
            >
              <span className="text-sm truncate">
                {inv.invoiceNumber || `INV-${inv.id}`}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {inv.status} · Nu.{" "}
                {Number(inv.total || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </Section>
        <Section
          title="Tickets"
          icon={Ticket}
          href="/portal/tickets"
          empty="No tickets"
        >
          {data.tickets.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
            >
              <span className="text-sm truncate">{t.subject}</span>
              <Badge variant="outline" className="text-[10px]">
                {t.status}
              </Badge>
            </div>
          ))}
        </Section>
        <Section title="AMC" icon={Shield} href="/portal/amc" empty="No AMC">
          {data.amcs.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-2 py-2 border-b last:border-0"
            >
              <span className="text-sm truncate">
                {a.contractNumber || `AMC-${a.id}`}
              </span>
              <span className="text-xs text-muted-foreground">
                {a.status}
                {a.endDate
                  ? ` · ${new Date(a.endDate).toLocaleDateString()}`
                  : ""}
              </span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  href,
  empty,
  children,
}: {
  title: string;
  icon: React.ElementType;
  href: string;
  empty: string;
  children: React.ReactNode;
}) {
  const childArr = Array.isArray(children) ? children : [children];
  const has = childArr.filter(Boolean).length > 0;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">{title}</h2>
          </div>
          <Link href={href} className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        {has ? children : (
          <p className="text-xs text-muted-foreground py-4">{empty}</p>
        )}
      </CardContent>
    </Card>
  );
}
