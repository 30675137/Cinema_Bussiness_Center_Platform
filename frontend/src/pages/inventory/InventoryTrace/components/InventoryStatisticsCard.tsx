import React from 'react';
import {
  Card,
  Statistic,
  Row,
  Col,
  Progress,
  Space,
  Typography,
  Tag,
  Tooltip
} from 'antd';
import {
  StockOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import type { InventoryStatistics } from '@/types/inventory';

const { Title, Text } = Typography;

interface InventoryStatisticsCardProps {
  data?: InventoryStatistics;
  loading?: boolean;
  title?: string;
}

// 模拟统计数据
const mockStatisticsData: InventoryStatistics = {
  totalSKUs: 156,
  totalStores: 12,
  totalValue: 1250000,
  totalTransactions: 2847,
  totalAvailable: 12450,
  totalReserved: 890,
  totalInTransit: 340,
  totalDamaged: 25,
  totalExpired: 8,
  lowStockItems: 23,
  outOfStockItems: 5,
  overstockItems: 18,
  expiredValue: 1560,
  damagedValue: 2340,
  transactionsByType: {
    purchase_in: 145,
    sale_out: 1892,
    transfer_in: 67,
    transfer_out: 54,
    adjustment_in: 23,
    adjustment_out: 18,
    return_in: 45,
    return_out: 32,
    damage_out: 12,
    production_in: 8,
    expired_out: 4
  },
  transactionsByStore: {
    'STORE001': 342,
    'STORE002': 289,
    'STORE003': 267,
    'STORE004': 198
  },
  topMovingSKUs: [
    { skuId: 'SKU001', skuCode: 'SKU001', skuName: '可口可乐330ml', transactionCount: 156, totalQuantity: 2340 },
    { skuId: 'SKU002', skuCode: 'SKU002', skuName: '爆米花中份', transactionCount: 134, totalQuantity: 1890 },
    { skuId: 'SKU003', skuCode: 'SKU003', skuName: '3D眼镜', transactionCount: 89, totalQuantity: 670 }
  ],
  inventoryValueByStore: [
    { storeId: 'STORE001', storeName: '万达影城CBD店', totalValue: 342000, totalSKUs: 89 },
    { storeId: 'STORE002', storeName: '万达影城三里屯店', totalValue: 289000, totalSKUs: 76 },
    { storeId: 'STORE003', storeName: '万达影城五道口店', totalValue: 267000, totalSKUs: 72 }
  ]
};

const InventoryStatisticsCard: React.FC<InventoryStatisticsCardProps> = ({
  data,
  loading = false,
  title = '库存统计'
}) => {
  const statistics = data || mockStatisticsData;

  // 计算库存健康度
  const healthScore = Math.round(((statistics.totalAvailable - statistics.totalReserved) / statistics.totalAvailable) * 100);
  const stockTurnoverRate = statistics.totalTransactions > 0 ?
    Math.round((statistics.totalAvailable / statistics.totalTransactions) * 100) : 0;

  // 计算库存分布比例
  const inventoryDistribution = [
    { name: '可用库存', value: statistics.totalAvailable, color: '#52c41a' },
    { name: '预留库存', value: statistics.totalReserved, color: '#faad14' },
    { name: '在途库存', value: statistics.totalInTransit, color: '#1890ff' },
    { name: '损坏库存', value: statistics.totalDamaged, color: '#ff4d4f' },
    { name: '过期库存', value: statistics.totalExpired, color: '#f5222d' }
  ];

  // 计算警报比例
  const alertPercentage = statistics.totalSKUs > 0 ?
    Math.round(((statistics.lowStockItems + statistics.outOfStockItems) / statistics.totalSKUs) * 100) : 0;

  return (
    <Card
      title={
        <Space>
          <BarChartOutlined />
          {title}
        </Space>
      }
      loading={loading}
    >
      <Row gutter={[16, 16]}>
        {/* 基础统计 */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small" hoverable>
            <Statistic
              title="商品种类"
              value={statistics.totalSKUs}
              suffix="种"
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" hoverable>
            <Statistic
              title="覆盖门店"
              value={statistics.totalStores}
              suffix="家"
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" hoverable>
            <Statistic
              title="总库存价值"
              value={statistics.totalValue}
              prefix="¥"
              precision={0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" hoverable>
            <Statistic
              title="总交易次数"
              value={statistics.totalTransactions}
              suffix="笔"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" hoverable>
            <Statistic
              title="库存周转率"
              value={stockTurnoverRate}
              suffix="%"
              prefix={<StockOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" hoverable>
            <Statistic
              title="库存健康度"
              value={healthScore}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: healthScore >= 80 ? '#52c41a' : healthScore >= 60 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        {/* 库存分布 */}
        <Col xs={24} md={12}>
          <Card size="small" title="库存分布">
            <Space direction="vertical" style={{ width: '100%' }}>
              {inventoryDistribution.map((item, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text style={{ fontSize: '12px' }}>{item.name}</Text>
                    <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.value}</Text>
                  </div>
                  <Progress
                    percent={Math.round((item.value / statistics.totalAvailable) * 100)}
                    strokeColor={item.color}
                    size="small"
                    showInfo={false}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* 警报统计 */}
        <Col xs={24} md={12}>
          <Card size="small" title="库存警报">
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text type="secondary">缺货商品</Text>
                  <Statistic
                    value={statistics.outOfStockItems}
                    suffix="个"
                    valueStyle={{ color: '#f5222d', fontSize: '18px' }}
                  />
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text type="secondary">低库存商品</Text>
                  <Statistic
                    value={statistics.lowStockItems}
                    suffix="个"
                    valueStyle={{ color: '#faad14', fontSize: '18px' }}
                  />
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text type="secondary">库存过剩</Text>
                  <Statistic
                    value={statistics.overstockItems}
                    suffix="个"
                    valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  />
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text type="secondary">警报比例</Text>
                  <Progress
                    type="circle"
                    percent={alertPercentage}
                    size={60}
                    strokeColor={alertPercentage >= 20 ? '#f5222d' : alertPercentage >= 10 ? '#faad14' : '#52c41a'}
                  />
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        {/* 热门商品 */}
        <Col xs={24} md={12}>
          <Card size="small" title="热门商品 (按交易次数)">
            <Space direction="vertical" style={{ width: '100%' }}>
              {statistics.topMovingSKUs.map((sku, index) => (
                <div key={sku.skuId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Tag color={index === 0 ? 'gold' : index === 1 ? 'blue' : 'green'}>
                      {index + 1}
                    </Tag>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{sku.skuName}</div>
                      <div style={{ color: '#999', fontSize: '11px' }}>{sku.skuCode}</div>
                    </div>
                  </Space>
                  <Space direction="vertical" size="small" align="end">
                    <Text style={{ fontSize: '12px' }}>{sku.transactionCount}次</Text>
                    <Text style={{ fontSize: '11px', color: '#999' }}>{sku.totalQuantity}件</Text>
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* 门店库存价值 */}
        <Col xs={24} md={12}>
          <Card size="small" title="门店库存价值TOP3">
            <Space direction="vertical" style={{ width: '100%' }}>
              {statistics.inventoryValueByStore.map((store, index) => (
                <div key={store.storeId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Tag color={index === 0 ? 'gold' : index === 1 ? 'blue' : 'green'}>
                      {index + 1}
                    </Tag>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{store.storeName}</div>
                      <div style={{ color: '#999', fontSize: '11px' }}>{store.totalSKUs}种商品</div>
                    </div>
                  </Space>
                  <Space direction="vertical" size="small" align="end">
                    <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#cf1322' }}>
                      ¥{(store.totalValue / 1000).toFixed(1)}K
                    </Text>
                    <Text style={{ fontSize: '11px', color: '#999' }}>
                      {Math.round((store.totalValue / statistics.totalValue) * 100)}%
                    </Text>
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 损失价值 */}
      {(statistics.expiredValue > 0 || statistics.damagedValue > 0) && (
        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col span={24}>
            <Card size="small" title="损失价值统计">
              <Row gutter={16}>
                <Col span={12}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <WarningOutlined style={{ color: '#f5222d' }} />
                      <Text>过期商品损失</Text>
                    </Space>
                    <Statistic
                      value={statistics.expiredValue}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#f5222d', fontSize: '20px' }}
                    />
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Space>
                      <WarningOutlined style={{ color: '#ff4d4f' }} />
                      <Text>损坏商品损失</Text>
                    </Space>
                    <Statistic
                      value={statistics.damagedValue}
                      prefix="¥"
                      precision={2}
                      valueStyle={{ color: '#ff4d4f', fontSize: '20px' }}
                    />
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default InventoryStatisticsCard;