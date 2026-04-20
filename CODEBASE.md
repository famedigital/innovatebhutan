# Codebase Architecture Guide

> **Innovate Bhutan** - Next.js 16 ERP System with Supabase Backend

**Last Updated:** 2025-04-19

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [Architecture Patterns](#architecture-patterns)
5. [Key Modules](#key-modules)
6. [API Routes](#api-routes)
7. [Component Library](#component-library)
8. [Authentication](#authentication)
9. [Environment Configuration](#environment-configuration)
10. [Development Workflow](#development-workflow)

---

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 16.2.0 (App Router) |
| **Database** | Supabase (PostgreSQL) | Latest |
| **ORM** | Drizzle ORM | 0.45.2 |
| **Styling** | Tailwind CSS | 4.2.0 |
| **UI Components** | Radix UI | Various |
| **Forms** | React Hook Form + Zod | 7.54.1 + 3.24.1 |
| **Charts** | Recharts | 2.15.0 |
| **Deployment** | Vercel | - |
| **Media** | Cloudinary | 2.9.0 |

---

## Project Structure

```
innovate-bhutan/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard pages
│   │   ├── ai/                   # AI bot training console
│   │   ├── amc/                  # Annual Maintenance Contracts
│   │   ├── blog/                 # Blog management
│   │   ├── clients/              # Client management (300+ partners)
│   │   ├── finance/              # Finance & invoicing
│   │   ├── hr/                   # HR & employee management
│   │   ├── invoice/              # Invoice management
│   │   ├── marketing/            # Marketing campaigns
│   │   ├── media/                # Media library
│   │   ├── projects/             # Project management hub
│   │   ├── services/             # Service catalog editor
│   │   ├── settings/             # System settings
│   │   ├── support/              # Support ticket system
│   │   ├── tickets/              # Ticket dispatch & tracking
│   │   ├── whatsapp/             # WhatsApp integration
│   │   └── page.tsx              # Admin dashboard
│   ├── api/                      # API routes
│   ├── auth/                     # Authentication callbacks
│   ├── client/                   # Client portal
│   ├── company/                  # Company pages
│   ├── directory/                # Business directory
│   ├── services/                 # Services showcase
│   ├── support/                  # Support pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/
│   ├── ui/                       # Radix UI components (shadcn/ui)
│   ├── app-sidebar.tsx           # Main navigation sidebar
│   ├── theme-*.tsx               # Theme providers
│   ├── hero-section.tsx          # Homepage hero
│   ├── service-directory.tsx     # Services grid
│   └── ...                       # Other page components
├── db/
│   └── schema.ts                 # Drizzle schema definitions
├── drizzle/                      # Database migrations
│   ├── meta/                     # Migration metadata
│   └── *.sql                     # Migration files
├── lib/
│   ├── repositories/             # Data access layer
│   │   └── projectRepository.ts  # Projects data access
│   ├── services/                 # Business logic layer
│   │   └── projectService.ts     # Projects business logic
│   ├── validations/              # Zod schemas
│   ├── utils.ts                  # Utility functions
│   ├── cloudinary.ts             # Media upload
│   ├── whatsapp.ts               # WhatsApp integration
│   └── gemini.ts                 # AI integration
├── supabase/                     # Supabase functions
├── middleware.ts                 # Auth middleware
├── drizzle.config.ts             # Drizzle configuration
└── tsconfig.json                 # TypeScript config
```

---

## Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `services` | Service catalog | publicId, name, category, price |
| `clients` | Enterprise partners | name, whatsapp, logoUrl |
| `orders` | Infrastructure deployments | customerName, status, totalAmount |
| `order_items` | Order line items | orderId, serviceId, quantity |
| `profiles` | User profiles & RBAC | userId, role (ADMIN/STAFF/CLIENT) |
| `projects` | Project tracking | publicId, clientId, status, progress, deletedAt |
| `project_tasks` | Task management | projectId, assignedTo, status, position, deletedAt |
| `project_members` | Project RBAC | projectId, userId, role (owner/lead/member/viewer) |
| `project_milestones` | Project phases | projectId, name, status, dueDate, deletedAt |
| `task_comments` | Task collaboration | taskId, userId, content, parentId, deletedAt |
| `task_checklist_items` | Task subtasks | taskId, title, isCompleted, position, deletedAt |
| `activity_events` | Activity feed | projectId, userId, eventType, entityType, entityId |
| `tickets` | Support tickets | clientId, assignedTo, priority |
| `ticket_messages` | Ticket threads | ticketId, senderId, message |
| `employees` | HR records | profileId, designation, baseSalary |
| `attendance` | Time tracking | employeeId, checkIn, checkOut |
| `payslips` | Payroll | employeeId, month, year, netSalary |
| `transactions` | Finance ledger | type (INCOME/EXPENSE), amount |
| `expenses` | Expense reports | employeeId, category, receiptUrl |
| `invoices` | Billing | clientId, amount, status |
| `businesses` | Directory listings | publicId, slug, categoryId |
| `business_reviews` | Customer reviews | businessId, rating, isVerified |
| `locations` | Geographic data | name, dzongkhag, thromde |
| `business_categories` | Categories | name, slug, parentId |
| `audit_logs` | Compliance tracking | operatorId, action, entityType |
| `notifications` | Alerts | userId, type, category, entityType, entityId |
| `settings` | App configuration | key, value (JSONB) |

### Status Enums

- **Project:** `planning` → `active` → `testing` → `complete`
- **Task:** `todo` → `in_progress` → `done` | `blocked`
- **Priority:** `low` | `medium` | `high` | `urgent`
- **Ticket:** `open` → `in_progress` → `resolved`
- **Invoice:** `unpaid` → `paid` | `overdue`
- **AMC:** `active` → `expiring` → `expired`

---

## Architecture Patterns

### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer                    │
│  (app/, components/) - React Server Components  │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│           API Layer                             │
│     (app/api/) - Next.js Route Handlers         │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│           Service Layer (Business Logic)        │
│     (lib/services/) - Validation & Orchestration│
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│           Repository Layer (Data Access)        │
│    (lib/repositories/) - Drizzle ORM Queries    │
└─────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────┐
│           Database Layer                        │
│         (Supabase PostgreSQL)                   │
└─────────────────────────────────────────────────┘
```

### Example: Projects Module

1. **UI:** `app/admin/projects/project-hub.tsx`
2. **API:** `app/api/projects/route.ts`
3. **Service:** `lib/services/projectService.ts`
4. **Repository:** `lib/repositories/projectRepository.ts`
5. **Validation:** `lib/validations/project.ts`

---

## Key Modules

### Projects Module
- **Location:** `app/admin/projects/`
- **Features:**
  - **Multi-view Project Hub:** Table view with sorting, calendar view by start date
  - **Advanced Filtering:** By client, lead, status, date range, and search
  - **Kanban Board:** Drag-and-drop task management (todo → in_progress → done → blocked)
  - **Progress Calculation:** Automatic based on completed tasks percentage
  - **Soft Delete:** Projects and tasks can be soft deleted and restored
  - **RBAC System:** Project-level membership (owner > lead > member > viewer > client_viewer)
  - **Milestones:** Phases/gates with due dates and status tracking
  - **Task Comments:** Threaded comments on tasks for collaboration
  - **Task Checklists:** Subtasks within tasks for granular tracking
  - **Activity Feed:** Real-time activity events for UX transparency
  - **Notifications:** In-app alerts for task assignments, due dates, mentions
- **Files:**
  - `project-hub.tsx` - Main projects hub with table/calendar views
  - `create-project-modal.tsx` - New project form
  - `project-detail-modal.tsx` - Project details & Kanban board
- **API Endpoints:**
  - `/api/projects` - List/create projects with filtering
  - `/api/projects/[id]` - Get/update/delete/restore project
  - `/api/projects/[id]/tasks` - Project tasks (list/create/bulk)
  - `/api/projects/[id]/progress` - Get project progress stats
  - `/api/projects/[id]/members` - Project membership management
  - `/api/projects/[id]/milestones` - Project milestones
  - `/api/tasks/[id]` - Individual task CRUD
  - `/api/tasks/[id]/comments` - Task comments
  - `/api/tasks/[id]/checklist` - Task checklist items
  - `/api/projects/[id]/activity` - Activity feed
  - `/api/notifications` - User notifications
- **Data Layer:**
  - `lib/repositories/projectRepository.ts` - Data access with transactions
  - `lib/services/projectService.ts` - Business logic & authorization
  - `lib/repositories/projectMemberRepository.ts` - Membership RBAC
  - `lib/repositories/milestoneRepository.ts` - Milestone data
  - `lib/repositories/taskCommentRepository.ts` - Threaded comments
  - `lib/repositories/taskChecklistRepository.ts` - Checklist items
  - `lib/repositories/activityRepository.ts` - Activity events

### Clients Module
- **Location:** `app/admin/clients/`
- **Features:**
  - Bulk client ingestion
  - WhatsApp group enrollment
  - Logo management
  - AMC tracking

### Finance Module
- **Location:** `app/admin/finance/`
- **Features:**
  - Unified transaction ledger
  - Expense approval workflow
  - Invoice generation
  - Financial reporting

### HR Module
- **Location:** `app/admin/hr/`
- **Features:**
  - Employee onboarding
  - Attendance tracking
  - Payroll generation
  - Document management

### Support Module
- **Location:** `app/admin/tickets/`
- **Features:**
  - Ticket creation & dispatch
  - Incident response workflow
  - WhatsApp integration for notifications

---

## API Routes

### REST API Endpoints

#### Projects API
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/projects` | GET, POST | List/create projects with filtering |
| `/api/projects/[id]` | GET, PATCH, DELETE | Project CRUD + restore |
| `/api/projects/[id]/tasks` | GET, POST, PATCH | Project tasks (bulk operations) |
| `/api/projects/[id]/progress` | GET | Project progress stats |
| `/api/projects/[id]/members` | GET, POST, PATCH, DELETE | Membership management |
| `/api/projects/[id]/milestones` | GET, POST | Project milestones |
| `/api/projects/[id]/activity` | GET | Activity feed (paginated) |
| `/api/tasks/[id]` | GET, PATCH, DELETE | Individual task CRUD |
| `/api/tasks/[id]/comments` | GET, POST | Task comments |
| `/api/comments/[id]` | PATCH, DELETE | Comment edit/delete |
| `/api/tasks/[id]/checklist` | GET, POST | Checklist items |
| `/api/checklist-items/[id]` | PATCH, DELETE | Checklist item toggle/delete |
| `/api/milestones/[id]` | GET, PATCH, DELETE | Milestone CRUD |
| `/api/notifications` | GET, PATCH, DELETE | User notifications |
| `/api/notifications/mark-all` | PATCH | Mark all as read |

#### General API
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/clients` | GET, POST | Client management |
| `/api/services` | GET, POST | Service catalog |
| `/api/profiles` | GET | User profiles |
| `/api/media/upload` | POST | Cloudinary upload |
| `/api/leads/capture` | POST | Lead capture |
| `/api/leads/webhook` | POST | Lead webhook |
| `/api/ocr` | POST | OCR processing |
| `/api/whatsapp` | POST | WhatsApp messages |
| `/api/gemini` | POST | AI queries |
| `/api/directory/search` | GET | Business search |
| `/api/directory/businesses` | GET, POST | Business listings |
| `/api/contact` | POST | Contact form |

---

## Component Library

### UI Components (`components/ui/`)

Built with Radix UI primitives and Tailwind CSS:

| Component | Purpose |
|-----------|---------|
| `button.tsx` | Button variants |
| `card.tsx` | Card containers |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Dropdown menus |
| `form.tsx` | React Hook Form integration |
| `input.tsx` | Form inputs |
| `select.tsx` | Select dropdowns |
| `table.tsx` | Data tables |
| `sidebar.tsx` | Collapsible sidebar |
| `toast.tsx` | Toast notifications |
| `chart.tsx` | Recharts integration |

### Page Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `HeroSection` | Homepage | Landing hero |
| `ServiceDirectory` | Homepage | Services grid |
| `AppSidebar` | Layout | Main navigation |
| `Navigation` | Layout | Header nav |
| `FooterSection` | Layout | Site footer |

---

## Authentication

### Supabase Auth Integration

1. **Middleware:** `middleware.ts` - Session management
2. **Callback:** `app/auth/callback/route.ts` - OAuth handler
3. **SSR Client:** `@/utils/supabase/server` - Server client
4. **Browser Client:** `@/utils/supabase/browser` - Browser client

### RBAC Roles

| Role | Permissions |
|------|-------------|
| `ADMIN` | Full system access |
| `STAFF` | Operational access |
| `CLIENT` | Client portal access |

---

## Environment Configuration

### Required Environment Variables

```bash
# Supabase
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Google AI
GEMINI_API_KEY=...

# WhatsApp (optional)
WHATSAPP_API_KEY=...
WHATSAPP_PHONE_NUMBER_ID=...
```

---

## Development Workflow

### Database Migrations

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Open Drizzle Studio
pnpm drizzle-kit studio
```

### Development Server

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Code Patterns

1. **Server Components First** - Use server components by default
2. **Type Safety** - All schemas use TypeScript inference
3. **Validation** - Zod schemas for input validation
4. **Error Handling** - Proper error boundaries and API error responses
5. **Progressive Enhancement** - Client components only when needed

### File Naming Conventions

- **Pages:** `page.tsx` (App Router convention)
- **Modals:** `*-modal.tsx`
- **Hubs:** `*-hub.tsx` (e.g., `project-hub.tsx`)
- **Services:** `*Service.ts` (e.g., `projectService.ts`)
- **Repositories:** `*Repository.ts` (e.g., `projectRepository.ts`)
- **Validations:** `*.ts` (e.g., `project.ts`)

---

## Import Path Conventions

```typescript
// Database
import { db } from "@/db";
import { projects, clients } from "@/db/schema";

// Repositories
import { projectRepository } from "@/lib/repositories/projectRepository";

// Services
import { projectService } from "@/lib/services/projectService";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Utils
import { cn } from "@/lib/utils";
```

---

## Testing & Quality

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint configuration
- **Build Verification:** Always run `pnpm build` before deploying

---

## Deployment

- **Platform:** Vercel
- **Database:** Supabase Cloud
- **Media:** Cloudinary CDN
- **Analytics:** Vercel Analytics

---

## Important Notes for Agents

1. **Use Drizzle ORM for all database operations** - No raw SQL queries
2. **Follow the layered architecture** - API → Service → Repository → DB
3. **Use server components by default** - Only use 'use client' when necessary
4. **Always validate input** - Use Zod schemas for validation
5. **Use TypeScript strict mode** - All code must be type-safe
6. **Use Radix UI components** - Don't build custom UI primitives
7. **Follow existing patterns** - Look at similar features before implementing new ones
8. **Use explicit file extensions in imports** - E.g., `./page.tsx` not `./page`
