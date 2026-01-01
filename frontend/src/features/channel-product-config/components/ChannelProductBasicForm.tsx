/**
 * @spec O005-channel-product-config
 * Channel Product Basic Info Form
 */

import React from 'react';
import { Form, Input, InputNumber, Select, Switch, Card, Row, Col } from 'antd';
import {
  ChannelCategory,
  ChannelProductStatus,
  CHANNEL_CATEGORY_LABELS,
  CHANNEL_PRODUCT_STATUS_LABELS,
} from '../types';
import type { CreateChannelProductFormData } from '../schemas/channelProductSchema';
import { ChannelProductImageUpload } from './ChannelProductImageUpload';

const { TextArea } = Input;

import { SpecEditor } from './specs/SpecEditor';

export interface ChannelProductBasicFormProps {
  initialValues?: Partial<CreateChannelProductFormData>;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  disabled?: boolean;
}

export const ChannelProductBasicForm: React.FC<ChannelProductBasicFormProps> = ({
  initialValues,
  onValuesChange,
  disabled = false,
}) => {
  return (
    <Card title="基础信息" bordered={false}>
      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="displayName"
            label="展示名称"
            tooltip="在渠道端（如小程序）显示的商品名称，留空则使用 SKU 名称"
          >
            <Input placeholder="请输入展示名称" disabled={disabled} maxLength={100} showCount />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="channelCategory"
            label="渠道分类"
            required
            rules={[{ required: true, message: '请选择渠道分类' }]}
          >
            <Select placeholder="请选择分类" disabled={disabled}>
              {Object.values(ChannelCategory).map((category) => (
                <Select.Option key={category} value={category}>
                  {CHANNEL_CATEGORY_LABELS[category]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="channelPrice"
            label="渠道价格 (分)"
            tooltip="在渠道端的销售价格，单位为分。留空则使用 SKU 基础价格"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入价格（分）"
              min={1}
              precision={0}
              disabled={disabled}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="isRecommended" label="推荐商品" valuePropName="checked">
            <Switch disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={12}>
          <Form.Item
            name="status"
            label="商品状态"
            required
            initialValue={ChannelProductStatus.ACTIVE}
          >
            <Select placeholder="请选择状态" disabled={disabled}>
              {Object.values(ChannelProductStatus).map((status) => (
                <Select.Option key={status} value={status}>
                  {CHANNEL_PRODUCT_STATUS_LABELS[status]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="sortOrder" label="排序序号" initialValue={0}>
            <InputNumber style={{ width: '100%' }} min={0} precision={0} disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="mainImage" label="商品主图" tooltip="商品列表页和详情页显示的主图">
        <ChannelProductImageUpload disabled={disabled} maxSize={5} />
      </Form.Item>

      {/* 暂时简化 detailImages 为 Text Area 输入多个 URL，换行分隔，实际项目应封装 UploadList */}
      {/* 这里先略过 detailImages 的复杂 UI，MVP 阶段可暂不支持主要详情图配置或者仅支持主图 */}

      <Form.Item name="description" label="商品描述">
        <TextArea
          placeholder="请输入商品描述"
          rows={4}
          maxLength={500}
          showCount
          disabled={disabled}
        />
      </Form.Item>

      <SpecEditor />
    </Card>
  );
};
