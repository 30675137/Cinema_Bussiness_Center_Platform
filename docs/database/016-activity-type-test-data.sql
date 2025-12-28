-- ============================================================================
-- 活动类型管理 - 测试数据
-- ============================================================================
-- 说明：此脚本用于在 activity_types 表中插入三条测试数据
-- 执行方式：在 Supabase SQL Editor 或 PostgreSQL 客户端中执行
-- 
-- 注意：
-- 1. 如果数据已存在，脚本会跳过插入（使用 ON CONFLICT）
-- 2. 可以多次执行此脚本，不会产生重复数据
-- 3. 执行后会自动验证插入的数据
-- ============================================================================

-- 插入三条测试数据
-- 使用固定 UUID 以便于测试和识别
-- 注意：由于唯一约束是部分索引（WHERE status != 'DELETED'），
-- 我们使用 DO 块先检查是否存在，不存在则插入，存在则更新

DO $$
BEGIN
  -- 插入或更新"企业团建"
  IF NOT EXISTS (
    SELECT 1 FROM activity_types 
    WHERE name = '企业团建' AND status != 'DELETED'
  ) THEN
    INSERT INTO activity_types (id, name, description, status, sort, created_at, updated_at, created_by, updated_by)
    VALUES (
      '11111111-1111-1111-1111-111111111111'::uuid,
      '企业团建',
      '企业团队建设活动，包括团队拓展、年会、培训等活动类型',
      'ENABLED',
      1,
      now(),
      now(),
      'system',
      'system'
    );
  ELSE
    UPDATE activity_types
    SET 
      description = '企业团队建设活动，包括团队拓展、年会、培训等活动类型',
      status = 'ENABLED',
      sort = 1,
      updated_at = now(),
      updated_by = 'system'
    WHERE name = '企业团建' AND status != 'DELETED';
  END IF;
  
  -- 插入或更新"订婚"
  IF NOT EXISTS (
    SELECT 1 FROM activity_types 
    WHERE name = '订婚' AND status != 'DELETED'
  ) THEN
    INSERT INTO activity_types (id, name, description, status, sort, created_at, updated_at, created_by, updated_by)
    VALUES (
      '22222222-2222-2222-2222-222222222222'::uuid,
      '订婚',
      '订婚仪式活动，包括订婚宴、订婚仪式等活动类型',
      'ENABLED',
      2,
      now(),
      now(),
      'system',
      'system'
    );
  ELSE
    UPDATE activity_types
    SET 
      description = '订婚仪式活动，包括订婚宴、订婚仪式等活动类型',
      status = 'ENABLED',
      sort = 2,
      updated_at = now(),
      updated_by = 'system'
    WHERE name = '订婚' AND status != 'DELETED';
  END IF;
  
  -- 插入或更新"生日Party"
  IF NOT EXISTS (
    SELECT 1 FROM activity_types 
    WHERE name = '生日Party' AND status != 'DELETED'
  ) THEN
    INSERT INTO activity_types (id, name, description, status, sort, created_at, updated_at, created_by, updated_by)
    VALUES (
      '33333333-3333-3333-3333-333333333333'::uuid,
      '生日Party',
      '生日聚会活动，包括生日派对、生日宴等活动类型',
      'ENABLED',
      3,
      now(),
      now(),
      'system',
      'system'
    );
  ELSE
    UPDATE activity_types
    SET 
      description = '生日聚会活动，包括生日派对、生日宴等活动类型',
      status = 'ENABLED',
      sort = 3,
      updated_at = now(),
      updated_by = 'system'
    WHERE name = '生日Party' AND status != 'DELETED';
  END IF;
END $$;

-- 验证插入的数据
SELECT 
  id,
  name,
  description,
  status,
  sort,
  created_at,
  updated_at,
  created_by,
  updated_by
FROM activity_types
WHERE status != 'DELETED'
ORDER BY sort ASC, created_at ASC;

