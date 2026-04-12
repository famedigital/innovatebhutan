-- 🔓 FIX: Add missing SELECT policies so the Admin dashboard can read orders

-- Allow reading orders (admin command center needs this)
CREATE POLICY "Allow anon read orders"
  ON "orders" FOR SELECT USING (true);

-- Allow reading order items
CREATE POLICY "Allow anon read order_items"
  ON "order_items" FOR SELECT USING (true);

-- Allow updating order status (for admin deploy/revert actions)
CREATE POLICY "Allow anon update order status"
  ON "orders" FOR UPDATE USING (true) WITH CHECK (true);
