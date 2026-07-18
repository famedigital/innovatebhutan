# Innovate Bhutan ERP - Complete API & Route Reference

## 📁 Admin Pages (Frontend Routes)
| Route | Page | Status |
|-------|------|--------|
| `/admin` | Dashboard | ✅ Live metrics via `/api/reports/summary` |
| `/admin/clients` | Clients | ✅ API → clientService |
| `/admin/services` | Services | ✅ API → serviceCatalogService |
| `/admin/hr` | HR & Payroll | ✅ Working |
| `/admin/finance` | Legacy Finance | ↪️ Redirects to `/admin/transactions` |
| `/admin/transactions` | Transactions | ✅ Working |
| `/admin/accounts` | Accounts | ✅ Create payment/journal dialogs |
| `/admin/procurement` | Procurement | ✅ Create PO/RFQ dialogs |
| `/admin/projects` | Projects | ✅ Working |
| `/admin/tickets` | Tickets | ✅ `/api/tickets` stack (no client Supabase writes) |
| `/admin/amc` | AMC | ✅ Working |
| `/admin/whatsapp` | WhatsApp | ✅ Working |
| `/admin/support/problems` | Problems | ✅ In sidebar |
| `/admin/settings` | Settings | ✅ ADMIN only (RBAC enforced) |

## 🌐 Public Pages (Frontend Routes)
| Route | Page | Status |
|-------|------|--------|
| `/` | Home | ✅ Working |
| `/services` | Services | ✅ Working |
| `/company` | Company | ✅ Working |
| `/support` | Support | ✅ Working |
| `/brands` | Brands | ✅ Working |
| `/login` | Login | ✅ Working |

## 🔌 API Routes (Backend)
| Route | Method | Purpose | Status |
|-------|--------|---------|--------|
| `/api/tickets` | GET/POST | Support tickets list/create | ✅ Auth + rate limit |
| `/api/tickets/[id]` | GET/PUT/DELETE | Ticket detail/update | ✅ Auth + audit |
| `/api/tickets/[id]/messages` | GET/POST | Ticket thread | ✅ Auth |
| `/api/jobs` | GET/POST | Background job registry | ✅ Auth required |
| `/api/gemini` | POST | AI Content Generation | ✅ |
| `/api/ocr` | POST | Bank Statement/Receipt OCR | ✅ |
| `/api/leads/webhook` | POST | Add leads from Make.com/Zapier | ✅ |
| `/api/webhook` | POST | Generic webhook for automation | ✅ |
| `/api/media/upload` | POST | Upload media with Cloudinary | ✅ |

## 🔑 Required Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GEMINI_API_KEY= or GOOGLE_GEMINI_API_KEY=

# WhatsApp
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Automation
MAKE_WEBHOOK_URL=
ZAPIER_WEBHOOK_URL=

# Payment
STRIPE_SECRET_KEY=

# Email
SENDGRID_API_KEY=
MAILGUN_API_KEY=

# Security
INTERNAL_API_KEY=
```

## 📊 Database Tables (Expected)
- `clients` - Client records
- `employees` - HR/Payroll
- `transactions` - Finance
- `projects` - Project management
- `tickets` - Support tickets
- `leads` - Marketing leads
- `services` - Service catalog
- `brands` - Partner brands
- `media` - File storage
- `settings` - Configuration
- `website_content` - CMS
- `social_accounts` - Marketing
- `scheduled_posts` - Social scheduling
- `whatsapp_logs` - Bot logs
- `audit_logs` - System audit

## 🔗 Webhook URLs for External Services
```
Make.com:     POST {your-domain}/api/webhook
Zapier:       POST {your-domain}/api/webhook
WhatsApp:     POST {your-domain}/api/whatsapp
Lead Sync:    POST {your-domain}/api/leads/webhook
```