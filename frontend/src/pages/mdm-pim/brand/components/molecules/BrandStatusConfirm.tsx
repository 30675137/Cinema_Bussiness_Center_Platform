import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Typography, Alert } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { Brand } from '../../types/brand.types';
import { BrandStatus } from '../../types/brand.types';

const { TextArea } = Input;
const { Text, Title } = Typography;

export interface BrandStatusConfirmProps {
  visible: boolean;
  brand: Brand | null;
  targetStatus: BrandStatus;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 品牌状态确认模态组件
 * 用于确认品牌状态变更操作，特别是停用操作需要输入原因
 */
const BrandStatusConfirm: React.FC<BrandStatusConfirmProps> = ({
  visible,
  brand,
  targetStatus,
  onConfirm,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [reason, setReason] = useState('');
  const [showError, setShowError] = useState(false);

  // 重置表单状态
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setReason('');
      setShowError(false);
    }
  }, [visible, form]);

  // 获取模态标题
  const getModalTitle = (): string => {
    if (!brand) return '确认状态变更';

    switch (targetStatus) {
      case BrandStatus.ENABLED:
        return '确认启用品牌';
      case BrandStatus.DISABLED:
        return '确认停用品牌';
      case BrandStatus.DRAFT:
        return '确认草稿状态';
      default:
        return '确认状态变更';
    }
  };

  // 获取模态内容
  const getModalContent = (): React.ReactNode => {
    if (!brand) return null;

    const isDisabling = targetStatus === BrandStatus.DISABLED;
    const statusText = {
      [BrandStatus.ENABLED]: '启用',
      [BrandStatus.DISABLED]: '停用',
      [BrandStatus.DRAFT]: '草稿'
    }[targetStatus];

    return (
      <div className="brand-status-confirm-content">
        <div style={{ marginBottom: 16 }}>
          <Text>
            确定要将品牌
            <Text strong style={{ margin: '0 4px' }}>{brand.name}</Text>
            的状态变更为
            <Text strong style={{ margin: '0 4px' }}>{statusText}</Text>
            吗？
          </Text>
        </div>

        {/* 停用影响警告 */}
        {isDisabling && (
          <Alert
            message="停用影响说明"
            description={
              <div>
                <p style={{ margin: 0 }}>
                  • 停用后，该品牌将<strong>无法用于创建新商品</strong>
                </p>
                <p style={{ margin: '8px 0 0 0' }}>
                  • 现有的关联商品<strong>不会受到影响</strong>，可继续正常销售
                </p>
                <p style={{ margin: '8px 0 0 0' }}>
                  • 如需重新启用，可在品牌列表中操作
                </p>
              </div>
            }
            type="warning"
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 16 }}
            data-testid="brand-disable-impact-warning"
          />
        )}

        {/* 启用说明 */}
        {!isDisabling && (
          <Alert
            message="启用说明"
            description={
              <div>
                <p style={{ margin: 0 }}>
                  启用后，该品牌将可以正常用于创建新商品和各项业务操作。
                </p>
              </div>
            }
            type="info"
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 停用原因输入 */}
        {isDisabling && (
          <Form
            form={form}
            layout="vertical"
            data-testid="brand-status-form"
          >
            <Form.Item
              name="reason"
              label={
                <span>
                  停用原因 <Text type="danger">*</Text>
                </span>
              }
              rules={[
                { required: true, message: '请输入停用原因' },
                { max: 500, message: '停用原因不能超过500个字符' },
                { min: 2, message: '停用原因至少需要2个字符' }
              ]}
              data-testid="brand-status-reason-field"
            >
              <TextArea
                placeholder="请详细说明停用原因，例如：业务调整、品牌政策变更、供应链问题等"
                rows={4}
                maxLength={500}
                showCount
                onChange={(e) => {
                  const value = e.target.value;
                  setReason(value);
                  setShowError(false);
                }}
                data-testid="brand-status-reason-input"
              />
            </Form.Item>
          </Form>
        )}

        {/* 启用确认（通常不需要原因） */}
        {!isDisabling && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              此操作将立即生效，请确认是否继续。
            </Text>
          </div>
        )}
      </div>
    );
  };

  // 获取确认按钮文本
  const getConfirmButtonText = (): string => {
    switch (targetStatus) {
      case BrandStatus.ENABLED:
        return '确认启用';
      case BrandStatus.DISABLED:
        return '确认停用';
      case BrandStatus.DRAFT:
        return '确认设为草稿';
      default:
        return '确认';
    }
  };

  // 获取确认按钮类型
  const getConfirmButtonType = (): 'primary' | 'default' => {
    return targetStatus === BrandStatus.DISABLED ? 'default' : 'primary';
  };

  // 获取确认按钮危险属性
  const getConfirmButtonDanger = (): boolean => {
    return targetStatus === BrandStatus.DISABLED;
  };

  // 获取确认按钮图标
  const getConfirmButtonIcon = (): React.ReactNode => {
    switch (targetStatus) {
      case BrandStatus.ENABLED:
        return <CheckOutlined />;
      case BrandStatus.DISABLED:
        return <CloseOutlined />;
      default:
        return null;
    }
  };

  // 处理确认操作
  const handleConfirm = async () => {
    if (targetStatus === BrandStatus.DISABLED) {
      try {
        const values = await form.validateFields();
        setReason(values.reason);
        onConfirm(values.reason);
      } catch (error) {
        setShowError(true);
        // 表单验证失败，不做任何操作
      }
    } else {
      // 启用操作不需要原因
      onConfirm();
    }
  };

  // 处理取消操作
  const handleCancel = () => {
    form.resetFields();
    setReason('');
    setShowError(false);
    onCancel();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onOk={handleConfirm}
      onCancel={handleCancel}
      confirmLoading={loading}
      cancelText="取消"
      okText={getConfirmButtonText()}
      okType={getConfirmButtonType()}
      okButtonProps={{
        danger: getConfirmButtonDanger(),
        icon: getConfirmButtonIcon(),
        'data-testid': 'brand-status-confirm-button',
        disabled: targetStatus === BrandStatus.DISABLED && !reason.trim(),
      }}
      cancelButtonProps={{
        'data-testid': 'brand-status-cancel-button',
      }}
      destroyOnClose
      maskClosable={false}
      keyboard={true}
      width={480}
      data-testid="brand-status-confirm-modal"
      onKeyDown={handleKeyDown}
    >
      <div data-testid="brand-status-confirm-container">
        {getModalContent()}

        {/* 表单错误提示 */}
        {showError && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: '#fff2f0',
              border: '1px solid #ffccc7',
              borderRadius: 6,
            }}
            data-testid="brand-status-form-error"
          >
            <Text type="danger" style={{ fontSize: 14 }}>
              请完善必填信息后再进行确认操作
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BrandStatusConfirm;