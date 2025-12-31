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
  Popconfirm,
  message,
  Divider,
  Tag,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { MaterialType } from '@/types';

const { Title, Text } = Typography;
const { Option } = Select;

interface BomComponent {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  isOptional: boolean;
  sortOrder: number;
}

interface BomRecipe {
  id: string;
  version: number;
  components: BomComponent[];
  totalCost?: number;
  yieldRate?: number;
  instructions?: string;
  isActive: boolean;
}

interface BomTabProps {
  control: Control<any>;
  errors: FieldErrors<FieldValues>;
  touched: Record<string, boolean>;
  materialType: MaterialType;
  setValue: (name: string, value: any) => void;
  getValues: (name?: string) => any;
}

const BomTab: React.FC<BomTabProps> = ({
  control,
  errors,
  touched,
  materialType,
  setValue,
  getValues,
}) => {
  const [editingComponent, setEditingComponent] = useState<BomComponent | null>(null);
  const [componentFormVisible, setComponentFormVisible] = useState(false);

  const {
    fields: componentFields,
    append: appendComponent,
    remove: removeComponent,
    update: updateComponent,
  } = useFieldArray({
    control,
    name: 'bom.components',
  });

  // 如果不是成品，显示提示信息
  if (materialType.toString() !== 'finished_goods') {
    return (
      <div className="bom-tab">
        <Alert
          message="BOM配方仅适用于成品商品"
          description="当前物料类型不是成品，无需配置BOM配方。如需配置，请先将物料类型更改为成品。"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    );
  }

  // 计算总成本
  const calculateTotalCost = () => {
    const components = getValues('bom.components') || [];
    return components.reduce((total: number, component: BomComponent) => {
      return total + (component.totalCost || 0);
    }, 0);
  };

  // 添加新物料
  const handleAddComponent = () => {
    const newComponent: BomComponent = {
      id: Date.now().toString(),
      materialId: '',
      materialName: '',
      quantity: 0,
      unit: '个',
      unitCost: 0,
      totalCost: 0,
      isOptional: false,
      sortOrder: componentFields.length,
    };
    setEditingComponent(newComponent);
    setComponentFormVisible(true);
  };

  // 编辑物料
  const handleEditComponent = (component: BomComponent) => {
    setEditingComponent({ ...component });
    setComponentFormVisible(true);
  };

  // 保存物料
  const handleSaveComponent = (component: BomComponent) => {
    component.totalCost = (component.unitCost || 0) * component.quantity;

    if (editingComponent && componentFields.find((field) => field.id === editingComponent.id)) {
      // 更新现有物料
      const index = componentFields.findIndex((field) => field.id === component.id);
      if (index !== -1) {
        updateComponent(index, component);
      }
    } else {
      // 添加新物料
      appendComponent(component);
    }

    // 更新总成本
    const totalCost = calculateTotalCost();
    setValue('bom.totalCost', totalCost);

    setComponentFormVisible(false);
    setEditingComponent(null);
    message.success('物料保存成功');
  };

  // 删除物料
  const handleDeleteComponent = (index: number) => {
    removeComponent(index);

    // 重新计算总成本
    setTimeout(() => {
      const totalCost = calculateTotalCost();
      setValue('bom.totalCost', totalCost);
    }, 0);

    message.success('物料已删除');
  };

  // 单位选项
  const unitOptions = [
    '个',
    '件',
    '盒',
    '袋',
    '瓶',
    '罐',
    '份',
    '套',
    '千克',
    '克',
    '升',
    '毫升',
    '米',
    '厘米',
  ];

  // 表格列定义
  const columns = [
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      render: (text: string, record: BomComponent) => (
        <Space>
          <span>{text || record.materialId || '-'}</span>
          {record.isOptional && <Tag color="orange">可选</Tag>}
        </Space>
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
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
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEditComponent(record)} />
          <Popconfirm
            title="确定删除此物料吗？"
            onConfirm={() => handleDeleteComponent(index)}
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
    <div className="bom-tab">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 说明信息 */}
        <Alert
          message="BOM（Bill of Materials）配方管理"
          description="配置成品的生产配方，定义所需的物料、数量和成本。BOM配方将用于成本计算、生产计划和库存管理。"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {/* 基础信息 */}
        <Card title="配方基础信息">
          <Row gutter={[16, 0]}>
            <Col span={8}>
              <Form.Item
                label="配方版本"
                validateStatus={errors['bom.version'] ? 'error' : undefined}
                help={errors['bom.version']?.message as string}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="1"
                  min={1}
                  value={getValues('bom.version') || 1}
                  onChange={(value) => setValue('bom.version', value || 1)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="成品率(%)"
                validateStatus={errors['bom.yieldRate'] ? 'error' : undefined}
                help={errors['bom.yieldRate']?.message as string}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="100"
                  min={1}
                  max={100}
                  precision={2}
                  value={getValues('bom.yieldRate') || 100}
                  onChange={(value) => setValue('bom.yieldRate', value || 100)}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="配方状态">
                <Select
                  value={getValues('bom.isActive') !== false ? 'active' : 'inactive'}
                  onChange={(value) => setValue('bom.isActive', value === 'active')}
                >
                  <Option value="active">启用</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="制作说明"
            validateStatus={errors['bom.instructions'] ? 'error' : undefined}
            help={errors['bom.instructions']?.message as string}
          >
            <Input.TextArea
              rows={3}
              placeholder="请输入制作说明和工艺要求（可选）"
              value={getValues('bom.instructions') || ''}
              onChange={(e) => setValue('bom.instructions', e.target.value)}
            />
          </Form.Item>
        </Card>

        <Divider />

        {/* 物料列表 */}
        <div>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              物料清单
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddComponent}>
              添加物料
            </Button>
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
                <Text type="secondary">暂无物料</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  添加生产所需的原材料和半成品
                </Text>
              </div>
            </Card>
          ) : (
            <>
              <Table
                dataSource={getValues('bom.components') || []}
                columns={columns}
                rowKey="id"
                pagination={false}
                bordered
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
                  <Col span={8}>
                    <Text type="secondary">物料总数：</Text>
                    <Text strong>{componentFields.length} 种</Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">物料总成本：</Text>
                    <Text strong style={{ color: '#1890ff' }}>
                      ¥{calculateTotalCost().toFixed(2)}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">成品率：</Text>
                    <Text strong>{getValues('bom.yieldRate') || 100}%</Text>
                  </Col>
                </Row>
              </Card>
            </>
          )}
        </div>

        {/* 物料编辑表单 */}
        {componentFormVisible && editingComponent && (
          <ComponentForm
            component={editingComponent}
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

// 物料编辑表单组件
interface ComponentFormProps {
  component: BomComponent;
  onSave: (component: BomComponent) => void;
  onCancel: () => void;
}

const ComponentForm: React.FC<ComponentFormProps> = ({ component, onSave, onCancel }) => {
  const [formComponent, setFormComponent] = useState<BomComponent>(component);

  // 模拟物料数据（实际应该从API获取）
  const materialOptions = [
    { id: 'mat001', name: '可乐糖浆', unit: '升', cost: 15.5 },
    { id: 'mat002', name: '纯净水', unit: '升', cost: 0.5 },
    { id: 'mat003', name: '冰块', unit: '千克', cost: 2.0 },
    { id: 'mat004', name: '柠檬片', unit: '片', cost: 0.3 },
    { id: 'mat005', name: '杯子', unit: '个', cost: 0.8 },
  ];

  // 物料选择
  const handleMaterialSelect = (materialId: string) => {
    const material = materialOptions.find((m) => m.id === materialId);
    if (material) {
      setFormComponent({
        ...formComponent,
        materialId,
        materialName: material.name,
        unit: material.unit,
        unitCost: material.cost,
        totalCost: material.cost * formComponent.quantity,
      });
    }
  };

  // 数量变化
  const handleQuantityChange = (quantity: number) => {
    const totalCost = (formComponent.unitCost || 0) * quantity;
    setFormComponent({
      ...formComponent,
      quantity,
      totalCost,
    });
  };

  // 单位成本变化
  const handleUnitCostChange = (unitCost: number) => {
    const totalCost = unitCost * formComponent.quantity;
    setFormComponent({
      ...formComponent,
      unitCost,
      totalCost,
    });
  };

  return (
    <Card
      title={component.materialName ? '编辑物料' : '添加物料'}
      style={{ marginTop: 16 }}
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            onClick={() => onSave(formComponent)}
            disabled={!formComponent.materialId || formComponent.quantity <= 0}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label="选择物料" required>
            <Select
              placeholder="请选择物料"
              value={formComponent.materialId}
              onChange={handleMaterialSelect}
              showSearch
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) || false
              }
            >
              {materialOptions.map((material) => (
                <Option key={material.id} value={material.id}>
                  {material.name} (¥{material.cost}/{material.unit})
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

export default BomTab;
