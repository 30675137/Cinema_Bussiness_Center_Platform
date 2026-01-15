/**
 * @spec O005-channel-product-config
 * Spec Option Row Component
 */

import React from 'react';
import { Form, Input, InputNumber, Button, Space, Switch, Row, Col } from 'antd';
import { DeleteOutlined, MenuOutlined } from '@ant-design/icons';

export interface SpecOptionRowProps {
  name: number; // Collection index
  onRemove: () => void;
  isSorting?: boolean; // Future drag handle support
}

export const SpecOptionRow: React.FC<SpecOptionRowProps> = ({ name, onRemove }) => {
  return (
    <Space align="baseline" style={{ display: 'flex', width: '100%', marginBottom: 8 }}>
      <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />

      <Form.Item name={[name, 'name']} rules={[{ required: true, message: '输入名称' }]} noStyle>
        <Input placeholder="选项名称" style={{ width: 120 }} />
      </Form.Item>

      <Form.Item name={[name, 'priceAdjust']} initialValue={0} noStyle>
        <InputNumber
          placeholder="调价(分)"
          formatter={(value) => `${value}`}
          parser={(value) => value?.replace(/[^\d-]/g, '') as unknown as number}
          style={{ width: 100 }}
        />
      </Form.Item>

      <Form.Item name={[name, 'isDefault']} valuePropName="checked" initialValue={false} noStyle>
        <Switch checkedChildren="默认" unCheckedChildren="默认" size="small" />
      </Form.Item>

      <Button type="text" danger icon={<DeleteOutlined />} onClick={onRemove} />
    </Space>
  );
};
