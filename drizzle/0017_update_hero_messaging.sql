-- Update hero content with new professional marketing positioning
UPDATE hero_content 
SET 
    headline = 'Your Complete Technology Partner',
    subheadline = 'From Custom Software to Complete IT Operations',
    description = 'We build what your business needs. Custom software development. Ready-to-use products. Complete IT operations. 350+ businesses across Bhutan trust us with their digital transformation.',
    primary_cta_text = 'Explore Our Services',
    primary_cta_link = '/services',
    secondary_cta_text = 'Get Free Consultation',
    secondary_cta_link = 'https://wa.me/97517344444',
    show_trust_indicators = true,
    client_count = 350,
    years_in_business = 15,
    featured_products = '[
        {
            "name": "POS Systems",
            "description": "Complete retail & restaurant management",
            "icon": "shopping-cart",
            "url": "/services#pos"
        },
        {
            "name": "Real Estate Software",
            "description": "Property management & CRM",
            "icon": "building",
            "url": "/services#realestate"
        },
        {
            "name": "E-commerce Platform",
            "description": "Sell online with confidence",
            "icon": "shopping-bag",
            "url": "/services#ecommerce"
        },
        {
            "name": "Hotel Management",
            "description": "Complete property solutions",
            "icon": "home",
            "url": "/services#hotel"
        },
        {
            "name": "Security & Surveillance",
            "description": "CCTV & access control systems",
            "icon": "shield",
            "url": "/services#security"
        },
        {
            "name": "Custom Development",
            "description": "Web, mobile & SaaS applications",
            "icon": "code",
            "url": "/services#custom"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE is_active = true;

-- Verify the update
SELECT 
    headline,
    subheadline,
    primary_cta_text,
    secondary_cta_text,
    client_count,
    years_in_business
FROM hero_content 
WHERE is_active = true;
