# Innovate Bhutan ERP - Complete API & Route Reference

## 📁 Admin Pages (Frontend Routes)
| Route | Page | Status |
|-------|------|--------|
| `/admin` | Dashboard | ✅ Working - Real DB |
| `/admin/clients` | Clients | ✅ Working - Real DB |
| `/admin/services` | Services | ✅ Working - Real DB |
| `/admin/hr` | HR & Payroll | ✅ Working - Real DB |
| `/admin/finance` | Finance Hub | ✅ Working - Real DB + OCR |
| `/admin/projects` | Projects | ✅ Working - Real DB |
| `/admin/tickets` | Tickets | ✅ Working - Real DB |
| `/admin/whatsapp` | WhatsApp Superbot | ✅ Working - Real DB |
| `/admin/ai` | AI Console | ✅ Working - Real DB |
| `/admin/marketing` | Marketing / Leads | ✅ Working - Real DB |
| `/admin/website` | Website CMS | ✅ Working - Real DB |
| `/admin/media` | Media Library | ✅ Working - Real DB |
| `/admin/settings` | Settings | ✅ Working - Real DB |
| `/admin/support` | Support | ✅ Working |
| `/admin/docs` | Documentation | ✅ Working |

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
| `/api/whatsapp` | GET/POST | WhatsApp Webhook + Bot | ✅ |
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