# Smoke Checklist - Innovate Bhutan ERP Production Deployment

**Version:** 1.0
**Last Updated:** 2026-04-20

---

## Pre-Deployment Smoke Check

### Infrastructure Readiness

- [ ] **Supabase Database**
  - [ ] Database instance is running
  - [ ] Connection string is valid
  - [ ] RLS policies are configured (if applicable)
  - [ ] Backup automation is enabled

- [ ] **Vercel Deployment**
  - [ ] Production environment is configured
  - [ ] All environment variables are set
  - [ ] Domain/DNS is configured correctly
  - [ ] Build succeeds without errors

- [ ] **Third-Party Services**
  - [ ] Cloudinary API is accessible
  - [ ] Gemini API key is valid
  - [ ] WhatsApp integration (if used) is configured

### Code Quality Checks

- [ ] **TypeScript Compilation**
  ```bash
  pnpm tsc --noEmit
  # Expected: No errors
  ```

- [ ] **Build Verification**
  ```bash
  pnpm build
  # Expected: Build completes successfully
  ```

- [ ] **Lint Check**
  ```bash
  pnpm lint
  # Expected: No critical errors
  ```

---

## Post-Deployment Smoke Check (Critical Paths)

### Authentication & Authorization

- [ ] **Login Flow**
  - [ ] Can access login page at `/auth/login`
  - [ ] Email/password authentication works
  - [ ] Google OAuth (if enabled) works
  - [ ] Invalid credentials show appropriate error
  - [ ] Session persists after page refresh

- [ ] **Authorization**
  - [ ] Admin users can access `/admin` routes
  - [ ] Staff users can access allowed modules
  - [ ] Client users are redirected appropriately
  - [ ] Unauthorized access returns 403

### Navigation & Layout

- [ ] **Admin Layout**
  - [ ] Sidebar loads and is responsive
  - [ ] Mobile hamburger menu works
  - [ ] Navigation links are clickable
  - [ ] User profile menu displays correctly

- [ ] **Route Availability**
  - [ ] `/admin` - Dashboard loads
  - [ ] `/admin/projects` - Projects hub loads
  - [ ] `/admin/amc` - AMC page loads
  - [ ] `/admin/invoice` - Invoice page loads
  - [ ] `/admin/finance` - Finance hub loads
  - [ ] `/admin/hr` - HR page loads
  - [ ] `/admin/tickets` - Tickets page loads
  - [ ] `/admin/clients` - Clients page loads
  - [ ] `/admin/services` - Services page loads

### Projects Module

- [ ] **Projects Hub (`/admin/projects`)**
  - [ ] Page loads without errors
  - [ ] Project list displays
  - [ ] Filtering works (by client, status, date range)
  - [ ] Search functionality works
  - [ ] Calendar view toggles correctly

- [ ] **Project Creation**
  - [ ] Create modal opens
  - [ ] Form validation works
  - [ ] Can select client and service
  - [ ] Project saves successfully
  - [ ] New project appears in list

- [ ] **Project Detail**
  - [ ] Clicking project opens detail modal
  - [ ] Kanban board displays tasks
  - [ ] Can drag tasks between columns
  - [ ] Progress bar displays correctly

- [ ] **Task Management**
  - [ ] Can create new task
  - [ ] Can edit existing task
  - [ ] Task status changes work
  - [ ] Task comments can be added
  - [ ] Checklist items can be toggled

### AMC Module

- [ ] **AMC Hub (`/admin/amc`)**
  - [ ] Page loads without errors
  - [ ] AMC list displays
  - [ ] Status indicators are visible (active/expiring/expired)
  - [ ] Filtering works by client and status

- [ ] **AMC Creation**
  - [ ] Create modal opens
  - [ ] Form accepts client, service, dates
  - [ ] Amount and notes fields work
  - [ ] AMC saves successfully

- [ ] **AMC Status**
  - [ ] Status displays correctly
  - [ ] End date is shown
  - [ ] Renewal information displays (if renewed)

### Invoices Module

- [ ] **Invoice Hub (`/admin/invoice`)**
  - [ ] Page loads without errors
  - [ ] Invoice list displays
  - [ ] Invoice numbers are unique and formatted
  - [ ] Status indicators work (draft/sent/paid/overdue/cancelled)

- [ ] **Invoice Creation**
  - [ ] Create modal opens
  - [ ] Client selection works
  - [ ] Line items can be added/removed
  - [ ] Total calculates correctly
  - [ ] Invoice saves with generated number

- [ ] **Invoice Actions**
  - [ ] Can mark invoice as sent
  - [ ] Can mark invoice as paid
  - [ ] Can cancel draft invoices
  - [ ] Can view invoice details

### Payroll Module

- [ ] **Payroll API** (if UI is deployed)
  - [ ] `/api/payroll/generate` - Generate payslip works
  - [ ] `/api/payroll` - List payslips works
  - [ ] Can approve payslip
  - [ ] Can mark payslip as paid

- [ ] **Payroll Calculations**
  - [ ] PF deduction (5%) calculates correctly
  - [ ] GIS deduction (Nu. 500) applies
  - [ ] PIT calculates using progressive slabs
  - [ ] Net salary is accurate

### Finance Module

- [ ] **Finance Hub (`/admin/finance`)**
  - [ ] Page loads without errors
  - [ ] Transaction ledger displays
  - [ ] Income/Expense totals show
  - [ ] Can filter by date range

### Clients & Services

- [ ] **Clients Module**
  - [ ] Client list loads
  - [ ] Search functionality works
  - [ ] Client details display correctly
  - [ ] WhatsApp group links work (if configured)

- [ ] **Services Module**
  - [ ] Service catalog loads
  - [ ] Services display with prices
  - [ ] Can add/edit services (admin only)

### Data Integrity

- [ ] **No Console Errors**
  - [ ] Browser console is clean on page load
  - [ ] No JavaScript errors on interactions
  - [ ] No network 500 errors

- [ ] **API Responses**
  - [ ] All API calls return valid JSON
  - [ ] Error responses include proper error messages
  - [ ] Rate limiting works (if implemented)

---

## Performance Smoke Check

- [ ] **Page Load Times**
  - [ ] Dashboard loads in <3 seconds
  - [ ] Projects hub loads in <2 seconds
  - [ ] Invoice list loads in <2 seconds

- [ ] **Query Performance**
  - [ ] Project list query completes in <500ms
  - [ ] AMC list query completes in <500ms
  - [ ] Invoice list query completes in <500ms

---

## Security Smoke Check

- [ ] **Authentication**
  - [ ] Protected routes redirect to login
  - [ ] Session expires appropriately
  - [ ] Logout clears session correctly

- [ ] **Authorization** (if implemented)
  - [ ] Non-admin users cannot access admin routes
  - [ ] API endpoints reject unauthenticated requests
  - [ ] Role-based permissions are enforced

- [ ] **Input Validation**
  - [ ] Form inputs reject invalid data
  - [ ] SQL injection protection is active (Drizzle ORM)
  - [ ] XSS protection is working

---

## Integration Smoke Check

- [ ] **Cloudinary**
  - [ ] Image uploads work
  - [ ] Client logos display
  - [ ] Service images display

- [ ] **WhatsApp** (if configured)
  - [ ] Webhook endpoint receives messages
  - [ ] Outbound messages send successfully

- [ ] **Gemini AI** (if used)
  - [ ] AI features work without errors
  - [ ] OCR functionality processes images

---

## Mobile Responsiveness

- [ ] **Mobile Views**
  - [ ] Sidebar collapses to hamburger menu
  - [ ] Tables are scrollable or responsive
  - [ ] Forms are usable on mobile
  - [ ] Touch targets are appropriate size

---

## Smoke Check Summary

| Category | Checks | Passed | Failed | Blocked |
|----------|--------|--------|--------|---------|
| Pre-Deployment | 8 | ___ | ___ | ___ |
| Authentication | 8 | ___ | ___ | ___ |
| Navigation | 9 | ___ | ___ | ___ |
| Projects | 15 | ___ | ___ | ___ |
| AMC | 9 | ___ | ___ | ___ |
| Invoices | 12 | ___ | ___ | ___ |
| Payroll | 8 | ___ | ___ | ___ |
| Finance | 4 | ___ | ___ | ___ |
| Data Integrity | 3 | ___ | ___ | ___ |
| Performance | 6 | ___ | ___ | ___ |
| Security | 6 | ___ | ___ | ___ |
| Integration | 7 | ___ | ___ | ___ |
| Mobile | 4 | ___ | ___ | ___ |
| **TOTAL** | **99** | **___** | **___** | **___** |

### Pass Criteria

- **Critical:** 100% of critical checks must pass
- **Overall:** >95% of all checks must pass
- **Blockers:** Zero blocked items

---

## Failed Item Log

| Check | Severity | Error Message | Assigned To | Status |
|-------|----------|---------------|-------------|--------|
| | | | | |

---

## Sign-Off

**Smoke Test Lead:** ________________ **Date:** ________ **Time:** ________

**QA Approval:** ________________ **Date:** ________ **Time:** ________

**Production Release Approved:** [ ] YES [ ] NO

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-20 | 1.0 | Initial smoke checklist for ERP production deployment |
