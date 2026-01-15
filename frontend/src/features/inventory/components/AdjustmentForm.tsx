/**
 * P004-inventory-adjustment: 库存调整表单组件
 *
 * 用于录入库存调整信息，包括调整类型、数量和原因选择。
 * 实现 T018 任务。
 */

import React, { useEffect, useMemo } from 'react';
import { Form, Select, InputNumber, Input, Alert, Spin, Typography, Space, Tag } from 'antd';
import type { FormInstance } from 'antd';
import { useAdjustmentReasonsByType } from '../hooks/useAdjustmentReasons';
import {
  ADJUSTMENT_TYPE_OPTIONS,
  APPROVAL_THRESHOLD,
  requiresApproval,
  calculateStockAfter,
  type AdjustmentType,
  type CreateAdjustmentRequest,
} from '../types/adjustment';
import type { StoreInventoryItem } from '../types';

const { Text } = Typography;
const { TextArea } = Input;

/**
 * 调整表单数据类型（不包含 skuId 和 storeId，由外部传入）
 */
export interface AdjustmentFormData {
  adjustmentType: AdjustmentType;
  quantity: number;
  reasonCode: string;
  reasonText?: string;
  remarks?: string;
}

/**
 * AdjustmentForm 组件属性
 */
export interface AdjustmentFormProps {
  /** Form 实例，由父组件传入 */
  form: FormInstance<AdjustmentFormData>;
  /** 当前库存信息 */
  inventory: StoreInventoryItem;
  /** 是否禁用 */
  disabled?: boolean;
  /** 调整金额变化时的回调 */
  onAmountChange?: (amount: number, needsApproval: boolean) => void;
}

/**
 * 库存调整表单组件
 *
 * 功能：
 * - 选择调整类型（盘盈/盘亏/报损）
 * - 输入调整数量
 * - 选择调整原因（必填，根据调整类型过滤）
 * - 填写原因说明（可选）
 * - 填写备注（可选）
 * - 实时显示调整金额和审批提示
 *
 * @example
 * ```tsx
 * <AdjustmentForm
 *   form={form}
 *   inventory={inventoryItem}
 *   onAmountChange={(amount, needsApproval) => {
 *     setShowApprovalHint(needsApproval);
 *   }}
 * />
 * ```
 */
export const AdjustmentForm: React.FC<AdjustmentFormProps> = ({
  form,
  inventory,
  disabled = false,
  onAmountChange,
}) => {
  // 监听表单值变化
  const adjustmentType = Form.useWatch('adjustmentType', form);
  const quantity = Form.useWatch('quantity', form);

  // 获取按类型过滤的调整原因
  const {
    data: reasons,
    isLoading: reasonsLoading,
    error: reasonsError,
  } = useAdjustmentReasonsByType(adjustmentType);

  // 计算原因选项
  const reasonOptions = useMemo(() => {
    return (reasons || []).map((reason) => ({
      value: reason.code,
      label: reason.name,
    }));
  }, [reasons]);

  // 计算调整金额（假设单价从库存信息获取，这里暂用模拟值）
  // 实际项目中应该从 SKU 主数据获取单价
  const unitPrice = 50; // 模拟单价
  const adjustmentAmount = useMemo(() => {
    if (!quantity || quantity <= 0) return 0;
    return quantity * unitPrice;
  }, [quantity, unitPrice]);

  // 是否需要审批
  const needsApproval = useMemo(() => {
    if (!quantity || quantity <= 0) return false;
    return requiresApproval(quantity, unitPrice);
  }, [quantity, unitPrice]);

  // 计算调整后库存预览
  const stockPreview = useMemo(() => {
    if (!adjustmentType || !quantity || quantity <= 0) {
      return null;
    }
    const currentStock = inventory.onHandQty;
    const afterStock = calculateStockAfter(currentStock, adjustmentType, quantity);
    return {
      before: currentStock,
      after: afterStock,
      change: adjustmentType === 'surplus' ? quantity : -quantity,
    };
  }, [adjustmentType, quantity, inventory.onHandQty]);

  // 当调整类型改变时，清空原因选择
  useEffect(() => {
    if (adjustmentType) {
      form.setFieldValue('reasonCode', undefined);
    }
  }, [adjustmentType, form]);

  // 通知父组件金额变化
  useEffect(() => {
    onAmountChange?.(adjustmentAmount, needsApproval);
  }, [adjustmentAmount, needsApproval, onAmountChange]);

  return (
    <Form form={form} layout="vertical" disabled={disabled} requiredMark="optional">
      {/* SKU 信息显示 */}
      <div
        style={{
          background: '#f5f5f5',
          padding: 12,
          borderRadius: 6,
          marginBottom: 16,
        }}
      >
        <Space direction="vertical" size={4}>
          <Text type="secondary">调整商品</Text>
          <Text strong>{inventory.skuName}</Text>
          <Space>
            <Text type="secondary">SKU编码: {inventory.skuCode}</Text>
            <Text type="secondary">
              当前库存: {inventory.onHandQty} {inventory.mainUnit}
            </Text>
          </Space>
        </Space>
      </div>

      {/* 调整类型 */}
      <Form.Item
        name="adjustmentType"
        label="调整类型"
        rules={[{ required: true, message: '请选择调整类型' }]}
      >
        <Select
          placeholder="请选择调整类型"
          options={ADJUSTMENT_TYPE_OPTIONS.map((opt) => ({
            value: opt.value,
            label: (
              <Space>
                <Tag color={opt.color}>{opt.label}</Tag>
                <Text type="secondary">
                  {opt.effect === 'increase' ? '(增加库存)' : '(减少库存)'}
                </Text>
              </Space>
            ),
          }))}
          data-testid="adjustment-type-select"
        />
      </Form.Item>

      {/* 调整数量 */}
      <Form.Item
        name="quantity"
        label="调整数量"
        rules={[
          { required: true, message: '请输入调整数量' },
          { type: 'number', min: 1, message: '调整数量必须大于0' },
        ]}
        extra={
          stockPreview && (
            <Space style={{ marginTop: 4 }}>
              <Text type="secondary">调整后:</Text>
              <Text>
                {stockPreview.before}
                <Text type={stockPreview.change > 0 ? 'success' : 'danger'}>
                  {' '}
                  → {stockPreview.after}
                </Text>
              </Text>
              <Text type="secondary">{inventory.mainUnit}</Text>
            </Space>
          )
        }
      >
        <InputNumber
          min={1}
          precision={0}
          style={{ width: '100%' }}
          placeholder="请输入调整数量（正整数）"
          addonAfter={inventory.mainUnit}
          data-testid="adjustment-quantity-input"
        />
      </Form.Item>

      {/* 调整原因 */}
      <Form.Item
        name="reasonCode"
        label="调整原因"
        rules={[{ required: true, message: '请选择调整原因' }]}
      >
        <Select
          placeholder={adjustmentType ? '请选择调整原因' : '请先选择调整类型'}
          options={reasonOptions}
          loading={reasonsLoading}
          disabled={!adjustmentType || reasonsLoading}
          notFoundContent={
            reasonsLoading ? (
              <Spin size="small" />
            ) : reasonsError ? (
              <Text type="danger">加载失败</Text>
            ) : (
              '暂无选项'
            )
          }
          data-testid="adjustment-reason-select"
        />
      </Form.Item>

      {/* 原因说明 */}
      <Form.Item
        name="reasonText"
        label="原因说明"
        rules={[{ max: 500, message: '原因说明不能超过500字符' }]}
      >
        <TextArea
          rows={2}
          placeholder="可选：补充说明调整原因"
          maxLength={500}
          showCount
          data-testid="adjustment-reason-text"
        />
      </Form.Item>

      {/* 备注 */}
      <Form.Item name="remarks" label="备注" rules={[{ max: 500, message: '备注不能超过500字符' }]}>
        <TextArea
          rows={2}
          placeholder="可选：其他备注信息"
          maxLength={500}
          showCount
          data-testid="adjustment-remarks"
        />
      </Form.Item>

      {/* 审批提示 */}
      {needsApproval && (
        <Alert
          type="warning"
          message="需要审批"
          description={`调整金额 ¥${adjustmentAmount.toFixed(2)} 已达到审批阈值 ¥${APPROVAL_THRESHOLD}，提交后将进入待审批状态。`}
          showIcon
          style={{ marginTop: 8 }}
          data-testid="approval-required-alert"
        />
      )}

      {/* 调整金额显示 */}
      {adjustmentAmount > 0 && (
        <div
          style={{
            background: '#fafafa',
            padding: 12,
            borderRadius: 6,
            marginTop: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text type="secondary">预估调整金额:</Text>
          <Text strong style={{ fontSize: 16 }}>
            ¥ {adjustmentAmount.toFixed(2)}
          </Text>
        </div>
      )}
    </Form>
  );
};

export default AdjustmentForm;
