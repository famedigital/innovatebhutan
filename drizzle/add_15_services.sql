-- Add 15 services to the services table for Innovates.bt
-- Run this in Supabase SQL Editor

-- POS Systems
INSERT INTO services (public_id, name, category, tagline, description, currency, image_url) VALUES
  ('retail-pos', 'Retail POS', 'POS Systems', 'Complete Retail Management Solution', 'Advanced Point of Sale system for retail stores with inventory management, sales tracking, and customer loyalty programs.', 'Nu.', 'innovate_bhutan/pos_systems_video'),
  ('restaurant-pos', 'Restaurant POS', 'POS Systems', 'Restaurant Management System', 'POS solution for restaurants with table management, KOT integration, and kitchen display systems.', 'Nu.', 'innovate_bhutan/pos_systems_video'),
  ('hotel-pms', 'Hotel PMS', 'POS Systems', 'Property Management System', 'Complete hotel management with room booking, check-in/check-out, guest management, and billing.', 'Nu.', 'innovate_bhutan/hotelpms'),

-- Web/SaaS
  ('web-development', 'Web Development', 'Web/SaaS', 'Custom Web Development', 'Professional website development with modern technologies, responsive design, and SEO optimization.', 'Nu.', 'innovate_bhutan/services_main_hero'),
  ('saas-development', 'SaaS Development', 'Web/SaaS', 'SaaS Application Development', 'End-to-end SaaS product development from concept to deployment with scalable architecture.', 'Nu.', 'innovate_bhutan/services_main_hero'),
  ('erp-development', 'ERP Development', 'Web/SaaS', 'Enterprise Resource Planning', 'Custom ERP solutions to streamline business operations, inventory, and financial management.', 'Nu.', 'innovate_bhutan/services_main_hero'),
  ('payroll-hr', 'Payroll & HR Whitelabel', 'Web/SaaS', 'Payroll & HR Management', 'Complete payroll and HR solution with whitelabel options for your business.', 'Nu.', 'innovate_bhutan/services_main_hero'),
  ('mobile-app-dev', 'Mobile App Dev', 'Web/SaaS', 'Mobile Application Development', 'Native and cross-platform mobile app development for iOS and Android.', 'Nu.', 'innovate_bhutan/services_main_hero'),
  ('brochure-design', 'Brochure & Catalogue Design', 'Web/SaaS', 'Digital Design Services', 'Professional brochure and catalogue design services for marketing your business.', 'Nu.', 'innovate_bhutan/services_main_hero'),

-- Hardware & Maintenance
  ('hardware-solutions', 'Hardware Solutions', 'Maintenance', 'Hardware Sales & Services', 'Complete hardware solutions including sales, installation, and maintenance.', 'Nu.', 'innovate_bhutan/hardware'),
  ('technical-maintenance', 'Technical Maintenance', 'Maintenance', 'Technical Support Services', 'Comprehensive technical maintenance and support for all your IT infrastructure.', 'Nu.', 'innovate_bhutan/tech_maintaince'),

-- Security
  ('security-systems', 'Security Systems', 'Security', 'Security & Surveillance', 'CCTV, alarm systems, and complete security solutions for homes and businesses.', 'Nu.', 'innovate_bhutan/cctv'),
  ('anti-theft', 'Anti Theft System', 'Security', 'Advanced Anti-Theft Systems', 'State-of-the-art anti-theft systems with real-time monitoring, motion detection, and instant alerts.', 'Nu.', 'innovate_bhutan/cctv'),

-- Networking
  ('network-infrastructure', 'Network Infrastructure', 'Networking', 'Network Solutions', 'Complete network infrastructure design, installation, and maintenance for offices.', 'Nu.', 'innovate_bhutan/hardware1'),

-- Power
  ('power-inverter', 'Power Solution (Inverter)', 'Power', 'Power Backup Solutions', 'Professional inverter installation and maintenance for uninterrupted power supply.', 'Nu.', 'innovate_bhutan/hardware')

ON CONFLICT (public_id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  currency = EXCLUDED.currency,
  image_url = EXCLUDED.image_url;
