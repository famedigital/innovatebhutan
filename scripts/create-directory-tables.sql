-- 🔧 DIRECTORY TABLES CREATION SCRIPT
-- Run this in Supabase SQL Editor to create missing directory tables

-- Check if locations table exists, if not create it
CREATE TABLE IF NOT EXISTS locations (
  id serial PRIMARY KEY,
  public_id varchar(50) UNIQUE NOT NULL,
  name varchar(100) NOT NULL,
  district varchar(100),
  dzongkhag varchar(100),
  thromde varchar(100),
  description text,
  coordinates jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- Check if business_categories table exists, if not create it
CREATE TABLE IF NOT EXISTS business_categories (
  id serial PRIMARY KEY,
  public_id varchar(50) UNIQUE NOT NULL,
  name varchar(100) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  icon varchar(50),
  description text,
  parent_id integer REFERENCES business_categories(id),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Check if businesses table exists, if not create it
CREATE TABLE IF NOT EXISTS businesses (
  id serial PRIMARY KEY,
  public_id varchar(50) UNIQUE NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  name varchar(255) NOT NULL,
  tagline varchar(255),
  description text,
  category_id integer REFERENCES business_categories(id),
  location_id integer REFERENCES locations(id),
  phone varchar(50),
  whatsapp varchar(50),
  email varchar(100),
  website text,
  address text,
  coordinates jsonb,
  logo_url text,
  cover_image_url text,
  gallery_urls jsonb,
  owner_id integer,
  client_id integer,
  status varchar(50) DEFAULT 'active',
  type varchar(50) DEFAULT 'external',
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0,
  review_count integer DEFAULT 0,
  meta_title varchar(100),
  meta_description text,
  keywords jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Check if business_hours table exists, if not create it
CREATE TABLE IF NOT EXISTS business_hours (
  id serial PRIMARY KEY,
  business_id integer NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  open_time varchar(10),
  close_time varchar(10),
  is_closed boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Check if business_amenities table exists, if not create it
CREATE TABLE IF NOT EXISTS business_amenities (
  id serial PRIMARY KEY,
  business_id integer NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amenity_type varchar(50) NOT NULL,
  amenity_value varchar(255) NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Check if business_reviews table exists, if not create it
CREATE TABLE IF NOT EXISTS business_reviews (
  id serial PRIMARY KEY,
  public_id varchar(50) UNIQUE NOT NULL,
  business_id integer NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name varchar(255) NOT NULL,
  customer_email varchar(100),
  order_id integer,
  project_id integer,
  is_verified boolean DEFAULT false,
  rating integer NOT NULL,
  title varchar(255),
  comment text NOT NULL,
  response text,
  responded_at timestamp,
  status varchar(50) DEFAULT 'published',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Verify tables were created successfully
SELECT 'Directory tables created successfully!' as status;
SELECT
  table_name as "Created Tables",
  CASE
    WHEN table_name IN ('locations', 'business_categories', 'businesses', 'business_hours', 'business_amenities', 'business_reviews')
    THEN '✅ Directory Table'
    ELSE 'ℹ️  Other Table'
  END as "Table Type"
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('locations', 'business_categories', 'businesses', 'business_hours', 'business_amenities', 'business_reviews')
ORDER BY table_name;