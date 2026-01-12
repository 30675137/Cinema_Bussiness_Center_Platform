-- ============================================================
-- Migration: V024_001__import_yaolai_cinema_data.sql
-- Description: 导入耀莱成龙国际影城门店和影厅数据
-- Author: System
-- Date: 2025-12-23
-- Data Source: 文投控股官网 API (www.600715sh.com)
-- Statistics: 23家门店, 183个影厅, 26,214个座位
-- ============================================================

-- ============================================================
-- 第一部分：插入门店数据
-- ============================================================

-- 1. 北京地区门店 (5家)
-- --------------------------------------------------------

-- 五棵松店（旗舰店）- 17厅 3520座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-WKS',
    '耀莱成龙国际影城(五棵松店)',
    'active', 0,
    '北京市', '北京市', '海淀区',
    '复兴路69号万达广场5层耀莱成龙影城',
    '010-68188877',
    17, 3520, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    address = EXCLUDED.address,
    updated_at = NOW();

-- 慈云寺店 - 5厅 611座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-CYS',
    '耀莱成龙国际影城(慈云寺店)',
    'active', 0,
    '北京市', '北京市', '朝阳区',
    '慈云寺北里209号楼未来汇三层',
    '010-85993456',
    5, 611, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 房山天街店 - 15厅 1338座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-FSTJ',
    '耀莱成龙国际影城(房山天街店)',
    'active', 0,
    '北京市', '北京市', '房山区',
    '良乡镇政通南路龙湖天街五层',
    '010-81388877',
    15, 1338, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 马连道店 - 7厅 787座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-MLD',
    '耀莱成龙国际影城(马连道店)',
    'active', 0,
    '北京市', '北京市', '西城区',
    '马连道路25号新年华生活购物广场5层',
    '010-63252722',
    7, 787, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 西红门店 - 10厅 1581座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address, phone,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-XHM',
    '耀莱成龙国际影城(西红门店)',
    'active', 0,
    '北京市', '北京市', '大兴区',
    '欣旺北大街8号鸿坤购物中心F6-01',
    '010-60298877',
    10, 1581, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- --------------------------------------------------------
-- 2. 河北地区门店 (4家)
-- --------------------------------------------------------

-- 保定望都店 - 6厅 356座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-BDWD',
    '耀莱成龙国际影城(保定望都店)',
    'active', 0,
    '河北省', '保定市', '望都县',
    '庆都西路8号易购广场四楼',
    6, 356, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 石家庄店 - 9厅 1191座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-SJZ',
    '耀莱成龙国际影城(石家庄店)',
    'active', 0,
    '河北省', '石家庄市', '桥西区',
    '中山东路188号北国商城9层',
    9, 1191, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 新乐店 - 5厅 715座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-XL',
    '耀莱成龙国际影城(新乐店)',
    'active', 0,
    '河北省', '石家庄市', '新乐市',
    '新华路与礼堂街交口东北角新华广场3楼',
    5, 715, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 燕郊店 - 7厅 969座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-YJ',
    '耀莱成龙国际影城(燕郊店)',
    'active', 0,
    '河北省', '廊坊市', '三河市',
    '燕郊高新区迎宾北路富地广场A座四层',
    7, 969, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- --------------------------------------------------------
-- 3. 其他地区门店 (14家)
-- --------------------------------------------------------

-- 洛阳万达店 - 10厅 1533座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-LYWD',
    '耀莱成龙国际影城(洛阳万达店)',
    'active', 0,
    '河南省', '洛阳市', '西工区',
    '中州中路中州万达广场七层',
    10, 1533, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 广州增城店 - 7厅 1340座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-GZZC',
    '耀莱成龙国际影城(广州增城店)',
    'active', 0,
    '广东省', '广州市', '增城区',
    '新塘镇港口大道北332号金海岸城市广场4楼',
    7, 1340, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 淮南店 - 7厅 987座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-HN',
    '耀莱成龙国际影城(淮南店)',
    'active', 0,
    '安徽省', '淮南市', '田家庵区',
    '朝阳中路金地环球港4层西侧',
    7, 987, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 孝昌店 - 6厅 989座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-XC',
    '耀莱成龙国际影城(孝昌店)',
    'active', 0,
    '湖北省', '孝感市', '孝昌县',
    '孟宗大道特888号金上海广场主力店四楼',
    6, 989, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 成都新津店 - 6厅 877座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-CDXJ',
    '耀莱成龙国际影城(成都新津店)',
    'active', 0,
    '四川省', '成都市', '新津区',
    '兴园3路2号碧乐城4楼402号',
    6, 877, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 福州闽侯店 - 6厅 868座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-FZMH',
    '耀莱成龙国际影城(福州闽侯店)',
    'active', 0,
    '福建省', '福州市', '闽侯县',
    '上街镇国宾大道268号东百永嘉天地4楼',
    6, 868, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 福州长乐店 - 5厅 467座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-FZCL',
    '耀莱成龙国际影城(福州长乐店)',
    'active', 0,
    '福建省', '福州市', '长乐区',
    '十洋商务广场',
    5, 467, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 南平浦城店 - 6厅 792座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-NPPC',
    '耀莱成龙国际影城(南平浦城店)',
    'active', 0,
    '福建省', '南平市', '浦城县',
    '兴华路888号永晖商业中心3楼',
    6, 792, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 泉州泉港店 - 6厅 788座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-QZQG',
    '耀莱成龙国际影城(泉州泉港店)',
    'active', 0,
    '福建省', '泉州市', '泉港区',
    '福永辉城市商业广场永嘉天地',
    6, 788, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 济南领秀城店 - 11厅 1964座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-JNLX',
    '耀莱成龙国际影城(济南领秀城店)',
    'active', 0,
    '山东省', '济南市', '市中区',
    '二环南路2688号领秀城购物中心4层',
    11, 1964, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 银川店 - 8厅 1363座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-YC',
    '耀莱成龙国际影城(银川店)',
    'active', 0,
    '宁夏回族自治区', '银川市', '金凤区',
    '北京中路711号新华联购物中心四层',
    8, 1363, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 长春宽城店 - 8厅 1593座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-CCKC',
    '耀莱成龙国际影城(长春宽城店)',
    'active', 0,
    '吉林省', '长春市', '宽城区',
    '凯旋街道九台北路中东奥特莱斯三层',
    8, 1593, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 贵阳清镇店 - 10厅 1104座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-GYQZ',
    '耀莱成龙国际影城(贵阳清镇店)',
    'active', 0,
    '贵州省', '贵阳市', '清镇市',
    '云岭东路中央公园11栋2、3楼',
    10, 1104, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- 遵义湄潭店 - 6厅 481座
INSERT INTO stores (
    id, code, name, status, version,
    province, city, district, address,
    hall_count, seat_count, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'STORE-YLCL-ZYMT',
    '耀莱成龙国际影城(遵义湄潭店)',
    'active', 0,
    '贵州省', '遵义市', '湄潭县',
    '湄江街道象山路名城外滩一号楼一层',
    6, 481, NOW(), NOW()
) ON CONFLICT (code) DO UPDATE SET 
    hall_count = EXCLUDED.hall_count,
    seat_count = EXCLUDED.seat_count,
    updated_at = NOW();

-- ============================================================
-- 第二部分：插入影厅数据（北京重点门店）
-- ============================================================

-- 五棵松店（17厅）- 包含 Dolby Cinema、4DX、120帧/4K、激光厅
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-01', '杜比影院', 'VIP', 200, 
    ARRAY['Dolby Cinema', '杜比全景声', '杜比视界', '激光放映'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-02', '4DX动感厅', 'VIP', 120, 
    ARRAY['4DX', '动感座椅', '特效影厅', '沉浸式'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-03', '120帧4K巨幕厅', 'VIP', 350, 
    ARRAY['120帧', '4K', '巨幕', '高帧率'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-04', '激光厅1号', 'PUBLIC', 250, 
    ARRAY['激光放映', '高亮度', '超清'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-05', '激光厅2号', 'PUBLIC', 230, 
    ARRAY['激光放映', '高亮度'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-06', '激光厅3号', 'PUBLIC', 220, 
    ARRAY['激光放映'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-07', 'VIP贵宾厅1号', 'VIP', 30, 
    ARRAY['VIP尊享', '真皮沙发', '私密空间'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-08', 'VIP贵宾厅2号', 'VIP', 28, 
    ARRAY['VIP尊享', '真皮沙发'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-09', '情侣厅', 'CP', 24, 
    ARRAY['情侣座', '浪漫氛围'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-10', '派对厅', 'PARTY', 60, 
    ARRAY['团建', 'KTV', '游戏设备'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-11', '多功能厅', 'PARTY', 100, 
    ARRAY['会议', '路演', '发布会'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-12', '普通厅1号', 'PUBLIC', 200, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-13', '普通厅2号', 'PUBLIC', 190, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-14', '普通厅3号', 'PUBLIC', 180, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-15', '普通厅4号', 'PUBLIC', 170, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-16', '普通厅5号', 'PUBLIC', 160, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-WKS-17', '普通厅6号', 'PUBLIC', 158, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-WKS' ON CONFLICT (store_id, code) DO NOTHING;

-- 慈云寺店（5厅）- 包含 4DX厅
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-01', '4DX动感厅', 'VIP', 100, 
    ARRAY['4DX', '动感座椅', '特效影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-CYS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-02', 'VIP贵宾厅', 'VIP', 25, 
    ARRAY['VIP尊享', '真皮沙发'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-CYS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-03', '普通厅1号', 'PUBLIC', 170, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-CYS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-04', '普通厅2号', 'PUBLIC', 160, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-CYS' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-CYS-05', '普通厅3号', 'PUBLIC', 156, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-CYS' ON CONFLICT (store_id, code) DO NOTHING;

-- 西红门店（10厅）- 包含 4DX厅、60帧厅
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-01', '4DX动感厅', 'VIP', 95, 
    ARRAY['4DX', '动感座椅', '特效影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-02', '60帧高帧率厅', 'VIP', 180, 
    ARRAY['60帧', '高帧率', '超清'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-03', 'VIP贵宾厅', 'VIP', 28, 
    ARRAY['VIP尊享', '真皮沙发'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-04', '普通厅1号', 'PUBLIC', 180, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-05', '普通厅2号', 'PUBLIC', 175, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-06', '普通厅3号', 'PUBLIC', 168, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-07', '普通厅4号', 'PUBLIC', 160, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-08', '普通厅5号', 'PUBLIC', 155, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-09', '普通厅6号', 'PUBLIC', 150, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-XHM-10', '情侣厅', 'CP', 20, 
    ARRAY['情侣座', '浪漫氛围'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-XHM' ON CONFLICT (store_id, code) DO NOTHING;

-- 马连道店（7厅）
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-01', 'VIP贵宾厅', 'VIP', 28, 
    ARRAY['VIP尊享', '真皮沙发'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-02', '普通厅1号', 'PUBLIC', 130, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-03', '普通厅2号', 'PUBLIC', 125, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-04', '普通厅3号', 'PUBLIC', 120, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-05', '普通厅4号', 'PUBLIC', 115, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-06', '普通厅5号', 'PUBLIC', 110, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-MLD-07', '情侣厅', 'CP', 20, 
    ARRAY['情侣座', '浪漫氛围'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-MLD' ON CONFLICT (store_id, code) DO NOTHING;

-- 房山天街店（15厅）
INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-01', '4DX动感厅', 'VIP', 90, 
    ARRAY['4DX', '动感座椅', '特效影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-02', 'VIP贵宾厅1号', 'VIP', 25, 
    ARRAY['VIP尊享', '真皮沙发'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-03', 'VIP贵宾厅2号', 'VIP', 22, 
    ARRAY['VIP尊享', '真皮沙发'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-04', '情侣厅', 'CP', 20, 
    ARRAY['情侣座', '浪漫氛围'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-05', '普通厅1号', 'PUBLIC', 100, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-06', '普通厅2号', 'PUBLIC', 95, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-07', '普通厅3号', 'PUBLIC', 92, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-08', '普通厅4号', 'PUBLIC', 90, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-09', '普通厅5号', 'PUBLIC', 88, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-10', '普通厅6号', 'PUBLIC', 85, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-11', '普通厅7号', 'PUBLIC', 82, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-12', '普通厅8号', 'PUBLIC', 80, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-13', '普通厅9号', 'PUBLIC', 78, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-14', '普通厅10号', 'PUBLIC', 76, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;

INSERT INTO halls (store_id, code, name, type, capacity, tags, status)
SELECT s.id, 'HALL-FSTJ-15', '普通厅11号', 'PUBLIC', 75, 
    ARRAY['数字放映', '标准影厅'], 'active'
FROM stores s WHERE s.code = 'STORE-YLCL-FSTJ' ON CONFLICT (store_id, code) DO NOTHING;
