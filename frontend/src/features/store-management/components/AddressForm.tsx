/**
 * AddressForm Component
 *
 * 门店地址信息编辑表单组件
 * 支持省份、城市、区县、详细地址、联系电话的编辑
 *
 * @since 020-store-address
 */

import React from 'react';
import { Form, Input, Row, Col, message } from 'antd';
import type { FormInstance } from 'antd';

/**
 * 地址表单数据结构
 */
export interface AddressFormData {
  province: string;
  city: string;
  district: string;
  address?: string;
  phone?: string;
}

/**
 * AddressForm Props
 */
export interface AddressFormProps {
  /** 表单实例，用于外部控制表单 */
  form: FormInstance<AddressFormData>;
  /** 初始值 */
  initialValues?: Partial<AddressFormData>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示标签 */
  showLabels?: boolean;
}

/**
 * 电话号码格式验证正则
 * 支持：手机号(11位)、座机(区号+号码)、400热线
 */
const PHONE_PATTERN = /^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$/;

/**
 * 验证电话号码格式
 */
const validatePhone = (_: unknown, value: string) => {
  if (!value || value.trim() === '') {
    return Promise.resolve(); // 电话为选填
  }
  if (PHONE_PATTERN.test(value)) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('电话格式不正确，支持手机号、座机或400热线'));
};

/**
 * 地址信息编辑表单
 */
const AddressForm: React.FC<AddressFormProps> = ({
  form,
  initialValues,
  disabled = false,
  showLabels = true,
}) => {
  const labelCol = showLabels ? { span: 6 } : { span: 0 };
  const wrapperCol = showLabels ? { span: 18 } : { span: 24 };

  return (
    <Form
      form={form}
      layout="horizontal"
      labelCol={labelCol}
      wrapperCol={wrapperCol}
      initialValues={initialValues}
      disabled={disabled}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="province"
            label={showLabels ? '省份' : undefined}
            rules={[
              { required: true, message: '请输入省份' },
              { max: 50, message: '省份长度不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入省份" aria-label="省份" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="city"
            label={showLabels ? '城市' : undefined}
            rules={[
              { required: true, message: '请输入城市' },
              { max: 50, message: '城市长度不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入城市" aria-label="城市" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="district"
            label={showLabels ? '区县' : undefined}
            rules={[
              { required: true, message: '请输入区县' },
              { max: 50, message: '区县长度不能超过50个字符' },
            ]}
          >
            <Input placeholder="请输入区县" aria-label="区县" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address"
        label={showLabels ? '详细地址' : undefined}
        rules={[{ max: 500, message: '详细地址长度不能超过500个字符' }]}
      >
        <Input.TextArea
          placeholder="请输入详细地址（如街道、门牌号等）"
          rows={2}
          aria-label="详细地址"
        />
      </Form.Item>

      <Form.Item
        name="phone"
        label={showLabels ? '联系电话' : undefined}
        rules={[{ validator: validatePhone }]}
        extra="支持手机号、座机（如010-12345678）或400热线"
      >
        <Input placeholder="请输入联系电话" aria-label="联系电话" />
      </Form.Item>
    </Form>
  );
};

export default AddressForm;
