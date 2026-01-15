/**
 * 换算规则表单组件（创建/编辑）
 * P002-unit-conversion
 */

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message, Typography, Space, Alert } from 'antd';
import { ArrowRightOutlined, WarningOutlined } from '@ant-design/icons';
import { useCreateConversion, useUpdateConversion } from '../hooks/useConversions';
import { useValidateCycle } from '../hooks/useConversionCalculation';
import {
  useConversionUIStore,
  selectIsEditing,
  selectEditingId,
} from '../stores/conversionUIStore';
import { CATEGORY_OPTIONS } from '../utils/categoryMapping';
import type { CreateConversionRequest, DbUnitCategory } from '../types';

const { Text } = Typography;

interface FormValues {
  fromUnit: string;
  toUnit: string;
  conversionRate: number;
  category: DbUnitCategory;
}

const ConversionForm: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const { isModalOpen, editingRule, closeModal } = useConversionUIStore();
  const isEditing = useConversionUIStore(selectIsEditing);
  const editingId = useConversionUIStore(selectEditingId);

  // 循环检测状态
  const [cycleError, setCycleError] = useState<string[] | null>(null);

  const createMutation = useCreateConversion();
  const updateMutation = useUpdateConversion();
  const validateCycleMutation = useValidateCycle();

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || validateCycleMutation.isPending;

  // 监听编辑规则变化，填充表单
  useEffect(() => {
    if (isModalOpen && editingRule) {
      form.setFieldsValue({
        fromUnit: editingRule.fromUnit || '',
        toUnit: editingRule.toUnit || '',
        conversionRate: editingRule.conversionRate || undefined,
        category: editingRule.category || 'volume',
      });
    }
  }, [isModalOpen, editingRule, form]);

  // 关闭时重置表单和循环错误
  const handleClose = () => {
    form.resetFields();
    setCycleError(null);
    closeModal();
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setCycleError(null);

      // 验证源单位和目标单位不能相同
      if (values.fromUnit === values.toUnit) {
        form.setFields([{ name: 'toUnit', errors: ['源单位和目标单位不能相同'] }]);
        return;
      }

      const fromUnitTrimmed = values.fromUnit.trim();
      const toUnitTrimmed = values.toUnit.trim();

      // 循环依赖检测
      const cycleResult = await validateCycleMutation.mutateAsync({
        fromUnit: fromUnitTrimmed,
        toUnit: toUnitTrimmed,
        excludeId: isEditing ? editingId : undefined,
      });

      if (cycleResult.hasCycle && cycleResult.cyclePath) {
        setCycleError(cycleResult.cyclePath);
        return;
      }

      const data: CreateConversionRequest = {
        fromUnit: fromUnitTrimmed,
        toUnit: toUnitTrimmed,
        conversionRate: values.conversionRate,
        category: values.category,
      };

      if (isEditing && editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        message.success('更新成功');
      } else {
        await createMutation.mutateAsync(data);
        message.success('创建成功');
      }

      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  // 实时预览
  const fromUnit = Form.useWatch('fromUnit', form);
  const toUnit = Form.useWatch('toUnit', form);
  const conversionRate = Form.useWatch('conversionRate', form);

  return (
    <Modal
      title={isEditing ? '编辑换算规则' : '新增换算规则'}
      open={isModalOpen}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText={isEditing ? '保存' : '创建'}
      cancelText="取消"
      width={500}
      destroyOnClose
    >
      {/* 循环依赖错误提示 */}
      {cycleError && (
        <Alert
          type="error"
          icon={<WarningOutlined />}
          message="检测到循环依赖"
          description={
            <div>
              <Text>添加此规则将形成循环：</Text>
              <div style={{ marginTop: 8 }}>
                <Text code>{cycleError.join(' → ')}</Text>
              </div>
            </div>
          }
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form form={form} layout="vertical" initialValues={{ category: 'volume' }}>
        <Form.Item
          name="fromUnit"
          label="源单位"
          rules={[
            { required: true, message: '请输入源单位' },
            { max: 20, message: '源单位不能超过20字符' },
          ]}
        >
          <Input placeholder="例如：瓶" maxLength={20} />
        </Form.Item>

        <Form.Item
          name="toUnit"
          label="目标单位"
          rules={[
            { required: true, message: '请输入目标单位' },
            { max: 20, message: '目标单位不能超过20字符' },
          ]}
        >
          <Input placeholder="例如：ml" maxLength={20} />
        </Form.Item>

        <Form.Item
          name="conversionRate"
          label="换算率"
          rules={[
            { required: true, message: '请输入换算率' },
            { type: 'number', min: 0.000001, message: '换算率必须为正数' },
          ]}
          extra="1 源单位 = ? 目标单位"
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="例如：750"
            min={0.000001}
            max={999999.999999}
            precision={6}
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="单位类别"
          rules={[{ required: true, message: '请选择单位类别' }]}
        >
          <Select options={CATEGORY_OPTIONS} />
        </Form.Item>

        {/* 实时预览 */}
        {fromUnit && toUnit && conversionRate && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f5f5f5',
              borderRadius: 6,
              marginTop: 16,
            }}
          >
            <Text type="secondary">换算预览：</Text>
            <div style={{ marginTop: 8 }}>
              <Space>
                <Text strong>1 {fromUnit}</Text>
                <ArrowRightOutlined />
                <Text strong>
                  {conversionRate} {toUnit}
                </Text>
              </Space>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default ConversionForm;
