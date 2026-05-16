# Migration Runbook - Innovate Bhutan ERP Production Deployment

**Version:** 1.0
**Last Updated:** 2026-04-20
**Target Environment:** Production (Supabase Cloud + Vercel)

---

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Database Migration Procedure](#database-migration-procedure)
3. [Application Deployment Procedure](#application-deployment-procedure)
4. [Post-Migration Verification](#post-migration-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Emergency Contacts](#emergency-contacts)

---

## Pre-Migration Checklist

### 1. Backup Verification

- [ ] **Database Backup Confirmed**
  - Latest automatic backup from Supabase dashboard verified
  - Manual backup created within last 24 hours
  - Backup size and record count validated

- [ ] **Code Backup Confirmed**
  - Main branch pushed to remote
  - Deployment tag created (e.g., `v1.0.0-pre-migration`)

### 2. Environment Variables

- [ ] **Production Environment Variables**
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

  # WhatsApp (if configured)
  WHATSAPP_API_KEY=...
  WHATSAPP_PHONE_NUMBER_ID=...
  ```

- [ ] **Vercel Environment Variables**
  - All secrets configured in production environment
  - No placeholder values present

### 3. Stakeholder Notification

- [ ] **Internal Team Notified**
  - Engineering team aware of deployment window
  - Product team available for smoke testing

- [ ] **External Stakeholders**
  - Clients notified of planned maintenance window (recommended: 2-4 hours)
  - Support team briefed on potential issues

---

## Database Migration Procedure

### Migration Order (Critical - Execute in Sequence)

#### Phase 1: Core Tables (Already Applied)
These migrations should already be applied in staging:

1. `0004_create_projects_tables.sql` - Projects, tasks, members, milestones
2. `0005_amc_schema_enhancement.sql` - AMC renewals and tracking
3. `0006_invoice_schema_enhancement.sql` - Invoice numbering and line items
4. `0007_payroll_schema_enhancement.sql` - Payroll compliance fields
5. `0008_projects_missing_indexes.sql` - Performance indexes
6. `0009_projects_constraints.sql` - Data integrity constraints
7. `0010_projects_soft_delete.sql` - Soft delete support
8. `0011_fix_user_id_columns.sql` - User ID consistency
9. `0012_project_enhancements.sql` - Latest project features

#### Phase 2: Production Migration Execution

**Step 1: Enable Maintenance Mode**
```sql
-- Set application to read-only mode via settings table
INSERT INTO settings (key, value) 
VALUES ('maintenance_mode', 'true') 
ON CONFLICT (key) DO UPDATE SET value = 'true';
```

**Step 2: Verify Current Schema State**
```sql
-- Check applied migrations
SELECT * FROM drizzle_schema_version ORDER BY version;

-- Verify table counts
SELECT 
    'projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'amcs', COUNT(*) FROM amcs
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'payslips', COUNT(*) FROM payslips
UNION ALL
SELECT 'employees', COUNT(*) FROM employees;
```

**Step 3: Apply Migrations in Order**

```bash
# Via Drizzle CLI (recommended)
pnpm drizzle-kit migrate --verbose

# Or manually via Supabase SQL Editor for each file
# Order: 0004 -> 0005 -> 0006 -> 0007 -> 0008 -> 0009 -> 0010 -> 0011 -> 0012
```

**Step 4: Verify Migration Success**

```sql
-- Check for any failed constraints
SELECT * FROM information_schema.table_constraints 
WHERE table_name IN ('projects', 'amcs', 'invoices', 'payslips', 'employees');

-- Verify indexes created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('projects', 'project_tasks', 'amcs', 'invoices', 'payslips')
ORDER BY tablename, indexname;

-- Check RLS policies (if applicable)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

**Step 5: Data Validation**

```sql
-- Verify no orphaned records
SELECT COUNT(*) as orphaned_projects 
FROM projects p 
LEFT JOIN clients c ON p.client_id = c.id 
WHERE c.id IS NULL;

SELECT COUNT(*) as orphaned_invoices 
FROM invoices i 
LEFT JOIN clients c ON i.client_id = c.id 
WHERE c.id IS NULL;

-- Verify payslip uniqueness (should be 0)
SELECT employee_id, month, year, COUNT(*) as count 
FROM payslips 
WHERE status != 'cancelled'
GROUP BY employee_id, month, year 
HAVING COUNT(*) > 1;
```

**Step 6: Disable Maintenance Mode**
```sql
UPDATE settings SET value = 'false' WHERE key = 'maintenance_mode';
```

---

## Application Deployment Procedure

### Step 1: Pre-Deployment Build Verification

```bash
# Locally test production build
pnpm build

# Run type checking
pnpm tsc --noEmit

# Verify no lint errors
pnpm lint
```

### Step 2: Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Or via Vercel Dashboard:
# 1. Go to Project Settings
# 2. Select "Git" integration
# 3. Deploy main branch to production
```

### Step 3: Environment Configuration

- Verify Vercel environment variables are populated
- Check Supabase connection strings
- Verify Cloudinary API keys
- Confirm any third-party integrations

---

## Post-Migration Verification

### Database Checks

```sql
-- 1. Row counts compared to pre-migration backup
-- (Document expected counts below)

Expected Record Counts:
- projects: _____
- project_tasks: _____
- amcs: _____
- invoices: _____
- payslips: _____
- employees: _____

-- 2. Verify new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'invoices' 
AND column_name IN ('invoice_number', 'issue_date', 'items', 'updated_at');

-- 3. Verify constraints active
SELECT conname, contype 
FROM pg_constraint 
WHERE conname LIKE '%invoice_number_unique%';

-- 4. Test query performance
EXPLAIN ANALYZE 
SELECT * FROM projects 
WHERE client_id = 1 AND status = 'active' 
LIMIT 20;
```

### Application Checks

- [ ] Admin dashboard loads without errors
- [ ] Authentication works (login/logout)
- [ ] Navigation menu displays correctly
- [ ] Projects module loads and displays data
- [ ] AMC module loads and displays contracts
- [ ] Invoice module loads with proper numbering
- [ ] Payroll module accessible (if UI deployed)

---

## Rollback Procedures

### When to Rollback

- Critical data corruption detected
- Application completely non-functional
- Security vulnerability exposed
- Performance degradation >50%

### Database Rollback

**Option 1: Point-in-Time Recovery (Supabase)**

```bash
# Via Supabase Dashboard:
# 1. Go to Database -> Backups
# 2. Select pre-migration backup
# 3. Click "Restore" - This creates a new database
# 4. Update DATABASE_URL to point to restored database
```

**Option 2: Manual Schema Reversion**

```sql
-- WARNING: Only use if backup restore is not available
-- This reverses the most recent migrations

-- Drop new indexes
DROP INDEX IF EXISTS idx_invoices_number;
DROP INDEX IF EXISTS idx_payslips_employee_month_year;

-- Revert column additions (example)
-- ALTER TABLE invoices DROP COLUMN IF EXISTS invoice_number;
-- (Note: Be cautious with DROP operations - may cause data loss)

-- Verify rollback
SELECT * FROM information_schema.columns 
WHERE table_name = 'invoices' AND column_name = 'invoice_number';
-- Should return 0 rows
```

### Application Rollback

```bash
# Via Vercel CLI
vercel rollback [deployment-url]

# Or via Vercel Dashboard:
# 1. Go to Deployments
# 2. Find last stable deployment
# 3. Click "Promote to Production"
```

### Rollback Validation

- [ ] Database accessible
- [ ] Application loads
- [ ] Core features functional
- [ ] No error logs in Supabase/Vercel

---

## Migration Timeline Estimate

| Phase | Duration | Buffer |
|-------|----------|--------|
| Pre-migration checks | 30 minutes | 15 minutes |
| Database migration | 45 minutes | 30 minutes |
| Data validation | 30 minutes | 30 minutes |
| Application deployment | 15 minutes | 15 minutes |
| Smoke testing | 30 minutes | 30 minutes |
| **Total** | **2.5 hours** | **2 hours** |
| **Total with Buffer** | **4.5 hours** | |

---

## Known Issues & Workarounds

### Issue 1: AMC Status Update Limit
**Problem:** Status updates limited to 1000 records
**Workaround:** Run multiple updates or remove LIMIT clause

### Issue 2: Invoice Number Generation
**Problem:** Uses Math.random() - potential for duplicates
**Workaround:** Monitor for duplicate errors post-deployment
**Fix:** Implement sequence-based generation in next release

### Issue 3: Payroll Repository Field References
**Problem:** Repository may reference non-existent JSON fields
**Workaround:** Verify all queries reference actual schema columns

---

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Tech Lead | | |
| DevOps Lead | | |
| Product Owner | | |
| Database Admin | | |
| Support Lead | | |

---

## Runbook Sign-Off

- [ ] Pre-migration checklist completed
- [ ] Backup verified
- [ ] Stakeholders notified
- [ ] Migration procedure reviewed
- [ ] Rollback procedure tested in staging

**Migration Lead:** ________________ **Date:** ________

**Approval:** ________________ **Date:** ________

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-20 | 1.0 | Initial migration runbook for ERP production deployment |
