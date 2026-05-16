-- ============================================
-- 🛡️ INNOVATE BHUTAN ERP: RLS POLICIES MIGRATION
-- Migration: 0012_add_rls_policies.sql
-- Created: 2026-04-21
-- Updated: 2026-04-21 (Only for existing tables)
-- ============================================
-- This migration enables Row-Level Security (RLS) on tables that EXIST
-- and creates comprehensive access policies.
--
-- AUTH MODEL:
-- - profiles.user_id stores the Supabase Auth UUID as TEXT type
-- - profiles.role stores RBAC role: ADMIN, STAFF, CLIENT
-- - Policies use (select auth.uid()::text) to cast uuid to text for comparison
-- - Note: user_id is text, auth.uid() returns uuid, so ::text cast is required
--
-- NOTE: Project-related tables (project_tasks, project_members, etc.) are NOT
-- included here because they don't exist in the database yet. Run their
-- migrations first, then add RLS policies for them.
-- ============================================

-- =====================================================
-- PART 1: ENABLE RLS ON CORE TABLES
-- =====================================================

-- Core identity tables
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- Business tables
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS services ENABLE ROW LEVEL SECURITY;

-- Projects tables (only enable if they exist)
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
-- Note: project_tasks, project_members, etc. skipped - don't exist yet

-- AMC module
ALTER TABLE IF EXISTS amcs ENABLE ROW LEVEL SECURITY;

-- Finance module
ALTER TABLE IF EXISTS invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses ENABLE ROW LEVEL SECURITY;

-- HR & Payroll module
ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payslips ENABLE ROW LEVEL SECURITY;

-- Support module
ALTER TABLE IF EXISTS tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ticket_messages ENABLE ROW LEVEL SECURITY;

-- Notifications
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Audit logs (read-only after creation)
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;

-- Orders (if exists)
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: PROFILES TABLE POLICIES
-- =====================================================

-- Drop existing policies if they exist (for clean migration)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()::text));

-- Policy: Users can insert their own profile (for onboarding)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()::text));

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()::text))
  WITH CHECK (user_id = (select auth.uid()::text));

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: Admins and Staff can insert profiles
CREATE POLICY "Admins and Staff can insert profiles" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins can update any profile
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- =====================================================
-- PART 3: CLIENTS TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Internal staff view clients" ON clients;
DROP POLICY IF EXISTS "Admins and Staff can view clients" ON clients;
DROP POLICY IF EXISTS "Admins and Staff can insert clients" ON clients;
DROP POLICY IF EXISTS "Admins and Staff can update clients" ON clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

-- Policy: Admins and Staff can view all clients
CREATE POLICY "Admins and Staff can view clients" ON clients
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can insert clients
CREATE POLICY "Admins and Staff can insert clients" ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can update clients
CREATE POLICY "Admins and Staff can update clients" ON clients
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins can delete clients
CREATE POLICY "Admins can delete clients" ON clients
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- =====================================================
-- PART 4: PROJECTS TABLE POLICIES (simplified)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and Staff can view projects" ON projects;
DROP POLICY IF EXISTS "Admins and Staff can insert projects" ON projects;
DROP POLICY IF EXISTS "Project leads can update their projects" ON projects;
DROP POLICY IF EXISTS "Admins can update any project" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

-- Policy: Admins and Staff can view all projects
CREATE POLICY "Admins and Staff can view projects" ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can insert projects
CREATE POLICY "Admins and Staff can insert projects" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Project leads can update their projects
CREATE POLICY "Project leads can update their projects" ON projects
  FOR UPDATE
  TO authenticated
  USING (
    lead_id = (select auth.uid()::text)
  );

-- Policy: Admins can update any project
CREATE POLICY "Admins can update any project" ON projects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: Admins can delete projects
CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- =====================================================
-- PART 5: AMC TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins and Staff can view AMCs" ON amcs;
DROP POLICY IF EXISTS "Admins and Staff can insert AMCs" ON amcs;
DROP POLICY IF EXISTS "Admins and Staff can update AMCs" ON amcs;
DROP POLICY IF EXISTS "Admins can delete AMCs" ON amcs;

-- Policy: Admins and Staff can view all AMCs
CREATE POLICY "Admins and Staff can view AMCs" ON amcs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can insert AMCs
CREATE POLICY "Admins and Staff can insert AMCs" ON amcs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can update AMCs
CREATE POLICY "Admins and Staff can update AMCs" ON amcs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins can delete AMCs
CREATE POLICY "Admins can delete AMCs" ON amcs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- =====================================================
-- PART 6: INVOICES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins and Staff can view invoices" ON invoices;
DROP POLICY IF EXISTS "Admins and Staff can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Admins and Staff can update invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can delete invoices" ON invoices;

-- Policy: Admins and Staff can view all invoices
CREATE POLICY "Admins and Staff can view invoices" ON invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can insert invoices
CREATE POLICY "Admins and Staff can insert invoices" ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can update invoices
CREATE POLICY "Admins and Staff can update invoices" ON invoices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins can delete invoices
CREATE POLICY "Admins can delete invoices" ON invoices
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- =====================================================
-- PART 7: TRANSACTIONS TABLE POLICIES (STRICT)
-- =====================================================

DROP POLICY IF EXISTS "Admins only can view transactions" ON transactions;
DROP POLICY IF EXISTS "Admins only can insert transactions" ON transactions;
DROP POLICY IF EXISTS "Admins only can update transactions" ON transactions;

-- Policy: Only Admins can view transactions
CREATE POLICY "Admins only can view transactions" ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: Only Admins can insert transactions
CREATE POLICY "Admins only can insert transactions" ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: Only Admins can update transactions
CREATE POLICY "Admins only can update transactions" ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- =====================================================
-- PART 8: EXPENSES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins and Staff can view expenses" ON expenses;
DROP POLICY IF EXISTS "Employees can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Admins and Staff can insert expenses" ON expenses;
DROP POLICY IF EXISTS "Admins and Staff can update expenses" ON expenses;

-- Policy: Admins and Staff can view all expenses
CREATE POLICY "Admins and Staff can view expenses" ON expenses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Employees can view their own expenses
CREATE POLICY "Employees can view own expenses" ON expenses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON p.id = e.profile_id
      WHERE e.id = expenses.employee_id AND p.user_id = (select auth.uid()::text)
    )
  );

-- Policy: Admins and Staff can insert expenses
CREATE POLICY "Admins and Staff can insert expenses" ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can update expenses
CREATE POLICY "Admins and Staff can update expenses" ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- =====================================================
-- PART 9: EMPLOYEES TABLE POLICIES (HR RESTRICTED)
-- =====================================================

DROP POLICY IF EXISTS "Admins and Staff can view employees" ON employees;
DROP POLICY IF EXISTS "Employees can view own record" ON employees;
DROP POLICY IF EXISTS "Admins only can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins only can update employees" ON employees;

-- Policy: Admins and Staff can view all employees
CREATE POLICY "Admins and Staff can view employees" ON employees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Employees can view their own record
CREATE POLICY "Employees can view own record" ON employees
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = employees.profile_id AND user_id = (select auth.uid()::text)
    )
  );

-- Policy: Only Admins can insert employees
CREATE POLICY "Admins only can insert employees" ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: Only Admins can update employees
CREATE POLICY "Admins only can update employees" ON employees
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- =====================================================
-- PART 10: ATTENDANCE TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins and Staff can view attendance" ON attendance;
DROP POLICY IF EXISTS "Employees can view own attendance" ON attendance;
DROP POLICY IF EXISTS "Admins and Staff can insert attendance" ON attendance;
DROP POLICY IF EXISTS "Admins and Staff can update attendance" ON attendance;

-- Policy: Admins and Staff can view all attendance
CREATE POLICY "Admins and Staff can view attendance" ON attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Employees can view their own attendance
CREATE POLICY "Employees can view own attendance" ON attendance
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON p.id = e.profile_id
      WHERE e.id = attendance.employee_id AND p.user_id = (select auth.uid()::text)
    )
  );

-- Policy: Admins and Staff can insert attendance
CREATE POLICY "Admins and Staff can insert attendance" ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can update attendance
CREATE POLICY "Admins and Staff can update attendance" ON attendance
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- =====================================================
-- PART 11: PAYSLIPS TABLE POLICIES (HIGHLY RESTRICTED)
-- =====================================================

DROP POLICY IF EXISTS "Admins can view all payslips" ON payslips;
DROP POLICY IF EXISTS "Employees can view own payslips" ON payslips;
DROP POLICY IF EXISTS "Admins only can insert payslips" ON payslips;
DROP POLICY IF EXISTS "Admins only can update payslips" ON payslips;
DROP POLICY IF EXISTS "Admins only can delete payslips" ON payslips;

-- Policy: Only Admins can view all payslips
CREATE POLICY "Admins can view all payslips" ON payslips
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: Employees can view their own payslips
CREATE POLICY "Employees can view own payslips" ON payslips
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN profiles p ON p.id = e.profile_id
      WHERE e.id = payslips.employee_id AND p.user_id = (select auth.uid()::text)
    )
  );

-- Policy: Only Admins can insert payslips
CREATE POLICY "Admins only can insert payslips" ON payslips
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: Only Admins can update payslips
CREATE POLICY "Admins only can update payslips" ON payslips
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: Only Admins can delete payslips
CREATE POLICY "Admins only can delete payslips" ON payslips
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- =====================================================
-- PART 12: TICKETS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Clients view own tickets" ON tickets;
DROP POLICY IF EXISTS "Staff manage tickets" ON tickets;
DROP POLICY IF EXISTS "Admins and Staff can view tickets" ON tickets;
DROP POLICY IF EXISTS "Admins and Staff can insert tickets" ON tickets;
DROP POLICY IF EXISTS "Admins and Staff can update tickets" ON tickets;
DROP POLICY IF EXISTS "Assigned staff can update tickets" ON tickets;

-- Policy: Admins and Staff can view all tickets
CREATE POLICY "Admins and Staff can view tickets" ON tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can insert tickets
CREATE POLICY "Admins and Staff can insert tickets" ON tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Admins and Staff can update tickets
CREATE POLICY "Admins and Staff can update tickets" ON tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Assigned staff can update their assigned tickets
CREATE POLICY "Assigned staff can update tickets" ON tickets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = tickets.assigned_to AND user_id = (select auth.uid()::text)
    )
  );

-- =====================================================
-- PART 13: TICKET MESSAGES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins and Staff can view ticket messages" ON ticket_messages;
DROP POLICY IF EXISTS "Users can view own ticket messages" ON ticket_messages;
DROP POLICY IF EXISTS "Users can insert ticket messages" ON ticket_messages;

-- Policy: Admins and Staff can view all ticket messages
CREATE POLICY "Admins and Staff can view ticket messages" ON ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role IN ('ADMIN', 'STAFF')
    )
  );

-- Policy: Users can view messages on tickets they created
CREATE POLICY "Users can view own ticket messages" ON ticket_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN profiles p ON p.id = t.client_id
      WHERE t.id = ticket_messages.ticket_id AND p.user_id = (select auth.uid()::text)
    )
  );

-- Policy: Authenticated users can insert messages on accessible tickets
CREATE POLICY "Users can insert ticket messages" ON ticket_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id IN (
      SELECT id FROM profiles WHERE user_id = (select auth.uid()::text)
    )
  );

-- =====================================================
-- PART 14: NOTIFICATIONS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = notifications.user_id AND user_id = (select auth.uid()::text)
    )
  );

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = notifications.user_id AND user_id = (select auth.uid()::text)
    )
  );

-- Policy: System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications" ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- PART 15: AUDIT LOGS POLICIES (IMMUTABLE)
-- =====================================================

DROP POLICY IF EXISTS "Admins only can view audit logs" ON audit_logs;

-- Policy: Only Admins can view audit logs
CREATE POLICY "Admins only can view audit logs" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = (select auth.uid()::text) AND role = 'ADMIN'
    )
  );

-- Policy: No one can delete audit logs (by omitting DELETE policy)
-- Policy: No one can update audit logs (by omitting UPDATE policy)

-- =====================================================
-- POLICY VERIFICATION QUERIES
-- =====================================================

-- Run these queries after migration to verify policies are active:

-- Check RLS is enabled on tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check policies on a specific table:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'profiles';

-- Check all policies:
-- SELECT tablename, policyname FROM pg_policies ORDER BY tablename, policyname;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables with RLS enabled: profiles, clients, services, projects,
--   amcs, invoices, transactions, expenses, employees, attendance,
--   payslips, tickets, ticket_messages, notifications, audit_logs,
--   orders, order_items
--
-- NOTE: Project sub-tables (project_tasks, project_members, etc.)
-- are not included because they don't exist yet. Create those tables
-- first, then run a separate migration to add their RLS policies.
-- =====================================================
