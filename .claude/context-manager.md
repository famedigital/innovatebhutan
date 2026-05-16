# Context Management System

## Purpose
Prevent context window overflow by automatically compressing and persisting important information during long conversations.

## Architecture

### 1. Context Triggers (Automatic Saves)

The system automatically saves context when:

| Trigger | Action | Location |
|---------|--------|----------|
| Every 50 messages | Compress conversation | `.claude/sessions/session-{timestamp}.md` |
| Before /compact | Save full state | `.claude/sessions/pre-compact-{timestamp}.md` |
| Module completion | Save summary | `PROJECT_STATE.md` |
| Critical error | Save error context | `.claude/errors/error-{timestamp}.md` |
| User request | Manual save | `MEMORY.md` |

### 2. Context Files

#### `PROJECT_STATE.md` (Current State)
```markdown
# Current Project State

## Working On
- Module: Advanced Reporting Dashboard
- Status: In Progress
- Started: 2026-05-14

## Recent Changes
- [2026-05-14] Fixed Next.js 16 params Promise in 6 API routes
- [2026-05-14] Database reset completed (30 tables)
- [2026-05-14] All tests passing (254/254)

## Pending Tasks
- [ ] Complete dashboard KPI cards
- [ ] Add revenue chart
- [ ] Implement export functionality

## Known Issues
- 2 RLS policies failing (attendance, payslips)
```

#### `CONTEXT_SNAPSHOT.md` (Quick Load)
```markdown
# Quick Context Snapshot

## Tech Stack
- Next.js 16, Supabase, Drizzle, Tailwind v4

## Database
- 30 tables
- Schema: `db/schema.ts`
- Migrations: `drizzle/`

## Key Files
- Auth: `lib/auth/api-auth.ts`
- Hooks: `hooks/use-user-profile.ts`
- Services: `lib/services/`

## Commands
- `npm run db:push` - Push schema
- `npm run db:rls` - Apply RLS
- `npm run test` - Run tests
```

### 3. Context Compression Template

```markdown
# Session Summary {date}

## Work Done
1. {task1}
2. {task2}

## Files Modified
- [{file}]({path}) - {change}
- [{file}]({path}) - {change}

## Decisions Made
- {decision1}
- {decision2}

## Next Steps
- [ ] {next1}
- [ ] {next2}

## Error Log
{if any errors}

## Code Snippets
{important snippets worth keeping}
```

### 4. Quick Context Commands

Create these slash commands in `.claude/`:

#### `/save-context`
```bash
# Saves current state to PROJECT_STATE.md
```

#### `/load-context`
```bash
# Loads and displays PROJECT_STATE.md
```

#### `/compress`
```bash
# Compresses last N messages into summary
```

#### `/summary`
```bash
# Shows project summary from memory
```

### 5. Memory Index Optimization

Keep `MEMORY.md` under 200 lines by:
- Using concise one-liners for entries
- Linking to detailed files instead of embedding content
- Pruning outdated entries quarterly

## Usage Flow

```
Start Work
    ↓
Read PROJECT_STATE.md ← (What was I doing?)
    ↓
Read CONTEXT_SNAPSHOT.md ← (Quick tech refresher)
    ↓
Do Work
    ↓
Every 50 messages → Auto-compress to session file
    ↓
Before /compact → Save full state
    ↓
Update PROJECT_STATE.md with progress
```

## Implementation

The context manager is implemented via:
1. **Auto-save hook** in `.claude/` directory
2. **Manual triggers** via slash commands
3. **Memory system** for persistent patterns
4. **State files** for quick recovery
