/**
 * @spec O004-beverage-sku-reuse
 * SKU Create Modal Component
 *
 * SKU 创建模态框组件,提供表单输入界面用于创建新 SKU
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, message } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Controller } from 'react-hook-form';
import { useSkuCreateForm } from '../hooks/useSkuForm';
import { useCreateSKU, useSPUs, useUnits } from '@/hooks/useSKUs';
import { useSkuManagementStore } from '@/stores/skuManagementStore';
import { SkuType, SkuStatus } from '@/types/sku';

/**
 * SKU Create Modal Props
 */
export interface SKUCreateModalProps {
  /** 模态框是否可见 */
  visible: boolean;

  /** 关闭模态框回调 */
  onCancel: () => void;

  /** 创建成功回调 */
  onSuccess?: () => void;
}

/**
 * SKU Create Modal Component
 *
 * @example
 * ```tsx
 * const { isCreateModalVisible, closeCreateModal } = useSkuManagementStore();
 *
 * <SKUCreateModal
 *   visible={isCreateModalVisible}
 *   onCancel={closeCreateModal}
 *   onSuccess={() => {
 *     message.success('SKU 创建成功');
 *     closeCreateModal();
 *   }}
 * />
 * ```
 */
export const SKUCreateModal: React.FC<SKUCreateModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const { createFormDraft, saveCreateFormDraft, clearCreateFormDraft } = useSkuManagementStore();
  const form = useSkuCreateForm(createFormDraft || undefined);
  const createSKU = useCreateSKU();
  const { data: spus = [], isLoading: isLoadingSpus } = useSPUs();
  const { data: units = [], isLoading: isLoadingUnits } = useUnits();

  // 监听表单变化,自动保存草稿
  const formValues = form.watch();
  useEffect(() => {
    if (visible) {
      saveCreateFormDraft(formValues);
    }
  }, [formValues, visible, saveCreateFormDraft]);

  // 监听 SKU 类型变化,动态调整表单字段
  const selectedSkuType = form.watch('skuType');

  /**
   * 处理表单提交
   */
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await createSKU.mutateAsync(data);
      message.success('SKU 创建成功');
      clearCreateFormDraft();
      form.reset();
      onSuccess?.();
    } catch (error) {
      message.error(`SKU 创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  });

  /**
   * 处理取消
   */
  const handleCancel = () => {
    // 保留草稿,用户下次打开时可恢复
    onCancel();
  };

  /**
   * 清空表单并重置
   */
  const handleReset = () => {
    form.reset();
    clearCreateFormDraft();
  };

  return (
    <Modal
      title="创建 SKU"
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="reset" onClick={handleReset}>
          重置
        </Button>,
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={createSKU.isPending}
          onClick={handleSubmit}
        >
          创建
        </Button>,
      ]}
      destroyOnClose={false} // 保留表单状态(草稿功能)
    >
      <Form layout="vertical">
        {/* SKU 名称 */}
        <Form.Item
          label="SKU 名称"
          required
          validateStatus={form.formState.errors.name ? 'error' : ''}
          help={form.formState.errors.name?.message}
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入 SKU 名称" maxLength={100} />
            )}
          />
        </Form.Item>

        {/* SPU 选择 */}
        <Form.Item
          label="关联 SPU"
          required
          validateStatus={form.formState.errors.spuId ? 'error' : ''}
          help={form.formState.errors.spuId?.message}
        >
          <Controller
            name="spuId"
            control={form.control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="请选择关联的 SPU"
                loading={isLoadingSpus}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={spus.map((spu) => ({
                  label: `${spu.name} (${spu.code})`,
                  value: spu.id,
                }))}
              />
            )}
          />
        </Form.Item>

        {/* SKU 类型 */}
        <Form.Item
          label="SKU 类型"
          required
          validateStatus={form.formState.errors.skuType ? 'error' : ''}
          help={form.formState.errors.skuType?.message}
        >
          <Controller
            name="skuType"
            control={form.control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="请选择 SKU 类型"
                options={[
                  { label: '原料', value: SkuType.RAW_MATERIAL },
                  { label: '包材', value: SkuType.PACKAGING },
                  { label: '成品', value: SkuType.FINISHED_PRODUCT },
                  { label: '套餐', value: SkuType.COMBO },
                ]}
              />
            )}
          />
        </Form.Item>

        {/* 主单位 */}
        <Form.Item
          label="主单位"
          required
          validateStatus={form.formState.errors.mainUnitId ? 'error' : ''}
          help={form.formState.errors.mainUnitId?.message}
        >
          <Controller
            name="mainUnitId"
            control={form.control}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="请选择主单位"
                loading={isLoadingUnits}
                options={units.map((unit) => ({
                  label: unit.name,
                  value: unit.id,
                }))}
              />
            )}
          />
        </Form.Item>

        {/* 主条码 */}
        <Form.Item label="主条码(可选)">
          <Controller
            name="mainBarcode"
            control={form.control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入主条码" />
            )}
          />
        </Form.Item>

        {/* 标准成本 (原料/包材类型) */}
        {(selectedSkuType === SkuType.RAW_MATERIAL || selectedSkuType === SkuType.PACKAGING) && (
          <Form.Item
            label="标准成本"
            required
            validateStatus={form.formState.errors.standardCost ? 'error' : ''}
            help={form.formState.errors.standardCost?.message}
          >
            <Controller
              name="standardCost"
              control={form.control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  placeholder="请输入标准成本"
                  min={0}
                  precision={2}
                  addonBefore="¥"
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>
        )}

        {/* 零售价 (成品/套餐类型) */}
        {(selectedSkuType === SkuType.FINISHED_PRODUCT || selectedSkuType === SkuType.COMBO) && (
          <Form.Item label="零售价(可选)">
            <Controller
              name="price"
              control={form.control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  placeholder="请输入零售价"
                  min={0}
                  precision={2}
                  addonBefore="¥"
                  style={{ width: '100%' }}
                />
              )}
            />
          </Form.Item>
        )}

        {/* SKU 状态 */}
        <Form.Item label="SKU 状态">
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { label: '草稿', value: SkuStatus.DRAFT },
                  { label: '启用', value: SkuStatus.ENABLED },
                  { label: '禁用', value: SkuStatus.DISABLED },
                ]}
              />
            )}
          />
        </Form.Item>

        {/* BOM 配方 (成品类型) */}
        {selectedSkuType === SkuType.FINISHED_PRODUCT && (
          <Form.Item
            label="BOM 配方"
            required
            validateStatus={form.formState.errors.bomComponents ? 'error' : ''}
            help={form.formState.errors.bomComponents?.message}
          >
            <div style={{ color: '#666', marginBottom: 8, fontSize: 12 }}>
              提示: BOM 配方配置较复杂,建议创建 SKU 后通过"编辑"功能配置
            </div>
          </Form.Item>
        )}

        {/* 套餐子项 (套餐类型) */}
        {selectedSkuType === SkuType.COMBO && (
          <Form.Item
            label="套餐子项"
            required
            validateStatus={form.formState.errors.comboItems ? 'error' : ''}
            help={form.formState.errors.comboItems?.message}
          >
            <div style={{ color: '#666', marginBottom: 8, fontSize: 12 }}>
              提示: 套餐子项配置较复杂,建议创建 SKU 后通过"编辑"功能配置
            </div>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
