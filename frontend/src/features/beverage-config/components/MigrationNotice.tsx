/**
 * @spec O004-beverage-sku-reuse
 * Migration Notice Component (Task: T043)
 *
 * Purpose: Display migration notice on old beverage management page
 * Informs users that beverage configuration has moved to unified SKU management
 *
 * 注意: 此功能不包含权限与认证逻辑(详见宪法"认证与权限要求分层"原则)
 */

import React from 'react';
import { Alert, Button, Space } from 'antd';
import { InfoCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export interface MigrationNoticeProps {
  /**
   * Show "Go to SKU Management" button
   * @default true
   */
  showActionButton?: boolean;

  /**
   * Custom redirect path
   * @default '/products/sku?type=finished_product&category=beverage'
   */
  redirectPath?: string;

  /**
   * Alert type
   * @default 'info'
   */
  type?: 'info' | 'warning';

  /**
   * Show close button
   * @default false
   */
  closable?: boolean;
}

/**
 * Migration Notice Component
 *
 * Displays an informational alert notifying users that the beverage management
 * interface has been migrated to the unified SKU management system.
 *
 * @example
 * ```tsx
 * <MigrationNotice />
 *
 * <MigrationNotice
 *   type="warning"
 *   closable
 *   redirectPath="/products/sku"
 * />
 * ```
 */
export const MigrationNotice: React.FC<MigrationNoticeProps> = ({
  showActionButton = true,
  redirectPath = '/products/sku?type=finished_product&category=beverage',
  type = 'info',
  closable = false,
}) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(redirectPath);
  };

  return (
    <Alert
      message="饮品管理功能已迁移"
      description={
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            为了简化商品管理流程，饮品配置功能已迁移至<strong>统一SKU管理系统</strong>。
          </div>
          <div>• 现有饮品数据已自动迁移，无需手动操作</div>
          <div>
            • 新增饮品请前往<strong>SKU管理</strong>页面，选择"成品"类型创建
          </div>
          <div>• BOM配方配置、库存管理等功能也已整合至SKU系统</div>
          {showActionButton && (
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={handleNavigate}
              style={{ marginTop: 8 }}
            >
              前往SKU管理
            </Button>
          )}
        </Space>
      }
      type={type}
      icon={<InfoCircleOutlined />}
      closable={closable}
      showIcon
      style={{
        marginBottom: 16,
        borderRadius: 8,
      }}
    />
  );
};

export default MigrationNotice;
