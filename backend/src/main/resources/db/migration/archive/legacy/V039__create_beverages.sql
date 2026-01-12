/**
 * @spec O003-beverage-order
 * 创建 beverages 表 - 饮品商品主表
 *
 * Version: V039
 * Date: 2025-12-27
 * Description: 定义饮品商品的基本信息、价格、分类、状态等
 */

CREATE TABLE beverages (
  -- 主键
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 基本信息
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,

  -- 图片资源
  image_url TEXT,                           -- 主图 URL (Supabase Storage)
  detail_images JSONB DEFAULT '[]'::jsonb,  -- 详情图数组 ["url1", "url2"]

  -- 价格
  base_price DECIMAL(10,2) NOT NULL,        -- 基础价格（小杯/标准规格）

  -- 营养信息（可选）
  nutrition_info JSONB,                     -- {"calories": 150, "sugar": "10g"}

  -- 状态管理
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  is_recommended BOOLEAN DEFAULT false,     -- 推荐标签
  sort_order INTEGER DEFAULT 0,             -- 排序权重

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,

  -- 约束
  CONSTRAINT check_category CHECK (category IN ('COFFEE', 'TEA', 'JUICE', 'SMOOTHIE', 'MILK_TEA', 'OTHER')),
  CONSTRAINT check_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
  CONSTRAINT check_base_price CHECK (base_price >= 0)
);

-- 索引
CREATE INDEX idx_beverage_category_status ON beverages(category, status) WHERE status = 'ACTIVE';
CREATE INDEX idx_beverage_sort ON beverages(sort_order DESC, created_at DESC);

-- 注释
COMMENT ON TABLE beverages IS '饮品商品表 - 菜单中的饮品商品信息';
COMMENT ON COLUMN beverages.id IS '主键 UUID';
COMMENT ON COLUMN beverages.name IS '饮品名称';
COMMENT ON COLUMN beverages.category IS '分类: COFFEE(咖啡), TEA(茶饮), JUICE(果汁), SMOOTHIE(奶昔), MILK_TEA(奶茶), OTHER(其他)';
COMMENT ON COLUMN beverages.base_price IS '基础价格（小杯/标准规格）';
COMMENT ON COLUMN beverages.status IS '状态: ACTIVE(上架), INACTIVE(下架), OUT_OF_STOCK(缺货)';
COMMENT ON COLUMN beverages.is_recommended IS '是否推荐商品';
COMMENT ON COLUMN beverages.sort_order IS '排序权重（数值越大越靠前）';
