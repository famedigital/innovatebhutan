-- ============================================================================
-- 0016_cms_content_tables.sql
-- Website CMS - Dynamic Content Management System
-- ============================================================================

-- ============================================================================
-- SERVICES FULL TABLE (Complete service details for ServiceDirectory)
-- ============================================================================

CREATE TABLE IF NOT EXISTS services_full (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    icon_name VARCHAR(100),
    icon_color VARCHAR(50),
    gradient_from VARCHAR(50),
    gradient_to VARCHAR(50),
    features JSONB,
    pricing_details JSONB,
    gallery_images TEXT[],
    video_url TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_full_slug ON services_full(slug);
CREATE INDEX IF NOT EXISTS idx_services_full_active ON services_full(is_active);
CREATE INDEX IF NOT EXISTS idx_services_full_order ON services_full(display_order);

-- Insert existing services from hardcoded data
-- Note: These may fail if already exists, which is fine
INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Web Development', 'web-development', 'Custom websites built with modern technologies', 'Full-stack web development services including React, Next.js, Node.js, and database integration.', 'Code2', '#3ECF8E', 'from-blue-500', 'to-cyan-500', '["Custom Web Apps", "E-commerce Sites", "API Integration", "CMS Solutions", "Responsive Design"]'::jsonb, '{"starting_from": "Nu.50,000"}'::jsonb, true, 1);


-- ============================================================================
-- STATS CONTENT TABLE (Statistics for StatsSection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stats_content (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    value VARCHAR(50) NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    icon_color VARCHAR(50),
    color_from VARCHAR(50),
    color_to VARCHAR(50),
    bg_gradient VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stats_content_active ON stats_content(is_active);
CREATE INDEX IF NOT EXISTS idx_stats_content_order ON stats_content(display_order);

-- Insert existing stats from hardcoded data
INSERT INTO stats_content (label, value, description, icon_name, icon_color, color_from, color_to, bg_gradient, display_order) VALUES
('Projects Delivered', '500+', 'Successfully completed projects across various industries', 'Rocket', '#3ECF8E', 'from-green-500', 'to-emerald-500', 'from-green-50 to-emerald-50', 1),
('Happy Clients', '98%', 'Client satisfaction and retention rate', 'Heart', '#EF4444', 'from-red-500', 'to-pink-500', 'from-red-50 to-pink-50', 2),
('Years Experience', '12+', 'Industry expertise and technical excellence', 'Award', '#F59E0B', 'from-orange-500', 'to-yellow-500', 'from-orange-50 to-yellow-50', 3),
('Team Members', '50+', 'Skilled professionals across all domains', 'Users', '#8B5CF6', 'from-purple-500', 'to-violet-500', 'from-purple-50 to-violet-50', 4)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NAVIGATION LINKS TABLE (Menu structure for Navigation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS navigation_links (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    parent_id INTEGER REFERENCES navigation_links(id) ON DELETE CASCADE,
    icon_name VARCHAR(100),
    icon_color VARCHAR(50),
    badge TEXT,
    badge_color VARCHAR(50),
    open_in_new_tab BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_navigation_parent ON navigation_links(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_active ON navigation_links(is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_order ON navigation_links(display_order);

-- Insert existing navigation structure
INSERT INTO navigation_links (label, url, parent_id, icon_name, badge, open_in_new_tab, display_order) VALUES
('Home', '/', NULL, 'Home2', NULL, false, 1),
('Services', '/services', NULL, 'Layers', NULL, false, 2),
('Company', '/company', NULL, 'Building2', NULL, false, 3),
('Directory', '/directory', NULL, 'Directory', 'Live', false, 4),
('Support', '/support', NULL, 'HeadphonesIcon', NULL, false, 5),
('Login', '/login', NULL, 'LogIn', NULL, false, 6)
ON CONFLICT (url) DO NOTHING;

-- ============================================================================
-- WEBSITE CONTENT TABLE (Extended for flexible content storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS website_content_extended (
    id SERIAL PRIMARY KEY,
    page VARCHAR(100) NOT NULL,
    section VARCHAR(100) NOT NULL,
    content_key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    locale VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(page, section, content_key, locale)
);

CREATE INDEX IF NOT EXISTS idx_website_content_page ON website_content_extended(page);
CREATE INDEX IF NOT EXISTS idx_website_content_section ON website_content_extended(section);
CREATE INDEX IF NOT EXISTS idx_website_content_lookup ON website_content_extended(page, section);

-- Insert initial homepage content
INSERT INTO website_content_extended (page, section, content_key, value, type) VALUES
('home', 'hero', 'main_heading', 'Bhutan''s Tomorrow, Delivered Today', 'text'),
('home', 'hero', 'sub_heading', 'Transform your business with innovative technology solutions tailored for the Himalayan kingdom.', 'text'),
('home', 'hero', 'cta_text', 'Get Free Consultation', 'text'),
('home', 'hero', 'cta_link', '/contact', 'text'),
('home', 'contact', 'phone_primary', '+975 2 12345', 'text'),
('home', 'contact', 'phone_secondary', '+975 8 54321', 'text'),
('home', 'contact', 'email', 'hello@innovatebhutan.bt', 'text'),
('home', 'contact', 'address', 'Thimphu Tech Park, Babesa, Thimphu, Bhutan', 'text'),
('home', 'footer', 'copyright', '© 2024 Innovate Bhutan. All rights reserved.', 'text')
ON CONFLICT (page, section, content_key, locale) DO NOTHING;

-- ============================================================================
-- CONTACT INFO TABLE (Extended contact information)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_info_extended (
    id SERIAL PRIMARY KEY,
    info_type VARCHAR(50) NOT NULL,
    label VARCHAR(100),
    value TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_info_type ON contact_info_extended(info_type);
CREATE INDEX IF NOT EXISTS idx_contact_info_active ON contact_info_extended(is_active);

-- Insert contact information
INSERT INTO contact_info_extended (info_type, label, value, display_order) VALUES
('phone', 'Thimphu Office', '+975 2 12345', 1),
('phone', 'Paro Branch', '+975 8 54321', 2),
('email', 'General Inquiries', 'hello@innovatebhutan.bt', 3),
('email', 'Support', 'support@innovatebhutan.bt', 4),
('address', 'Main Office', 'Thimphu Tech Park, Babesa, Thimphu 11001, Bhutan', 5),
('working_hours', 'Weekdays', '9:00 AM - 6:00 PM', 6),
('working_hours', 'Saturday', '10:00 AM - 2:00 PM', 7)
ON CONFLICT DO NOTHING;
