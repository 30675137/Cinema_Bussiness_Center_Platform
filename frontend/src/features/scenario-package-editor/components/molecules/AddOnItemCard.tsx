/**
 * AddOnItemCard 组件
 * 加购项卡片
 * Feature: 001-scenario-package-tabs
 */

import React from 'react';
import { Card, Typography, Image, Checkbox, Tag, Space } from 'antd';
import type { AddOnItem } from '../../types';

const { Text } = Typography;

interface AddOnItemCardProps {
  /** 加购项数据 */
  item: AddOnItem;
  /** 是否已选中 */
  selected: boolean;
  /** 选中状态变化回调 */
  onSelect: (itemId: string, selected: boolean) => void;
  /** 是否必选 */
  isRequired?: boolean;
  /** 必选状态变化回调 */
  onRequiredChange?: (itemId: string, required: boolean) => void;
}

/**
 * 格式化价格（单位：元）
 */
const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`;
};

/**
 * 获取分类标签颜色
 */
const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    CATERING: 'orange',
    BEVERAGE: 'blue',
    SERVICE: 'green',
    DECORATION: 'purple',
  };
  return colorMap[category] || 'default';
};

/**
 * 获取分类标签文本
 */
const getCategoryLabel = (category: string): string => {
  const labelMap: Record<string, string> = {
    CATERING: '餐饮',
    BEVERAGE: '饮品',
    SERVICE: '服务',
    DECORATION: '布置',
  };
  return labelMap[category] || category;
};

/**
 * 加购项卡片组件
 */
const AddOnItemCard: React.FC<AddOnItemCardProps> = ({
  item,
  selected,
  onSelect,
  isRequired = false,
  onRequiredChange,
}) => {
  return (
    <Card
      size="small"
      hoverable
      style={{
        border: selected ? '2px solid #1890ff' : '1px solid #f0f0f0',
        background: selected ? '#f0f7ff' : '#fff',
      }}
      styles={{ body: { padding: 12 } }}
      onClick={() => onSelect(item.id, !selected)}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        {/* 选择框 */}
        <Checkbox checked={selected} onClick={(e) => e.stopPropagation()} />

        {/* 图片 */}
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            width={60}
            height={60}
            style={{ borderRadius: 4, objectFit: 'cover' }}
            preview={false}
            alt={item.name}
          />
        )}

        {/* 信息 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text strong>{item.name}</Text>
            <Tag color={getCategoryColor(item.category)} style={{ marginRight: 0 }}>
              {getCategoryLabel(item.category)}
            </Tag>
          </div>
          <Text type="danger" strong>
            {formatPrice(item.price)}
          </Text>
          {item.inventory !== null && (
            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
              库存: {item.inventory}
            </Text>
          )}

          {/* 必选选项 */}
          {selected && onRequiredChange && (
            <div style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isRequired}
                onChange={(e) => onRequiredChange(item.id, e.target.checked)}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  设为必选
                </Text>
              </Checkbox>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AddOnItemCard;
