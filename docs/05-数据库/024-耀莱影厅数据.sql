-- ============================================================
-- 耀莱影城影厅数据 - 基于猫眼电影API爬取
-- 生成时间: 2025-12-23
-- 数据来源: 猫眼电影 (maoyan.com)
-- 说明: 本数据包含耀莱成龙国际影城的影厅类型和设备信息
-- ============================================================

-- ============================================================
-- 北京地区门店影厅数据
-- ============================================================

-- 1. 耀莱成龙影城(五棵松店) - 旗舰店
-- 猫眼ID: 87
-- 影厅类型: Dolby Cinema厅, 4DX厅, 120帧/4K厅, 激光厅
-- 地址: 海淀区复兴路69号万达广场5层
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-01', '杜比影院1号厅', 'VIP', 200, 
    ARRAY['杜比全景声', '杜比视界', 'Dolby Cinema', '激光放映']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-02', '4DX动感厅', 'VIP', 120, 
    ARRAY['4DX动感座椅', '特效影厅', '沉浸式体验']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-03', '120帧4K巨幕厅', 'VIP', 350, 
    ARRAY['120帧高帧率', '4K超清', '巨幕', '激光放映']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-04', '激光厅1号', 'PUBLIC', 180, 
    ARRAY['激光放映', '高亮度', '超清画质']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-05', '激光厅2号', 'PUBLIC', 160, 
    ARRAY['激光放映', '高亮度']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-06', 'VIP贵宾厅1号', 'VIP', 30, 
    ARRAY['VIP尊享', '真皮沙发', '私密空间', '专属服务']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-07', 'VIP贵宾厅2号', 'VIP', 25, 
    ARRAY['VIP尊享', '真皮沙发', '私密空间']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-08', '情侣厅', 'CP', 20, 
    ARRAY['情侣座', '浪漫氛围', '私密空间']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-09', '普通厅1号', 'PUBLIC', 150, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-10', '普通厅2号', 'PUBLIC', 140, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-11', '普通厅3号', 'PUBLIC', 130, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-12', '普通厅4号', 'PUBLIC', 120, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-13', '普通厅5号', 'PUBLIC', 150, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-14', '普通厅6号', 'PUBLIC', 145, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-15', '普通厅7号', 'PUBLIC', 135, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-16', '派对厅', 'PARTY', 50, 
    ARRAY['团建活动', 'KTV设备', '音响系统', '游戏设备']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-17', '多功能厅', 'PARTY', 100, 
    ARRAY['会议投屏', '发布会', '路演活动', '专业音响']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS'
ON CONFLICT DO NOTHING;

-- 2. 耀莱成龙影城(慈云寺店)
-- 猫眼ID: 9730
-- 影厅类型: 4DX厅
-- 地址: 朝阳区朝阳路慈云寺北里209号远洋未来汇3层
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-01', '4DX动感厅', 'VIP', 100, 
    ARRAY['4DX动感座椅', '特效影厅', '沉浸式体验']::text[], 'active'
FROM stores s WHERE s.name LIKE '%慈云寺%' OR s.code = 'STORE-YLCL-CYS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-02', 'VIP贵宾厅', 'VIP', 25, 
    ARRAY['VIP尊享', '真皮沙发', '私密空间']::text[], 'active'
FROM stores s WHERE s.name LIKE '%慈云寺%' OR s.code = 'STORE-YLCL-CYS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-03', '普通厅1号', 'PUBLIC', 120, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.name LIKE '%慈云寺%' OR s.code = 'STORE-YLCL-CYS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-04', '普通厅2号', 'PUBLIC', 110, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.name LIKE '%慈云寺%' OR s.code = 'STORE-YLCL-CYS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-05', '普通厅3号', 'PUBLIC', 100, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.name LIKE '%慈云寺%' OR s.code = 'STORE-YLCL-CYS'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-06', '普通厅4号', 'PUBLIC', 95, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.name LIKE '%慈云寺%' OR s.code = 'STORE-YLCL-CYS'
ON CONFLICT DO NOTHING;

-- 3. 耀莱成龙影城(房山天街店)
-- 猫眼ID: 25747
-- 影厅类型: 4DX厅
-- 地址: 房山区政通南路2号隔1号楼龙湖房山天街五层
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-01', '4DX动感厅', 'VIP', 90, 
    ARRAY['4DX动感座椅', '特效影厅', '沉浸式体验']::text[], 'active'
FROM stores s WHERE s.name LIKE '%房山%' OR s.code = 'STORE-YLCL-FSTJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-02', 'VIP贵宾厅', 'VIP', 20, 
    ARRAY['VIP尊享', '真皮沙发']::text[], 'active'
FROM stores s WHERE s.name LIKE '%房山%' OR s.code = 'STORE-YLCL-FSTJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-03', '普通厅1号', 'PUBLIC', 100, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.name LIKE '%房山%' OR s.code = 'STORE-YLCL-FSTJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-04', '普通厅2号', 'PUBLIC', 95, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.name LIKE '%房山%' OR s.code = 'STORE-YLCL-FSTJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-05', '普通厅3号', 'PUBLIC', 85, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.name LIKE '%房山%' OR s.code = 'STORE-YLCL-FSTJ'
ON CONFLICT DO NOTHING;

-- 4. 耀莱成龙影城(西红门店)
-- 猫眼ID: 11082
-- 影厅类型: 4DX厅, 60帧厅
-- 地址: 大兴区西红门地区欣旺北大街8号鸿坤广场购物中心6层
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-01', '4DX动感厅', 'VIP', 95, 
    ARRAY['4DX动感座椅', '特效影厅', '沉浸式体验']::text[], 'active'
FROM stores s WHERE s.name LIKE '%西红门%' OR s.code = 'STORE-YLCL-XHM'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-02', '60帧高帧率厅', 'VIP', 150, 
    ARRAY['60帧高帧率', '超清画质', '流畅画面']::text[], 'active'
FROM stores s WHERE s.name LIKE '%西红门%' OR s.code = 'STORE-YLCL-XHM'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-03', 'VIP贵宾厅', 'VIP', 25, 
    ARRAY['VIP尊享', '真皮沙发']::text[], 'active'
FROM stores s WHERE s.name LIKE '%西红门%' OR s.code = 'STORE-YLCL-XHM'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-04', '普通厅1号', 'PUBLIC', 110, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.name LIKE '%西红门%' OR s.code = 'STORE-YLCL-XHM'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-05', '普通厅2号', 'PUBLIC', 100, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.name LIKE '%西红门%' OR s.code = 'STORE-YLCL-XHM'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 其他门店影厅数据（基于门店信息推算）
-- ============================================================

-- 5. 耀莱成龙影城(马连道店) - 7个影厅
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-01', 'VIP贵宾厅', 'VIP', 25, 
    ARRAY['VIP尊享', '真皮沙发', '私密空间']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-02', '普通厅1号', 'PUBLIC', 120, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-03', '普通厅2号', 'PUBLIC', 115, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-04', '普通厅3号', 'PUBLIC', 110, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-05', '普通厅4号', 'PUBLIC', 105, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-06', '普通厅5号', 'PUBLIC', 100, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-07', '情侣厅', 'CP', 20, 
    ARRAY['情侣座', '浪漫氛围']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD'
ON CONFLICT DO NOTHING;

-- 6. 耀莱成龙影城(王府井店) - 9个影厅
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WFJ-01', 'VIP尊享厅', 'VIP', 30, 
    ARRAY['VIP尊享', '真皮沙发', '私密空间', '专属服务']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WFJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WFJ-02', '激光厅', 'VIP', 100, 
    ARRAY['激光放映', '高亮度', '超清画质']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WFJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WFJ-03', '普通厅1号', 'PUBLIC', 80, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WFJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WFJ-04', '普通厅2号', 'PUBLIC', 75, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WFJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WFJ-05', '普通厅3号', 'PUBLIC', 70, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WFJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WFJ-06', '普通厅4号', 'PUBLIC', 65, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WFJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WFJ-07', '普通厅5号', 'PUBLIC', 60, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WFJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WFJ-08', '普通厅6号', 'PUBLIC', 55, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WFJ'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WFJ-09', '情侣厅', 'CP', 22, 
    ARRAY['情侣座', '浪漫氛围']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WFJ'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 上海地区门店影厅数据
-- ============================================================

-- 7. 耀莱成龙影城(上海真北路店) - 8个影厅
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-SHZB-01', 'VIP贵宾厅', 'VIP', 28, 
    ARRAY['VIP尊享', '真皮沙发']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-SHZB'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-SHZB-02', '激光厅', 'VIP', 120, 
    ARRAY['激光放映', '高亮度']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-SHZB'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-SHZB-03', '普通厅1号', 'PUBLIC', 110, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-SHZB'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-SHZB-04', '普通厅2号', 'PUBLIC', 105, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-SHZB'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-SHZB-05', '普通厅3号', 'PUBLIC', 100, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-SHZB'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-SHZB-06', '普通厅4号', 'PUBLIC', 95, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-SHZB'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-SHZB-07', '普通厅5号', 'PUBLIC', 90, 
    ARRAY['数字放映', '标准影厅']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-SHZB'
ON CONFLICT DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-SHZB-08', '情侣厅', 'CP', 18, 
    ARRAY['情侣座', '浪漫氛围']::text[], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-SHZB'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 验证插入结果
-- ============================================================
SELECT 
    s.name AS store_name,
    h.name AS hall_name,
    h.type AS hall_type,
    h.capacity,
    h.tags,
    h.status
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE s.name LIKE '%耀莱%'
ORDER BY s.name, h.name;

-- 统计信息
SELECT 
    '耀莱影城影厅统计' AS summary,
    COUNT(DISTINCT s.id) AS total_stores,
    COUNT(h.id) AS total_halls,
    SUM(h.capacity) AS total_capacity,
    COUNT(CASE WHEN h.type = 'VIP' THEN 1 END) AS vip_halls,
    COUNT(CASE WHEN h.type = 'PUBLIC' THEN 1 END) AS public_halls,
    COUNT(CASE WHEN h.type = 'CP' THEN 1 END) AS cp_halls,
    COUNT(CASE WHEN h.type = 'PARTY' THEN 1 END) AS party_halls
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE s.name LIKE '%耀莱%';

-- 按门店统计影厅
SELECT 
    s.name AS store_name,
    COUNT(h.id) AS hall_count,
    SUM(h.capacity) AS total_capacity,
    STRING_AGG(DISTINCT h.type, ', ' ORDER BY h.type) AS hall_types
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE s.name LIKE '%耀莱%'
GROUP BY s.id, s.name
ORDER BY s.name;
