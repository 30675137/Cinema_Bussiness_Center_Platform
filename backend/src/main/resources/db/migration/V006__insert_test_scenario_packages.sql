-- Migration: Insert test scenario packages for Taro frontend
-- Feature: 018-hall-reserve-homepage
-- Date: 2025-12-21
-- Description: Inserts 3 published scenario packages with category, rating, and tags for C端小程序首页展示

-- Insert 3 published scenario packages
INSERT INTO scenario_packages (
    id,
    base_package_id,
    version,
    name,
    description,
    background_image_url,
    status,
    is_latest,
    category,
    rating,
    tags,
    created_by
) VALUES
(
    '00000000-0001-0000-0000-000000000001'::uuid,
    NULL,
    1,
    'VIP 生日派对专场',
    '为您打造独一无二的生日派对体验，包含豪华影厅、精美布置和定制服务',
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    'PUBLISHED',
    true,
    'PARTY',
    4.5,
    '["生日", "派对", "VIP", "浪漫"]'::jsonb,
    'system'
),
(
    '00000000-0002-0000-0000-000000000002'::uuid,
    NULL,
    1,
    '企业年会包场',
    '专业的企业活动场地，配备先进的音响和投影设备，适合年会、团建等商务活动',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    'PUBLISHED',
    true,
    'TEAM',
    4.8,
    '["年会", "团建", "商务"]'::jsonb,
    'system'
),
(
    '00000000-0003-0000-0000-000000000003'::uuid,
    NULL,
    1,
    '求婚惊喜专场',
    '打造最浪漫的求婚时刻，提供灯光布置、鲜花装饰和专业摄影服务',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
    'PUBLISHED',
    true,
    'MOVIE',
    5.0,
    '["求婚", "惊喜", "浪漫"]'::jsonb,
    'system'
);

-- Update base_package_id to point to self (first version)
UPDATE scenario_packages
SET base_package_id = id
WHERE base_package_id IS NULL;

-- Insert package pricing for the 3 packages
INSERT INTO package_pricing (
    package_id,
    package_price,
    reference_price_snapshot,
    discount_percentage,
    discount_amount
) VALUES
(
    '00000000-0001-0000-0000-000000000001'::uuid,
    1888.00,
    2500.00,
    24.48,
    612.00
),
(
    '00000000-0002-0000-0000-000000000002'::uuid,
    5888.00,
    7500.00,
    21.49,
    1612.00
),
(
    '00000000-0003-0000-0000-000000000003'::uuid,
    3888.00,
    4999.00,
    22.22,
    1111.00
);

-- Insert package rules for the 3 packages
INSERT INTO package_rules (
    package_id,
    duration_hours,
    min_people,
    max_people
) VALUES
(
    '00000000-0001-0000-0000-000000000001'::uuid,
    2.0,
    10,
    50
),
(
    '00000000-0002-0000-0000-000000000002'::uuid,
    4.0,
    20,
    100
),
(
    '00000000-0003-0000-0000-000000000003'::uuid,
    3.0,
    2,
    20
);

-- Verification queries
SELECT
    id,
    name,
    category,
    status,
    rating,
    tags
FROM scenario_packages
WHERE status = 'PUBLISHED'
ORDER BY created_at DESC;
