/**
 * P004-inventory-adjustment: 库存调整确认弹窗组件
 * 
 * 显示调整前后库存对比，用于二次确认调整操作。
 * 实现 T019 任务。
 */

import React from 'react';
import {
  Modal,
  Descriptions,
  Typography,
  Space,
  Tag,
  Alert,
  Divider,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  ArrowRightOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  ADJUSTMENT_TYPE_OPTIONS,
  APPROVAL_THRESHOLD,
  getAdjustmentTypeLabel,
  calculateStockAfter,
  requiresApproval,
  type AdjustmentType,
} from '../types/adjustment';
import type { StoreInventoryItem } from '../types';

const { Text, Title } = Typography;

/**
 * 确认弹窗所需的调整数据
 */
export interface ConfirmAdjustmentData {
  adjustmentType: AdjustmentType;
  quantity: number;
  reasonCode: string;
  reasonName?: string;
  reasonText?: string;
  remarks?: string;
}

/**
 * ConfirmAdjustmentModal 组件属性
 */
export interface ConfirmAdjustmentModalProps {
  /** 是否显示 */
  open: boolean;
  /** 调整数据 */
  data: ConfirmAdjustmentData | null;
  /** 库存信息 */
  inventory: StoreInventoryItem;
  /** 单价（用于计算调整金额） */
  unitPrice?: number;
  /** 是否提交中 */
  loading?: boolean;
  /** 确认回调 */
  onConfirm: () => void;
  /** 取消回调 */
  onCancel: () => void;
}

/**
 * 库存调整确认弹窗组件
 * 
 * 功能：
 * - 展示调整前后库存对比
 * - 显示调整详情（类型、数量、原因等）
 * - 展示调整金额和审批提示
 * - 提供确认/取消操作
 * 
 * @example
 * ```tsx
 * <ConfirmAdjustmentModal
 *   open={confirmVisible}
 *   data={adjustmentData}
 *   inventory={inventoryItem}
 *   unitPrice={50}
 *   loading={submitting}
 *   onConfirm={handleConfirm}
 *   onCancel={() => setConfirmVisible(false)}
 * />
 * ```
 */
export const ConfirmAdjustmentModal: React.FC<ConfirmAdjustmentModalProps> = ({
  open,
  data,
  inventory,
  unitPrice = 50,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!data) return null;

  // 计算库存变化
  const currentStock = inventory.onHandQty;
  const currentAvailable = inventory.availableQty;
  const stockAfter = calculateStockAfter(currentStock, data.adjustmentType, data.quantity);
  const availableAfter = calculateStockAfter(currentAvailable, data.adjustmentType, data.quantity);
  const stockChange = data.adjustmentType === 'surplus' ? data.quantity : -data.quantity;

  // 计算调整金额
  const adjustmentAmount = data.quantity * unitPrice;
  const needsApproval = requiresApproval(data.quantity, unitPrice);

  // 获取调整类型配置
  const typeConfig = ADJUSTMENT_TYPE_OPTIONS.find(opt => opt.value === data.adjustmentType);
  const isIncrease = data.adjustmentType === 'surplus';

  return (
    <Modal
      title="确认库存调整"
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText={needsApproval ? '提交审批' : '确认调整'}
      cancelText="返回修改"
      width={560}
      centered
      maskClosable={false}
      data-testid="confirm-adjustment-modal"
    >
      {/* 商品信息 */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: 12, 
        borderRadius: 6, 
        marginBottom: 16 
      }}>
        <Space direction="vertical" size={2}>
          <Text strong style={{ fontSize: 16 }}>{inventory.skuName}</Text>
          <Space split={<Text type="secondary">|</Text>}>
            <Text type="secondary">SKU: {inventory.skuCode}</Text>
            <Text type="secondary">门店: {inventory.storeName || '-'}</Text>
          </Space>
        </Space>
      </div>

      {/* 库存变化对比 */}
      <div 
        style={{ 
          background: '#fafafa', 
          padding: 20, 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid #e8e8e8',
        }}
        data-testid="stock-comparison"
      >
        <Title level={5} style={{ marginBottom: 16 }}>库存变化</Title>
        <Row gutter={16} align="middle" justify="center">
          {/* 调整前 */}
          <Col span={8}>
            <Statistic
              title="调整前库存"
              value={currentStock}
              suffix={inventory.mainUnit}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          
          {/* 箭头和变化值 */}
          <Col span={8} style={{ textAlign: 'center' }}>
            <Space direction="vertical" align="center">
              <ArrowRightOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />
              <Tag 
                color={isIncrease ? 'green' : 'red'} 
                icon={isIncrease ? <PlusCircleOutlined /> : <MinusCircleOutlined />}
                style={{ fontSize: 14, padding: '4px 12px' }}
              >
                {isIncrease ? '+' : ''}{stockChange} {inventory.mainUnit}
              </Tag>
            </Space>
          </Col>
          
          {/* 调整后 */}
          <Col span={8}>
            <Statistic
              title="调整后库存"
              value={stockAfter}
              suffix={inventory.mainUnit}
              valueStyle={{ color: isIncrease ? '#52c41a' : '#ff4d4f' }}
            />
          </Col>
        </Row>

        {/* 可用库存变化 */}
        <Divider style={{ margin: '16px 0' }} />
        <Row gutter={16} justify="center">
          <Col span={12} style={{ textAlign: 'center' }}>
            <Text type="secondary">可用库存变化: </Text>
            <Text>
              {currentAvailable} → <Text strong style={{ color: isIncrease ? '#52c41a' : '#ff4d4f' }}>{availableAfter}</Text>
            </Text>
            <Text type="secondary"> {inventory.mainUnit}</Text>
          </Col>
        </Row>
      </div>

      {/* 调整详情 */}
      <Descriptions 
        title="调整详情" 
        column={2} 
        bordered 
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="调整类型">
          <Tag color={typeConfig?.color}>
            {getAdjustmentTypeLabel(data.adjustmentType)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="调整数量">
          <Text strong>{data.quantity}</Text> {inventory.mainUnit}
        </Descriptions.Item>
        <Descriptions.Item label="调整原因" span={2}>
          {data.reasonName || data.reasonCode}
          {data.reasonText && (
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              {data.reasonText}
            </Text>
          )}
        </Descriptions.Item>
        {data.remarks && (
          <Descriptions.Item label="备注" span={2}>
            {data.remarks}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="调整金额">
          <Text strong style={{ color: '#1890ff' }}>
            ¥ {adjustmentAmount.toFixed(2)}
          </Text>
        </Descriptions.Item>
      </Descriptions>

      {/* 审批提示 */}
      {needsApproval && (
        <Alert
          type="warning"
          message="此调整需要审批"
          description={
            <Space direction="vertical" size={4}>
              <Text>
                调整金额 ¥{adjustmentAmount.toFixed(2)} 已达到审批阈值 ¥{APPROVAL_THRESHOLD}。
              </Text>
              <Text>
                提交后将进入待审批状态，审批通过后库存才会更新。
              </Text>
            </Space>
          }
          icon={<WarningOutlined />}
          showIcon
          data-testid="approval-required-notice"
        />
      )}

      {/* 无需审批提示 */}
      {!needsApproval && (
        <Alert
          type="info"
          message="确认后库存将立即更新"
          description="此调整无需审批，点击确认后库存将立即变更，请仔细核对以上信息。"
          showIcon
          data-testid="direct-adjustment-notice"
        />
      )}
    </Modal>
  );
};

export default ConfirmAdjustmentModal;
