-- V9: 创建时段覆盖表
-- 用于存储特定日期的时段覆盖规则
-- 注意: 表已存在于数据库，此脚本仅作为文档记录

-- 检查表是否存在，如果不存在则创建
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'time_slot_overrides') THEN
        CREATE TABLE time_slot_overrides (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
            override_date DATE NOT NULL,
            override_type VARCHAR(20) NOT NULL CHECK (override_type IN ('ADD', 'MODIFY', 'CANCEL')),
            start_time TIME,
            end_time TIME,
            capacity INTEGER,
            reason TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            
            -- 约束：ADD/MODIFY 类型必须有时间
            CONSTRAINT check_time_for_add_modify CHECK (
                override_type = 'CANCEL' OR (start_time IS NOT NULL AND end_time IS NOT NULL)
            ),
            -- 约束：结束时间必须晚于开始时间
            CONSTRAINT check_end_after_start CHECK (
                start_time IS NULL OR end_time IS NULL OR end_time > start_time
            )
        );

        -- 创建索引
        CREATE INDEX idx_time_slot_overrides_package_id ON time_slot_overrides(package_id);
        CREATE INDEX idx_time_slot_overrides_date ON time_slot_overrides(override_date);
        CREATE INDEX idx_time_slot_overrides_package_date ON time_slot_overrides(package_id, override_date);
    END IF;
END $$;

-- 添加注释
COMMENT ON TABLE time_slot_overrides IS '时段覆盖表 - 特定日期的时段覆盖规则';
COMMENT ON COLUMN time_slot_overrides.package_id IS '所属场景包ID';
COMMENT ON COLUMN time_slot_overrides.override_date IS '覆盖日期';
COMMENT ON COLUMN time_slot_overrides.override_type IS '覆盖类型：ADD(新增)、MODIFY(修改)、CANCEL(取消)';
COMMENT ON COLUMN time_slot_overrides.start_time IS '开始时间（ADD/MODIFY类型必填）';
COMMENT ON COLUMN time_slot_overrides.end_time IS '结束时间（ADD/MODIFY类型必填）';
COMMENT ON COLUMN time_slot_overrides.capacity IS '可预约容量';
COMMENT ON COLUMN time_slot_overrides.reason IS '覆盖原因/备注';
