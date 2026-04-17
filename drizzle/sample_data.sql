-- Sample data for directory testing
-- Run this after the main migration to populate with test data

-- Insert Locations
INSERT INTO locations (public_id, name, district, dzongkhag, description, is_active, display_order) VALUES
('loc_001', 'Thimphu', 'Thimphu District', 'Thimphu', 'Capital city and largest business hub', true, 1),
('loc_002', 'Paro', 'Paro District', 'Paro', 'Historic town known for tourism and traditional crafts', true, 2),
('loc_003', 'Punakha', 'Punakha District', 'Punakha', 'Ancient capital with thriving agriculture and eco-tourism', true, 3),
('loc_004', 'Wangdue', 'Wangdue Phodrang', 'Wangdue Phodrang', 'Gateway town connecting western and central Bhutan', true, 4),
('loc_005', 'Other Locations', 'Various', 'Various', 'Other regions and districts', true, 5);

-- Insert Categories
INSERT INTO business_categories (public_id, name, slug, icon, description, is_active, display_order) VALUES
('cat_001', 'IT Services', 'it-services', 'Zap', 'Enterprise IT solutions and networking', true, 1),
('cat_002', 'Software', 'software', 'Code', 'Custom software development and applications', true, 2),
('cat_003', 'Security', 'security', 'Shield', 'Security systems and surveillance', true, 3),
('cat_004', 'Networking', 'networking', 'Globe', 'Network infrastructure and connectivity', true, 4),
('cat_005', 'Hardware', 'hardware', 'Monitor', 'Hardware solutions and equipment', true, 5),
('cat_006', 'Consulting', 'consulting', 'Users', 'Business consulting and advisory services', true, 6);

-- Insert Businesses
INSERT INTO businesses (public_id, slug, name, tagline, description, category_id, location_id, phone, whatsapp, email, website, address, logo_url, cover_image_url, status, type, is_verified, is_featured, rating, review_count) VALUES
-- Tech Solutions Bhutan (Featured, Verified)
('biz_001', 'tech-solutions-bhutan', 'Tech Solutions Bhutan', 'Premier IT Services Provider',
'Complete enterprise IT solutions including networking, security, and software development for businesses across Bhutan.',
1, 1, '+975 17268753', '+975 17268753', 'info@techsolutions.bt', 'https://techsolutions.bt',
'Changangkha Lhakhang Road, Thimphu, Bhutan',
'https://ui-avatars.com/api/?name=Tech+Solutions&background=10B981&color=fff&size=200',
'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=400&fit=crop',
'active', 'client', true, true, 4.8, 124),

-- Digital Transformations (Featured, Verified)
('biz_002', 'digital-transformations', 'Digital Transformations', 'Custom Software Development',
'Bespoke software solutions for Bhutanese businesses, from ERP systems to mobile applications and cloud integration.',
2, 2, '+975 17268753', '+975 17268753', 'hello@digitaltransformations.bt', 'https://digitaltransformations.bt',
'Lamgong Road, Paro, Bhutan',
'https://ui-avatars.com/api/?name=Digital+Transformations&background=8B5CF6&color=fff&size=200',
'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop',
'active', 'client', true, true, 4.9, 89),

-- SecureNet Bhutan (Verified)
('biz_003', 'securenet-bhutan', 'SecureNet Bhutan', 'Security & Surveillance Experts',
'CCTV installation, security systems, and surveillance solutions for businesses and residential properties.',
3, 3, '+975 17268753', '+975 17268753', 'security@securenet.bt', 'https://securenet.bt',
'Main Street, Punakha, Bhutan',
'https://ui-avatars.com/api/?name=SecureNet+Bhutan&background=F59E0B&color=fff&size=200',
'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=400&fit=crop',
'active', 'external', true, false, 4.7, 67),

-- Himalayan Networks (Verified)
('biz_004', 'himalayan-networks', 'Himalayan Networks', 'Connectivity Solutions',
'Fiber internet, network infrastructure, and enterprise connectivity solutions for modern businesses.',
4, 1, '+975 17268753', '+975 17268753', 'info@himalayannetworks.bt', 'https://himalayannetworks.bt',
'Norzin Lam, Thimphu, Bhutan',
'https://ui-avatars.com/api/?name=Himalayan+Networks&background=3B82F6&color=fff&size=200',
'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=400&fit=crop',
'active', 'external', true, false, 4.6, 45),

-- Bhutan Hardware (Verified)
('biz_005', 'bhutan-hardware', 'Bhutan Hardware', 'Hardware Solutions',
'Computer hardware, servers, networking equipment, and IT infrastructure supplies.',
5, 1, '+975 17268753', '+975 17268753', 'sales@bhutanhardware.bt', 'https://bhutanhardware.bt',
'Changangkha Road, Thimphu, Bhutan',
'https://ui-avatars.com/api/?name=Bhutan+Hardware&background=EF4444&color=fff&size=200',
'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=400&fit=crop',
'active', 'external', true, false, 4.5, 38),

-- Tech Innovations (New, pending verification)
('biz_006', 'tech-innovations', 'Tech Innovations', 'Emerging Technology Solutions',
'Blockchain, AI, and emerging technology consulting for forward-thinking businesses.',
1, 4, '+975 17268753', '+975 17268753', 'info@techinnovations.bt', 'https://techinnovations.bt',
'Wangdue Town, Wangdue Phodrang, Bhutan',
'https://ui-avatars.com/api/?name=Tech+Innovations&background=8B5CF6&color=fff&size=200',
'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=400&fit=crop',
'active', 'external', false, false, 0, 0);

-- Insert Business Hours
INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed) VALUES
-- Tech Solutions Bhutan
(1, 1, '09:00', '18:00', false), -- Monday
(1, 2, '09:00', '18:00', false), -- Tuesday
(1, 3, '09:00', '18:00', false), -- Wednesday
(1, 4, '09:00', '18:00', false), -- Thursday
(1, 5, '09:00', '18:00', false), -- Friday
(1, 6, '10:00', '14:00', false), -- Saturday
(1, 0, '00:00', '00:00', true),  -- Sunday closed

-- Digital Transformations
(2, 1, '09:00', '18:00', false),
(2, 2, '09:00', '18:00', false),
(2, 3, '09:00', '18:00', false),
(2, 4, '09:00', '18:00', false),
(2, 5, '09:00', '18:00', false),
(2, 6, '10:00', '14:00', false),
(2, 0, '00:00', '00:00', true);

-- Insert Sample Reviews
INSERT INTO business_reviews (public_id, business_id, customer_name, customer_email, is_verified, rating, title, comment, status) VALUES
('rev_001', 1, 'Dorji Wangmo', 'dorji.wangmo@example.com', true, 5,
'Tech Solutions transformed our business!',
'Excellent service and professional team. They upgraded our entire network infrastructure and the results have been amazing. Highly recommended for any business looking for IT solutions.', 'published'),

('rev_002', 1, 'Karma Tshering', 'karma.tshering@example.com', true, 4,
'Reliable IT partner',
'We have been working with Tech Solutions for 3 years now. They provide consistent quality and good response times for support issues. Would definitely recommend.', 'published'),

('rev_003', 1, 'Pema Lhamo', 'pema.lhamo@example.com', true, 5,
'Best IT company in Bhutan',
'Professional, knowledgeable, and always deliver on time. They developed our ERP system and it has been working flawlessly. Great communication throughout the project.', 'published'),

('rev_004', 2, 'Tashi Dorji', 'tashi.dorji@example.com', true, 5,
'Outstanding software development',
'Digital Transformations delivered our custom inventory management system on time and within budget. The team is highly skilled and easy to work with. Very impressed with their work!', 'published'),

('rev_005', 2, 'Sonam Choden', 'sonam.choden@example.com', true, 4,
'Great mobile app development',
'They built our company mobile app and it has been working great. Good communication and technical expertise. Would work with them again for future projects.', 'published'),

('rev_006', 3, 'Wangchuck Norbu', 'wangchuck.norbu@example.com', false, 5,
'Professional security installation',
'SecureNet Bhutan installed CCTV systems at our office and warehouse. Very professional installation and the system works perfectly. Fair pricing for the quality of equipment used.', 'published'),

('rev_007', 3, 'Dechen Wangmo', 'dechen.wangmo@example.com', true, 4,
'Reliable security solutions',
'Good security systems and prompt service. They responded quickly when we needed to expand our surveillance coverage. Satisfied with their work.', 'published');

-- Insert Business Amenities
INSERT INTO business_amenities (business_id, amenity_type, amenity_value) VALUES
(1, 'service_area', 'Nationwide'),
(1, 'emergency_support', '24/7'),
(1, 'certifications', 'ISO 27001, Microsoft Partner, Cisco Certified'),
(1, 'languages', 'English, Dzongkha'),
(1, 'payment_methods', 'Cash, Bank Transfer, Online Payment'),

(2, 'service_area', 'Nationwide'),
(2, 'emergency_support', 'Business Hours'),
(2, 'certifications', 'Microsoft Gold Partner, Google Cloud Partner'),
(2, 'languages', 'English, Dzongkha'),
(2) = ('payment_methods', 'Cash, Bank Transfer, Online Payment'),

(3, 'service_area', 'Western Bhutan'),
(3, 'emergency_support', '24/7'),
(3, 'certifications', 'Security Industry Certified'),
(3, 'languages', 'English, Dzongkha'),
(3, 'payment_methods', 'Cash, Bank Transfer');

-- Display summary
SELECT 'Directory sample data loaded successfully!' as status;
SELECT COUNT(*) as locations_count FROM locations;
SELECT COUNT(*) as categories_count FROM business_categories;
SELECT COUNT(*) as businesses_count FROM businesses;
SELECT COUNT(*) as reviews_count FROM business_reviews;
SELECT COUNT(*) as hours_count FROM business_hours;
SELECT COUNT(*) as amenities_count FROM business_amenities;