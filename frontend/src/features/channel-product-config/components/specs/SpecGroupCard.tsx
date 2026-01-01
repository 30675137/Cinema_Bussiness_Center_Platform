/**
 * @spec O005-channel-product-config
 * Spec Group Card Component
 */

import React from 'react';
import { Card, Form, Input, Select, Switch, Space, Button, Typography, Row, Col } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { SpecType, SPEC_TYPE_LABELS } from '../../types';
import { SpecOptionRow } from './SpecOptionRow';

const { Text } = Typography;

export interface SpecGroupCardProps {
  name: number;
  onRemove: () => void;
}

export const SpecGroupCard: React.FC<SpecGroupCardProps> = ({ name, onRemove }) => {
  return (
    <Card
      size="small"
      style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
      title={
        <Space>
          <Form.Item
            name={[name, 'name']}
            rules={[{ required: true, message: '输入规格名称' }]}
            noStyle
          >
            <Input placeholder="规格名称（如：温度）" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name={[name, 'type']} noStyle initialValue={SpecType.CUSTOM}>
            <Select style={{ width: 100 }} size="small">
              {Object.values(SpecType).map((type) => (
                <Select.Option key={type} value={type}>
                  {SPEC_TYPE_LABELS[type]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Space>
      }
      extra={
        <Button type="text" danger icon={<DeleteOutlined />} onClick={onRemove}>
          移除规格
        </Button>
      }
    >
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Form.Item name={[name, 'required']} valuePropName="checked" initialValue={false} noStyle>
            <Switch checkedChildren="必选" unCheckedChildren="非必选" size="small" />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item
            name={[name, 'multiSelect']}
            valuePropName="checked"
            initialValue={false}
            noStyle
          >
            <Switch checkedChildren="多选" unCheckedChildren="单选" size="small" />
          </Form.Item>
        </Col>
      </Row>

      <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
        选项列表
      </Text>

      <Form.List name={[name, 'options']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name: optionName, ...restField }) => (
              <SpecOptionRow key={key} name={optionName} onRemove={() => remove(optionName)} />
            ))}
            <Button
              type="dashed"
              onClick={() => add({ name: '', priceAdjust: 0, isDefault: false })}
              block
              icon={<PlusOutlined />}
            >
              添加选项
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  );
};
