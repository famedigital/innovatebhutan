-- Migration: 0017_hero_content_table.sql
-- Description: Add admin-editable hero content table with video integration support
-- Created: 2026-05-24

-- Create hero_content table for CMS-manageable hero section
CREATE TABLE IF NOT EXISTS hero_content (
    id SERIAL PRIMARY KEY,
    is_active BOOLEAN DEFAULT true NOT NULL,

    -- Main messaging
    headline VARCHAR(255) NOT NULL,
    subheadline TEXT,
    description TEXT,

    -- CTAs
    primary_cta_text VARCHAR(100),
    primary_cta_link VARCHAR(500),
    secondary_cta_text VARCHAR(100),
    secondary_cta_link VARCHAR(500),

    -- Video settings (Cloudinary)
    video_cloudinary_id VARCHAR(255), -- Video public ID
    video_poster_image_id VARCHAR(255), -- Poster/thumbnail image ID
    enable_video_background BOOLEAN DEFAULT false,

    -- Visual settings
    gradient_from VARCHAR(50) DEFAULT '#10B981',
    gradient_to VARCHAR(50) DEFAULT '#3B82F6',
    overlay_opacity DECIMAL(3, 2) DEFAULT 0.7,

    -- Trust indicators
    show_trust_indicators BOOLEAN DEFAULT true,
    client_count INTEGER DEFAULT 350,
    years_in_business INTEGER DEFAULT 12,

    -- Featured products showcase
    featured_products JSONB, -- Array of product highlights

    -- Display settings
    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_hero_content_active ON hero_content(is_active);
CREATE INDEX idx_hero_content_order ON hero_content(display_order);

-- Insert default hero content
INSERT INTO hero_content (
    headline,
    subheadline,
    description,
    primary_cta_text,
    primary_cta_link,
    secondary_cta_text,
    secondary_cta_link,
    video_cloudinary_id,
    video_poster_image_id,
    enable_video_background,
    show_trust_indicators,
    client_count,
    years_in_business,
    featured_products,
    display_order
) VALUES (
    'Your Complete Technology Partner',
    'From Custom Software to Complete IT Operations',
    'We build what your business needs. Custom software. Ready products. Complete IT operations. 350+ businesses trust us.',
    'Explore Services',
    '/services',
    'Get Free Quote',
    'https://wa.me/97512345678',
    'rancelab-showcase', -- Placeholder video ID
    'hero-poster', -- Placeholder poster image ID
    true, -- Enable video background when video is available
    true, -- Show trust indicators
    350, -- Client count
    12, -- Years in business
    '[
        {
            "name": "POS Systems",
            "description": "Complete retail management",
            "icon": "shopping-cart"
        },
        {
            "name": "Real Estate Software",
            "description": "Property management simplified",
            "icon": "building"
        },
        {
            "name": "E-commerce Platform",
            "description": "Sell online with confidence",
            "icon": "shopping-bag"
        }
    ]'::jsonb,
    0
);

-- Add comment for documentation
COMMENT ON TABLE hero_content IS 'Admin-editable hero section content with video integration support';
COMMENT ON COLUMN hero_content.video_cloudinary_id IS 'Cloudinary public ID for hero background video';
COMMENT ON COLUMN hero_content.video_poster_image_id IS 'Cloudinary public ID for video poster image';
COMMENT ON COLUMN hero_content.featured_products IS 'JSON array of featured products to showcase';
COMMENT ON COLUMN hero_content.overlay_opacity IS 'Video overlay opacity (0.0 to 1.0) for text readability';