-- ============================================================================
-- 0016_cms_content_tables.sql
-- Website CMS - Dynamic Content Management System
-- ============================================================================

-- Services Full Table
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

-- Stats Content Table
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

-- Navigation Links Table
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

-- Website Content Extended Table
CREATE TABLE IF NOT EXISTS website_content_extended (
    id SERIAL PRIMARY KEY,
    page VARCHAR(100) NOT NULL,
    section VARCHAR(100) NOT NULL,
    content_key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    locale VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_content_lookup ON website_content_extended(page, section);

-- Contact Info Extended Table
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

-- Insert Services Data (12 services)
INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Web Development', 'web-development', 'Custom websites built with modern technologies', 'Full-stack web development services including React, Next.js, Node.js, and database integration.', 'Code2', '#3ECF8E', 'from-blue-500', 'to-cyan-500', '["Custom Web Apps", "E-commerce Sites", "API Integration", "CMS Solutions", "Responsive Design"]'::jsonb, '{"starting_from": "Nu.50,000"}'::jsonb, true, 1);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Mobile Apps', 'mobile-apps', 'iOS and Android applications', 'Native and cross-platform mobile app development using React Native, Flutter, and Swift.', 'Smartphone', '#8B5CF6', 'from-purple-500', 'to-pink-500', '["iOS Apps", "Android Apps", "React Native", "Flutter Apps", "UI/UX Design"]'::jsonb, '{"starting_from": "Nu.80,000"}'::jsonb, true, 2);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Cloud Solutions', 'cloud-solutions', 'AWS, Azure, GCP infrastructure', 'Cloud architecture design, deployment, and management for scalable applications.', 'Cloud', '#F59E0B', 'from-orange-500', 'to-yellow-500', '["AWS", "Azure", "Google Cloud", "DevOps", "CI/CD Pipelines"]'::jsonb, '{"starting_from": "Nu.30,000"}'::jsonb, true, 3);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Cybersecurity', 'cybersecurity', 'Protect your digital assets', 'Comprehensive security audits, penetration testing, and security implementation.', 'Shield', '#EF4444', 'from-red-500', 'to-pink-500', '["Security Audits", "Penetration Testing", "Firewall Setup", "DDoS Protection", "Compliance"]'::jsonb, '{"starting_from": "Nu.40,000"}'::jsonb, true, 4);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Data Analytics', 'data-analytics', 'Turn data into insights', 'Business intelligence, data visualization, and predictive analytics solutions.', 'BarChart3', '#10B981', 'from-green-500', 'to-emerald-500', '["Dashboards", "Data Warehousing", "Machine Learning", "Predictive Analytics", "Reports"]'::jsonb, '{"starting_from": "Nu.60,000"}'::jsonb, true, 5);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Digital Marketing', 'digital-marketing', 'Grow your online presence', 'SEO, social media marketing, PPC campaigns, and content strategy.', 'Megaphone', '#EC4899', 'from-pink-500', 'to-rose-500', '["SEO Optimization", "Social Media", "Google Ads", "Content Marketing", "Email Campaigns"]'::jsonb, '{"starting_from": "Nu.25,000"}'::jsonb, true, 6);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('UI/UX Design', 'ui-ux-design', 'Beautiful and functional interfaces', 'User-centered design, prototyping, and complete design systems.', 'Palette', '#A855F7', 'from-purple-500', 'to-violet-500', '["User Research", "Wireframing", "Prototyping", "Design Systems", "Usability Testing"]'::jsonb, '{"starting_from": "Nu.35,000"}'::jsonb, true, 7);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('IT Consulting', 'it-consulting', 'Expert technology guidance', 'Strategic IT planning, technology stack selection, and digital transformation.', 'Users', '#06B6D4', 'from-blue-600', 'to-blue-400', '["Tech Strategy", "Digital Transformation", "Process Optimization", "Team Training", "Vendor Assessment"]'::jsonb, '{"starting_from": "Nu.45,000"}'::jsonb, true, 8);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Network Infrastructure', 'network-infrastructure', 'Reliable connectivity solutions', 'Network design, installation, and maintenance for businesses of all sizes.', 'Network', '#0EA5E9', 'from-sky-500', 'to-blue-400', '["Office Networks", "Server Setup", "WiFi Solutions", "CCTV Installation", "Fiber Optics"]'::jsonb, '{"starting_from": "Nu.20,000"}'::jsonb, true, 9);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Software Development', 'software-development', 'Custom software solutions', 'Tailored software development to solve your unique business challenges.', 'Terminal', '#F97316', 'from-orange-600', 'to-amber-500', '["SaaS Products", "Enterprise Software", "API Development", "Legacy Modernization", "Automation"]'::jsonb, '{"starting_from": "Nu.70,000"}'::jsonb, true, 10);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('Database Management', 'database-management', 'Efficient data storage solutions', 'Database design, optimization, and management for high-performance applications.', 'Database', '#14B8A6', 'from-teal-500', 'to-emerald-500', '["PostgreSQL", "MySQL", "MongoDB", "Redis", "Data Migration"]'::jsonb, '{"starting_from": "Nu.35,000"}'::jsonb, true, 11);

INSERT INTO services_full (title, slug, short_description, description, icon_name, icon_color, gradient_from, gradient_to, features, pricing_details, is_active, display_order) VALUES
('QA & Testing', 'qa-testing', 'Ensure quality delivery', 'Comprehensive testing services including manual, automated, and performance testing.', 'CheckCircle2', '#22C55E', 'from-green-600', 'to-lime-500', '["Manual Testing", "Automation", "Performance Testing", "Security Testing", "Test Plans"]'::jsonb, '{"starting_from": "Nu.25,000"}'::jsonb, true, 12);

-- Insert Stats Data
INSERT INTO stats_content (label, value, description, icon_name, icon_color, color_from, color_to, bg_gradient, display_order) VALUES
('Projects Delivered', '500+', 'Successfully completed projects across various industries', 'Rocket', '#3ECF8E', 'from-green-500', 'to-emerald-500', 'from-green-50 to-emerald-50', 1);

INSERT INTO stats_content (label, value, description, icon_name, icon_color, color_from, color_to, bg_gradient, display_order) VALUES
('Happy Clients', '98%', 'Client satisfaction and retention rate', 'Heart', '#EF4444', 'from-red-500', 'to-pink-500', 'from-red-50 to-pink-50', 2);

INSERT INTO stats_content (label, value, description, icon_name, icon_color, color_from, color_to, bg_gradient, display_order) VALUES
('Years Experience', '12+', 'Industry expertise and technical excellence', 'Award', '#F59E0B', 'from-orange-500', 'to-yellow-500', 'from-orange-50 to-yellow-50', 3);

INSERT INTO stats_content (label, value, description, icon_name, icon_color, color_from, color_to, bg_gradient, display_order) VALUES
('Team Members', '50+', 'Skilled professionals across all domains', 'Users', '#8B5CF6', 'from-purple-500', 'to-violet-500', 'from-purple-50 to-violet-50', 4);

-- Insert Navigation Data
INSERT INTO navigation_links (label, url, icon_name, badge, open_in_new_tab, display_order) VALUES
('Home', '/', 'Home2', NULL, false, 1);

INSERT INTO navigation_links (label, url, icon_name, badge, open_in_new_tab, display_order) VALUES
('Services', '/services', 'Layers', NULL, false, 2);

INSERT INTO navigation_links (label, url, icon_name, badge, open_in_new_tab, display_order) VALUES
('Company', '/company', 'Building2', NULL, false, 3);

INSERT INTO navigation_links (label, url, icon_name, badge, open_in_new_tab, display_order) VALUES
('Directory', '/directory', 'Directory', 'Live', false, 4);

INSERT INTO navigation_links (label, url, icon_name, badge, open_in_new_tab, display_order) VALUES
('Support', '/support', 'HeadphonesIcon', NULL, false, 5);

INSERT INTO navigation_links (label, url, icon_name, badge, open_in_new_tab, display_order) VALUES
('Login', '/login', 'LogIn', NULL, false, 6);

-- Insert Website Content
INSERT INTO website_content_extended (page, section, content_key, value, type) VALUES
('home', 'hero', 'main_heading', 'Bhutan''s Tomorrow, Delivered Today', 'text');

INSERT INTO website_content_extended (page, section, content_key, value, type) VALUES
('home', 'hero', 'sub_heading', 'Transform your business with innovative technology solutions tailored for the Himalayan kingdom.', 'text');

INSERT INTO website_content_extended (page, section, content_key, value, type) VALUES
('home', 'hero', 'cta_text', 'Get Free Consultation', 'text');

INSERT INTO website_content_extended (page, section, content_key, value, type) VALUES
('home', 'hero', 'cta_link', '/contact', 'text');

-- Insert Contact Info
INSERT INTO contact_info_extended (info_type, label, value, display_order) VALUES
('phone', 'Thimphu Office', '+975 2 12345', 1);

INSERT INTO contact_info_extended (info_type, label, value, display_order) VALUES
('phone', 'Paro Branch', '+975 8 54321', 2);

INSERT INTO contact_info_extended (info_type, label, value, display_order) VALUES
('email', 'General Inquiries', 'hello@innovatebhutan.bt', 3);

INSERT INTO contact_info_extended (info_type, label, value, display_order) VALUES
('email', 'Support', 'support@innovatebhutan.bt', 4);

INSERT INTO contact_info_extended (info_type, label, value, display_order) VALUES
('address', 'Main Office', 'Thimphu Tech Park, Babesa, Thimphu, Bhutan', 5);

INSERT INTO contact_info_extended (info_type, label, value, display_order) VALUES
('working_hours', 'Weekdays', '9:00 AM - 6:00 PM', 6);

INSERT INTO contact_info_extended (info_type, label, value, display_order) VALUES
('working_hours', 'Saturday', '10:00 AM - 2:00 PM', 7);
