/**
 * @spec O005-channel-product-config
 * Spec Editor Container Component
 */

import React from 'react';
import { Form, Button, Typography, Space, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SpecGroupCard } from './SpecGroupCard';
import { SpecType } from '../../types';

const { Title } = Typography;

// Use crypto.randomUUID() instead of uuid package
const uuidv4 = () => crypto.randomUUID();

export const SpecEditor: React.FC = () => {
  return (
    <div style={{ marginTop: 24 }}>
      <Title level={4}>规格配置</Title>

      <Form.List name="specs">
        {(fields, { add, remove }) => (
          <>
            {fields.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无规格配置"
                style={{ marginBottom: 16 }}
              />
            )}

            {fields.map(({ key, name, ...restField }) => (
              <SpecGroupCard key={key} name={name} onRemove={() => remove(name)} />
            ))}

            <Button
              type="primary"
              onClick={() => {
                add({
                  id: uuidv4(),
                  type: SpecType.CUSTOM,
                  name: '',
                  required: true,
                  multiSelect: false,
                  options: [
                    { id: uuidv4(), name: '默认', priceAdjust: 0, isDefault: true, sortOrder: 0 },
                  ],
                });
              }}
              block
              icon={<PlusOutlined />}
              style={{ marginTop: 8 }}
            >
              添加规格组 (如：大小/甜度)
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
};
