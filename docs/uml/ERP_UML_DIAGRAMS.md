# Innovate Bhutan ERP - Complete UML Diagrams

> **Production System Architecture with Decision Points**
>
> **Last Updated:** 2026-05-12
> **Version:** 1.0.0

---

## Table of Contents

1. [Entity Relationship Diagram (ERD)](#entity-relationship-diagram-erd)
2. [State Machine Diagrams](#state-machine-diagrams)
3. [Sequence Diagrams](#sequence-diagrams)
4. [Component Diagram](#component-diagram)
5. [Activity Diagrams](#activity-diagrams)
6. [Deployment Diagram](#deployment-diagram)

---

## 1. Entity Relationship Diagram (ERD)

### Core Database Entities

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         INNOVATE BHUTAN ERP - DATABASE LAYER                    │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │  profiles    │
                                    │  (RBAC Hub)  │
                                    └──────┬───────┘
                                           │ user_id
                   �───────────────────────┼───────────────────────┐
                   │                       │                       │
                   ▼                       ▼                       ▼
          ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
          │   projects     │     │   employees    │     │    clients     │
          │                │     │                │     │                │
          │ • public_id    │     │ • profile_id   │     │ • name         │
          │ • client_id    │◄────┤ • designation  │     │ • whatsapp     │
          │ • status       │     │ • base_salary  │     │ • email        │
          │ • progress     │     │ • status       │     │ • logo_url     │
          └───────┬────────┘     └────────┬───────┘     └────────┬───────┘
                  │                        │                       │
                  │ project_id             │ employee_id            │
                  │                        │                       │
    ┌─────────────┼─────────────┐   ┌─────┴──────┐        ┌──────┴──────┐
    │             │             │   │            │        │             │
    ▼             ▼             ▼   ▼            ▼        ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────┐
│ tasks  │  │milestones│  │ members  │  │attendance│  │payslips │  │ amcs │
│        │  │          │  │          │  │          │  │         │  │      │
│•status │  │•due_date │  │•role     │  │•check_in │  │•status  │  │•status│
└────────┘  └──────────┘  └──────────┘  └──────────┘  └─────────┘  └──────┘
    │                                                       │
    │                                                       │
    ▼                                                       ▼
┌──────────┐                                         ┌──────────┐
│ comments │                                         │ invoices │
│checklist │                                         │          │
└──────────┘                                         │•status   │
                                                     │•items    │
                                                     └──────────┘
```

### Entity Relationships (Detailed)

| Entity | Relation | Target Entity | Cardinality | Description |
|--------|----------|---------------|-------------|-------------|
| **profiles** | → | projects | 1:N (leadId) | A profile leads many projects |
| **clients** | → | projects | 1:N | A client has many projects |
| **services** | → | projects | 1:N | A service applies to many projects |
| **projects** | → | projectTasks | 1:N | A project has many tasks |
| **projects** | → | projectMembers | 1:N | A project has many members |
| **projects** | → | projectMilestones | 1:N | A project has many milestones |
| **projects** | → | activityEvents | 1:N | A project has many activity events |
| **projectTasks** | → | taskComments | 1:N | A task has many comments |
| **projectTasks** | → | taskChecklistItems | 1:N | A task has many checklist items |
| **clients** | → | amcs | 1:N | A client has many AMCs |
| **clients** | → | invoices | 1:N | A client has many invoices |
| **clients** | → | tickets | 1:N | A client has many tickets |
| **tickets** | → | ticketMessages | 1:N | A ticket has many messages |
| **profiles** | → | employees | 1:1 | A profile links to one employee record |
| **employees** | → | attendance | 1:N | An employee has many attendance records |
| **employees** | → | payslips | 1:N | An employee has many payslips |
| **employees** | → | expenses | 1:N | An employee submits many expenses |
| **invoices** | → | transactions | 1:1 | An invoice generates a transaction |
| **orders** | → | orderItems | 1:N | An order has many line items |
| **orders** | → | invoices | 1:N | An order generates invoices |
| **businesses** | → | businessReviews | 1:N | A business has many reviews |
| **businessCategories** | → | businesses | 1:N (self-ref) | Categories form a hierarchy |

---

## 2. State Machine Diagrams

### 2.1 Invoice State Machine

```
                    ┌─────────────────────────────────────────┐
                    │           INVOICE LIFECYCLE             │
                    └─────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │  draft  │ ◄─────────────────────────────────────┐
    └────┬────┘                                       │
         │                                            │
         │ User clicks "Send Invoice"?                 │
         │ └─ YES: Validate client_email exists?       │
         │     └─ YES: Validate total > 0?             │
         │         └─ YES: Generate invoice_number     │
         │                   └─ NO: Show error         │
         │     └─ NO: Show error "No client email"     │
         │ └─ NO: Stay in draft                        │
         ▼                                             │
    ┌─────────┐                                       │
    │  sent   │                                       │
    └────┬────┘                                       │
         │                                            │
         │ Payment received?                           │
         │ └─ YES: Go to paid                         │
         │ └─ NO: Check due_date < today?             │
         │     └─ YES: Go to overdue                  │
         │     └─ NO: Stay in sent                    │
         ▼                                             │
    ┌─────────┐      ┌─────────┐                       │
    │  paid   │      │ overdue │                       │
    └────┬────┘      └────┬────┘                       │
         │                  │                          │
         │                  │ Payment received?        │
         │                  │ └─ YES: Go to paid       │
         │                  │ └─ NO: Stay in overdue   │
         ▼                  ▼                          │
    ┌─────────┐      ┌─────────┐                       │
    │  END    │      │ END     │                       │
    └─────────┘      └─────────┘                       │
         │                  │                          │
         └──────────────────┴──────────────────────────┘
                           │
                           │ User clicks "Cancel"?
                           │ └─ YES: Can cancel?
                           │     └─ YES (draft/sent/overdue): Go to cancelled
                           │     └─ NO (paid): Show error "Cannot cancel paid invoice"
                           ▼
                    ┌─────────┐
                    │cancelled│
                    └─────────┘
```

### 2.2 Ticket State Machine

```
                    ┌─────────────────────────────────────────┐
                    │           TICKET LIFECYCLE              │
                    └─────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │  open   │
    └────┬────┘
         │
         │ Staff assigned?
         │ └─ YES: Go to in_progress
         │ └─ NO: Stay in open
         ▼
    ┌─────────────────┐
    │  in_progress    │◄──────────────────┐
    └────┬────────────┘                   │
         │                                │
         │ Resolution provided?           │
         │ └─ YES: Validate resolution?   │
         │     └─ YES: Go to resolved     │
         │     └─ NO: Stay in in_progress │
         │                                │
         │ Client replies?                │
         │ └─ YES: Reopen → in_progress   │
         ▼                                │
    ┌─────────┐                          │
    │resolved │                          │
    └────┬────┘                          │
         │                                │
         │ Client confirms satisfied?     │
         │ └─ YES: Close ticket           │
         │ └─ NO: Reopen → in_progress    │
         ▼                                │
    ┌─────────┐                          │
    │   END   │                          │
    └─────────┘                          │
                                         │
         ┌───────────────────────────────┘
         │
         │ Priority escalation?
         │ └─ YES: Is overdue > 24h?
         │     └─ YES: Escalate to ADMIN
         │     └─ NO: Keep current priority
         ▼
    ┌─────────────────┐
    │ escalated_admin │
    └─────────────────┘
```

### 2.3 Project State Machine

```
                    ┌─────────────────────────────────────────┐
                    │          PROJECT LIFECYCLE              │
                    └─────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         ▼
    ┌──────────┐
    │ planning │
    └────┬─────┘
         │
         │ Requirements gathered?
         │ └─ YES: Team assigned?
         │     └─ YES: Start date confirmed?
         │         └─ YES: Go to active
         │         └─ NO: Stay in planning
         │     └─ NO: Stay in planning
         │ └─ NO: Stay in planning
         ▼
    ┌──────────┐
    │  active  │◄───────────────────────────────┐
    └────┬─────┘                                │
         │                                      │
         │ All tasks done?                      │
         │ └─ YES: Deliverables ready?          │
         │     └─ YES: Go to testing            │
         │     └─ NO: Stay in active            │
         │ └─ NO: Stay in active                │
         │                                      │
         │ Blocker encountered?                 │
         │ └─ YES: Go to on_hold                │
         │ └─ NO: Continue in active            │
         ▼                                      │
    ┌──────────┐      ┌──────────┐             │
    │ testing  │      │ on_hold  │             │
    └────┬─────┘      └────┬─────┘             │
         │                  │                   │
         │ UAT passed?      │ Blocker resolved? │
         │ └─ YES: Go to    │ └─ YES: Return   │
         │         complete │         to active  │
         │ └─ NO: Fixes     │ └─ NO: Cancel?   │
         │        needed    │     └─ YES: Go    │
         │     → active     │         to         │
         │                  │         cancelled  │
         ▼                  ▼                   │
    ┌──────────┐  ┌──────────┐                 │
    │ complete │  │cancelled │                 │
    └────┬─────┘  └──────────┘                 │
         │                                      │
         │ Client acceptance?                   │
         │ └─ YES: Close project                │
         │ └─ NO: Return to testing             │
         ▼                                      │
    ┌─────────┐                                │
    │   END   │                                │
    └─────────┘                                │
                                               │
         └─────────────────────────────────────┘
```

### 2.4 Payslip State Machine

```
                    ┌─────────────────────────────────────────┐
                    │          PAYSLIP LIFECYCLE              │
                    └─────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         │ Payroll generation triggered?
         │ └─ YES: Month closed?
         │     └─ YES: Validate attendance data exists?
         │         └─ YES: Calculate salaries
         │                   └─ NO: Show error
         │     └─ NO: Show error "Month not closed"
         │ └─ NO: Wait for trigger
         ▼
    ┌─────────┐
    │  draft  │
    └────┬────┘
         │
         │ Calculation successful?
         │ └─ YES: All deductions valid?
         │     └─ YES: Go to approval
         │     └─ NO: Show error, stay in draft
         │ └─ NO: Show calculation error
         ▼
    ┌───────────┐
    │ approved  │
    └─────┬─────┘
         │
         │ Finance approval?
         │ └─ YES: Generate PDF
         │     └─ PDF generated?
         │         └─ YES: Go to paid
         │         └─ NO: Stay in approved
         │ └─ NO: Reject → draft
         ▼
    ┌─────────┐
    │  paid   │
    └────┬────┘
         │
         │ Payment confirmed?
         │ └─ YES: Record payment_date
         │     └─ Update employee balance
         │ └─ NO: Stay in approved
         ▼
    ┌─────────┐
    │   END   │
    └─────────┘

    ┌─────────────────────────────────────────┐
    │           CANCELLATION BRANCH            │
    └─────────────────────────────────────────┘
         │
         │ Admin cancels?
         │ └─ YES: Is paid?
         │     └─ NO: Go to cancelled
         │     └─ YES: Show error "Cannot cancel paid payslip"
         ▼
    ┌───────────┐
    │ cancelled │
    └───────────┘
```

### 2.5 AMC (Annual Maintenance Contract) State Machine

```
                    ┌─────────────────────────────────────────┐
                    │            AMC LIFECYCLE                │
                    └─────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │  active │
    └────┬────┘
         │
         │ Check: end_date - today < 30 days?
         │ └─ YES: Is already expiring?
         │     └─ NO: Change status to expiring
         │         └─ Send notification to ADMIN
         │     └─ YES: Stay in expiring
         │ └─ NO: Stay in active
         ▼
    ┌──────────┐
    │  expiring│
    └────┬─────┘
         │
         │ Client wants renewal?
         │ └─ YES: Create new AMC record
         │     └─ Link renewed_from → current_id
         │     └─ Link current renewed_to → new_id
         │     └─ New status: active
         │ └─ NO: Wait for expiry
         ▼
    ┌─────────┐
    │ expired │
    └────┬────┘
         │
         │ Grace period (7 days) over?
         │ └─ YES: Archive record
         │ └─ NO: Can still renew
         ▼
    ┌─────────┐
    │   END   │
    └─────────┘

    ┌─────────────────────────────────────────┐
    │         CANCELLATION BRANCH             │
    └─────────────────────────────────────────┘
         │
         │ Client cancels?
         │ └─ YES: Is still active/expiring?
         │     └─ YES: Change status to cancelled
         │     └─ Calculate refund if applicable
         │     └─ Send cancellation notice
         │     └─ Go to cancelled
         │     └─ NO: Already expired, cannot cancel
         ▼
    ┌───────────┐
    │ cancelled │
    └───────────┘
```

---

## 3. Sequence Diagrams

### 3.1 Project Creation Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      PROJECT CREATION SEQUENCE                              │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│  ADMIN  │    │   UI    │    │API Route │    │  Service  │    │   DB    │
└────┬────┘    └────┬────┘    └────┬─────┘    └────┬─────┘    └────┬────┘
     │              │              │               │               │
     │  Click "New  │              │               │               │
     │  Project"    │              │               │               │
     ├─────────────>│              │               │               │
     │              │              │               │               │
     │  Fill form:  │              │               │               │
     │  - Name      │              │               │               │
     │  - Client    │              │               │               │
     │  - Service   │              │               │               │
     │  - Lead      │              │               │               │
     │  - Dates     │              │               │               │
     │              │              │               │               │
     │  Click "Create"             │               │               │
     ├─────────────>│              │               │               │
     │              │              │               │               │
     │              │  POST /api/projects           │               │
     │              ├─────────────>│               │               │
     │              │              │               │               │
     │              │              │  Validate input              │
     │              │              ├──────────────>│               │
     │              │              │               │               │
     │              │              │  Valid?      │               │
     │              │              │<──────────────┤               │
     │              │              │               │               │
     │              │              │  ┌─ YES: Continue              │
     │              │              │  └─ NO: Return 400            │
     │              │              │               │               │
     │              │              │  Check client exists          │
     │              │              ├──────────────>│               │
     │              │              │               │               │
     │              │              │  ┌─ YES: Continue              │
     │              │              │  └─ NO: Return 404            │
     │              │              │               │               │
     │              │              │  Generate public_id           │
     │              │              ├──────────────>│               │
     │              │              │               │               │
     │              │              │  Create project record        │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │               │  ┌─ Success:  │
     │              │              │               │  │  Return id │
     │              │              │               │  └─ Error:    │
     │              │              │               │     Throw    │
     │              │              │               │               │
     │              │              │  Return project               │
     │              │              │<──────────────────────────────┤
     │              │              │               │               │
     │              │              │  Log activity event           │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Send notification            │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │  201 Created │               │               │
     │              │<─────────────┤               │               │
     │              │              │               │               │
     │  Show success│              │               │               │
     │  + redirect  │              │               │               │
     │<─────────────┤              │               │               │
     │              │              │               │               │
```

### 3.2 Invoice Payment Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      INVOICE PAYMENT SEQUENCE                                │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│  CLIENT │    │   UI    │    │API Route │    │  Service  │    │   DB    │
└────┬────┘    └────┬────┘    └────┬─────┘    └────┬─────┘    └────┬────┘
     │              │              │               │               │
     │  View invoice│              │               │               │
     ├─────────────>│              │               │               │
     │              │              │               │               │
     │              │  GET /api/invoices/[id]      │               │
     │              ├─────────────>│               │               │
     │              │              │               │               │
     │              │              │  Get invoice by id            │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Check: user authorized?      │
     │              │              │  ┌─ YES: Return invoice       │
     │              │              │  └─ NO: Return 403            │
     │              │              │               │               │
     │              │  Invoice data │               │               │
     │              │<─────────────┤               │               │
     │              │              │               │               │
     │  Click "Pay" │              │               │               │
     ├─────────────>│              │               │               │
     │              │              │               │               │
     │              │  POST /api/invoices/[id]/pay │               │
     │              ├─────────────>│               │               │
     │              │              │               │               │
     │              │              │  Validate invoice exists       │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Check: status != paid        │
     │              │              │  ┌─ YES: Continue              │
     │              │              │  └─ NO: Return 400 (already paid)│
     │              │              │               │               │
     │              │              │  Update invoice: status=paid   │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Create transaction record     │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Log activity event           │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Send notification to ADMIN   │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │  200 OK      │               │               │
     │              │<─────────────┤               │               │
     │              │              │               │               │
     │  Show "Payment │             │               │               │
     │  Successful"  │             │               │               │
     │<─────────────┤              │               │               │
     │              │              │               │               │
```

### 3.3 Task Assignment Flow

```
┌────────────────────────────────────────────────────────────────────────────┐
│                      TASK ASSIGNMENT SEQUENCE                               │
└────────────────────────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐
│  LEAD   │    │   UI    │    │API Route │    │  Service  │    │   DB    │
└────┬────┘    └────┬────┘    └────┬─────┘    └────┬─────┘    └────┬────┘
     │              │              │               │               │
     │  Open task   │              │               │               │
     │  modal       │              │               │               │
     ├─────────────>│              │               │               │
     │              │              │               │               │
     │  Select      │              │               │               │
     │  assignee    │              │               │               │
     ├─────────────>│              │               │               │
     │              │              │               │               │
     │  Click       │              │               │               │
     │  "Assign"    │              │               │               │
     ├─────────────>│              │               │               │
     │              │              │               │               │
     │              │  POST /api/tasks/[id]/assign │               │
     │              ├─────────────>│               │               │
     │              │              │               │               │
     │              │              │  Validate: assignee exists    │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Validate: user is project    │
     │              │              │  member or lead               │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  ┌─ YES: Continue              │
     │              │              │  └─ NO: Return 403            │
     │              │              │               │               │
     │              │              │  Update task: assigned_to     │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Update task: status=in_progress│
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Log activity event           │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Send notification to         │
     │              │              │  assignee                     │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │              │  Create notification record   │
     │              │              ├──────────────────────────────>│
     │              │              │               │               │
     │              │  200 OK      │               │               │
     │              │<─────────────┤               │               │
     │              │              │               │               │
     │  Show "Task  │              │               │               │
     │  Assigned"   │              │               │               │
     │<─────────────┤              │               │               │
     │              │              │               │               │

     ┌───────────────────────────────────────────────────────────┐
     │              ASSIGNEE NOTIFICATION FLOW                    │
     └───────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────┐    ┌──────────┐
│ ASSIGNEE │    │   UI    │    │API Route │
└────┬────┘    └────┬────┘    └────┬─────┘
     │              │              │
     │  Receive     │              │
     │  notification │              │
     ├─────────────>│              │
     │              │              │
     │  Click       │              │
     │  notification │              │
     ├─────────────>│              │
     │              │              │
     │              │  GET /api/notifications  │
     │              ├─────────────>│
     │              │              │
     │              │  Return unread list      │
     │              │<─────────────┤
     │              │              │
     │  Mark as read│              │
     ├─────────────>│              │
     │              │              │
     │              │  PATCH /api/notifications/[id]  │
     │              ├─────────────>│
     │              │              │
     │              │  Update: read=true │
     │              │              │
     │              │  200 OK      │
     │              │<─────────────┤
     │              │              │
```

---

## 4. Component Diagram

### Admin System Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      INNOVATE BHUTAN ERP - COMPONENTS                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │ Sidebar │  │ Header  │  │  Cards  │  │  Modals │  │ Tables  │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PAGE COMPONENTS LAYER                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Project  │ │   AMC    │ │  Invoice │ │   HR     │ │  Ticket  │         │
│  │   Hub    │ │  Page    │ │  Page    │ │ Dashboard│ │  Hub     │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               API LAYER (Routes)                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        app/api/                                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │/projects│ │ /amcs   │ │/invoices│ │ /payroll │ │ /tickets│       │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│  └───────┼──────────┼──────────┼──────────┼──────────┼───────────────┘   │
└──────────┼──────────┼──────────┼──────────┼──────────┼────────────────────┘
           │          │          │          │          │
           ▼          ▼          ▼          ▼          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SERVICE LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        lib/services/                                  │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │projectService│ │amcService   │ │invoiceService│ │payrollService│  │   │
│  │  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘    │   │
│  │         │                │                │                │          │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │taskService   │ │milestoneSvc │ │ticketService │ │notificationSvc│ │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REPOSITORY LAYER                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      lib/repositories/                                │   │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │   │
│  │  │projectRepository│ │clientRepository │ │invoiceRepository│        │   │
│  │  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘        │   │
│  │           │                   │                   │                  │   │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │   │
│  │  │taskRepository   │ │amcRepository    │ │payslipRepository│        │   │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘        │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        Supabase PostgreSQL                            │   │
│  │                                                                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │   │
│  │  │projects │ │ clients │ │  amcs   │ │ invoices │ │ payslips │         │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │   │
│  │                                                                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                     │   │
│  │  │ tasks   │ │tickets  │ │employees│ │attendance│                     │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                     │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Key Methods |
|-----------|----------------|-------------|
| **ProjectHub** | Main projects page with table/calendar views | `render()`, `handleFilterChange()` |
| **ProjectDetailModal** | Project details + Kanban board | `loadProject()`, `updateTaskStatus()` |
| **CreateProjectModal** | New project form | `validate()`, `createProject()` |
| **IncidentDispatchModal** | Ticket creation & assignment | `assignToStaff()`, `createTicket()` |
| **projectService** | Business logic for projects | `createProject()`, `assignMember()`, `updateProgress()` |
| **projectRepository** | Data access for projects | `findById()`, `findWithFilters()`, `update()` |
| **amcService** | AMC lifecycle management | `checkExpiry()`, `renewContract()` |
| **payrollService** | Payroll calculations | `generatePayslips()`, `calculatePIT()` |
| **notificationService** | Notification management | `sendNotification()`, `markAsRead()` |

---

## 5. Activity Diagrams

### 5.1 Client Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CLIENT ONBOARDING ACTIVITY                             │
└─────────────────────────────────────────────────────────────────────────────┘

    START
      │
      ▼
┌─────────────────────┐
│ Admin clicks       │
│ "Add New Client"   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Fill client form:   │
│ - Name              │
│ - Contact Person    │
│ - Email             │
│ - Phone             │
│ - WhatsApp          │
│ - Address           │
└─────────┬───────────┘
          │
          ▼
      ┌─────────┐
      │ Validate│
      │  input  │
      └────┬────┘
           │
      ┌────┴────┐
      │         │
   Valid?     Invalid?
      │         │
      ▼         ▼
┌─────────┐ ┌─────────────┐
│ Upload │ │ Show errors │
│ logo   │ └─────────────┘
└────┬────┘       │
     │            │
     │            └──────────┐
     │                      │
     ▼                      │
┌─────────┐                │
│ Create  │                │
│ client  │                │
└────┬────┘                │
     │                     │
     ▼                     │
┌─────────┐                │
│ Success │                │
│ message │                │
└────┬────┘                │
     │                     │
     ▼                     │
┌─────────────────────┐   │
│ Create AMC?         │   │
└─────────┬───────────┘   │
          │               │
     ┌────┴────┐          │
     │         │          │
    YES       NO          │
     │         │          │
     ▼         ▼          │
┌─────────┐ ┌─────────┐   │
│ Create  │ │ Return  │   │
│ initial │ │ to list │   │
│   AMC   │ └─────────┘   │
└────┬────┘                │
     │                     │
     ▼                     │
┌─────────────────────┐   │
│ Add to WhatsApp     │   │
│ group?              │   │
└─────────┬───────────┘   │
          │               │
     ┌────┴────┐          │
     │         │          │
    YES       NO          │
     │         │          │
     ▼         ▼          │
┌─────────┐ ┌─────────┐   │
│ Generate│ │ Return  │   │
│invite   │ │ to list │   │
│link     │ └─────────┘   │
└────┬────┘                │
     │                     │
     ▼                     │
┌─────────────────────┐   │
│ Send welcome        │◄──┘
│ notification        │
└────┬────────────────┘
     │
     ▼
┌─────────┐
│  END    │
└─────────┘
```

### 5.2 Payroll Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PAYROLL PROCESSING ACTIVITY                             │
└─────────────────────────────────────────────────────────────────────────────┘

    START
      │
      ▼
┌─────────────────────┐
│ HR/Admin triggers   │
│ monthly payroll      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Check: Month closed?│
└─────────┬───────────┘
          │
     ┌────┴────┐
     │         │
    YES       NO
     │         │
     ▼         ▼
┌─────────┐ ┌─────────────┐
│Fetch all│ │ Show error: │
│active   │ │ "Month not  │
│employees│ │  closed"    │
└────┬────┘ └─────────────┘
     │
     ▼
┌─────────────────────┐
│ For each employee:  │
│ - Fetch attendance  │
│ - Calculate days    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Calculate:          │
│ - Basic salary      │
│ - Allowances        │
│ - Overtime          │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Calculate           │
│ deductions:         │
│ - PF (5% each)     │
│ - GIS (flat)       │
│ - PIT (progressive)│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Generate payslip    │
│ records (DRAFT)     │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Review payroll      │
│ summary             │
└─────────┬───────────┘
          │
     ┌────┴────┐
     │         │
  Approve?   Need edits?
     │         │
     ▼         ▼
┌─────────┐ ┌─────────────┐
│ Update  │ │ Return to   │
│status=  │ │ draft, make │
│approved │ │ changes     │
└────┬────┘ └─────────────┘
     │
     ▼
┌─────────────────────┐
│ Generate PDF        │
│ payslips            │
└─────────┬───────────┘
          │
     ┌────┴────┐
     │         │
  Success?   Failed?
     │         │
     ▼         ▼
┌─────────┐ ┌─────────────┐
│Send to  │ │ Log error,  │
│payment  │ │ retry later │
│processing│ └─────────────┘
└────┬────┘
     │
     ▼
┌─────────────────────┐
│ Update status=PAID  │
│ Record payment_date │
└─────────┬───────────┘
     │
     ▼
┌─────────────────────┐
│ Send notifications  │
│ to employees        │
└─────────┬───────────┘
     │
     ▼
┌─────────┐
│  END    │
└─────────┘
```

### 5.3 Ticket Resolution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      TICKET RESOLUTION ACTIVITY                             │
└─────────────────────────────────────────────────────────────────────────────┘

    START
      │
      ▼
┌─────────────────────┐
│ Client creates     │
│ support ticket      │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Categorize & set    │
│ priority            │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Auto-assign or      │
│ Manual assign       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Notify assigned     │
│ staff               │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Staff investigates  │
│ issue               │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Need more info?     │
└─────────┬───────────┘
          │
     ┌────┴────┐
     │         │
    YES       NO
     │         │
     ▼         ▼
┌─────────┐ ┌─────────────┐
│ Request │ │ Provide     │
│info from│ │ resolution  │
│ client  │ └─────────────┘
└────┬────┘       │
     │            │
     │            ▼
     │     ┌─────────────┐
     │     │ Update      │
     │     │ status=     │
     │     │ RESOLVED    │
     │     └─────────────┘
     │            │
     └────────────┘
          │
          ▼
┌─────────────────────┐
│ Client confirms?    │
└─────────┬───────────┘
          │
     ┌────┴────┐
     │         │
  Satisfied  Not satisfied
     │         │
     ▼         ▼
┌─────────┐ ┌─────────────┐
│ Close   │ │ Reopen      │
│ ticket  │ │ ticket,     │
│         │ │ escalate    │
└────┬────┘ └─────────────┘
     │
     ▼
┌─────────────────────┐
│ Log to audit trail  │
└─────────┬───────────┘
     │
     ▼
┌─────────┐
│  END    │
└─────────┘
```

---

## 6. Deployment Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION DEPLOYMENT ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │                              CLIENTS                                 │
    │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
    │  │   Web      │  │   Mobile   │  │    Admin   │  │   WhatsApp │    │
    │  │  Browser   │  │    App     │  │   Panel    │  │   Client   │    │
    │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │
    └────────┼───────────────┼───────────────┼───────────────┼───────────┘
             │              │               │               │
             └──────────────┼───────────────┼───────────────┘
                            │               │
                            ▼               ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                          CDN LAYER                                   │
    │  ┌───────────────────────────────────────────────────────────────┐  │
    │  │                      Vercel Edge Network                       │  │
    │  │  - Static assets (images, CSS, JS)                            │  │
    │  │  - API route caching                                           │  │
    │  │  - Geographic distribution                                     │  │
    │  └───────────────────────────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                      APPLICATION LAYER                               │
    │  ┌───────────────────────────────────────────────────────────────┐  │
    │  │                    Next.js 16 App Router                        │  │
    │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐               │  │
    │  │  │Server      │  │ API Routes │  │  Edge      │               │  │
    │  │  │Components  │  │            │  │Functions   │               │  │
    │  │  └────────────┘  └────────────┘  └────────────┘               │  │
    │  │                                                                 │  │
    │  │  - Server-side rendering                                        │  │
    │  │  - Route handlers (/api/*)                                      │  │
    │  │  - Middleware (auth, RBAC)                                      │  │
    │  └───────────────────────────────────────────────────────────────┘  │
    └─────────────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Supabase   │  │  Cloudinary  │  │    Google    │
    │    Cloud     │  │     CDN      │  │   Services   │
    │              │  │              │  │              │
    │ ┌────────────┐│  │ ┌────────────┐│  │ ┌────────────┐│
    │ │ PostgreSQL ││  │ │   Media    ││  │ │    Gemini  ││
    │ │            ││  │ │  Storage   ││  │ │     AI     ││
    │ │ - Database ││  │ │ - Images   ││  │ │            ││
    │ │ - RLS      ││  │ │ - Videos   ││  │ │ - OCR      ││
    │ │ - Auth     ││  │ │ - Docs     ││  │ │ - Chat     ││
    │ └────────────┘│  │ └────────────┘│  │ └────────────┘│
    │ ┌────────────┐│  └──────────────┘  └──────────────┘
    │ │  Auth      ││
    │ │            ││
    │ │ - JWT      ││
    │ │ - Sessions ││
    │ │ - RBAC     ││
    │ └────────────┘│
    │ ┌────────────┐│
    │ │  Storage   ││
    │ │            ││
    │ │ - Files    ││
    │ │ - Buckets  ││
    │ └────────────┘│
    │ ┌────────────┐│
    │ │ Realtime   ││
    │ │            ││
    │ │ - WebSockets│
    │ │ - Presence ││
    │ └────────────┘│
    └──────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                      EXTERNAL INTEGRATIONS                            │
    │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
    │  │  WhatsApp  │  │    Bank    │  │   Payment  │  │   Email    │    │
    │  │  Business  │  │   API      │  │  Gateway   │  │  Service   │    │
    │  │    API     │  │            │  │            │  │            │    │
    │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
    └─────────────────────────────────────────────────────────────────────┘
```

### Environment Variables by Service

| Service | Required Variables |
|---------|-------------------|
| **Vercel/Next.js** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Supabase Database** | `DATABASE_URL` |
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Google AI** | `GEMINI_API_KEY` |
| **WhatsApp** | `WHATSAPP_API_KEY`, `WHATSAPP_PHONE_NUMBER_ID` |

---

## 7. Cross-Module Decision Trees

### 7.1 Authorization Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHORIZATION FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    REQUEST
      │
      ▼
┌─────────────────────┐
│ Is user logged in?  │
└─────────┬───────────┘
          │
     ┌────┴────┐
     │         │
    NO        YES
     │         │
     ▼         ▼
┌─────────┐ ┌─────────────────────┐
│Return   │ │ Get user's role     │
│401      │ │ from profiles       │
└─────────┘ └─────────┬───────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ What's the role?     │
          └─────────┬───────────┘
                    │
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
  ┌─────────┐   ┌─────────┐   ┌─────────┐
  │ ADMIN   │   │  STAFF  │   │ CLIENT  │
  └────┬────┘   └────┬────┘   └────┬────┘
       │             │              │
       ▼             ▼              ▼
  ┌─────────┐   ┌─────────┐   ┌─────────┐
  │ Full    │   │ Limited │   │ Minimal │
  │ access  │   │ access  │   │ access  │
  └────┬────┘   └────┬────┘   └────┬────┘
       │             │              │
       └─────────────┼──────────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │ Is resource         │
          │ owned by user?      │
          └─────────┬───────────┘
                    │
              ┌─────┴─────┐
              │           │
             YES          NO
              │           │
              ▼           ▼
          ┌─────────┐ ┌─────────────┐
          │ Grant   │ │ Check RBAC  │
          │ access  │ │ policy      │
          └─────────┘ └─────┬───────┘
                           │
                      ┌────┴────┐
                      │         │
                   Allowed    Denied
                      │         │
                      ▼         ▼
                  ┌─────────┐ ┌─────────┐
                  │ 200 OK  │ │ 403     │
                  └─────────┘ └─────────┘
```

### 7.2 Error Handling Decision Tree

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ERROR HANDLING                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ERROR OCCURS
      │
      ▼
┌─────────────────────┐
│ What type of error? │
└─────────┬───────────┘
          │
  ┌───────┼────────┬──────────┬──────────┐
  ▼       ▼        ▼          ▼          ▼
┌──────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Auth  │ │Valid │ │Database│ │Network │ │Unknown│
│Error │ │ation│ │ Error  │ │ Error  │ │ Error  │
└───┬──┘ └───┬──┘ └───┬────┘ └───┬────┘ └───┬────┘
    │        │         │          │          │
    ▼        ▼         ▼          ▼          ▼
┌────────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Return  │ │Return│ │Log to  │ │Retry   │ │Log to  │
│401/403 │ │400 + │ │audit   │ │with    │ │sentry  │
│+       │ │error │ │trail   │ │backoff │ │+ return│
│redirect│ │msg   │ │+ Return│ │+ Log   │ │500     │
│to login│ │      │ │500     │ │        │ │        │
└────────┘ └──────┘ └────────┘ └────────┘ └────────┘
```

---

## 8. API Request/Response Patterns

### 8.1 Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### 8.2 Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 8.3 Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Summary

This UML documentation provides:

1. **ERD**: 21 tables with relationships clearly mapped
2. **State Machines**: 5 detailed workflows with yes/no decision points
3. **Sequence Diagrams**: 3 critical request flows
4. **Component Diagram**: Layered architecture visualization
5. **Activity Diagrams**: 3 business process flows
6. **Deployment Diagram**: Production infrastructure layout
7. **Decision Trees**: Authorization and error handling logic

All decision points include explicit yes/no branches for implementation clarity.
