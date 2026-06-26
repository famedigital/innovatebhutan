/**
 * Import Clients from Excel Script - Improved Version
 *
 * This script reads the "Client Details 06-04-2026.xlsx" file
 * and imports the client data into the database with better error handling.
 *
 * Usage: npx tsx scripts/import-clients-fixed.ts
 */

import 'dotenv/config';
import { createRequire } from 'module';
import { db } from "../db";
import { clients } from "../db/schema";
import { eq, or } from "drizzle-orm";

// Use CommonJS require for xlsx since it doesn't support ESM properly
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// Statistics
let totalRows = 0;
let processedRows = 0;
let successCount = 0;
let skipCount = 0;
let errorCount = 0;

function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;

  // Handle Excel serial date numbers
  if (typeof dateValue === 'number') {
    // Excel dates are stored as days since 1/1/1900 (actually 1900 but Excel treats 1900 as a leap year)
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = dateValue - 2; // Excel 1900 date system starts at 2
    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Handle string dates
  if (typeof dateValue === 'string') {
    const cleaned = dateValue.trim()
      // Clean up various date formats
      .replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/, '$2/$1/$3') // DD.MM.YYYY -> MM/DD/YYYY
      .replace(/(\d{1,2})-(\d{1,2})-(\d{4})/, '$2/$1/$3') // DD-MM-YYYY -> MM/DD/YYYY
      .replace(/(\d{1,2})\s*-\s*(\d{1,2})\s*-\s*(\d{4})/, '$2/$1/$3') // Handle spaces
      .replace(/(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{4})/, '$2/$1/$3') // DD, MM, YYYY
      .replace(/(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{4})/, '$2/$1/$3') // DD/MM/YYYY with spaces
      .replace(/[,-]\s*$/, '') // Remove trailing commas/dashes
      .trim();

    try {
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (e) {
      // Date parsing failed, return null
    }
  }

  return null;
}

function cleanPhoneNumber(phone: any): string | null {
  if (!phone) return null;
  if (typeof phone !== 'string' && typeof phone !== 'number') return null;

  // Convert to string and clean up
  let cleaned = String(phone)
    .replace(/[^0-9+]/g, '') // Remove all non-numeric characters except +
    .trim();

  if (!cleaned || cleaned.length < 6) return null; // Invalid phone number

  // Remove leading +975 if exists (Bhutan country code)
  if (cleaned.startsWith('+975')) {
    cleaned = cleaned.substring(4);
  }

  // Remove leading 975 if exists and number is long enough
  if (cleaned.startsWith('975') && cleaned.length > 10) {
    cleaned = cleaned.substring(3);
  }

  // If the number is too long, it might be concatenated numbers
  // Try to split it into valid Bhutan numbers (usually 8 digits after country code)
  if (cleaned.length > 12) {
    // Try to find a valid 8-digit number within the string
    const matches = cleaned.match(/\d{8}/g);
    if (matches && matches.length > 0) {
      cleaned = matches[0]; // Use the first valid 8-digit number
    } else {
      // If no 8-digit match, try to extract the last 8 digits
      if (cleaned.length >= 8) {
        cleaned = cleaned.substring(cleaned.length - 8);
      } else {
        return null; // Invalid phone number
      }
    }
  }

  return cleaned || null;
}

function cleanEmail(email: any): string | null {
  if (!email) return null;

  let cleaned = String(email).trim();

  // Remove "Email:" prefix if exists
  if (cleaned.toLowerCase().startsWith('email:')) {
    cleaned = cleaned.substring(6).trim();
  }

  // Remove trailing commas and spaces
  cleaned = cleaned.replace(/,\s*$/, '').trim();

  // Basic email validation
  if (cleaned && cleaned.includes('@') && cleaned.includes('.')) {
    return cleaned;
  }

  return null;
}

async function checkIfClientExists(rancelabCode: string | null, name: string): Promise<boolean> {
  if (!ralcodelabCode) return false;

  try {
    const existing = await db.select({ id: clients.id })
      .from(clients)
      .where(eq(clients.rancelabCode, rancelabCode))
      .limit(1);

    return existing.length > 0;
  } catch (error) {
    return false;
  }
}

async function insertClient(clientData: any): Promise<boolean> {
  try {
    await db.insert(clients).values(clientData);
    return true;
  } catch (error: any) {
    // Check for unique constraint violations
    if (error.constraint === 'clients_rancelab_code_unique') {
      console.log(`  ⚠️  Skipped duplicate rancelab code: ${clientData.rancelabCode}`);
      return false;
    }
    console.log(`  ❌ Error inserting ${clientData.name}: ${error.message}`);
    return false;
  }
}

async function importClients() {
  console.log('📊 Starting Excel Import (Improved Version)...');
  console.log('');

  try {
    // Read Excel file
    const workbook = XLSX.readFile('./Client Details 06-04-2026.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    totalRows = rawData.length;
    console.log(`📋 Found ${totalRows} rows in Excel file`);
    console.log('');

    // Process each row
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as any;
      processedRows++;

      const rowNum = i + 2; // Excel rows are 1-indexed + header row

      // Extract business name (try both possible column names)
      const businessName = (row['Business Name '] || row['Business Name'] || '').trim();

      // Skip rows without business name (required field)
      if (!businessName) {
        console.log(`${rowNum}. ⚠️  Skipped - No business name`);
        skipCount++;
        continue;
      }

      // Extract all other fields
      const contactPerson = row["Owner's Name "] || null;
      const phone = cleanPhoneNumber(row["Owner's Contact No "]);
      const email = cleanEmail(row['Business Email ']);
      const whatsappRaw = row['Whatsapp Stauts '] || row['Whatsapp Status '] || row['Whatsapp'];
      const whatsapp = cleanPhoneNumber(whatsappRaw);
      const industry = row['Nature Of Business '] || null;
      const rancelabCode = (row['License Key '] || '').trim() || null;
      const rancelabUrl = row['URL '] || null;
      const softwareEdition = row['Software Edition '] || '';

      // Parse dates
      const startDateRaw = row['Starting Date (DD-MM-YY) '] || row['Date Of License Key Issued '];
      const endDateRaw = row['Ending Date (DD-MM-YY) '];

      const createdAt = parseDate(startDateRaw);
      const supportExpiryDate = parseDate(endDateRaw);

      // Determine tier from software edition
      let tier = 'bronze';
      const editionLower = softwareEdition.toLowerCase();
      if (editionLower.includes('gold') || editionLower.includes('premium')) {
        tier = 'gold';
      } else if (editionLower.includes('silver') || editionLower.includes('standard')) {
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

      // Check if client already exists (by rancelab code)
      if (ralcodelabCode && await checkIfClientExists(rancelabCode, businessName)) {
        console.log(`${rowNum}. ⚠️  ${businessName} - Skipped (duplicate rancelab code)`);
        skipCount++;
        continue;
      }

      // Insert client
      const success = await insertClient(clientData);
      if (success) {
        console.log(`${rowNum}. ✅ ${businessName} - Imported successfully`);
        successCount++;
      } else {
        errorCount++;
      }

      // Add a small delay to avoid overwhelming the database
      if (processedRows % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('');
    console.log('🎉 Import completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`  - Total rows in Excel: ${totalRows}`);
    console.log(`  - Processed: ${processedRows}`);
    console.log(`  - Successfully imported: ${successCount}`);
    console.log(`  - Skipped: ${skipCount}`);
    console.log(`  - Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importClients()
  .then(() => {
    console.log('');
    console.log('✅ Import script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import script failed:', error);
    process.exit(1);
  });
