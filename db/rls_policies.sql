-- 🛡️ INNOVATE BHUTAN ERP: ROW-LEVEL SECURITY (RLS) POLICIES
-- Execute these in the Supabase SQL Editor to enforce strict data isolation.

-- 1. Enable RLS on all ERP Tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE amcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 2. PROFILE POLICIES
-- Users can read their own profiles
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

-- Admins can manage all profiles
CREATE POLICY "Admins manage all profiles" ON profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- 3. CLIENT & NODE POLICIES
-- Staff and Admins can view all clients
CREATE POLICY "Internal staff view clients" ON clients
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
  )
);

-- 4. FINANCIAL POLICIES (Strict Admin Only)
CREATE POLICY "Admin only financial access" ON transactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- 5. SUPPORT TICKET POLICIES
-- Clients can see their own tickets
CREATE POLICY "Clients view own tickets" ON support_tickets
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM clients
    WHERE id = support_tickets.client_id AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Staff can manage assigned tickets
CREATE POLICY "Staff manage tickets" ON support_tickets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('ADMIN', 'STAFF')
  )
);

-- 6. HR & ATTENDANCE POLICIES
-- Employees view own attendance
CREATE POLICY "Employees view own attendance" ON attendance
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE id = attendance.employee_id AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);
