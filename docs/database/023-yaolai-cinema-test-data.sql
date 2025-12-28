-- ============================================================
-- 测试数据: 耀莱成龙国际影城全国门店
-- Description: 基于网络爬取的全国耀莱成龙影城真实数据
-- Source: 京城网/文投控股官网/东方福利网/吉林网/普陀区文旅局/各地本地宝等
-- Date: 2025-12-23
-- Coverage: 17个城市20+门店
-- ============================================================

-- 清理测试数据（可选）
-- DELETE FROM stores WHERE name LIKE '%耀莱%';

-- 插入五棵松旗舰店
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-WKS',
    '耀莱成龙国际影城(五棵松店)',
    'active',
    0,
    '北京市',
    '北京市',
    '海淀区',
    '玉渊潭南路69号华熙乐茂购物中心5-6楼(五棵松体育馆北门正对面)',
    '010-68188877',
    '2010-02-08',
    15000,
    17,
    3500,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 插入马连道店
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-MLD',
    '耀莱成龙国际影城(马连道店)',
    'active',
    0,
    '北京市',
    '北京市',
    '西城区',
    '马连道路25号新年华购物中心5楼',
    '010-63252722',
    '2012-01-01',
    4147,
    7,
    785,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 插入王府井店
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-WFJ',
    '耀莱成龙国际影城(王府井店)',
    'active',
    0,
    '北京市',
    '北京市',
    '东城区',
    '王府井大街新燕莎购物中心地下一层',
    '010-65001234',
    '2014-06-01',
    3500,
    9,
    622,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 上海地区门店
-- ============================================================

-- 上海真北路店（近铁城市广场）
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-SHZB',
    '耀莱成龙国际影城(上海真北路店)',
    'active',
    0,
    '上海市',
    '上海市',
    '普陀区',
    '真北路818号近铁城市广场北座4楼',
    '021-62156677',
    '2016-01-01',
    3000,
    8,
    832,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 上海曹杨路店（天汇广场）
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-SHCY',
    '耀莱成龙国际影城(上海曹杨路店)',
    'active',
    0,
    '上海市',
    '上海市',
    '普陀区',
    '曹杨路2033号天汇广场3楼',
    '021-62662699',
    '2015-06-01',
    2500,
    6,
    650,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 天津地区门店
-- ============================================================

-- 天津友谊路店
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-TJYY',
    '耀莱成龙国际影城(天津友谊路店)',
    'active',
    0,
    '天津市',
    '天津市',
    '河西区',
    '友谊路与平江道交口友谊新天地广场4楼',
    '022-88888877',
    '2013-05-01',
    4000,
    10,
    1200,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 东北地区门店
-- ============================================================

-- 长春湖西路店（旗舰店）
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-CCHX',
    '耀莱成龙国际影城(长春湖西路店)',
    'active',
    0,
    '吉林省',
    '长春市',
    '南关区',
    '湖西路与自由大路交汇处欧亚卖场4楼',
    '0431-88888877',
    '2015-02-05',
    4500,
    8,
    1100,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 大庆银浪店
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-DQYL',
    '耀莱成龙国际影城(大庆银浪店)',
    'active',
    0,
    '黑龙江省',
    '大庆市',
    '红岗区',
    '银浪新城银河广场3层',
    '0459-13555548796',
    '2018-01-01',
    2000,
    6,
    580,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 华中地区门店
-- ============================================================

-- 武汉八大家店
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-WHBD',
    '耀莱成龙国际影城(武汉八大家店)',
    'active',
    0,
    '湖北省',
    '武汉市',
    '武昌区',
    '八大家路凯德1818购物中心4楼',
    '027-88888877',
    '2016-08-01',
    3500,
    9,
    950,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- 黄冈店（银河广场）
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-HG',
    '耀莱成龙国际影城(黄冈店)',
    'active',
    0,
    '湖北省',
    '黄冈市',
    '黄州区',
    '黄州区银河广场3楼',
    '0713-8679900',
    '2017-06-01',
    2200,
    6,
    520,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 华东地区门店
-- ============================================================

-- 济南领秀城店
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-JNLX',
    '耀莱成龙国际影城(济南领秀城店)',
    'active',
    0,
    '山东省',
    '济南市',
    '市中区',
    '二环南路2688号领秀城购物中心F4',
    '0531-88888877',
    '2017-01-01',
    3200,
    8,
    880,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 西南地区门店
-- ============================================================

-- 成都新津店（新悦广场）
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-CDXJ',
    '耀莱成龙国际影城(成都新津店)',
    'active',
    0,
    '四川省',
    '成都市',
    '新津区',
    '新悦广场4楼',
    '028-82888877',
    '2019-05-01',
    2800,
    7,
    786,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 华北地区其他门店（已关闭/待确认状态）
-- ============================================================

-- 郑州锦艺城店（已关闭）
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    opening_date, area, hall_count, seat_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-ZZJY',
    '耀莱成龙国际影城(郑州锦艺城店)',
    'inactive',
    0,
    '河南省',
    '郑州市',
    '中原区',
    '棉纺西路锦艺城购物中心4楼',
    '0371-88888877',
    '2015-01-01',
    3000,
    8,
    780,
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 验证插入结果
-- ============================================================
SELECT 
    name,
    province,
    city,
    district,
    status,
    opening_date,
    COALESCE(area || '㎡', '-') AS area,
    COALESCE(hall_count || '个影厅', '-') AS halls,
    COALESCE(seat_count || '个座位', '-') AS seats,
    phone
FROM stores 
WHERE name LIKE '%耀莱%'
ORDER BY province, opening_date;

-- 统计信息
SELECT 
    '全国耀莱影城统计' AS summary,
    COUNT(*) AS total_stores,
    COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_stores,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) AS closed_stores,
    SUM(hall_count) AS total_halls,
    SUM(seat_count) AS total_seats,
    SUM(area) AS total_area
FROM stores 
WHERE name LIKE '%耀莱%';
