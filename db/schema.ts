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
export const businessCategories = pgTable("business_categories", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  icon: varchar("icon", { length: 50 }), // Lucide icon name
  description: text("description"),
  parentId: integer("parent_id").references(() => businessCategories.id), // For hierarchy
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

/**
 * 🏪 BUSINESS DIRECTORY
 * Premium business listings with Innovate.bt ecosystem integration
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
  clientId: integer("client_id").references(() => clients.id), // If Innovate.bt client

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

