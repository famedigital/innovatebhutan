/**
 * 🚀 CODEBASE INDEX for AI Development
 * Central registry of all project files for rapid AI code navigation.
 * This file provides a map of the entire codebase to minimize token usage.
 */

export interface APIRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  file: string;
  purpose: string;
  authRequired: boolean;
  role?: 'CLIENT' | 'STAFF' | 'ADMIN';
}

export interface Service {
  name: string;
  file: string;
  methods: string[];
  dependencies: string[];
  purpose: string;
}

export interface Repository {
  name: string;
  file: string;
  queries: string[];
  purpose: string;
  table?: string;
}

export interface Table {
  name: string;
  file: string;
  columns: string[];
  purpose: string;
}

export interface Component {
  name: string;
  file: string;
  category: string;
  purpose: string;
}

export interface AdminPage {
  path: string;
  file: string;
  title: string;
  features: string[];
}

// API Routes Index
export const API_ROUTES: APIRoute[] = [
  // Project Management
  { path: '/api/projects', method: 'GET', file: 'app/api/projects/route.ts', purpose: 'List all projects with filters', authRequired: true, role: 'STAFF' },
  { path: '/api/projects', method: 'POST', file: 'app/api/projects/route.ts', purpose: 'Create new project', authRequired: true, role: 'STAFF' },
  { path: '/api/projects/[id]', method: 'GET', file: 'app/api/projects/[id]/route.ts', purpose: 'Get project details', authRequired: true },
  { path: '/api/projects/[id]', method: 'PUT', file: 'app/api/projects/[id]/route.ts', purpose: 'Update project', authRequired: true, role: 'STAFF' },
  { path: '/api/projects/[id]', method: 'DELETE', file: 'app/api/projects/[id]/route.ts', purpose: 'Delete project', authRequired: true, role: 'ADMIN' },
  { path: '/api/projects/[id]/tasks', method: 'GET', file: 'app/api/projects/[id]/tasks/route.ts', purpose: 'Get project tasks', authRequired: true },
  { path: '/api/projects/[id]/tasks', method: 'POST', file: 'app/api/projects/[id]/tasks/route.ts', purpose: 'Create project task', authRequired: true, role: 'STAFF' },
  { path: '/api/projects/[id]/milestones', method: 'GET', file: 'app/api/projects/[id]/milestones/route.ts', purpose: 'Get project milestones', authRequired: true },
  { path: '/api/projects/[id]/milestones', method: 'POST', file: 'app/api/projects/[id]/milestones/route.ts', purpose: 'Create milestone', authRequired: true, role: 'STAFF' },
  { path: '/api/projects/[id]/activity', method: 'GET', file: 'app/api/projects/[id]/activity/route.ts', purpose: 'Get project activity feed', authRequired: true },
  { path: '/api/projects/[id]/progress', method: 'GET', file: 'app/api/projects/[id]/progress/route.ts', purpose: 'Get project progress', authRequired: true },

  // Task Management
  { path: '/api/tasks/[id]', method: 'GET', file: 'app/api/tasks/[id]/route.ts', purpose: 'Get task details', authRequired: true },
  { path: '/api/tasks/[id]', method: 'PUT', file: 'app/api/tasks/[id]/route.ts', purpose: 'Update task', authRequired: true },
  { path: '/api/tasks/[id]/comments', method: 'GET', file: 'app/api/tasks/[id]/comments/route.ts', purpose: 'Get task comments', authRequired: true },
  { path: '/api/tasks/[id]/comments', method: 'POST', file: 'app/api/tasks/[id]/comments/route.ts', purpose: 'Add task comment', authRequired: true },
  { path: '/api/tasks/[id]/checklist', method: 'GET', file: 'app/api/tasks/[id]/checklist/route.ts', purpose: 'Get task checklist items', authRequired: true },
  { path: '/api/tasks/[id]/checklist', method: 'POST', file: 'app/api/tasks/[id]/checklist/route.ts', purpose: 'Add checklist item', authRequired: true },

  // Client Management
  { path: '/api/clients', method: 'GET', file: 'app/api/clients/route.ts', purpose: 'List all clients', authRequired: true, role: 'STAFF' },
  { path: '/api/clients', method: 'POST', file: 'app/api/clients/route.ts', purpose: 'Create new client', authRequired: true, role: 'STAFF' },
  { path: '/api/clients/[id]', method: 'GET', file: 'app/api/clients/[id]/route.ts', purpose: 'Get client details', authRequired: true, role: 'STAFF' },
  { path: '/api/clients/[id]', method: 'PUT', file: 'app/api/clients/[id]/route.ts', purpose: 'Update client', authRequired: true, role: 'STAFF' },
  { path: '/api/clients/[id]', method: 'DELETE', file: 'app/api/clients/[id]/route.ts', purpose: 'Delete client', authRequired: true, role: 'ADMIN' },

  // Directory (Business Listings)
  { path: '/api/directory/businesses', method: 'GET', file: 'app/api/directory/businesses/route.ts', purpose: 'List businesses with filters', authRequired: false },
  { path: '/api/directory/businesses', method: 'POST', file: 'app/api/directory/businesses/route.ts', purpose: 'Create business listing', authRequired: true, role: 'ADMIN' },
  { path: '/api/directory/businesses/[id]', method: 'GET', file: 'app/api/directory/businesses/[id]/route.ts', purpose: 'Get business details', authRequired: false },
  { path: '/api/directory/businesses/[id]', method: 'PUT', file: 'app/api/directory/businesses/[id]/route.ts', purpose: 'Update business', authRequired: true, role: 'ADMIN' },
  { path: '/api/directory/categories', method: 'GET', file: 'app/api/directory/categories/route.ts', purpose: 'Get business categories', authRequired: false },
  { path: '/api/directory/locations', method: 'GET', file: 'app/api/directory/locations/route.ts', purpose: 'Get locations', authRequired: false },
  { path: '/api/directory/search', method: 'GET', file: 'app/api/directory/search/route.ts', purpose: 'Search directory', authRequired: false },

  // Services
  { path: '/api/services', method: 'GET', file: 'app/api/services/route.ts', purpose: 'List all services', authRequired: false },
  { path: '/api/services', method: 'POST', file: 'app/api/services/route.ts', purpose: 'Create new service', authRequired: true, role: 'ADMIN' },

  // Orders
  { path: '/api/orders', method: 'GET', file: 'app/api/orders/route.ts', purpose: 'List orders', authRequired: true, role: 'STAFF' },
  { path: '/api/orders', method: 'POST', file: 'app/api/orders/route.ts', purpose: 'Create new order', authRequired: true, role: 'STAFF' },
  { path: '/api/orders/[id]', method: 'GET', file: 'app/api/orders/[id]/route.ts', purpose: 'Get order details', authRequired: true },
  { path: '/api/orders/[id]', method: 'PUT', file: 'app/api/orders/[id]/route.ts', purpose: 'Update order', authRequired: true, role: 'STAFF' },
  { path: '/api/orders/[id]/status', method: 'PUT', file: 'app/api/orders/[id]/status/route.ts', purpose: 'Update order status', authRequired: true, role: 'STAFF' },
  { path: '/api/orders/[id]/items', method: 'GET', file: 'app/api/orders/[id]/items/route.ts', purpose: 'Get order items', authRequired: true },
  { path: '/api/orders/[id]/items', method: 'POST', file: 'app/api/orders/[id]/items/route.ts', purpose: 'Add order item', authRequired: true, role: 'STAFF' },

  // AMC (Annual Maintenance Contracts)
  { path: '/api/amc', method: 'GET', file: 'app/api/amc/route.ts', purpose: 'List AMC contracts', authRequired: true, role: 'STAFF' },
  { path: '/api/amc', method: 'POST', file: 'app/api/amc/route.ts', purpose: 'Create AMC contract', authRequired: true, role: 'STAFF' },
  { path: '/api/amc/[id]', method: 'GET', file: 'app/api/amc/[id]/route.ts', purpose: 'Get AMC details', authRequired: true },
  { path: '/api/amc/[id]', method: 'PUT', file: 'app/api/amc/[id]/route.ts', purpose: 'Update AMC', authRequired: true, role: 'STAFF' },
  { path: '/api/amc/[id]/renew', method: 'POST', file: 'app/api/amc/[id]/renew/route.ts', purpose: 'Renew AMC contract', authRequired: true, role: 'STAFF' },
  { path: '/api/amc/expiring', method: 'GET', file: 'app/api/amc/expiring/route.ts', purpose: 'Get expiring AMC contracts', authRequired: true, role: 'STAFF' },
  { path: '/api/amc/stats', method: 'GET', file: 'app/api/amc/stats/route.ts', purpose: 'Get AMC statistics', authRequired: true, role: 'STAFF' },

  // Invoices
  { path: '/api/invoices', method: 'GET', file: 'app/api/invoices/route.ts', purpose: 'List invoices', authRequired: true, role: 'STAFF' },
  { path: '/api/invoices', method: 'POST', file: 'app/api/invoices/route.ts', purpose: 'Create invoice', authRequired: true, role: 'STAFF' },
  { path: '/api/invoices/[id]', method: 'GET', file: 'app/api/invoices/[id]/route.ts', purpose: 'Get invoice details', authRequired: true },
  { path: '/api/invoices/[id]', method: 'PUT', file: 'app/api/invoices/[id]/route.ts', purpose: 'Update invoice', authRequired: true, role: 'STAFF' },
  { path: '/api/invoices/[id]/status', method: 'PUT', file: 'app/api/invoices/[id]/status/route.ts', purpose: 'Update invoice status', authRequired: true, role: 'STAFF' },

  // Employees & HR
  { path: '/api/employees', method: 'GET', file: 'app/api/employees/route.ts', purpose: 'List employees', authRequired: true, role: 'STAFF' },
  { path: '/api/employees', method: 'POST', file: 'app/api/employees/route.ts', purpose: 'Create employee', authRequired: true, role: 'STAFF' },
  { path: '/api/employees/[id]', method: 'GET', file: 'app/api/employees/[id]/route.ts', purpose: 'Get employee details', authRequired: true },
  { path: '/api/employees/[id]', method: 'PUT', file: 'app/api/employees/[id]/route.ts', purpose: 'Update employee', authRequired: true, role: 'STAFF' },
  { path: '/api/employees/stats', method: 'GET', file: 'app/api/employees/stats/route.ts', purpose: 'Get employee statistics', authRequired: true, role: 'STAFF' },

  // Attendance
  { path: '/api/attendance', method: 'GET', file: 'app/api/attendance/route.ts', purpose: 'List attendance records', authRequired: true },
  { path: '/api/attendance', method: 'POST', file: 'app/api/attendance/route.ts', purpose: 'Add attendance record', authRequired: true },
  { path: '/api/attendance/[id]', method: 'GET', file: 'app/api/attendance/[id]/route.ts', purpose: 'Get attendance details', authRequired: true },
  { path: '/api/attendance/check-in', method: 'POST', file: 'app/api/attendance/check-in/route.ts', purpose: 'Employee check-in', authRequired: true },
  { path: '/api/attendance/check-out', method: 'POST', file: 'app/api/attendance/check-out/route.ts', purpose: 'Employee check-out', authRequired: true },
  { path: '/api/attendance/report', method: 'GET', file: 'app/api/attendance/report/route.ts', purpose: 'Generate attendance report', authRequired: true },

  // Payroll
  { path: '/api/payroll/generate', method: 'POST', file: 'app/api/payroll/generate/route.ts', purpose: 'Generate payroll', authRequired: true, role: 'ADMIN' },
  { path: '/api/payroll/batch', method: 'POST', file: 'app/api/payroll/batch/route.ts', purpose: 'Batch payroll operations', authRequired: true, role: 'ADMIN' },
  { path: '/api/payroll/[id]', method: 'GET', file: 'app/api/payroll/[id]/route.ts', purpose: 'Get payroll details', authRequired: true },
  { path: '/api/payroll/[id]', method: 'PUT', file: 'app/api/payroll/[id]/route.ts', purpose: 'Update payroll', authRequired: true, role: 'STAFF' },
  { path: '/api/payroll/[id]/approve', method: 'POST', file: 'app/api/payroll/[id]/approve/route.ts', purpose: 'Approve payroll', authRequired: true, role: 'ADMIN' },
  { path: '/api/payroll/[id]/pay', method: 'POST', file: 'app/api/payroll/[id]/pay/route.ts', purpose: 'Process payroll payment', authRequired: true, role: 'ADMIN' },

  // Expenses
  { path: '/api/expenses', method: 'GET', file: 'app/api/expenses/route.ts', purpose: 'List expenses', authRequired: true, role: 'STAFF' },
  { path: '/api/expenses', method: 'POST', file: 'app/api/expenses/route.ts', purpose: 'Create expense', authRequired: true, role: 'STAFF' },
  { path: '/api/expenses/[id]', method: 'GET', file: 'app/api/expenses/[id]/route.ts', purpose: 'Get expense details', authRequired: true },
  { path: '/api/expenses/[id]', method: 'PUT', file: 'app/api/expenses/[id]/route.ts', purpose: 'Update expense', authRequired: true, role: 'STAFF' },
  { path: '/api/expenses/[id]/action', method: 'POST', file: 'app/api/expenses/[id]/action/route.ts', purpose: 'Approve/reject expense', authRequired: true, role: 'ADMIN' },

  // Transactions
  { path: '/api/transactions', method: 'GET', file: 'app/api/transactions/route.ts', purpose: 'List transactions', authRequired: true, role: 'STAFF' },
  { path: '/api/transactions', method: 'POST', file: 'app/api/transactions/route.ts', purpose: 'Create transaction', authRequired: true, role: 'STAFF' },
  { path: '/api/transactions/[id]', method: 'GET', file: 'app/api/transactions/[id]/route.ts', purpose: 'Get transaction details', authRequired: true },
  { path: '/api/transactions/[id]', method: 'PUT', file: 'app/api/transactions/[id]/route.ts', purpose: 'Update transaction', authRequired: true, role: 'STAFF' },
  { path: '/api/transactions/[id]/reconcile', method: 'POST', file: 'app/api/transactions/[id]/reconcile/route.ts', purpose: 'Reconcile transaction', authRequired: true, role: 'ADMIN' },

  // Reports
  { path: '/api/reports/projects', method: 'GET', file: 'app/api/reports/projects/route.ts', purpose: 'Generate project reports', authRequired: true, role: 'STAFF' },
  { path: '/api/reports/finance', method: 'GET', file: 'app/api/reports/finance/route.ts', purpose: 'Generate finance reports', authRequired: true, role: 'STAFF' },
  { path: '/api/reports/hr', method: 'GET', file: 'app/api/reports/hr/route.ts', purpose: 'Generate HR reports', authRequired: true, role: 'STAFF' },
  { path: '/api/reports/support', method: 'GET', file: 'app/api/reports/support/route.ts', purpose: 'Generate support reports', authRequired: true, role: 'STAFF' },
  { path: '/api/reports/amc', method: 'GET', file: 'app/api/reports/amc/route.ts', purpose: 'Generate AMC reports', authRequired: true, role: 'STAFF' },

  // Notifications
  { path: '/api/notifications', method: 'GET', file: 'app/api/notifications/route.ts', purpose: 'List notifications', authRequired: true },
  { path: '/api/notifications', method: 'POST', file: 'app/api/notifications/route.ts', purpose: 'Create notification', authRequired: true, role: 'ADMIN' },
  { path: '/api/notifications/[id]/read', method: 'POST', file: 'app/api/notifications/[id]/read/route.ts', purpose: 'Mark notification as read', authRequired: true },

  // Support Tickets
  { path: '/api/tickets', method: 'GET', file: 'app/api/tickets/route.ts', purpose: 'List support tickets', authRequired: true, role: 'STAFF' },
  { path: '/api/tickets', method: 'POST', file: 'app/api/tickets/route.ts', purpose: 'Create ticket', authRequired: true, role: 'STAFF' },
  { path: '/api/tickets/[id]', method: 'GET', file: 'app/api/tickets/[id]/route.ts', purpose: 'Get ticket details', authRequired: true },
  { path: '/api/tickets/[id]', method: 'PUT', file: 'app/api/tickets/[id]/route.ts', purpose: 'Update ticket', authRequired: true, role: 'STAFF' },
  { path: '/api/tickets/[id]/messages', method: 'GET', file: 'app/api/tickets/[id]/messages/route.ts', purpose: 'Get ticket messages', authRequired: true },
  { path: '/api/tickets/[id]/messages', method: 'POST', file: 'app/api/tickets/[id]/messages/route.ts', purpose: 'Add message to ticket', authRequired: true },

  // Jobs
  { path: '/api/jobs', method: 'GET', file: 'app/api/jobs/route.ts', purpose: 'List scheduled jobs', authRequired: true, role: 'ADMIN' },
  { path: '/api/jobs/run/[jobId]', method: 'POST', file: 'app/api/jobs/run/[jobId]/route.ts', purpose: 'Manually run a job', authRequired: true, role: 'ADMIN' },

  // Utilities
  { path: '/api/contact', method: 'POST', file: 'app/api/contact/route.ts', purpose: 'Submit contact form', authRequired: false },
  { path: '/api/leads/capture', method: 'POST', file: 'app/api/leads/capture/route.ts', purpose: 'Capture lead data', authRequired: false },
  { path: '/api/leads/webhook', method: 'POST', file: 'app/api/leads/webhook/route.ts', purpose: 'Lead webhook handler', authRequired: false },
  { path: '/api/ocr', method: 'POST', file: 'app/api/ocr/route.ts', purpose: 'OCR document processing', authRequired: false },
  { path: '/api/media/upload', method: 'POST', file: 'app/api/media/upload/route.ts', purpose: 'Upload media file', authRequired: true, role: 'STAFF' },
  { path: '/api/cloudinary/list-images', method: 'GET', file: 'app/api/cloudinary/list-images/route.ts', purpose: 'List Cloudinary images', authRequired: true, role: 'STAFF' },
  { path: '/api/gemini', method: 'POST', file: 'app/api/gemini/route.ts', purpose: 'Gemini AI integration', authRequired: false },
  { path: '/api/webhook', method: 'POST', file: 'app/api/webhook/route.ts', purpose: 'Webhook endpoint', authRequired: false },
  { path: '/api/whatsapp', method: 'POST', file: 'app/api/whatsapp/route.ts', purpose: 'WhatsApp integration', authRequired: false },
];

// Services Index
export const SERVICES: Service[] = [
  { name: 'projectService', file: 'lib/services/projectService.ts', methods: ['listProjects', 'createProject', 'updateProject', 'deleteProject', 'getProjectById'], dependencies: ['projectRepository', 'projectMemberRepository'], purpose: 'Project CRUD operations and management' },
  { name: 'taskService', file: 'lib/services/taskService.ts', methods: ['createTask', 'updateTask', 'deleteTask', 'getTaskById', 'listTasks', 'updateTaskStatus'], dependencies: ['taskRepository'], purpose: 'Task CRUD operations and status management' },
  { name: 'clientService', file: 'lib/services/clientService.ts', methods: ['createClient', 'updateClient', 'deleteClient', 'getClients', 'getClientById'], dependencies: ['clientRepository'], purpose: 'Client CRUD operations' },
  { name: 'invoiceService', file: 'lib/services/invoiceService.ts', methods: ['createInvoice', 'updateInvoice', 'deleteInvoice', 'getInvoices', 'getInvoiceById', 'updateInvoiceStatus'], dependencies: ['invoiceRepository'], purpose: 'Invoice CRUD operations and status management' },
  { name: 'payrollService', file: 'lib/services/payrollService.ts', methods: ['generatePayroll', 'approvePayroll', 'processPayment', 'getPayslip', 'batchGeneratePayroll'], dependencies: ['payrollRepository', 'employeeRepository'], purpose: 'Payroll generation and processing' },
  { name: 'employeeService', file: 'lib/services/employeeService.ts', methods: ['createEmployee', 'updateEmployee', 'deleteEmployee', 'getEmployees', 'getEmployeeById'], dependencies: ['employeeRepository'], purpose: 'Employee CRUD operations' },
  { name: 'amcService', file: 'lib/services/amcService.ts', methods: ['createAMC', 'updateAMC', 'deleteAMC', 'getAMCs', 'getAMCById', 'renewAMC'], dependencies: ['amcRepository'], purpose: 'AMC contract management and renewals' },
  { name: 'attendanceService', file: 'lib/services/attendanceService.ts', methods: ['checkIn', 'checkOut', 'getAttendance', 'generateReport'], dependencies: ['attendanceRepository'], purpose: 'Attendance tracking and reporting' },
  { name: 'expenseService', file: 'lib/services/expenseService.ts', methods: ['createExpense', 'updateExpense', 'approveExpense', 'rejectExpense'], dependencies: ['expenseRepository'], purpose: 'Expense management and approval' },
  { name: 'transactionService', file: 'lib/services/transactionService.ts', methods: ['createTransaction', 'updateTransaction', 'reconcileTransaction'], dependencies: ['transactionRepository'], purpose: 'Transaction management and reconciliation' },
  { name: 'ticketService', file: 'lib/services/ticketService.ts', methods: ['createTicket', 'updateTicket', 'assignTicket', 'resolveTicket'], dependencies: ['ticketRepository'], purpose: 'Support ticket management' },
  { name: 'notificationService', file: 'lib/services/notificationService.ts', methods: ['createNotification', 'markAsRead', 'sendNotification'], dependencies: ['notificationRepository'], purpose: 'Notification management' },
];

// Repositories Index
export const REPOSITORIES: Repository[] = [
  { name: 'projectRepository', file: 'lib/repositories/projectRepository.ts', queries: ['listProjects', 'getProjectById', 'createProject', 'updateProject', 'deleteProject', 'countProjects'], purpose: 'Project data access layer', table: 'projects' },
  { name: 'taskRepository', file: 'lib/repositories/taskRepository.ts', queries: ['listTasks', 'getTaskById', 'createTask', 'updateTask', 'deleteTask'], purpose: 'Task data access layer', table: 'project_tasks' },
  { name: 'clientRepository', file: 'lib/repositories/clientRepository.ts', queries: ['getClients', 'getClientById', 'createClient', 'updateClient', 'deleteClient'], purpose: 'Client data access layer', table: 'clients' },
  { name: 'invoiceRepository', file: 'lib/repositories/invoiceRepository.ts', queries: ['getInvoices', 'getInvoiceById', 'createInvoice', 'updateInvoice', 'deleteInvoice'], purpose: 'Invoice data access layer', table: 'invoices' },
  { name: 'payrollRepository', file: 'lib/repositories/payrollRepository.ts', queries: ['getPayslip', 'createPayslip', 'updatePayslip', 'getPayrollByEmployeeAndMonth'], purpose: 'Payroll data access layer', table: 'payslips' },
  { name: 'employeeRepository', file: 'lib/repositories/employeeRepository.ts', queries: ['getEmployees', 'getEmployeeById', 'createEmployee', 'updateEmployee'], purpose: 'Employee data access layer', table: 'employees' },
  { name: 'amcRepository', file: 'lib/repositories/amcRepository.ts', queries: ['getAMCs', 'getAMCById', 'createAMC', 'updateAMC', 'getExpiringAMCs'], purpose: 'AMC data access layer', table: 'amcs' },
  { name: 'attendanceRepository', file: 'lib/repositories/attendanceRepository.ts', queries: ['getAttendance', 'checkIn', 'checkOut'], purpose: 'Attendance data access layer', table: 'attendance' },
  { name: 'expenseRepository', file: 'lib/repositories/expenseRepository.ts', queries: ['getExpenses', 'createExpense', 'updateExpense'], purpose: 'Expense data access layer', table: 'expenses' },
  { name: 'transactionRepository', file: 'lib/repositories/transactionRepository.ts', queries: ['getTransactions', 'createTransaction', 'reconcileTransaction'], purpose: 'Transaction data access layer', table: 'transactions' },
  { name: 'ticketRepository', file: 'lib/repositories/ticketRepository.ts', queries: ['getTickets', 'createTicket', 'updateTicket'], purpose: 'Ticket data access layer', table: 'tickets' },
  { name: 'notificationRepository', file: 'lib/repositories/notificationRepository.ts', queries: ['getNotifications', 'createNotification', 'markAsRead'], purpose: 'Notification data access layer', table: 'notifications' },
];

// Database Tables Index
export const TABLES: Table[] = [
  { name: 'profiles', file: 'db/schema.ts', columns: ['id', 'userId', 'fullName', 'role', 'createdAt'], purpose: 'User profiles with RBAC roles' },
  { name: 'clients', file: 'db/schema.ts', columns: ['id', 'name', 'active', 'contactPerson', 'email', 'phone', 'whatsapp', 'whatsappGroupId', 'logoUrl', 'address', 'city', 'country'], purpose: 'Enterprise clients with contact details' },
  { name: 'projects', file: 'db/schema.ts', columns: ['id', 'publicId', 'clientId', 'serviceId', 'name', 'description', 'status', 'leadId', 'startDate', 'endDate', 'budget', 'progress', 'deletedAt'], purpose: 'Projects with progress tracking' },
  { name: 'project_tasks', file: 'db/schema.ts', columns: ['id', 'projectId', 'assignedTo', 'title', 'description', 'status', 'priority', 'dueDate', 'estimatedHours', 'actualHours', 'position'], purpose: 'Project tasks with time tracking' },
  { name: 'project_members', file: 'db/schema.ts', columns: ['id', 'projectId', 'userId', 'role', 'joinedAt'], purpose: 'Project member permissions' },
  { name: 'project_milestones', file: 'db/schema.ts', columns: ['id', 'projectId', 'name', 'description', 'status', 'dueDate', 'completedAt', 'position'], purpose: 'Project milestones' },
  { name: 'invoices', file: 'db/schema.ts', columns: ['id', 'invoiceNumber', 'clientId', 'orderId', 'issueDate', 'dueDate', 'total', 'status', 'items'], purpose: 'Customer invoices with line items' },
  { name: 'employees', file: 'db/schema.ts', columns: ['id', 'profileId', 'designation', 'baseSalary', 'joinDate', 'tin', 'pfNumber', 'bankAccountNumber', 'status', 'department'], purpose: 'Employee records with payroll info' },
  { name: 'attendance', file: 'db/schema.ts', columns: ['id', 'employeeId', 'date', 'checkIn', 'checkOut', 'location'], purpose: 'Employee attendance tracking' },
  { name: 'payslips', file: 'db/schema.ts', columns: ['id', 'employeeId', 'month', 'year', 'netSalary', 'status', 'basicSalary', 'pfEmployee', 'pfEmployer', 'gisDeduction', 'pitDeduction'], purpose: 'Employee payslips with payroll breakdown' },
  { name: 'amcs', file: 'db/schema.ts', columns: ['id', 'publicId', 'clientId', 'serviceId', 'contractNumber', 'startDate', 'endDate', 'amount', 'status', 'renewedFrom', 'renewedTo'], purpose: 'Annual Maintenance Contracts' },
  { name: 'tickets', file: 'db/schema.ts', columns: ['id', 'clientId', 'assignedTo', 'subject', 'description', 'status', 'priority'], purpose: 'Support tickets with priority' },
  { name: 'transactions', file: 'db/schema.ts', columns: ['id', 'type', 'amount', 'category', 'referenceId', 'notes', 'date'], purpose: 'Financial transactions' },
  { name: 'expenses', file: 'db/schema.ts', columns: ['id', 'employeeId', 'amount', 'category', 'description', 'receiptUrl', 'status'], purpose: 'Business expenses with approval' },
];

// Components Index (abbreviated)
export const COMPONENTS: Component[] = [
  { name: 'Button', file: 'components/ui/button.tsx', category: 'UI', purpose: 'Reusable button component with variants' },
  { name: 'Card', file: 'components/ui/card.tsx', category: 'UI', purpose: 'Card container component' },
  { name: 'Input', file: 'components/ui/input.tsx', category: 'UI', purpose: 'Text input field' },
  { name: 'Dialog', file: 'components/ui/dialog.tsx', category: 'UI', purpose: 'Modal/dialog component' },
  { name: 'Table', file: 'components/ui/table.tsx', category: 'UI', purpose: 'Data table component' },
  { name: 'Form', file: 'components/ui/form.tsx', category: 'Forms', purpose: 'Form component with React Hook Form' },
  { name: 'Select', file: 'components/ui/select.tsx', category: 'UI', purpose: 'Dropdown select component' },
  { name: 'Toast', file: 'components/ui/sonner.tsx', category: 'UI', purpose: 'Toast notification component' },
];

// Admin Pages Index
export const ADMIN_PAGES: AdminPage[] = [
  { path: '/admin', file: 'app/admin/page.tsx', title: 'Admin Dashboard', features: ['System overview', 'Quick stats', 'Recent activity'] },
  { path: '/admin/projects', file: 'app/admin/projects/project-hub.tsx', title: 'Project Management', features: ['View all projects', 'Create new project', 'Task management'] },
  { path: '/admin/clients', file: 'app/admin/clients/page.tsx', title: 'Client Management', features: ['View all clients', 'Create new client', 'Bulk operations'] },
  { path: '/admin/invoice', file: 'app/admin/invoice/page.tsx', title: 'Invoice Management', features: ['Create invoices', 'Track payments', 'Send invoices'] },
  { path: '/admin/hr', file: 'app/admin/hr/hr-dashboard.tsx', title: 'HR Management', features: ['Employee management', 'Payroll', 'Attendance'] },
  { path: '/admin/amc', file: 'app/admin/amc/page.tsx', title: 'AMC Management', features: ['View contracts', 'Renew contracts', 'Expiry alerts'] },
];

// Utility functions for quick file lookups
export const findFileByType = (type: 'service' | 'repository' | 'api' | 'component', query: string) => {
  switch (type) {
    case 'service':
      return SERVICES.find(s => s.name.toLowerCase().includes(query.toLowerCase()));
    case 'repository':
      return REPOSITORIES.find(r => r.name.toLowerCase().includes(query.toLowerCase()));
    case 'api':
      return API_ROUTES.find(a => a.purpose.toLowerCase().includes(query.toLowerCase()) || a.path.includes(query));
    case 'component':
      return COMPONENTS.find(c => c.name.toLowerCase().includes(query.toLowerCase()));
    default:
      return null;
  }
};

export const getAPIRoutesByCategory = (category: string) => {
  const categories = {
    projects: ['project', 'task', 'milestone'],
    clients: ['client', 'business'],
    orders: ['order', 'invoice'],
    hr: ['employee', 'attendance', 'payroll'],
    finance: ['invoice', 'expense', 'transaction', 'finance'],
    support: ['ticket', 'support'],
    admin: ['settings', 'admin', 'audit'],
    directory: ['directory', 'business', 'category', 'location'],
  };

  const relatedCategories = Object.keys(categories).filter(cat =>
    categories[cat].some(keyword => category.includes(keyword))
  );

  return API_ROUTES.filter(route =>
    relatedCategories.some(cat => route.purpose.toLowerCase().includes(cat))
  );
};

export const getServicesByModule = (module: string) => {
  const moduleMap: Record<string, string[]> = {
    projects: ['projectService', 'taskService', 'projectMemberService', 'milestoneService'],
    clients: ['clientService'],
    invoices: ['invoiceService'],
    amc: ['amcService'],
    hr: ['employeeService', 'attendanceService', 'payrollService'],
    finance: ['expenseService', 'transactionService'],
    support: ['ticketService'],
    notifications: ['notificationService'],
  };

  return SERVICES.filter(service =>
    moduleMap[module]?.includes(service.name) || false
  );
};

export const getRelatedFiles = (file: string) => {
  const service = SERVICES.find(s => s.file === file);
  const repository = REPOSITORIES.find(r => r.file === file);

  const related: any[] = [];

  if (service) {
    related.push(...REPOSITORIES.filter(r =>
      service.dependencies.includes(r.name)
    ));
  }

  if (repository) {
    const relatedService = SERVICES.find(s =>
      s.dependencies.includes(repository.name)
    );
    if (relatedService) related.push(relatedService);
  }

  return related;
};
