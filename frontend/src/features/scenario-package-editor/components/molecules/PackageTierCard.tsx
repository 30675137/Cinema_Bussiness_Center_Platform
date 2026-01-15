/**
 * PackageTierCard 组件
 * 套餐卡片展示
 * Feature: 001-scenario-package-tabs
 */

import React from 'react';
import { Card, Typography, Tag, Space, Button, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import type { PackageTier } from '../../types';

const { Text, Paragraph } = Typography;

interface PackageTierCardProps {
  /** 套餐数据 */
  tier: PackageTier;
  /** 编辑回调 */
  onEdit: (tier: PackageTier) => void;
  /** 删除回调 */
  onDelete: (tierId: string) => void;
  /** 是否正在删除 */
  deleting?: boolean;
  /** 拖拽手柄属性（用于 dnd-kit） */
  dragHandleProps?: Record<string, unknown>;
}

/**
 * 格式化价格（单位：元）
 */
const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`;
};

/**
 * 套餐卡片组件
 */
const PackageTierCard: React.FC<PackageTierCardProps> = ({
  tier,
  onEdit,
  onDelete,
  deleting = false,
  dragHandleProps,
}) => {
  return (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      styles={{
        body: { padding: 16 },
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* 拖拽手柄 */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            style={{
              cursor: 'grab',
              color: '#999',
              padding: '4px 0',
            }}
          >
            <HolderOutlined style={{ fontSize: 16 }} />
          </div>
        )}

        {/* 主要内容 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 套餐名称和标签 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Text strong style={{ fontSize: 15 }}>
              {tier.name}
            </Text>
            {tier.tags?.map((tag) => (
              <Tag key={tag} color="blue">
                {tag}
              </Tag>
            ))}
          </div>

          {/* 价格 */}
          <div style={{ marginBottom: 8 }}>
            <Text type="danger" strong style={{ fontSize: 18 }}>
              {formatPrice(tier.price)}
            </Text>
            {tier.originalPrice && tier.originalPrice > tier.price && (
              <Text delete type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
                {formatPrice(tier.originalPrice)}
              </Text>
            )}
          </div>

          {/* 服务内容 */}
          {tier.serviceDescription && (
            <Paragraph
              type="secondary"
              ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
              style={{ marginBottom: 0, fontSize: 13 }}
            >
              {tier.serviceDescription}
            </Paragraph>
          )}
        </div>

        {/* 操作按钮 */}
        <Space>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(tier)} />
          </Tooltip>
          <Popconfirm
            title="删除套餐"
            description="确定要删除这个套餐吗？"
            onConfirm={() => onDelete(tier.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};

export default PackageTierCard;
