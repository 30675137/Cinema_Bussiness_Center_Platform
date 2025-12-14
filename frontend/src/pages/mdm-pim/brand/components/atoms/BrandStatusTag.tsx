import React from 'react';
import { Tag } from 'antd';
import { BrandStatus, BRAND_CONSTANTS } from '../../types/brand.types';

interface BrandStatusTagProps {
  status: BrandStatus;
  className?: string;
}

/**
 * 品牌状态标签原子组件
 * 用于显示品牌的不同状态，使用不同颜色区分
 */
const BrandStatusTag: React.FC<BrandStatusTagProps> = ({ status, className }) => {
  const { color, text } = BRAND_CONSTANTS.STATUS_COLORS[status];

  return (
    <Tag
      color={color}
      className={`brand-status-tag ${className || ''}`}
      data-testid="brand-status"
    >
      {text}
    </Tag>
  );
};

export default BrandStatusTag;