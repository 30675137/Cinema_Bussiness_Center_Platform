/**
 * 调拨表单组件
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  InputNumber,
  Space,
  Card,
  Row,
  Col,
  Divider,
  Upload,
  message,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  TransferFormData,
  TransferType,
  TransferPriority,
  ShippingMethod,
  Location,
  InventoryQueryResult,
} from '@/types/transfer';
import { useTransferStore } from '@/stores/transferStore';
import { formatCurrency } from '@/utils/formatters';

const { TextArea } = Input;
const { Option } = Select;

/**
 * 调拨表单组件属性
 */
interface TransferFormProps {
  mode: 'create' | 'edit';
  initialData?: TransferFormData | null;
  onSubmit: (data: TransferFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 调拨项表单数据
 */
interface TransferItemFormData {
  productId: string;
  productName: string;
  productCode: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  unit: string;
  plannedQuantity: number;
  unitPrice: number;
  batchNumber?: string;
  productionDate?: string;
  expiryDate?: string;
  remarks?: string;
}

/**
 * 调拨表单组件
 */
const TransferForm: React.FC<TransferFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<TransferItemFormData[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const { locations, getInventoryByLocation, fetchLocations } = useTransferStore();

  // 初始化表单
  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        plannedDate: initialData.plannedDate ? dayjs(initialData.plannedDate) : undefined,
        estimatedArrivalDate: initialData.estimatedArrivalDate
          ? dayjs(initialData.estimatedArrivalDate)
          : undefined,
      });
      setItems(initialData.items || []);
    } else {
      form.resetFields();
      setItems([]);
    }
  }, [initialData, form]);

  // 添加调拨项
  const handleAddItem = (inventoryItem: InventoryQueryResult) => {
    const newItem: TransferItemFormData = {
      productId: inventoryItem.productId,
      productName: inventoryItem.productName,
      productCode: inventoryItem.productCode,
      skuId: inventoryItem.skuId,
      skuCode: inventoryItem.skuCode,
      skuName: inventoryItem.skuName,
      unit: inventoryItem.unit,
      plannedQuantity: 1,
      unitPrice: inventoryItem.unitPrice,
      batchNumber: inventoryItem.batchNumber,
      productionDate: inventoryItem.productionDate,
      expiryDate: inventoryItem.expiryDate,
    };

    // 检查是否已存在
    const existingIndex = items.findIndex(
      item => item.skuId === newItem.skuId
    );

    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].plannedQuantity += newItem.plannedQuantity;
      setItems(newItems);
    } else {
      setItems([...items, newItem]);
    }

    setShowProductSelector(false);
    message.success('商品已添加');
  };

  // 删除调拨项
  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // 更新调拨项
  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  // 计算总金额
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.plannedQuantity * item.unitPrice, 0);
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (items.length === 0) {
        message.error('请至少添加一个调拨商品');
        return;
      }

      const formData: TransferFormData = {
        ...values,
        plannedDate: values.plannedDate?.format('YYYY-MM-DD'),
        estimatedArrivalDate: values.estimatedArrivalDate?.format('YYYY-MM-DD'),
        items: items.map(item => ({
          ...item,
          totalPrice: item.plannedQuantity * item.unitPrice,
        })),
      };

      onSubmit(formData);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 获取库存商品列表
  const fetchInventoryItems = async () => {
    if (!selectedLocationId) {
      message.warning('请先选择调出位置');
      return [];
    }

    try {
      const inventory = await getInventoryByLocation(selectedLocationId);
      return inventory.filter(item => item.availableStock > 0);
    } catch (error) {
      message.error('获取库存信息失败');
      return [];
    }
  };

  // 商品选择器表格列
  const inventoryColumns: ColumnsType<InventoryQueryResult> = [
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 100,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: 'SKU编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 100,
    },
    {
      title: 'SKU名称',
      dataIndex: 'skuName',
      key: 'skuName',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '可用库存',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 100,
      render: (stock: number) => `${stock} 件`,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 100,
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleAddItem(record)}
        >
          添加
        </Button>
      ),
    },
  ];

  // 调拨项表格列
  const itemColumns: ColumnsType<TransferItemFormData> = [
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 100,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: 'SKU',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 100,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '计划数量',
      dataIndex: 'plannedQuantity',
      key: 'plannedQuantity',
      width: 120,
      render: (value: number, record: any, index: number) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => handleUpdateItem(index, 'plannedQuantity', val || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: '小计',
      key: 'subtotal',
      width: 100,
      render: (_, record) => formatCurrency(record.plannedQuantity * record.unitPrice),
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 100,
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record, index) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(index)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={`${mode === 'create' ? '新建' : '编辑'}调拨单`}
      open={true}
      onCancel={onCancel}
      width={1200}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {mode === 'create' ? '创建' : '更新'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          type: TransferType.WAREHOUSE_TO_WAREHOUSE,
          priority: TransferPriority.NORMAL,
          shippingMethod: ShippingMethod.COMPANY_LOGISTICS,
        }}
      >
        {/* 基本信息 */}
        <Card title="基本信息" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="调拨标题"
                name="title"
                rules={[{ required: true, message: '请输入调拨标题' }]}
              >
                <Input placeholder="请输入调拨标题" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="调拨类型"
                name="type"
                rules={[{ required: true, message: '请选择调拨类型' }]}
              >
                <Select placeholder="请选择调拨类型">
                  <Option value={TransferType.WAREHOUSE_TO_WAREHOUSE}>仓库间调拨</Option>
                  <Option value={TransferType.STORE_TO_STORE}>门店间调拨</Option>
                  <Option value={TransferType.WAREHOUSE_TO_STORE}>仓库到门店</Option>
                  <Option value={TransferType.STORE_TO_WAREHOUSE}>门店到仓库</Option>
                  <Option value={TransferType.EMERGENCY}>紧急调拨</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="优先级"
                name="priority"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  <Option value={TransferPriority.LOW}>低</Option>
                  <Option value={TransferPriority.NORMAL}>普通</Option>
                  <Option value={TransferPriority.HIGH}>高</Option>
                  <Option value={TransferPriority.URGENT}>紧急</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="计划调拨日期"
                name="plannedDate"
                rules={[{ required: true, message: '请选择计划调拨日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择计划调拨日期"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="运输方式"
                name="shippingMethod"
                rules={[{ required: true, message: '请选择运输方式' }]}
              >
                <Select placeholder="请选择运输方式">
                  <Option value={ShippingMethod.SELF_PICKUP}>自提</Option>
                  <Option value={ShippingMethod.COMPANY_LOGISTICS}>公司物流</Option>
                  <Option value={ShippingMethod.THIRD_PARTY_LOGISTICS}>第三方物流</Option>
                  <Option value={ShippingMethod.EXPRESS}>快递</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="预计到达日期" name="estimatedArrivalDate">
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择预计到达日期"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="调拨描述" name="description">
                <TextArea
                  rows={3}
                  placeholder="请输入调拨描述"
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 位置信息 */}
        <Card title="位置信息" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="调出位置"
                name="fromLocationId"
                rules={[{ required: true, message: '请选择调出位置' }]}
              >
                <Select
                  placeholder="请选择调出位置"
                  onChange={(value) => setSelectedLocationId(value)}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {locations
                    .filter(location => location.isActive)
                    .map(location => (
                      <Option key={location.id} value={location.id}>
                        {location.name} ({location.code})
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="调入位置"
                name="toLocationId"
                rules={[{ required: true, message: '请选择调入位置' }]}
              >
                <Select
                  placeholder="请选择调入位置"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {locations
                    .filter(location => location.isActive)
                    .map(location => (
                      <Option key={location.id} value={location.id}>
                        {location.name} ({location.code})
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 调拨商品 */}
        <Card
          title="调拨商品"
          className="mb-4"
          extra={
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => setShowProductSelector(true)}
              disabled={!selectedLocationId}
            >
              选择商品
            </Button>
          }
        >
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey={(record, index) => index?.toString() || '0'}
            pagination={false}
            size="small"
            scroll={{ x: 1000 }}
          />

          {/* 总计 */}
          {items.length > 0 && (
            <div className="mt-4 text-right">
              <Space>
                <span>总数量：</span>
                <span className="font-bold">
                  {items.reduce((sum, item) => sum + item.plannedQuantity, 0)} 件
                </span>
                <Divider type="vertical" />
                <span>总金额：</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatCurrency(calculateTotal())}
                </span>
              </Space>
            </div>
          )}
        </Card>

        {/* 备注信息 */}
        <Card title="备注信息">
          <Form.Item label="备注" name="remarks">
            <TextArea
              rows={3}
              placeholder="请输入备注信息"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item label="附件" name="attachments">
            <Upload
              listType="text"
              beforeUpload={() => false}
              showUploadList={{
                showRemoveIcon: true,
              }}
            >
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
        </Card>
      </Form>

      {/* 商品选择器 */}
      <Modal
        title="选择商品"
        open={showProductSelector}
        onCancel={() => setShowProductSelector(false)}
        width={1000}
        footer={[
          <Button key="cancel" onClick={() => setShowProductSelector(false)}>
            取消
          </Button>,
        ]}
      >
        <ProductSelector
          locationId={selectedLocationId}
          onProductSelect={handleAddItem}
          onClose={() => setShowProductSelector(false)}
        />
      </Modal>
    </Modal>
  );
};

/**
 * 商品选择器组件
 */
interface ProductSelectorProps {
  locationId: string;
  onProductSelect: (product: InventoryQueryResult) => void;
  onClose: () => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  locationId,
  onProductSelect,
  onClose,
}) => {
  const [inventoryItems, setInventoryItems] = useState<InventoryQueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { getInventoryByLocation } = useTransferStore();

  useEffect(() => {
    loadInventoryItems();
  }, [locationId]);

  const loadInventoryItems = async () => {
    if (!locationId) return;

    setLoading(true);
    try {
      const items = await getInventoryByLocation(locationId);
      setInventoryItems(items.filter(item => item.availableStock > 0));
    } catch (error) {
      console.error('加载库存失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.productName.toLowerCase().includes(searchText.toLowerCase()) ||
    item.productCode.toLowerCase().includes(searchText.toLowerCase()) ||
    item.skuCode.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<InventoryQueryResult> = [
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 100,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: 'SKU编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 100,
    },
    {
      title: 'SKU名称',
      dataIndex: 'skuName',
      key: 'skuName',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 60,
    },
    {
      title: '可用库存',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 100,
      render: (stock: number) => `${stock} 件`,
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (price: number) => formatCurrency(price),
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 100,
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => {
            onProductSelect(record);
            onClose();
          }}
        >
          添加
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <Input.Search
          placeholder="搜索商品名称、编码"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="skuId"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: 800 }}
        size="small"
      />
    </div>
  );
};

export default TransferForm;