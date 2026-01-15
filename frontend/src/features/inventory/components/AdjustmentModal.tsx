/**
 * P004-inventory-adjustment: 库存调整弹窗组件
 *
 * 组合 AdjustmentForm 和 ConfirmAdjustmentModal，提供完整的调整录入流程。
 * 实现 T020 任务。
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Modal, Form, Button, Space, message } from 'antd';
import { AdjustmentForm, type AdjustmentFormData } from './AdjustmentForm';
import { ConfirmAdjustmentModal, type ConfirmAdjustmentData } from './ConfirmAdjustmentModal';
import { useCreateAdjustment } from '../hooks/useInventoryAdjustment';
import { useAdjustmentReasons } from '../hooks/useAdjustmentReasons';
import { CreateAdjustmentSchema, getZodErrors } from '../types/adjustmentSchemas';
import type { StoreInventoryItem } from '../types';
import type { CreateAdjustmentRequest } from '../types/adjustment';

/**
 * AdjustmentModal 组件属性
 */
export interface AdjustmentModalProps {
  /** 是否显示 */
  open: boolean;
  /** 库存记录（用于获取 skuId, storeId 和当前库存信息） */
  inventory: StoreInventoryItem | null;
  /** 关闭回调 */
  onClose: () => void;
  /** 调整成功回调 */
  onSuccess?: () => void;
}

/**
 * 调整流程步骤
 */
type AdjustmentStep = 'form' | 'confirm';

/**
 * 库存调整弹窗组件
 *
 * 功能：
 * - 步骤1: 填写调整表单
 * - 步骤2: 确认调整详情（二次确认）
 * - 提交调整并处理结果
 *
 * @example
 * ```tsx
 * <AdjustmentModal
 *   open={modalOpen}
 *   inventory={selectedInventory}
 *   onClose={() => setModalOpen(false)}
 *   onSuccess={() => {
 *     setModalOpen(false);
 *     refreshList();
 *   }}
 * />
 * ```
 */
export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  open,
  inventory,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<AdjustmentFormData>();
  const [step, setStep] = useState<AdjustmentStep>('form');
  const [confirmData, setConfirmData] = useState<ConfirmAdjustmentData | null>(null);

  // 获取调整原因（用于显示原因名称）
  const { data: reasons } = useAdjustmentReasons();

  // 创建调整 mutation
  const { mutate: createAdjustment, isPending: isSubmitting } = useCreateAdjustment({
    onSuccess: () => {
      // 重置状态
      handleReset();
      // 调用成功回调
      onSuccess?.();
    },
  });

  // 重置弹窗状态
  const handleReset = useCallback(() => {
    form.resetFields();
    setStep('form');
    setConfirmData(null);
  }, [form]);

  // 关闭弹窗
  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  // 表单下一步（进入确认）
  const handleNext = useCallback(async () => {
    try {
      // 验证表单
      const values = await form.validateFields();

      // 使用 Zod 进行更严格的验证
      const validationResult = CreateAdjustmentSchema.safeParse({
        ...values,
        skuId: inventory?.skuId || '',
        storeId: inventory?.storeId || '',
      });

      if (!validationResult.success) {
        const errors = getZodErrors(validationResult.error);
        // 设置表单错误
        const fieldErrors = Object.entries(errors)
          .filter(([field]) =>
            ['adjustmentType', 'quantity', 'reasonCode', 'reasonText', 'remarks'].includes(field)
          )
          .map(([field, msg]) => ({
            name: field as keyof AdjustmentFormData,
            errors: [msg],
          }));
        form.setFields(fieldErrors);
        return;
      }

      // 获取原因名称
      const reason = reasons?.find((r) => r.code === values.reasonCode);

      // 设置确认数据
      setConfirmData({
        adjustmentType: values.adjustmentType,
        quantity: values.quantity,
        reasonCode: values.reasonCode,
        reasonName: reason?.name,
        reasonText: values.reasonText,
        remarks: values.remarks,
      });

      // 进入确认步骤
      setStep('confirm');
    } catch (error) {
      // 表单验证失败，错误会自动显示
      console.error('表单验证失败:', error);
    }
  }, [form, inventory, reasons]);

  // 返回表单
  const handleBack = useCallback(() => {
    setStep('form');
  }, []);

  // 确认提交
  const handleConfirm = useCallback(() => {
    if (!inventory || !confirmData) return;

    const request: CreateAdjustmentRequest = {
      skuId: inventory.skuId,
      storeId: inventory.storeId,
      adjustmentType: confirmData.adjustmentType,
      quantity: confirmData.quantity,
      reasonCode: confirmData.reasonCode,
      reasonText: confirmData.reasonText,
      remarks: confirmData.remarks,
    };

    createAdjustment(request);
  }, [inventory, confirmData, createAdjustment]);

  // 计算单价（从 SKU 主数据获取，这里暂用模拟值）
  const unitPrice = 50;

  // 表单弹窗标题
  const formModalTitle = useMemo(() => {
    if (!inventory) return '库存调整';
    return `库存调整 - ${inventory.skuName}`;
  }, [inventory]);

  if (!inventory) return null;

  return (
    <>
      {/* 步骤1: 调整表单 */}
      <Modal
        title={formModalTitle}
        open={open && step === 'form'}
        onCancel={handleClose}
        destroyOnClose
        width={520}
        footer={
          <Space>
            <Button onClick={handleClose}>取消</Button>
            <Button type="primary" onClick={handleNext}>
              下一步：确认调整
            </Button>
          </Space>
        }
        data-testid="adjustment-form-modal"
      >
        <AdjustmentForm form={form} inventory={inventory} />
      </Modal>

      {/* 步骤2: 确认调整 */}
      <ConfirmAdjustmentModal
        open={open && step === 'confirm'}
        data={confirmData}
        inventory={inventory}
        unitPrice={unitPrice}
        loading={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={handleBack}
      />
    </>
  );
};

export default AdjustmentModal;
