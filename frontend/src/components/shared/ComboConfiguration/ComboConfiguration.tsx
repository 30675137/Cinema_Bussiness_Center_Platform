/**
 * 套餐配置组件 - 共享组件
 * 用于套餐SKU的子项管理
 * @since P001-sku-master-data T025
 */
import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Table,
  Popconfirm,
  message,
  Divider,
  Tag,
  Alert,
  Select,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import type { Control, FieldErrors, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { Controller, useFieldArray } from 'react-hook-form';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 套餐子项接口（通用）
 */
export interface ComboItem {
  id: string;
  subItemId: string; // 子项SKU ID
  subItemName: string; // 子项名称
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  isOptional: boolean;
  sortOrder: number;
}

/**
 * 可选子项接口
 */
export interface AvailableSubItem {
  id: string;
  name: string;
  unit: string;
  cost: number;
  type?: string; // SKU类型，用于显示
}

/**
 * ComboConfiguration Props
 */
export interface ComboConfigurationProps<T = any> {
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;

  // 数据字段路径（React Hook Form）
  fieldPath: string; // 例如: "comboItems"

  // 可用子项列表（从外部传入）
  availableSubItems: AvailableSubItem[];

  // 标签文本自定义
  labels?: {
    subItemLabel?: string; // 子项标签，例如: "子项SKU"
    title?: string; // 标题，例如: "套餐配置"
  };

  // 是否只读
  readOnly?: boolean;

  // 成本计算回调（可选）
  onCostChange?: (totalCost: number) => void;
}

/**
 * ComboConfiguration 组件
 */
export const ComboConfiguration = <T extends Record<string, any>>({
  control,
  errors,
  setValue,
  getValues,
  fieldPath,
  availableSubItems,
  labels = {},
  readOnly = false,
  onCostChange,
}: ComboConfigurationProps<T>) => {
  const [editingItem, setEditingItem] = useState<ComboItem | null>(null);
  const [itemFormVisible, setItemFormVisible] = useState(false);

  const subItemLabel = labels.subItemLabel || '子项';
  const title = labels.title || '套餐配置';

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
    update: updateItem,
  } = useFieldArray({
    control,
    name: fieldPath as any,
  });

  // 计算总成本
  const calculateTotalCost = (): number => {
    const items = getValues(fieldPath as any) || [];
    return items.reduce((total: number, item: ComboItem) => {
      return total + (item.totalCost || 0);
    }, 0);
  };

  // 监听成本变化
  useEffect(() => {
    const totalCost = calculateTotalCost();
    onCostChange?.(totalCost);
  }, [itemFields]);

  // 添加新子项
  const handleAddItem = () => {
    const newItem: ComboItem = {
      id: crypto.randomUUID(),
      subItemId: '',
      subItemName: '',
      quantity: 1,
      unit: '个',
      unitCost: 0,
      totalCost: 0,
      isOptional: false,
      sortOrder: itemFields.length,
    };
    setEditingItem(newItem);
    setItemFormVisible(true);
  };

  // 编辑子项
  const handleEditItem = (item: ComboItem) => {
    setEditingItem({ ...item });
    setItemFormVisible(true);
  };

  // 保存子项
  const handleSaveItem = (item: ComboItem) => {
    item.totalCost = (item.unitCost || 0) * item.quantity;

    const existingIndex = itemFields.findIndex((field) => (field as ComboItem).id === item.id);

    if (existingIndex !== -1) {
      // 更新现有子项
      updateItem(existingIndex, item);
    } else {
      // 添加新子项
      appendItem(item as any);
    }

    setItemFormVisible(false);
    setEditingItem(null);
    message.success(`${subItemLabel}保存成功`);
  };

  // 删除子项
  const handleDeleteItem = (index: number) => {
    removeItem(index);
    message.success(`${subItemLabel}已删除`);
  };

  // 表格列定义
  const columns = [
    {
      title: `${subItemLabel}名称`,
      dataIndex: 'subItemName',
      key: 'subItemName',
      render: (text: string, record: ComboItem) => (
        <Space>
          <span>{text || record.subItemId || '-'}</span>
          {record.isOptional && <Tag color="orange">可选</Tag>}
        </Space>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity: number, record: ComboItem) => (
        <Text>
          {quantity} {record.unit}
        </Text>
      ),
    },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      render: (cost: number) => <Text>¥{(cost || 0).toFixed(2)}</Text>,
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      render: (cost: number) => <Text strong>¥{(cost || 0).toFixed(2)}</Text>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: any, record: ComboItem, index: number) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditItem(record)}
            disabled={readOnly}
          />
          <Popconfirm
            title={`确定删除此${subItemLabel}吗？`}
            onConfirm={() => handleDeleteItem(index)}
            okText="确定"
            cancelText="取消"
            disabled={readOnly}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} disabled={readOnly} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="combo-configuration">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 说明信息 */}
        <Alert
          message={`${title}管理`}
          description={`配置套餐所包含的${subItemLabel}清单，定义${subItemLabel}、数量和成本。套餐总成本将自动计算为所有${subItemLabel}成本之和。`}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {/* 子项列表 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              {subItemLabel}清单
            </Title>
            {!readOnly && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                添加{subItemLabel}
              </Button>
            )}
          </div>

          {itemFields.length === 0 ? (
            <Card
              style={{ textAlign: 'center', padding: '60px 0' }}
              bodyStyle={{ borderStyle: 'dashed' }}
            >
              <div style={{ color: '#d9d9d9', fontSize: 48, marginBottom: 16 }}>
                <ShoppingOutlined />
              </div>
              <div>
                <Text type="secondary">暂无{subItemLabel}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  添加套餐所包含的{subItemLabel}
                </Text>
              </div>
            </Card>
          ) : (
            <>
              <Table
                dataSource={getValues(fieldPath as any) || []}
                columns={columns}
                rowKey="id"
                pagination={false}
                bordered
                size="small"
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <Text strong>套餐总成本</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Text strong style={{ color: '#1890ff' }}>
                          ¥{calculateTotalCost().toFixed(2)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />

              {/* 成本分析 */}
              <Card style={{ marginTop: 16, backgroundColor: '#fafafa' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">{subItemLabel}总数：</Text>
                    <Text strong>{itemFields.length} 个</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">套餐总成本：</Text>
                    <Text strong style={{ color: '#1890ff' }}>
                      ¥{calculateTotalCost().toFixed(2)}
                    </Text>
                  </Col>
                </Row>
              </Card>
            </>
          )}
        </div>

        {/* 子项编辑表单 */}
        {itemFormVisible && editingItem && (
          <SubItemForm
            item={editingItem}
            availableSubItems={availableSubItems}
            subItemLabel={subItemLabel}
            onSave={handleSaveItem}
            onCancel={() => {
              setItemFormVisible(false);
              setEditingItem(null);
            }}
          />
        )}
      </Space>
    </div>
  );
};

/**
 * 子项编辑表单
 */
interface SubItemFormProps {
  item: ComboItem;
  availableSubItems: AvailableSubItem[];
  subItemLabel: string;
  onSave: (item: ComboItem) => void;
  onCancel: () => void;
}

const SubItemForm: React.FC<SubItemFormProps> = ({
  item,
  availableSubItems,
  subItemLabel,
  onSave,
  onCancel,
}) => {
  const [formItem, setFormItem] = useState<ComboItem>(item);

  // 选择子项
  const handleSubItemSelect = (subItemId: string) => {
    const selected = availableSubItems.find((s) => s.id === subItemId);
    if (selected) {
      setFormItem({
        ...formItem,
        subItemId,
        subItemName: selected.name,
        unit: selected.unit,
        unitCost: selected.cost,
        totalCost: selected.cost * formItem.quantity,
      });
    }
  };

  // 数量变化
  const handleQuantityChange = (quantity: number | null) => {
    const qty = quantity || 0;
    const totalCost = (formItem.unitCost || 0) * qty;
    setFormItem({
      ...formItem,
      quantity: qty,
      totalCost,
    });
  };

  // 单位成本变化
  const handleUnitCostChange = (unitCost: number | null) => {
    const cost = unitCost || 0;
    const totalCost = cost * formItem.quantity;
    setFormItem({
      ...formItem,
      unitCost: cost,
      totalCost,
    });
  };

  return (
    <Card
      title={formItem.subItemName ? `编辑${subItemLabel}` : `添加${subItemLabel}`}
      style={{ marginTop: 16 }}
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            onClick={() => onSave(formItem)}
            disabled={!formItem.subItemId || formItem.quantity <= 0}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label={`选择${subItemLabel}`} required>
            <Select
              placeholder={`请选择${subItemLabel}`}
              value={formItem.subItemId || undefined}
              onChange={handleSubItemSelect}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
              }
            >
              {availableSubItems.map((subItem) => (
                <Option key={subItem.id} value={subItem.id}>
                  {subItem.name}
                  {subItem.type && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {subItem.type}
                    </Tag>
                  )}
                  (¥{subItem.cost.toFixed(2)}/{subItem.unit})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="单位">
            <Input disabled value={formItem.unit} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 0]}>
        <Col span={8}>
          <Form.Item label="数量" required>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0"
              min={0}
              precision={3}
              value={formItem.quantity}
              onChange={handleQuantityChange}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="单位成本">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0.00"
              min={0}
              precision={2}
              value={formItem.unitCost}
              onChange={handleUnitCostChange}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="总成本">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0.00"
              min={0}
              precision={2}
              value={formItem.totalCost}
              disabled
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item label="是否可选">
            <Select
              value={formItem.isOptional ? 'optional' : 'required'}
              onChange={(value) =>
                setFormItem({
                  ...formItem,
                  isOptional: value === 'optional',
                })
              }
            >
              <Option value="required">必需</Option>
              <Option value="optional">可选</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="排序值">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0"
              min={0}
              value={formItem.sortOrder}
              onChange={(value) =>
                setFormItem({
                  ...formItem,
                  sortOrder: value || 0,
                })
              }
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default ComboConfiguration;
