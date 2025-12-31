/**
 * 采购订单表单组件
 */
import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Table,
  Space,
  Modal,
  Upload,
  message,
  Divider,
  Alert,
  Tooltip,
  Popconfirm,
  Typography,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  SaveOutlined,
  EyeOutlined,
  CalculatorOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { PurchaseOrder, PurchaseOrderFormData, PurchaseOrderPriority } from '@/types/purchase';
import { usePurchaseOrderStore } from '@/stores/purchaseOrderStore';
import { formatCurrency } from '@/utils/formatters';
import { calculateOrderTotal } from '@/utils/calculators';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface PurchaseOrderFormProps {
  initialData?: PurchaseOrder | null;
  mode: 'create' | 'edit';
  onSubmit: (data: PurchaseOrderFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  initialData,
  mode,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm<PurchaseOrderFormData>();
  const [items, setItems] = useState<PurchaseOrder['items']>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // 监听项目变化计算总金额
  useEffect(() => {
    const total = calculateOrderTotal(items);
    setTotalAmount(total);
  }, [items]);

  // 编辑模式下初始化表单数据
  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.setFieldsValue({
        title: initialData.title,
        description: initialData.description,
        supplierId: initialData.supplier?.id,
        orderDate: dayjs(initialData.orderDate),
        expectedDeliveryDate: dayjs(initialData.expectedDeliveryDate),
        priority: initialData.priority,
        remarks: initialData.remarks,
        budgetAmount: initialData.budgetAmount,
      });
      setItems(initialData.items);
    } else {
      // 新建模式重置表单
      form.resetFields();
      setItems([]);
    }
  }, [initialData, mode, form]);

  // 添加订单项
  const handleAddItem = () => {
    const newItem: PurchaseOrder['items'][0] = {
      id: `temp_${Date.now()}`,
      productId: '',
      productName: '',
      productCode: '',
      specifications: '',
      unit: '个',
      quantity: 1,
      unitPrice: 0,
      discountRate: 0,
      taxRate: 0.13,
      discountAmount: 0,
      taxAmount: 0,
      subtotal: 0,
      remarks: '',
    };
    setItems([...items, newItem]);
  };

  // 更新订单项
  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = newItems[index];

    // 更新字段值
    (item as any)[field] = value;

    // 重新计算相关金额
    if (field === 'quantity' || field === 'unitPrice' || field === 'discountRate') {
      item.discountAmount = item.quantity * item.unitPrice * (item.discountRate / 100);
      item.subtotal = item.quantity * item.unitPrice - item.discountAmount;
      item.taxAmount = item.subtotal * item.taxRate;
    }

    if (field === 'taxRate') {
      item.taxAmount = item.subtotal * value;
    }

    setItems(newItems);
  };

  // 删除订单项
  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // 上传文件变化处理
  const handleUploadChange = (info: any) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);
  };

  // 表单提交处理
  const handleSubmit = async (values: PurchaseOrderFormData) => {
    try {
      // 验证订单项
      if (items.length === 0) {
        message.error('请至少添加一个订单项');
        return;
      }

      const invalidItems = items.filter((item) => !item.productId || !item.productName);
      if (invalidItems.length > 0) {
        message.error('请完善所有订单项的产品信息');
        return;
      }

      // 构建提交数据
      const submitData: PurchaseOrderFormData = {
        ...values,
        items: items.map((item) => ({
          ...item,
          // 移除临时ID
          id: item.id.startsWith('temp_') ? undefined : item.id,
        })),
        totalAmount,
        attachments: fileList.map((file) => ({
          name: file.name,
          url: file.url || file.response?.url || '',
          size: file.size,
          type: file.type,
        })),
      };

      await onSubmit(submitData);
      message.success(mode === 'create' ? '订单创建成功' : '订单更新成功');
    } catch (error) {
      console.error('Form submit error:', error);
      message.error('提交失败，请重试');
    }
  };

  // 预览订单
  const handlePreview = () => {
    setPreviewVisible(true);
  };

  // 订单项表格列定义
  const itemColumns = [
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      render: (value: string, record: any, index: number) => (
        <Input
          placeholder="请输入产品名称"
          value={value}
          onChange={(e) => handleUpdateItem(index, 'productName', e.target.value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (value: string, record: any, index: number) => (
        <Input
          placeholder="产品编码"
          value={value}
          onChange={(e) => handleUpdateItem(index, 'productCode', e.target.value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '规格型号',
      dataIndex: 'specifications',
      key: 'specifications',
      width: 150,
      render: (value: string, record: any, index: number) => (
        <Input
          placeholder="规格型号"
          value={value}
          onChange={(e) => handleUpdateItem(index, 'specifications', e.target.value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (value: string, record: any, index: number) => (
        <Select
          value={value}
          onChange={(val) => handleUpdateItem(index, 'unit', val)}
          style={{ width: '100%' }}
          options={[
            { label: '个', value: '个' },
            { label: '件', value: '件' },
            { label: '套', value: '套' },
            { label: '箱', value: '箱' },
            { label: '米', value: '米' },
            { label: '公斤', value: '公斤' },
            { label: '吨', value: '吨' },
          ]}
        />
      ),
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (value: number, record: any, index: number) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => handleUpdateItem(index, 'quantity', val || 1)}
          style={{ width: '100%' }}
          precision={0}
        />
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (value: number, record: any, index: number) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(val) => handleUpdateItem(index, 'unitPrice', val || 0)}
          style={{ width: '100%' }}
          precision={2}
          formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
        />
      ),
    },
    {
      title: '折扣率(%)',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 100,
      render: (value: number, record: any, index: number) => (
        <InputNumber
          min={0}
          max={100}
          value={value}
          onChange={(val) => handleUpdateItem(index, 'discountRate', val || 0)}
          style={{ width: '100%' }}
          precision={2}
        />
      ),
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      render: (value: number) => <Text strong>{formatCurrency(value)}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (value: any, record: any, index: number) => (
        <Popconfirm
          title="确定删除此订单项吗？"
          onConfirm={() => handleRemoveItem(index)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  // 优先级选项
  const priorityOptions = [
    { label: '低', value: PurchaseOrderPriority.LOW, color: 'blue' },
    { label: '中', value: PurchaseOrderPriority.MEDIUM, color: 'orange' },
    { label: '高', value: PurchaseOrderPriority.HIGH, color: 'red' },
    { label: '紧急', value: PurchaseOrderPriority.URGENT, color: 'magenta' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          orderDate: dayjs(),
          expectedDeliveryDate: dayjs().add(7, 'day'),
          priority: PurchaseOrderPriority.MEDIUM,
          taxRate: 0.13,
        }}
      >
        <Card title="基本信息" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="订单标题"
                rules={[{ required: true, message: '请输入订单标题' }]}
              >
                <Input placeholder="请输入订单标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="supplierId"
                label="供应商"
                rules={[{ required: true, message: '请选择供应商' }]}
              >
                <Select placeholder="请选择供应商">
                  <Option value="supplier_001">北京电影器材供应商</Option>
                  <Option value="supplier_002">上海食品供应商</Option>
                  <Option value="supplier_003">广州清洁用品供应商</Option>
                  <Option value="supplier_004">深圳电子产品供应商</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="orderDate"
                label="订单日期"
                rules={[{ required: true, message: '请选择订单日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="expectedDeliveryDate"
                label="预期交付日期"
                rules={[{ required: true, message: '请选择预期交付日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="优先级"
                rules={[{ required: true, message: '请选择优先级' }]}
              >
                <Select placeholder="请选择优先级">
                  {priorityOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <Tag color={option.color}>{option.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="budgetAmount"
                label="预算金额"
                rules={[{ required: true, message: '请输入预算金额' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  precision={2}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
                  placeholder="请输入预算金额"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="departmentId" label="采购部门">
                <Select placeholder="请选择采购部门">
                  <Option value="dept_001">采购部</Option>
                  <Option value="dept_002">运营部</Option>
                  <Option value="dept_003">技术部</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="订单描述">
            <TextArea placeholder="请输入订单描述" rows={3} maxLength={500} showCount />
          </Form.Item>
        </Card>

        <Card
          title="订单明细"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
              添加订单项
            </Button>
          }
          style={{ marginBottom: '16px' }}
        >
          {items.length === 0 ? (
            <Alert
              message="暂无订单项"
              description="请点击上方按钮添加订单项"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          ) : (
            <Table
              dataSource={items}
              columns={itemColumns}
              rowKey={(record) => record.id}
              pagination={false}
              size="small"
              bordered
            />
          )}

          {items.length > 0 && (
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <Space>
                <Text>订单总金额：</Text>
                <Title level={3} type="danger" style={{ margin: 0 }}>
                  {formatCurrency(totalAmount)}
                </Title>
              </Space>
            </div>
          )}
        </Card>

        <Card title="附件上传" style={{ marginBottom: '16px' }}>
          <Upload
            fileList={fileList}
            onChange={handleUploadChange}
            beforeUpload={() => false} // 阻止自动上传
            multiple
          >
            <Button icon={<UploadOutlined />}>上传附件</Button>
          </Upload>
        </Card>

        <Card title="备注信息" style={{ marginBottom: '24px' }}>
          <Form.Item name="remarks" label="备注">
            <TextArea placeholder="请输入备注信息" rows={3} maxLength={500} showCount />
          </Form.Item>
        </Card>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Space size="large">
            <Button icon={<EyeOutlined />} onClick={handlePreview} disabled={items.length === 0}>
              预览订单
            </Button>

            <Button onClick={onCancel}>取消</Button>

            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              {mode === 'create' ? '创建订单' : '保存修改'}
            </Button>
          </Space>
        </div>
      </Form>

      {/* 预览模态框 */}
      <Modal
        title="订单预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            确认提交
          </Button>,
        ]}
        width={1000}
      >
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {/* 这里可以添加订单预览组件 */}
          <Alert
            message="订单预览"
            description="这里将显示订单的详细预览信息"
            type="info"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

export default PurchaseOrderForm;
