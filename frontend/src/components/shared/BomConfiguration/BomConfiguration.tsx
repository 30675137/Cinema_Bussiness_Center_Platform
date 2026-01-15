/**
 * BOM配置组件 - 共享组件
 * 用于SKU和Product的BOM配方管理
 * @since P001-sku-master-data T023
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
  CalculatorOutlined,
} from '@ant-design/icons';
import type { Control, FieldErrors, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import { Controller, useFieldArray } from 'react-hook-form';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * BOM组件接口（通用）
 */
export interface BomComponent {
  id: string;
  componentId: string; // 组件SKU/物料ID
  componentName: string; // 组件名称
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  isOptional: boolean;
  sortOrder: number;
}

/**
 * 可选物料项接口
 */
export interface AvailableComponent {
  id: string;
  name: string;
  unit: string;
  cost: number;
}

/**
 * BomConfiguration Props
 */
export interface BomConfigurationProps<T = any> {
  control: Control<T>;
  errors: FieldErrors<T>;
  setValue: UseFormSetValue<T>;
  getValues: UseFormGetValues<T>;

  // 数据字段路径（React Hook Form）
  fieldPath: string; // 例如: "bom.components" 或 "bomComponents"

  // 可用组件列表（从外部传入）
  availableComponents: AvailableComponent[];

  // 配置选项
  showWasteRate?: boolean; // 是否显示损耗率字段
  wasteRateFieldPath?: string; // 损耗率字段路径，例如: "wasteRate"

  // 标签文本自定义
  labels?: {
    componentLabel?: string; // 组件标签，例如: "物料" 或 "组件SKU"
    title?: string; // 标题，例如: "BOM配方" 或 "BOM配置"
  };

  // 是否只读
  readOnly?: boolean;

  // 成本计算回调（可选）
  onCostChange?: (totalCost: number) => void;
}

/**
 * BomConfiguration 组件
 */
export const BomConfiguration = <T extends Record<string, any>>({
  control,
  errors,
  setValue,
  getValues,
  fieldPath,
  availableComponents,
  showWasteRate = false,
  wasteRateFieldPath,
  labels = {},
  readOnly = false,
  onCostChange,
}: BomConfigurationProps<T>) => {
  const [editingComponent, setEditingComponent] = useState<BomComponent | null>(null);
  const [componentFormVisible, setComponentFormVisible] = useState(false);

  const componentLabel = labels.componentLabel || '组件';
  const title = labels.title || 'BOM配置';

  const {
    fields: componentFields,
    append: appendComponent,
    remove: removeComponent,
    update: updateComponent,
  } = useFieldArray({
    control,
    name: fieldPath as any,
  });

  // 计算总成本
  const calculateTotalCost = (): number => {
    const components = getValues(fieldPath as any) || [];
    return components.reduce((total: number, component: BomComponent) => {
      return total + (component.totalCost || 0);
    }, 0);
  };

  // 监听成本变化
  useEffect(() => {
    const totalCost = calculateTotalCost();
    onCostChange?.(totalCost);
  }, [componentFields]);

  // 添加新组件
  const handleAddComponent = () => {
    const newComponent: BomComponent = {
      id: crypto.randomUUID(),
      componentId: '',
      componentName: '',
      quantity: 1,
      unit: '个',
      unitCost: 0,
      totalCost: 0,
      isOptional: false,
      sortOrder: componentFields.length,
    };
    setEditingComponent(newComponent);
    setComponentFormVisible(true);
  };

  // 编辑组件
  const handleEditComponent = (component: BomComponent) => {
    setEditingComponent({ ...component });
    setComponentFormVisible(true);
  };

  // 保存组件
  const handleSaveComponent = (component: BomComponent) => {
    component.totalCost = (component.unitCost || 0) * component.quantity;

    const existingIndex = componentFields.findIndex(
      (field) => (field as BomComponent).id === component.id
    );

    if (existingIndex !== -1) {
      // 更新现有组件
      updateComponent(existingIndex, component);
    } else {
      // 添加新组件
      appendComponent(component as any);
    }

    setComponentFormVisible(false);
    setEditingComponent(null);
    message.success(`${componentLabel}保存成功`);
  };

  // 删除组件
  const handleDeleteComponent = (index: number) => {
    removeComponent(index);
    message.success(`${componentLabel}已删除`);
  };

  // 表格列定义
  const columns = [
    {
      title: `${componentLabel}名称`,
      dataIndex: 'componentName',
      key: 'componentName',
      render: (text: string, record: BomComponent) => (
        <Space>
          <span>{text || record.componentId || '-'}</span>
          {record.isOptional && <Tag color="orange">可选</Tag>}
        </Space>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity: number, record: BomComponent) => (
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
      render: (_: any, record: BomComponent, index: number) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditComponent(record)}
            disabled={readOnly}
          />
          <Popconfirm
            title={`确定删除此${componentLabel}吗？`}
            onConfirm={() => handleDeleteComponent(index)}
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
    <div className="bom-configuration">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 说明信息 */}
        <Alert
          message={`${title}管理`}
          description={`配置生产所需的${componentLabel}清单，定义${componentLabel}、数量和成本。BOM配置将用于成本计算和库存管理。`}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {/* 损耗率配置（可选） */}
        {showWasteRate && wasteRateFieldPath && (
          <Card title="成本配置">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="损耗率(%)"
                  validateStatus={
                    errors[wasteRateFieldPath as keyof typeof errors] ? 'error' : undefined
                  }
                  help={errors[wasteRateFieldPath as keyof typeof errors]?.message as string}
                  extra="成品成本 = BOM总成本 × (1 + 损耗率%)"
                >
                  <Controller
                    name={wasteRateFieldPath as any}
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        {...field}
                        style={{ width: '100%' }}
                        placeholder="输入损耗率"
                        min={0}
                        max={100}
                        precision={2}
                        addonAfter="%"
                        disabled={readOnly}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        )}

        <Divider />

        {/* 组件列表 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              {componentLabel}清单
            </Title>
            {!readOnly && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddComponent}>
                添加{componentLabel}
              </Button>
            )}
          </div>

          {componentFields.length === 0 ? (
            <Card
              style={{ textAlign: 'center', padding: '60px 0' }}
              bodyStyle={{ borderStyle: 'dashed' }}
            >
              <div style={{ color: '#d9d9d9', fontSize: 48, marginBottom: 16 }}>
                <CalculatorOutlined />
              </div>
              <div>
                <Text type="secondary">暂无{componentLabel}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  添加生产所需的{componentLabel}
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
                        <Text strong>总成本</Text>
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
                    <Text type="secondary">{componentLabel}总数：</Text>
                    <Text strong>{componentFields.length} 个</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">{componentLabel}总成本：</Text>
                    <Text strong style={{ color: '#1890ff' }}>
                      ¥{calculateTotalCost().toFixed(2)}
                    </Text>
                  </Col>
                </Row>
              </Card>
            </>
          )}
        </div>

        {/* 组件编辑表单 */}
        {componentFormVisible && editingComponent && (
          <ComponentForm
            component={editingComponent}
            availableComponents={availableComponents}
            componentLabel={componentLabel}
            onSave={handleSaveComponent}
            onCancel={() => {
              setComponentFormVisible(false);
              setEditingComponent(null);
            }}
          />
        )}
      </Space>
    </div>
  );
};

/**
 * 组件编辑表单
 */
interface ComponentFormProps {
  component: BomComponent;
  availableComponents: AvailableComponent[];
  componentLabel: string;
  onSave: (component: BomComponent) => void;
  onCancel: () => void;
}

const ComponentForm: React.FC<ComponentFormProps> = ({
  component,
  availableComponents,
  componentLabel,
  onSave,
  onCancel,
}) => {
  const [formComponent, setFormComponent] = useState<BomComponent>(component);

  // 选择组件
  const handleComponentSelect = (componentId: string) => {
    const selected = availableComponents.find((c) => c.id === componentId);
    if (selected) {
      setFormComponent({
        ...formComponent,
        componentId,
        componentName: selected.name,
        unit: selected.unit,
        unitCost: selected.cost,
        totalCost: selected.cost * formComponent.quantity,
      });
    }
  };

  // 数量变化
  const handleQuantityChange = (quantity: number | null) => {
    const qty = quantity || 0;
    const totalCost = (formComponent.unitCost || 0) * qty;
    setFormComponent({
      ...formComponent,
      quantity: qty,
      totalCost,
    });
  };

  // 单位成本变化
  const handleUnitCostChange = (unitCost: number | null) => {
    const cost = unitCost || 0;
    const totalCost = cost * formComponent.quantity;
    setFormComponent({
      ...formComponent,
      unitCost: cost,
      totalCost,
    });
  };

  return (
    <Card
      title={formComponent.componentName ? `编辑${componentLabel}` : `添加${componentLabel}`}
      style={{ marginTop: 16 }}
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            onClick={() => onSave(formComponent)}
            disabled={!formComponent.componentId || formComponent.quantity <= 0}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label={`选择${componentLabel}`} required>
            <Select
              placeholder={`请选择${componentLabel}`}
              value={formComponent.componentId || undefined}
              onChange={handleComponentSelect}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
              }
            >
              {availableComponents.map((comp) => (
                <Option key={comp.id} value={comp.id}>
                  {comp.name} (¥{comp.cost.toFixed(2)}/{comp.unit})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="单位">
            <Input disabled value={formComponent.unit} />
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
              value={formComponent.quantity}
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
              value={formComponent.unitCost}
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
              value={formComponent.totalCost}
              disabled
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 0]}>
        <Col span={12}>
          <Form.Item label="是否可选">
            <Select
              value={formComponent.isOptional ? 'optional' : 'required'}
              onChange={(value) =>
                setFormComponent({
                  ...formComponent,
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
              value={formComponent.sortOrder}
              onChange={(value) =>
                setFormComponent({
                  ...formComponent,
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

export default BomConfiguration;
