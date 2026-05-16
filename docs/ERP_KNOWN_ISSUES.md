# ERP Known Issues Catalog

**Date**: 2026-04-21
**Status**: Post-fix documentation
**Context**: Catalog of all issues found during ERP fixes, including remaining items

---

## Overview

This document catalogs all issues discovered during the ERP fix sprint (April 19-21, 2026), organized by module and severity. Issues marked as [FIXED] have been addressed. Remaining issues are tagged with remaining work.

---

## Database Schema Issues

### [FIXED] Clients Table Missing Columns
- **Severity**: High
- **Status**: Fixed in Task 1
- **Missing**: email, phone, address, city, country
- **Migration**: `drizzle/0010_clients_schema_fix.sql`
- **Action**: Run migration

### [FIXED] Profiles Table Missing Columns
- **Severity**: High
- **Status**: Fixed in Task 2
- **Missing**: full_name, role, created_at
- **Migration**: `drizzle/0011_profiles_schema_fix.sql`
- **Action**: Run migration

### [PENDING] RLS Policies Not Applied
- **Severity**: Critical
- **Status**: Policies created in Task 3, NOT YET APPLIED
- **Impact**: All tables lack proper Row-Level Security
- **Migration**: `drizzle/0012_add_rls_policies.sql`
- **Action**: Run migration immediately
- **Verification**: Run `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`

---

## API Authentication Issues

### [FIXED] ES Module Import Error in api-auth.ts
- **Severity**: High
- **File**: `lib/auth/api-auth.ts`
- **Issue**: Used CommonJS `require()` in ES module context
- **Status**: Fixed in Task 6
- **Change**: Replaced `const { getStatusCode, isApiError } = require('@/lib/errors')` with `import { isApiError } from '@/lib/errors'`

### [FIXED] Inconsistent Error Formatting
- **Severity**: Medium
- **Files**: All API routes in AMC, Invoices, Payroll modules
- **Issue**: Mixed use of deprecated `formatAuthError` and `formatApiError`
- **Status**: Fixed in Tasks 10, 11, 12
- **Change**: Standardized to `formatApiError` across all routes

### [FIXED] Auth Context Variable Naming
- **Severity**: Low
- **Files**: Multiple API routes
- **Issue**: Inconsistent use of `const { profile }` vs `authContext`
- **Status**: Fixed in Tasks 6, 10, 11, 12
- **Change**: Standardized to `authContext` naming

### [FIXED] Role Case Sensitivity
- **Severity**: Medium
- **File**: `lib/auth/api-auth.ts`
- **Issue**: Role comparisons failed if database had 'admin' but code expected 'ADMIN'
- **Status**: Fixed in Task 6
- **Change**: Added normalization: `(profile.role || 'CLIENT').toString().toUpperCase().trim()`

---

## Critical Bug Fixes

### [FIXED] Undefined Variable in Payroll API
- **Severity**: Critical
- **File**: `app/api/payroll/[id]/route.ts`
- **Issue**: Used undefined `validationResult` instead of `validatedData` (lines 79-80, 93)
- **Status**: Fixed in Task 12
- **Impact**: Would cause runtime errors on PUT/PATCH operations

### [FIXED] Undefined Variable in Invoice Status API
- **Severity**: Critical
- **File**: `app/api/invoices/[id]/status/route.ts`
- **Issue**: Used undefined `validationResult` instead of `validatedData`
- **Status**: Fixed in Task 11
- **Impact**: Would cause runtime errors on status updates

---

## UI/UX Issues

### [FIXED] No Loading States in Projects Module
- **Severity**: Medium
- **Status**: Fixed in Task 9
- **Added**: TableSkeleton, StatsSkeleton, loading spinners

### [FIXED] No Error States in Projects Module
- **Severity**: Medium
- **Status**: Fixed in Task 9
- **Added**: Error boundaries, retry buttons, error messages

### [FIXED] No Loading States in AMC Module
- **Severity**: Medium
- **Status**: Fixed in Task 10
- **Added**: LoadingState type, spinners, disabled states

### [FIXED] No Error States in AMC Module
- **Severity**: Medium
- **Status**: Fixed in Task 10
- **Added**: Error tracking, retry buttons, network error detection

### [FIXED] No Loading States in Invoices Module
- **Severity**: Medium
- **Status**: Fixed in Task 11
- **Added**: LoadingState type, spinners, disabled states

### [FIXED] No Error States in Invoices Module
- **Severity**: Medium
- **Status**: Fixed in Task 11
- **Added**: Error tracking, retry buttons, visual error state

### [FIXED] No Loading States in HR/Payroll Module
- **Severity**: Medium
- **Status**: Fixed in Task 12
- **Added**: LoadingState type, skeleton loaders

### [FIXED] No Error States in HR/Payroll Module
- **Severity**: Medium
- **Status**: Fixed in Task 12
- **Added**: Error tracking, retry buttons, visual error state

### [FIXED] Missing Client Creation Modal
- **Severity**: High
- **Status**: Fixed in Task 8
- **Added**: Complete `create-client-modal.tsx` component

### [FIXED] Profile Hook No Retry Logic
- **Severity**: Medium
- **File**: `hooks/use-user-profile.ts`
- **Issue**: Failed profile fetches immediately gave up
- **Status**: Fixed in Task 7
- **Added**: Exponential backoff retry (3 attempts)

---

## Remaining Issues (Post-Fix)

### [PENDING] Database Migrations Not Applied
- **Severity**: Critical
- **Migrations Pending**:
  - `drizzle/0010_clients_schema_fix.sql`
  - `drizzle/0011_profiles_schema_fix.sql`
  - `drizzle/0012_add_rls_policies.sql`
- **Action Required**: Run via Supabase SQL Editor or drizzle-kit

### [PENDING] Missing API Rate Limiting
- **Severity**: Medium
- **Impact**: Vulnerable to abuse on public endpoints
- **Files**: All API routes
- **Recommendation**: Implement rate limiting middleware

### [PENDING] Background Job System
- **Severity**: Medium
- **Missing Features**:
  - AMC expiry alerts (30-day warnings)
  - Invoice overdue status updates
  - Payroll generation reminders
- **Recommendation**: Implement job queue (pg_cron or external service)

### [PENDING] Transaction Atomicity
- **Severity**: High
- **Files**: Project creation, AMC renewal, invoice generation
- **Issue**: Multi-write operations not wrapped in transactions
- **Recommendation**: Wrap multi-step operations in DB transactions

### [PENDING] Invoice Number Generation
- **Severity**: Medium
- **File**: Invoice service
- **Issue**: Potential race condition in invoice number generation
- **Recommendation**: Use database sequence or lock

### [PENDING] Projects Progress Calculation
- **Severity**: Low
- **Issue**: May be inefficient with many tasks
- **Recommendation**: Consider materialized view or cached aggregation

### [PENDING] Test Coverage
- **Severity**: Medium
- **Current**: Minimal/absent tests
- **Recommendation**: Add unit tests for services and API routes
- **Priority**: Start with critical business logic (payroll, invoicing)

### [PENDING] Audit Logging
- **Severity**: Medium
- **Issue**: Not all mutations write to audit_logs
- **Files**: All services
- **Recommendation**: Ensure all create/update/delete operations log to audit_logs

---

## Performance Concerns

### [PENDING] Missing Database Indexes
- **Severity**: Low
- **Impact**: Query performance may degrade with data growth
- **Recommendation**: Review and add indexes for frequent query patterns
- **Priority**: Medium (can defer until performance issues observed)

### [PENDING] Projects Progress Inefficiency
- **Severity**: Low
- **Issue**: Progress calculation fetches all tasks
- **Recommendation**: Use DB aggregation instead

---

## Security Concerns

### [PENDING] RLS Policies Not Applied
- **Severity**: Critical
- **Status**: Policies created, not applied
- **Action**: Run `drizzle/0012_add_rls_policies.sql` immediately

### [PENDING] Rate Limiting Missing
- **Severity**: Medium
- **Impact**: API abuse vulnerability
- **Recommendation**: Implement rate limiting middleware

---

## Module-Specific Notes

### Projects Module
- Status: Fully functional after Task 9
- Remaining: Transaction atomicity, progress calculation optimization

### AMC Module
- Status: Fully functional after Task 10
- Remaining: Background expiry alerts, transaction atomicity for renewals

### Invoices Module
- Status: Fully functional after Task 11
- Remaining: Invoice number generation race condition, overdue status automation

### Payroll/HR Module
- Status: Fully functional after Task 12
- Remaining: None critical

---

## Issue Resolution Priority

### Immediate (Before Production)
1. Run database migrations (0010, 0011, 0012)
2. Verify RLS policies are active
3. Test with different user roles

### High Priority
1. Add transaction wrappers for multi-write operations
2. Fix invoice number generation race condition
3. Implement rate limiting

### Medium Priority
1. Add background job system
2. Improve audit logging coverage
3. Add unit tests for business logic

### Low Priority
1. Optimize projects progress calculation
2. Add missing database indexes

---

## Issue Tracking Convention

- `[FIXED]` - Issue resolved during April 2026 fix sprint
- `[PENDING]` - Issue identified but not yet resolved
- `[MONITOR]` - Issue to monitor for future recurrence

---

**Last Updated**: 2026-04-21
**Next Review**: After database migrations are applied
