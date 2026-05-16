/**
 * 🔐 Zod Validation Schemas for API Input Validation
 * Provides type-safe runtime validation for all API endpoints
 *
 * Usage:
 * ```ts
 * import { profileSchema, createProfileSchema } from '@/lib/validations/api';
 *
 * // Parse and validate request body
 * const result = createProfileSchema.safeParse(await req.json());
 * if (!result.success) {
 *   return NextResponse.json({
 *     success: false,
 *     error: 'Validation failed',
 *     details: result.error.flatten()
 *   }, { status: 400 });
 * }
 *
 * // result.data is now properly typed
 * ```
 */

import { z } from 'zod';

// ==================== COMMON SCHEMAS ====================

/**
 * User role enum
 */
export const UserRoleEnum = z.enum(['ADMIN', 'STAFF', 'CLIENT']);

/**
 * Project status enum
 */
export const ProjectStatusEnum = z.enum(['planning', 'active', 'testing', 'complete', 'on_hold', 'cancelled']);

/**
 * Task status enum
 */
export const TaskStatusEnum = z.enum(['todo', 'in_progress', 'done', 'blocked']);

/**
 * Task priority enum
 */
export const TaskPriorityEnum = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * Invoice status enum
 */
export const InvoiceStatusEnum = z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']);

/**
 * Ticket status enum
 */
export const TicketStatusEnum = z.enum(['open', 'in_progress', 'resolved']);

/**
 * Ticket priority enum
 */
export const TicketPriorityEnum = z.enum(['low', 'medium', 'high']);

/**
 * Payslip status enum
 */
export const PayslipStatusEnum = z.enum(['draft', 'approved', 'paid', 'cancelled']);

/**
 * AMC status enum
 */
export const AmcStatusEnum = z.enum(['active', 'expiring', 'expired', 'cancelled']);

// ==================== PROFILE SCHEMAS ====================

/**
 * Base profile schema
 */
export const profileSchema = z.object({
  id: z.number().int().positive(),
  userId: z.string().uuid(),
  fullName: z.string().max(255).nullable(),
  role: UserRoleEnum,
  createdAt: z.coerce.date(),
});

/**
 * Create profile request schema
 */
export const createProfileSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  fullName: z.string().max(255).optional(),
  role: UserRoleEnum.default('CLIENT'),
});

/**
 * Update profile request schema
 */
export const updateProfileSchema = z.object({
  fullName: z.string().max(255).optional(),
  role: UserRoleEnum.optional(),
});

// ==================== PROJECT SCHEMAS ====================

/**
 * Create project request schema
 */
export const createProjectSchema = z.object({
  clientId: z.number().int().positive('Client ID is required'),
  serviceId: z.number().int().positive().optional(),
  name: z.string().min(1, 'Project name is required').max(255),
  description: z.string().max(5000).optional(),
  leadId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid budget format').optional(),
});

/**
 * Update project request schema
 */
export const updateProjectSchema = z.object({
  serviceId: z.number().int().positive().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: ProjectStatusEnum.optional(),
  leadId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
}).refine(
  (data) => {
    // If both dates are provided, end must be after start
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  { message: 'End date must be after start date' }
);

// ==================== TASK SCHEMAS ====================

/**
 * Create task request schema
 */
export const createTaskSchema = z.object({
  projectId: z.number().int().positive(),
  assignedTo: z.string().uuid().optional(),
  title: z.string().min(1, 'Task title is required').max(255),
  description: z.string().max(5000).optional(),
  priority: TaskPriorityEnum.default('medium'),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

/**
 * Update task request schema
 */
export const updateTaskSchema = z.object({
  assignedTo: z.string().uuid().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  actualHours: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

/**
 * Bulk create tasks request schema
 */
export const bulkCreateTasksSchema = z.object({
  tasks: z.array(createTaskSchema.omit({ projectId: true })).min(1).max(50, 'Cannot create more than 50 tasks at once'),
});

// ==================== CLIENT SCHEMAS ====================

/**
 * Create client request schema
 */
export const createClientSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(255),
  contactPerson: z.string().max(255).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  whatsapp: z.string().max(50).optional(),
  whatsappGroupId: z.string().max(100).optional(),
  whatsappGroupLink: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  address: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).default('Bhutan'),
  active: z.boolean().default(true),
});

/**
 * Update client request schema
 */
export const updateClientSchema = createClientSchema.partial();

// ==================== INVOICE SCHEMAS ====================

/**
 * Invoice line item schema
 */
export const invoiceLineItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().min(0).int().default(1),
  rate: z.string().regex(/^\d+(\.\d{1,2})?$/),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
});

/**
 * Create invoice request schema
 */
export const createInvoiceSchema = z.object({
  clientId: z.number().int().positive(),
  orderId: z.number().int().positive().optional(),
  issueDate: z.coerce.date().default(() => new Date()),
  dueDate: z.coerce.date(),
  total: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid total amount'),
  items: z.array(invoiceLineItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().max(5000).optional(),
});

/**
 * Update invoice status request schema
 */
export const updateInvoiceStatusSchema = z.object({
  status: InvoiceStatusEnum,
  paymentDate: z.coerce.date().optional(),
  paymentMethod: z.enum(['bank', 'cash', 'cheque']).optional(),
});

// ==================== PAYROLL SCHEMAS ====================

/**
 * Create payslip schema
 */
export const createPayslipSchema = z.object({
  employeeId: z.number().int().positive(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  basicSalary: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  allowances: z.object({
    rent: z.string().regex(/^\d+(\.\d{1,2})?$/).default('0'),
    transport: z.string().regex(/^\d+(\.\d{1,2})?$/).default('0'),
    entertainment: z.string().regex(/^\d+(\.\d{1,2})?$/).default('0'),
    medical: z.string().regex(/^\d+(\.\d{1,2})?$/).default('0'),
    other: z.string().regex(/^\d+(\.\d{1,2})?$/).default('0'),
  }).optional(),
  bonuses: z.string().regex(/^\d+(\.\d{1,2})?$/).default('0'),
});

// ==================== TICKET SCHEMAS ====================

/**
 * Create ticket schema
 */
export const createTicketSchema = z.object({
  clientId: z.number().int().positive().optional(),
  subject: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  priority: TicketPriorityEnum.default('medium'),
});

/**
 * Update ticket schema
 */
export const updateTicketSchema = z.object({
  assignedTo: z.number().int().positive().optional(),
  status: TicketStatusEnum.optional(),
  priority: TicketPriorityEnum.optional(),
});

// ==================== QUERY PARAM SCHEMAS ====================

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Date range filter schema
 */
export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// ==================== EXPORTS ====================

export const apiSchemas = {
  // Profiles
  profile: profileSchema,
  createProfile: createProfileSchema,
  updateProfile: updateProfileSchema,

  // Projects
  createProject: createProjectSchema,
  updateProject: updateProjectSchema,

  // Tasks
  createTask: createTaskSchema,
  updateTask: updateTaskSchema,
  bulkCreateTasks: bulkCreateTasksSchema,

  // Clients
  createClient: createClientSchema,
  updateClient: updateClientSchema,

  // Invoices
  createInvoice: createInvoiceSchema,
  updateInvoiceStatus: updateInvoiceStatusSchema,
  invoiceLineItem: invoiceLineItemSchema,

  // Payroll
  createPayslip: createPayslipSchema,

  // Tickets
  createTicket: createTicketSchema,
  updateTicket: updateTicketSchema,

  // Query params
  pagination: paginationSchema,
  dateRange: dateRangeSchema,
};
