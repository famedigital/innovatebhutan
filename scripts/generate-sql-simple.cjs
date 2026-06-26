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
    if (cleaned.length >= 8) cleaned = cleaned.substring(cleaned.length - 8);
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

const workbook = XLSX.readFile('./Client Details 06-04-2026.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet);

console.log('-- AMC Import SQL for: Client Details 06-04-2026.xlsx');
console.log('-- Generated SQL INSERT statements');
console.log('-- Copy and paste this into your SQL editor');
console.log('');

let clientId = 100;

rawData.forEach((row, i) => {
  const rowNum = i + 2;
  const businessName = (row['Business Name '] || row['Business Name'] || '').trim();

  if (!businessName) {
    console.log('-- Row ' + rowNum + ': Skipped (no business name)');
    return;
  }

  const contactPerson = row["Owner's Name "] || null;
  const phone = cleanPhoneNumber(row["Owner's Contact No "]);
  const email = cleanEmail(row['Business Email ']);
  const whatsappRaw = row['Whatsapp Stauts '] || row['Whatsapp Status '] || row['Whatsapp'];
  const whatsapp = cleanPhoneNumber(whatsappRaw);
  const industry = row['Nature Of Business '] || null;
  const rancelabCode = (row['License Key '] || '').trim() || null;
  const rancelabUrl = row['URL '] || null;
  const softwareEdition = row['Software Edition '] || '';

  const startDateRaw = row['Starting Date (DD-MM-YY) '] || row['Date Of License Key Issued '];
  const endDateRaw = row['Ending Date (DD-MM-YY) '];
  const amcAmountRaw = row['AMC Amount '] || null;

  const startDate = parseDate(startDateRaw);
  const endDate = parseDate(endDateRaw);

  let tier = 'bronze';
  if (softwareEdition.toLowerCase().includes('gold')) tier = 'gold';
  else if (softwareEdition.toLowerCase().includes('silver')) tier = 'silver';

  // Client INSERT
  let sql = 'INSERT INTO "clients" ("name", "active", "contact_person", "email", "phone", "whatsapp", "ralcodelab_code", "ralcodelab_url", "industry", "tier", "country", "timezone", "preferred_contact_method", "created_at", "updated_at") VALUES (';
  sql += escapeString(businessName) + ', true, ';
  sql += escapeString(contactPerson) + ', ';
  sql += escapeString(email) + ', ';
  sql += escapeString(phone) + ', ';
  sql += escapeString(whatsapp || phone) + ', ';
  sql += escapeString(rancelabCode) + ', ';
  sql += escapeString(rancelabUrl) + ', ';
  sql += escapeString(industry) + ', ';
  sql += "'" + tier + "', 'Bhutan', 'Asia/Thimphu', 'whatsapp', ";
  sql += (startDate ? "'" + startDate + "'" : 'NOW()') + ', NOW());';

  console.log('-- Client: ' + businessName);
  console.log(sql);

  // AMC INSERT
  const contractNumber = 'AMC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  let finalEndDate = endDate;
  if (!finalEndDate && startDate) {
    const startObj = new Date(startDate);
    startObj.setFullYear(startObj.getFullYear() + 1);
    finalEndDate = startObj.toISOString().split('T')[0];
  }

  let notes = 'Software Edition: ' + softwareEdition;
  if (industry) notes += ' | Industry: ' + industry;
  if (ralcodelabCode) notes += ' | License: ' + ralcodelabCode;

  sql = 'INSERT INTO "amcs" ("client_id", "contract_number", "public_id", "start_date", "end_date", "amount", "status", "notes", "created_at", "updated_at") VALUES (';
  sql += (clientId++) + ', ';
  sql += escapeString(contractNumber) + ', ';
  sql += escapeString('AMC-' + Math.random().toString(36).substring(2, 10).toUpperCase()) + ', ';
  sql += (startDate ? "'" + startDate + "'" : 'NOW()') + ', ';
  sql += (finalEndDate ? "'" + finalEndDate + "'" : 'NOW()') + ', ';
  sql += (amcAmountRaw ? amcAmountRaw : 'NULL') + ', ';
  sql += "'active', ";
  sql += escapeString(notes) + ', ';
  sql += 'NOW(), NOW());';

  console.log(sql);
  console.log('');
});

console.log('-- End of SQL import');