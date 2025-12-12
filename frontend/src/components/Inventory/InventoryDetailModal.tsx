/**
 * 库存详情弹窗组件
 * 提供库存项目的详细信息展示和快速操作功能
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Tag,
  Button,
  Divider,
  Tabs,
  Table,
  Alert,
  Timeline,
  Progress,
} from 'antd';
import {
  InfoCircleOutlined,
  PackageOutlined,
  DollarOutlined,
  HistoryOutlined,
  SettingOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EyeOutlined,
  EditOutlined,
  SwapOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import type { InventoryLedger, InventoryMovement } from '@/types/inventory';
import { getStockStatusConfig, formatCurrency, formatDate, formatNumber } from '@/utils/inventoryHelpers';
import { useResponsive } from '@/hooks/useResponsive';
import { usePermissions } from '@/hooks/usePermissions';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface InventoryDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  inventoryItem?: InventoryLedger | null;
  onAdjust?: (item: InventoryLedger) => void;
  onTransfer?: (item: InventoryLedger) => void;
  onViewMovements?: (item: InventoryLedger) => void;
  onPrint?: (item: InventoryLedger) => void;
}

// 模拟最近的流水数据
const generateMockMovements = (sku: string, locationId: string): InventoryMovement[] => {
  const movements: InventoryMovement[] = [];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const types = ['in', 'out', 'adjust_positive', 'adjust_negative'];
    const type = types[Math.floor(Math.random() * types.length)];

    movements.push({
      id: `MOV${Date.now()}_${i}`,
      transactionId: `TXN${Date.now()}_${i}`,
      sku,
      productName: `商品${sku}`,
      locationId,
      locationName: '东区仓库',
      movementType: type as any,
      movementSubtype: type,
      quantity: Math.floor(Math.random() * 100) - 50,
      balanceBefore: 100 + Math.floor(Math.random() * 200),
      balanceAfter: 100 + Math.floor(Math.random() * 200),
      costPrice: Math.random() * 100,
      totalValue: Math.random() * 10000,
      referenceType: 'order',
      referenceId: `ORD${Date.now()}_${i}`,
      referenceNo: `ORD${String(Date.now()).slice(-8)}${i}`,
      operatorId: `USER${i}`,
      operatorName: `操作员${i}`,
      operationTime: date.toISOString(),
      reason: `业务操作${i}`,
      remark: `备注信息${i}`,
      sourceSystem: 'Inventory Management System',
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      isReversed: false,
    });
  }

  return movements;
};

const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({
  visible,
  onCancel,
  inventoryItem,
  onAdjust,
  onTransfer,
  onViewMovements,
  onPrint,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { canRead, canAdjust, canWrite, canTransfer, canExport } = usePermissions();
  const [activeTab, setActiveTab] = useState('basic');

  // 生成模拟流水数据
  const movements = useMemo(() => {
    if (!inventoryItem) return [];
    return generateMockMovements(inventoryItem.sku, inventoryItem.locationId);
  }, [inventoryItem]);

  // 库存使用率计算
  const stockUtilization = useMemo(() => {
    if (!inventoryItem) return 0;
    const { physicalQuantity, safetyStock } = inventoryItem;
    if (physicalQuantity <= 0) return 0;
    return Math.min((physicalQuantity / safetyStock) * 100, 100);
  }, [inventoryItem]);

  // 库存周转天数（模拟数据）
  const turnoverDays = useMemo(() => {
    if (!inventoryItem) return 0;
    return Math.floor(Math.random() * 90) + 30; // 30-120天
  }, [inventoryItem]);

  // 渲染基本信息
  const renderBasicInfo = () => {
    if (!inventoryItem) return null;

    const stockConfig = getStockStatusConfig(inventoryItem.stockStatus);

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" title="基本信息">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="SKU">
                <Text code>{inventoryItem.sku}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="商品名称">
                <Text strong>{inventoryItem.productName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="商品分类">
                {inventoryItem.category}
              </Descriptions.Item>
              <Descriptions.Item label="品牌">
                {inventoryItem.brand}
              </Descriptions.Item>
              <Descriptions.Item label="规格">
                {inventoryItem.specification}
              </Descriptions.Item>
              <Descriptions.Item label="单位">
                {inventoryItem.unit}
              </Descriptions.Item>
              <Descriptions.Item label="仓库">
                {inventoryItem.locationName}
              </Descriptions.Item>
              <Descriptions.Item label="是否可售">
                <Tag color={inventoryItem.isSellable ? 'green' : 'red'}>
                  {inventoryItem.isSellable ? '可售' : '不可售'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card size="small" title="库存状态">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">库存状态</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={stockConfig.color} icon={stockConfig.icon}>
                    {stockConfig.text}
                  </Tag>
                </div>
              </div>

              <div>
                <Text type="secondary">安全库存使用率</Text>
                <Progress
                  percent={stockUtilization}
                  status={stockUtilization > 80 ? 'exception' : 'normal'}
                  size="small"
                  format={(percent) => `${percent?.toFixed(1)}%`}
                />
              </div>

              <div>
                <Text type="secondary">预计周转天数</Text>
                <div style={{ marginTop: 4 }}>
                  <Text strong>{turnoverDays} 天</Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card size="small" title="价值信息">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Statistic
                title="成本价"
                value={inventoryItem.costPrice || 0}
                precision={2}
                formatter={formatCurrency}
                valueStyle={{ fontSize: '16px' }}
              />
              <Statistic
                title="销售价"
                value={inventoryItem.sellingPrice || 0}
                precision={2}
                formatter={formatCurrency}
                valueStyle={{ fontSize: '16px' }}
              />
              <Statistic
                title="库存总值"
                value={inventoryItem.totalValue || 0}
                precision={2}
                formatter={formatCurrency}
                valueStyle={{ fontSize: '18px', color: '#52c41a' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染库存数量详情
  const renderStockDetails = () => {
    if (!inventoryItem) return null;

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="现存库存"
              value={inventoryItem.physicalQuantity}
              suffix={inventoryItem.unit}
              valueStyle={{
                color: inventoryItem.physicalQuantity <= 0 ? '#f5222d' : '#1890ff',
                fontSize: '20px'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="可用库存"
              value={inventoryItem.availableQuantity}
              suffix={inventoryItem.unit}
              valueStyle={{
                color: inventoryItem.availableQuantity <= inventoryItem.safetyStock ? '#fa8c16' : '#52c41a',
                fontSize: '20px'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="预占库存"
              value={inventoryItem.reservedQuantity}
              suffix={inventoryItem.unit}
              valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="在途库存"
              value={inventoryItem.inTransitQuantity}
              suffix={inventoryItem.unit}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="安全库存"
              value={inventoryItem.safetyStock}
              suffix={inventoryItem.unit}
              valueStyle={{ color: '#13c2c2', fontSize: '20px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <div>
              <Text type="secondary">库存水位</Text>
              <div style={{ marginTop: 8 }}>
                <Progress
                  percent={Math.min((inventoryItem.physicalQuantity / (inventoryItem.safetyStock * 2)) * 100, 100)}
                  format={() => `${inventoryItem.physicalQuantity} / ${inventoryItem.safetyStock * 2}`}
                  strokeColor={
                    inventoryItem.physicalQuantity <= inventoryItem.safetyStock
                      ? '#f5222d'
                      : inventoryItem.physicalQuantity <= inventoryItem.safetyStock * 1.5
                      ? '#fa8c16'
                      : '#52c41a'
                  }
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  // 渲染最近流水
  const renderRecentMovements = () => {
    const columns = [
      {
        title: '时间',
        dataIndex: 'operationTime',
        key: 'operationTime',
        width: 120,
        render: (text: string) => formatDate(text, 'MM-DD HH:mm'),
      },
      {
        title: '类型',
        dataIndex: 'movementType',
        key: 'movementType',
        width: 100,
        render: (type: string) => {
          const typeConfig: Record<string, { text: string; color: string }> = {
            in: { text: '入库', color: 'green' },
            out: { text: '出库', color: 'red' },
            adjust_positive: { text: '盘盈', color: 'blue' },
            adjust_negative: { text: '盘亏', color: 'orange' },
          };
          const config = typeConfig[type] || { text: type, color: 'default' };
          return <Tag color={config.color}>{config.text}</Tag>;
        },
      },
      {
        title: '数量',
        dataIndex: 'quantity',
        key: 'quantity',
        width: 80,
        align: 'right',
        render: (quantity: number) => (
          <Text style={{ color: quantity >= 0 ? '#52c41a' : '#f5222d' }}>
            {quantity >= 0 ? '+' : ''}{formatNumber(quantity)}
          </Text>
        ),
      },
      {
        title: '操作人',
        dataIndex: 'operatorName',
        key: 'operatorName',
        width: 80,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        ellipsis: true,
      },
    ];

    if (isMobile) {
      columns.length = 3; // 移动端只显示关键列
    }

    return (
      <Table
        columns={columns}
        dataSource={movements}
        rowKey="id"
        size="small"
        pagination={{
          pageSize: isMobile ? 5 : 10,
          showSizeChanger: !isMobile,
          showQuickJumper: !isMobile,
        }}
        scroll={{ x: 'max-content' }}
      />
    );
  };

  // 渲染操作时间轴
  const renderOperationTimeline = () => {
    const timelineData = [
      {
        time: inventoryItem?.createdTime || '',
        title: '库存创建',
        description: '初始库存记录创建',
        color: 'green',
        icon: <CheckCircleOutlined />,
      },
      {
        time: inventoryItem?.lastUpdated || '',
        title: '最后更新',
        description: '库存数据最近更新',
        color: 'blue',
        icon: <SettingOutlined />,
      },
      ...(movements.slice(0, 5).map((movement, index) => ({
        time: movement.operationTime,
        title: movement.movementSubtype,
        description: `${movement.quantity > 0 ? '增加' : '减少'} ${Math.abs(movement.quantity)} ${inventoryItem?.unit}`,
        color: movement.quantity >= 0 ? 'green' : 'red',
        icon: movement.quantity >= 0 ? <PackageOutlined /> : <SwapOutlined />,
      }))),
    ];

    return (
      <Timeline
        mode={isMobile ? 'left' : 'alternate'}
        items={timelineData.map((item, index) => ({
          key: index,
          color: item.color,
          dot: item.icon,
          children: (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {item.title}
              </div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: 4 }}>
                {formatDate(item.time, 'YYYY-MM-DD HH:mm')}
              </div>
              <div style={{ fontSize: '14px' }}>
                {item.description}
              </div>
            </div>
          ),
        }))}
      />
    );
  };

  // 快速操作按钮
  const renderQuickActions = () => {
    if (!inventoryItem) return null;

    return (
      <Space wrap>
        {onViewMovements && (
          <Button
            type="default"
            icon={<HistoryOutlined />}
            onClick={() => onViewMovements(inventoryItem)}
          >
            查看流水
          </Button>
        )}
        {onAdjust && canAdjust && (
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => onAdjust(inventoryItem)}
          >
            库存调整
          </Button>
        )}
        {onTransfer && canTransfer && (
          <Button
            icon={<SwapOutlined />}
            onClick={() => onTransfer(inventoryItem)}
          >
            库存调拨
          </Button>
        )}
        {onPrint && canExport && (
          <Button
            icon={<PrinterOutlined />}
            onClick={() => onPrint(inventoryItem)}
          >
            打印详情
          </Button>
        )}
      </Space>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined />
          <span>库存详情</span>
          {inventoryItem && (
            <Text type="secondary">- {inventoryItem.productName}</Text>
          )}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={isMobile ? '95%' : isTablet ? '90%' : 1200}
      style={{ top: 20 }}
      footer={renderQuickActions()}
      destroyOnClose
    >
      {inventoryItem && (
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {renderBasicInfo()}
              <Divider />
              {renderStockDetails()}
            </Space>
          </TabPane>

          <TabPane tab="库存流水" key="movements">
            {renderRecentMovements()}
          </TabPane>

          <TabPane tab="操作记录" key="timeline">
            {renderOperationTimeline()}
          </TabPane>

          <TabPane tab="库存分析" key="analysis">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="库存健康度" size="small">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Alert
                      message={
                        <Space>
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <span>库存水平正常</span>
                        </Space>
                      }
                      type="success"
                      showIcon={false}
                    />
                    <div>
                      <Text>周转天数: {turnoverDays} 天</Text>
                    </div>
                    <div>
                      <Text>库存周转率: {(365 / turnoverDays).toFixed(1)} 次/年</Text>
                    </div>
                  </Space>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="安全库存状态" size="small">
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                      <Text>安全库存倍数: {(inventoryItem.physicalQuantity / inventoryItem.safetyStock).toFixed(1)}x</Text>
                    </div>
                    <Progress
                      percent={stockUtilization}
                      status={stockUtilization > 80 ? 'warning' : 'success'}
                      format={() => `安全库存使用率 ${stockUtilization.toFixed(1)}%`}
                    />
                    <div>
                      <Text type="secondary">
                        {stockUtilization <= 50 ? '库存充足' :
                         stockUtilization <= 80 ? '库存正常' :
                         '库存紧张，建议补货'}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      )}
    </Modal>
  );
};

export default InventoryDetailModal;