/**
 * CreateStoreModal Component
 *
 * Modal dialog for creating a new store.
 * Uses React Hook Form + Zod for form validation.
 * @since 022-store-crud
 */

import React from 'react';
import { Modal, Form, message } from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import StoreFormFields from './StoreFormFields';
import { useCreateStore } from '../hooks/useCreateStore';
import { createStoreSchema, type CreateStoreFormData } from '../validations/storeSchema';

interface CreateStoreModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
}

/**
 * Modal for creating a new store
 *
 * Features:
 * - Form validation with Zod schema
 * - Auto-invalidates store list cache on success
 * - Displays loading state during submission
 * - Shows error messages for validation and server errors
 */
const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ open, onClose }) => {
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

  // Create store mutation
  const createStoreMutation = useCreateStore();

  // Handle form submission
  const onSubmit = async (data: CreateStoreFormData) => {
    try {
      await createStoreMutation.mutateAsync(data);
      message.success('门店创建成功');
      reset();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建门店失败，请重试';
      message.error(errorMessage);
    }
  };

  // Handle modal cancel
  const handleCancel = () => {
    reset();
    createStoreMutation.reset();
    onClose();
  };

  return (
    <Modal
      title="新建门店"
      open={open}
      onOk={handleSubmit(onSubmit)}
      onCancel={handleCancel}
      okText="确认创建"
      cancelText="取消"
      confirmLoading={createStoreMutation.isPending}
      destroyOnClose
      width={600}
      maskClosable={false}
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <StoreFormFields
          control={control}
          errors={errors}
          disabled={createStoreMutation.isPending}
        />
      </Form>
    </Modal>
  );
};

export default CreateStoreModal;
