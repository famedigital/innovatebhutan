-- 🏢 INNOVATE BHUTAN — CLIENTS CATALOG
-- Seeded with real enterprise partners

CREATE TABLE "clients" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now()
);

-- Enable RLS
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to clients" ON "clients" FOR SELECT USING (true);

-- 🌱 SEED: Real Innovate Bhutan client roster
INSERT INTO "clients" (name) VALUES
('Chimi Jamyang Pvt Ltd'),
('Baleno'),
('T.T Extra'),
('YOYO Bhutan'),
('Malaya Jewelry'),
('Capital P.M.S'),
('Hayate Ramen'),
('Namsey Medical'),
('Khuenphen Pharmacy'),
('Yangki Enterprise Paro'),
('Idesire'),
('Smilers Bistero'),
('E-World Digital'),
('Shoe Space'),
('Dokar Mart'),
('SPCG'),
('Explore Pizza'),
('Lilly Traders'),
('Urban Dumra'),
('Kuensel Corporation Limited'),
('Zeeling Tshongkhang'),
('DSB Book Store'),
('Paro Canteen'),
('Paro Momo Corner'),
('Zeppo Sales'),
('Shopper''s Store'),
('Daily Chew Cafe'),
('Lhoden Automobile Workshop'),
('Shoponline.Bt'),
('Indra & Kausila Pvt Ltd - Tsirang'),
('Sakten Tours And Treks'),
('Namgay Venture Private Limited'),
('Druk Main Liquor Shop'),
('Burger Point'),
('Druk Pizza Thimphu Zangtoperi');
