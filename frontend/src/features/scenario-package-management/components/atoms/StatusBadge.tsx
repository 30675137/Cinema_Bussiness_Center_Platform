/**
 * 状态标签组件
 *
 * 显示场景包状态：草稿、已发布、已下架
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React from 'react';
import { Tag } from 'antd';
import type { PackageStatus } from '../../types';

interface StatusBadgeProps {
  /** 场景包状态 */
  status: PackageStatus;
  /** 是否显示文字 */
  showText?: boolean;
}

/** 状态配置 */
const STATUS_CONFIG: Record<PackageStatus, { color: string; text: string }> = {
  DRAFT: {
    color: 'default',
    text: '草稿',
  },
  PUBLISHED: {
    color: 'success',
    text: '已发布',
  },
  UNPUBLISHED: {
    color: 'warning',
    text: '已下架',
  },
};

/**
 * 状态标签组件
 *
 * 根据场景包状态显示对应的颜色标签
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showText = true,
}) => {
  const config = STATUS_CONFIG[status] || {
    color: 'default',
    text: status,
  };

  return (
    <Tag color={config.color}>
      {showText ? config.text : null}
    </Tag>
  );
};

/**
 * 获取状态文本
 */
export const getStatusText = (status: PackageStatus): string => {
  return STATUS_CONFIG[status]?.text || status;
};

/**
 * 获取状态颜色
 */
export const getStatusColor = (status: PackageStatus): string => {
  return STATUS_CONFIG[status]?.color || 'default';
};

export default StatusBadge;
