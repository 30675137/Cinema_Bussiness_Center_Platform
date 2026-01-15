import React, { useState } from 'react';
import { Dropdown, Button, Space, message } from 'antd';
import { DownOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { Brand } from '../../types/brand.types';
import { BrandStatus } from '../../types/brand.types';

const { Text } = 'antd/es/typography';

export interface BrandStatusActionsProps {
  brand: Brand;
  onStatusChange?: (brand: Brand, newStatus: BrandStatus, reason?: string) => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'text' | 'link';
}

/**
 * 品牌状态操作分子组件
 * 提供品牌状态变更的操作按钮和菜单
 */
const BrandStatusActions: React.FC<BrandStatusActionsProps> = ({
  brand,
  onStatusChange,
  loading = false,
  disabled = false,
  size = 'small',
  type = 'default',
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<BrandStatus | null>(null);
  const [reason, setReason] = useState('');

  // 获取状态变更的按钮文本
  const getStatusActionText = (currentStatus: BrandStatus): string => {
    switch (currentStatus) {
      case BrandStatus.ENABLED:
        return '停用';
      case BrandStatus.DISABLED:
        return '启用';
      case BrandStatus.DRAFT:
        return '启用';
      default:
        return '操作';
    }
  };

  // 获取状态变更的目标状态
  const getTargetStatus = (currentStatus: BrandStatus): BrandStatus => {
    switch (currentStatus) {
      case BrandStatus.ENABLED:
        return BrandStatus.DISABLED;
      case BrandStatus.DISABLED:
      case BrandStatus.DRAFT:
        return BrandStatus.ENABLED;
      default:
        return BrandStatus.ENABLED;
    }
  };

  // 处理状态变更
  const handleStatusChange = (newStatus: BrandStatus) => {
    setPendingStatus(newStatus);

    // 只有停用操作需要输入原因
    if (newStatus === BrandStatus.DISABLED) {
      setReason('');
      setShowConfirmModal(true);
    } else {
      // 启用操作直接执行
      confirmStatusChange(newStatus);
    }
  };

  // 确认状态变更
  const confirmStatusChange = async (status: BrandStatus, confirmReason?: string) => {
    if (!onStatusChange) {
      message.warning('状态变更处理函数未提供');
      return;
    }

    try {
      await onStatusChange(brand, status, confirmReason);
      message.success('品牌状态更新成功');
    } catch (error) {
      console.error('品牌状态变更失败:', error);
      // 错误处理已在onStatusChange中进行
    } finally {
      setShowConfirmModal(false);
      setPendingStatus(null);
      setReason('');
    }
  };

  // 取消操作
  const handleCancel = () => {
    setShowConfirmModal(false);
    setPendingStatus(null);
    setReason('');
  };

  // 获取下拉菜单项
  const menuItems = [
    {
      key: 'enable',
      label: '启用品牌',
      icon: <CheckOutlined />,
      disabled: brand.status === BrandStatus.ENABLED || loading,
      onClick: () => handleStatusChange(BrandStatus.ENABLED),
      'data-testid': 'brand-enable-menu-item',
    },
    {
      key: 'disable',
      label: '停用品牌',
      icon: <CloseOutlined />,
      disabled: brand.status === BrandStatus.DISABLED || loading,
      onClick: () => handleStatusChange(BrandStatus.DISABLED),
      'data-testid': 'brand-disable-menu-item',
    },
  ];

  // 过滤掉当前状态对应的禁用项
  const filteredMenuItems = menuItems.filter((item) => {
    if (brand.status === BrandStatus.ENABLED) {
      return item.key === 'disable';
    } else if (brand.status === BrandStatus.DISABLED || brand.status === BrandStatus.DRAFT) {
      return item.key === 'enable';
    }
    return true;
  });

  // 主要状态按钮（如果没有其他选项，则直接显示主要操作）
  if (filteredMenuItems.length === 1) {
    const targetStatus = getTargetStatus(brand.status);
    const isDisabling = targetStatus === BrandStatus.DISABLED;
    const buttonText = getStatusActionText(brand.status);
    const buttonIcon = isDisabling ? <CloseOutlined /> : <CheckOutlined />;

    return (
      <>
        <Button
          size={size}
          type={type}
          icon={buttonIcon}
          loading={loading}
          disabled={disabled}
          onClick={() => handleStatusChange(targetStatus)}
          data-testid="brand-status-action-button"
          danger={isDisabling}
        >
          {buttonText}
        </Button>

        {renderConfirmModal()}
      </>
    );
  }

  // 下拉菜单形式
  return (
    <>
      <Dropdown
        menu={{
          items: filteredMenuItems,
          onClick: ({ key }) => {
            const status = key === 'enable' ? BrandStatus.ENABLED : BrandStatus.DISABLED;
            handleStatusChange(status);
          },
        }}
        trigger={['click']}
        disabled={disabled || loading}
        placement="bottomRight"
        data-testid="brand-status-dropdown"
      >
        <Button
          size={size}
          type={type}
          icon={<DownOutlined />}
          loading={loading}
          disabled={disabled}
          data-testid="brand-status-actions-button"
        >
          状态操作
        </Button>
      </Dropdown>

      {renderConfirmModal()}
    </>
  );

  // 渲染确认对话框
  function renderConfirmModal() {
    if (pendingStatus !== BrandStatus.DISABLED || !showConfirmModal) {
      return null;
    }

    return (
      <div
        className="brand-status-confirm-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        data-testid="brand-status-confirm-dialog"
        onClick={handleCancel}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: 8,
            padding: 24,
            minWidth: 400,
            maxWidth: 500,
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
            }}
            data-testid="brand-status-confirm-title"
          >
            确认停用品牌
          </h3>

          <div
            style={{
              marginBottom: 20,
            }}
            data-testid="brand-status-confirm-content"
          >
            <p style={{ margin: '0 0 8px 0' }}>
              确定要停用品牌"<Text strong>{brand.name}</Text>"吗？
            </p>

            <div
              style={{
                backgroundColor: '#fff2f0',
                border: '1px solid #ffccc7',
                borderRadius: 6,
                padding: 12,
                marginBottom: 16,
              }}
              data-testid="brand-disable-impact-warning"
            >
              <Text type="danger" style={{ fontSize: 14 }}>
                <strong>注意：</strong>停用后，该品牌将无法用于创建新商品，但不影响现有商品的销售。
              </Text>
            </div>

            <div data-testid="brand-status-reason-field">
              <label
                htmlFor="reason-input"
                style={{
                  display: 'block',
                  marginBottom: 8,
                  fontWeight: 500,
                }}
                data-testid="brand-status-reason-label"
              >
                停用原因 <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>
              </label>
              <textarea
                id="reason-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请输入停用原因，帮助其他成员了解停用背景"
                maxLength={500}
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 8,
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  fontSize: 14,
                  resize: 'vertical',
                }}
                data-testid="brand-status-reason-input"
              />
              <div
                style={{
                  textAlign: 'right',
                  marginTop: 4,
                  fontSize: 12,
                  color: '#8c8c8c',
                }}
              >
                {reason.length}/500
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            <Button
              onClick={handleCancel}
              disabled={loading}
              data-testid="brand-status-cancel-button"
            >
              取消
            </Button>
            <Button
              type="primary"
              danger
              loading={loading}
              disabled={!reason.trim()}
              onClick={() => confirmStatusChange(BrandStatus.DISABLED, reason.trim())}
              data-testid="brand-status-confirm-button"
            >
              确认停用
            </Button>
          </div>
        </div>
      </div>
    );
  }
};

export default BrandStatusActions;
