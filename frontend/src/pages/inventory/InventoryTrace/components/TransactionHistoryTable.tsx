import React, { useState } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Tooltip,
  Badge,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Alert,
  Empty,
} from 'antd';
import {
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  BarcodeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { TransactionDetail } from '@/types/inventory';
import {
  TransactionType,
  SourceType,
  TRANSACTION_TYPE_OPTIONS,
  SOURCE_TYPE_OPTIONS,
} from '@/types/inventory';

const { Text } = Typography;

interface TransactionHistoryTableProps {
  columns: ColumnsType<TransactionDetail>;
  dataSource: TransactionDetail[];
  loading?: boolean;
  pagination?: any;
  onViewDetail?: (record: TransactionDetail) => void;
}

// 模拟交易数据
const mockTransactionData: TransactionDetail[] = [
  {
    id: '1',
    storeId: 'STORE001',
    store: {
      id: 'STORE001',
      name: '万达影城CBD店',
      code: 'WM001',
      address: '北京市朝阳区CBD',
      contactInfo: '010-12345678',
      managerInfo: '张经理',
      isActive: true,
    },
    skuId: 'SKU001',
    sku: {
      id: 'SKU001',
      name: '可口可乐330ml',
      skuId: 'SKU001',
      skuCode: 'SKU001',
      description: '经典可口可乐330ml瓶装',
      category: '饮料',
      unit: '瓶',
      weight: 0.35,
      dimensions: { length: 6, width: 6, height: 20 },
      isActive: true,
    },
    transactionType: TransactionType.PURCHASE_IN,
    quantity: 100,
    unitCost: 3.5,
    totalCost: 350,
    batchNumber: 'BATCH001',
    expiryDate: '2024-12-31',
    stockBefore: 50,
    stockAfter: 150,
    availableBefore: 45,
    availableAfter: 145,
    sourceType: SourceType.PURCHASE_ORDER,
    sourceId: 'PO001',
    sourceDocument: '采购订单-PO001',
    operatorId: 'USER001',
    operator: {
      id: 'USER001',
      name: '李四',
      username: 'lisi',
      email: 'lisi@example.com',
      department: '采购部',
      position: '采购员',
    },
    transactionTime: '2024-01-15 10:30:00',
    remarks: '正常采购入库',
    metadata: { supplier: '可口可乐公司' },
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 10:30:00',
  },
  {
    id: '2',
    storeId: 'STORE001',
    store: {
      id: 'STORE001',
      name: '万达影城CBD店',
      code: 'WM001',
      address: '北京市朝阳区CBD',
      contactInfo: '010-12345678',
      managerInfo: '张经理',
      isActive: true,
    },
    skuId: 'SKU002',
    sku: {
      id: 'SKU002',
      name: '爆米花中份',
      skuId: 'SKU002',
      skuCode: 'SKU002',
      description: '经典黄油味爆米花中份',
      category: '零食',
      unit: '份',
      weight: 0.2,
      dimensions: { length: 15, width: 15, height: 10 },
      isActive: true,
    },
    transactionType: TransactionType.SALE_OUT,
    quantity: 25,
    unitCost: 18,
    totalCost: 450,
    batchNumber: 'BATCH002',
    stockBefore: 80,
    stockAfter: 55,
    availableBefore: 75,
    availableAfter: 50,
    sourceType: SourceType.SALES_ORDER,
    sourceId: 'SO001',
    sourceDocument: '销售订单-SO001',
    operatorId: 'USER002',
    operator: {
      id: 'USER002',
      name: '王五',
      username: 'wangwu',
      email: 'wangwu@example.com',
      department: '销售部',
      position: '收银员',
    },
    transactionTime: '2024-01-15 14:20:00',
    remarks: '电影院正常销售',
    metadata: { customerId: 'CUST001', orderId: 'ORDER001' },
    createdAt: '2024-01-15 14:20:00',
    updatedAt: '2024-01-15 14:20:00',
  },
];

const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  columns,
  dataSource,
  loading = false,
  pagination,
  onViewDetail,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 使用传入的dataSource或模拟数据
  const transactionData = dataSource || mockTransactionData;

  // 计算统计数据
  const statistics = {
    totalTransactions: transactionData.length,
    totalInbound: transactionData.filter((t) =>
      [
        TransactionType.PURCHASE_IN,
        TransactionType.TRANSFER_IN,
        TransactionType.ADJUSTMENT_IN,
        TransactionType.RETURN_IN,
        TransactionType.PRODUCTION_IN,
      ].includes(t.transactionType)
    ).length,
    totalOutbound: transactionData.filter((t) =>
      [
        TransactionType.SALE_OUT,
        TransactionType.TRANSFER_OUT,
        TransactionType.ADJUSTMENT_OUT,
        TransactionType.RETURN_OUT,
        TransactionType.DAMAGE_OUT,
        TransactionType.EXPIRED_OUT,
      ].includes(t.transactionType)
    ).length,
    totalValue: transactionData.reduce((sum, t) => sum + (t.totalCost || 0), 0),
    todayTransactions: transactionData.filter(
      (t) => dayjs(t.transactionTime).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    ).length,
  };

  // 获取交易类型的图标和颜色
  const getTransactionTypeInfo = (type: TransactionType) => {
    const option = TRANSACTION_TYPE_OPTIONS.find((opt) => opt.value === type);
    const isInbound = [
      TransactionType.PURCHASE_IN,
      TransactionType.TRANSFER_IN,
      TransactionType.ADJUSTMENT_IN,
      TransactionType.RETURN_IN,
      TransactionType.PRODUCTION_IN,
    ].includes(type);

    return {
      ...option,
      isInbound,
      icon: isInbound ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
    };
  };

  // 自定义表格列（如果没有传入columns则使用默认列）
  const defaultColumns: ColumnsType<TransactionDetail> = [
    {
      title: '交易时间',
      dataIndex: 'transactionTime',
      key: 'transactionTime',
      width: 160,
      sorter: true,
      render: (text) => (
        <Space direction="vertical" size="small">
          <Space>
            <CalendarOutlined />
            <Text>{dayjs(text).format('YYYY-MM-DD')}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(text).format('HH:mm:ss')}
          </Text>
        </Space>
      ),
    },
    {
      title: '商品信息',
      key: 'sku',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <BarcodeOutlined />
            <div>
              <Text strong>{record.sku.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.sku.skuCode} | {record.sku.category}
              </Text>
            </div>
          </Space>
        </Space>
      ),
    },
    {
      title: '门店',
      key: 'store',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <ShopOutlined />
            <div>
              <Text strong>{record.store.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.store.code}
              </Text>
            </div>
          </Space>
        </Space>
      ),
    },
    {
      title: '交易类型',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 120,
      render: (type) => {
        const typeInfo = getTransactionTypeInfo(type);
        return (
          <Tag color={typeInfo?.color} icon={typeInfo?.icon}>
            {typeInfo?.label}
          </Tag>
        );
      },
      filters: TRANSACTION_TYPE_OPTIONS.map((option) => ({
        text: option.label,
        value: option.value,
      })),
      onFilter: (value, record) => record.transactionType === value,
    },
    {
      title: '数量变化',
      key: 'quantityChange',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const typeInfo = getTransactionTypeInfo(record.transactionType);
        return (
          <Space direction="vertical" size="small">
            <Text strong style={{ color: typeInfo?.isInbound ? '#52c41a' : '#ff4d4f' }}>
              {typeInfo?.isInbound ? '+' : '-'}
              {record.quantity}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.sku.unit}
            </Text>
          </Space>
        );
      },
    },
    {
      title: '库存前后',
      key: 'stockChange',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ fontSize: '12px' }}>
          <div>交易前: {record.stockBefore}</div>
          <div style={{ color: '#1890ff', fontWeight: 'bold' }}>交易后: {record.stockAfter}</div>
          <div style={{ color: '#999' }}>
            变化: {record.stockAfter - record.stockBefore > 0 ? '+' : ''}
            {record.stockAfter - record.stockBefore}
          </div>
        </Space>
      ),
    },
    {
      title: '可用库存',
      key: 'availableStock',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ fontSize: '12px' }}>
          <div>可用前: {record.availableBefore}</div>
          <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
            可用后: {record.availableAfter}
          </div>
        </Space>
      ),
    },
    {
      title: '来源',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 100,
      render: (type) => {
        const option = SOURCE_TYPE_OPTIONS.find((opt) => opt.value === type);
        return option ? <Tag color={option.color}>{option.label}</Tag> : <Tag>{type}</Tag>;
      },
    },
    {
      title: '操作人',
      key: 'operator',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <UserOutlined />
            <div>
              <Text strong>{record.operator.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.operator.department}
              </Text>
            </div>
          </Space>
        </Space>
      ),
    },
    {
      title: '成本信息',
      key: 'cost',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.unitCost && <div>单价: ¥{record.unitCost.toFixed(2)}</div>}
          {record.totalCost && (
            <Text strong style={{ color: '#cf1322' }}>
              总价: ¥{record.totalCost.toFixed(2)}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: '批次信息',
      key: 'batch',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ fontSize: '12px' }}>
          {record.batchNumber && <div>批次: {record.batchNumber}</div>}
          {record.expiryDate && (
            <Tooltip title={record.expiryDate}>
              <div>
                到期: {dayjs(record.expiryDate).format('MM-DD')}
                {dayjs(record.expiryDate).diff(dayjs(), 'day') < 30 && (
                  <ExclamationCircleOutlined style={{ color: '#faad14', marginLeft: '4px' }} />
                )}
              </div>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => onViewDetail?.(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  // 使用传入的columns或默认columns
  const tableColumns = columns.length > 0 ? columns : defaultColumns;

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record: TransactionDetail) => ({
      disabled: false,
      name: record.sku.name,
    }),
  };

  return (
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          交易历史记录
          <Badge count={transactionData.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      extra={
        <Space>
          {selectedRowKeys.length > 0 && (
            <Badge count={selectedRowKeys.length}>
              <Button size="small">批量操作</Button>
            </Badge>
          )}
          <Button icon={<DownloadOutlined />} size="small">
            导出数据
          </Button>
        </Space>
      }
    >
      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="总交易数"
              value={statistics.totalTransactions}
              suffix="笔"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="入库记录"
              value={statistics.totalInbound}
              suffix="笔"
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="出库记录"
              value={statistics.totalOutbound}
              suffix="笔"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="今日交易"
              value={statistics.todayTransactions}
              suffix="笔"
              valueStyle={{ color: '#1890ff' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 交易表格 */}
      <Table
        columns={tableColumns}
        dataSource={transactionData}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={pagination}
        scroll={{ x: 1400 }}
        size="small"
        onChange={(pagination, filters, sorter) => {
          console.log('表格变化:', { pagination, filters, sorter });
        }}
      />

      {transactionData.length === 0 && !loading && (
        <Empty description="暂无交易记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};

export default TransactionHistoryTable;
