/**
 * P004-inventory-adjustment: 调整状态标签组件
 *
 * 显示库存调整记录的状态标签。
 * 实现 T054 任务。
 *
 * @since US4 - 大额库存调整审批
 */

import React from 'react';
import { Tag } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { AdjustmentStatus } from '../types/adjustment';

export interface AdjustmentStatusTagProps {
  /** 调整状态 */
  status: AdjustmentStatus;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 标签大小 */
  size?: 'small' | 'default';
}

/**
 * 状态配置
 */
const STATUS_CONFIG: Record<
  AdjustmentStatus,
  {
    text: string;
    color: string;
    icon: React.ReactNode;
  }
> = {
  draft: {
    text: '草稿',
    color: 'default',
    icon: <EditOutlined />,
  },
  pending_approval: {
    text: '待审批',
    color: 'processing',
    icon: <ClockCircleOutlined />,
  },
  approved: {
    text: '已通过',
    color: 'success',
    icon: <CheckCircleOutlined />,
  },
  rejected: {
    text: '已拒绝',
    color: 'error',
    icon: <CloseCircleOutlined />,
  },
  withdrawn: {
    text: '已撤回',
    color: 'warning',
    icon: <ExclamationCircleOutlined />,
  },
};

/**
 * 调整状态标签组件
 *
 * @example
 * ```tsx
 * <AdjustmentStatusTag status="pending_approval" showIcon />
 * ```
 */
export const AdjustmentStatusTag: React.FC<AdjustmentStatusTagProps> = ({
  status,
  showIcon = true,
  size = 'default',
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <Tag
      color={config.color}
      icon={showIcon ? config.icon : undefined}
      style={{
        fontSize: size === 'small' ? 12 : 14,
        padding: size === 'small' ? '0 4px' : '0 8px',
      }}
      data-testid="adjustment-status-tag"
    >
      {config.text}
    </Tag>
  );
};

export default AdjustmentStatusTag;
