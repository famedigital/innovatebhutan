import { pgTable, serial, text, varchar, timestamp, decimal, integer, jsonb, boolean } from "drizzle-orm/pg-core";

/**
 * 🛰️ SERVICE CATALOG MASTER
 * Central node for all enterprise infrastructure services.
 */
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(), // Link for Cloudinary/Routing
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  tagline: text("tagline"),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("Nu."),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🏢 ENTERPRISE PARTNERS (CLIENTS)
 * Central node for the 300+ enterprise partners.
 */
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  active: boolean("active").default(true),
  contactPerson: varchar("contact_person", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  whatsappGroupId: varchar("whatsapp_group_id", { length: 100 }),
  whatsappGroupLink: text("whatsapp_group_link"),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 📦 ENTERPRISE ORDERS
 * Persistent tracking of infrastructure deployments.
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  customerLocation: varchar("customer_location", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, deploying, complete, cancelled
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  meta: jsonb("meta"), // For storing specific job requirements or JSON notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 🗒️ ORDER LINE ITEMS
 * Breakdown of services within a single deployment order.
 */
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  serviceId: integer("service_id").references(() => services.id),
  quantity: integer("quantity").default(1),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
});

/**
 * 👤 USER PROFILES & RBAC
 * Linking Supabase Auth to application roles.
 */
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Supabase Auth UUID
  fullName: varchar("full_name", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("CLIENT"), // ADMIN, STAFF, CLIENT
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🛡️ AMC (ANNUAL MAINTENANCE CONTRACTS)
 * Tracking the health and legal status of client nodes.
 */
export const amcs = pgTable("amcs", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  startDate: timestamp("start_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  hardwareDetails: jsonb("hardware_details"), // Model, Serial, Config
  status: varchar("status", { length: 50 }).default("active"), // active, expiring, expired
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🎫 SUPPORT TICKETS
 * Automated support flow triage.
 */
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  assignedTo: integer("assigned_to").references(() => profiles.id),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("open"), // open, in_progress, resolved
  priority: varchar("priority", { length: 50 }).default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 💬 TICKET THREADS
 * 1-to-many message history for Support dispatch sessions.
 */
export const ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => tickets.id).notNull(),
  senderId: integer("sender_id").references(() => profiles.id).notNull(),
  message: text("message").notNull(),
  isSystem: boolean("is_system").default(false), // For AI/System logs
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🤵 HR: EMPLOYEES
 */
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => profiles.id).notNull(),
  designation: varchar("designation", { length: 100 }),
  baseSalary: decimal("base_salary", { precision: 12, scale: 2 }),
  joinDate: timestamp("join_date").defaultNow(),
  photoUrl: text("photo_url"),
  nationalIdMasked: varchar("national_id_masked", { length: 20 }), // CID in Bhutan
  interviewScore: integer("interview_score"),
  agreementsDocUrl: text("agreements_doc_url"),
  joiningLetterUrl: text("joining_letter_url"),
  additionalDocs: jsonb("additional_docs"), // other documents array
});

/**
 * 🕒 HR: ATTENDANCE
 */
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  date: timestamp("date").defaultNow(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  location: jsonb("location"), // GPS/IP data
});

/**
 * 📄 HR: PAYROLL & PAYSLIPS
 */
export const payslips = pgTable("payslips", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  netSalary: decimal("net_salary", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 50 }).default("draft"), // draft, approved, paid
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 💰 FINANCE: UNIFIED TRANSACTIONS
 */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 20 }).notNull(), // INCOME, EXPENSE
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  referenceId: text("reference_id"), // Link to Invoice ID or Expense ID
  notes: text("notes"),
  date: timestamp("date").defaultNow(),
});

/**
 * 🧾 FINANCE: EXPENSES
 */
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  receiptUrl: text("receipt_url"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🏹 FINANCE: INVOICES
 */
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  orderId: integer("order_id").references(() => orders.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  status: varchar("status", { length: 50 }).default("unpaid"), // unpaid, paid, overdue
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🏗️ PROJECTS
 * Master tracking for POS deployments, Software Sprints, and Labor.
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  serviceId: integer("service_id").references(() => services.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("planning"), // planning, active, testing, complete
  leadId: integer("lead_id").references(() => profiles.id), // Overall responsible person
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 📝 PROJECT TASKS
 * Phase-level tracking for "What's Done / What's Left".
 */
export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  assignedTo: integer("assigned_to").references(() => profiles.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("todo"), // todo, in_progress, done
  priority: varchar("priority", { length: 50 }).default("medium"),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🕵️ AUDIT LOGS
 * Enterprise compliance tracking for all data mutations.
 */
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").references(() => profiles.id),
  action: varchar("action", { length: 100 }).notNull(), // CREATE, UPDATE, DELETE, DISPATCH
  entityType: varchar("entity_type", { length: 50 }).notNull(), // CLIENT, PROJECT, TICKET, PAYROLL
  entityId: integer("entity_id"),
  details: jsonb("details"), // Before/After state
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🔔 NOTIFICATIONS
 * Real-time alert pulse for critical incidents and updates.
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => profiles.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("info"), // info, warning, critical, success
  read: boolean("read").default(false),
  link: text("link"), // URL to relevant entity
  createdAt: timestamp("created_at").defaultNow(),
});

