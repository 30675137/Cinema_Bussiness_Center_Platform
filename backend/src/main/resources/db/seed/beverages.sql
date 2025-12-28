/**
 * @spec O003-beverage-order
 * 饮品种子数据
 *
 * 说明:
 * - 此脚本用于初始化饮品菜单数据
 * - 包含多种分类的饮品（咖啡、茶饮、果汁、奶昔、奶茶）
 * - 每个饮品包含多种规格（大小、温度、甜度、配料）
 * - 手动执行: psql -U postgres -d your_database -f beverages.sql
 */

-- ==================== 咖啡类饮品 ====================

-- 美式咖啡
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '美式咖啡',
    '经典美式咖啡，口感醇厚，回味悠长',
    'COFFEE',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/americano.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/americano-detail-1.jpg"]'::jsonb,
    18.00,
    '{"calories": 10, "caffeine": "高"}'::jsonb,
    'ACTIVE',
    true,
    100,
    NOW(),
    NOW()
);

-- 拿铁咖啡
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '拿铁咖啡',
    '浓缩咖啡与蒸奶的完美融合，口感丝滑',
    'COFFEE',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/latte.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/latte-detail-1.jpg"]'::jsonb,
    22.00,
    '{"calories": 150, "caffeine": "中"}'::jsonb,
    'ACTIVE',
    true,
    99,
    NOW(),
    NOW()
);

-- 卡布奇诺
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '卡布奇诺',
    '浓缩咖啡、蒸奶和奶泡的三重奏',
    'COFFEE',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/cappuccino.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/cappuccino-detail-1.jpg"]'::jsonb,
    22.00,
    '{"calories": 120, "caffeine": "中"}'::jsonb,
    'ACTIVE',
    false,
    98,
    NOW(),
    NOW()
);

-- ==================== 茶饮类 ====================

-- 茉莉绿茶
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '茉莉绿茶',
    '清新茉莉花香，回甘悠长',
    'TEA',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/jasmine-tea.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/jasmine-tea-detail-1.jpg"]'::jsonb,
    15.00,
    '{"calories": 0, "caffeine": "低"}'::jsonb,
    'ACTIVE',
    false,
    90,
    NOW(),
    NOW()
);

-- 红茶拿铁
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '红茶拿铁',
    '红茶与鲜奶的完美结合',
    'TEA',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/black-tea-latte.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/black-tea-latte-detail-1.jpg"]'::jsonb,
    20.00,
    '{"calories": 180, "caffeine": "中"}'::jsonb,
    'ACTIVE',
    true,
    89,
    NOW(),
    NOW()
);

-- ==================== 果汁类 ====================

-- 鲜橙汁
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '鲜橙汁',
    '新鲜橙子现榨，维C满满',
    'JUICE',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/orange-juice.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/orange-juice-detail-1.jpg"]'::jsonb,
    25.00,
    '{"calories": 110, "vitaminC": "高"}'::jsonb,
    'ACTIVE',
    false,
    80,
    NOW(),
    NOW()
);

-- 西瓜汁
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '西瓜汁',
    '夏日清凉首选，清甜解渴',
    'JUICE',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/watermelon-juice.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/watermelon-juice-detail-1.jpg"]'::jsonb,
    22.00,
    '{"calories": 90, "water": "高"}'::jsonb,
    'ACTIVE',
    false,
    79,
    NOW(),
    NOW()
);

-- ==================== 奶昔类 ====================

-- 草莓奶昔
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '草莓奶昔',
    '新鲜草莓搭配香浓牛奶',
    'SMOOTHIE',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/strawberry-smoothie.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/strawberry-smoothie-detail-1.jpg"]'::jsonb,
    28.00,
    '{"calories": 250, "protein": "中"}'::jsonb,
    'ACTIVE',
    true,
    70,
    NOW(),
    NOW()
);

-- 芒果奶昔
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '芒果奶昔',
    '热带风情，香浓顺滑',
    'SMOOTHIE',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/mango-smoothie.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/mango-smoothie-detail-1.jpg"]'::jsonb,
    28.00,
    '{"calories": 260, "vitaminA": "高"}'::jsonb,
    'ACTIVE',
    false,
    69,
    NOW(),
    NOW()
);

-- ==================== 奶茶类 ====================

-- 珍珠奶茶
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '珍珠奶茶',
    '经典珍珠奶茶，Q弹珍珠搭配香醇奶茶',
    'MILK_TEA',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/bubble-tea.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/bubble-tea-detail-1.jpg"]'::jsonb,
    24.00,
    '{"calories": 350, "caffeine": "低"}'::jsonb,
    'ACTIVE',
    true,
    60,
    NOW(),
    NOW()
);

-- 布蕾奶茶
INSERT INTO beverages (id, name, description, category, image_url, detail_images, base_price, nutrition_info, status, is_recommended, sort_order, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    '布蕾奶茶',
    '焦糖布蕾风味，甜而不腻',
    'MILK_TEA',
    'https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/brulee-milk-tea.jpg',
    '["https://fxhgyxceqrmnpezluaht.supabase.co/storage/v1/object/public/beverage-images/brulee-milk-tea-detail-1.jpg"]'::jsonb,
    26.00,
    '{"calories": 380, "caffeine": "低"}'::jsonb,
    'ACTIVE',
    false,
    59,
    NOW(),
    NOW()
);

-- ==================== 饮品规格数据 ====================
-- 注意: 以下规格通过 beverages.name 关联，实际应用中应使用 UUID

-- 通用规格: 容量大小（适用于所有饮品）
INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'SIZE',
    '中杯',
    0.00,
    1
FROM beverages b;

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'SIZE',
    '大杯',
    3.00,
    2
FROM beverages b;

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'SIZE',
    '超大杯',
    6.00,
    3
FROM beverages b;

-- 通用规格: 温度（适用于所有饮品）
INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'TEMPERATURE',
    '冷',
    0.00,
    1
FROM beverages b;

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'TEMPERATURE',
    '热',
    0.00,
    2
FROM beverages b;

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'TEMPERATURE',
    '常温',
    0.00,
    3
FROM beverages b;

-- 甜度规格（仅适用于茶饮和奶茶）
INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'SWEETNESS',
    '无糖',
    0.00,
    1
FROM beverages b
WHERE b.category IN ('TEA', 'MILK_TEA');

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'SWEETNESS',
    '三分糖',
    0.00,
    2
FROM beverages b
WHERE b.category IN ('TEA', 'MILK_TEA');

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'SWEETNESS',
    '五分糖',
    0.00,
    3
FROM beverages b
WHERE b.category IN ('TEA', 'MILK_TEA');

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'SWEETNESS',
    '七分糖',
    0.00,
    4
FROM beverages b
WHERE b.category IN ('TEA', 'MILK_TEA');

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'SWEETNESS',
    '全糖',
    0.00,
    5
FROM beverages b
WHERE b.category IN ('TEA', 'MILK_TEA');

-- 配料规格（仅适用于奶茶）
INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'TOPPING',
    '无配料',
    0.00,
    1
FROM beverages b
WHERE b.category = 'MILK_TEA';

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'TOPPING',
    '珍珠',
    3.00,
    2
FROM beverages b
WHERE b.category = 'MILK_TEA';

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'TOPPING',
    '椰果',
    3.00,
    3
FROM beverages b
WHERE b.category = 'MILK_TEA';

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'TOPPING',
    '布丁',
    4.00,
    4
FROM beverages b
WHERE b.category = 'MILK_TEA';

INSERT INTO beverage_specs (id, beverage_id, spec_type, spec_name, price_adjustment, sort_order)
SELECT
    gen_random_uuid(),
    b.id,
    'TOPPING',
    '芝士奶盖',
    5.00,
    5
FROM beverages b
WHERE b.category = 'MILK_TEA';

-- 验证数据
SELECT
    category,
    COUNT(*) as beverage_count
FROM beverages
GROUP BY category
ORDER BY category;

SELECT
    COUNT(*) as total_specs
FROM beverage_specs;
