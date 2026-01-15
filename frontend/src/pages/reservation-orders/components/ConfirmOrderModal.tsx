/**
 * 确认预约对话框组件
 *
 * 支持选择是否要求支付
 * - 要求客户支付: 状态变更为 CONFIRMED
 * - 直接完成(无需支付): 状态变更为 COMPLETED
 */

import React, { useState, useCallback, memo } from 'react';
import { Modal, Radio, Input, Space, Typography, Alert } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { useConfirmReservation } from '../hooks/useOrderOperations';
import type { ConfirmOrderModalProps } from '../types/reservation-order.types';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * 确认预约对话框组件
 */
const ConfirmOrderModal: React.FC<ConfirmOrderModalProps> = ({
  open,
  orderId,
  onClose,
  onSuccess,
}) => {
  // 是否要求支付，默认为 true
  const [requiresPayment, setRequiresPayment] = useState<boolean>(true);
  // 备注
  const [remark, setRemark] = useState<string>('');

  // 确认预约 mutation
  const confirmMutation = useConfirmReservation();

  /**
   * 处理支付选项变更
   */
  const handlePaymentChange = useCallback((e: RadioChangeEvent) => {
    setRequiresPayment(e.target.value);
  }, []);

  /**
   * 处理确认
   */
  const handleConfirm = useCallback(async () => {
    try {
      await confirmMutation.mutateAsync({
        id: orderId,
        request: {
          requiresPayment,
          remark: remark.trim() || undefined,
        },
      });
      // 重置状态
      setRequiresPayment(true);
      setRemark('');
      // 触发成功回调
      onSuccess();
      onClose();
    } catch {
      // 错误已在 mutation 中处理
    }
  }, [orderId, requiresPayment, remark, confirmMutation, onSuccess, onClose]);

  /**
   * 处理取消
   */
  const handleCancel = useCallback(() => {
    // 重置状态
    setRequiresPayment(true);
    setRemark('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      title="确认预约"
      open={open}
      onOk={handleConfirm}
      onCancel={handleCancel}
      confirmLoading={confirmMutation.isPending}
      okText="确认"
      cancelText="取消"
      destroyOnClose
      width={480}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 提示信息 */}
        <Alert
          message="请选择确认方式"
          description="确认后将通知客户预约已受理"
          type="info"
          showIcon
        />

        {/* 支付选项 */}
        <div>
          <Text strong style={{ marginBottom: 12, display: 'block' }}>
            支付要求
          </Text>
          <Radio.Group
            value={requiresPayment}
            onChange={handlePaymentChange}
            style={{ width: '100%' }}
          >
            <Space direction="vertical">
              <Radio value={true}>
                <Space direction="vertical" size={0}>
                  <Text strong>要求客户支付</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    客户需完成支付后预约才生效，状态变更为「已确认」
                  </Text>
                </Space>
              </Radio>
              <Radio value={false}>
                <Space direction="vertical" size={0}>
                  <Text strong>直接完成（无需支付）</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    无需客户支付，直接完成预约，状态变更为「已完成」
                  </Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* 备注 */}
        <div>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>
            操作备注（可选）
          </Text>
          <TextArea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="请输入备注信息..."
            maxLength={200}
            showCount
            rows={3}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default memo(ConfirmOrderModal);
