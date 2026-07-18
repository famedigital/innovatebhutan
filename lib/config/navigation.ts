import {
  LayoutDashboard,
  FolderKanban,
  ShoppingCart,
  ShieldCheck,
  Ticket,
  FileText,
  Receipt,
  ArrowUpDown,
  Users,
  Clock,
  DollarSign,
  Briefcase,
  Building2,
  ScrollText,
  Settings,
  BookOpen,
  Globe,
  Image,
  TrendingUp,
  MessageSquare,
  Brain,
  Bell,
  Package,
  Building,
  Calculator,
  AlertTriangle,
  MessagesSquare,
  UserCog,
  BarChart3,
} from "lucide-react";

export type UserRole = "ADMIN" | "STAFF" | "CLIENT";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: UserRole[];
  badge?: number | string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
  roles?: UserRole[];
}

export const navigationConfig: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Projects", href: "/admin/projects", icon: FolderKanban },
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { title: "AMC", href: "/admin/amc", icon: ShieldCheck },
      { title: "Support Tickets", href: "/admin/tickets", icon: Ticket },
      { title: "Problems", href: "/admin/support/problems", icon: AlertTriangle },
      { title: "Communications", href: "/admin/support/communications", icon: MessagesSquare },
      { title: "Support Team", href: "/admin/support/team", icon: UserCog },
    ],
  },
  {
    title: "Financials",
    roles: ["ADMIN"],
    items: [
      { title: "Invoices", href: "/admin/invoice", icon: FileText },
      { title: "Expenses", href: "/admin/expenses", icon: Receipt },
      { title: "Transactions", href: "/admin/transactions", icon: ArrowUpDown },
      { title: "Accounts", href: "/admin/accounts", icon: Calculator },
      { title: "Finance Reports", href: "/admin/finance/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Inventory & Assets",
    roles: ["ADMIN", "STAFF"],
    items: [
      { title: "Inventory", href: "/admin/inventory", icon: Package },
      { title: "Procurement", href: "/admin/procurement", icon: ShoppingCart },
      { title: "Fixed Assets", href: "/admin/assets", icon: Building },
    ],
  },
  {
    title: "Human Capital",
    roles: ["ADMIN"],
    items: [
      { title: "Employees", href: "/admin/employees", icon: Users },
      { title: "Attendance", href: "/admin/attendance", icon: Clock },
      { title: "Payroll", href: "/admin/hr", icon: DollarSign },
      { title: "HR Reports", href: "/admin/hr/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Master Data",
    roles: ["ADMIN", "STAFF"],
    items: [
      { title: "Services", href: "/admin/services", icon: Briefcase },
      { title: "Clients", href: "/admin/clients", icon: Building2 },
    ],
  },
  {
    title: "System",
    roles: ["ADMIN"],
    items: [
      { title: "Notifications", href: "/admin/notifications", icon: Bell },
      { title: "Audit Logs", href: "/admin/audit", icon: ScrollText },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Frontend",
    roles: ["ADMIN"],
    items: [
      { title: "Blog & Content", href: "/admin/blog", icon: BookOpen },
      { title: "Website", href: "/admin/website", icon: Globe },
      { title: "Media", href: "/admin/media", icon: Image },
      { title: "Marketing", href: "/admin/marketing", icon: TrendingUp },
    ],
  },
  {
    title: "Support",
    items: [
      { title: "WhatsApp", href: "/admin/whatsapp", icon: MessageSquare },
      { title: "Bot Training", href: "/admin/ai/bot-training", icon: Brain },
    ],
  },
];
