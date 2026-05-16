# 🚀 Innovate Bhutan - AI Codebase Index

This document provides a comprehensive overview of the Innovate Bhutan codebase structure for AI development. It serves as a map to help AI quickly navigate and understand the project without exploring the entire codebase every time.

## 📁 Project Structure

```
Innovate Bhutan/
├── app/                     # Next.js application directory
│   ├── api/                # API routes (RESTful endpoints)
│   ├── admin/              # Admin panel pages
│   ├── brands/             # Brand showcase
│   ├── company/            # Company pages
│   ├── privacy/            # Privacy policy
│   └── services/           # Service pages
├── components/             # Reusable UI components
│   └── ui/                 # Shadcn/ui components
├── lib/                    # Core libraries and utilities
│   ├── ai/                # AI optimization system
│   ├── auth/              # Authentication utilities
│   ├── cache/              # Caching mechanisms
│   ├── config/             # Configuration files
│   ├── errors/             # Error handling
│   ├── jobs/               # Background jobs
│   ├── repositories/      # Data access layer
│   ├── services/           # Business logic layer
│   ├── validations/       # Input validation
│   └── utils.ts            # Utility functions
├── db/                    # Database schema and connection
└── docs/                  # Documentation
    └── ai/                # AI-related documentation
```

## 🌐 API Routes

### Core Business Entities

#### Projects Management
- `GET /api/projects` - List all projects with filters
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `GET /api/projects/[id]/tasks` - Get project tasks
- `POST /api/projects/[id]/tasks` - Create project task
- `GET /api/projects/[id]/milestones` - Get project milestones
- `POST /api/projects/[id]/milestones` - Create milestone
- `GET /api/projects/[id]/activity` - Get project activity feed
- `GET /api/projects/[id]/progress` - Get project progress

#### Client Management
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/[id]` - Get client details
- `PUT /api/clients/[id]` - Update client
- `DELETE /api/clients/[id]` - Delete client

#### Orders & Invoices
- `GET /api/orders` - List orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order
- `PUT /api/orders/[id]/status` - Update order status
- `GET /api/orders/[id]/items` - Get order items
- `POST /api/orders/[id]/items` - Add order item

- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice
- `PUT /api/invoices/[id]/status` - Update invoice status

#### AMC (Annual Maintenance Contracts)
- `GET /api/amc` - List AMC contracts
- `POST /api/amc` - Create AMC contract
- `GET /api/amc/[id]` - Get AMC details
- `PUT /api/amc/[id]` - Update AMC
- `POST /api/amc/[id]/renew` - Renew AMC contract
- `GET /api/amc/expiring` - Get expiring AMC contracts
- `GET /api/amc/stats` - Get AMC statistics

### Human Resources

#### Employees
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/employees/[id]` - Get employee details
- `PUT /api/employees/[id]` - Update employee
- `GET /api/employees/stats` - Get employee statistics

#### Attendance
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Add attendance record
- `GET /api/attendance/[id]` - Get attendance details
- `POST /api/attendance/check-in` - Employee check-in
- `POST /api/attendance/check-out` - Employee check-out
- `GET /api/attendance/report` - Generate attendance report

#### Payroll
- `POST /api/payroll/generate` - Generate payroll
- `POST /api/payroll/batch` - Batch payroll operations
- `GET /api/payroll/[id]` - Get payroll details
- `PUT /api/payroll/[id]` - Update payroll
- `POST /api/payroll/[id]/approve` - Approve payroll
- `POST /api/payroll/[id]/pay` - Process payroll payment

### Finance Operations

#### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/[id]` - Get expense details
- `PUT /api/expenses/[id]` - Update expense
- `POST /api/expenses/[id]/action` - Approve/reject expense

#### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/[id]` - Get transaction details
- `PUT /api/transactions/[id]` - Update transaction
- `POST /api/transactions/[id]/reconcile` - Reconcile transaction

### Business Directory

#### Businesses
- `GET /api/directory/businesses` - List businesses with filters
- `POST /api/directory/businesses` - Create business listing
- `GET /api/directory/businesses/[id]` - Get business details
- `PUT /api/directory/businesses/[id]` - Update business

#### Categories & Locations
- `GET /api/directory/categories` - Get business categories
- `GET /api/directory/locations` - Get locations
- `GET /api/directory/search` - Search directory

### Support System

#### Tickets
- `GET /api/tickets` - List support tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/[id]` - Get ticket details
- `PUT /api/tickets/[id]` - Update ticket
- `GET /api/tickets/[id]/messages` - Get ticket messages
- `POST /api/tickets/[id]/messages` - Add message to ticket

#### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `POST /api/notifications/[id]/read` - Mark notification as read

### Reports
- `GET /api/reports/projects` - Generate project reports
- `GET /api/reports/finance` - Generate finance reports
- `GET /api/reports/hr` - Generate HR reports
- `GET /api/reports/support` - Generate support reports
- `GET /api/reports/amc` - Generate AMC reports

### Utilities
- `POST /api/contact` - Submit contact form
- `POST /api/leads/capture` - Capture lead data
- `POST /api/ocr` - OCR document processing
- `POST /api/media/upload` - Upload media file
- `GET /api/cloudinary/list-images` - List Cloudinary images
- `POST /api/gemini` - Gemini AI integration
- `POST /api/webhook` - Webhook endpoint
- `POST /api/whatsapp` - WhatsApp integration

## 🗄️ Database Schema

### Core Tables

#### Users & Roles
- **profiles** - User profiles with RBAC roles (CLIENT, STAFF, ADMIN)
  - Columns: id, userId, fullName, role, createdAt

#### Business Entities
- **clients** - Enterprise clients with contact details
  - Columns: id, name, active, contactPerson, email, phone, whatsapp, logoUrl, address, city, country
- **services** - Service catalog with pricing
  - Columns: id, publicId, name, category, tagline, description, price, currency, imageUrl
- **orders** - Customer orders with status tracking
  - Columns: id, customerName, customerPhone, customerLocation, status, totalAmount, meta
- **order_items** - Order line items breakdown
  - Columns: id, orderId, serviceId, quantity, unitPrice
- **invoices** - Customer invoices with line items
  - Columns: id, invoiceNumber, clientId, orderId, issueDate, dueDate, total, status, items (JSONB)
- **amcs** - Annual Maintenance Contracts
  - Columns: id, publicId, clientId, serviceId, contractNumber, startDate, endDate, amount, status, renewedFrom, renewedTo

#### Project Management
- **projects** - Projects with progress tracking
  - Columns: id, publicId, clientId, serviceId, name, description, status, leadId, startDate, endDate, budget, progress, deletedAt
- **project_tasks** - Project tasks with time tracking
  - Columns: id, projectId, assignedTo, title, description, status, priority, dueDate, estimatedHours, actualHours, position
- **task_comments** - Threaded task comments
  - Columns: id, taskId, userId, content, parentId, deletedAt
- **task_checklist_items** - Task checklist items
  - Columns: id, taskId, title, isCompleted, position, completedAt
- **project_members** - Project member permissions
  - Columns: id, projectId, userId, role, joinedAt
- **project_milestones** - Project milestones with status
  - Columns: id, projectId, name, description, status, dueDate, completedAt, position
- **activity_events** - Activity feed for projects
  - Columns: id, projectId, userId, eventType, entityType, entityId, metadata

#### HR & Payroll
- **employees** - Employee records with payroll info
  - Columns: id, profileId, designation, baseSalary, joinDate, tin, pfNumber, bankAccountNumber, status, department
- **attendance** - Employee attendance tracking
  - Columns: id, employeeId, date, checkIn, checkOut, location (JSONB)
- **payslips** - Employee payslips with payroll breakdown
  - Columns: id, employeeId, month, year, netSalary, status, basicSalary, pfEmployee, pfEmployer, gisDeduction, pitDeduction

#### Finance
- **transactions** - Financial transactions
  - Columns: id, type, amount, category, referenceId, notes, date
- **expenses** - Business expenses with approval
  - Columns: id, employeeId, amount, category, description, receiptUrl, status

#### Support & Directory
- **tickets** - Support tickets with priority
  - Columns: id, clientId, assignedTo, subject, description, status, priority
- **ticket_messages** - Ticket conversation threads
  - Columns: id, ticketId, senderId, message, isSystem
- **locations** - Bhutanese locations directory
  - Columns: id, publicId, name, district, dzongkhag, thromde, coordinates
- **businesses** - Business directory listings
  - Columns: id, publicId, slug, name, categoryId, locationId, phone, whatsapp, email, rating, isVerified
- **business_reviews** - Business reviews
  - Columns: id, publicId, businessId, customerName, rating, comment, response, status
- **business_categories** - Business category hierarchy
  - Columns: id, publicId, name, slug, icon, parentId

#### System
- **audit_logs** - Compliance audit logs
  - Columns: id, operatorId, action, entityType, entityId, details (JSONB)
- **notifications** - User notifications
  - Columns: id, userId, title, message, type, category, entityType, entityId, read, link
- **settings** - Application settings
  - Columns: id, key, value (JSONB), description

## 🔧 Services Layer

### Core Services
- **projectService** - Project CRUD operations and management
  - File: `lib/services/projectService.ts`
  - Methods: listProjects, createProject, updateProject, deleteProject, getProjectById
- **taskService** - Task CRUD operations and status management
  - File: `lib/services/taskService.ts`
  - Methods: createTask, updateTask, deleteTask, getTaskById, updateTaskStatus
- **clientService** - Client CRUD operations
  - File: `lib/services/clientService.ts`
  - Methods: createClient, updateClient, deleteClient, getClients, getClientById
- **orderService** - Order CRUD operations
  - File: `lib/services/orderService.ts`
  - Methods: createOrder, updateOrder, deleteOrder, getOrders
- **invoiceService** - Invoice CRUD operations and status management
  - File: `lib/services/invoiceService.ts`
  - Methods: createInvoice, updateInvoice, deleteInvoice, getInvoices, updateInvoiceStatus
- **amcService** - Annual Maintenance Contract management
  - File: `lib/services/amcService.ts`
  - Methods: createAMC, updateAMC, deleteAMC, getAMCs, renewAMC

### Task Management
- **taskCommentService** - Task comment management
- **taskChecklistService** - Task checklist management

### Project Management
- **projectMemberService** - Project member management and permissions
- **milestoneService** - Project milestone management
- **activityService** - Activity logging and tracking

### HR & Payroll
- **employeeService** - Employee CRUD operations
  - File: `lib/services/employeeService.ts`
- **attendanceService** - Attendance tracking and reporting
  - File: `lib/services/attendanceService.ts`
- **payrollService** - Payroll generation and processing
  - File: `lib/services/payrollService.ts`

### Finance
- **expenseService** - Expense management and approval
- **transactionService** - Transaction management and reconciliation

### Support
- **ticketService** - Support ticket management
- **notificationService** - Notification management
- **reportService** - Report generation services

## 🏗️ Architecture Pattern

The codebase follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                              │
│                    (app/admin/, components/)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│                    (app/api/*/route.ts)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│                  (lib/services/*.ts)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Repository Layer                            │
│                (lib/repositories/*.ts)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Database Layer                              │
│                  (db/schema.ts, drizzle)                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication & Authorization

- **Auth Provider**: Supabase
- **Session Management**: Supabase Auth with server-side helpers
- **Roles**: CLIENT, STAFF, ADMIN
- **API Authentication**: `lib/auth/api-auth.ts`
- **Middleware**: `middleware.ts` for route protection

## 📊 Key Components

### UI Components (Shadcn/UI)
- Button, Card, Input, Dialog, Table, Form, Select, Toast, Dropdown Menu
- Location: `components/ui/`

### Custom Components
- ProjectHub, TicketHub, FinanceHub, HRDashboard
- Location: `app/admin/[module]/`

### Admin Pages
- `/admin` - Dashboard
- `/admin/projects` - Project Management
- `/admin/clients` - Client Management
- `/admin/invoice` - Invoice Management
- `/admin/hr` - HR Management
- `/admin/amc` - AMC Management

## 🚀 AI Optimization Features

### Codebase Index
- **File**: `lib/ai/codebase-index.ts`
- **Purpose**: Central registry of all files
- **Contains**: API routes, services, repositories, tables, components

### Context Optimizer
- **File**: `lib/ai/context-optimizer.ts`
- **Purpose**: Intelligent file selection based on queries
- **Features**: Caching, query expansion, context presets

### Usage Examples

```typescript
// Get context for project development
import { getModuleContext } from '@/lib/ai/context-optimizer';
const projectFiles = getModuleContext('project');

// Get API routes for invoice operations
import { getAPIContext } from '@/lib/ai/context-optimizer';
const apiFiles = getAPIContext('/api/invoices');

// Optimize context for a query
import { optimizeContext } from '@/lib/ai/context-optimizer';
const optimized = await optimizeContext('project tasks', {
  maxResults: 5,
  includeAPIRoutes: true,
  includeServices: true
});
```

## 📝 Development Notes

- **TypeScript**: Strict mode enabled
- **Framework**: Next.js 14 with App Router
- **Database**: Supabase PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod schemas
- **Styling**: Tailwind CSS
- **UI Library**: Radix UI (shadcn/ui)

## 🔄 Status Workflows

### Project Status
- planning → active → testing → complete
- Can go to: on_hold, cancelled (from any state)

### Task Status
- todo → in_progress → done
- Can go to: blocked (from in_progress or todo)

### Invoice Status
- draft → sent → paid
- sent → overdue (after due date)
- Can go to: cancelled (from draft or sent)

### Payslip Status
- draft → approved → paid
- Can go to: cancelled (from draft or approved)

### AMC Status
- active → expiring (≤30 days before end)
- expiring → expired (after end date)
- Renewal creates new contract with linkage

### Ticket Status
- open → in_progress → resolved
- Auto-close 7 days after resolved

## 🎯 Quick Reference

### Working with Projects
```typescript
// Read these files:
lib/services/projectService.ts
lib/repositories/projectRepository.ts
app/api/projects/route.ts
app/admin/projects/project-hub.tsx
```

### Working with Payroll
```typescript
// Read these files:
lib/services/payrollService.ts
lib/repositories/payrollRepository.ts
lib/config/taxConstants.ts  // Bhutan tax rates
app/api/payroll/generate/route.ts
app/api/payroll/batch/route.ts
```

### Working with Invoices
```typescript
// Read these files:
lib/services/invoiceService.ts
lib/repositories/invoiceRepository.ts
app/api/invoices/route.ts
app/admin/invoice/page.tsx
```

### Working with Database
```typescript
// Read these files:
db/schema.ts  // Complete schema definition
drizzle/*.sql  // Migration files
drizzle.config.ts  // Drizzle configuration
```

This index provides AI with a comprehensive map of the codebase to minimize token usage and improve development efficiency.
