/**
 * @spec O003-beverage-order
 * 修复 queue_numbers 表的状态约束
 *
 * Version: V052
 * Date: 2025-12-28
 * Description: 修改状态约束以匹配实体类枚举（ACTIVE, CALLED, COMPLETED）
 *
 * 问题：实体类使用 ACTIVE/CALLED/COMPLETED，但数据库约束使用 PENDING/CALLED/PICKED
 * 修复：删除旧约束，添加新约束
 */

-- 删除旧的状态约束
ALTER TABLE queue_numbers
DROP CONSTRAINT IF EXISTS check_status;

-- 添加新的状态约束（匹配实体类枚举）
ALTER TABLE queue_numbers
ADD CONSTRAINT check_status CHECK (status IN ('ACTIVE', 'CALLED', 'COMPLETED'));

-- 更新注释
COMMENT ON COLUMN queue_numbers.status IS '取餐号状态: ACTIVE(激活/等待叫号), CALLED(已叫号), COMPLETED(已完成/已取餐)';
