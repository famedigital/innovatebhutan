#!/usr/bin/env node

/**
 * MASS REBRANDING SCRIPT: innovate.bt → innovates.bt
 *
 * Usage:
 *   node scripts/rebrand-to-innovates.js
 *
 * This script will:
 * 1. Find all files containing "innovate.bt"
 * 2. Replace all occurrences with "innovates.bt"
 * 3. Create a backup before changes
 * 4. Generate a report of changes made
 */

const fs = require('fs');
const path = require('path');

// Files to process (manually verified list)
const FILES_TO_PROCESS = [
  'db/schema.ts',
  'app/company/careers/page.tsx',
  'components/footer-section.tsx',
  'app/support/service/page.tsx',
  'app/support/warranty/page.tsx',
  'app/support/help/page.tsx',
  'app/company/team/page.tsx',
  'app/support/support-content.tsx',
  'app/support/page.tsx',
  'app/client/page.tsx',
  'app/login/page.tsx',
  'app/layout.tsx',
  'app/admin/support/page.tsx',
  'app/admin/whatsapp/whatsapp-hub.tsx',
  'app/admin/layout.tsx',
  'app/admin/ai/bot-training/page.tsx',
  'app/admin/ai/bot-training.tsx',
  'app/admin/website/page.tsx',
  'app/services/page.tsx',
];

// Replacement patterns (order matters - specific before general)
const REPLACEMENTS = [
  // URL replacements (most specific first)
  { from: /https:\/\/www\.innovate\.bt/gi, to: 'https://www.innovates.bt' },
  { from: /https:\/\/innovate\.bt/gi, to: 'https://innovates.bt' },
  { from: /www\.innovate\.bt/gi, to: 'www.innovates.bt' },
  // Brand name replacements
  { from: /INNOVATE BHUTAN/gi, to: 'INNOVATES BHUTAN' },
  { from: /Innovate Bhutan/gi, to: 'Innovates Bhutan' },
  { from: /innovatebhutan/gi, to: 'innovatesbhutan' },
  // Special cases for logo/branding
  { from: /INNOVATE<span/g, to: 'INNOVATES<span' },
  { from: /innovate\.bt/gi, to: 'innovates.bt' },
  { from: /INNOVATE\.BT/g, to: 'INNOVATES.BT' },
];

// Backup directory
const BACKUP_DIR = path.join(process.cwd(), '.backup-before-rebrand');

// Statistics
const stats = {
  filesProcessed: 0,
  filesChanged: 0,
  totalReplacements: 0,
  errors: [],
};

/**
 * Create backup of a file
 */
function backupFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const backupPath = path.join(BACKUP_DIR, relativePath);
  const backupDir = path.dirname(backupPath);

  // Create backup directory if needed
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let replaceCount = 0;

    // Apply all replacements
    for (const { from, to } of REPLACEMENTS) {
      const matches = newContent.match(from);
      if (matches) {
        replaceCount += matches.length;
        newContent = newContent.replace(from, to);
      }
    }

    // Only write if changed
    if (newContent !== content) {
      // Create backup
      const backupPath = backupFile(filePath);
      console.log(`  ✓ Backed up to: .backup/${path.relative(process.cwd(), backupPath)}`);

      // Write new content
      fs.writeFileSync(filePath, newContent, 'utf8');
      stats.filesChanged++;
      stats.totalReplacements += replaceCount;
      console.log(`  → Made ${replaceCount} replacements`);
    } else {
      console.log(`  → No changes needed`);
    }

    stats.filesProcessed++;
    return true;
  } catch (error) {
    stats.errors.push({ file: filePath, error: error.message });
    console.error(`  ✗ Error: ${error.message}`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     INNOVATE.BT → INNOVATES.BT MASS REBRANDING SCRIPT     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: .backup-before-rebrand/\n`);
  }

  // Process each file
  console.log('🔄 Processing files...\n');
  for (const fileRelPath of FILES_TO_PROCESS) {
    const fullPath = path.join(process.cwd(), fileRelPath);
    console.log(`\n📄 ${fileRelPath}`);

    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠ File not found, skipping...`);
      continue;
    }

    processFile(fullPath);
  }

  // Print summary
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                        SUMMARY                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Files processed:     ${stats.filesProcessed}`);
  console.log(`📝 Files changed:       ${stats.filesChanged}`);
  console.log(`🔄 Total replacements:  ${stats.totalReplacements}`);
  console.log(`📁 Backup location:     ${BACKUP_DIR}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${stats.errors.length}`);
    stats.errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
  }

  console.log('\n\n💡 To restore backups if needed:');
  console.log(`   cp -r .backup-before-rebrand/* ./\n`);
}

// Run
main().catch(console.error);
