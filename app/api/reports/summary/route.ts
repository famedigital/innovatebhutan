import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql, eq, and, gte, lte, desc, count } from "drizzle-orm";
import {
  clients,
  projects,
  tickets,
  transactions,
  invoices,
  payslips,
  employees,
  amcs,
} from "@/db/schema";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";

interface SummaryStats {
  clients: number;
  projects: number;
  openTickets: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  activeProjects: number;
  pendingInvoices: number;
  totalEmployees: number;
  pendingPayroll: number;
  activeAMC: number;
  expiringAMC: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ActivityItem {
  id: string;
  type: "payment" | "project" | "client" | "ticket" | "invoice" | "payroll";
  title: string;
  description: string;
  amount?: number;
  status?: string;
  createdAt: Date;
}

/**
 * GET /api/reports/summary - Get dashboard summary data
 *
 * Query params:
 * - months: Number of months to include (default: 6)
 *
 * Returns:
 * - stats: Summary statistics
 * - revenueData: Monthly revenue/expenses for chart
 * - recentActivity: Recent activity items
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get("months") || "6");

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get summary stats in parallel
    const [
      clientCount,
      projectCount,
      openTicketCount,
      monthlyIncome,
      monthlyExpense,
      activeProjectCount,
      pendingInvoiceCount,
      employeeCount,
      pendingPayrollCount,
      activeAMCCount,
      expiringAMCCount,
      recentInvoices,
      recentProjects,
      recentTickets,
      recentTransactions,
    ] = await Promise.all([
      db.select({ count: count() }).from(clients),
      db
        .select({ count: count() })
        .from(projects)
        .where(eq(projects.status, "active")),
      db
        .select({ count: count() })
        .from(tickets)
        .where(eq(tickets.status, "open")),
      db
        .select({
          total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .where(
          and(
            eq(sql`UPPER(${transactions.type})`, "INCOME"),
            gte(transactions.date, startOfMonth)
          )
        ),
      db
        .select({
          total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .where(
          and(
            eq(sql`UPPER(${transactions.type})`, "EXPENSE"),
            gte(transactions.date, startOfMonth)
          )
        ),
      db
        .select({ count: count() })
        .from(projects)
        .where(eq(projects.status, "active")),
      db
        .select({ count: count() })
        .from(invoices)
        .where(eq(invoices.status, "sent")),
      db.select({ count: count() }).from(employees),
      db
        .select({ count: count() })
        .from(payslips)
        .where(eq(payslips.status, "draft")),
      db
        .select({ count: count() })
        .from(amcs)
        .where(eq(amcs.status, "active")),
      db
        .select({ count: count() })
        .from(amcs)
        .where(
          and(
            eq(amcs.status, "active"),
            sql`${amcs.endDate} <= NOW() + INTERVAL '30 days'`
          )
        ),
      db
        .select()
        .from(invoices)
        .orderBy(desc(invoices.createdAt))
        .limit(5),
      db
        .select({
          id: projects.id,
          name: projects.name,
          status: projects.status,
          createdAt: projects.createdAt,
        })
        .from(projects)
        .orderBy(desc(projects.createdAt))
        .limit(5),
      db
        .select({
          id: tickets.id,
          subject: tickets.subject,
          status: tickets.status,
          priority: tickets.priority,
          createdAt: tickets.createdAt,
        })
        .from(tickets)
        .orderBy(desc(tickets.createdAt))
        .limit(5),
      db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.date))
        .limit(5),
    ]);

    const stats: SummaryStats = {
      clients: clientCount[0]?.count || 0,
      projects: projectCount[0]?.count || 0,
      openTickets: openTicketCount[0]?.count || 0,
      monthlyRevenue: monthlyIncome[0]?.total || 0,
      monthlyExpenses: monthlyExpense[0]?.total || 0,
      activeProjects: activeProjectCount[0]?.count || 0,
      pendingInvoices: pendingInvoiceCount[0]?.count || 0,
      totalEmployees: employeeCount[0]?.count || 0,
      pendingPayroll: pendingPayrollCount[0]?.count || 0,
      activeAMC: activeAMCCount[0]?.count || 0,
      expiringAMC: expiringAMCCount[0]?.count || 0,
    };

    // Get monthly revenue data for the chart
    const revenueData: RevenueData[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [monthIncome, monthExpense] = await Promise.all([
        db
          .select({
            total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
          })
          .from(transactions)
          .where(
            and(
              eq(sql`UPPER(${transactions.type})`, "INCOME"),
              gte(transactions.date, monthStart),
              lte(transactions.date, monthEnd)
            )
          ),
        db
          .select({
            total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
          })
          .from(transactions)
          .where(
            and(
              eq(sql`UPPER(${transactions.type})`, "EXPENSE"),
              gte(transactions.date, monthStart),
              lte(transactions.date, monthEnd)
            )
          ),
      ]);

      const revenue = monthIncome[0]?.total || 0;
      const expenses = monthExpense[0]?.total || 0;

      revenueData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    }

    // Build activity feed
    const activities: ActivityItem[] = [];

    recentTransactions.forEach((t) => {
      const type = String(t.type).toUpperCase();
      activities.push({
        id: `tx-${t.id}`,
        type: "payment",
        title: type === "INCOME" ? "Payment Received" : "Expense Recorded",
        description: t.notes || t.category || type.toLowerCase(),
        amount: Number(t.amount),
        status: "completed",
        createdAt: t.date ?? new Date(),
      });
    });

    recentProjects.forEach((p) => {
      activities.push({
        id: `proj-${p.id}`,
        type: "project",
        title: p.name ?? "Unnamed Project",
        description: `Project ${p.status ?? "unknown"}`,
        status: p.status === "active" ? "pending" : (p.status ?? "unknown"),
        createdAt: p.createdAt ?? new Date(),
      });
    });

    recentTickets.forEach((t) => {
      activities.push({
        id: `ticket-${t.id}`,
        type: "ticket",
        title: t.subject ?? "No subject",
        description: `Priority: ${t.priority ?? "normal"}`,
        status: t.status === "open" ? "pending" : (t.status ?? "unknown"),
        createdAt: t.createdAt ?? new Date(),
      });
    });

    recentInvoices.forEach((inv) => {
      activities.push({
        id: `inv-${inv.id}`,
        type: "invoice",
        title: `Invoice ${inv.invoiceNumber ?? `INV-${inv.id}`}`,
        description: `Client ID: ${inv.clientId}`,
        amount: inv.total ? Number(inv.total) : undefined,
        status: inv.status === "overdue" ? "overdue" : (inv.status ?? "unknown"),
        createdAt: inv.createdAt ?? new Date(),
      });
    });

    // Sort by date and limit
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      data: {
        stats,
        revenueData,
        recentActivity: activities.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("[API /api/reports/summary] Error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500,
    });
  }
}
