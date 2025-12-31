import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Table,
  Switch,
  Popconfirm,
  message,
  Divider,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DragOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';

const { Title, Text } = Typography;
const { Option } = Select;

interface SpecItem {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'date';
  values: SpecValue[];
  required: boolean;
  sortOrder: number;
}

interface SpecValue {
  id: string;
  value: string;
  label?: string;
  price?: number;
}

interface SpecsTabProps {
  control: Control<any>;
  errors: FieldErrors<FieldValues>;
  touched: Record<string, boolean>;
}

const SpecsTab: React.FC<SpecsTabProps> = ({ control, errors, touched }) => {
  const [editingSpec, setEditingSpec] = useState<SpecItem | null>(null);
  const [specFormVisible, setSpecFormVisible] = useState(false);

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
    move: moveSpec,
  } = useFieldArray({
    control,
    name: 'specifications',
  });

  // 规格类型选项
  const specTypeOptions = [
    { value: 'text', label: '文本' },
    { value: 'number', label: '数字' },
    { value: 'select', label: '单选' },
    { value: 'multi_select', label: '多选' },
    { value: 'boolean', label: '布尔' },
    { value: 'date', label: '日期' },
  ];

  // 添加新规格
  const handleAddSpec = () => {
    const newSpec: SpecItem = {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      values: [],
      required: false,
      sortOrder: specFields.length,
    };
    setEditingSpec(newSpec);
    setSpecFormVisible(true);
  };

  // 编辑规格
  const handleEditSpec = (spec: SpecItem) => {
    setEditingSpec({ ...spec });
    setSpecFormVisible(true);
  };

  // 保存规格
  const handleSaveSpec = (spec: SpecItem) => {
    if (editingSpec && specFields.find((field) => field.id === editingSpec.id)) {
      // 更新现有规格
      const specs = control.getValues('specifications') || [];
      const index = specs.findIndex((s: SpecItem) => s.id === spec.id);
      if (index !== -1) {
        specs[index] = spec;
        control.setValue('specifications', specs);
      }
    } else {
      // 添加新规格
      appendSpec(spec);
    }
    setSpecFormVisible(false);
    setEditingSpec(null);
  };

  // 删除规格
  const handleDeleteSpec = (index: number) => {
    removeSpec(index);
    message.success('规格已删除');
  };

  // 移动规格
  const handleMoveSpec = (fromIndex: number, toIndex: number) => {
    moveSpec(fromIndex, toIndex);
  };

  // 表格列定义
  const columns = [
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      render: (_: any, __: any, index: number) => (
        <span className="drag-handle" style={{ cursor: 'grab' }}>
          <DragOutlined />
        </span>
      ),
    },
    {
      title: '规格名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: SpecItem) => (
        <Space>
          <span>{text || '-'}</span>
          {record.required && <Tag color="red">必填</Tag>}
        </Space>
      ),
    },
    {
      title: '规格类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const option = specTypeOptions.find((opt) => opt.value === type);
        return option ? option.label : type;
      },
    },
    {
      title: '规格值',
      dataIndex: 'values',
      key: 'values',
      render: (values: SpecValue[]) => (
        <div>
          {values.length === 0 ? (
            <Text type="secondary">-</Text>
          ) : (
            <Space wrap size={4}>
              {values.slice(0, 3).map((value) => (
                <Tag key={value.id}>{value.label || value.value}</Tag>
              ))}
              {values.length > 3 && <Tag>+{values.length - 3}</Tag>}
            </Space>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: SpecItem, index: number) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditSpec(record)} />
          <Popconfirm
            title="确定删除此规格吗？"
            onConfirm={() => handleDeleteSpec(index)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="specs-tab">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 说明信息 */}
        <div style={{ backgroundColor: '#f6ffed', padding: 16, borderRadius: 6 }}>
          <Space>
            <InfoCircleOutlined style={{ color: '#52c41a' }} />
            <Text>
              商品规格用于定义商品的属性变化，如颜色、尺寸、口味等。 规格值可以影响价格和库存管理。
            </Text>
          </Space>
        </div>

        {/* 规格列表 */}
        <div>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              规格属性
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSpec}>
              添加规格
            </Button>
          </div>

          {specFields.length === 0 ? (
            <Card
              style={{ textAlign: 'center', padding: '60px 0' }}
              bodyStyle={{ borderStyle: 'dashed' }}
            >
              <div style={{ color: '#d9d9d9', fontSize: 48, marginBottom: 16 }}>
                <InfoCircleOutlined />
              </div>
              <div>
                <Text type="secondary">暂无规格属性</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  添加商品规格来定义商品的不同变体
                </Text>
              </div>
            </Card>
          ) : (
            <Table
              dataSource={control.getValues('specifications') || []}
              columns={columns}
              rowKey="id"
              pagination={false}
              bordered
            />
          )}
        </div>

        <Divider />

        {/* 规格预览 */}
        {specFields.length > 0 && (
          <div>
            <Title level={4} style={{ marginBottom: 16 }}>
              SKU生成预览
            </Title>
            <Card style={{ backgroundColor: '#fafafa' }}>
              <Text type="secondary">
                基于当前规格将生成{' '}
                {control.getValues('specifications').reduce((acc: number, spec: SpecItem) => {
                  return acc * Math.max(1, spec.values.length);
                }, 1)}{' '}
                个SKU
              </Text>
            </Card>
          </div>
        )}

        {/* 规格编辑表单（弹窗或内嵌表单） */}
        {specFormVisible && editingSpec && (
          <SpecForm
            spec={editingSpec}
            onSave={handleSaveSpec}
            onCancel={() => {
              setSpecFormVisible(false);
              setEditingSpec(null);
            }}
          />
        )}
      </Space>
    </div>
  );
};

// 规格编辑表单组件
interface SpecFormProps {
  spec: SpecItem;
  onSave: (spec: SpecItem) => void;
  onCancel: () => void;
}

const SpecForm: React.FC<SpecFormProps> = ({ spec, onSave, onCancel }) => {
  const [formSpec, setFormSpec] = useState<SpecItem>(spec);
  const [newSpecValue, setNewSpecValue] = useState('');

  // 添加规格值
  const handleAddSpecValue = () => {
    if (!newSpecValue.trim()) return;

    const newValue: SpecValue = {
      id: Date.now().toString(),
      value: newSpecValue.trim(),
      label: newSpecValue.trim(),
      price: 0,
    };

    setFormSpec({
      ...formSpec,
      values: [...formSpec.values, newValue],
    });
    setNewSpecValue('');
  };

  // 删除规格值
  const handleDeleteSpecValue = (valueId: string) => {
    setFormSpec({
      ...formSpec,
      values: formSpec.values.filter((v) => v.id !== valueId),
    });
  };

  // 更新规格值
  const handleUpdateSpecValue = (valueId: string, field: keyof SpecValue, value: any) => {
    setFormSpec({
      ...formSpec,
      values: formSpec.values.map((v) => (v.id === valueId ? { ...v, [field]: value } : v)),
    });
  };

  return (
    <Card
      title={spec.name ? '编辑规格' : '添加规格'}
      style={{ marginTop: 16 }}
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={() => onSave(formSpec)} disabled={!formSpec.name.trim()}>
            保存
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label="规格名称" required>
            <Input
              placeholder="请输入规格名称，如：颜色、尺寸"
              value={formSpec.name}
              onChange={(e) => setFormSpec({ ...formSpec, name: e.target.value })}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="规格类型" required>
            <Select
              value={formSpec.type}
              onChange={(value) => setFormSpec({ ...formSpec, type: value })}
            >
              <Option value="text">文本</Option>
              <Option value="number">数字</Option>
              <Option value="select">单选</Option>
              <Option value="multi_select">多选</Option>
              <Option value="boolean">布尔</Option>
              <Option value="date">日期</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item label="是否必填">
            <Switch
              checked={formSpec.required}
              onChange={(checked) => setFormSpec({ ...formSpec, required: checked })}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="排序值">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="排序值"
              value={formSpec.sortOrder}
              onChange={(value) => setFormSpec({ ...formSpec, sortOrder: value || 0 })}
            />
          </Form.Item>
        </Col>
      </Row>

      {(formSpec.type === 'select' || formSpec.type === 'multi_select') && (
        <div>
          <Form.Item label="规格值选项">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 80px)' }}
                  placeholder="输入规格值"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  onPressEnter={handleAddSpecValue}
                />
                <Button type="primary" onClick={handleAddSpecValue} disabled={!newSpecValue.trim()}>
                  添加
                </Button>
              </Input.Group>

              {formSpec.values.map((value) => (
                <Input.Group compact key={value.id}>
                  <Input
                    style={{ width: 'calc(100% - 120px)' }}
                    value={value.value}
                    onChange={(e) => handleUpdateSpecValue(value.id, 'value', e.target.value)}
                  />
                  <InputNumber
                    style={{ width: 80 }}
                    placeholder="加价"
                    value={value.price}
                    onChange={(val) => handleUpdateSpecValue(value.id, 'price', val || 0)}
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteSpecValue(value.id)}
                  />
                </Input.Group>
              ))}
            </Space>
          </Form.Item>
        </div>
      )}
    </Card>
  );
};

export default SpecsTab;
