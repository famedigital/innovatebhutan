/**
 * Generate SQL INSERT statements for AMC import
 *
 * This script generates SQL INSERT statements that can be pasted directly into SQL editor
 * Usage: node scripts/generate-amc-sql.js
 */

const XLSX = require('xlsx');

function parseDate(dateValue) {
  if (!dateValue) return null;
  if (typeof dateValue === 'number') {
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = dateValue - 2;
    const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
  }
  if (typeof dateValue === 'string') {
    const cleaned = dateValue.trim()
      .replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/, '$2/$1/$3')
      .replace(/(\d{1,2})-(\d{1,2})-(\d{4})/, '$2/$1/$3')
      .replace(/[,-]\s*$/, '')
      .trim();
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }
  return null;
}

function cleanPhoneNumber(phone) {
  if (!phone) return null;
  let cleaned = String(phone).replace(/[^0-9+]/g, '').trim();
  if (!cleaned || cleaned.length < 6) return null;
  if (cleaned.startsWith('+975')) cleaned = cleaned.substring(4);
  if (cleaned.startsWith('975') && cleaned.length > 10) cleaned = cleaned.substring(3);
  if (cleaned.length > 12) {
    const matches = cleaned.match(/\d{8}/g);
    if (matches && matches.length > 0) cleaned = matches[0];
    else if (cleaned.length >= 8) cleaned = cleaned.substring(cleaned.length - 8);
    else return null;
  }
  return cleaned || null;
}

function cleanEmail(email) {
  if (!email) return null;
  let cleaned = String(email).trim();
  if (cleaned.toLowerCase().startsWith('email:')) cleaned = cleaned.substring(6).trim();
  cleaned = cleaned.replace(/,\s*$/, '').trim();
  if (cleaned && cleaned.includes('@') && cleaned.includes('.')) return cleaned;
  return null;
}

function escapeString(str) {
  if (!str) return 'NULL';
  return "'" + str.toString().replace(/'/g, "''") + "'";
}

// Read Excel file
const workbook = XLSX.readFile('./Client Details 06-04-2026.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet);

console.log('-- AMC Import SQL Statements');
console.log('-- Generated from Client Details 06-04-2026.xlsx');
console.log('');
console.log('-- Clients');
console.log('');

let clientCount = 0;
let amcCount = 0;

const clientIdMap = new Map();
let currentClientId = 1;

rawData.forEach((row, i) => {
  const rowNum = i + 2;

  // Extract business name
  const businessName = (row['Business Name '] || row['Business Name'] || '').trim();
  if (!businessName) {
    console.log(`-- Row ${rowNum}: Skipped - No business name`);
    return;
  }

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
  let finalEndDate = endDate;
  if (!finalEndDate && startDate) {
    const startObj = new Date(startDate);
    startObj.setFullYear(startObj.getFullYear() + 1);
    finalEndDate = startObj.toISOString().split('T')[0];
  }

  // Determine tier from software edition
  let tier = 'bronze';
  const editionLower = softwareEdition.toLowerCase();
  if (editionLower.includes('gold') || editionLower.includes('premium')) {
    tier = 'gold';
  } else if (editionLower.includes('silver') || editionLower.includes('standard')) {
    tier = 'silver';
  }

  // Generate client INSERT statement
  const clientSQL = `INSERT INTO "clients" ("name", "active", "contact_person", "email", "phone", "whatsapp", "ralcodelab_code", "ralcodelab_url", "industry", "tier", "country", "timezone", "preferred_contact_method", "created_at", "updated_at") VALUES (${escapeString(businessName)}, true, ${escapeString(contactPerson)}, ${escapeString(email)}, ${escapeString(phone)}, ${escapeString(whatsapp || phone)}, ${escapeString(rancelabCode)}, ${escapeString(rancelabUrl)}, ${escapeString(industry)}, '${tier}', 'Bhutan', 'Asia/Thimphu', 'whatsapp', ${startDate ? `'${startDate}'` : 'NOW()}, NOW()) RETURNING id;`;

  console.log(`-- Row ${rowNum}: ${businessName}`);
  console.log(clientSQL);

  // Use a placeholder client ID
  const placeholderClientId = currentClientId++;
  clientIdMap.set(rowNum, placeholderClientId);
  clientCount++;

  // Generate AMC contract INSERT statement
  const contractNumber = `AMC-${Date.now().toString().slice(-6)}-${rowNum}`;
  const publicId = `AMC-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

  let notes = `Software Edition: ${softwareEdition}`;
  if (industry) notes += `\nIndustry: ${industry}`;
  if (ralcodelabCode) notes += `\nLicense Key: ${ralcodelabCode}`;

  const amcSQL = `INSERT INTO "amcs" ("client_id", "contract_number", "public_id", "start_date", "end_date", "amount", "status", "notes", "created_at", "updated_at") VALUES (${placeholderClientId}, ${escapeString(contractNumber)}, ${escapeString(publicId)}, ${startDate ? `'${startDate}'` : 'NOW()}, ${finalEndDate ? `'${finalEndDate}'` : 'NOW()'}, ${amcAmountRaw ? amcAmountRaw : 'NULL'}, 'active', ${escapeString(notes)}, NOW(), NOW());`;

  console.log(amcSQL);
  console.log('');
  amcCount++;
});

console.log('-- Summary');
console.log(`-- Total clients to insert: ${clientCount}`);
console.log(`-- Total AMC contracts to insert: ${amcCount}`);
console.log('');
console.log('-- IMPORTANT: After running the client INSERTs, you need to update the AMC client_id values to match the actual client IDs from your database.');
