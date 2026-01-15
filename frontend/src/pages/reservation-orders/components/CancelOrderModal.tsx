/**
 * 取消预约对话框组件
 *
 * 填写取消原因
 */

import React, { useState, useCallback, memo } from 'react';
import { Modal, Radio, Input, Space, Typography, Form } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { useCancelReservation } from '../hooks/useOrderOperations';
import type { CancelOrderModalProps } from '../types/reservation-order.types';
import { CANCEL_REASON_TYPE_CONFIG, type CancelReasonType } from '../types/reservation-order.types';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * 取消原因类型选项
 */
const CANCEL_REASON_OPTIONS = (Object.keys(CANCEL_REASON_TYPE_CONFIG) as CancelReasonType[]).map(
  (key) => ({
    value: key,
    label: CANCEL_REASON_TYPE_CONFIG[key].label,
  })
);

/**
 * 取消预约对话框组件
 */
const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  open,
  orderId,
  onClose,
  onSuccess,
}) => {
  // 取消原因类型
  const [cancelReasonType, setCancelReasonType] = useState<CancelReasonType>('CUSTOMER_REQUEST');
  // 取消原因详情
  const [cancelReason, setCancelReason] = useState<string>('');
  // 表单验证错误
  const [error, setError] = useState<string>('');

  // 取消预约 mutation
  const cancelMutation = useCancelReservation();

  /**
   * 处理原因类型变更
   */
  const handleReasonTypeChange = useCallback((e: RadioChangeEvent) => {
    setCancelReasonType(e.target.value);
    // 如果选择预设原因，自动填充
    if (e.target.value !== 'OTHER') {
      const label = CANCEL_REASON_TYPE_CONFIG[e.target.value as CancelReasonType]?.label;
      setCancelReason(label || '');
    } else {
      setCancelReason('');
    }
  }, []);

  /**
   * 处理取消
   */
  const handleConfirm = useCallback(async () => {
    // 验证
    const reason = cancelReason.trim();
    if (!reason) {
      setError('请填写取消原因');
      return;
    }
    if (reason.length > 200) {
      setError('取消原因不能超过200个字符');
      return;
    }

    setError('');

    try {
      await cancelMutation.mutateAsync({
        id: orderId,
        request: {
          cancelReasonType,
          cancelReason: reason,
        },
      });
      // 重置状态
      setCancelReasonType('CUSTOMER_REQUEST');
      setCancelReason('');
      // 触发成功回调
      onSuccess();
      onClose();
    } catch {
      // 错误已在 mutation 中处理
    }
  }, [orderId, cancelReasonType, cancelReason, cancelMutation, onSuccess, onClose]);

  /**
   * 处理关闭
   */
  const handleCancel = useCallback(() => {
    // 重置状态
    setCancelReasonType('CUSTOMER_REQUEST');
    setCancelReason('');
    setError('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      title="取消预约"
      open={open}
      onOk={handleConfirm}
      onCancel={handleCancel}
      confirmLoading={cancelMutation.isPending}
      okText="确认取消"
      okButtonProps={{ danger: true }}
      cancelText="返回"
      destroyOnClose
      width={480}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 取消原因类型 */}
        <div>
          <Text strong style={{ marginBottom: 12, display: 'block' }}>
            取消原因类型
          </Text>
          <Radio.Group
            value={cancelReasonType}
            onChange={handleReasonTypeChange}
            style={{ width: '100%' }}
          >
            <Space direction="vertical">
              {CANCEL_REASON_OPTIONS.map((option) => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        {/* 取消原因详情 */}
        <Form.Item
          label={<Text strong>取消原因详情</Text>}
          required
          validateStatus={error ? 'error' : ''}
          help={error}
          style={{ marginBottom: 0 }}
        >
          <TextArea
            value={cancelReason}
            onChange={(e) => {
              setCancelReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="请详细描述取消原因..."
            maxLength={200}
            showCount
            rows={4}
          />
        </Form.Item>

        {/* 提示 */}
        <Text type="secondary" style={{ fontSize: 12 }}>
          取消后将通知客户预约已取消，已占用的时段库存将被释放。
        </Text>
      </Space>
    </Modal>
  );
};

export default memo(CancelOrderModal);
