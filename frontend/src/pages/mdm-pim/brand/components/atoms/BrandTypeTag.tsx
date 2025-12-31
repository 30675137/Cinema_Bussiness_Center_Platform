import React from 'react';
import { Tag } from 'antd';
import { BrandType, BRAND_CONSTANTS } from '../../types/brand.types';

interface BrandTypeTagProps {
  type: BrandType;
  className?: string;
}

/**
 * 品牌类型标签原子组件
 * 用于显示品牌的不同类型，使用不同样式区分
 */
const BrandTypeTag: React.FC<BrandTypeTagProps> = ({ type, className }) => {
  const text = BRAND_CONSTANTS.TYPE_LABELS[type];

  // 根据类型设置不同的颜色
  const getTagColor = (type: BrandType): string => {
    switch (type) {
      case BrandType.OWN:
        return 'blue';
      case BrandType.AGENCY:
        return 'green';
      case BrandType.JOINT:
        return 'orange';
      case BrandType.OTHER:
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Tag
      color={getTagColor(type)}
      className={`brand-type-tag ${className || ''}`}
      data-testid="brand-type"
    >
      {text}
    </Tag>
  );
};

export default BrandTypeTag;
