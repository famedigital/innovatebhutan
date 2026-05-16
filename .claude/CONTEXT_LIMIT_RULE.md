# Context Window Management Rule

## Rule: Never Let Context Window Limit Be Reached

**Trigger:** When context exceeds 70% of window size (~140K tokens for Opus 4.5)

## Action Required

1. **STOP** - Do not continue with new tasks
2. **COMPRESS** - Archive completed work to memory files
3. **CLEAR** - Remove redundant conversation from active context
4. **RESUME** - Only after compression is complete

## Compression Checklist

- [ ] All completed tasks documented in `SESSION_MEMORY.md`
- [ ] Code changes committed to git (or at least staged)
- [ ] Old sessions archived to `docs/sessions/`
- [ ] Only active task details remain in context
- [ ] User informed of compression action

## Memory Hierarchy

```
SESSION_MEMORY.md (active session)
    ↓
docs/sessions/YYYY-MM-DD_task-name.md (archived sessions)
    ↓
Git commits (permanent history)
```

## Critical Info to Preserve

1. **What was changed** - Files modified, patterns used
2. **Why it was changed** - Problem solved, decision rationale
3. **What's pending** - Next steps, blockers
4. **Build status** - Pass/fail state of lint/test/build
5. **User preferences** - Working style, feedback received

## Auto-Compression Triggers

- Context window > 70%
- More than 5 completed tasks in session
- User says "continue later" or similar
- Switching to entirely different module

## Resume Protocol

When returning to compressed session:

1. Read `SESSION_MEMORY.md` first
2. Verify current build status
3. Confirm priorities with user
4. Continue from documented next step
