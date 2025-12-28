/**
 * @spec O003-beverage-order
 * B端饮品订单卡片组件
 */
import React from 'react'
import { Card, Descriptions, Typography, Space, Divider } from 'antd'
import { BeverageOrderStatusBadge } from './BeverageOrderStatusBadge'
import { OrderActionButtons } from './OrderActionButtons'
import type { BeverageOrderDTO } from '../../../types/beverageOrder'

const { Text, Title } = Typography

/**
 * 订单卡片组件属性
 */
export interface BeverageOrderCardProps {
  order: BeverageOrderDTO
  onClick?: (order: BeverageOrderDTO) => void
}

/**
 * B端订单卡片组件
 *
 * 显示订单摘要信息，支持快捷操作
 */
export const BeverageOrderCard: React.FC<BeverageOrderCardProps> = ({ order, onClick }) => {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatSpecs = (specsJson: string) => {
    try {
      const specs = JSON.parse(specsJson)
      return Object.values(specs).filter(Boolean).join(' · ')
    } catch {
      return specsJson
    }
  }

  return (
    <Card
      hoverable
      onClick={() => onClick?.(order)}
      style={{ marginBottom: 16 }}
      extra={<BeverageOrderStatusBadge status={order.status} />}
    >
      {/* 订单头部 - 取餐号 */}
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            取餐号: <Text type="danger" style={{ fontSize: 32 }}>D{order.queueNumber || '---'}</Text>
          </Title>
          <Text type="secondary">{formatTime(order.createdAt)}</Text>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        {/* 订单信息 */}
        <Descriptions size="small" column={2}>
          <Descriptions.Item label="订单号">{order.orderNumber}</Descriptions.Item>
          <Descriptions.Item label="总价">
            <Text strong>¥{(order.totalPrice / 100).toFixed(2)}</Text>
          </Descriptions.Item>
        </Descriptions>

        {/* 商品列表 */}
        <div>
          <Text strong>商品清单:</Text>
          {order.items.map((item, index) => (
            <div key={index} style={{ marginTop: 8, paddingLeft: 16 }}>
              <Space>
                <Text>
                  {item.beverageName} × {item.quantity}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {formatSpecs(item.selectedSpecs)}
                </Text>
              </Space>
              {item.customerNote && (
                <div style={{ marginTop: 4 }}>
                  <Text type="warning" style={{ fontSize: 12 }}>
                    备注: {item.customerNote}
                  </Text>
                </div>
              )}
            </div>
          ))}
        </div>

        {order.customerNote && (
          <div style={{ marginTop: 8 }}>
            <Text type="warning">订单备注: {order.customerNote}</Text>
          </div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        {/* 快捷操作按钮 */}
        <div onClick={(e) => e.stopPropagation()}>
          <OrderActionButtons
            orderId={order.id}
            orderNumber={order.orderNumber}
            status={order.status}
          />
        </div>
      </Space>
    </Card>
  )
}
