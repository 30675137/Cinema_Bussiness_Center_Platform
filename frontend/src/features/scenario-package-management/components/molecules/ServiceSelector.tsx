/**
 * 服务选择器组件
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
import { PlusOutlined, DeleteOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import type { PackageService } from '../../types';

const { Text } = Typography;

export interface ServiceSelectorProps {
  value?: PackageService[];
  onChange?: (value: PackageService[]) => void;
  disabled?: boolean;
}

interface AddServiceFormData {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
}

/**
 * 服务选择器
 *
 * 用于管理场景包的服务项目：
 * - 添加服务（使用快照记录名称和价格）
 * - 删除服务
 */
export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  value = [],
  onChange,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm<AddServiceFormData>();

  const handleAdd = () => {
    form.validateFields().then((formData) => {
      // 检查是否已添加
      if (value.some((service) => service.serviceId === formData.serviceId)) {
        message.warning('该服务已添加');
        return;
      }

      const newService: PackageService = {
        id: `temp-${Date.now()}`, // 临时 ID，提交时由后端生成
        serviceId: formData.serviceId,
        serviceNameSnapshot: formData.serviceName,
        servicePriceSnapshot: formData.servicePrice,
        sortOrder: value.length,
      };

      onChange?.([...value, newService]);
      form.resetFields();
      setModalVisible(false);
    });
  };

  const handleRemove = (serviceId: string) => {
    onChange?.(value.filter((service) => service.id !== serviceId));
  };

  const totalPrice = value.reduce((sum, service) => sum + service.servicePriceSnapshot, 0);

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'serviceNameSnapshot',
      key: 'serviceNameSnapshot',
    },
    {
      title: '价格',
      dataIndex: 'servicePriceSnapshot',
      key: 'servicePriceSnapshot',
      width: 120,
      render: (price: number) => <Text strong>¥{price.toFixed(2)}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: PackageService) => (
        <Popconfirm
          title="确定删除此服务？"
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
          <CustomerServiceOutlined style={{ marginRight: 8 }} />
          服务项目
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
            添加服务
          </Button>
        </Space>
      }
      className="service-selector"
    >
      <Table
        dataSource={value}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        locale={{ emptyText: '暂无服务项目' }}
      />

      <Modal
        title="添加服务"
        open={modalVisible}
        onOk={handleAdd}
        onCancel={() => {
          form.resetFields();
          setModalVisible(false);
        }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="serviceId"
            label="服务 ID"
            rules={[{ required: true, message: '请输入服务 ID' }]}
            extra="后续版本将支持从服务库选择"
          >
            <Input placeholder="请输入服务 ID" />
          </Form.Item>

          <Form.Item
            name="serviceName"
            label="服务名称"
            rules={[{ required: true, message: '请输入服务名称' }]}
          >
            <Input placeholder="如：专属管家服务" />
          </Form.Item>

          <Form.Item
            name="servicePrice"
            label="服务价格"
            rules={[{ required: true, message: '请输入服务价格' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              addonBefore="¥"
              placeholder="如 199.00"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ServiceSelector;
