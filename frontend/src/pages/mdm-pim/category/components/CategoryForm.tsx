/**
 * 类目表单组件
 * 支持创建和编辑模式
 * 包含表单验证和提交逻辑
 */

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  message,
  Modal,
  Divider
} from 'antd';
// 临时定义以避免模块导入问题
type CategoryLevel = 1 | 2 | 3;
type CategoryStatus = 'enabled' | 'disabled';
type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';
type Category = {
  id: string;
  name: string;
  code?: string;
  level: CategoryLevel;
  parentId?: string;
  sortOrder?: number;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};
type CreateCategoryRequest = {
  name: string;
  parentId?: string;
  sortOrder?: number;
  status?: CategoryStatus;
};
type UpdateCategoryRequest = {
  name?: string;
  sortOrder?: number;
  status?: CategoryStatus;
};
// import type { Category, CategoryStatus, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.types';

// Hooks和Store导入
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation
} from '../../../../services/category/categoryMutations';

const { Option } = Select;
const { TextArea } = Input;

/**
 * CategoryForm组件属性接口
 */
export interface CategoryFormProps {
  /** 表单模式：创建或编辑 */
  mode: 'create' | 'edit';
  /** 当前类目数据（编辑模式时使用） */
  category?: Category;
  /** 父类目ID（创建模式时使用） */
  parentId?: string;
  /** 是否显示弹窗 */
  visible: boolean;
  /** 取消回调 */
  onCancel?: () => void;
  /** 成功回调 */
  onSuccess?: (category: Category) => void;
  /** 加载状态 */
  loading?: boolean;
}

/**
 * 类目表单组件
 */
const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  category,
  parentId,
  visible,
  onCancel,
  onSuccess,
  loading = false
}) => {
  const [form] = Form.useForm();

  // Mutations
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  // 同步表单数据
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && category) {
        form.setFieldsValue({
          name: category.name,
          sortOrder: category.sortOrder,
          status: category.status
        });
      } else {
        form.setFieldsValue({
          name: '',
          sortOrder: 0,
          status: 'enabled'
        });
      }
    }
  }, [mode, category, form, visible]);

  // 错误处理
  useEffect(() => {
    if (createMutation.error) {
      message.error(createMutation.error.message);
    }
    if (updateMutation.error) {
      message.error(updateMutation.error.message);
    }
  }, [createMutation.error, updateMutation.error]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 构建请求数据
      const requestData = mode === 'create'
        ? {
            ...values,
            parentId: parentId,
            status: values.status || 'enabled'
          } as CreateCategoryRequest
        : {
            name: values.name,
            sortOrder: values.sortOrder,
            status: values.status
          } as UpdateCategoryRequest;

      // 调用API提交数据
      if (mode === 'create') {
        const newCategory = await createMutation.mutateAsync(requestData as CreateCategoryRequest);
        message.success('创建类目成功');
        onSuccess?.(newCategory);
      } else if (category) {
        const updatedCategory = await updateMutation.mutateAsync({
          id: category.id,
          data: requestData
        });
        message.success('更新类目成功');
        onSuccess?.(updatedCategory);
      }

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error('表单提交失败:', error);
    }
  };

  /**
   * 处理取消
   */
  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  return (
    <Modal
      title={mode === 'create' ? '创建类目' : '编辑类目'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        <Form.Item
          label="类目名称"
          name="name"
          rules={[
            { required: true, message: '请输入类目名称' },
            { min: 2, message: '类目名称至少需要2个字符' },
            { max: 50, message: '类目名称不能超过50个字符' },
            { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\-_\/\s]+$/, message: '类目名称只能包含中文、英文、数字、连字符、下划线和斜杠' }
          ]}
        >
          <Input placeholder="请输入类目名称" />
        </Form.Item>

        <Form.Item
          label="排序序号"
          name="sortOrder"
          rules={[
            { type: 'number', min: 0, message: '排序序号必须为非负整数' },
            { type: 'number', max: 999999, message: '排序序号不能大于999999' }
          ]}
          tooltip="数值越小，排序越靠前"
        >
          <InputNumber
            placeholder="请输入排序序号"
            style={{ width: '100%' }}
            min={0}
            max={999999}
          />
        </Form.Item>

        <Form.Item
          label="状态"
          name="status"
          rules={[{ required: true, message: '请选择状态' }]}
          tooltip="停用后，新建SPU时将无法选择该类目"
        >
          <Select placeholder="请选择状态">
            <Option value="enabled">
              <span style={{ color: '#52c41a' }}>● 启用</span>
            </Option>
            <Option value="disabled">
              <span style={{ color: '#999' }}>● 停用</span>
            </Option>
          </Select>
        </Form.Item>

        {/* 只读字段显示 */}
        <Divider>只读字段</Divider>

        {mode === 'create' && parentId && (
          <Form.Item label="上级类目">
            <Input value={`ID: ${parentId}`} disabled />
          </Form.Item>
        )}

        <Form.Item label="类目层级">
          <Input
            value={mode === 'edit' && category
              ? category.level === 1 ? '一级类目' :
                category.level === 2 ? '二级类目' : '三级类目'
              : parentId ? '二级类目' : '一级类目'
            }
            disabled
          />
        </Form.Item>

        {mode === 'edit' && (
          <>
            <Form.Item label="类目编码">
              <Input value={category?.code || '-'} disabled />
            </Form.Item>

            <Form.Item label="创建时间">
              <Input
                value={category?.createdAt ?
                  new Date(category.createdAt).toLocaleString('zh-CN') : '-'
                }
                disabled
              />
            </Form.Item>

            <Form.Item label="更新时间">
              <Input
                value={new Date().toLocaleString('zh-CN')}
                disabled
              />
            </Form.Item>
          </>
        )}

        {/* 表单操作按钮 */}
        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel} disabled={createMutation.isPending || updateMutation.isPending}>
                取消
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {mode === 'create' ? '创建' : '保存'}
              </Button>
            </Space>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryForm;