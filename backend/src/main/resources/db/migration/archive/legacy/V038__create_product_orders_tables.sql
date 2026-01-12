-- @spec O001-product-order-list
-- Database Migration: Create Product Orders Tables
-- Version: V001
-- Created: 2025-12-27

-- 1. 创建商品订单表
CREATE TABLE IF NOT EXISTS product_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_PAYMENT',
    product_total DECIMAL(10,2) NOT NULL,
    shipping_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address JSONB,
    payment_method VARCHAR(20),
    payment_time TIMESTAMP,
    shipped_time TIMESTAMP,
    completed_time TIMESTAMP,
    cancelled_time TIMESTAMP,
    cancel_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version INTEGER NOT NULL DEFAULT 1,

    CHECK (total_amount = product_total + shipping_fee - discount_amount)
);

-- 2. 创建订单商品项表
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_spec VARCHAR(100),
    product_image VARCHAR(500),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CHECK (subtotal = quantity * unit_price)
);

-- 3. 创建订单日志表
CREATE TABLE IF NOT EXISTS order_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    status_before VARCHAR(20),
    status_after VARCHAR(20),
    operator_id UUID NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 4. 创建索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_number ON product_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON product_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON product_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON product_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON product_orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_logs_order_id ON order_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON order_logs(created_at DESC);

-- 5. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_product_orders_updated_at ON product_orders;
CREATE TRIGGER update_product_orders_updated_at
    BEFORE UPDATE ON product_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 创建 users 表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    address VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7. 插入测试数据（仅用于开发环境）
-- 注意：生产环境请删除此部分

-- 创建测试用户
INSERT INTO users (id, username, phone, province, city, district, address)
VALUES
    ('550e8400-e29b-41d4-a716-446655440100'::UUID, '张三', '13800138000', '广东省', '深圳市', '南山区', '科技园南区18号楼'),
    ('550e8400-e29b-41d4-a716-446655440101'::UUID, '李四', '13900139000', '北京市', '北京市', '朝阳区', '三里屯SOHO 5号楼'),
    ('550e8400-e29b-41d4-a716-446655440102'::UUID, '王五', '13700137000', '上海市', '上海市', '浦东新区', '陆家嘴环路1000号')
ON CONFLICT (id) DO NOTHING;

-- 插入测试订单
INSERT INTO product_orders (
    id, order_number, user_id, status, product_total, shipping_fee, discount_amount, total_amount,
    shipping_address, payment_method, payment_time, created_at, updated_at, version
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001'::UUID,
    'ORD20251227AB12CD',
    '550e8400-e29b-41d4-a716-446655440100'::UUID,
    'PAID',
    150.00,
    10.00,
    5.00,
    155.00,
    '{"province":"广东省","city":"深圳市","district":"南山区","detail":"科技园南区18号楼"}'::JSONB,
    'WECHAT_PAY',
    '2025-12-27 10:30:00',
    '2025-12-27 10:00:00',
    '2025-12-27 10:30:00',
    2
),
(
    '550e8400-e29b-41d4-a716-446655440002'::UUID,
    'ORD20251227EF34GH',
    '550e8400-e29b-41d4-a716-446655440101'::UUID,
    'SHIPPED',
    200.00,
    0.00,
    20.00,
    180.00,
    '{"province":"北京市","city":"北京市","district":"朝阳区","detail":"三里屯SOHO 5号楼"}'::JSONB,
    'ALIPAY',
    '2025-12-26 14:20:00',
    '2025-12-26 14:00:00',
    '2025-12-27 09:00:00',
    3
),
(
    '550e8400-e29b-41d4-a716-446655440003'::UUID,
    'ORD20251226IJ56KL',
    '550e8400-e29b-41d4-a716-446655440102'::UUID,
    'COMPLETED',
    80.00,
    10.00,
    0.00,
    90.00,
    '{"province":"上海市","city":"上海市","district":"浦东新区","detail":"陆家嘴环路1000号"}'::JSONB,
    'WECHAT_PAY',
    '2025-12-25 11:00:00',
    '2025-12-25 10:45:00',
    '2025-12-27 15:00:00',
    4
)
ON CONFLICT (id) DO NOTHING;

-- 插入订单商品项
INSERT INTO order_items (id, order_id, product_id, product_name, product_spec, quantity, unit_price, subtotal, created_at)
VALUES
('650e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '750e8400-e29b-41d4-a716-446655440001'::UUID, '可口可乐', '500ml', 2, 5.00, 10.00, '2025-12-27 10:00:00'),
('650e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, '750e8400-e29b-41d4-a716-446655440002'::UUID, '薯片', '大包装', 3, 12.00, 36.00, '2025-12-27 10:00:00'),
('650e8400-e29b-41d4-a716-446655440003'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, '750e8400-e29b-41d4-a716-446655440003'::UUID, '矿泉水', '550ml', 6, 3.00, 18.00, '2025-12-26 14:00:00'),
('650e8400-e29b-41d4-a716-446655440004'::UUID, '550e8400-e29b-41d4-a716-446655440003'::UUID, '750e8400-e29b-41d4-a716-446655440004'::UUID, '爆米花', '大桶', 1, 80.00, 80.00, '2025-12-25 10:45:00')
ON CONFLICT (id) DO NOTHING;

-- 插入订单日志
INSERT INTO order_logs (id, order_id, action, status_before, status_after, operator_id, operator_name, comments, created_at)
VALUES
('850e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'CREATE_ORDER', NULL, 'PENDING_PAYMENT', '550e8400-e29b-41d4-a716-446655440100'::UUID, '张三', '创建订单', '2025-12-27 10:00:00'),
('850e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'PAYMENT', 'PENDING_PAYMENT', 'PAID', '550e8400-e29b-41d4-a716-446655440100'::UUID, '张三', '微信支付成功', '2025-12-27 10:30:00'),
('850e8400-e29b-41d4-a716-446655440003'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'CREATE_ORDER', NULL, 'PENDING_PAYMENT', '550e8400-e29b-41d4-a716-446655440101'::UUID, '李四', '创建订单', '2025-12-26 14:00:00'),
('850e8400-e29b-41d4-a716-446655440004'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'PAYMENT', 'PENDING_PAYMENT', 'PAID', '550e8400-e29b-41d4-a716-446655440101'::UUID, '李四', '支付宝支付成功', '2025-12-26 14:20:00'),
('850e8400-e29b-41d4-a716-446655440005'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'SHIP', 'PAID', 'SHIPPED', '950e8400-e29b-41d4-a716-446655440001'::UUID, '运营管理员', '订单已发货，快递单号: SF1234567890', '2025-12-27 09:00:00')
ON CONFLICT (id) DO NOTHING;
