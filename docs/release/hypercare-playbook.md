# Hypercare Playbook - Innovate Bhutan ERP Production Launch

**Version:** 1.0
**Hypercare Period:** 7 Days post-launch
**Last Updated:** 2026-04-20

---

## What is Hypercare?

Hypercare is the **first 7 days** after production launch when the engineering team provides:
- Enhanced monitoring
- Rapid incident response
- Proactive user support
- Quick bug fixes

---

## Hypercare Team Structure

| Role | Primary | Backup | Responsibilities |
|------|---------|--------|------------------|
| Hypercare Lead | | | Overall coordination, escalation |
| Backend Engineer | | | API issues, database problems |
| Frontend Engineer | | | UI bugs, browser issues |
| DevOps Engineer | | | Infrastructure, deployments |
| Product Owner | | | User communication, priority |

---

## Hypercare Schedule

### Day 1-2 (Launch & Stabilization)
- **Intensity:** HIGH
- **Monitoring:** Continuous
- **Response Time:** <15 minutes for critical issues
- **Standups:** Every 4 hours

### Day 3-5 (Monitoring & Fixes)
- **Intensity:** MEDIUM
- **Monitoring:** Hourly checks
- **Response Time:** <1 hour for critical issues
- **Standups:** Twice daily (morning/evening)

### Day 6-7 (Wrap-up)
- **Intensity:** LOW
- **Monitoring:** Normal operations
- **Response Time:** <4 hours for critical issues
- **Standups:** Once daily

---

## Monitoring Dashboard Checklist

### Application Health (Check Hourly Days 1-2, then 4x daily)

- [ ] **Vercel Dashboard**
  - Deployment status: Healthy
  - Error rate: <0.1%
  - Response time: p95 <2s
  - No failed builds

- [ ] **Supabase Dashboard**
  - Database CPU: <70%
  - Memory usage: <80%
  - Active connections: Normal range
  - Query performance: No slow queries (>3s)

- [ ] **Error Tracking**
  - Browser console errors: <10/hour
  - API 500 errors: 0
  - Unhandled exceptions: 0

### Business Metrics (Check Daily)

- [ ] **User Activity**
  - Active users today: ___
  - Failed logins: <5%
  - New user registrations: ___

- [ ] **Module Usage**
  - Projects created/updated: ___
  - Invoices generated: ___
  - Payroll runs: ___
  - AMC renewals: ___

---

## Incident Triage & Escalation

### Severity Levels

| Severity | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| **P0 - Critical** | System down, data loss, security breach | <15 min | Database unavailable, auth failure |
| **P1 - High** | Major feature broken, significant UX impact | <1 hour | Cannot create invoices, projects not loading |
| **P2 - Medium** | Minor feature broken, workaround available | <4 hours | Mobile UI issue, report export fails |
| **P3 - Low** | Cosmetic issues, nice-to-have | <24 hours | Spelling error, color inconsistency |

### Escalation Matrix

```
Level 1: Hypercare Team (First Responder)
    |
    v (15 mins no resolution)
Level 2: Hypercare Lead + Tech Lead
    |
    v (1 hour no resolution)
Level 3: Product Owner + Stakeholders
```

---

## Common Issues & Quick Fixes

### Authentication Issues

**Symptom:** Users cannot log in
```
Quick Check:
1. Check Supabase Auth status
2. Verify NEXT_PUBLIC_SUPABASE_URL and ANON_KEY
3. Check middleware.ts for errors
```

**Fix:** Restart Supabase Auth or redeploy if config issue

### Database Connection Issues

**Symptom:** API returns 500 errors
```
Quick Check:
1. Check Supabase dashboard - DB online?
2. Verify DATABASE_URL in Vercel env vars
3. Check connection pool limits
```

**Fix:** Increase pool size or restart application

### Invoice Number Generation Issues

**Symptom:** Duplicate invoice numbers or generation failures
```
Quick Check:
1. Check database constraint: invoices_invoice_number_unique
2. Review invoiceService.ts generation logic
3. Check for existing invoice with same number
```

**Fix:** Implement sequence-based generation or manual prefix with timestamp

### Performance Degradation

**Symptom:** Pages loading slowly (>5 seconds)
```
Quick Check:
1. Check Supabase query performance
2. Review indexes on large tables
3. Check for N+1 queries in repositories
```

**Fix:** Add missing indexes or optimize queries

---

## User Support During Hypercare

### Support Channels

| Channel | Purpose | Response Time |
|---------|---------|---------------|
| Slack/Discord | Internal team questions | <30 min |
| Email | External user support | <2 hours |
| Phone | Critical production issues | Immediate |

### Common User Questions

**Q: I can't see the Projects module**
- A: Check user role (must be ADMIN or STAFF)

**Q: Invoice number looks weird**
- A: Report for review - may need manual adjustment

**Q: Payroll calculation seems wrong**
- A: Check employee salary and tax settings; contact HR

---

## Hotfix Procedure

### When to Deploy Hotfix

- P0 or P1 issue affecting production
- No viable workaround
- Fix has been tested in staging

### Hotfix Process

1. **Create hotfix branch**
   ```bash
   git checkout -b hotfix/[issue-description]
   ```

2. **Implement fix**
   - Make minimal changes
   - Add test if applicable
   - Document in commit message

3. **Test in staging**
   ```bash
   vercel --env=preview
   ```

4. **Deploy to production**
   ```bash
   vercel --prod
   ```

5. **Verify fix**
   - Confirm issue resolved
   - No regressions
   - Monitor for 30 minutes

6. **Merge to main**
   ```bash
   git checkout main
   git merge hotfix/[issue-description]
   git push origin main
   ```

---

## Daily Hypercare Standup Agenda

### Morning Standup (9:00 AM)

1. **Incident Review**
   - Any overnight issues?
   - Current incident status

2. **Metrics Review**
   - Error rates
   - User activity
   - Performance stats

3. **Today's Focus**
   - Planned fixes
   - Monitoring priorities
   - User support needs

### Evening Standup (5:00 PM)

1. **Day Summary**
   - Issues resolved
   - Issues pending
   - User feedback

2. **Tomorrow's Plan**
   - Known issues to address
   - Monitoring schedule
   - Deployments planned

---

## Hypercare Communication Plan

### Internal Updates

- **Slack/Discord Channel:** `#erp-hypercare`
- **Frequency:** Every 4 hours (Days 1-2), then twice daily
- **Format:**
  ```
  [HYPERCARE UPDATE] Day X - HH:MM
  Status: Green/Yellow/Red
  Incidents: X open, Y resolved
  Next check-in: HH:MM
  ```

### External Communication

- **Users:** Notify of planned maintenance
- **Stakeholders:** Daily summary email
- **Escalation:** Call for P0 incidents

---

## End of Hypercare

### Day 7 Wrap-up Tasks

- [ ] **Incident Summary**
  - Document all issues
  - Root cause analysis
  - Resolution steps

- [ ] **Metrics Report**
  - Uptime percentage
  - Error rates
  - User activity stats

- [ ] **Known Issues**
  - Document deferred issues
  - Prioritize backlog
  - Estimate fixes

- [ ] **Handoff**
  - Transition to normal operations
  - Set ongoing monitoring
  - Schedule post-mortem if needed

### Hypercare Retrospective

**Questions to Discuss:**
1. What went well during launch?
2. What could be improved?
3. Were monitoring and response times adequate?
4. Is documentation complete?

---

## Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Hypercare Lead | | | |
| Tech Lead | | | |
| DevOps Engineer | | | |
| Product Owner | | | |

---

## Runbook Sign-Off

**Hypercare Lead:** ________________ **Date:** ________

**Tech Lead:** ________________ **Date:** ________

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-20 | 1.0 | Initial hypercare playbook for ERP production launch |
