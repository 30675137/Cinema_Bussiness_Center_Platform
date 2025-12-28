/**
 * StoreEditModal Component
 *
 * 门店地址编辑弹窗
 * 用于在门店列表中编辑门店地址信息
 *
 * @since 020-store-address
 */

import React, { useEffect } from 'react';
import { Modal, Form, Spin, Alert } from 'antd';
import AddressForm, { type AddressFormData } from '../../../features/store-management/components/AddressForm';
import { useUpdateStore } from '../../../features/store-management/hooks/useUpdateStore';
import type { Store } from '../types/store.types';

/**
 * StoreEditModal Props
 */
export interface StoreEditModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 当前编辑的门店 */
  store: Store | null;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 更新成功回调 */
  onSuccess?: () => void;
}

/**
 * 门店地址编辑弹窗
 */
const StoreEditModal: React.FC<StoreEditModalProps> = ({
  open,
  store,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<AddressFormData>();
  const { mutate: updateStore, isPending } = useUpdateStore();

  // 弹窗打开时设置初始值
  useEffect(() => {
    if (open && store) {
      form.setFieldsValue({
        province: store.province || '',
        city: store.city || '',
        district: store.district || '',
        address: store.address || '',
        phone: store.phone || '',
      });
    }
  }, [open, store, form]);

  // 关闭弹窗时重置表单
  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  // 提交表单
  const handleSubmit = async () => {
    if (!store) return;

    try {
      const values = await form.validateFields();
      updateStore(
        { storeId: store.id, data: values },
        {
          onSuccess: () => {
            onClose();
            onSuccess?.();
          },
        }
      );
    } catch (error) {
      // 表单验证失败，不需要额外处理
      console.log('Form validation failed:', error);
    }
  };

  return (
    <Modal
      title={store ? `编辑门店地址 - ${store.name}` : '编辑门店地址'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      confirmLoading={isPending}
      destroyOnClose
      width={700}
    >
      {store ? (
        <Spin spinning={isPending}>
          <div style={{ marginBottom: 16 }}>
            <Alert
              message="门店基本信息"
              description={
                <>
                  <div><strong>门店名称：</strong>{store.name}</div>
                  <div><strong>门店编码：</strong>{store.code || '-'}</div>
                </>
              }
              type="info"
              showIcon
            />
          </div>
          <AddressForm
            form={form}
            initialValues={{
              province: store.province || '',
              city: store.city || '',
              district: store.district || '',
              address: store.address || '',
              phone: store.phone || '',
            }}
            showLabels={true}
          />
        </Spin>
      ) : (
        <div>未选择门店</div>
      )}
    </Modal>
  );
};

export default StoreEditModal;
