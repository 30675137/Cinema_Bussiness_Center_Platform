-- SKU主数据管理 - SKU表创建脚本
-- 功能: 支持四种SKU类型(原料、包材、成品、套餐)
-- 作者: AI Generated
-- 日期: 2025-12-24

-- 创建SKU表
CREATE TABLE IF NOT EXISTS skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  spu_id UUID NOT NULL,
  sku_type VARCHAR(20) NOT NULL CHECK (sku_type IN ('raw_material', 'packaging', 'finished_product', 'combo')),
  main_unit VARCHAR(20) NOT NULL,
  store_scope TEXT[] DEFAULT '{}',
  standard_cost DECIMAL(10,2),
  waste_rate DECIMAL(5,2) DEFAULT 0 CHECK (waste_rate >= 0 AND waste_rate <= 100),
  status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'enabled', 'disabled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_skus_code ON skus(code);
CREATE INDEX IF NOT EXISTS idx_skus_spu_id ON skus(spu_id);
CREATE INDEX IF NOT EXISTS idx_skus_type ON skus(sku_type);
CREATE INDEX IF NOT EXISTS idx_skus_status ON skus(status);
CREATE INDEX IF NOT EXISTS idx_skus_store_scope ON skus USING GIN(store_scope);

-- 添加业务规则约束注释
COMMENT ON TABLE skus IS 'SKU主数据表,支持四种类型:原料(raw_material)、包材(packaging)、成品(finished_product)、套餐(combo)';
COMMENT ON COLUMN skus.sku_type IS 'SKU类型:raw_material(原料)|packaging(包材)|finished_product(成品)|combo(套餐)';
COMMENT ON COLUMN skus.store_scope IS '门店范围:空数组表示全门店可用,非空数组表示特定门店列表';
COMMENT ON COLUMN skus.standard_cost IS '标准成本(元):原料/包材手动输入,成品/套餐自动计算';
COMMENT ON COLUMN skus.waste_rate IS '损耗率(%):仅成品类型有效,范围0-100';
COMMENT ON COLUMN skus.status IS 'SKU状态:draft(草稿)|enabled(启用)|disabled(停用)';
