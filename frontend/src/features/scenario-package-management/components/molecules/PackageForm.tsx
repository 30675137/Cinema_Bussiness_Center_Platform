/**
 * 场景包表单组件
 *
 * 包含名称、描述、影厅类型选择、图片上传等字段
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React from 'react';
import {
  Form,
  Input,
  InputNumber,
  Card,
  Select,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import ImageUpload from '../atoms/ImageUpload';
import type { CreatePackageRequest, HallType } from '../../types';

const { TextArea } = Input;

interface PackageFormProps {
  /** Ant Design Form 实例 */
  form: FormInstance;
  /** 场景包 ID（编辑模式时传入） */
  packageId?: string;
  /** 可用的影厅类型列表 */
  hallTypes?: HallType[];
  /** 是否为加载状态 */
  loading?: boolean;
  /** 是否禁用表单 */
  disabled?: boolean;
  /** 初始值 */
  initialValues?: Partial<CreatePackageRequest>;
}

/**
 * 场景包表单组件
 *
 * 封装场景包的基本信息表单，支持创建和编辑两种模式
 */
export const PackageForm: React.FC<PackageFormProps> = ({
  form,
  packageId,
  hallTypes = [],
  loading = false,
  disabled = false,
  initialValues,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      disabled={disabled || loading}
      initialValues={{
        durationHours: 2,
        minPeople: 1,
        maxPeople: 10,
        ...initialValues,
      }}
    >
      {/* 基本信息 */}
      <Form.Item
        label="场景包名称"
        name="name"
        rules={[
          { required: true, message: '请输入场景包名称' },
          { max: 255, message: '名称长度不能超过255个字符' },
        ]}
      >
        <Input placeholder="例如：VIP生日派对专场" />
      </Form.Item>

      <Form.Item
        label="描述"
        name="description"
        rules={[
          { max: 500, message: '描述长度不能超过500个字符' },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="描述场景包的特色和适用场景"
          maxLength={500}
          showCount
        />
      </Form.Item>

      {/* 背景图片 */}
      <Form.Item
        label="背景图片"
        name="backgroundImageUrl"
      >
        <ImageUpload
          packageId={packageId}
          disabled={disabled}
        />
      </Form.Item>

      {/* 使用规则 */}
      <Card title="使用规则" size="small" style={{ marginBottom: 24 }}>
        <Form.Item
          label="时长（小时）"
          name={['rule', 'durationHours']}
          rules={[
            { required: true, message: '请输入时长' },
            { type: 'number', min: 0.1, message: '时长必须大于0' },
          ]}
        >
          <InputNumber
            min={0.1}
            step={0.5}
            precision={2}
            style={{ width: 200 }}
            addonAfter="小时"
          />
        </Form.Item>

        <Form.Item
          label="最小人数"
          name={['rule', 'minPeople']}
          rules={[
            { type: 'number', min: 0, message: '人数不能为负数' },
          ]}
        >
          <InputNumber
            min={0}
            style={{ width: 200 }}
            addonAfter="人"
            placeholder="不限制可留空"
          />
        </Form.Item>

        <Form.Item
          label="最大人数"
          name={['rule', 'maxPeople']}
          rules={[
            { type: 'number', min: 0, message: '人数不能为负数' },
          ]}
          dependencies={[['rule', 'minPeople']]}
        >
          <InputNumber
            min={0}
            style={{ width: 200 }}
            addonAfter="人"
            placeholder="不限制可留空"
          />
        </Form.Item>
      </Card>

      {/* 影厅类型选择 */}
      <Form.Item
        label="适用影厅类型"
        name="hallTypeIds"
        extra={hallTypes.length === 0 ? '暂无可用影厅类型，请先在影厅管理中添加' : undefined}
      >
        {hallTypes.length > 0 ? (
          <Select
            mode="multiple"
            placeholder="请选择适用的影厅类型"
            options={hallTypes.map((hall) => ({
              label: hall.name,
              value: hall.id,
            }))}
            allowClear
          />
        ) : (
          <Input
            placeholder="请手动输入影厅类型 ID（多个用逗号分隔）"
          />
        )}
      </Form.Item>
    </Form>
  );
};

export default PackageForm;
