import React from 'react';
import {
  Drawer,
  Descriptions,
  Card,
  Space,
  Tag,
  Button,
  Divider,
  Statistic,
  Row,
  Col,
  Empty,
} from 'antd';
import { ArrowRightOutlined, HistoryOutlined, WarningOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { CurrentInventory } from '@/types/inventory';
import {
  formatQuantity,
  formatDateTime,
  formatCurrency,
  calculateInventoryStatus,
} from '@/utils/inventoryHelpers';
import { useResponsive } from '@/hooks/useResponsive';

interface InventoryDetailsProps {
  open: boolean;
  inventory: CurrentInventory | null;
  onClose: () => void;
}

/**
 * 库存详情抽屉组件
 * 展示SKU在特定门店的完整库存信息
 */
export const InventoryDetails: React.FC<InventoryDetailsProps> = ({ open, inventory, onClose }) => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();

  if (!inventory) {
    return null;
  }

  const status = calculateInventoryStatus(inventory);

  const handleViewMovements = () => {
    // 跳转到流水页面，并带上SKU和门店参数
    navigate(`/inventory/movements?skuId=${inventory.skuId}&storeId=${inventory.storeId}`);
    onClose();
  };

  return (
    <Drawer
      title="库存详情"
      placement="right"
      width={isMobile ? '100%' : 720}
      open={open}
      onClose={onClose}
      extra={
        <Button type="primary" icon={<HistoryOutlined />} onClick={handleViewMovements}>
          查看流水
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 基本信息 */}
        <Card title="基本信息" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="SKU编码">{inventory.sku?.skuCode}</Descriptions.Item>
            <Descriptions.Item label="SKU名称">{inventory.sku?.name}</Descriptions.Item>
            <Descriptions.Item label="门店/仓库">
              {inventory.store?.name} ({inventory.store?.code})
            </Descriptions.Item>
            <Descriptions.Item label="规格">{inventory.sku?.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="单位">{inventory.sku?.unit || '件'}</Descriptions.Item>
            <Descriptions.Item label="类目">{inventory.sku?.category || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 库存数量统计 */}
        <Card title="库存数量" size="small">
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8}>
              <Statistic
                title="现存数量"
                value={inventory.onHandQty}
                suffix={inventory.sku?.unit || '件'}
                valueStyle={inventory.onHandQty <= 0 ? { color: '#ff4d4f' } : undefined}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title="可用数量"
                value={inventory.availableQty}
                suffix={inventory.sku?.unit || '件'}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title="预占数量"
                value={inventory.reservedQty}
                suffix={inventory.sku?.unit || '件'}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title="在途数量"
                value={inventory.inTransitQty}
                suffix={inventory.sku?.unit || '件'}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title="损坏数量"
                value={inventory.damagedQty || 0}
                suffix={inventory.sku?.unit || '件'}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title="过期数量"
                value={inventory.expiredQty || 0}
                suffix={inventory.sku?.unit || '件'}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Col>
          </Row>
        </Card>

        {/* 库存阈值 */}
        <Card title="库存阈值" size="small">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="安全库存">
              {formatQuantity(inventory.safetyStock, inventory.sku?.unit)}
            </Descriptions.Item>
            <Descriptions.Item label="最小库存">
              {formatQuantity(inventory.minStock, inventory.sku?.unit)}
            </Descriptions.Item>
            <Descriptions.Item label="最大库存">
              {formatQuantity(inventory.maxStock, inventory.sku?.unit)}
            </Descriptions.Item>
            <Descriptions.Item label="再订货点">
              {formatQuantity(inventory.reorderPoint, inventory.sku?.unit)}
            </Descriptions.Item>
            <Descriptions.Item label="库存状态">
              <Tag color={status.color} icon={status.status === 'low_stock' && <WarningOutlined />}>
                {status.label}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 成本信息 */}
        {(inventory.averageCost || inventory.totalValue) && (
          <Card title="成本信息" size="small">
            <Row gutter={[16, 16]}>
              {inventory.averageCost && (
                <Col xs={12}>
                  <Statistic
                    title="平均成本"
                    value={inventory.averageCost}
                    prefix="¥"
                    precision={2}
                  />
                </Col>
              )}
              {inventory.totalValue && (
                <Col xs={12}>
                  <Statistic
                    title="库存总值"
                    value={inventory.totalValue}
                    prefix="¥"
                    precision={2}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Col>
              )}
            </Row>
          </Card>
        )}

        {/* 最近变动信息 */}
        {inventory.lastTransactionTime && (
          <Card title="最近变动" size="small">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="最后变动时间">
                {formatDateTime(inventory.lastTransactionTime)}
              </Descriptions.Item>
              {inventory.lastTransactionType && (
                <Descriptions.Item label="变动类型">
                  {inventory.lastTransactionType}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* 操作按钮 */}
        <Card size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block type="primary" icon={<HistoryOutlined />} onClick={handleViewMovements}>
              查看全部流水记录
            </Button>
            <Button
              block
              icon={<ArrowRightOutlined />}
              onClick={() => {
                // 跳转到商品详情（如果有）
                window.open(`/products/${inventory.skuId}`, '_blank');
              }}
            >
              查看商品详情
            </Button>
          </Space>
        </Card>

        {/* 更新时间 */}
        <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12 }}>
          最后更新: {formatDateTime(inventory.lastUpdated)}
        </div>
      </Space>
    </Drawer>
  );
};

export default InventoryDetails;
