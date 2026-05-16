/**
 * Context Management Script
 *
 * Usage:
 *   node scripts/context.cjs save     - Save current context state
 *   node scripts/context.cjs load     - Load and display current state
 *   node scripts/context.cjs compress - Compress conversation to summary
 *   node scripts/context.cjs snapshot - Create quick snapshot
 */

const fs = require('fs');
const path = require('path');

const CONTEXT_DIR = path.join(__dirname, '../.claude');
const PROJECT_STATE = path.join(CONTEXT_DIR, 'PROJECT_STATE.md');
const CONTEXT_SNAPSHOT = path.join(CONTEXT_DIR, 'CONTEXT_SNAPSHOT.md');
const SESSIONS_DIR = path.join(CONTEXT_DIR, 'sessions');

// Ensure directories exist
if (!fs.existsSync(CONTEXT_DIR)) fs.mkdirSync(CONTEXT_DIR, { recursive: true });
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

function getTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function saveContext() {
  console.log('💾 Saving context state...');
  console.log(`   State file: ${PROJECT_STATE}`);
  console.log('   ✓ Context saved. Run /compact to compress conversation.');
}

function loadContext() {
  console.log('📖 Loading context state...\n');

  if (fs.existsSync(PROJECT_STATE)) {
    const state = fs.readFileSync(PROJECT_STATE, 'utf-8');
    console.log('=== PROJECT STATE ===');
    console.log(state);
  } else {
    console.log('⚠️  No project state found.');
  }

  console.log('\n=== QUICK REFRESH ===');
  if (fs.existsSync(CONTEXT_SNAPSHOT)) {
    const snapshot = fs.readFileSync(CONTEXT_SNAPSHOT, 'utf-8');
    // Just show the header section
    const lines = snapshot.split('\n');
    let inHeader = true;
    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (!inHeader) break;
        inHeader = false;
      }
      if (inHeader || line.startsWith('## ')) {
        console.log(line);
      }
    }
    console.log('\n📄 Full snapshot: .claude/CONTEXT_SNAPSHOT.md');
  } else {
    console.log('⚠️  No snapshot found. Run: node scripts/context.cjs snapshot');
  }
}

function compressSession() {
  console.log('🗜️  Compressing session...');

  const timestamp = getTimestamp();
  const sessionFile = path.join(SESSIONS_DIR, `session-${timestamp}.md`);

  const template = `# Session Summary - ${new Date().toISOString()}

## Work Done
<!-- Add summary of work completed in this session -->

## Files Modified
<!-- List modified files with brief descriptions -->

## Decisions Made
<!-- Document important decisions -->

## Next Steps
<!-- [ ] Task 1 -->
<!-- [ ] Task 2 -->

## Known Issues
<!-- Document any issues discovered -->

## Code Snippets
<!-- Keep important code patterns -->
`;

  fs.writeFileSync(sessionFile, template);
  console.log(`   Session template: ${sessionFile}`);
  console.log('   ✓ Fill in the template with session details.');
}

function createSnapshot() {
  console.log('📸 Creating quick snapshot...');

  const snapshot = `# Quick Context Snapshot

**Generated:** ${new Date().toISOString()}

## Current Work
<!-- What are you working on right now? -->

## Recent Changes
<!-- What changed recently? -->

## Next Steps
<!-- What's next? -->

## Quick Commands
\`\`\`bash
npm run dev          # Start dev server
npm run test         # Run tests
npm run db:push      # Push schema
npm run db:rls       # Apply RLS
\`\`\`

## Key Files
<!-- List most important files for current work -->

`;

  fs.writeFileSync(CONTEXT_SNAPSHOT, snapshot);
  console.log(`   Snapshot: ${CONTEXT_SNAPSHOT}`);
  console.log('   ✓ Update with current context.');
}

// CLI
const command = process.argv[2];

switch (command) {
  case 'save':
    saveContext();
    break;
  case 'load':
    loadContext();
    break;
  case 'compress':
    compressSession();
    break;
  case 'snapshot':
    createSnapshot();
    break;
  default:
    console.log(`
Context Management Tool

Usage:
  node scripts/context.cjs save     - Mark context as saved
  node scripts/context.cjs load     - Display current state
  node scripts/context.cjs compress - Create session template
  node scripts/context.cjs snapshot - Create snapshot template

Files:
  .claude/PROJECT_STATE.md     - Current work state
  .claude/CONTEXT_SNAPSHOT.md  - Quick tech reference
  .claude/sessions/            - Compressed sessions
    `);
}

process.exit(0);
