import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Tag,
  Divider,
  Alert,
  Tabs,
  Badge,
  Tooltip,
  DatePicker,
  Select,
  Input,
  Form,
  Modal,
  Typography,
  message,
  Spin,
  Empty,
  Progress,
  Timeline,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  EyeOutlined,
  HistoryOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import {
  useInventoryStore,
  useInventoryQueries,
  useInventoryActions,
} from '@/store/inventoryStore';
import inventoryService from '@/services/inventoryService';
import { TransactionType, SourceType, InventoryStatus } from '@/types/inventory';

import InventorySearchPanel from './components/InventorySearchPanel';
import RealTimeInventoryCard from './components/RealTimeInventoryCard';
import TransactionHistoryTable from './components/TransactionHistoryTable';
import TransactionDetailModal from './components/TransactionDetailModal';
import InventoryStatisticsCard from './components/InventoryStatisticsCard';
import InventoryTrendsChart from './components/InventoryTrendsChart';
import ReplenishmentSuggestions from './components/ReplenishmentSuggestions';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface InventoryTraceProps {}

const InventoryTrace: React.FC<InventoryTraceProps> = () => {
  // 状态管理
  const {
    inventoryFilters,
    transactionFilters,
    selectedTransaction,
    setSelectedTransaction,
    currentInventory,
    transactions,
    statistics,
    alerts,
    activeTab,
    setActiveTab,
    setSearchKeyword,
    setInventoryFilters,
    setTransactions,
    setStatistics,
    setAlerts,
    isLoading,
    error,
    setError,
    setLoading,
  } = useInventoryStore();

  // 查询和操作方法
  const {
    useCurrentInventoryQuery,
    useTransactionsQuery,
    useStatisticsQuery,
    useTrendsQuery,
    useReplenishmentQuery,
    refreshCurrentInventory,
    refreshTransactions,
    refreshStatistics,
    exportInventoryData,
  } = useInventoryQueries();

  const { fetchTransactionDetail, fetchInventoryDetail } = useInventoryActions();

  // 组件状态
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<any>({});

  // 数据查询
  const currentInventoryQuery = useCurrentInventoryQuery(searchParams);
  const transactionsQuery = useTransactionsQuery(searchParams);
  const statisticsQuery = useStatisticsQuery();
  const trendsQuery = useTrendsQuery({
    dateRange: [dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
    groupBy: 'day',
  });
  const replenishmentQuery = useReplenishmentQuery({
    includeLowStock: true,
    maxSuggestions: 20,
  });

  // 模拟数据（用于演示）
  const mockData = {
    totalInventoryValue: 1250000,
    totalAvailableQuantity: 12450,
    lowStockItemsCount: 23,
    outOfStockItemsCount: 5,
    activeTransfersCount: 3,
    todayTransactionsCount: 156,
    highPriorityAlerts: [
      { alertType: 'low_stock', skuId: 'SKU001', thresholdValue: 50, thresholdUnit: '件' },
      { alertType: 'out_of_stock', skuId: 'SKU002', thresholdValue: 0, thresholdUnit: '件' },
    ],
  };

  // 处理搜索
  const handleSearch = (values: any) => {
    const params = {
      ...values,
      dateRange: values.dateRange
        ? [values.dateRange[0].format('YYYY-MM-DD'), values.dateRange[1].format('YYYY-MM-DD')]
        : undefined,
      page: 1,
      pageSize: 20,
    };

    setSearchParams(params);
    setInventoryFilters(params);
    setActiveTab('transactions');
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    setInventoryFilters({});
    setSearchParams({});
    setSearchKeyword('');
  };

  // 处理刷新
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([refreshTransactions(), refreshCurrentInventory(), refreshStatistics()]);
      message.success('数据刷新成功');
    } catch (error) {
      console.error('数据刷新失败:', error);
      setError('数据刷新失败');
      message.error('数据刷新失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理导出
  const handleExport = async (format: 'excel' | 'csv') => {
    try {
      setLoading(true);
      await exportInventoryData({
        format,
        reportType: 'transaction_history',
        ...searchParams,
      });
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理交易记录查看
  const handleViewTransaction = async (record: any) => {
    try {
      setLoading(true);
      const transactionDetail = await fetchTransactionDetail(record.id);
      setSelectedTransaction(transactionDetail);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('获取交易详情失败:', error);
      message.error('获取交易详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 交易记录表格列定义
  const transactionColumns: ColumnsType<any> = [
    {
      title: '交易时间',
      dataIndex: 'transactionTime',
      key: 'transactionTime',
      width: 180,
      sorter: true,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '商品编码',
      dataIndex: ['sku', 'skuCode'],
      key: 'skuCode',
      width: 120,
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.sku?.name}
          </Text>
        </Space>
      ),
    },
    {
      title: '门店',
      dataIndex: ['store', 'name'],
      key: 'store',
      width: 120,
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.store?.code}
          </Text>
        </Space>
      ),
    },
    {
      title: '交易类型',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 100,
      render: (type) => {
        const typeConfig = {
          [TransactionType.PURCHASE_IN]: { text: '采购入库', color: 'green' },
          [TransactionType.SALE_OUT]: { text: '销售出库', color: 'red' },
          [TransactionType.TRANSFER_IN]: { text: '调拨入库', color: 'blue' },
          [TransactionType.TRANSFER_OUT]: { text: '调拨出库', color: 'purple' },
          [TransactionType.ADJUSTMENT_IN]: { text: '盘盈入库', color: 'green' },
          [TransactionType.ADJUSTMENT_OUT]: { text: '盘亏出库', color: 'red' },
          [TransactionType.RETURN_IN]: { text: '退货入库', color: 'orange' },
          [TransactionType.RETURN_OUT]: { text: '退货出库', color: 'volcano' },
          [TransactionType.DAMAGE_OUT]: { text: '损耗出库', color: 'red' },
          [TransactionType.PRODUCTION_IN]: { text: '生产入库', color: 'cyan' },
          [TransactionType.EXPIRED_OUT]: { text: '过期出库', color: 'magenta' },
        };

        const config = typeConfig[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '数量变化',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (quantity, record) => {
        const isInbound = [
          TransactionType.PURCHASE_IN,
          TransactionType.TRANSFER_IN,
          TransactionType.ADJUSTMENT_IN,
          TransactionType.RETURN_IN,
          TransactionType.PRODUCTION_IN,
        ].includes(record.transactionType);

        return (
          <Text style={{ color: isInbound ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
            {isInbound ? '+' : '-'}
            {quantity}
          </Text>
        );
      },
    },
    {
      title: '库存前后',
      key: 'stockChange',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text type="secondary">前: {record.stockBefore}</Text>
          <Text strong>后: {record.stockAfter}</Text>
        </Space>
      ),
    },
    {
      title: '来源',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 100,
      render: (type) => {
        const sourceConfig = {
          [SourceType.PURCHASE]: { text: '采购', color: 'green' },
          [SourceType.SALE]: { text: '销售', color: 'red' },
          [SourceType.TRANSFER]: { text: '调拨', color: 'blue' },
          [SourceType.ADJUSTMENT]: { text: '盘点', color: 'orange' },
          [SourceType.RETURN]: { text: '退货', color: 'volcano' },
          [SourceType.DAMAGE]: { text: '损耗', color: 'red' },
          [SourceType.PRODUCTION]: { text: '生产', color: 'cyan' },
          [SourceType.EXPIRY]: { text: '过期', color: 'magenta' },
        };

        const config = sourceConfig[type] || { text: type, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作人',
      dataIndex: ['operator', 'name'],
      key: 'operator',
      width: 100,
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 100,
      render: (text) => text || '-',
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
          onClick={() => handleViewTransaction(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  // 概览统计卡片
  const overviewCards = [
    {
      title: '总库存价值',
      value: mockData.totalInventoryValue,
      prefix: '¥',
      suffix: '',
      precision: 2,
      color: '#1890ff',
    },
    {
      title: '总可用数量',
      value: mockData.totalAvailableQuantity,
      suffix: '件',
      precision: 0,
      color: '#52c41a',
    },
    {
      title: '低库存商品',
      value: mockData.lowStockItemsCount,
      suffix: '个',
      precision: 0,
      color: '#faad14',
    },
    {
      title: '缺货商品',
      value: mockData.outOfStockItemsCount,
      suffix: '个',
      precision: 0,
      color: '#ff4d4f',
    },
    {
      title: '今日交易',
      value: mockData.todayTransactionsCount,
      suffix: '笔',
      precision: 0,
      color: '#722ed1',
    },
    {
      title: '活跃转移',
      value: mockData.activeTransfersCount,
      suffix: '单',
      precision: 0,
      color: '#13c2c2',
    },
  ];

  return (
    <div className="inventory-trace-container">
      {/* 页面标题 */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              库存追溯查询
            </Title>
            <Text type="secondary">实时监控商品库存变动，追溯交易流水历史</Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} loading={loading} onClick={handleRefresh}>
                刷新数据
              </Button>
              <Button
                icon={<ExportOutlined />}
                loading={isLoading}
                onClick={() => handleExport('excel')}
              >
                导出Excel
              </Button>
              <Button
                icon={<ExportOutlined />}
                loading={isLoading}
                onClick={() => handleExport('csv')}
              >
                导出CSV
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 警报信息 */}
      {mockData.highPriorityAlerts.length > 0 && (
        <Alert
          message="库存警报"
          description={`发现 ${mockData.highPriorityAlerts.length} 个高优先级库存警报，请及时处理`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
          action={
            <Button size="small" onClick={() => setActiveTab('alerts')}>
              查看详情
            </Button>
          }
        />
      )}

      {/* 搜索面板 */}
      <Card title="搜索条件" style={{ marginBottom: '24px' }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="skuCode" label="商品编码">
            <Input placeholder="请输入商品编码" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="storeCode" label="门店编码">
            <Input placeholder="请输入门店编码" style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="transactionType" label="交易类型">
            <Select placeholder="请选择交易类型" style={{ width: 150 }} allowClear>
              <Select.Option value={TransactionType.PURCHASE_IN}>采购入库</Select.Option>
              <Select.Option value={TransactionType.SALE_OUT}>销售出库</Select.Option>
              <Select.Option value={TransactionType.TRANSFER_IN}>调拨入库</Select.Option>
              <Select.Option value={TransactionType.TRANSFER_OUT}>调拨出库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="日期范围">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={isLoading}
              >
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 内容区域 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 概览页面 */}
        <TabPane tab="数据概览" key="overview">
          <Row gutter={[16, 16]}>
            {/* 统计卡片 */}
            {overviewCards.map((card, index) => (
              <Col xs={24} sm={12} md={8} lg={4} key={index}>
                <Card>
                  <Statistic
                    title={card.title}
                    value={card.value}
                    precision={card.precision}
                    prefix={card.prefix}
                    suffix={card.suffix}
                    valueStyle={{ color: card.color }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          {/* 图表区域 */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col span={12}>
              <InventoryTrendsChart data={trendsData} loading={trendsLoading} title="库存趋势" />
            </Col>
            <Col span={12}>
              <InventoryStatisticsCard
                data={statisticsData}
                loading={statisticsLoading}
                title="库存统计"
              />
            </Col>
          </Row>

          {/* 补货建议 */}
          <Row style={{ marginTop: '24px' }}>
            <Col span={24}>
              <ReplenishmentSuggestions data={replenishmentData} loading={replenishmentLoading} />
            </Col>
          </Row>
        </TabPane>

        {/* 实时库存页面 */}
        <TabPane tab="实时库存" key="inventory">
          <RealTimeInventoryCard
            data={currentInventoryData}
            loading={currentInventoryLoading}
            onRefresh={refetchCurrentInventory}
          />
        </TabPane>

        {/* 交易历史页面 */}
        <TabPane
          tab={
            <Badge count={transactions.length} offset={[10, 0]}>
              交易历史
            </Badge>
          }
          key="transactions"
        >
          <Table
            columns={transactionColumns}
            dataSource={transactions}
            loading={currentInventoryQuery.isLoading || transactionsQuery.isLoading}
            rowKey="id"
            pagination={{
              current: inventoryFilters.page || 1,
              pageSize: inventoryFilters.pageSize || 20,
              total: transactionsQuery.data?.pagination.total || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              onChange: (page, pageSize) => {
                setInventoryFilters({ page, pageSize });
                setSearchParams((prev) => ({ ...prev, page, pageSize }));
              },
            }}
            scroll={{ x: 1200 }}
            size="small"
          />
        </TabPane>

        {/* 警报页面 */}
        <TabPane
          tab={
            <Badge count={mockData.highPriorityAlerts.length} offset={[10, 0]}>
              库存警报
            </Badge>
          }
          key="alerts"
        >
          <Card title="高优先级警报">
            {mockData.highPriorityAlerts.length > 0 ? (
              <Timeline>
                {mockData.highPriorityAlerts.map((alert, index) => (
                  <Timeline.Item
                    key={index}
                    color={alert.alertType === 'low_stock' ? 'orange' : 'red'}
                    dot={<ExclamationCircleOutlined />}
                  >
                    <Space direction="vertical" size="small">
                      <Text strong>
                        {alert.alertType === 'low_stock' ? '低库存警报' : '缺货警报'}
                      </Text>
                      <Text>SKU: {alert.skuId}</Text>
                      <Text type="secondary">
                        阈值: {alert.thresholdValue} {alert.thresholdUnit}
                      </Text>
                    </Space>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty description="暂无库存警报" />
            )}
          </Card>
        </TabPane>
      </Tabs>

      {/* 交易详情模态框 */}
      <Modal
        title="交易详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedTransaction(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedTransaction && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Title level={5}>基本信息</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Text>交易ID：</Text>
                  <Text code>{selectedTransaction.id}</Text>
                </Col>
                <Col span={8}>
                  <Text>交易时间：</Text>
                  <Text>
                    {dayjs(selectedTransaction.transactionTime).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </Col>
                <Col span={8}>
                  <Text>交易类型：</Text>
                  <Tag color="blue">{selectedTransaction.transactionType}</Tag>
                </Col>
              </Row>
            </div>
            <div>
              <Title level={5}>商品信息</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text>商品编码：</Text>
                  <Text strong>{selectedTransaction.skuCode}</Text>
                </Col>
                <Col span={12}>
                  <Text>商品名称：</Text>
                  <Text strong>{selectedTransaction.skuName}</Text>
                </Col>
              </Row>
            </div>
            <div>
              <Title level={5}>数量变化</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="交易数量"
                    value={selectedTransaction.quantity}
                    suffix="件"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic title="库存前" value={selectedTransaction.stockBefore} suffix="件" />
                </Col>
                <Col span={8}>
                  <Statistic title="库存后" value={selectedTransaction.stockAfter} suffix="件" />
                </Col>
              </Row>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default InventoryTrace;
