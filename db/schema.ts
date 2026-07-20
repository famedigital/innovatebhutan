import { pgTable, serial, text, varchar, timestamp, decimal, integer, jsonb, boolean, index } from "drizzle-orm/pg-core";

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
  productKey: varchar("product_key", { length: 50 }),
  billingType: varchar("billing_type", { length: 50 }).default("one_time"), // amc | one_time | training | development
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
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  whatsappGroupId: varchar("whatsapp_group_id", { length: 100 }),
  whatsappGroupLink: text("whatsapp_group_link"),
  logoUrl: text("logo_url"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Bhutan"),

  // Enhanced fields for next-gen support system
  industry: varchar("industry", { length: 100 }),
  companySize: varchar("company_size", { length: 50 }), // small/medium/large
  tier: varchar("tier", { length: 20 }).default("bronze"), // gold/silver/bronze
  preferredContactMethod: varchar("preferred_contact_method", { length: 50 }).default("whatsapp"),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Thimphu"),
  slaLevel: varchar("sla_level", { length: 50 }), // standard/premium/enterprise
  responseTimeTarget: integer("response_time_target"), // in minutes
  notes: text("notes"),
  tags: jsonb("tags"), // Array of custom tags
  meta: jsonb("meta"), // Flexible JSON storage for yearsWithUs, totalPaid, custom fields
  clientHealthScore: integer("client_health_score").default(80), // 0-100
  lastCommunicationDate: timestamp("last_communication_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),

  // Enterprise support system fields
  rancelabCode: varchar("ralcodelab_code", { length: 50 }).unique(), // Client's Rancelab code
  rancelabUrl: text("ralcodelab_url"), // Rancelab system URL
  googleDriveFolderId: varchar("google_drive_folder_id", { length: 255 }), // Root folder in Google Drive
  supportExpiryDate: timestamp("support_expiry_date"), // AMC/support expiry date
  daysRemainingForSupport: integer("days_remaining_for_support"), // Computed field: days until expiry
  isActive: boolean("is_active").default(true), // Account active status

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  /** see_money | cancel_project | write_off | provision_users | adjust_stock */
  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🛡️ AMC (ANNUAL MAINTENANCE CONTRACTS)
 * Tracking the health and legal status of client nodes.
 */
export const amcs = pgTable("amcs", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).unique(), // External reference (e.g., AMC-2026-ABC123)
  clientId: integer("client_id").references(() => clients.id),
  serviceId: integer("service_id").references(() => services.id), // Link to service catalog
  contractNumber: varchar("contract_number", { length: 100 }), // Human-readable contract ID
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(), // Renamed from expiryDate for clarity
  amount: decimal("amount", { precision: 12, scale: 2 }), // Annual contract value
  hardwareDetails: jsonb("hardware_details"), // Model, Serial, Config
  servicesIncluded: jsonb("services_included"), // Array of service names/IDs included in contract
  productKey: varchar("product_key", { length: 50 }), // rancelab | pelbu_pos | website | cctv | networking
  renewedFrom: integer("renewed_from"), // Track renewal lineage (previous contract) - references amcs.id
  renewedTo: integer("renewed_to"), // Forward reference (next contract) - references amcs.id
  status: varchar("status", { length: 50 }).default("active"), // active, expiring, expired, cancelled
  notes: text("notes"), // Additional notes about the contract
  meta: jsonb("meta"), // Renewal pipeline, remittance, flexible ops data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_amcs_client").on(table.clientId),
  serviceIdx: index("idx_amcs_service").on(table.serviceId),
  statusIdx: index("idx_amcs_status").on(table.status),
  endDateIdx: index("idx_amcs_end_date").on(table.endDate), // For expiry queries
  publicIdx: index("idx_amcs_public").on(table.publicId),
}));

/**
 * 🎫 SUPPORT TICKETS
 * Call-centre dispatch: open → started → in_progress → resolved → closed
 */
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).unique(),
  clientId: integer("client_id").references(() => clients.id),
  assignedTo: integer("assigned_to").references(() => profiles.id),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("open"), // open, started, in_progress, resolved, closed
  priority: varchar("priority", { length: 50 }).default("medium"), // low, medium, high
  productKey: varchar("product_key", { length: 50 }), // rancelab | website | cctv
  source: varchar("source", { length: 50 }).default("call_centre"), // call_centre | whatsapp | portal
  billable: boolean("billable").default(false),
  slaDueAt: timestamp("sla_due_at"),
  slaBreachedAt: timestamp("sla_breached_at"),
  acknowledgedAt: timestamp("acknowledged_at"),
  acknowledgedBy: integer("acknowledged_by").references(() => profiles.id),
  groupNotifiedAt: timestamp("group_notified_at"),
  resolveNotifiedAt: timestamp("resolve_notified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  publicIdx: index("idx_tickets_public").on(table.publicId),
  productIdx: index("idx_tickets_product").on(table.productKey),
  statusIdx: index("idx_tickets_status").on(table.status),
  assignedIdx: index("idx_tickets_assigned").on(table.assignedTo),
  slaDueIdx: index("idx_tickets_sla_due").on(table.slaDueAt),
}));

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
  // Payroll & Tax fields (added in migration 0007)
  tin: varchar("tin", { length: 20 }), // Tax Identification Number
  pfNumber: varchar("pf_number", { length: 30 }), // Provident Fund Number
  bankAccountNumber: varchar("bank_account_number", { length: 30 }),
  bankName: varchar("bank_name", { length: 100 }),
  bankBranch: varchar("bank_branch", { length: 100 }),
  status: varchar("status", { length: 20 }).default("active"), // active/inactive/terminated/on_leave
  department: varchar("department", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),

  // Enhanced fields for next-gen support system
  skills: jsonb("skills"), // Array of skill strings
  specializations: jsonb("specializations"), // Array of specialization areas
  certifications: jsonb("certifications"), // Array of certifications with expiry dates
  maxConcurrentProblems: integer("max_concurrent_problems").default(5), // Max concurrent assignments
  currentWorkload: integer("current_workload").default(0), // Current number of active problems
  performanceMetrics: jsonb("performance_metrics"), // Object containing various performance KPIs
  availability: varchar("availability", { length: 20 }).default("available"), // available/busy/offline
  averageResponseTime: integer("average_response_time"), // in minutes
  averageResolutionTime: integer("average_resolution_time"), // in minutes
  clientSatisfactionScore: integer("client_satisfaction_score").default(80), // 0-100

  // Enterprise support system fields
  isSuperadmin: boolean("is_superadmin").default(false), // Superadmin access
  supportGroupId: integer("support_group_id"), // Assigned support group
  whatsappNumber: varchar("whatsapp_number", { length: 50 }), // WhatsApp for direct communication
  isAvailableForChat: boolean("is_available_for_chat").default(true), // Available for chat assignments

  // Google OAuth Authentication Fields
  authId: text("auth_id").unique(), // Supabase Auth user ID reference
  googleAccessToken: text("google_access_token"), // Current Google OAuth access token
  googleRefreshToken: text("google_refresh_token"), // Google OAuth refresh token for getting new access tokens
  googleTokenExpiry: timestamp("google_token_expiry"), // When the current access token expires
  googleConnectedAt: timestamp("google_connected_at"), // When Google OAuth was established
  googleScopes: jsonb("google_scopes") // JSON array of granted OAuth scopes
}, (table) => ({
  statusIdx: index("idx_employees_status").on(table.status),
  departmentIdx: index("idx_employees_department").on(table.department),
  designationIdx: index("idx_employees_designation").on(table.designation),
  availabilityIdx: index("idx_employees_availability").on(table.availability),
  authIdIdx: index("idx_employees_auth_id").on(table.authId),
}));

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
  status: varchar("status", { length: 50 }).default("draft"), // draft, approved, paid, cancelled
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow(),
  // Payroll breakdown fields (added in migration 0007)
  basicSalary: decimal("basic_salary", { precision: 12, scale: 2 }),
  grossSalary: decimal("gross_salary", { precision: 12, scale: 2 }),
  allowances: jsonb("allowances"), // { rent, transport, entertainment, medical, other }
  bonuses: decimal("bonuses", { precision: 12, scale: 2 }),
  pfEmployee: decimal("pf_employee", { precision: 12, scale: 2 }), // 5% employee contribution
  pfEmployer: decimal("pf_employer", { precision: 12, scale: 2 }), // 5% employer contribution
  gisDeduction: decimal("gis_deduction", { precision: 12, scale: 2 }), // Flat rate
  taxableIncome: decimal("taxable_income", { precision: 12, scale: 2 }),
  pitDeduction: decimal("pit_deduction", { precision: 12, scale: 2 }), // Progressive slab
  additionalDeductions: jsonb("additional_deductions"), // { advance, loan, other }
  paymentDate: timestamp("payment_date"),
  paymentMethod: varchar("payment_method", { length: 20 }), // bank/cash/cheque
  generatedAt: timestamp("generated_at").defaultNow(),
  notes: text("notes"),
}, (table) => ({
  employeeMonthYearIdx: index("idx_payslips_employee_month_year").on(table.employeeId, table.month, table.year),
  statusIdx: index("idx_payslips_status").on(table.status),
  paymentDateIdx: index("idx_payslips_payment_date").on(table.paymentDate),
}));

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
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  orderId: integer("order_id").references(() => orders.id),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("draft"), // draft, sent, paid, overdue, cancelled
  items: jsonb("items"), // Array of line items: [{ description, quantity, rate, amount }]
  notes: text("notes"),
  templateId: integer("template_id"), // invoice_templates.id used when generated
  templateSnapshot: jsonb("template_snapshot"), // design frozen at generation time
  pdfUrl: text("pdf_url"), // Cloudinary URL after upload/regenerate
  productKey: varchar("product_key", { length: 50 }), // rancelab | website | cctv
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_invoices_client").on(table.clientId),
  statusIdx: index("idx_invoices_status").on(table.status),
  invoiceNumberIdx: index("idx_invoices_number").on(table.invoiceNumber),
  dueDateIdx: index("idx_invoices_due").on(table.dueDate),
  productIdx: index("idx_invoices_product").on(table.productKey),
}));

/**
 * 🏗️ PROJECTS
 * Master tracking for POS deployments, Software Sprints, and Labor.
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).unique(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  serviceId: integer("service_id").references(() => services.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  /** Bible: needs_quote|quoted|demo|advance_paid|in_progress|testing|done|on_hold|cancelled */
  status: varchar("status", { length: 50 }).default("quoted"),
  leadId: text("lead_id"), // References profiles.user_id (Supabase Auth)
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: decimal("budget", { precision: 15, scale: 2 }), // Project budget
  productKey: varchar("product_key", { length: 50 }), // rancelab|pelbu_pos|website|cctv|networking
  moneyMeta: jsonb("money_meta").$type<Record<string, unknown>>().default({}),
  progress: integer("progress").default(0), // Cached progress 0-100
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_projects_client").on(table.clientId),
  statusIdx: index("idx_projects_status").on(table.status),
  publicIdx: index("idx_projects_public").on(table.publicId),
  leadIdIdx: index("idx_projects_lead_id").on(table.leadId),
  deletedAtIdx: index("idx_projects_deleted_at").on(table.deletedAt),
  productKeyIdx: index("idx_projects_product_key").on(table.productKey),
}));

/**
 * 📝 PROJECT TASKS
 * Phase-level tracking for "What's Done / What's Left".
 */
export const projectTasks = pgTable("project_tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  assignedTo: text("assigned_to"), // References profiles.user_id (Supabase Auth)
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("todo"), // todo, in_progress, done, blocked
  priority: varchar("priority", { length: 50 }).default("medium"),
  dueDate: timestamp("due_date"), // Task deadline
  estimatedHours: decimal("estimated_hours", { precision: 10, scale: 2 }), // Time estimation
  actualHours: decimal("actual_hours", { precision: 10, scale: 2 }), // Actual time spent
  position: integer("position").default(0), // For ordering/Kanban
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdx: index("idx_tasks_project").on(table.projectId),
  statusIdx: index("idx_tasks_status").on(table.status),
  dueIdx: index("idx_tasks_due").on(table.dueDate),
  assignedToIdx: index("idx_tasks_assigned_to").on(table.assignedTo),
  deletedAtIdx: index("idx_project_tasks_deleted_at").on(table.deletedAt),
}));

/**
 * 👥 PROJECT MEMBERS
 * Per-project access control and membership
 */
export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: text("user_id").notNull(), // References profiles.user_id (Supabase Auth)
  role: varchar("role", { length: 50 }).notNull().default("member"), // owner, lead, member, viewer, client_viewer
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  projectUserIdx: index("idx_project_members_project_user").on(table.projectId, table.userId),
  userIdIdx: index("idx_project_members_user").on(table.userId),
}));

/**
 * 📊 PROJECT MILESTONES
 * Phases/gates for project tracking
 */
export const projectMilestones = pgTable("project_milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("pending"), // pending, in_progress, complete, cancelled
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  position: integer("position").default(0), // For ordering
  deletedAt: timestamp("deleted_at"), // Soft delete
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  projectIdx: index("idx_milestones_project").on(table.projectId),
  statusIdx: index("idx_milestones_status").on(table.status),
  dueDateIdx: index("idx_milestones_due_date").on(table.dueDate),
  deletedAtIdx: index("idx_milestones_deleted_at").on(table.deletedAt),
}));

/**
 * 💬 TASK COMMENTS
 * Threaded comments on tasks
 */
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => projectTasks.id).notNull(),
  userId: text("user_id").notNull(), // References profiles.user_id (Supabase Auth)
  content: text("content").notNull(),
  parentId: integer("parent_id"), // For threaded comments (self-reference)
  deletedAt: timestamp("deleted_at"), // Soft delete
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  taskIdx: index("idx_task_comments_task").on(table.taskId),
  userIdIdx: index("idx_task_comments_user").on(table.userId),
  parentIdx: index("idx_task_comments_parent").on(table.parentId),
  deletedAtIdx: index("idx_task_comments_deleted_at").on(table.deletedAt),
}));

/**
 * ☑️ TASK CHECKLIST ITEMS
 * Checklists within tasks (subtasks alternative)
 */
export const taskChecklistItems = pgTable("task_checklist_items", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => projectTasks.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  isCompleted: boolean("is_completed").default(false),
  position: integer("position").default(0), // For ordering
  deletedAt: timestamp("deleted_at"), // Soft delete
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  taskIdx: index("idx_checklist_items_task").on(table.taskId),
  deletedAtIdx: index("idx_checklist_items_deleted_at").on(table.deletedAt),
}));

/**
 * 📣 ACTIVITY EVENTS
 * Activity feed for project-related events (UX-focused, separate from audit_logs)
 */
export const activityEvents = pgTable("activity_events", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  userId: text("user_id").notNull(), // References profiles.user_id (Supabase Auth)
  eventType: varchar("event_type", { length: 50 }).notNull(), // task_created, task_updated, task_completed, milestone_completed, comment_added, etc.
  entityType: varchar("entity_type", { length: 50 }), // project, task, milestone, comment
  entityId: integer("entity_id"),
  metadata: jsonb("metadata"), // Additional context (e.g., old_status, new_status, mentioned_users)
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  projectIdx: index("idx_activity_events_project").on(table.projectId),
  userIdIdx: index("idx_activity_events_user").on(table.userId),
  createdAtIdx: index("idx_activity_events_created").on(table.createdAt),
  entityTypeIdx: index("idx_activity_events_entity_type").on(table.entityType),
}));

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
  category: varchar("category", { length: 50 }), // task_assigned, mentioned, due_soon, overdue, milestone_completed
  entityType: varchar("entity_type", { length: 50 }), // project, task, milestone
  entityId: integer("entity_id"),
  read: boolean("read").default(false),
  link: text("link"), // URL to relevant entity
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("idx_notifications_user").on(table.userId),
  readIdx: index("idx_notifications_read").on(table.read),
  entityTypeIdx: index("idx_notifications_entity_type").on(table.entityType),
  createdAtIdx: index("idx_notifications_created").on(table.createdAt),
}));

/**
 * 🗺️ LOCATIONS
 * Bhutanese cities, thromdes, and dzongkhags for directory filtering
 */
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Thimphu", "Paro", "Punakha"
  district: varchar("district", { length: 100 }), // e.g., "Thimphu District"
  dzongkhag: varchar("dzongkhag", { length: 100 }), // Administrative district
  thromde: varchar("thromde", { length: 100 }), // Municipality
  description: text("description"),
  coordinates: jsonb("coordinates"), // { lat, lng }
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🏢 BUSINESS CATEGORIES
 * Hierarchical categories for business directory (IT Services > Networking > Fiber)
 */
export const businessCategories: any = pgTable("business_categories", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }), // Lucide icon name
  description: text("description"),
  parentId: integer("parent_id").references((): any => businessCategories.id), // For hierarchy
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🏪 BUSINESS DIRECTORY
 * Premium business listings with innovates.bt ecosystem integration
 */
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  tagline: varchar("tagline", { length: 255 }),
  description: text("description"),

  // Category & Location
  categoryId: integer("category_id").references(() => businessCategories.id),
  locationId: integer("location_id").references(() => locations.id),

  // Contact Information
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  email: varchar("email", { length: 100 }),
  website: text("website"),

  // Address
  address: text("address"),
  coordinates: jsonb("coordinates"), // { lat, lng }

  // Media
  logoUrl: text("logo_url"),
  coverImageUrl: text("cover_image_url"),
  galleryUrls: jsonb("gallery_urls"), // Array of image URLs

  // Business Details
  ownerId: integer("owner_id").references(() => profiles.id), // Business owner/manager
  clientId: integer("client_id").references(() => clients.id), // If innovates.bt client

  // Status & Features
  status: varchar("status", { length: 50 }).default("active"), // active, inactive, pending
  type: varchar("type", { length: 50 }).default("external"), // client, external, featured
  isVerified: boolean("is_verified").default(false), // Verified business
  isFeatured: boolean("is_featured").default(false), // Premium placement

  // Rating & Reviews
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"), // Average rating
  reviewCount: integer("review_count").default(0),

  // SEO & Metadata
  metaTitle: varchar("meta_title", { length: 100 }),
  metaDescription: text("meta_description"),
  keywords: jsonb("keywords"), // Array of keywords for search

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * ⭐ BUSINESS REVIEWS
 * Verified customer reviews (linked to orders for authenticity)
 */
export const businessReviews = pgTable("business_reviews", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),

  // Reviewer Information
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 100 }),

  // Verification (linked to actual order/project)
  orderId: integer("order_id").references(() => orders.id), // If from order
  projectId: integer("project_id").references(() => projects.id), // If from project
  isVerified: boolean("is_verified").default(false), // Verified customer

  // Review Content
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  comment: text("comment").notNull(),

  // Response
  response: text("response"), // Business owner response
  respondedAt: timestamp("responded_at"),

  // Status
  status: varchar("status", { length: 50 }).default("published"), // published, hidden, flagged

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 🕐 BUSINESS HOURS
 * Operating hours for businesses
 */
export const businessHours = pgTable("business_hours", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),

  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 6 = Saturday
  openTime: varchar("open_time", { length: 10 }), // e.g., "09:00"
  closeTime: varchar("close_time", { length: 10 }), // e.g., "18:00"
  isClosed: boolean("is_closed").default(false), // If closed for this day

  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * ⚙️ APP SETTINGS
 * Key-value settings for dynamic configuration (marquee, banners, etc.)
 */
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * 🏷️ BUSINESS AMENITIES & FEATURES
 * Flexible key-value pairs for filtering (price range, certifications, etc.)
 */
export const businessAmenities = pgTable("business_amenities", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => businesses.id).notNull(),

  amenityType: varchar("amenity_type", { length: 50 }).notNull(), // e.g., "price_range", "certification", "service_area"
  amenityValue: varchar("amenity_value", { length: 255 }).notNull(), // e.g., "$$$", "ISO 9001", "Thimphu"

  createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// 📦 INVENTORY MODULE
// ============================================================================

/**
 * 📦 ITEMS
 * Products/materials catalog for inventory management
 */
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(), // Stock Keeping Unit
  description: text("description"),
  unit: varchar("unit", { length: 50 }).notNull(), // e.g., "pcs", "kg", "meters", "boxes"
  category: varchar("category", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  manufacturer: varchar("manufacturer", { length: 255 }),
  imageUrl: text("image_url"),
  reorderLevel: integer("reorder_level").default(10), // Alert when stock falls below this
  leadTimeDays: integer("lead_time_days").default(7), // Days to restock
  costPrice: decimal("cost_price", { precision: 12, scale: 2 }),
  sellingPrice: decimal("selling_price", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"), // Additional specs, dimensions, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  skuIdx: index("idx_items_sku").on(table.sku),
  categoryIdx: index("idx_items_category").on(table.category),
  isActiveIdx: index("idx_items_active").on(table.isActive),
}));

/**
 * 🏭 WAREHOUSES
 * Storage locations for inventory
 */
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  location: text("location"), // Full address
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  coordinates: jsonb("coordinates"), // { lat, lng }
  managerId: integer("manager_id").references(() => employees.id),
  capacity: decimal("capacity", { precision: 15, scale: 2 }), // In cubic meters or units
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  isActiveIdx: index("idx_warehouses_active").on(table.isActive),
  districtIdx: index("idx_warehouses_district").on(table.district),
}));

/**
 * 📊 BINS
 * Storage locations within warehouses (shelves, zones)
 */
export const bins = pgTable("bins", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "A-101", "Zone A - Shelf 1"
  location: text("location"), // Detailed location description
  capacity: decimal("capacity", { precision: 15, scale: 2 }), // Maximum capacity
  currentCapacity: decimal("current_capacity", { precision: 15, scale: 2 }).default("0"), // Current usage
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  warehouseIdx: index("idx_bins_warehouse").on(table.warehouseId),
  isActiveIdx: index("idx_bins_active").on(table.isActive),
}));

/**
 * 📝 STOCK ENTRIES
 * Record of all stock movements (in/out/transfers)
 */
export const stockEntries = pgTable("stock_entries", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id).notNull(),
  binId: integer("bin_id").references(() => bins.id),
  quantity: integer("quantity").notNull(), // Positive for receipt, negative for issue
  type: varchar("type", { length: 50 }).notNull(), // receipt, issue, transfer, adjustment, manufacture
  referenceType: varchar("reference_type", { length: 50 }), // purchase_order, sales_order, project, etc.
  referenceId: integer("reference_id"), // ID of the referenced document
  batchNo: varchar("batch_no", { length: 100 }), // For batch tracking
  serialNo: varchar("serial_no", { length: 100 }), // For serialized items
  rate: decimal("rate", { precision: 12, scale: 2 }), // Unit rate for valuation
  amount: decimal("amount", { precision: 15, scale: 2 }), // Total value (quantity * rate)
  remarks: text("remarks"),
  postingDate: timestamp("posting_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  itemIdx: index("idx_stock_entries_item").on(table.itemId),
  warehouseIdx: index("idx_stock_entries_warehouse").on(table.warehouseId),
  typeIdx: index("idx_stock_entries_type").on(table.type),
  postingDateIdx: index("idx_stock_entries_posting_date").on(table.postingDate),
  referenceIdx: index("idx_stock_entries_reference").on(table.referenceType, table.referenceId),
}));

/**
 * 📊 STOCK LEDGER
 * Current stock levels per item per warehouse (calculated/binned view)
 */
export const stockLedger = pgTable("stock_ledger", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  warehouseId: integer("warehouse_id").references(() => warehouses.id).notNull(),
  binId: integer("bin_id").references(() => bins.id),
  quantity: integer("quantity").notNull().default(0), // Current available quantity
  reservedQuantity: integer("reserved_quantity").default(0), // Reserved for orders/projects
  valuationRate: decimal("valuation_rate", { precision: 12, scale: 2 }), // Average valuation rate
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => ({
  itemWarehouseIdx: index("idx_stock_ledger_item_warehouse").on(table.itemId, table.warehouseId),
  binIdx: index("idx_stock_ledger_bin").on(table.binId),
}));

// ============================================================================
// 🛒 PROCUREMENT MODULE
// ============================================================================

/**
 * 🏢 SUPPLIERS
 * Vendor management for procurement
 */
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }),
  contactPerson: varchar("contact_person", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Bhutan"),
  taxId: varchar("tax_id", { length: 50 }), // Taxpayer ID
  pan: varchar("pan", { length: 50 }), // PAN number
  paymentTerms: varchar("payment_terms", { length: 100 }), // e.g., "Net 30", "Immediate"
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }),
  creditDays: integer("credit_days").default(0),
  bankName: varchar("bank_name", { length: 100 }),
  bankAccountNo: varchar("bank_account_no", { length: 50 }),
  bankBranch: varchar("bank_branch", { length: 100 }),
  isActive: boolean("is_active").default(true),
  isPreferred: boolean("is_preferred").default(false),
  rating: varchar("rating", { length: 20 }), // A, B, C based on performance
  notes: text("notes"),
  metadata: jsonb("metadata"), // Additional vendor details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  isActiveIdx: index("idx_suppliers_active").on(table.isActive),
  nameIdx: index("idx_suppliers_name").on(table.name),
  cityIdx: index("idx_suppliers_city").on(table.city),
}));

/**
 * 📋 PURCHASE ORDERS
 * Purchase orders to suppliers
 */
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  orderNumber: varchar("order_number", { length: 100 }).notNull().unique(), // PO-YYYY-NNNN
  status: varchar("status", { length: 50 }).default("draft"), // draft, submitted, approved, rejected, issued, received, cancelled
  orderDate: timestamp("order_date").notNull().defaultNow(),
  expectedDate: timestamp("expected_date"), // Expected delivery date
  receivedDate: timestamp("received_date"), // Actual delivery date
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  totalTax: decimal("total_tax", { precision: 12, scale: 2 }).default("0"),
  totalDiscount: decimal("total_discount", { precision: 12, scale: 2 }).default("0"),
  grandTotal: decimal("grand_total", { precision: 15, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 10 }).default("Nu."),
  terms: text("terms"), // Payment and delivery terms
  notes: text("notes"),
  approvedBy: integer("approved_by").references(() => employees.id),
  approvedAt: timestamp("approved_at"),
  rejectedBy: integer("rejected_by").references(() => employees.id),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  warehouseId: integer("warehouse_id").references(() => warehouses.id), // Deliver to warehouse
  projectId: integer("project_id").references(() => projects.id), // Linked to project if applicable
  metadata: jsonb("metadata"), // Additional PO details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  supplierIdx: index("idx_po_supplier").on(table.supplierId),
  statusIdx: index("idx_po_status").on(table.status),
  orderDateIdx: index("idx_po_order_date").on(table.orderDate),
  orderNumberIdx: index("idx_po_number").on(table.orderNumber),
  projectIdx: index("idx_po_project").on(table.projectId),
}));

/**
 * 📦 PURCHASE ORDER ITEMS
 * Line items in purchase orders
 */
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id).notNull(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  description: varchar("description", { length: 500 }),
  quantity: integer("quantity").notNull().default(1),
  receivedQuantity: integer("received_quantity").default(0), // Track partial receipts
  rejectedQuantity: integer("rejected_quantity").default(0),
  rate: decimal("rate", { precision: 12, scale: 2 }).notNull(), // Unit price
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // quantity * rate
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"), // Tax percentage
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  discountRate: decimal("discount_rate", { precision: 5, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 15, scale: 2 }), // amount + tax - discount
  warehouseId: integer("warehouse_id").references(() => warehouses.id), // Specific warehouse for this item
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  poIdx: index("idx_po_items_po").on(table.purchaseOrderId),
  itemIdx: index("idx_po_items_item").on(table.itemId),
}));

/**
 * 📄 REQUEST FOR QUOTATIONS
 * RFQ sent to suppliers for price comparison
 */
export const requestForQuotations = pgTable("request_for_quotations", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  rfqNumber: varchar("rfq_number", { length: 100 }).notNull().unique(), // RFQ-YYYY-NNNN
  status: varchar("status", { length: 50 }).default("draft"), // draft, sent, received, awarded, cancelled
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requiredBy: timestamp("required_by"), // Required date for quotes
  validUntil: timestamp("valid_until"), // Quote validity deadline
  terms: text("terms"), // Terms and conditions
  notes: text("notes"),
  projectId: integer("project_id").references(() => projects.id),
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  createdBy: integer("created_by").references(() => employees.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  statusIdx: index("idx_rfq_status").on(table.status),
  rfqNumberIdx: index("idx_rfq_number").on(table.rfqNumber),
  requiredByIdx: index("idx_rfq_required_by").on(table.requiredBy),
}));

/**
 * 📋 RFQ SUPPLIERS
 * Suppliers invited to quote for an RFQ
 */
export const rfqSuppliers = pgTable("rfq_suppliers", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => requestForQuotations.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  status: varchar("status", { length: 50 }).default("pending"), // pending, quoted, not_responded
  quotedAmount: decimal("quoted_amount", { precision: 15, scale: 2 }),
  quotedDate: timestamp("quoted_date"),
  notes: text("notes"),
  isAwarded: boolean("is_awarded").default(false), // If this supplier was selected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  rfqIdx: index("idx_rfq_suppliers_rfq").on(table.rfqId),
  supplierIdx: index("idx_rfq_suppliers_supplier").on(table.supplierId),
}));

/**
 * 📦 RFQ ITEMS
 * Items in an RFQ
 */
export const rfqItems = pgTable("rfq_items", {
  id: serial("id").primaryKey(),
  rfqId: integer("rfq_id").references(() => requestForQuotations.id).notNull(),
  itemId: integer("item_id").references(() => items.id),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: integer("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  specifications: text("specifications"), // Detailed specs
  estimatedCost: decimal("estimated_cost", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  rfqIdx: index("idx_rfq_items_rfq").on(table.rfqId),
}));

// ============================================================================
// 💰 ACCOUNTS MODULE
// ============================================================================

/**
 * 🏛️ PARTIES
 * Unified parties (customers, suppliers) for accounting
 */
export const parties = pgTable("parties", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  partyType: varchar("party_type", { length: 50 }).notNull(), // customer, supplier, employee
  name: varchar("name", { length: 255 }).notNull(),
  taxpayerId: varchar("taxpayer_id", { length: 50 }), // TIN/PAN
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Bhutan"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"), // Additional party details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  partyTypeIdx: index("idx_parties_type").on(table.partyType),
  nameIdx: index("idx_parties_name").on(table.name),
  isActiveIdx: index("idx_parties_active").on(table.isActive),
}));

/**
 * 📒 ACCOUNTS (Chart of Accounts)
 * General ledger accounts
 */
export const accounts: any = pgTable("accounts", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  accountNumber: varchar("account_number", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // asset, liability, equity, income, expense
  rootType: varchar("root_type", { length: 50 }).notNull(), // asset, liability, equity, income, expense
  parentId: integer("parent_id").references((): any => accounts.id), // For hierarchy
  isGroup: boolean("is_group").default(false), // If true, is a group account (not a leaf)
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"), // Current balance
  currency: varchar("currency", { length: 10 }).default("Nu."),
  isActive: boolean("is_active").default(true),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }), // For tax accounts
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  accountNumberIdx: index("idx_accounts_number").on(table.accountNumber),
  accountTypeIdx: index("idx_accounts_type").on(table.accountType),
  rootTypeIdx: index("idx_accounts_root_type").on(table.rootType),
  parentIdx: index("idx_accounts_parent").on(table.parentId),
  isActiveIdx: index("idx_accounts_active").on(table.isActive),
}));

/**
 * 💳 PAYMENT ENTRIES
 * Record of payments received and made
 */
export const paymentEntries = pgTable("payment_entries", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  paymentNumber: varchar("payment_number", { length: 100 }).notNull().unique(), // PAY-YYYY-NNNN
  paymentType: varchar("payment_type", { length: 50 }).notNull(), // receive, pay
  partyType: varchar("party_type", { length: 50 }).notNull(), // customer, supplier
  partyId: integer("party_id").references(() => parties.id).notNull(),
  partyName: varchar("party_name", { length: 255 }), // Denormalized for search
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).notNull(),
  outstandingAmount: decimal("outstanding_amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("Nu."),
  paymentMethod: varchar("payment_method", { length: 50 }), // cash, bank, cheque, card, upi
  referenceNo: varchar("reference_no", { length: 100 }), // Cheque number, transaction ref
  referenceDate: timestamp("reference_date"), // Cheque date, transaction date
  referenceType: varchar("reference_type", { length: 50 }), // invoice, expense, etc.
  referenceId: integer("reference_id"), // ID of the referenced document
  bankAccountId: integer("bank_account_id").references(() => accounts.id),
  status: varchar("status", { length: 50 }).default("draft"), // draft, submitted, reconciled, cancelled
  postingDate: timestamp("posting_date").notNull().defaultNow(),
  clearedDate: timestamp("cleared_date"), // For bank reconciliation
  remarks: text("remarks"),
  approvedBy: integer("approved_by").references(() => employees.id),
  approvedAt: timestamp("approved_at"),
  projectId: integer("project_id").references(() => projects.id), // Link to project if applicable
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  paymentNumberIdx: index("idx_payment_entries_number").on(table.paymentNumber),
  partyIdx: index("idx_payment_entries_party").on(table.partyType, table.partyId),
  statusIdx: index("idx_payment_entries_status").on(table.status),
  postingDateIdx: index("idx_payment_entries_posting_date").on(table.postingDate),
  referenceIdx: index("idx_payment_entries_reference").on(table.referenceType, table.referenceId),
}));

/**
 * 📔 JOURNAL ENTRIES
 * Manual journal entries for accounting adjustments
 */
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  voucherNo: varchar("voucher_no", { length: 100 }).notNull().unique(), // JV-YYYY-NNNN
  voucherType: varchar("voucher_type", { length: 50 }).notNull(), // journal_entry, bank_entry, etc.
  postingDate: timestamp("posting_date").notNull(),
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).default("draft"), // draft, submitted, cancelled
  remarks: text("remarks"),
  userRemark: text("user_remark"), // User's note
  fiscalYear: varchar("fiscal_year", { length: 20 }), // FY 2025-2026
  submittedBy: integer("submitted_by").references(() => employees.id),
  submittedAt: timestamp("submitted_at"),
  approvedBy: integer("approved_by").references(() => employees.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  voucherNoIdx: index("idx_journal_entries_voucher").on(table.voucherNo),
  postingDateIdx: index("idx_journal_entries_posting_date").on(table.postingDate),
  statusIdx: index("idx_journal_entries_status").on(table.status),
  fiscalYearIdx: index("idx_journal_entries_fiscal_year").on(table.fiscalYear),
}));

/**
 * 📝 JOURNAL ENTRY ACCOUNTS
 * Line items in journal entries (debits and credits)
 */
export const journalEntryAccounts = pgTable("journal_entry_accounts", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  debit: decimal("debit", { precision: 15, scale: 2 }).notNull().default("0"),
  credit: decimal("credit", { precision: 15, scale: 2 }).notNull().default("0"),
  partyType: varchar("party_type", { length: 50 }), // customer, supplier
  partyId: integer("party_id").references(() => parties.id),
  referenceType: varchar("reference_type", { length: 50 }), // invoice, etc.
  referenceId: integer("reference_id"),
  costCenter: varchar("cost_center", { length: 100 }),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  journalIdx: index("idx_je_accounts_journal").on(table.journalEntryId),
  accountIdx: index("idx_je_accounts_account").on(table.accountId),
  partyIdx: index("idx_je_accounts_party").on(table.partyType, table.partyId),
}));

/**
 * 📊 GL ENTRIES
 * General ledger entries (auto-generated from invoices, payments, journals)
 */
export const glEntries = pgTable("gl_entries", {
  id: serial("id").primaryKey(),
  postingDate: timestamp("posting_date").notNull(),
  account: integer("account").references(() => accounts.id).notNull(),
  partyType: varchar("party_type", { length: 50 }), // customer, supplier
  partyId: integer("party_id").references(() => parties.id),
  voucherType: varchar("voucher_type", { length: 50 }).notNull(), // invoice, payment, journal
  voucherNo: varchar("voucher_no", { length: 100 }).notNull(),
  againstVoucherType: varchar("against_voucher_type", { length: 50 }), // For offset entries
  againstVoucherNo: varchar("against_voucher_no", { length: 100 }),
  debit: decimal("debit", { precision: 15, scale: 2 }).notNull().default("0"),
  credit: decimal("credit", { precision: 15, scale: 2 }).notNull().default("0"),
  isCancelled: boolean("is_cancelled").default(false),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  accountIdx: index("idx_gl_entries_account").on(table.account),
  voucherIdx: index("idx_gl_entries_voucher").on(table.voucherType, table.voucherNo),
  postingDateIdx: index("idx_gl_entries_posting_date").on(table.postingDate),
  partyIdx: index("idx_gl_entries_party").on(table.partyType, table.partyId),
}));

/**
 * 📋 ACCOUNTS RECEIVABLE
 * Money owed by customers
 */
export const accountsReceivable = pgTable("accounts_receivable", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  partyId: integer("party_id").references(() => parties.id).notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  referenceType: varchar("reference_type", { length: 50 }), // invoice, sales_order
  referenceId: integer("reference_id"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // Original amount
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0"),
  outstandingAmount: decimal("outstanding_amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status", { length: 50 }).default("overdue"), // overdue, unpaid, paid
  age: integer("age"), // Days since due
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  partyIdx: index("idx_ar_party").on(table.partyId),
  statusIdx: index("idx_ar_status").on(table.status),
  dueDateIdx: index("idx_ar_due_date").on(table.dueDate),
}));

/**
 * 📋 ACCOUNTS PAYABLE
 * Money owed to suppliers
 */
export const accountsPayable = pgTable("accounts_payable", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  partyId: integer("party_id").references(() => parties.id).notNull(),
  purchaseOrderId: integer("purchase_order_id").references(() => purchaseOrders.id),
  referenceType: varchar("reference_type", { length: 50 }), // purchase_order, expense
  referenceId: integer("reference_id"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(), // Original amount
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default("0"),
  outstandingAmount: decimal("outstanding_amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: varchar("status", { length: 50 }).default("unpaid"), // unpaid, partially_paid, paid, overdue
  age: integer("age"), // Days since due
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  partyIdx: index("idx_ap_party").on(table.partyId),
  statusIdx: index("idx_ap_status").on(table.status),
  dueDateIdx: index("idx_ap_due_date").on(table.dueDate),
}));

/**
 * 🏦 BANK ACCOUNTS
 * Bank and cash accounts for payment processing
 */
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  accountName: varchar("account_name", { length: 255 }).notNull(),
  accountType: varchar("account_type", { length: 50 }).notNull(), // bank, cash, card
  bankName: varchar("bank_name", { length: 100 }),
  accountNo: varchar("account_no", { length: 100 }),
  iban: varchar("iban", { length: 50 }),
  swiftCode: varchar("swift_code", { length: 20 }),
  branch: varchar("branch", { length: 100 }),
  currency: varchar("currency", { length: 10 }).default("Nu."),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  isActiveIdx: index("idx_bank_accounts_active").on(table.isActive),
  isDefaultIdx: index("idx_bank_accounts_default").on(table.isDefault),
}));

// ============================================================================
// 🏢 ASSETS MODULE
// ============================================================================

/**
 * 📂 ASSET CATEGORIES
 * Categories for asset classification
 */
export const assetCategories: any = pgTable("asset_categories", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: integer("parent_id").references((): any => assetCategories.id), // For hierarchy
  depreciationRate: decimal("depreciation_rate", { precision: 5, scale: 2 }), // Annual depreciation %
  depreciationMethod: varchar("depreciation_method", { length: 50 }), // straight_line, reducing_balance
  usefulLife: integer("useful_life"), // Years
  isFixedAsset: boolean("is_fixed_asset").default(true), // If true, capitalizes to asset account
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  parentIdx: index("idx_asset_categories_parent").on(table.parentId),
  isActiveIdx: index("idx_asset_categories_active").on(table.isActive),
}));

/**
 * 🏢 ASSETS
 * Fixed assets register
 */
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  assetNumber: varchar("asset_number", { length: 100 }).notNull().unique(), // AST-YYYY-NNNN
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => assetCategories.id).notNull(),
  itemId: integer("item_id").references(() => items.id), // Link to inventory if applicable
  purchaseDate: timestamp("purchase_date"),
  purchaseValue: decimal("purchase_value", { precision: 15, scale: 2 }), // Original cost
  currentValue: decimal("current_value", { precision: 15, scale: 2 }), // After depreciation
  salvageValue: decimal("salvage_value", { precision: 12, scale: 2 }), // Residual value
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 15, scale: 2 }).default("0"),
  netBookValue: decimal("net_book_value", { precision: 15, scale: 2 }), // currentValue - accumulatedDepreciation
  location: varchar("location", { length: 255 }), // Physical location
  warehouseId: integer("warehouse_id").references(() => warehouses.id),
  assignedTo: integer("assigned_to").references(() => employees.id), // Employee assigned
  status: varchar("status", { length: 50 }).default("active"), // active, sold, scrapped, written_off, maintenance
  serialNumber: varchar("serial_number", { length: 100 }),
  barcode: varchar("barcode", { length: 100 }),
  warrantyExpiry: timestamp("warranty_expiry"),
  lastAuditDate: timestamp("last_audit_date"),
  nextAuditDate: timestamp("next_audit_date"),
  imageUrl: text("image_url"),
  purchaseInvoiceId: integer("purchase_invoice_id"), // Reference to purchase invoice
  supplierId: integer("supplier_id").references(() => suppliers.id),
  metadata: jsonb("metadata"), // Additional asset specs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  assetNumberIdx: index("idx_assets_number").on(table.assetNumber),
  categoryIdx: index("idx_assets_category").on(table.categoryId),
  statusIdx: index("idx_assets_status").on(table.status),
  locationIdx: index("idx_assets_location").on(table.location),
  assignedToIdx: index("idx_assets_assigned_to").on(table.assignedTo),
}));

/**
 * 📅 DEPRECIATION SCHEDULE
 * Scheduled depreciation entries
 */
export const depreciationSchedule = pgTable("depreciation_schedule", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  date: timestamp("date").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(), // Depreciation amount
  accumulatedDepreciation: decimal("accumulated_depreciation", { precision: 15, scale: 2 }), // Running total
  netBookValue: decimal("net_book_value", { precision: 15, scale: 2 }), // Value after depreciation
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id), // Posted to GL
  fiscalYear: varchar("fiscal_year", { length: 20 }), // FY 2025-2026
  status: varchar("status", { length: 50 }).default("scheduled"), // scheduled, posted, skipped
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  assetIdx: index("idx_depreciation_asset").on(table.assetId),
  dateIdx: index("idx_depreciation_date").on(table.date),
  fiscalYearIdx: index("idx_depreciation_fiscal_year").on(table.fiscalYear),
  statusIdx: index("idx_depreciation_status").on(table.status),
}));

/**
 * 🔧 ASSET MAINTENANCE
 * Maintenance history for assets
 */
export const assetMaintenance = pgTable("asset_maintenance", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  maintenanceDate: timestamp("maintenance_date").notNull(),
  maintenanceType: varchar("maintenance_type", { length: 50 }).notNull(), // preventive, corrective, upgrade
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 12, scale: 2 }),
  performedBy: varchar("performed_by", { length: 255 }), // Internal or external vendor
  vendorId: integer("vendor_id").references(() => suppliers.id),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  assetIdx: index("idx_asset_maintenance_asset").on(table.assetId),
  dateIdx: index("idx_asset_maintenance_date").on(table.maintenanceDate),
}));

/**
 * 📤 ASSET MOVEMENTS
 * Track asset location transfers
 */
export const assetMovements = pgTable("asset_movements", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  movementDate: timestamp("movement_date").notNull(),
  movementType: varchar("movement_type", { length: 50 }).notNull(), // transfer_in, transfer_out, issue, return
  fromLocation: varchar("from_location", { length: 255 }),
  toLocation: varchar("to_location", { length: 255 }),
  fromWarehouseId: integer("from_warehouse_id").references(() => warehouses.id),
  toWarehouseId: integer("to_warehouse_id").references(() => warehouses.id),
  fromEmployeeId: integer("from_employee_id").references(() => employees.id),
  toEmployeeId: integer("to_employee_id").references(() => employees.id),
  reason: text("reason"),
  remarks: text("remarks"),
  createdBy: integer("created_by").references(() => employees.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  assetIdx: index("idx_asset_movements_asset").on(table.assetId),
  dateIdx: index("idx_asset_movements_date").on(table.movementDate),
  movementTypeIdx: index("idx_asset_movements_type").on(table.movementType),
}));

// ============================================================================
// 🌐 WEBSITE CMS MODULE
// ============================================================================

/**
 * 📦 SERVICES FULL TABLE
 * Complete service details for ServiceDirectory component
 */
export const servicesFull = pgTable("services_full", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  shortDescription: text("short_description"),
  description: text("description"),
  iconName: varchar("icon_name", { length: 100 }),
  iconColor: varchar("icon_color", { length: 50 }),
  gradientFrom: varchar("gradient_from", { length: 50 }),
  gradientTo: varchar("gradient_to", { length: 50 }),
  features: jsonb("features"),
  pricingDetails: jsonb("pricing_details"),
  galleryImages: jsonb("gallery_images"),
  videoUrl: text("video_url"),
  ctaText: varchar("cta_text", { length: 100 }),
  ctaLink: varchar("cta_link", { length: 500 }),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  displayOrder: integer("display_order").default(0),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: index("idx_services_full_slug").on(table.slug),
  activeIdx: index("idx_services_full_active").on(table.isActive),
  orderIdx: index("idx_services_full_order").on(table.displayOrder),
}));

/**
 * 📊 STATS CONTENT TABLE
 * Statistics for StatsSection component
 */
export const statsContent = pgTable("stats_content", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  value: varchar("value", { length: 50 }).notNull(),
  description: text("description"),
  iconName: varchar("icon_name", { length: 100 }),
  iconColor: varchar("icon_color", { length: 50 }),
  colorFrom: varchar("color_from", { length: 50 }),
  colorTo: varchar("color_to", { length: 50 }),
  bgGradient: varchar("bg_gradient", { length: 100 }),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  activeIdx: index("idx_stats_content_active").on(table.isActive),
  orderIdx: index("idx_stats_content_order").on(table.displayOrder),
}));

/**
 * 🔗 NAVIGATION LINKS TABLE
 * Menu structure for Navigation component
 */
export const navigationLinks = pgTable("navigation_links", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  parentId: integer("parent_id"),
  iconName: varchar("icon_name", { length: 100 }),
  iconColor: varchar("icon_color", { length: 50 }),
  badge: text("badge"),
  badgeColor: varchar("badge_color", { length: 50 }),
  openInNewTab: boolean("open_in_new_tab").default(false),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  parentIdx: index("idx_navigation_parent").on(table.parentId),
  activeIdx: index("idx_navigation_active").on(table.isActive),
  orderIdx: index("idx_navigation_order").on(table.displayOrder),
}));

/**
 * 📄 WEBSITE CONTENT EXTENDED TABLE
 * Flexible content storage for all website sections
 */
export const websiteContentExtended = pgTable("website_content_extended", {
  id: serial("id").primaryKey(),
  page: varchar("page", { length: 100 }).notNull(),
  section: varchar("section", { length: 100 }).notNull(),
  contentKey: varchar("content_key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  type: varchar("type", { length: 50 }).default("text"),
  locale: varchar("locale", { length: 10 }).default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  pageIdx: index("idx_website_content_page").on(table.page),
  sectionIdx: index("idx_website_content_section").on(table.section),
  lookupIdx: index("idx_website_content_lookup").on(table.page, table.section),
}));

/**
 * 📞 CONTACT INFO EXTENDED TABLE
 * Extended contact information for website
 */
export const contactInfoExtended = pgTable("contact_info_extended", {
  id: serial("id").primaryKey(),
  infoType: varchar("info_type", { length: 50 }).notNull(),
  label: varchar("label", { length: 100 }),
  value: text("value").notNull(),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  typeIdx: index("idx_contact_info_type").on(table.infoType),
  activeIdx: index("idx_contact_info_active").on(table.isActive),
}));

/**
 * 🎯 HERO CONTENT TABLE
 * Admin-editable hero section content with video integration
 */
export const heroContent = pgTable("hero_content", {
  id: serial("id").primaryKey(),
  isActive: boolean("is_active").default(true),

  // Main messaging
  headline: varchar("headline", { length: 255 }).notNull(),
  subheadline: text("subheadline"),
  description: text("description"),

  // CTAs
  primaryCtaText: varchar("primary_cta_text", { length: 100 }),
  primaryCtaLink: varchar("primary_cta_link", { length: 500 }),
  secondaryCtaText: varchar("secondary_cta_text", { length: 100 }),
  secondaryCtaLink: varchar("secondary_cta_link", { length: 500 }),

  // Video settings (Cloudinary)
  videoCloudinaryId: varchar("video_cloudinary_id", { length: 255 }), // Video public ID
  videoPosterImageId: varchar("video_poster_image_id", { length: 255 }), // Poster/thumbnail image ID
  enableVideoBackground: boolean("enable_video_background").default(false),

  // Visual settings
  gradientFrom: varchar("gradient_from", { length: 50 }).default("#10B981"),
  gradientTo: varchar("gradient_to", { length: 50 }).default("#3B82F6"),
  overlayOpacity: decimal("overlay_opacity", { precision: 3, scale: 2 }).default("0.7"),

  // Trust indicators
  showTrustIndicators: boolean("show_trust_indicators").default(true),
  clientCount: integer("client_count").default(350),
  yearsInBusiness: integer("years_in_business").default(12),

  // Featured products showcase
  featuredProducts: jsonb("featured_products"), // Array of product highlights

  // Display settings
  displayOrder: integer("display_order").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  activeIdx: index("idx_hero_content_active").on(table.isActive),
  orderIdx: index("idx_hero_content_order").on(table.displayOrder),
}));

/**
 * 🎯 PROBLEMS TABLE (Enhanced issue tracking)
 * Next-generation problem tracking with AI and root cause analysis
 */
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),

  // Basic problem information
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: varchar("severity", { length: 20 }).default("medium"), // low/medium/high/critical
  category: varchar("category", { length: 100 }),
  status: varchar("status", { length: 50 }).default("new"), // new/in-progress/resolved/prevention/closed

  // Client and assignment
  clientId: integer("client_id").references(() => clients.id),
  assignedTeamId: integer("assigned_team_id").references(() => employees.id),
  assignedTo: integer("assigned_to").references(() => employees.id),

  // Root cause analysis
  rootCause: text("root_cause"),
  preventionMeasures: text("prevention_measures"),
  lessonsLearned: text("lessons_learned"),
  resolutionTime: integer("resolution_time"), // in minutes
  clientImpact: varchar("client_impact", { length: 50 }), // low/medium/high/critical

  // Communication and tracking
  communicationLog: jsonb("communication_log"), // Array of communication entries
  linkedTicketId: integer("linked_ticket_id"),
  aiSuggestedCategory: varchar("ai_suggested_category", { length: 100 }),
  aiSuggestedResolution: text("ai_suggested_resolution"),

  // Status tracking
  createdById: integer("created_by_id").references(() => employees.id),
  resolvedById: integer("resolved_by_id").references(() => employees.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_problems_client").on(table.clientId),
  statusIdx: index("idx_problems_status").on(table.status),
  severityIdx: index("idx_problems_severity").on(table.severity),
  assignedToIdx: index("idx_problems_assigned").on(table.assignedTo),
}));

/**
 * 📞 CLIENT COMMUNICATIONS TABLE (Unified timeline)
 * All client interactions across channels
 */
export const clientCommunications = pgTable("client_communications", {
  id: serial("id").primaryKey(),

  // Communication details
  clientId: integer("client_id").references(() => clients.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // whatsapp/email/ticket/visit/call
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  outcome: text("outcome"),
  nextAction: text("next_action"),

  // Team members involved
  focalPersonId: integer("focal_person_id").references(() => employees.id),
  teamMemberId: integer("team_member_id").references(() => employees.id),
  problemId: integer("problem_id").references(() => problems.id),

  // Communication tracking
  direction: varchar("direction", { length: 20 }).notNull(), // inbound/outbound
  status: varchar("status", { length: 50 }).default("completed"), // pending/completed/failed
  importance: varchar("importance", { length: 20 }).default("normal"), // low/normal/high/urgent

  // AI analysis
  sentiment: varchar("sentiment", { length: 20 }), // positive/neutral/negative
  aiSummary: text("ai_summary"),
  requiresFollowUp: boolean("requires_follow_up").default(false),

  // Timing
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_communications_client").on(table.clientId),
  typeIdx: index("idx_communications_type").on(table.type),
  scheduledForIdx: index("idx_communications_scheduled").on(table.scheduledFor),
  problemIdx: index("idx_communications_problem").on(table.problemId),
}));

/**
 * 👥 TEAM ASSIGNMENTS TABLE (Client-to-team mapping)
 * Manages focal persons and team workload
 */
export const teamAssignments = pgTable("team_assignments", {
  id: serial("id").primaryKey(),

  // Assignment details
  clientId: integer("client_id").references(() => clients.id).notNull(),
  teamMemberId: integer("team_member_id").references(() => employees.id).notNull(),
  role: varchar("role", { length: 50 }).notNull(), // focal-person/backup-team-member/specialist

  // Focal person system
  isFocalPerson: boolean("is_focal_person").default(false),
  isPrimaryBackup: boolean("is_primary_backup").default(false),

  // Workload and performance
  workload: integer("workload").default(0), // Number of active assignments
  performanceScore: integer("performance_score").default(80), // 0-100
  skills: jsonb("skills"), // Array of skill strings

  // Assignment period
  validFrom: timestamp("valid_from").defaultNow(),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_team_assignments_client").on(table.clientId),
  teamMemberIdx: index("idx_team_assignments_team").on(table.teamMemberId),
  activeIdx: index("idx_team_assignments_active").on(table.isActive),
  focalPersonIdx: index("idx_team_assignments_focal").on(table.isFocalPerson),
}));

/**
 * 🌐 CLIENT PORTAL ACCESS TABLE (Client self-service)
 * Manages client portal access and permissions
 */
export const clientPortalAccess = pgTable("client_portal_access", {
  id: serial("id").primaryKey(),

  // Access details
  clientId: integer("client_id").references(() => clients.id).notNull(),
  userId: integer("user_id"), // legacy integer link (unused for auth)
  authUserId: text("auth_user_id"), // Supabase Auth UUID
  profileId: integer("profile_id").references(() => profiles.id),
  accessLevel: varchar("access_level", { length: 50 }).default("basic"), // basic/standard/admin

  // Invite
  inviteEmail: varchar("invite_email", { length: 255 }),
  inviteToken: varchar("invite_token", { length: 64 }),
  inviteExpiresAt: timestamp("invite_expires_at"),

  // Features and permissions
  features: jsonb("features"), // Array of enabled features
  allowedActions: jsonb("allowed_actions"), // Array of permitted actions

  // Portal activity
  lastLogin: timestamp("last_login"),
  loginCount: integer("login_count").default(0),
  isActive: boolean("is_active").default(false), // Whether they've activated their account

  // Invitation tracking
  invitedBy: integer("invited_by").references(() => employees.id),
  invitedAt: timestamp("invited_at"),
  activatedAt: timestamp("activated_at"),

  // Security
  lastPasswordChange: timestamp("last_password_change"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_client_portal_client").on(table.clientId),
  userIdx: index("idx_client_portal_user").on(table.userId),
  activeIdx: index("idx_client_portal_active").on(table.isActive),
  inviteTokenIdx: index("idx_cpa_invite_token").on(table.inviteToken),
  authUserIdx: index("idx_cpa_auth_user").on(table.authUserId),
}));

/**
 * Client payment proof uploads (M-BoB / cheque screenshots)
 */
export const portalPaymentProofs = pgTable("portal_payment_proofs", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  method: varchar("method", { length: 50 }).default("mbob"),
  proofUrl: text("proof_url").notNull(),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("submitted"),
  submittedByProfileId: integer("submitted_by_profile_id").references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_portal_proofs_client").on(table.clientId),
  invoiceIdx: index("idx_portal_proofs_invoice").on(table.invoiceId),
}));

// ============================================================================
// 🚀 ENTERPRISE SUPPORT SYSTEM MODULE (300+ Clients)
// ============================================================================

/**
 * 📱 WHATSAPP GROUPS TABLE (300+ Client Groups)
 * Manages individual WhatsApp groups for each client
 */
export const clientWhatsappGroups = pgTable("client_whatsapp_groups", {
  id: serial("id").primaryKey(),

  // Client and group details
  clientId: integer("client_id").references(() => clients.id).notNull(),
  groupId: varchar("group_id", { length: 100 }).unique(), // WhatsApp Group ID
  groupName: varchar("group_name", { length: 255 }),
  groupDescription: text("group_description"),
  groupProfileImage: text("group_profile_image"), // Cloudinary URL

  // Group access
  qrCode: text("qr_code"), // Cloudinary URL for QR code
  inviteLink: text("invite_link").unique(), // WhatsApp group invite link

  // Admin assignment
  adminId: integer("admin_id").references(() => employees.id),
  focalPersonId: integer("focal_person_id").references(() => employees.id),

  // Activity tracking
  isActive: boolean("is_active").default(true),
  lastActivityAt: timestamp("last_activity_at"),
  messageCount: integer("message_count").default(0),
  lastProblemSolved: text("last_problem_solved"), // Last issue resolved summary

  // Group metadata
  groupCreated: timestamp("group_created"),
  participantCount: integer("participant_count").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_whatsapp_groups_client").on(table.clientId),
  groupIdx: index("idx_whatsapp_groups_group").on(table.groupId),
  adminIdx: index("idx_whatsapp_groups_admin").on(table.adminId),
  focalPersonIdx: index("idx_whatsapp_groups_focal").on(table.focalPersonId),
  activeIdx: index("idx_whatsapp_groups_active").on(table.isActive),
}));

/**
 * 🔑 CLIENT CREDENTIALS TABLE (Encrypted Storage)
 * Secure credential storage with AES-256 encryption
 */
export const clientCredentials = pgTable("client_credentials", {
  id: serial("id").primaryKey(),

  // Client and credential type
  clientId: integer("client_id").references(() => clients.id).notNull(),
  credentialType: varchar("credential_type", { length: 50 }).notNull(), // rancelab/server/api/database
  credentialName: varchar("credential_name", { length: 255 }).notNull(),

  // Encrypted credentials
  username: varchar("username", { length: 255 }),
  passwordEncrypted: text("password_encrypted"), // AES-256 encrypted password
  apiKey: text("api_key"),
  configUrl: text("config_url"),
  configJson: jsonb("config_json"), // Additional configuration data

  // Google Drive integration
  googleDriveFileId: varchar("google_drive_file_id", { length: 255 }), // Reference to stored config file

  // Verification and status
  lastVerifiedAt: timestamp("last_verified_at"),
  isValid: boolean("is_valid").default(true),
  expiresAt: timestamp("expires_at"), // Credential expiration

  // Security metadata
  notes: text("notes"),
  lastRotatedAt: timestamp("last_rotated_at"),
  rotationFrequency: integer("rotation_frequency"), // Days between rotations

  // Access tracking
  accessCount: integer("access_count").default(0),
  lastAccessedAt: timestamp("last_accessed_at"),
  lastAccessedBy: integer("last_accessed_by").references(() => employees.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_credentials_client").on(table.clientId),
  typeIdx: index("idx_credentials_type").on(table.credentialType),
  validIdx: index("idx_credentials_valid").on(table.isValid),
  lastVerifiedIdx: index("idx_credentials_verified").on(table.lastVerifiedAt),
}));

/**
 * 📁 GOOGLE DRIVE FILES TABLE
 * Tracks files stored in Google Drive for clients
 */
export const googleDriveFiles = pgTable("google_drive_files", {
  id: serial("id").primaryKey(),

  // Client and file details
  clientId: integer("client_id").references(() => clients.id).notNull(),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // config/credential/document/image/exports

  // Google Drive metadata
  googleDriveFileId: varchar("google_drive_file_id", { length: 255 }).unique().notNull(),
  googleDriveFolderId: varchar("google_drive_folder_id", { length: 255 }),
  webViewLink: text("web_view_link"),
  webContentLink: text("web_content_link"),

  // File metadata
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type", { length: 100 }),
  description: text("description"),

  // Categorization
  category: varchar("category", { length: 100 }), // rancelab_config/server_config/contract/etc
  tags: jsonb("tags"), // Array of tags for filtering

  // Upload tracking
  uploadedBy: integer("uploaded_by").references(() => employees.id),
  syncStatus: varchar("sync_status", { length: 50 }).default("synced"), // synced/pending/failed
  lastSyncedAt: timestamp("last_synced_at"),

  // Version control
  version: integer("version").default(1),
  parentFileId: integer("parent_file_id"), // For version history

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_drive_files_client").on(table.clientId),
  typeIdx: index("idx_drive_files_type").on(table.fileType),
  categoryIdx: index("idx_drive_files_category").on(table.category),
  googleFileIdIdx: index("idx_drive_files_google_id").on(table.googleDriveFileId),
  activeIdx: index("idx_drive_files_active").on(table.isActive),
}));

/**
 * 👮 SUPPORT GROUPS TABLE (Team Organization)
 * Manages support teams for client assignment
 */
export const supportGroups = pgTable("support_groups", {
  id: serial("id").primaryKey(),

  // Group details
  groupName: varchar("group_name", { length: 255 }).unique().notNull(),
  groupCode: varchar("group_code", { length: 20 }).unique(), // Short code like "RANCELAB", "NETWORK"
  groupDescription: text("group_description"),

  // Leadership
  groupLeadId: integer("group_lead_id").references(() => employees.id),

  // Specialization
  specialization: varchar("specialization", { length: 100 }), // rancelab/network/hardware/software/general
  skills: jsonb("skills"), // Array of required skills
  certifications: jsonb("certifications"), // Required certifications

  // Workload management
  maxConcurrentClients: integer("max_concurrent_clients").default(50),
  currentClientCount: integer("current_client_count").default(0),
  maxConcurrentProblems: integer("max_concurrent_problems").default(100),
  currentProblemCount: integer("current_problem_count").default(0),

  // Performance metrics
  averageResponseTime: integer("average_response_time"), // in minutes
  averageResolutionTime: integer("average_resolution_time"), // in minutes
  clientSatisfactionScore: integer("client_satisfaction_score").default(80), // 0-100

  // Availability
  isActive: boolean("is_active").default(true),
  workingHours: jsonb("working_hours"), // { weekdays: "9-6", timezone: "Asia/Thimphu" }

  // Priority
  priority: integer("priority").default(0), // Higher priority = gets assigned first

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  groupCodeIdx: index("idx_support_groups_code").on(table.groupCode),
  groupLeadIdx: index("idx_support_groups_lead").on(table.groupLeadId),
  specializationIdx: index("idx_support_groups_specialization").on(table.specialization),
  activeIdx: index("idx_support_groups_active").on(table.isActive),
  priorityIdx: index("idx_support_groups_priority").on(table.priority),
}));

/**
 * 👥 SUPPORT GROUP MEMBERS TABLE
 * Team member assignments to support groups
 */
export const supportGroupMembers = pgTable("support_group_members", {
  id: serial("id").primaryKey(),

  // Group and member
  supportGroupId: integer("support_group_id").references(() => supportGroups.id).notNull(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),

  // Role within group
  role: varchar("role", { length: 50 }).notNull(), // lead/senior/junior/trainee
  level: varchar("level", { length: 50 }), // L1/L2/L3 support level

  // Specialization within group
  specialization: varchar("specialization", { length: 100 }), // Specific area of expertise
  skills: jsonb("skills"), // Array of verified skills

  // Workload and performance
  maxConcurrentClients: integer("max_concurrent_clients").default(30),
  currentClientCount: integer("current_client_count").default(0),
  currentProblemCount: integer("current_problem_count").default(0),
  performanceScore: integer("performance_score").default(80), // 0-100

  // Availability
  isActive: boolean("is_active").default(true),
  isAvailableForNewAssignments: boolean("is_available_for_new_assignments").default(true),
  isOnLeave: boolean("is_on_leave").default(false),

  // Time tracking
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),

  // Performance tracking
  totalAssignments: integer("total_assignments").default(0),
  totalResolutions: integer("total_resolutions").default(0),
  averageResolutionTime: integer("average_resolution_time"), // in minutes

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  groupIdx: index("idx_support_group_members_group").on(table.supportGroupId),
  employeeIdx: index("idx_support_group_members_employee").on(table.employeeId),
  activeIdx: index("idx_support_group_members_active").on(table.isActive),
  roleIdx: index("idx_support_group_members_role").on(table.role),
}));

/**
 * 🏢 CLIENT SUPPORT GROUP MAPPING TABLE
 * Assigns clients to support groups
 */
export const clientSupportGroupMapping = pgTable("client_support_group_mapping", {
  id: serial("id").primaryKey(),

  // Client and group
  clientId: integer("client_id").references(() => clients.id).notNull(),
  supportGroupId: integer("support_group_id").references(() => supportGroups.id).notNull(),

  // Assignment details
  isPrimaryGroup: boolean("is_primary_group").default(true),
  assignmentReason: text("assignment_reason"), // Why this group was assigned

  // Priority and workload
  priority: varchar("priority", { length: 50 }).default("normal"), // low/normal/high/urgent
  workloadLevel: varchar("workload_level", { length: 50 }).default("standard"), // light/standard/heavy

  // Assignment tracking
  assignedBy: integer("assigned_by").references(() => employees.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  unassignedAt: timestamp("unassigned_at"),
  unassignedBy: integer("unassigned_by").references(() => employees.id),
  unassignmentReason: text("unassignment_reason"),

  // Status
  isActive: boolean("is_active").default(true),

  // Performance
  satisfactionScore: integer("satisfaction_score"), // Client satisfaction 1-5
  responseTimeTarget: integer("response_time_target"), // Expected response time
  responseTimeActual: integer("response_time_actual"), // Actual avg response time

  // Notes
  notes: text("notes"),
  specialRequirements: jsonb("special_requirements"), // Special client needs

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_client_group_mapping_client").on(table.clientId),
  groupIdx: index("idx_client_group_mapping_group").on(table.supportGroupId),
  activeIdx: index("idx_client_group_mapping_active").on(table.isActive),
  primaryIdx: index("idx_client_group_mapping_primary").on(table.isPrimaryGroup),
}));

/**
 * 🤖 BOT CONVERSATIONS TABLE (AI Interactions)
 * Tracks all bot conversations for training and analysis
 */
export const botConversations = pgTable("bot_conversations", {
  id: serial("id").primaryKey(),

  // Client and context
  clientId: integer("client_id").references(() => clients.id).notNull(),
  whatsappGroupId: integer("whatsapp_group_id").references(() => clientWhatsappGroups.id),

  // Conversation details
  conversationType: varchar("conversation_type", { length: 100 }).notNull(), // credential_request/config_update/problem_report/etc
  category: varchar("category", { length: 100 }), // AI-classified category

  // Messages
  clientMessage: text("client_message").notNull(),
  botResponse: text("bot_response").notNull(),

  // AI confidence and classification
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }), // 0-1 confidence level
  intent: varchar("intent", { length: 100 }), // Detected intent
  sentiment: varchar("sentiment", { length: 50 }), // positive/neutral/negative

  // Resolution tracking
  wasHandedToHuman: boolean("handed_to_human").default(false),
  handedToEmployeeId: integer("handed_to_employee_id").references(() => employees.id),
  handoffReason: text("handoff_reason"),

  // Outcome
  resolutionStatus: varchar("resolution_status", { length: 50 }).default("bot_resolved"), // bot_resolved/human_resolved/pending
  resolutionTime: integer("resolution_time"), // Time to resolve in seconds

  // Feedback for learning
  clientSatisfied: boolean("client_satisfied"), // Did client indicate satisfaction?
  requiredHumanIntervention: boolean("required_human_intervention").default(false),
  interventionReason: text("intervention_reason"),

  // Training data
  isTrainingExample: boolean("is_training_example").default(false),
  usedForTraining: boolean("used_for_training").default(false),
  trainingQuality: varchar("training_quality", { length: 20 }), // good/bad/uncertain

  // Metadata
  language: varchar("language", { length: 10 }).default("en"),
  sessionId: varchar("session_id", { length: 255 }), // To group related messages

  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  clientIdx: index("idx_bot_conversations_client").on(table.clientId),
  whatsappGroupIdx: index("idx_bot_conversations_whatsapp").on(table.whatsappGroupId),
  typeIdx: index("idx_bot_conversations_type").on(table.conversationType),
  categoryIdx: index("idx_bot_conversations_category").on(table.category),
  resolutionStatusIdx: index("idx_bot_conversations_resolution").on(table.resolutionStatus),
  createdAtIdx: index("idx_bot_conversations_created").on(table.createdAt),
}));

/**
 * 🎓 BOT TRAINING DATA TABLE (Knowledge Base)
 * Training data for AI bot responses
 */
export const botTrainingData = pgTable("bot_training_data", {
  id: serial("id").primaryKey(),

  // Category and classification
  category: varchar("category", { length: 100 }).notNull(), // credential_requests/config_requests/problem_reports/etc
  subcategory: varchar("subcategory", { length: 100 }), // More specific classification
  intent: varchar("intent", { length: 100 }), // Specific intent within category

  // Training examples
  question: text("question").notNull(),
  answer: text("answer").notNull(),

  // Context and metadata
  context: jsonb("context"), // Additional context for the response
  keywords: jsonb("keywords"), // Array of keywords for matching

  // Response quality metrics
  isActive: boolean("is_active").default(true),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0.8"), // 0-1 success rate
  timesUsed: integer("times_used").default(0),
  timesSuccessful: integer("times_successful").default(0),

  // Quality assessment
  confidence: varchar("confidence", { length: 20 }).default("medium"), // low/medium/high
  quality: varchar("quality", { length: 20 }).default("good"), // excellent/good/fair/poor

  // Training metadata
  source: varchar("source", { length: 50 }), // manual/imported/generated
  language: varchar("language", { length: 10 }).default("en"),
  locale: varchar("locale", { length: 20 }).default("en-BT"), // Bhutanese English

  // Version control
  version: integer("version").default(1),
  parentVersionId: integer("parent_version_id"), // For version history

  // Approval
  isApproved: boolean("is_approved").default(false),
  approvedBy: integer("approved_by").references(() => employees.id),
  approvedAt: timestamp("approved_at"),

  // Feedback
  feedbackCount: integer("feedback_count").default(0),
  positiveFeedback: integer("positive_feedback").default(0),
  negativeFeedback: integer("negative_feedback").default(0),

  // Response variants (A/B testing)
  alternativeAnswers: jsonb("alternative_answers"), // Array of alternative responses

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  categoryIdx: index("idx_bot_training_category").on(table.category),
  subcategoryIdx: index("idx_bot_training_subcategory").on(table.subcategory),
  intentIdx: index("idx_bot_training_intent").on(table.intent),
  activeIdx: index("idx_bot_training_active").on(table.isActive),
  qualityIdx: index("idx_bot_training_quality").on(table.quality),
  successRateIdx: index("idx_bot_training_success").on(table.successRate),
}));

/**
 * 📄 INVOICE / QUOTATION TEMPLATES
 * Versioned product letterheads (RanceLab, Website, CCTV). Active version drives new PDFs.
 */
export const invoiceTemplates = pgTable("invoice_templates", {
  id: serial("id").primaryKey(),
  productKey: varchar("product_key", { length: 50 }).notNull(), // rancelab | website | cctv
  name: varchar("name", { length: 255 }).notNull(),
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").default(false),
  design: jsonb("design").notNull(), // InvoiceTemplateDesign
  createdBy: text("created_by"), // profiles.user_id
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  productIdx: index("idx_invoice_templates_product").on(table.productKey),
  activeIdx: index("idx_invoice_templates_active").on(table.productKey, table.isActive),
}));

/**
 * 📦 PRODUCTS CATALOG
 * Sellable product lines (RanceLab, Pelbu POS, Website, CCTV, Networking).
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  billingTypes: jsonb("billing_types").$type<string[]>().default([]),
  supportsAmc: boolean("supports_amc").default(true),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  keyIdx: index("idx_products_key").on(table.key),
  activeIdx: index("idx_products_active").on(table.isActive),
}));

