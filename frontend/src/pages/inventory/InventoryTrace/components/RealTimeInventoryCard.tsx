import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Progress,
  Space,
  Button,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Tooltip,
  Badge,
  Alert,
  Empty,
  message
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  StockOutlined,
  ShopOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { debounce } from 'lodash-es';
import dayjs from 'dayjs';

import { CurrentInventory, InventoryStatus } from '@/types/inventory';

interface RealTimeInventoryCardProps {
  data?: {
    data: CurrentInventory[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  };
  loading?: boolean;
  onRefresh?: () => void;
}

// 模拟库存数据
const mockInventoryData: CurrentInventory[] = [
  {
    id: '1',
    skuId: 'SKU001',
    sku: {
      id: 'SKU001',
      name: '可口可乐330ml',
      skuId: 'SKU001',
      skuCode: 'SKU001',
      category: '饮料',
      unit: '瓶',
      isActive: true
    },
    storeId: 'STORE001',
    store: {
      id: 'STORE001',
      name: '万达影城CBD店',
      code: 'WM001',
      address: '北京市朝阳区CBD',
      isActive: true
    },
    availableQty: 150,
    onHandQty: 180,
    reservedQty: 30,
    inTransitQty: 20,
    damagedQty: 5,
    expiredQty: 0,
    reorderPoint: 50,
    maxStock: 300,
    minStock: 30,
    safetyStock: 20,
    totalValue: 600,
    averageCost: 4,
    lastUpdated: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: '2',
    skuId: 'SKU002',
    sku: {
      id: 'SKU002',
      name: '爆米花中份',
      skuId: 'SKU002',
      skuCode: 'SKU002',
      category: '零食',
      unit: '份',
      isActive: true
    },
    storeId: 'STORE001',
    store: {
      id: 'STORE001',
      name: '万达影城CBD店',
      code: 'WM001',
      address: '北京市朝阳区CBD',
      isActive: true
    },
    availableQty: 25,
    onHandQty: 30,
    reservedQty: 5,
    inTransitQty: 10,
    damagedQty: 2,
    expiredQty: 0,
    reorderPoint: 40,
    maxStock: 200,
    minStock: 20,
    safetyStock: 15,
    totalValue: 500,
    averageCost: 20,
    lastUpdated: dayjs().subtract(30, 'minute').format('YYYY-MM-DD HH:mm:ss')
  },
  {
    id: '3',
    skuId: 'SKU003',
    sku: {
      id: 'SKU003',
      name: '3D眼镜',
      skuId: 'SKU003',
      skuCode: 'SKU003',
      category: '设备',
      unit: '副',
      isActive: true
    },
    storeId: 'STORE001',
    store: {
      id: 'STORE001',
      name: '万达影城CBD店',
      code: 'WM001',
      address: '北京市朝阳区CBD',
      isActive: true
    },
    availableQty: 80,
    onHandQty: 100,
    reservedQty: 20,
    inTransitQty: 0,
    damagedQty: 8,
    expiredQty: 0,
    reorderPoint: 30,
    maxStock: 150,
    minStock: 25,
    safetyStock: 20,
    totalValue: 1600,
    averageCost: 20,
    lastUpdated: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm:ss')
  }
];

const RealTimeInventoryCard: React.FC<RealTimeInventoryCardProps> = ({
  data,
  loading = false,
  onRefresh
}) => {
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // 获取库存数据
  const inventoryData = data?.data || mockInventoryData;

  // 过滤数据
  const filteredData = inventoryData.filter(item => {
    let match = true;

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      match = item.sku.name.toLowerCase().includes(searchLower) ||
               item.sku.skuCode.toLowerCase().includes(searchLower) ||
               item.store.name.toLowerCase().includes(searchLower);
    }

    if (selectedStore && item.storeId !== selectedStore) {
      match = false;
    }

    if (selectedCategory && item.sku.category !== selectedCategory) {
      match = false;
    }

    return match;
  });

  // 获取库存状态
  const getInventoryStatus = (item: CurrentInventory) => {
    if (item.availableQty === 0) {
      return { status: 'out_of_stock', color: 'red', text: '缺货', icon: <ExclamationCircleOutlined /> };
    }
    if (item.availableQty <= item.reorderPoint) {
      return { status: 'low_stock', color: 'orange', text: '低库存', icon: <WarningOutlined /> };
    }
    if (item.availableQty >= item.maxStock * 0.9) {
      return { status: 'overstock', color: 'blue', text: '库存充足', icon: <CheckCircleOutlined /> };
    }
    return { status: 'normal', color: 'green', text: '正常', icon: <CheckCircleOutlined /> };
  };

  // 计算库存健康度
  const getInventoryHealth = (item: CurrentInventory) => {
    const healthScore = Math.round((item.availableQty / item.maxStock) * 100);
    if (healthScore >= 80) return { score: healthScore, color: '#52c41a', status: '优秀' };
    if (healthScore >= 60) return { score: healthScore, color: '#faad14', status: '良好' };
    if (healthScore >= 30) return { score: healthScore, color: '#fa8c16', status: '一般' };
    return { score: healthScore, color: '#f5222d', status: '较差' };
  };

  // 表格列定义
  const columns: ColumnsType<CurrentInventory> = [
    {
      title: '商品信息',
      key: 'sku',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            <BarcodeOutlined />
            <div>
              <div style={{ fontWeight: 'bold' }}>{record.sku.name}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {record.sku.skuCode} | {record.sku.category}
              </div>
            </div>
          </Space>
        </Space>
      )
    },
    {
      title: '门店',
      key: 'store',
      width: 150,
      render: (_, record) => (
        <Space>
          <ShopOutlined />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.store.name}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.store.code}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: '库存状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const status = getInventoryStatus(record);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      }
    },
    {
      title: '可用库存',
      dataIndex: 'availableQty',
      key: 'availableQty',
      width: 100,
      align: 'right',
      render: (value, record) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ fontSize: '16px' }}>{value}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.sku.unit}
          </Text>
        </Space>
      )
    },
    {
      title: '库存明细',
      key: 'inventoryDetail',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ fontSize: '12px' }}>
          <div>实库存: {record.onHandQty}</div>
          <div>预留: {record.reservedQty}</div>
          <div>在途: {record.inTransitQty}</div>
          <div style={{ color: '#f5222d' }}>损坏: {record.damagedQty}</div>
        </Space>
      )
    },
    {
      title: '库存健康度',
      key: 'health',
      width: 120,
      render: (_, record) => {
        const health = getInventoryHealth(record);
        return (
          <Space direction="vertical" size="small" style={{ width: '100px' }}>
            <Progress
              percent={health.score}
              strokeColor={health.color}
              size="small"
              format={() => `${health.score}%`}
            />
            <Text style={{ fontSize: '12px', color: health.color }}>
              {health.status}
            </Text>
          </Space>
        );
      }
    },
    {
      title: '库存阈值',
      key: 'thresholds',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ fontSize: '12px' }}>
          <div>重购点: {record.reorderPoint}</div>
          <div>最小: {record.minStock}</div>
          <div>最大: {record.maxStock}</div>
          <div>安全: {record.safetyStock}</div>
        </Space>
      )
    },
    {
      title: '库存价值',
      key: 'value',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong style={{ color: '#1890ff' }}>
            ¥{record.totalValue?.toFixed(2) || '0.00'}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            均价: ¥{record.averageCost?.toFixed(2) || '0.00'}
          </Text>
        </Space>
      )
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      render: (text) => (
        <Tooltip title={text}>
          <Space>
            <ClockCircleOutlined />
            <Text style={{ fontSize: '12px' }}>
              {dayjs(text).fromNow()}
            </Text>
          </Space>
        </Tooltip>
      )
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
          onClick={() => {
            message.info(`查看 ${record.sku.name} 的库存详情`);
          }}
        >
          详情
        </Button>
      )
    }
  ];

  // 计算统计数据
  const statistics = {
    totalSKUs: new Set(filteredData.map(item => item.skuId)).size,
    totalStores: new Set(filteredData.map(item => item.storeId)).size,
    totalValue: filteredData.reduce((sum, item) => sum + (item.totalValue || 0), 0),
    totalAvailable: filteredData.reduce((sum, item) => sum + item.availableQty, 0),
    lowStockItems: filteredData.filter(item => item.availableQty <= item.reorderPoint).length,
    outOfStockItems: filteredData.filter(item => item.availableQty === 0).length
  };

  // 去重门店和分类选项
  const storeOptions = Array.from(new Set(inventoryData.map(item => ({
    value: item.storeId,
    label: item.store.name,
    code: item.store.code
  }))));

  const categoryOptions = Array.from(new Set(inventoryData.map(item => item.sku.category)));

  return (
    <Card
      title={
        <Space>
          <StockOutlined />
          实时库存监控
          <Badge count={statistics.totalSKUs} style={{ backgroundColor: '#52c41a' }} />
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={onRefresh}
          >
            刷新数据
          </Button>
        </Space>
      }
    >
      {/* 搜索和筛选 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="搜索商品名称、编码或门店"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="选择门店"
            value={selectedStore}
            onChange={setSelectedStore}
            allowClear
            style={{ width: '100%' }}
          >
            {storeOptions.map(store => (
              <Select.Option key={store.value} value={store.value}>
                {store.label} ({store.code})
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="选择分类"
            value={selectedCategory}
            onChange={setSelectedCategory}
            allowClear
            style={{ width: '100%' }}
          >
            {categoryOptions.map(category => (
              <Select.Option key={category} value={category}>
                {category}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="商品种类"
              value={statistics.totalSKUs}
              suffix="种"
              prefix={<BarcodeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="覆盖门店"
              value={statistics.totalStores}
              suffix="家"
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="总库存价值"
              value={statistics.totalValue}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="总可用库存"
              value={statistics.totalAvailable}
              suffix="件"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 警报信息 */}
      {(statistics.lowStockItems > 0 || statistics.outOfStockItems > 0) && (
        <Alert
          message="库存警报"
          description={
            <Space>
              {statistics.lowStockItems > 0 && (
                <Tag color="orange">低库存: {statistics.lowStockItems} 个</Tag>
              )}
              {statistics.outOfStockItems > 0 && (
                <Tag color="red">缺货: {statistics.outOfStockItems} 个</Tag>
              )}
            </Space>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* 库存表格 */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: setCurrentPage,
          onShowSizeChange: (_, size) => setPageSize(size)
        }}
        scroll={{ x: 1200 }}
        size="small"
      />

      {filteredData.length === 0 && !loading && (
        <Empty
          description="暂无库存数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

export default RealTimeInventoryCard;