/**
 * 硬权益选择器组件
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
import React, { useState } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  Typography,
  Tag,
  Popconfirm,
} from 'antd';
import { PlusOutlined, DeleteOutlined, GiftOutlined } from '@ant-design/icons';
import type { PackageBenefit, BenefitType } from '../../types';

const { Text } = Typography;
const { TextArea } = Input;

export interface BenefitSelectorProps {
  value?: PackageBenefit[];
  onChange?: (value: PackageBenefit[]) => void;
  disabled?: boolean;
}

interface AddBenefitFormData {
  benefitType: BenefitType;
  discountRate?: number;
  freeCount?: number;
  description?: string;
}

const BENEFIT_TYPE_OPTIONS = [
  { label: '折扣票价', value: 'DISCOUNT_TICKET' as BenefitType },
  { label: '免费场次', value: 'FREE_SCREENING' as BenefitType },
];

/**
 * 硬权益选择器
 *
 * 用于管理场景包的硬权益：
 * - 折扣票价
 * - 免费场次
 */
export const BenefitSelector: React.FC<BenefitSelectorProps> = ({
  value = [],
  onChange,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm<AddBenefitFormData>();
  const [selectedBenefitType, setSelectedBenefitType] = useState<BenefitType>('DISCOUNT_TICKET');

  const handleAdd = () => {
    form.validateFields().then((formData) => {
      const newBenefit: PackageBenefit = {
        id: `temp-${Date.now()}`, // 临时 ID，提交时由后端生成
        benefitType: formData.benefitType,
        discountRate: formData.discountRate,
        freeCount: formData.freeCount,
        description: formData.description,
        sortOrder: value.length,
      };

      onChange?.([...value, newBenefit]);
      form.resetFields();
      setModalVisible(false);
    });
  };

  const handleRemove = (benefitId: string) => {
    onChange?.(value.filter((b) => b.id !== benefitId));
  };

  const columns = [
    {
      title: '权益类型',
      dataIndex: 'benefitType',
      key: 'benefitType',
      render: (type: BenefitType) => (
        <Tag color={type === 'DISCOUNT_TICKET' ? 'blue' : 'green'}>
          {type === 'DISCOUNT_TICKET' ? '折扣票价' : '免费场次'}
        </Tag>
      ),
    },
    {
      title: '权益内容',
      key: 'content',
      render: (_: any, record: PackageBenefit) => {
        if (record.benefitType === 'DISCOUNT_TICKET') {
          return `${(record.discountRate! * 10).toFixed(1)} 折`;
        }
        return `${record.freeCount} 场免费`;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: PackageBenefit) => (
        <Popconfirm
          title="确定删除此权益？"
          onConfirm={() => handleRemove(record.id)}
          disabled={disabled}
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            disabled={disabled}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title={
        <span>
          <GiftOutlined style={{ marginRight: 8 }} />
          硬权益（观影优惠）
        </span>
      }
      extra={
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          disabled={disabled}
        >
          添加权益
        </Button>
      }
      className="benefit-selector"
    >
      <Table
        dataSource={value}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        locale={{ emptyText: '暂无硬权益' }}
      />

      <Modal
        title="添加硬权益"
        open={modalVisible}
        onOk={handleAdd}
        onCancel={() => {
          form.resetFields();
          setModalVisible(false);
        }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ benefitType: 'DISCOUNT_TICKET' }}>
          <Form.Item
            name="benefitType"
            label="权益类型"
            rules={[{ required: true, message: '请选择权益类型' }]}
          >
            <Select
              options={BENEFIT_TYPE_OPTIONS}
              onChange={(v) => setSelectedBenefitType(v)}
            />
          </Form.Item>

          {selectedBenefitType === 'DISCOUNT_TICKET' && (
            <Form.Item
              name="discountRate"
              label="折扣率"
              rules={[{ required: true, message: '请输入折扣率' }]}
              extra="例如：0.75 表示 7.5 折"
            >
              <InputNumber
                min={0.01}
                max={1}
                step={0.05}
                precision={2}
                style={{ width: '100%' }}
                placeholder="如 0.75"
              />
            </Form.Item>
          )}

          {selectedBenefitType === 'FREE_SCREENING' && (
            <Form.Item
              name="freeCount"
              label="免费场次数"
              rules={[{ required: true, message: '请输入免费场次数' }]}
            >
              <InputNumber
                min={1}
                max={10}
                precision={0}
                style={{ width: '100%' }}
                placeholder="如 1"
              />
            </Form.Item>
          )}

          <Form.Item name="description" label="权益描述">
            <TextArea rows={2} placeholder="如：尊享 7.5 折观影优惠" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default BenefitSelector;
