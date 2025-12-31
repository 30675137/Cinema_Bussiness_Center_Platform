/**
 * @spec O003-beverage-order
 * 饮品表单弹窗组件 (User Story 3 - FR-029, FR-030)
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, Space, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBeverage, updateBeverage } from '../services/beverageAdminApi';
import { ImageUpload, MultiImageUpload } from './ImageUpload';
import type {
  BeverageDTO,
  CreateBeverageRequest,
  UpdateBeverageRequest,
  BeverageCategory,
  BeverageStatus,
} from '../types/beverage';

const { TextArea } = Input;

interface BeverageFormModalProps {
  open: boolean;
  beverage?: BeverageDTO | null;
  onClose: () => void;
}

/**
 * 分类选项
 */
const CATEGORY_OPTIONS: { label: string; value: BeverageCategory }[] = [
  { label: '咖啡', value: 'COFFEE' },
  { label: '茶饮', value: 'TEA' },
  { label: '果汁', value: 'JUICE' },
  { label: '奶昔', value: 'SMOOTHIE' },
  { label: '奶茶', value: 'MILK_TEA' },
  { label: '其他', value: 'OTHER' },
];

/**
 * 状态选项
 */
const STATUS_OPTIONS: { label: string; value: BeverageStatus }[] = [
  { label: '已上架', value: 'ACTIVE' },
  { label: '已下架', value: 'INACTIVE' },
  { label: '已售罄', value: 'OUT_OF_STOCK' },
];

export const BeverageFormModal: React.FC<BeverageFormModalProps> = ({
  open,
  beverage,
  onClose,
}) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!beverage;

  // 创建饮品
  const createMutation = useMutation({
    mutationFn: createBeverage,
    onSuccess: () => {
      message.success('创建饮品成功');
      queryClient.invalidateQueries({ queryKey: ['beverages'] });
      onClose();
      form.resetFields();
    },
    onError: (error: Error) => {
      message.error(`创建失败: ${error.message}`);
    },
  });

  // 更新饮品
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBeverageRequest }) =>
      updateBeverage(id, data),
    onSuccess: () => {
      message.success('更新饮品成功');
      queryClient.invalidateQueries({ queryKey: ['beverages'] });
      onClose();
    },
    onError: (error: Error) => {
      message.error(`更新失败: ${error.message}`);
    },
  });

  // 初始化表单数据
  useEffect(() => {
    if (open && beverage) {
      form.setFieldsValue({
        name: beverage.name,
        category: beverage.category,
        basePrice: beverage.basePrice / 100, // 转换为元
        description: beverage.description,
        mainImage: beverage.mainImage,
        detailImages: beverage.detailImages,
        isRecommended: beverage.isRecommended,
        status: beverage.status,
      });
    } else if (open && !beverage) {
      form.resetFields();
    }
  }, [open, beverage, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // 转换价格为分
      const basePriceInCents = Math.round(values.basePrice * 100);

      if (isEdit && beverage) {
        // 编辑模式
        const updateData: UpdateBeverageRequest = {
          name: values.name,
          category: values.category,
          basePrice: basePriceInCents,
          description: values.description,
          mainImage: values.mainImage,
          detailImages: values.detailImages,
          isRecommended: values.isRecommended,
          status: values.status,
        };
        updateMutation.mutate({ id: beverage.id, data: updateData });
      } else {
        // 创建模式
        const createData: CreateBeverageRequest = {
          name: values.name,
          category: values.category,
          basePrice: basePriceInCents,
          description: values.description,
          mainImage: values.mainImage,
          detailImages: values.detailImages,
          isRecommended: values.isRecommended || false,
          status: values.status || 'INACTIVE',
        };
        createMutation.mutate(createData);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEdit ? '编辑饮品' : '新增饮品'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          isRecommended: false,
          status: 'INACTIVE',
        }}
      >
        <Form.Item
          label="饮品名称"
          name="name"
          rules={[
            { required: true, message: '请输入饮品名称' },
            { max: 100, message: '名称不能超过100个字符' },
          ]}
        >
          <Input placeholder="例如：拿铁咖啡" />
        </Form.Item>

        <Space size="large" style={{ width: '100%' }}>
          <Form.Item
            label="饮品分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
            style={{ width: 200 }}
          >
            <Select placeholder="选择分类" options={CATEGORY_OPTIONS} />
          </Form.Item>

          <Form.Item
            label="基础价格（元）"
            name="basePrice"
            rules={[
              { required: true, message: '请输入价格' },
              { type: 'number', min: 0, message: '价格不能为负数' },
            ]}
            style={{ width: 200 }}
          >
            <InputNumber
              placeholder="0.00"
              precision={2}
              style={{ width: '100%' }}
              addonAfter="元"
            />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
            style={{ width: 150 }}
          >
            <Select placeholder="选择状态" options={STATUS_OPTIONS} />
          </Form.Item>
        </Space>

        <Form.Item
          label="饮品描述"
          name="description"
          rules={[{ max: 500, message: '描述不能超过500个字符' }]}
        >
          <TextArea placeholder="介绍饮品的特点、口感等" rows={3} maxLength={500} showCount />
        </Form.Item>

        <Form.Item
          label="主图"
          name="mainImage"
          rules={[{ required: true, message: '请上传主图' }]}
        >
          <ImageUpload />
        </Form.Item>

        <Form.Item label="详情图（最多5张）" name="detailImages">
          <MultiImageUpload maxCount={5} />
        </Form.Item>

        <Form.Item label="是否推荐" name="isRecommended" valuePropName="checked">
          <Switch checkedChildren="推荐" unCheckedChildren="不推荐" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BeverageFormModal;
