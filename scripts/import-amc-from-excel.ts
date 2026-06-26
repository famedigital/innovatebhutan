/**
 * Import AMC Contracts from Excel Script
 *
 * This script reads the "Client Details 06-04-2026.xlsx" file
 * and imports AMC contracts for all the clients.
 *
 * Usage: npx tsx scripts/import-amc-from-excel.ts
 */

import 'dotenv/config';
import { createRequire } from 'module';
import { db } from "../db";
import { clients, amcs } from "../db/schema";
import { eq } from "drizzle-orm";

// Use CommonJS require for xlsx since it doesn't support ESM properly
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

// Statistics
let totalRows = 0;
let processedRows = 0;
let clientCreated = 0;
let amcCreated = 0;
let skipCount = 0;
let errorCount = 0;

function parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;

  // Handle Excel serial date numbers
  if (typeof dateValue === 'number') {
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = dateValue - 2;
    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Handle string dates
  if (typeof dateValue === 'string') {
    const cleaned = dateValue.trim()
      .replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/, '$2/$1/$3')
      .replace(/(\d{1,2})-(\d{1,2})-(\d{4})/, '$2/$1/$3')
      .replace(/(\d{1,2})\s*-\s*(\d{1,2})\s*-\s*(\d{4})/, '$2/$1/$3')
      .replace(/(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{4})/, '$2/$1/$3')
      .replace(/[,-]\s*$/, '')
      .trim();

    try {
      const parsed = new Date(cleaned);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (e) {
      // Date parsing failed
    }
  }

  return null;
}

function cleanPhoneNumber(phone: any): string | null {
  if (!phone) return null;
  if (typeof phone !== 'string' && typeof phone !== 'number') return null;

  let cleaned = String(phone)
    .replace(/[^0-9+]/g, '')
    .trim();

  if (!cleaned || cleaned.length < 6) return null;

  if (cleaned.startsWith('+975')) {
    cleaned = cleaned.substring(4);
  }

  if (cleaned.startsWith('975') && cleaned.length > 10) {
    cleaned = cleaned.substring(3);
  }

  // Handle concatenated numbers
  if (cleaned.length > 12) {
    const matches = cleaned.match(/\d{8}/g);
    if (matches && matches.length > 0) {
      cleaned = matches[0];
    } else if (cleaned.length >= 8) {
      cleaned = cleaned.substring(cleaned.length - 8);
    } else {
      return null;
    }
  }

  return cleaned || null;
}

function cleanEmail(email: any): string | null {
  if (!email) return null;

  let cleaned = String(email).trim();

  if (cleaned.toLowerCase().startsWith('email:')) {
    cleaned = cleaned.substring(6).trim();
  }

  cleaned = cleaned.replace(/,\s*$/, '').trim();

  if (cleaned && cleaned.includes('@') && cleaned.includes('.')) {
    return cleaned;
  }

  return null;
}

async function findOrCreateClient(clientData: any): Promise<number | null> {
  try {
    // First try to find by rancelab code
    if (clientData.rancelabCode) {
      const existing = await db.select({ id: clients.id })
        .from(clients)
        .where(eq(clients.rancelabCode, clientData.rancelabCode))
        .limit(1);

      if (existing.length > 0) {
        return existing[0].id;
      }
    }

    // Try to find by name
    const existingByName = await db.select({ id: clients.id })
      .from(clients)
      .where(eq(clients.name, clientData.name))
      .limit(1);

    if (existingByName.length > 0) {
      return existingByName[0].id;
    }

    // Create new client
    const [newClient] = await db.insert(clients).values({
      name: clientData.name,
      active: true,
      contactPerson: clientData.contactPerson || null,
      email: clientData.email || null,
      phone: clientData.phone || null,
      whatsapp: clientData.whatsapp || clientData.phone || null,
      rancelabCode: clientData.rancelabCode || null,
      rancelabUrl: clientData.rancelabUrl || null,
      industry: clientData.industry || null,
      tier: clientData.tier || 'silver',
      country: 'Bhutan',
      timezone: 'Asia/Thimphu',
      preferredContactMethod: 'whatsapp',
      createdAt: clientData.createdAt || undefined,
      updatedAt: new Date(),
    }).returning({ id: clients.id });

    console.log(`    📝 Created client: ${clientData.name} (ID: ${newClient.id})`);
    clientCreated++;

    return newClient.id;
  } catch (error: any) {
    console.log(`    ❌ Error creating client: ${error.message}`);
    return null;
  }
}

async function createAMCContract(clientId: number, contractData: any): Promise<boolean> {
  try {
    // Generate contract number
    const contractNumber = `AMC-${Date.now().toString().slice(-6)}`;

    await db.insert(amcs).values({
      clientId: clientId,
      contractNumber: contractNumber,
      publicId: `AMC-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      startDate: contractData.startDate || new Date(),
      endDate: contractData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      amount: contractData.amount ? contractData.amount.toString() : null,
      status: 'active',
      notes: contractData.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`    ✅ Created AMC contract: ${contractNumber}`);
    amcCreated++;
    return true;
  } catch (error: any) {
    console.log(`    ❌ Error creating AMC: ${error.message}`);
    return false;
  }
}

async function importAMCClients() {
  console.log('📊 Starting AMC Import from Excel...');
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

      const rowNum = i + 2;

      // Extract business name
      const businessName = (row['Business Name '] || row['Business Name'] || '').trim();

      // Skip rows without business name
      if (!businessName) {
        console.log(`${rowNum}. ⚠️  Skipped - No business name`);
        skipCount++;
        continue;
      }

      console.log(`${rowNum}. Processing: ${businessName}`);

      // Extract client data
      const contactPerson = row["Owner's Name "] || null;
      const phone = cleanPhoneNumber(row["Owner's Contact No "]);
      const email = cleanEmail(row['Business Email ']);
      const whatsappRaw = row['Whatsapp Stauts '] || row['Whatsapp Status '] || row['Whatsapp'];
      const whatsapp = cleanPhoneNumber(whatsappRaw);
      const industry = row['Nature Of Business '] || null;
      const rancelabCode = (row['License Key '] || '').trim() || null;
      const rancelabUrl = row['URL '] || null;
      const softwareEdition = row['Software Edition '] || '';

      // Parse dates and amounts
      const startDateRaw = row['Starting Date (DD-MM-YY) '] || row['Date Of License Key Issued '];
      const endDateRaw = row['Ending Date (DD-MM-YY) '];
      const amcAmountRaw = row['AMC Amount '] || null;

      const startDate = parseDate(startDateRaw);
      const endDate = parseDate(endDateRaw);

      // If no end date, set it to 1 year after start date
      const finalEndDate = endDate || (startDate ? new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));

      // Determine tier from software edition
      let tier = 'bronze';
      const editionLower = softwareEdition.toLowerCase();
      if (editionLower.includes('gold') || editionLower.includes('premium')) {
        tier = 'gold';
      } else if (editionLower.includes('silver') || editionLower.includes('standard')) {
        tier = 'silver';
      }

      // Prepare client data
      const clientData = {
        name: businessName,
        contactPerson,
        email,
        phone,
        whatsapp,
        rancelabCode,
        rancelabUrl,
        industry,
        tier,
        createdAt: startDate,
      };

      // Find or create client
      const clientId = await findOrCreateClient(clientData);

      if (!clientId) {
        console.log(`    ❌ Failed to create client`);
        errorCount++;
        continue;
      }

      // Create AMC contract
      const amcData = {
        startDate: startDate || new Date(),
        endDate: finalEndDate,
        amount: amcAmountRaw,
        notes: `Software Edition: ${softwareEdition}${industry ? `\nIndustry: ${industry}` : ''}${ralcodelabCode ? `\nLicense Key: ${ralcodelabCode}` : ''}`,
      };

      await createAMCContract(clientId, amcData);

      // Add delay to avoid overwhelming database
      if (processedRows % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('');
    console.log('🎉 AMC Import completed!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`  - Total rows in Excel: ${totalRows}`);
    console.log(`  - Processed: ${processedRows}`);
    console.log(`  - Clients created: ${clientCreated}`);
    console.log(`  - AMC contracts created: ${amcCreated}`);
    console.log(`  - Skipped: ${skipCount}`);
    console.log(`  - Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
importAMCClients()
  .then(() => {
    console.log('');
    console.log('✅ Import script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import script failed:', error);
    process.exit(1);
  });
