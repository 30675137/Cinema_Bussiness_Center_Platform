/**
 * @spec O003-beverage-order
 * 订单快捷操作按钮组件
 */
import React from 'react';
import { Button, Space, Popconfirm } from 'antd';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  DeliveredProcedureOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  useStartProduction,
  useCompleteOrder,
  useDeliverOrder,
  useCancelOrder,
} from '../../../hooks/useUpdateOrderStatus';
import { BeverageOrderStatus } from '../../../types/beverageOrder';

/**
 * 订单快捷操作按钮组件属性
 */
export interface OrderActionButtonsProps {
  orderId: string;
  orderNumber: string;
  status: BeverageOrderStatus;
  compact?: boolean;
}

/**
 * 订单快捷操作按钮组件
 *
 * 根据订单状态显示对应的操作按钮：
 * - 待制作 → 开始制作
 * - 制作中 → 完成制作
 * - 已完成 → 交付订单
 * - 所有状态 → 取消订单（需确认）
 */
export const OrderActionButtons: React.FC<OrderActionButtonsProps> = ({
  orderId,
  orderNumber,
  status,
  compact = false,
}) => {
  const { mutate: startProduction, isPending: isStarting } = useStartProduction();
  const { mutate: completeOrder, isPending: isCompleting } = useCompleteOrder();
  const { mutate: deliverOrder, isPending: isDelivering } = useDeliverOrder();
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const buttonSize = compact ? 'small' : 'middle';

  return (
    <Space size="small">
      {/* 待制作 → 开始制作 */}
      {status === BeverageOrderStatus.PENDING_PRODUCTION && (
        <Button
          type="primary"
          size={buttonSize}
          icon={<PlayCircleOutlined />}
          loading={isStarting}
          onClick={() => startProduction(orderId)}
        >
          开始制作
        </Button>
      )}

      {/* 制作中 → 完成制作 */}
      {status === BeverageOrderStatus.PRODUCING && (
        <Button
          type="primary"
          size={buttonSize}
          icon={<CheckCircleOutlined />}
          loading={isCompleting}
          onClick={() => completeOrder(orderId)}
        >
          完成制作
        </Button>
      )}

      {/* 已完成 → 交付订单 */}
      {status === BeverageOrderStatus.COMPLETED && (
        <Button
          type="primary"
          size={buttonSize}
          icon={<DeliveredProcedureOutlined />}
          loading={isDelivering}
          onClick={() => deliverOrder(orderId)}
        >
          交付订单
        </Button>
      )}

      {/* 取消订单（待制作/制作中可取消） */}
      {(status === BeverageOrderStatus.PENDING_PRODUCTION ||
        status === BeverageOrderStatus.PRODUCING) && (
        <Popconfirm
          title="确认取消订单"
          description={`确定要取消订单 ${orderNumber} 吗？`}
          onConfirm={() => cancelOrder(orderId)}
          okText="确认"
          cancelText="取消"
        >
          <Button danger size={buttonSize} icon={<CloseCircleOutlined />} loading={isCancelling}>
            取消订单
          </Button>
        </Popconfirm>
      )}
    </Space>
  );
};
