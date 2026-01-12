-- SPU规格数据更新脚本
-- 功能: 为现有SPU添加规格信息
-- 日期: 2025-12-25

-- 更新调酒原料的规格
UPDATE spus SET specifications = '[{"name": "容量", "value": "标准"}, {"name": "类型", "value": "基础原料"}]'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000001';

-- 更新杯具包材的规格
UPDATE spus SET specifications = '[{"name": "材质", "value": "食品级"}, {"name": "规格", "value": "通用"}]'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000002';

-- 更新特调饮品的规格
UPDATE spus SET specifications = '[{"name": "容量", "value": "中杯/大杯"}, {"name": "温度", "value": "冰/常温"}]'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000003';

-- 更新爆米花的规格
UPDATE spus SET specifications = '[{"name": "口味", "value": "原味/焦糖/奶油"}, {"name": "份量", "value": "小/中/大"}]'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000004';

-- 更新观影套餐的规格
UPDATE spus SET specifications = '[{"name": "人数", "value": "单人/双人"}, {"name": "类型", "value": "经典/豪华"}]'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000005';
