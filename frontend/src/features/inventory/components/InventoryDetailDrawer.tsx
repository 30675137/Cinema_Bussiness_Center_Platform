import React from 'react';
import { Drawer, Descriptions, Tag, Alert, Spin, Divider, Space } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useInventoryDetail } from '../hooks/useInventory';
import { InventoryStatusTag } from './InventoryStatusTag';
import type { StoreInventoryDetail } from '../types';

/**
 * InventoryDetailDrawer 组件属性
 */
export interface InventoryDetailDrawerProps {
  /** 库存记录ID */
  inventoryId: string | undefined;
  /** 是否可见 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * 库存详情抽屉组件
 * 显示单个SKU的完整库存信息，包含低库存警告。
 * 
 * @example
 * ```tsx
 * <InventoryDetailDrawer
 *   inventoryId={selectedId}
 *   open={drawerOpen}
 *   onClose={() => setDrawerOpen(false)}
 * />
 * ```
 * 
 * @since P003-inventory-query US4
 */
export const InventoryDetailDrawer: React.FC<InventoryDetailDrawerProps> = ({
  inventoryId,
  open,
  onClose,
}) => {
  // 获取库存详情
  const { data: detailData, isLoading, isError, error } = useInventoryDetail(inventoryId, open && !!inventoryId);
  
  const detail = detailData?.data as StoreInventoryDetail | undefined;

  // 判断是否低库存
  const isLowStock = detail && detail.availableQty < detail.safetyStock;

  return (
    <Drawer
      title="库存详情"
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      {/* 加载状态 */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" tip="加载中..." />
        </div>
      )}

      {/* 错误状态 */}
      {isError && (
        <Alert
          type="error"
          message="加载失败"
          description={error?.message || '无法加载库存详情'}
        />
      )}

      {/* 详情内容 */}
      {detail && (
        <>
          {/* 低库存警告 */}
          {isLowStock && (
            <Alert
              type="warning"
              icon={<WarningOutlined />}
              message="低库存警告"
              description={`当前可用数量 (${detail.availableQty}) 低于安全库存 (${detail.safetyStock})，请及时补货！`}
              showIcon
              style={{ marginBottom: 16 }}
              data-testid="low-stock-warning"
              className="low-stock-warning"
            />
          )}

          {/* 基本信息 */}
          <Descriptions title="基本信息" column={1} bordered size="small">
            <Descriptions.Item label="SKU编码">{detail.skuCode}</Descriptions.Item>
            <Descriptions.Item label="SKU名称">{detail.skuName}</Descriptions.Item>
            <Descriptions.Item label="门店">
              {detail.storeCode && `[${detail.storeCode}] `}{detail.storeName}
            </Descriptions.Item>
            <Descriptions.Item label="分类">{detail.categoryName || '-'}</Descriptions.Item>
            <Descriptions.Item label="单位">{detail.mainUnit}</Descriptions.Item>
            <Descriptions.Item label="库存状态">
              <InventoryStatusTag status={detail.inventoryStatus} />
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 库存数量 */}
          <Descriptions title="库存数量" column={1} bordered size="small">
            <Descriptions.Item label="现存数量">
              <Space>
                <span style={{ fontWeight: 'bold', fontSize: 16 }}>{detail.onHandQty}</span>
                <span style={{ color: '#8c8c8c' }}>{detail.mainUnit}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="可用数量">
              <Space>
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: 16,
                  color: isLowStock ? '#ff4d4f' : undefined 
                }}>
                  {detail.availableQty}
                </span>
                <span style={{ color: '#8c8c8c' }}>{detail.mainUnit}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="预占数量">
              <Space>
                <span>{detail.reservedQty}</span>
                <span style={{ color: '#8c8c8c' }}>{detail.mainUnit}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="安全库存">
              <Space>
                <span>{detail.safetyStock}</span>
                <span style={{ color: '#8c8c8c' }}>{detail.mainUnit}</span>
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 时间信息 */}
          <Descriptions title="时间信息" column={1} bordered size="small">
            <Descriptions.Item label="创建时间">
              {detail.createdAt ? new Date(detail.createdAt).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="最后更新">
              {detail.updatedAt ? new Date(detail.updatedAt).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  );
};

export default InventoryDetailDrawer;
