/**
 * Import Clients from Excel Script
 *
 * This script reads the "Client Details 06-04-2026.xlsx" file
 * and imports the client data into the database.
 *
 * Usage: npx tsx scripts/import-clients-from-excel.ts
 */

import 'dotenv/config';
import { createRequire } from 'module';
import { db } from "../db";
import { clients } from "../db/schema";

// Use CommonJS require for xlsx since it doesn't support ESM properly
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// Excel Column Mapping
// Business Name → name
// Owner's Name → contactPerson
// Owner's Contact No → phone
// Business Email → email
// Whatsapp Status → whatsapp
// Nature Of Business → industry
// License Key → rancelabCode
// URL → rancelabUrl
// Starting Date (DD-MM-YY) → createdAt
// Ending Date (DD-MM-YY) → supportExpiryDate

function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;

  // Handle Excel serial date numbers
  if (typeof dateValue === 'number') {
    // Excel dates are stored as days since 1/1/1900
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = dateValue - 1; // Excel starts at 1, not 0
    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    return date;
  }

  // Handle string dates like "29.12.2022" or "29-12-2022"
  if (typeof dateValue === 'string') {
    // Clean up the string and parse
    const cleanDate = dateValue.trim()
      .replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/, '$2/$1/$3') // Convert DD.MM.YYYY to MM/DD/YYYY
      .replace(/(\d{1,2})-(\d{1,2})-(\d{4})/, '$2/$1/$3') // Convert DD-MM-YYYY to MM/DD/YYYY
      .replace(/(\d{1,2})\s*-\s*(\d{1,2})\s*-\s*(\d{4})/, '$2/$1/$3'); // Handle spaces

    const parsed = new Date(cleanDate);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

function cleanPhoneNumber(phone: any): string | null {
  if (!phone) return null;

  // Convert to string and clean up
  const cleaned = String(phone)
    .replace(/[^0-9+]/g, '') // Remove all non-numeric characters except +
    .trim();

  // Remove leading +975 if exists (Bhutan country code)
  if (cleaned.startsWith('+975')) {
    return cleaned.substring(4);
  }

  // Remove leading 975 if exists
  if (cleaned.startsWith('975') && cleaned.length > 10) {
    return cleaned.substring(3);
  }

  return cleaned || null;
}

function cleanEmail(email: any): string | null {
  if (!email) return null;

  const cleaned = String(email).trim();

  // Remove "Email:" prefix if exists
  if (cleaned.toLowerCase().startsWith('email:')) {
    return cleaned.substring(6).trim();
  }

  // Remove trailing commas
  return cleaned.replace(/,$/, '').trim() || null;
}

async function importClients() {
  console.log('📊 Starting Excel Import...');

  try {
    // Read Excel file
    const workbook = XLSX.readFile('./Client Details 06-04-2026.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📋 Found ${rawData.length} rows in Excel file`);

    // Transform data to match client schema
    const clientsToInsert = [];
    const skippedClients = [];

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as any;

      // Skip rows without business name (required field)
      if (!row['Business Name '] && !row['Business Name']) {
        skippedClients.push({ row: i + 1, reason: 'No business name' });
        continue;
      }

      const businessName = (row['Business Name '] || row['Business Name'] || '').trim();
      const contactPerson = row["Owner's Name "] || null;
      const phone = cleanPhoneNumber(row["Owner's Contact No "]);
      const email = cleanEmail(row['Business Email ']);
      const whatsapp = cleanPhoneNumber(row['Whatsapp Stauts '] || row['Whatsapp Status '] || row['Whatsapp']);
      const industry = row['Nature Of Business '] || null;
      const rancelabCode = row['License Key '] || null;
      const rancelabUrl = row['URL '] || null;
      const softwareEdition = row['Software Edition '] || '';

      // Parse dates
      const createdAt = parseDate(row['Starting Date (DD-MM-YY) '] || row['Date Of License Key Issued ']);
      const supportExpiryDate = parseDate(row['Ending Date (DD-MM-YY) ']);

      // Determine tier from software edition
      let tier = 'bronze';
      if (softwareEdition.toLowerCase().includes('gold')) {
        tier = 'gold';
      } else if (softwareEdition.toLowerCase().includes('silver')) {
        tier = 'silver';
      }

      const clientData = {
        name: businessName,
        active: true,
        contactPerson: contactPerson || null,
        email: email,
        phone: phone,
        whatsapp: whatsapp || phone, // Fallback to phone if whatsapp not available
        rancelabCode: rancelabCode,
        rancelabUrl: rancelabUrl,
        industry: industry,
        tier: tier,
        country: 'Bhutan',
        timezone: 'Asia/Thimphu',
        preferredContactMethod: 'whatsapp',
        supportExpiryDate: supportExpiryDate,
        createdAt: createdAt || undefined,
        updatedAt: new Date(),
      };

      clientsToInsert.push(clientData);
    }

    console.log(`✅ Prepared ${clientsToInsert.length} clients for insertion`);
    console.log(`⚠️  Skipped ${skippedClients.length} rows due to missing data`);

    // Show sample of data to be inserted
    console.log('\n📝 Sample data to be inserted:');
    console.log(JSON.stringify(clientsToInsert.slice(0, 3), null, 2));

    // Insert in batches
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < clientsToInsert.length; i += batchSize) {
      const batch = clientsToInsert.slice(i, i + batchSize);
      console.log(`📦 Inserting batch ${Math.floor(i / batchSize) + 1} (${batch.length} clients)...`);

      try {
        await db.insert(clients).values(batch);
        insertedCount += batch.length;
        console.log(`✅ Inserted ${insertedCount}/${clientsToInsert.length} clients`);
      } catch (error: any) {
        // Check for duplicate key errors
        if (error.constraint === 'clients_rancelab_code_unique') {
          console.log(`⚠️  Skipping duplicate rancelab code in batch ${Math.floor(i / batchSize) + 1}`);
          // Try inserting one by one to find the duplicate
          for (const client of batch) {
            try {
              await db.insert(clients).values(client);
              insertedCount++;
            } catch (singleError: any) {
              if (singleError.constraint === 'clients_rancelab_code_unique') {
                console.log(`⚠️  Skipped duplicate: ${client.name} (${client.rancelabCode})`);
              } else {
                console.error(`❌ Error inserting ${client.name}:`, singleError.message);
              }
            }
          }
        } else {
          console.error(`❌ Error inserting batch:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`📊 Summary:`);
    console.log(`  - Total rows in Excel: ${rawData.length}`);
    console.log(`  - Prepared for insertion: ${clientsToInsert.length}`);
    console.log(`  - Successfully inserted: ${insertedCount}`);
    console.log(`  - Skipped: ${skippedClients.length} (missing data)`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importClients()
  .then(() => {
    console.log('✅ Import script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import script failed:', error);
    process.exit(1);
  });
