/**
 * EditStoreModal Component
 *
 * Modal dialog for editing an existing store.
 * Uses React Hook Form + Zod for form validation.
 * Supports optimistic locking via version field.
 * @since 022-store-crud
 */

import React, { useEffect } from 'react';
import { Modal, Form, message } from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import StoreFormFields from './StoreFormFields';
import { useUpdateStore } from '../hooks/useUpdateStore';
import { createStoreSchema, type CreateStoreFormData } from '../validations/storeSchema';
import type { Store } from '../types/store.types';

interface EditStoreModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Store to edit */
  store: Store | null;
  /** Callback when modal should close */
  onClose: () => void;
}

/**
 * Modal for editing an existing store
 *
 * Features:
 * - Pre-fills form with existing store data
 * - Supports optimistic locking via version field
 * - Shows error messages for validation and server errors
 * - Handles version conflict (409) with user-friendly message
 */
const EditStoreModal: React.FC<EditStoreModalProps> = ({ open, store, onClose }) => {
  // Form setup with React Hook Form + Zod
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateStoreFormData>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: '',
      region: '',
      city: '',
      province: '',
      district: '',
      address: '',
      phone: '',
    },
  });

  // Pre-fill form when store changes
  useEffect(() => {
    if (store) {
      reset({
        name: store.name || '',
        region: store.region || '',
        city: store.city || '',
        province: store.province || '',
        district: store.district || '',
        address: store.address || '',
        phone: store.phone || '',
      });
    }
  }, [store, reset]);

  // Update store mutation
  const updateStoreMutation = useUpdateStore();

  // Handle form submission
  const onSubmit = async (data: CreateStoreFormData) => {
    if (!store) return;

    try {
      await updateStoreMutation.mutateAsync({
        storeId: store.id,
        data: {
          ...data,
          version: store.version, // Include version for optimistic locking
        },
      });
      message.success('门店信息更新成功');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '更新门店失败，请重试';
      // Check if it's a version conflict
      if (errorMessage.includes('刷新')) {
        message.warning(errorMessage);
      } else {
        message.error(errorMessage);
      }
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    reset();
    updateStoreMutation.reset();
    onClose();
  };

  return (
    <Modal
      title={`编辑门店: ${store?.name || ''}`}
      open={open}
      onOk={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      okText="保存修改"
      cancelText="取消"
      confirmLoading={updateStoreMutation.isPending}
      destroyOnClose
      width={600}
      maskClosable={false}
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <StoreFormFields
          control={control}
          errors={errors}
          disabled={updateStoreMutation.isPending}
        />
      </Form>
    </Modal>
  );
};

export default EditStoreModal;
