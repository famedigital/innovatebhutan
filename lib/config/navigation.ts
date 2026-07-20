import {
  LayoutDashboard,
  FolderKanban,
  ShoppingCart,
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
  BarChart3,
  Boxes,
  ListTodo,
  Shield,
  UserCog,
  CheckSquare,
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

/**
 * Target ERP IA (~8 groups). Clients live under Work, not Master Data.
 */
export const navigationConfig: NavGroup[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Work",
    items: [
      { title: "My Queue", href: "/admin/tickets?scope=mine", icon: ListTodo },
      { title: "My Tasks", href: "/admin/my-work", icon: CheckSquare },
      { title: "Clients", href: "/admin/clients", icon: Building2 },
      { title: "Tickets", href: "/admin/tickets", icon: Ticket },
      { title: "Projects", href: "/admin/projects", icon: FolderKanban },
    ],
  },
  {
    title: "Products",
    items: [
      { title: "All Products", href: "/admin/products", icon: Boxes },
      { title: "RanceLab", href: "/admin/products/rancelab", icon: Shield },
      { title: "Pelbu POS", href: "/admin/products/pelbu-pos", icon: Package },
      { title: "Website", href: "/admin/products/website", icon: Globe },
      { title: "CCTV", href: "/admin/products/cctv", icon: Building },
      { title: "Networking", href: "/admin/products/networking", icon: Building2 },
      { title: "Services Catalog", href: "/admin/services", icon: Briefcase },
    ],
  },
  {
    title: "Commercial",
    items: [
      { title: "AMC", href: "/admin/amc", icon: FileText },
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { title: "Invoices", href: "/admin/invoice", icon: FileText, roles: ["ADMIN"] },
    ],
  },
  {
    title: "Finance",
    roles: ["ADMIN"],
    items: [
      { title: "Expenses", href: "/admin/expenses", icon: Receipt },
      { title: "Ledger", href: "/admin/transactions", icon: ArrowUpDown },
      { title: "Accounts", href: "/admin/accounts", icon: Calculator },
      { title: "Reports", href: "/admin/finance/reports/", icon: BarChart3 },
    ],
  },
  {
    title: "People",
    roles: ["ADMIN"],
    items: [
      { title: "Employees", href: "/admin/employees", icon: Users },
      { title: "Attendance", href: "/admin/attendance", icon: Clock },
      { title: "Payroll", href: "/admin/hr", icon: DollarSign },
      { title: "HR Reports", href: "/admin/hr/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Stock",
    roles: ["ADMIN", "STAFF"],
    items: [
      { title: "Inventory", href: "/admin/inventory", icon: Package },
      { title: "Procurement", href: "/admin/procurement", icon: ShoppingCart },
      { title: "Fixed Assets", href: "/admin/assets", icon: Building },
    ],
  },
  {
    title: "System",
    roles: ["ADMIN"],
    items: [
      { title: "Users & Roles", href: "/admin/users", icon: UserCog },
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
      { title: "WhatsApp", href: "/admin/whatsapp", icon: MessageSquare },
      { title: "Bot Training", href: "/admin/ai/bot-training", icon: Brain },
    ],
  },
];
