-- 🛰️ BHUTAN-UNITY SCHEMA INITIALIZATION
-- Calibrated for High-Density Enterprise Operations

CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"tagline" text,
	"description" text,
	"price" numeric(12, 2),
	"currency" varchar(10) DEFAULT 'Nu.',
	"image_url" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "services_public_id_unique" UNIQUE("public_id")
);

CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_phone" varchar(50) NOT NULL,
	"customer_location" varchar(255),
	"status" varchar(50) DEFAULT 'pending',
	"total_amount" numeric(15, 2) NOT NULL,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer REFERENCES orders(id),
	"service_id" integer REFERENCES services(id),
	"quantity" integer DEFAULT 1,
	"unit_price" numeric(12, 2) NOT NULL
);

-- 🛡️ SECURITY LAYER: ENABLE RLS
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;

-- 🔓 PUBLIC ACCESS POLICIES
CREATE POLICY "Allow public read access to services" ON "services" FOR SELECT USING (true);
CREATE POLICY "Allow public order creation" ON "orders" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public order item creation" ON "order_items" FOR INSERT WITH CHECK (true);

-- 🌱 SEEDING THE SERVICE CATALOG (Cloudinary Integrated)
INSERT INTO "services" (public_id, name, category, tagline, description, price, image_url) VALUES
('pos_engineering', 'POS Systems Engineering', 'POS Systems', 'Precision retail & hospitality hardware.', 'Enterprise-grade point of sale solutions with cloud sync.', 45000, 'innovate_bhutan/pos_engineering'),
('security_ai_node', 'Security AI Node', 'Security', 'Next-gen surveillance architecture.', 'AI-driven security monitoring and threat detection.', 25000, 'innovate_bhutan/security_ai_node'),
('network_flow', 'Network Flow Hub', 'Networking', 'High-speed fiber & mesh mapping.', 'Enterprise-grade networking and infrastructure mapping.', 15000, 'innovate_bhutan/network_flow'),
('hospitality_tech', 'Hospitality Tech Stack', 'POS Systems', 'Full-suite hotel & restaurant PMS.', 'Advanced property management systems for the kingdom.', 85000, 'innovate_bhutan/hospitality_tech'),
('software_dev', 'Custom Software Forge', 'Web/SaaS', 'Tailor-made Bhutanese enterprise apps.', 'Bespoke software development for local businesses.', 120000, 'innovate_bhutan/software_dev'),
('biometric_id', 'Biometric ID Matrix', 'Security', 'Fingerprint & Facial ID integration.', 'Modern biometric identification systems.', 35000, 'innovate_bhutan/biometric_id'),
('power_resilience', 'Power Resilience Node', 'Maintenance', 'UPS & Solar infrastructure.', 'Robust power backup and solar energy solutions.', 55000, 'innovate_bhutan/power_resilience'),
('surveillance_ai', 'Surveillance AI Matrix', 'Security', 'Deep-learning camera networks.', 'Advanced camera systems with AI analysis.', 45000, 'innovate_bhutan/surveillance_ai');
