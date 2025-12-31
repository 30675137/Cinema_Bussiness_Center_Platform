/**
 * EditableCard 原子组件
 * 可编辑卡片，带标题、描述和操作区域
 * Feature: 001-scenario-package-tabs
 */

import React from 'react';
import { Card, Typography, Space } from 'antd';
import type { CardProps } from 'antd';

const { Title, Text } = Typography;

interface EditableCardProps extends Omit<CardProps, 'title'> {
  /** 卡片标题 */
  title: React.ReactNode;
  /** 卡片描述 */
  description?: React.ReactNode;
  /** 右上角操作区域 */
  extra?: React.ReactNode;
  /** 是否可编辑状态（影响样式） */
  editable?: boolean;
  /** 是否有未保存的修改 */
  isDirty?: boolean;
  /** 卡片内容 */
  children: React.ReactNode;
}

/**
 * 可编辑卡片组件
 *
 * @example
 * <EditableCard
 *   title="套餐信息"
 *   description="配置套餐名称和价格"
 *   extra={<Button>添加</Button>}
 *   isDirty={true}
 * >
 *   <Form>...</Form>
 * </EditableCard>
 */
const EditableCard: React.FC<EditableCardProps> = ({
  title,
  description,
  extra,
  editable = true,
  isDirty = false,
  children,
  className,
  style,
  ...restProps
}) => {
  const cardTitle = (
    <Space direction="vertical" size={4}>
      <Space>
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        {isDirty && (
          <Text type="warning" style={{ fontSize: 12 }}>
            (未保存)
          </Text>
        )}
      </Space>
      {description && (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {description}
        </Text>
      )}
    </Space>
  );

  return (
    <Card
      title={cardTitle}
      extra={extra}
      className={className}
      style={{
        borderLeft: isDirty ? '3px solid #faad14' : undefined,
        ...style,
      }}
      {...restProps}
    >
      {children}
    </Card>
  );
};

export default EditableCard;
