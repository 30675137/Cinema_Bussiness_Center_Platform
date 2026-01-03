/**
 * @spec O002-miniapp-menu-config
 * 分类表单组件（创建/编辑）
 */

import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
} from 'antd';
import type { MenuCategoryDTO, CreateMenuCategoryRequest, UpdateMenuCategoryRequest, CategoryFormMode } from '../types';

const { TextArea } = Input;

interface CategoryFormProps {
  open: boolean;
  mode: CategoryFormMode;
  initialData?: MenuCategoryDTO | null;
  loading?: boolean;
  onSubmit: (data: CreateMenuCategoryRequest | UpdateMenuCategoryRequest) => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  open,
  mode,
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        form.setFieldsValue({
          code: initialData.code,
          displayName: initialData.displayName,
          sortOrder: initialData.sortOrder,
          isVisible: initialData.isVisible,
          iconUrl: initialData.iconUrl,
          description: initialData.description,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          isVisible: true,
        });
      }
    }
  }, [open, mode, initialData, form, isEditMode]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        // 更新时只提交修改的字段
        const updateRequest: UpdateMenuCategoryRequest = {};

        if (values.displayName !== initialData?.displayName) {
          updateRequest.displayName = values.displayName;
        }
        if (values.sortOrder !== initialData?.sortOrder) {
          updateRequest.sortOrder = values.sortOrder;
        }
        if (values.isVisible !== initialData?.isVisible) {
          updateRequest.isVisible = values.isVisible;
        }
        if (values.iconUrl !== initialData?.iconUrl) {
          updateRequest.iconUrl = values.iconUrl || undefined;
        }
        if (values.description !== initialData?.description) {
          updateRequest.description = values.description || undefined;
        }

        onSubmit(updateRequest);
      } else {
        // 创建
        const createRequest: CreateMenuCategoryRequest = {
          code: values.code.toUpperCase(),
          displayName: values.displayName,
          sortOrder: values.sortOrder,
          isVisible: values.isVisible ?? true,
          iconUrl: values.iconUrl || undefined,
          description: values.description || undefined,
        };

        onSubmit(createRequest);
      }
    } catch (error) {
      // Form validation error
      message.error('请检查表单填写是否正确');
    }
  };

  return (
    <Modal
      title={isEditMode ? '编辑分类' : '新建分类'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      confirmLoading={loading}
      destroyOnClose
      width={520}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isVisible: true,
        }}
      >
        <Form.Item
          name="code"
          label="分类编码"
          rules={[
            { required: true, message: '请输入分类编码' },
            {
              pattern: /^[A-Za-z][A-Za-z0-9_]*$/,
              message: '编码必须以字母开头，只能包含字母、数字和下划线',
            },
            { max: 50, message: '编码长度不能超过50字符' },
          ]}
          extra="编码将自动转为大写，如 SEASONAL_SPECIAL"
        >
          <Input
            placeholder="请输入分类编码"
            disabled={isEditMode}
            style={{ textTransform: 'uppercase' }}
          />
        </Form.Item>

        <Form.Item
          name="displayName"
          label="显示名称"
          rules={[
            { required: true, message: '请输入显示名称' },
            { max: 50, message: '名称长度不能超过50字符' },
          ]}
        >
          <Input placeholder="请输入显示名称，如 季节限定" />
        </Form.Item>

        <Form.Item
          name="sortOrder"
          label="排序序号"
          extra="数字越小排序越靠前"
        >
          <InputNumber
            placeholder="留空自动分配"
            min={0}
            max={9999}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="isVisible"
          label="是否可见"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="显示"
            unCheckedChildren="隐藏"
            disabled={initialData?.isDefault}
          />
        </Form.Item>

        <Form.Item
          name="iconUrl"
          label="图标 URL"
          rules={[
            { type: 'url', message: '请输入有效的 URL 地址' },
            { max: 500, message: 'URL 长度不能超过500字符' },
          ]}
        >
          <Input placeholder="请输入图标 URL（可选）" />
        </Form.Item>

        <Form.Item
          name="description"
          label="分类描述"
          rules={[{ max: 500, message: '描述长度不能超过500字符' }]}
        >
          <TextArea
            placeholder="请输入分类描述（可选）"
            rows={3}
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryForm;
