import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  message,
  Tooltip,
  Badge,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Upload,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import type { UploadProps } from 'antd';

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;

interface ChannelPrice {
  id: string;
  channelName: string;
  channelCode: string;
  productId: string;
  productName: string;
  productSku: string;
  basePrice: number;
  channelPrice: number;
  discountRate: number;
  effectiveDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending' | 'draft';
  approvedBy?: string;
  approvedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

interface ChannelPriceManagerProps {
  productId?: string;
  onPriceUpdate?: (price: ChannelPrice) => void;
}

const ChannelPriceManager: React.FC<ChannelPriceManagerProps> = ({ productId, onPriceUpdate }) => {
  const [prices, setPrices] = useState<ChannelPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ChannelPrice | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [statusFilter, setStatusFilter] = useState<string>();
  const [form] = Form.useForm();

  // 模拟数据
  useEffect(() => {
    const mockData: ChannelPrice[] = [
      {
        id: '1',
        channelName: '线上商城',
        channelCode: 'ONLINE',
        productId: 'PROD001',
        productName: '爆米花-中份',
        productSku: 'POPCORN-M',
        basePrice: 25.0,
        channelPrice: 22.5,
        discountRate: 0.1,
        effectiveDate: '2024-01-01',
        expiryDate: '2024-12-31',
        status: 'active',
        approvedBy: '张经理',
        approvedAt: '2024-01-01T10:30:00',
        createdBy: '李四',
        createdAt: '2023-12-28T15:20:00',
        updatedBy: '李四',
        updatedAt: '2024-01-01T10:30:00',
      },
      {
        id: '2',
        channelName: '线下门店',
        channelCode: 'OFFLINE',
        productId: 'PROD001',
        productName: '爆米花-中份',
        productSku: 'POPCORN-M',
        basePrice: 25.0,
        channelPrice: 25.0,
        discountRate: 0,
        effectiveDate: '2024-01-01',
        expiryDate: '2024-12-31',
        status: 'active',
        approvedBy: '王经理',
        approvedAt: '2024-01-01T11:15:00',
        createdBy: '张三',
        createdAt: '2023-12-25T09:00:00',
        updatedBy: '王经理',
        updatedAt: '2024-01-01T11:15:00',
      },
      {
        id: '3',
        channelName: '企业采购',
        channelCode: 'ENTERPRISE',
        productId: 'PROD002',
        productName: '电影票-标准',
        productSku: 'TICKET-STD',
        basePrice: 45.0,
        channelPrice: 36.0,
        discountRate: 0.2,
        effectiveDate: '2024-02-01',
        expiryDate: '2024-06-30',
        status: 'pending',
        createdBy: '赵六',
        createdAt: '2024-01-20T14:30:00',
        updatedBy: '赵六',
        updatedAt: '2024-01-20T14:30:00',
      },
      {
        id: '4',
        channelName: '美团渠道',
        channelCode: 'MEITUAN',
        productId: 'PROD003',
        productName: '可乐-大杯',
        productSku: 'COKE-L',
        basePrice: 15.0,
        channelPrice: 13.5,
        discountRate: 0.1,
        effectiveDate: '2024-01-15',
        expiryDate: '2024-03-15',
        status: 'expired',
        createdBy: '钱七',
        createdAt: '2024-01-10T16:45:00',
        updatedBy: '钱七',
        updatedAt: '2024-01-10T16:45:00',
      },
    ];

    const filteredData = mockData.filter((price) => {
      if (productId && price.productId !== productId) return false;
      if (selectedChannel && price.channelCode !== selectedChannel) return false;
      if (statusFilter && price.status !== statusFilter) return false;
      if (dateRange) {
        const createdDate = dayjs(price.createdAt);
        if (!createdDate.isBetween(dateRange[0], dateRange[1], 'day', '[]')) return false;
      }
      return true;
    });

    setPrices(filteredData);
  }, [productId, selectedChannel, statusFilter, dateRange]);

  // 计算统计数据
  const stats = {
    total: prices.length,
    active: prices.filter((p) => p.status === 'active').length,
    pending: prices.filter((p) => p.status === 'pending').length,
    expired: prices.filter((p) => p.status === 'expired').length,
    avgDiscount:
      prices.length > 0 ? prices.reduce((sum, p) => sum + p.discountRate, 0) / prices.length : 0,
  };

  // 渠道选项
  const channelOptions = [
    { label: '线上商城', value: 'ONLINE' },
    { label: '线下门店', value: 'OFFLINE' },
    { label: '企业采购', value: 'ENTERPRISE' },
    { label: '美团渠道', value: 'MEITUAN' },
    { label: '饿了么', value: 'ELEME' },
    { label: '抖音小店', value: 'DOUYIN' },
  ];

  // 表格列配置
  const columns: ColumnsType<ChannelPrice> = [
    {
      title: '渠道信息',
      key: 'channel',
      render: (_, record: ChannelPrice) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.channelName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.channelCode}</div>
        </div>
      ),
    },
    {
      title: '商品信息',
      key: 'product',
      render: (_, record: ChannelPrice) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>SKU: {record.productSku}</div>
        </div>
      ),
    },
    {
      title: '价格信息',
      key: 'pricing',
      render: (_, record: ChannelPrice) => (
        <div>
          <div>
            基础价: <span style={{ color: '#666' }}>¥{record.basePrice.toFixed(2)}</span>
          </div>
          <div>
            渠道价:{' '}
            <span style={{ color: '#f50', fontWeight: 'bold' }}>
              ¥{record.channelPrice.toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            折扣: {record.discountRate > 0 ? `${(record.discountRate * 100).toFixed(1)}%` : '无'}
          </div>
        </div>
      ),
    },
    {
      title: '有效期',
      key: 'dateRange',
      render: (_, record: ChannelPrice) => {
        const now = dayjs();
        const start = dayjs(record.effectiveDate);
        const end = dayjs(record.expiryDate);
        const isExpired = now.isAfter(end);
        const isPending = now.isBefore(start);

        return (
          <div>
            <div>{start.format('YYYY-MM-DD')}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>至 {end.format('YYYY-MM-DD')}</div>
            {isExpired && <Tag color="red">已过期</Tag>}
            {isPending && <Tag color="orange">未生效</Tag>}
          </div>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: ChannelPrice) => {
        const statusConfig = {
          active: { color: 'green', text: '已生效', icon: <CheckCircleOutlined /> },
          pending: { color: 'orange', text: '待审核', icon: <ClockCircleOutlined /> },
          expired: { color: 'red', text: '已过期', icon: <ExclamationCircleOutlined /> },
          draft: { color: 'default', text: '草稿', icon: null },
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Space>
            <Badge status={config.color as any} />
            <span>{config.text}</span>
          </Space>
        );
      },
    },
    {
      title: '审批信息',
      key: 'approval',
      render: (_, record: ChannelPrice) => (
        <div style={{ fontSize: '12px' }}>
          {record.approvedBy ? (
            <>
              <div>审批人: {record.approvedBy}</div>
              <div style={{ color: '#666' }}>
                {record.approvedAt && dayjs(record.approvedAt).format('MM-DD HH:mm')}
              </div>
            </>
          ) : (
            <span style={{ color: '#999' }}>待审批</span>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: ChannelPrice) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status === 'active'}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个渠道价格配置吗？"
            onConfirm={() => handleDelete(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.status === 'active'}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理编辑
  const handleEdit = (price: ChannelPrice) => {
    setEditingPrice(price);
    form.setFieldsValue({
      ...price,
      dateRange: [dayjs(price.effectiveDate), dayjs(price.expiryDate)],
    });
    setModalVisible(true);
  };

  // 处理删除
  const handleDelete = (price: ChannelPrice) => {
    setPrices(prices.filter((p) => p.id !== price.id));
    message.success('删除成功');
  };

  // 处理表单提交
  const handleSubmit = (values: any) => {
    const { dateRange, ...priceValues } = values;

    const newPrice: ChannelPrice = {
      id: editingPrice?.id || Date.now().toString(),
      ...priceValues,
      effectiveDate: dateRange[0].format('YYYY-MM-DD'),
      expiryDate: dateRange[1].format('YYYY-MM-DD'),
      discountRate: (priceValues.basePrice - priceValues.channelPrice) / priceValues.basePrice,
      createdBy: editingPrice?.createdBy || '当前用户',
      createdAt: editingPrice?.createdAt || dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      updatedBy: '当前用户',
      updatedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      status: editingPrice?.status || 'pending',
    };

    if (editingPrice) {
      setPrices(prices.map((p) => (p.id === editingPrice.id ? newPrice : p)));
      message.success('更新成功');
    } else {
      setPrices([...prices, newPrice]);
      message.success('创建成功');
    }

    onPriceUpdate?.(newPrice);
    setModalVisible(false);
    setEditingPrice(null);
    form.resetFields();
  };

  // 批量导入配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/pricing/channel-prices/import',
    accept: '.xlsx,.xls,.csv',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
    beforeUpload(file) {
      const isExcel =
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!isExcel) {
        message.error('只能上传 Excel 文件!');
      }
      return isExcel || Upload.LIST_IGNORE;
    },
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总配置数"
              value={stats.total}
              prefix={<Badge count={stats.total} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="生效中"
              value={stats.active}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均折扣"
              value={stats.avgDiscount * 100}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选和操作 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Select
              placeholder="选择渠道"
              value={selectedChannel}
              onChange={setSelectedChannel}
              allowClear
              style={{ width: '100%' }}
            >
              {channelOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态筛选"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="active">已生效</Option>
              <Option value="pending">待审核</Option>
              <Option value="expired">已过期</Option>
              <Option value="draft">草稿</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={10} style={{ textAlign: 'right' }}>
            <Space>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>批量导入</Button>
              </Upload>
              <Button icon={<DownloadOutlined />}>导出模板</Button>
              <Button icon={<SyncOutlined />}>同步价格</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingPrice(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
              >
                新建渠道价格
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={prices}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title={editingPrice ? '编辑渠道价格' : '新建渠道价格'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingPrice(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="channelName"
                label="渠道名称"
                rules={[{ required: true, message: '请选择渠道' }]}
              >
                <Select placeholder="请选择渠道">
                  {channelOptions.map((option) => (
                    <Option key={option.value} value={option.label}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="channelCode"
                label="渠道编码"
                rules={[{ required: true, message: '请输入渠道编码' }]}
              >
                <Input placeholder="请输入渠道编码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="productName"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="productSku"
                label="商品SKU"
                rules={[{ required: true, message: '请输入商品SKU' }]}
              >
                <Input placeholder="请输入商品SKU" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="basePrice"
                label="基础价格"
                rules={[{ required: true, message: '请输入基础价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入基础价格"
                  precision={2}
                  min={0}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value!.replace(/¥\s?|(,*)/g, '')) as 0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="channelPrice"
                label="渠道价格"
                rules={[{ required: true, message: '请输入渠道价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入渠道价格"
                  precision={2}
                  min={0}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value!.replace(/¥\s?|(,*)/g, '')) as 0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dateRange"
            label="有效期"
            rules={[{ required: true, message: '请选择有效期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingPrice ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ChannelPriceManager;
