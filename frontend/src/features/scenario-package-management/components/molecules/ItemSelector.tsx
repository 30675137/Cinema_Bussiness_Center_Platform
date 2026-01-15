/**
 * 单品选择器组件
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  InputNumber,
  Input,
  Typography,
  Popconfirm,
  Space,
  message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, ShoppingOutlined, MinusOutlined } from '@ant-design/icons';
import type { PackageItem } from '../../types';

const { Text } = Typography;

export interface ItemSelectorProps {
  value?: PackageItem[];
  onChange?: (value: PackageItem[]) => void;
  disabled?: boolean;
}

interface AddItemFormData {
  itemId: string;
  itemName: string;
  itemPrice: number;
  quantity: number;
}

/**
 * 单品选择器
 *
 * 用于管理场景包的软权益（单品）：
 * - 添加单品（使用快照记录名称和价格）
 * - 修改数量
 * - 删除单品
 */
export const ItemSelector: React.FC<ItemSelectorProps> = ({
  value = [],
  onChange,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm<AddItemFormData>();

  const handleAdd = () => {
    form.validateFields().then((formData) => {
      // 检查是否已添加
      if (value.some((item) => item.itemId === formData.itemId)) {
        message.warning('该单品已添加，请修改数量');
        return;
      }

      const newItem: PackageItem = {
        id: `temp-${Date.now()}`, // 临时 ID，提交时由后端生成
        itemId: formData.itemId,
        quantity: formData.quantity,
        itemNameSnapshot: formData.itemName,
        itemPriceSnapshot: formData.itemPrice,
        sortOrder: value.length,
      };

      onChange?.([...value, newItem]);
      form.resetFields();
      setModalVisible(false);
    });
  };

  const handleRemove = (itemId: string) => {
    onChange?.(value.filter((item) => item.id !== itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number | null) => {
    if (quantity === null || quantity < 1) return;
    onChange?.(value.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
  };

  const totalPrice = value.reduce((sum, item) => sum + item.itemPriceSnapshot * item.quantity, 0);

  const columns = [
    {
      title: '单品名称',
      dataIndex: 'itemNameSnapshot',
      key: 'itemNameSnapshot',
    },
    {
      title: '单价',
      dataIndex: 'itemPriceSnapshot',
      key: 'itemPriceSnapshot',
      width: 100,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 140,
      render: (quantity: number, record: PackageItem) => (
        <Space size="small">
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleQuantityChange(record.id, quantity - 1)}
            disabled={disabled || quantity <= 1}
          />
          <InputNumber
            value={quantity}
            min={1}
            max={99}
            onChange={(v) => handleQuantityChange(record.id, v)}
            disabled={disabled}
            style={{ width: 60 }}
            size="small"
            controls={false}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleQuantityChange(record.id, quantity + 1)}
            disabled={disabled || quantity >= 99}
          />
        </Space>
      ),
    },
    {
      title: '小计',
      key: 'subtotal',
      width: 100,
      render: (_: any, record: PackageItem) => (
        <Text strong>¥{(record.itemPriceSnapshot * record.quantity).toFixed(2)}</Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: PackageItem) => (
        <Popconfirm
          title="确定删除此单品？"
          onConfirm={() => handleRemove(record.id)}
          disabled={disabled}
        >
          <Button type="text" danger size="small" icon={<DeleteOutlined />} disabled={disabled} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={
        <span>
          <ShoppingOutlined style={{ marginRight: 8 }} />
          软权益（单品）
        </span>
      }
      extra={
        <Space>
          {value.length > 0 && (
            <Text type="secondary">
              合计：
              <Text strong style={{ color: '#1890ff' }}>
                ¥{totalPrice.toFixed(2)}
              </Text>
            </Text>
          )}
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
            disabled={disabled}
          >
            添加单品
          </Button>
        </Space>
      }
      className="item-selector"
    >
      <Table
        dataSource={value}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        locale={{ emptyText: '暂无单品' }}
      />

      <Modal
        title="添加单品"
        open={modalVisible}
        onOk={handleAdd}
        onCancel={() => {
          form.resetFields();
          setModalVisible(false);
        }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ quantity: 1 }}>
          <Form.Item
            name="itemId"
            label="单品 ID"
            rules={[{ required: true, message: '请输入单品 ID' }]}
            extra="后续版本将支持从单品库选择"
          >
            <Input placeholder="请输入单品 ID" />
          </Form.Item>

          <Form.Item
            name="itemName"
            label="单品名称"
            rules={[{ required: true, message: '请输入单品名称' }]}
          >
            <Input placeholder="如：爆米花（大）" />
          </Form.Item>

          <Form.Item
            name="itemPrice"
            label="单品价格"
            rules={[{ required: true, message: '请输入单品价格' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              addonBefore="¥"
              placeholder="如 39.00"
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber
              min={1}
              max={99}
              precision={0}
              style={{ width: '100%' }}
              placeholder="如 2"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ItemSelector;
