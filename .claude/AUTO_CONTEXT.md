# Auto Context System

**This system runs automatically - no manual commands needed.**

## Automatic Behavior

### Every Message Sent
→ Context is tracked in memory
→ Patterns are detected (tech stack, file patterns, decisions)

### Every 30 Messages
→ Session auto-saved to `.claude/sessions/`
→ PROJECT_STATE.md auto-updated with progress

### Before /compact
→ Full conversation saved
→ All decisions documented
→ Code snippets extracted

### On Error
→ Error context saved to `.claude/errors/`
→ Stack traces captured
→ Related files logged

## Project Rules (Auto-Applied)

### Code Style
- **No comments** unless WHY is non-obvious
- **Server components first**, 'use client' only when needed
- **Glassmorphism**: `backdrop-blur-xl bg-white/5`
- **Animations**: `fadeIn`, `slideUp`, `scaleIn`

### File Patterns
- API routes: `app/api/{module}/route.ts`
- Services: `lib/services/{module}Service.ts`
- Repositories: `lib/repositories/{module}Repository.ts`
- Admin pages: `app/admin/{module}/page.tsx`

### Auth Pattern
```typescript
const authContext = await requireApiAuth(req);
requireStaffOrAdmin(authContext.profile);
```

### Next.js 16 Pattern
```typescript
const { id } = await params; // ALWAYS await params
```

## Vibe Check

**This project's vibe:**
- Clean, minimal, glassmorphic
- Apple-style animations
- Dark theme primary
- Accent: #ff6b35 (Innovate Orange)

**When in doubt:**
1. Check `CONTEXT_SNAPSHOT.md` for tech refresher
2. Check `PROJECT_STATE.md` for current work
3. Match existing patterns - don't invent new ones
4. Follow glassmorphism design

## Auto-Capture Rules

The system automatically captures:
- **All file modifications** → logged to state
- **All decisions made** → logged to state
- **All errors encountered** → logged to errors/
- **All tech stack choices** → logged to snapshot

**You don't need to remember to save anything.**

## Emergency Recovery

If context is lost:
1. Read `.claude/CONTEXT_SNAPSHOT.md`
2. Read `.claude/PROJECT_STATE.md`
3. Read `.claude/sessions/` for recent history
4. Continue where you left off

---

**This system ensures nothing important is ever lost, even in very long conversations.**
