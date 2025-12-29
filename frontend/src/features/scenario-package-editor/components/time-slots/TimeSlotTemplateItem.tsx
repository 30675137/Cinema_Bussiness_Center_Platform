/**
 * TimeSlotTemplateItem 组件
 * 单个时段模板卡片展示
 * Feature: 001-scenario-package-tabs
 */

import React from 'react';
import { Card, Switch, Button, Tooltip, Space, Typography, Popconfirm, Tag } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { TimeSlotTemplate } from '../../types';

const { Text } = Typography;

interface TimeSlotTemplateItemProps {
  /** 时段模板数据 */
  template: TimeSlotTemplate;
  /** 编辑回调 */
  onEdit: () => void;
  /** 删除回调 */
  onDelete: () => void;
  /** 切换启用状态回调 */
  onToggleEnabled: (enabled: boolean) => void;
  /** 复制回调 */
  onCopy?: () => void;
}

/**
 * 格式化时间显示
 */
const formatTime = (time: string): string => {
  // 处理 HH:mm:ss 或 HH:mm 格式
  return time.substring(0, 5);
};

/**
 * 格式化价格调整显示
 */
const formatPriceAdjustment = (priceAdjustment?: { type?: string; value?: number }): string | null => {
  if (!priceAdjustment || priceAdjustment.value === undefined) return null;
  
  const { type = 'fixed', value } = priceAdjustment;
  
  if (type === 'percentage') {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  }
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}¥${value}`;
};

/**
 * 时段模板卡片组件
 */
export const TimeSlotTemplateItem: React.FC<TimeSlotTemplateItemProps> = ({
  template,
  onEdit,
  onDelete,
  onToggleEnabled,
  onCopy,
}) => {
  const { startTime, endTime, capacity, priceAdjustment, isEnabled } = template;
  const priceText = formatPriceAdjustment(priceAdjustment as { type?: string; value?: number });
  
  return (
    <Card
      size="small"
      hoverable
      style={{
        opacity: isEnabled ? 1 : 0.6,
        borderColor: isEnabled ? undefined : '#d9d9d9',
      }}
      styles={{
        body: { padding: '8px 12px' },
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* 左侧：时间和容量信息 */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <ClockCircleOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: 14 }}>
              {formatTime(startTime)} - {formatTime(endTime)}
            </Text>
          </div>
          
          <Space size={8} wrap>
            {capacity !== undefined && capacity !== null && (
              <Tooltip title="可预约容量">
                <Tag icon={<TeamOutlined />} color="blue">
                  容量: {capacity}
                </Tag>
              </Tooltip>
            )}
            
            {priceText && (
              <Tooltip title="价格调整">
                <Tag color={priceText.startsWith('+') ? 'red' : 'green'}>
                  {priceText}
                </Tag>
              </Tooltip>
            )}
            
            {!isEnabled && (
              <Tag color="default">已禁用</Tag>
            )}
          </Space>
        </div>
        
        {/* 右侧：操作按钮 */}
        <Space size={0}>
          <Tooltip title={isEnabled ? '禁用' : '启用'}>
            <Switch
              size="small"
              checked={isEnabled}
              onChange={onToggleEnabled}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          
          {onCopy && (
            <Tooltip title="复制到其他天">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={onCopy}
              />
            </Tooltip>
          )}
          
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={onEdit}
            />
          </Tooltip>
          
          <Popconfirm
            title="确认删除"
            description="确定要删除这个时段吗？"
            onConfirm={onDelete}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};

export default TimeSlotTemplateItem;
