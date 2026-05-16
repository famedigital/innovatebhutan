const postgres = require('postgres');
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');

  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  });

  try {
    const result = await sql`SELECT NOW()`;
    console.log('✓ Database connected:', result[0].now);

    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log('\n✓ Tables in database:', tables.length);
    console.log('Tables:', tables.map(t => t.tablename).join(', '));

    const schemaTables = [
      'services', 'clients', 'orders', 'order_items', 'profiles', 'amcs',
      'tickets', 'ticket_messages', 'employees', 'attendance', 'payslips',
      'transactions', 'expenses', 'invoices', 'projects', 'project_tasks',
      'project_members', 'project_milestones', 'task_comments', 'task_checklist_items',
      'activity_events', 'audit_logs', 'notifications', 'locations',
      'business_categories', 'businesses', 'business_reviews', 'business_hours',
      'settings', 'business_amenities'
    ];

    const missingTables = schemaTables.filter(t => !tables.some(tbl => tbl.tablename === t));
    if (missingTables.length > 0) {
      console.log('\n⚠ Missing tables:', missingTables.join(', '));
    } else {
      console.log('\n✓ All schema tables exist!');
    }

  } catch (error) {
    console.error('✗ Database error:', error.message);
    console.error('Details:', error);
  } finally {
    await sql.end();
  }
}

testConnection();
