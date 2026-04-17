-- ==========================================
-- UPDATE SERVICES TO 12 MAIN SERVICES
-- ==========================================
-- This script updates the services table to reflect
-- the new 12 main services structure with sub-services

-- 1. Update "Brochure & Catalogue Design" to "GST Services"
UPDATE services
SET
  name = 'GST Services',
  public_id = 'gst-services',
  category = 'Business Services',
  tagline = 'GST Registration & Compliance',
  description = 'Complete GST registration, filing, and compliance services for businesses in Bhutan. We handle all your tax needs efficiently.'
WHERE name LIKE '%Brochure%Catalogue%';

-- 2. Update POS-related services to be grouped
-- Retail POS becomes a sub-service of POS Solutions
-- This is conceptual - in the UI we show POS Solutions as main with Retail/Restaurant as subs

-- 3. Update categories for consistency
UPDATE services SET category = 'POS Systems' WHERE name IN ('Retail POS', 'Restaurant POS', 'Hotel PMS');
UPDATE services SET category = 'Web/SaaS' WHERE name IN ('Web Development', 'SaaS Development', 'ERP Development', 'Mobile App Dev');
UPDATE services SET category = 'Infrastructure' WHERE name IN ('Hardware Solutions', 'Network Infrastructure', 'Power Solution (Inverter)');
UPDATE services SET category = 'Security' WHERE name IN ('Security Systems', 'Anti Theft System');
UPDATE services SET category = 'Maintenance' WHERE name = 'Technical Maintenance';
UPDATE services SET category = 'Business Services' WHERE name IN ('Payroll & HR Whitelabel', 'GST Services');

-- 4. Add IT Consulting as a new service if it doesn't exist
INSERT INTO services (public_id, name, category, tagline, description, price, currency)
VALUES (
  'it-consulting',
  'IT Consulting',
  'Business Services',
  'Expert IT Guidance',
  'Professional IT consulting services to help your business make the right technology decisions. From infrastructure planning to digital transformation strategy.',
  'Consultation',
  'Nu.'
)
ON CONFLICT (public_id) DO NOTHING;

-- Verify the update
SELECT category, COUNT(*) as count, STRING_AGG(name, ', ' ORDER BY name) as services
FROM services
GROUP BY category
ORDER BY category;
