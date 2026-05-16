/**
 * 🔐 Add Missing RLS Policies (Fixed)
 * Creates Row-Level Security policies using correct Supabase RLS syntax
 *
 * Usage: node scripts/add-rls-policies.js
 */

import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

// RLS Policies to create with correct Supabase syntax
const POLICIES = [
  // Profiles table
  {
    table: 'profiles',
    policies: [
      {
        name: 'Allow users to view their own profile',
        using: '(user_id)::text = auth.uid()::text',
        check: '(user_id)::text = auth.uid()::text'
      },
      {
        name: 'Allow admins to view all profiles',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`
      },
      {
        name: 'Allow staff to view all profiles',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      },
      {
        name: 'Allow authenticated insert for new user profiles',
        using: 'true',
        check: '(user_id)::text = auth.uid()::text'
      }
    ]
  },
  // Clients table
  {
    table: 'clients',
    policies: [
      {
        name: 'Allow authenticated users to view clients',
        using: 'true',
        check: 'true'
      },
      {
        name: 'Allow admins to insert clients',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`
      },
      {
        name: 'Allow admins to update clients',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`
      }
    ]
  },
  // Projects table
  {
    table: 'projects',
    policies: [
      {
        name: 'Allow authenticated users to view projects',
        using: 'true',
        check: 'true'
      },
      {
        name: 'Allow staff to insert projects',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      },
      {
        name: 'Allow staff to update projects',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      }
    ]
  },
  // AMCs table
  {
    table: 'amcs',
    policies: [
      {
        name: 'Allow authenticated users to view AMCs',
        using: 'true',
        check: 'true'
      },
      {
        name: 'Allow staff to manage AMCs',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      }
    ]
  },
  // Invoices table
  {
    table: 'invoices',
    policies: [
      {
        name: 'Allow authenticated users to view invoices',
        using: 'true',
        check: 'true'
      },
      {
        name: 'Allow staff to manage invoices',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      }
    ]
  },
  // Employees table
  {
    table: 'employees',
    policies: [
      {
        name: 'Allow staff to view employees',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      },
      {
        name: 'Allow admins to manage employees',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`
      }
    ]
  },
  // Payslips table
  {
    table: 'payslips',
    policies: [
      {
        name: 'Allow employees to view their own payslips',
        using: `employee_id IN (
          SELECT id FROM employees WHERE (user_id)::text = auth.uid()::text
        )`,
        check: `employee_id IN (
          SELECT id FROM employees WHERE (user_id)::text = auth.uid()::text
        )`
      },
      {
        name: 'Allow staff to view all payslips',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      },
      {
        name: 'Allow admins to manage payslips',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`
      }
    ]
  },
  // Tickets table
  {
    table: 'tickets',
    policies: [
      {
        name: 'Allow authenticated users to view tickets',
        using: 'true',
        check: 'true'
      },
      {
        name: 'Allow staff to manage tickets',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      }
    ]
  },
  // Transactions table
  {
    table: 'transactions',
    policies: [
      {
        name: 'Allow staff to view transactions',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      },
      {
        name: 'Allow admins to manage transactions',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`
      }
    ]
  },
  // Attendance table
  {
    table: 'attendance',
    policies: [
      {
        name: 'Allow employees to view their own attendance',
        using: `employee_id IN (
          SELECT id FROM employees WHERE (user_id)::text = auth.uid()::text
        )`,
        check: `employee_id IN (
          SELECT id FROM employees WHERE (user_id)::text = auth.uid()::text
        )`
      },
      {
        name: 'Allow staff to view all attendance',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role IN ('ADMIN', 'STAFF')
        )`
      },
      {
        name: 'Allow admins to manage attendance',
        using: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`,
        check: `EXISTS (
          SELECT 1 FROM profiles
          WHERE (profiles.user_id)::text = auth.uid()::text
          AND profiles.role = 'ADMIN'
        )`
      }
    ]
  }
];

async function addRLSPolicies() {
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('========================================');
    console.log('   ADDING MISSING RLS POLICIES');
    console.log('========================================\n');

    for (const tablePolicy of POLICIES) {
      const { table, policies } = tablePolicy;

      // Check if table exists
      const tables = await sql`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public' AND tablename = ${table}
      `;

      if (tables.length === 0) {
        console.log(`⏭️  Skipping ${table} (table doesn't exist)\n`);
        continue;
      }

      // Enable RLS if not already enabled
      try {
        await sql.unsafe(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
        console.log(`✅ Enabled RLS on ${table}`);
      } catch {
        // Already enabled, continue
      }

      // Check existing policies
      const existingPolicies = await sql`
        SELECT policyname
        FROM pg_policies
        WHERE tablename = ${table}
      `;

      const existingPolicyNames = new Set(existingPolicies.map(p => p.policyname));

      console.log(`\n📄 Table: ${table}`);
      console.log(`   Existing policies: ${existingPolicyNames.size}`);

      // Create missing policies
      let createdCount = 0;
      for (const policy of policies) {
        if (existingPolicyNames.has(policy.name)) {
          console.log(`   ⏭️  "${policy.name}" - already exists`);
          continue;
        }

        try {
          const usingClause = policy.using ? `USING (${policy.using})` : '';
          const checkClause = policy.check ? `WITH CHECK (${policy.check})` : '';

          const sqlStatement = `
            CREATE POLICY "${policy.name}"
            ON ${table}
            FOR ALL
            ${usingClause}
            ${checkClause}
          `.replace(/\s+/g, ' ').trim();

          await sql.unsafe(sqlStatement);
          console.log(`   ✅ Created: "${policy.name}"`);
          createdCount++;
        } catch (e) {
          console.log(`   ❌ Failed: "${policy.name}" - ${e.message}`);
        }
      }

      console.log(`   Total created: ${createdCount} policies\n`);
    }

    console.log('='.repeat(50));
    console.log('   ✅ RLS POLICIES ADDED');
    console.log('='.repeat(50));

  } finally {
    await sql.end();
  }
}

addRLSPolicies().catch(console.error);
