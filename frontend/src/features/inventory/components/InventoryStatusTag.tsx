/**
 * P003-inventory-query: 库存状态标签组件
 *
 * 根据库存状态显示对应颜色的标签。
 */

import { Tag } from 'antd';
import type { InventoryStatus } from '../types';
import { INVENTORY_STATUS_CONFIG } from '../types';

interface InventoryStatusTagProps {
  status: InventoryStatus;
  className?: string;
}

/**
 * 库存状态标签组件
 *
 * 根据库存状态枚举值显示对应的中文标签和颜色：
 * - SUFFICIENT: 绿色 "充足"
 * - NORMAL: 蓝色 "正常"
 * - BELOW_THRESHOLD: 金色 "偏低"
 * - LOW: 橙色 "不足"
 * - OUT_OF_STOCK: 红色 "缺货"
 */
export function InventoryStatusTag({ status, className }: InventoryStatusTagProps) {
  const config = INVENTORY_STATUS_CONFIG[status];

  if (!config) {
    return <Tag className={className}>未知</Tag>;
  }

  return (
    <Tag color={config.color} className={className}>
      {config.label}
    </Tag>
  );
}

export default InventoryStatusTag;
