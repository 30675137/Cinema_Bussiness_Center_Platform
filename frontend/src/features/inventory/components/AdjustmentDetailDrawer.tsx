/**
 * P004-inventory-adjustment: 调整详情抽屉组件
 *
 * 显示调整记录详情，支持撤回操作。
 * 实现 T053 任务。
 *
 * @since US4 - 大额库存调整审批
 */

import React from 'react';
import {
  Drawer,
  Descriptions,
  Divider,
  Typography,
  Space,
  Button,
  Tag,
  Timeline,
  Popconfirm,
  Spin,
  Alert,
} from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AdjustmentStatusTag } from './AdjustmentStatusTag';
import { useAdjustmentDetail, useWithdrawAdjustment } from '../hooks/useInventoryAdjustment';
import { canWithdraw } from '../utils/approvalUtils';
import type { InventoryAdjustment } from '../types/adjustment';

const { Title, Text } = Typography;

export interface AdjustmentDetailDrawerProps {
  /** 调整记录ID */
  adjustmentId: string | undefined;
  /** 是否显示 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 撤回成功回调 */
  onWithdrawSuccess?: () => void;
}

/**
 * 调整详情抽屉组件
 *
 * 功能：
 * - 显示调整记录完整信息
 * - 显示审批历史
 * - 待审批状态可撤回
 *
 * @example
 * ```tsx
 * <AdjustmentDetailDrawer
 *   adjustmentId={selectedId}
 *   open={drawerOpen}
 *   onClose={() => setDrawerOpen(false)}
 * />
 * ```
 */
export const AdjustmentDetailDrawer: React.FC<AdjustmentDetailDrawerProps> = ({
  adjustmentId,
  open,
  onClose,
  onWithdrawSuccess,
}) => {
  // 获取调整详情
  const {
    data: adjustment,
    isLoading,
    isError,
  } = useAdjustmentDetail(adjustmentId, open && !!adjustmentId);

  // 撤回操作
  const { mutate: withdrawAdjustment, isPending: isWithdrawing } = useWithdrawAdjustment({
    onSuccess: () => {
      onWithdrawSuccess?.();
      onClose();
    },
  });

  // 处理撤回
  const handleWithdraw = () => {
    if (adjustmentId) {
      withdrawAdjustment(adjustmentId);
    }
  };

  // 是否可撤回
  const showWithdrawButton = adjustment && canWithdraw(adjustment.status);

  return (
    <Drawer
      title="调整详情"
      placement="right"
      width={500}
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        showWithdrawButton && (
          <Popconfirm
            title="确认撤回"
            description="撤回后调整申请将被取消，确定要撤回吗？"
            onConfirm={handleWithdraw}
            okText="确定撤回"
            cancelText="取消"
            icon={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
          >
            <Button danger loading={isWithdrawing}>
              撤回申请
            </Button>
          </Popconfirm>
        )
      }
    >
      {/* 加载状态 */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" tip="加载中..." />
        </div>
      )}

      {/* 错误状态 */}
      {isError && <Alert type="error" message="加载失败" description="无法加载调整详情" />}

      {/* 详情内容 */}
      {adjustment && (
        <>
          {/* 基本信息 */}
          <Descriptions title="基本信息" column={1} bordered size="small">
            <Descriptions.Item label="调整单号">
              <Text copyable>{adjustment.adjustmentNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <AdjustmentStatusTag status={adjustment.status} />
            </Descriptions.Item>
            <Descriptions.Item label="申请人">{adjustment.operatorName}</Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {dayjs(adjustment.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 商品信息 */}
          <Descriptions title="商品信息" column={1} bordered size="small">
            <Descriptions.Item label="SKU编码">{adjustment.sku?.code || '-'}</Descriptions.Item>
            <Descriptions.Item label="SKU名称">{adjustment.sku?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="门店">{adjustment.store?.name || '-'}</Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 调整信息 */}
          <Descriptions title="调整信息" column={1} bordered size="small">
            <Descriptions.Item label="调整类型">
              <Tag
                color={
                  adjustment.adjustmentType === 'surplus'
                    ? 'green'
                    : adjustment.adjustmentType === 'shortage'
                      ? 'orange'
                      : 'red'
                }
              >
                {adjustment.adjustmentType === 'surplus'
                  ? '盘盈'
                  : adjustment.adjustmentType === 'shortage'
                    ? '盘亏'
                    : '报损'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="调整数量">
              <Text strong>
                {adjustment.adjustmentType === 'surplus' ? '+' : '-'}
                {adjustment.quantity}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="单价">
              ¥{adjustment.unitPrice?.toFixed(2) || '0.00'}
            </Descriptions.Item>
            <Descriptions.Item label="调整金额">
              <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                ¥{adjustment.adjustmentAmount.toFixed(2)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="库存变化">
              <Space>
                <Text>{adjustment.stockBefore}</Text>
                <Text>→</Text>
                <Text strong>{adjustment.stockAfter}</Text>
              </Space>
            </Descriptions.Item>
            {adjustment.requiresApproval && (
              <Descriptions.Item label="审批状态">
                <Text type="warning">需要审批 (金额 ≥ ¥1000)</Text>
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          {/* 原因信息 */}
          <Descriptions title="调整原因" column={1} bordered size="small">
            <Descriptions.Item label="原因类型">{adjustment.reasonCode}</Descriptions.Item>
            {adjustment.reasonText && (
              <Descriptions.Item label="原因说明">{adjustment.reasonText}</Descriptions.Item>
            )}
            {adjustment.remarks && (
              <Descriptions.Item label="备注">{adjustment.remarks}</Descriptions.Item>
            )}
          </Descriptions>

          {/* 审批历史 */}
          {adjustment.approvalHistory && adjustment.approvalHistory.length > 0 && (
            <>
              <Divider />
              <Title level={5}>审批历史</Title>
              <Timeline
                items={adjustment.approvalHistory.map((record) => ({
                  color:
                    record.action === 'approve'
                      ? 'green'
                      : record.action === 'reject'
                        ? 'red'
                        : 'gray',
                  children: (
                    <div>
                      <Text strong>{record.approverName}</Text>
                      <Text type="secondary">
                        {' '}
                        {record.action === 'approve'
                          ? '通过'
                          : record.action === 'reject'
                            ? '拒绝'
                            : '撤回'}
                      </Text>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(record.actionTime).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </div>
                      {record.comments && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">意见：{record.comments}</Text>
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            </>
          )}
        </>
      )}
    </Drawer>
  );
};

export default AdjustmentDetailDrawer;
