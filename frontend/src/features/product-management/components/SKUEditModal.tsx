/**
 * @spec O004-beverage-sku-reuse
 * SKU Edit Modal Component
 *
 * SKU 编辑模态框组件,提供表单输入界面用于编辑现有 SKU
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 * 注意: SKU 类型和 SPU 关联在创建后不可修改
 *
 * Spec: specs/O004-beverage-sku-reuse/spec.md
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Spin, Alert, message } from 'antd';
import { Controller } from 'react-hook-form';
import { useSkuEditForm } from '../hooks/useSkuForm';
import { useUpdateSKU, useSKUDetail, useUnits } from '@/hooks/useSKUs';
import { useSkuManagementStore } from '@/stores/skuManagementStore';
import { SkuStatus } from '@/types/sku';

/**
 * SKU Edit Modal Props
 */
export interface SKUEditModalProps {
  /** SKU ID */
  skuId: string | null;

  /** 模态框是否可见 */
  visible: boolean;

  /** 关闭模态框回调 */
  onCancel: () => void;

  /** 更新成功回调 */
  onSuccess?: () => void;
}

/**
 * SKU Edit Modal Component
 *
 * @example
 * ```tsx
 * const { isEditModalVisible, editingSkuId, closeEditModal } = useEditModal();
 *
 * <SKUEditModal
 *   skuId={editingSkuId}
 *   visible={isEditModalVisible}
 *   onCancel={closeEditModal}
 *   onSuccess={() => {
 *     message.success('SKU 更新成功');
 *     closeEditModal();
 *   }}
 * />
 * ```
 */
export const SKUEditModal: React.FC<SKUEditModalProps> = ({
  skuId,
  visible,
  onCancel,
  onSuccess,
}) => {
  const { editFormDraft, saveEditFormDraft, clearEditFormDraft } = useSkuManagementStore();
  const { data: sku, isLoading: isLoadingSku, error: skuError } = useSKUDetail(skuId || '', {
    enabled: !!skuId && visible,
  });
  const form = useSkuEditForm(sku);
  const updateSKU = useUpdateSKU();
  const { data: units = [], isLoading: isLoadingUnits } = useUnits();

  // 当 SKU 数据加载完成时,重置表单
  useEffect(() => {
    if (sku && visible) {
      form.reset({
        name: sku.name,
        mainUnitId: sku.mainUnitId,
        standardCost: sku.standardCost,
        price: sku.price,
        storeScope: sku.storeScope,
        status: sku.status,
      });
    }
  }, [sku, visible, form]);

  // 监听表单变化,自动保存草稿
  const formValues = form.watch();
  useEffect(() => {
    if (visible && sku) {
      saveEditFormDraft(formValues);
    }
  }, [formValues, visible, sku, saveEditFormDraft]);

  /**
   * 处理表单提交
   */
  const handleSubmit = form.handleSubmit(async (data) => {
    if (!skuId) {
      message.error('SKU ID 不存在');
      return;
    }

    try {
      await updateSKU.mutateAsync({ id: skuId, formData: data });
      message.success('SKU 更新成功');
      clearEditFormDraft();
      onSuccess?.();
    } catch (error) {
      message.error(`SKU 更新失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
   * 重置表单到原始数据
   */
  const handleReset = () => {
    if (sku) {
      form.reset({
        name: sku.name,
        mainUnitId: sku.mainUnitId,
        standardCost: sku.standardCost,
        price: sku.price,
        storeScope: sku.storeScope,
        status: sku.status,
      });
      clearEditFormDraft();
    }
  };

  return (
    <Modal
      title={`编辑 SKU: ${sku?.name || ''}`}
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="reset" onClick={handleReset} disabled={isLoadingSku}>
          重置
        </Button>,
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={updateSKU.isPending}
          onClick={handleSubmit}
          disabled={isLoadingSku}
        >
          保存
        </Button>,
      ]}
      destroyOnClose={false} // 保留表单状态(草稿功能)
    >
      {isLoadingSku ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="加载 SKU 数据中..." />
        </div>
      ) : skuError ? (
        <Alert
          message="加载失败"
          description={`无法加载 SKU 数据: ${skuError instanceof Error ? skuError.message : '未知错误'}`}
          type="error"
          showIcon
        />
      ) : sku ? (
        <Form layout="vertical">
          {/* SKU 基本信息(只读) */}
          <Alert
            message="基本信息"
            description={
              <div>
                <div><strong>SKU 编码:</strong> {sku.code}</div>
                <div><strong>SKU 类型:</strong> {sku.skuType}</div>
                <div><strong>关联 SPU:</strong> {sku.spuName || sku.spuId}</div>
                <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                  注意: SKU 类型和 SPU 关联在创建后不可修改
                </div>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* SKU 名称 */}
          <Form.Item
            label="SKU 名称"
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

          {/* 主单位 */}
          <Form.Item
            label="主单位"
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

          {/* 标准成本 (原料/包材类型) */}
          {(sku.skuType === 'raw_material' || sku.skuType === 'packaging') && (
            <Form.Item
              label="标准成本"
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
          {(sku.skuType === 'finished_product' || sku.skuType === 'combo') && (
            <Form.Item
              label="零售价"
              validateStatus={form.formState.errors.price ? 'error' : ''}
              help={form.formState.errors.price?.message}
            >
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
          <Form.Item
            label="SKU 状态"
            validateStatus={form.formState.errors.status ? 'error' : ''}
            help={form.formState.errors.status?.message}
          >
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

          {/* BOM/套餐配置提示 */}
          {(sku.skuType === 'finished_product' || sku.skuType === 'combo') && (
            <Alert
              message={sku.skuType === 'finished_product' ? 'BOM 配方管理' : '套餐子项管理'}
              description={
                <div>
                  <div style={{ marginBottom: 8 }}>
                    {sku.skuType === 'finished_product'
                      ? `当前 BOM 组件: ${sku.bomComponents?.length || 0} 个`
                      : `当前套餐子项: ${sku.comboItems?.length || 0} 个`}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    提示: 复杂的 BOM 配方和套餐子项配置请在 SKU 详情页面进行
                  </div>
                </div>
              }
              type="info"
              showIcon
            />
          )}
        </Form>
      ) : null}
    </Modal>
  );
};
