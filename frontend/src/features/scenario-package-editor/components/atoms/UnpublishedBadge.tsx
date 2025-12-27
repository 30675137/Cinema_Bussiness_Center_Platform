/**
 * UnpublishedBadge 原子组件
 * 发布状态徽章
 * Feature: 001-scenario-package-tabs
 */

import React from 'react';
import { Tag } from 'antd';
import type { PublishStatus } from '../../types';

interface UnpublishedBadgeProps {
  /** 发布状态 */
  status: PublishStatus;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

const STATUS_CONFIG: Record<PublishStatus, { color: string; text: string }> = {
  DRAFT: {
    color: 'default',
    text: '草稿',
  },
  PUBLISHED: {
    color: 'success',
    text: '已发布',
  },
  ARCHIVED: {
    color: 'warning',
    text: '已下架',
  },
};

/**
 * 发布状态徽章组件
 * 
 * @example
 * <UnpublishedBadge status="DRAFT" />
 * <UnpublishedBadge status="PUBLISHED" />
 * <UnpublishedBadge status="ARCHIVED" />
 */
const UnpublishedBadge: React.FC<UnpublishedBadgeProps> = ({ status, style }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  return (
    <Tag color={config.color} style={style}>
      {config.text}
    </Tag>
  );
};

export default UnpublishedBadge;
