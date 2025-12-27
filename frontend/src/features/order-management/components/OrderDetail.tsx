/**
 * @spec O001-product-order-list
 * 订单详情组件 - User Story 3
 */

import React from 'react'
import { Card, Descriptions, Table, Timeline, Tag, Typography, Row, Col, Divider, type TableProps } from 'antd'
import type { ProductOrder, OrderItem, OrderLog } from '../types/order'
import { OrderStatusBadge } from './OrderStatusBadge'
import { maskPhone } from '../utils/maskPhone'
import { formatOrderStatus } from '../utils/formatOrderStatus'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export interface OrderDetailProps {
  /**
   * 订单数据
   */
  order: ProductOrder
}

/**
 * 订单详情组件
 *
 * 展示完整的订单信息，包括:
 * - 订单基本信息（订单号、状态、金额等）
 * - 用户信息（姓名、手机号脱敏、收货地址）
 * - 商品列表（商品名称、规格、数量、单价、小计）
 * - 支付信息（支付方式、支付时间）
 * - 物流信息（发货时间、完成时间）
 * - 订单日志（操作记录，按时间倒序）
 *
 * @example
 * ```tsx
 * <OrderDetail order={orderData} />
 * ```
 */
export const OrderDetail: React.FC<OrderDetailProps> = React.memo(({ order }) => {
  // 商品列表表格列定义
  const itemColumns: TableProps<OrderItem>['columns'] = [
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName'
    },
    {
      title: '规格',
      dataIndex: 'productSpec',
      key: 'productSpec',
      render: (spec) => spec || '-'
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (price: number) => `¥${price.toFixed(2)}`
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center'
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right',
      render: (subtotal: number) => (
        <Text strong>¥{subtotal.toFixed(2)}</Text>
      )
    }
  ]

  // 格式化地址
  const formatAddress = () => {
    const { shippingAddress } = order
    if (!shippingAddress) return '-'
    const { province, city, district, detail } = shippingAddress
    return `${province}${city}${district}${detail}`
  }

  return (
    <div className="order-detail">
      {/* 订单基本信息 */}
      <Card title="订单信息" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
          <Descriptions.Item label="订单号" span={2}>
            <Text copyable strong>{order.orderNumber}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <OrderStatusBadge status={order.status} />
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {dayjs(order.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="订单版本">
            v{order.version}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 用户信息 */}
      <Card title="用户信息" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="用户名">
            {order.user?.username || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系电话">
            {order.user?.phone ? maskPhone(order.user.phone) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="收货地址" span={2}>
            {formatAddress()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 商品列表 */}
      <Card title="商品明细" style={{ marginBottom: 16 }}>
        <Table<OrderItem>
          columns={itemColumns}
          dataSource={order.items || []}
          rowKey="id"
          pagination={false}
          bordered
        />

        <Divider />

        {/* 金额汇总 */}
        <Row justify="end">
          <Col xs={24} sm={12} md={8}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="商品金额">
                ¥{order.productTotal.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="运费">
                ¥{order.shippingFee.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="优惠金额">
                -¥{order.discountAmount.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="订单总额">
                <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                  ¥{order.totalAmount.toFixed(2)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* 支付信息 */}
      <Card title="支付信息" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="支付方式">
            {order.paymentMethod || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="支付时间">
            {order.paymentTime ? dayjs(order.paymentTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 物流信息 */}
      <Card title="物流信息" style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered>
          <Descriptions.Item label="发货时间">
            {order.shippedTime ? dayjs(order.shippedTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="完成时间">
            {order.completedTime ? dayjs(order.completedTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          {order.status === 'CANCELLED' && (
            <>
              <Descriptions.Item label="取消时间">
                {order.cancelledTime ? dayjs(order.cancelledTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="取消原因">
                {order.cancelReason || '-'}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      {/* 订单日志 */}
      <Card title="操作日志">
        <Timeline
          mode="left"
          items={(order.logs || []).map((log: OrderLog) => ({
            key: log.id,
            color: log.statusAfter === 'CANCELLED' ? 'red' : 'blue',
            children: (
              <div>
                <div>
                  <Text strong>{log.comments || '操作记录'}</Text>
                  {log.statusBefore && log.statusAfter && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({formatOrderStatus(log.statusBefore)} → {formatOrderStatus(log.statusAfter)})
                    </Text>
                  )}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {log.operatorName} · {dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </div>
              </div>
            )
          }))}
        />
      </Card>
    </div>
  )
})

OrderDetail.displayName = 'OrderDetail'

export default OrderDetail
