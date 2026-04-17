# Database Migration Guide

## Issue Found

The automatic database migration push via Drizzle Kit is experiencing connection timeouts when trying to connect to the Supabase PostgreSQL database. This appears to be a network connectivity or connection pooling issue with the remote database.

## Solution: Manual Database Migration

The migration SQL file has been successfully generated and is ready to be applied manually through the Supabase dashboard.

### Migration File Location
- **File**: `drizzle/0002_sloppy_orphan.sql`
- **Status**: Generated and ready to apply

### Tables to be Created

The migration will create the following new tables for the directory feature:

#### Core Directory Tables
1. **`locations`** - Bhutanese cities and districts
   - Fields: id, public_id, name, district, dzongkhag, thromde, coordinates, is_active, display_order

2. **`business_categories`** - Hierarchical business categories
   - Fields: id, public_id, name, slug, icon, description, parent_id, display_order, is_active

3. **`businesses`** - Main business listings
   - Fields: id, public_id, slug, name, tagline, description, category_id, location_id, phone, whatsapp, email, website, address, coordinates, logo_url, cover_image_url, gallery_urls, owner_id, client_id, status, type, is_verified, is_featured, rating, review_count, meta_title, meta_description, keywords

#### Supporting Tables
4. **`business_reviews`** - Customer reviews system
   - Fields: id, public_id, business_id, customer_name, customer_email, order_id, project_id, is_verified, rating, title, comment, response, responded_at, status

5. **`business_hours`** - Operating hours
   - Fields: id, business_id, day_of_week, open_time, close_time, is_closed

6. **`business_amenities`** - Flexible filtering options
   - Fields: id, business_id, amenity_type, amenity_value

#### Additional Tables
7. **`projects`** - Project management
8. **`project_tasks`** - Project task tracking
9. **`notifications`** - User notifications
10. **`ticket_messages`** - Support ticket messages
11. **`audit_logs`** - System audit logs

### How to Apply Migration Manually

#### Option 1: Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ldrfdkkkvvcznsprbghf`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `drizzle/0002_sloppy_orphan.sql`
6. Paste the SQL into the editor
7. Click **Run** to execute the migration
8. Verify tables were created successfully in **Table Editor**

#### Option 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref ldrfdkkkvvcznsprbghf

# Execute the migration
supabase db execute --file drizzle/0002_sloppy_orphan.sql
```

#### Option 3: psql Command Line
```bash
# Set your database URL
set DATABASE_URL=postgresql://postgres.ldrfdkkkvvcznsprbghf:Innovates@2030!#@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require

# Execute the migration file
psql %DATABASE_URL% -f drizzle/0002_sloppy_orphan.sql
```

### Post-Migration Steps

After successfully applying the migration:

1. **Update API Endpoints**: Remove the temporary static data returns from:
   - `app/api/directory/businesses/route.ts`
   - `app/api/directory/categories/route.ts`
   - `app/api/directory/locations/route.ts`
   - `app/api/directory/search/route.ts`

2. **Add Sample Data**: Insert sample data for testing:
   ```sql
   -- Sample locations
   INSERT INTO locations (public_id, name, district, description) VALUES
   ('loc_001', 'Thimphu', 'Thimphu District', 'Capital city'),
   ('loc_002', 'Paro', 'Paro District', 'Tourist town');

   -- Sample categories
   INSERT INTO business_categories (public_id, name, slug, icon, description) VALUES
   ('cat_001', 'IT Services', 'it-services', 'Zap', 'Enterprise IT solutions'),
   ('cat_002', 'Software', 'software', 'Code', 'Software development');

   -- Sample businesses
   INSERT INTO businesses (public_id, slug, name, tagline, description, category_id, location_id) VALUES
   ('biz_001', 'tech-solutions-bhutan', 'Tech Solutions Bhutan', 'Premier IT Services', 'Complete IT solutions', 1, 1);
   ```

3. **Verify Integration**: Test the directory pages:
   - Visit `/directory` - Main directory page
   - Visit `/directory/thimphu` - Location page
   - Visit `/directory/business/tech-solutions-bhutan` - Business detail page

### Troubleshooting

#### Connection Timeout Issues
If you continue to experience connection timeouts:
1. Check Supabase project status - there might be service disruptions
2. Verify network connectivity to Supabase servers
3. Check if database pause/suspend is enabled in Supabase settings
4. Try using Supabase's direct connection URL instead of pooler

#### SQL Execution Errors
If you get SQL execution errors:
1. Check if tables already exist - use `DROP TABLE IF EXISTS` if needed
2. Verify foreign key references exist
3. Check for naming conflicts with existing tables
4. Review Supabase logs for detailed error messages

### Current Implementation Status

✅ **Completed**:
- Database schema designed and migration SQL generated
- All API endpoints created (temporarily using static data)
- Main directory page with premium glassmorphism UI
- Location-specific pages (`/directory/[location]`)
- Business detail pages with reviews system (`/directory/business/[slug]`)
- Navigation integration
- Responsive design and animations

⏳ **Pending Database Connection**:
- Manual migration execution needed
- Switch from static to real data after migration
- Add sample data for testing

### Alternative Approach

If database migration continues to be problematic, the static data approach can be extended:
- Add more sample business data directly in components
- Create a JSON file with directory data
- Implement simple filtering in the frontend
- Migrate to real database when connectivity issues are resolved

---

**Generated**: 2026-04-14
**Migration File**: `drizzle/0002_sloppy_orphan.sql`
**Status**: Ready for manual execution