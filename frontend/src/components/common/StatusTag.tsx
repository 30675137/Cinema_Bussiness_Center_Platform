import React from 'react';
import { Tag } from 'antd';
import type { TagProps } from 'antd/es/tag';

export interface StatusTagProps extends Omit<TagProps, 'color'> {
  status: string | number;
  statusMap?: Record<string | number, { color: string; text: string }>;
  customRender?: (status: string | number) => React.ReactNode;
}

const StatusTag: React.FC<StatusTagProps> = ({
  status,
  statusMap = {},
  customRender,
  ...tagProps
}) => {
  // 默认状态映射
  const defaultStatusMap: Record<string, { color: string; text: string }> = {
    // 采购订单状态
    draft: { color: 'default', text: '草稿' },
    pending: { color: 'processing', text: '审批中' },
    approved: { color: 'success', text: '已审批' },
    partial_received: { color: 'warning', text: '部分收货' },
    received: { color: 'success', text: '已收货' },
    closed: { color: 'default', text: '已关闭' },
    cancelled: { color: 'error', text: '已作废' },

    // 收货单状态
    draft_receipt: { color: 'default', text: '草稿' },
    completed: { color: 'success', text: '已完成' },
    cancelled_receipt: { color: 'error', text: '已作废' },

    // 通用状态
    active: { color: 'success', text: '启用' },
    inactive: { color: 'default', text: '禁用' },
    suspended: { color: 'warning', text: '暂停' },

    // 质检状态
    qualified: { color: 'success', text: '合格' },
    unqualified: { color: 'error', text: '不合格' },
    pending_inspection: { color: 'processing', text: '待检' },
    exempted: { color: 'default', text: '免检' },

    // 数字状态
    0: { color: 'default', text: '禁用' },
    1: { color: 'success', text: '启用' },
    2: { color: 'warning', text: '警告' },
    3: { color: 'error', text: '错误' },
  };

  // 合并状态映射
  const finalStatusMap = { ...defaultStatusMap, ...statusMap };

  // 自定义渲染
  if (customRender) {
    return <>{customRender(status)}</>;
  }

  // 获取状态信息
  const statusInfo = finalStatusMap[status];

  if (!statusInfo) {
    return <Tag {...tagProps}>{String(status)}</Tag>;
  }

  return (
    <Tag color={statusInfo.color} {...tagProps}>
      {statusInfo.text}
    </Tag>
  );
};

export default StatusTag;
