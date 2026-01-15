import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Divider,
  Row,
  Col,
  Card,
  Typography,
  Alert,
  Tooltip,
  Tag,
  message,
} from 'antd';
import {
  InfoCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  InventoryItem,
  Location,
  CreateInventoryItemParams,
  UpdateInventoryItemParams,
} from '@/types/inventory';
import { useInventoryStore } from '@/stores/inventoryStore';

const { Option } = Select;
const { Title, Text } = Typography;

interface InventoryFormProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingRecord?: InventoryItem | null;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  visible,
  onCancel,
  onSuccess,
  editingRecord,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  const { createInventoryItem, updateInventoryItem, fetchLocations } = useInventoryStore();

  // 获取位置数据
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchLocations();
        setLocations(data);
      } catch (error) {
        message.error('获取位置数据失败');
      }
    };

    if (visible) {
      loadLocations();
    }
  }, [visible, fetchLocations]);

  // 表单初始化
  useEffect(() => {
    if (visible && editingRecord) {
      form.setFieldsValue({
        productId: editingRecord.productId,
        locationId: editingRecord.locationId,
        currentStock: editingRecord.currentStock,
        minStock: editingRecord.minStock,
        maxStock: editingRecord.maxStock,
        safeStock: editingRecord.safeStock,
        averageCost: editingRecord.averageCost,
        remark: editingRecord.remark,
      });
    } else if (visible) {
      form.resetFields();
    }
  }, [visible, editingRecord, form]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingRecord) {
        // 编辑模式
        const updateParams: UpdateInventoryItemParams = {
          minStock: values.minStock,
          maxStock: values.maxStock,
          safeStock: values.safeStock,
          averageCost: values.averageCost,
          locationId: values.locationId,
          remark: values.remark,
        };

        await updateInventoryItem(editingRecord.id, updateParams);
        message.success('库存项更新成功');
      } else {
        // 新建模式
        const createParams: CreateInventoryItemParams = {
          productId: values.productId,
          locationId: values.locationId,
          initialStock: values.currentStock,
          minStock: values.minStock,
          maxStock: values.maxStock,
          safeStock: values.safeStock,
          averageCost: values.averageCost,
          remark: values.remark,
        };

        await createInventoryItem(createParams);
        message.success('库存项创建成功');
      }

      onSuccess();
      onCancel();
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error(editingRecord ? '更新失败' : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // 库存验证规则
  const validateStockRange = (_, value: number, callback: (error?: string) => void) => {
    const minStock = form.getFieldValue('minStock');
    const maxStock = form.getFieldValue('maxStock');

    if (minStock && maxStock && minStock > maxStock) {
      callback('最小库存不能大于最大库存');
      return;
    }

    if (minStock && value && value < minStock) {
      callback('当前库存不能小于最小库存');
      return;
    }

    if (maxStock && value && value > maxStock) {
      callback('当前库存不能大于最大库存');
      return;
    }

    callback();
  };

  // 验证安全库存
  const validateSafeStock = (_, value: number, callback: (error?: string) => void) => {
    const minStock = form.getFieldValue('minStock');

    if (minStock && value && value < minStock) {
      callback('安全库存不能小于最小库存');
      return;
    }

    callback();
  };

  // 计算库存状态
  const getStockStatus = (current: number, min: number, max: number) => {
    if (current === 0) return { status: 'out_of_stock', color: 'red', text: '无库存' };
    if (current <= min) return { status: 'low_stock', color: 'orange', text: '库存不足' };
    if (current >= max) return { status: 'overstock', color: 'blue', text: '库存过量' };
    return { status: 'normal', color: 'green', text: '库存正常' };
  };

  // 监听库存变化，实时显示状态
  const [stockStatus, setStockStatus] = useState<any>(null);

  const handleStockChange = () => {
    const current = form.getFieldValue('currentStock');
    const min = form.getFieldValue('minStock');
    const max = form.getFieldValue('maxStock');

    if (current !== undefined && min !== undefined && max !== undefined) {
      const status = getStockStatus(current, min, max);
      setStockStatus(status);
    } else {
      setStockStatus(null);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <span>{editingRecord ? '编辑库存项' : '新建库存项'}</span>
          {editingRecord && <Tag color="blue">商品编码: {editingRecord.productCode}</Tag>}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {editingRecord ? '更新' : '创建'}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onValuesChange={handleStockChange}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="productId"
              label="商品ID"
              rules={[
                { required: true, message: '请输入商品ID' },
                { pattern: /^[A-Z0-9]{6,20}$/, message: '商品ID格式不正确' },
              ]}
              extra={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  商品唯一标识，格式：大写字母和数字，6-20位
                </Text>
              }
            >
              <Input
                placeholder="例如：PRD001"
                disabled={!!editingRecord}
                suffix={
                  <Tooltip title="商品ID是系统中的唯一标识">
                    <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
                  </Tooltip>
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="locationId"
              label="存储位置"
              rules={[{ required: true, message: '请选择存储位置' }]}
            >
              <Select
                placeholder="请选择存储位置"
                showSearch
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {locations.map((location) => (
                  <Option key={location.id} value={location.id}>
                    <Space>
                      <span>{location.name}</span>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        ({location.code})
                      </Text>
                      <Tag color={location.isActive ? 'green' : 'red'} size="small">
                        {location.isActive ? '启用' : '禁用'}
                      </Tag>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider>库存配置</Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="currentStock"
              label="当前库存"
              rules={[
                { required: true, message: '请输入当前库存' },
                { type: 'number', min: 0, message: '库存不能为负数' },
                { validator: validateStockRange },
              ]}
            >
              <InputNumber
                placeholder="请输入当前库存数量"
                style={{ width: '100%' }}
                min={0}
                precision={0}
                addonAfter="个"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="minStock"
              label="最小库存"
              rules={[
                { required: true, message: '请输入最小库存' },
                { type: 'number', min: 0, message: '最小库存不能为负数' },
              ]}
              extra={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  低于此值将触发库存预警
                </Text>
              }
            >
              <InputNumber
                placeholder="库存警戒线"
                style={{ width: '100%' }}
                min={0}
                precision={0}
                addonAfter="个"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="maxStock"
              label="最大库存"
              rules={[
                { required: true, message: '请输入最大库存' },
                { type: 'number', min: 0, message: '最大库存不能为负数' },
              ]}
              extra={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  库存容量上限
                </Text>
              }
            >
              <InputNumber
                placeholder="库存上限"
                style={{ width: '100%' }}
                min={0}
                precision={0}
                addonAfter="个"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* 库存状态显示 */}
        {stockStatus && (
          <Alert
            message="库存状态"
            description={
              <Space>
                <Tag color={stockStatus.color}>{stockStatus.text}</Tag>
                {stockStatus.status === 'low_stock' && (
                  <Text type="warning">当前库存已低于警戒线，建议及时补货</Text>
                )}
                {stockStatus.status === 'overstock' && (
                  <Text type="secondary">当前库存已超过最大容量，注意仓储管理</Text>
                )}
              </Space>
            }
            type={stockStatus.status === 'out_of_stock' ? 'error' : 'info'}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="safeStock"
              label="安全库存"
              rules={[
                { required: true, message: '请输入安全库存' },
                { type: 'number', min: 0, message: '安全库存不能为负数' },
                { validator: validateSafeStock },
              ]}
              extra={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  建议保持的最低安全库存水平
                </Text>
              }
            >
              <InputNumber
                placeholder="安全库存数量"
                style={{ width: '100%' }}
                min={0}
                precision={0}
                addonAfter="个"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="averageCost"
              label="平均成本"
              rules={[
                { required: true, message: '请输入平均成本' },
                { type: 'number', min: 0, message: '成本不能为负数' },
              ]}
              extra={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  商品的平均采购成本，用于库存价值计算
                </Text>
              }
            >
              <InputNumber
                placeholder="平均成本"
                style={{ width: '100%' }}
                min={0}
                precision={2}
                addonBefore="¥"
                addonAfter="元"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>其他信息</Divider>

        <Form.Item
          name="remark"
          label="备注"
          extra={
            <Text type="secondary" style={{ fontSize: '12px' }}>
              可填写特殊说明、管理要求等信息
            </Text>
          }
        >
          <Input.TextArea placeholder="请输入备注信息..." rows={3} maxLength={500} showCount />
        </Form.Item>

        {/* 库存管理提示 */}
        <Card size="small" style={{ marginTop: 16 }}>
          <Title level={5} style={{ marginBottom: 12 }}>
            <InfoCircleOutlined /> 库存管理建议
          </Title>
          <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
            <ul style={{ paddingLeft: 20, margin: 0 }}>
              <li>
                <Text strong>最小库存</Text>：设置为订货周期内的最大使用量，确保不会缺货
              </li>
              <li>
                <Text strong>最大库存</Text>：考虑仓储容量和商品保质期，避免过度积压
              </li>
              <li>
                <Text strong>安全库存</Text>：应对供应链波动和突发需求的安全缓冲
              </li>
              <li>
                <Text strong>定期盘点</Text>：建议每月进行库存盘点，确保账实相符
              </li>
            </ul>
          </div>
        </Card>
      </Form>
    </Modal>
  );
};

export default InventoryForm;
