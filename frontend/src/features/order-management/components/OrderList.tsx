/**
 * @spec O001-product-order-list
 * 订单列表组件 - 使用 Ant Design Table 展示订单列表
 */

import React from 'react'
import { Table, type TableProps, Typography } from 'antd'
import { Link } from 'react-router-dom'
import type { ProductOrder } from '../types/order'
import { OrderStatusBadge } from './OrderStatusBadge'
import { maskPhone } from '../utils/maskPhone'
import dayjs from 'dayjs'

const { Text } = Typography

export interface OrderListProps {
  /**
   * 订单数据
   */
  data: ProductOrder[]

  /**
   * 总记录数
   */
  total: number

  /**
   * 当前页码
   */
  page: number

  /**
   * 每页记录数
   */
  pageSize: number

  /**
   * 加载状态
   */
  loading?: boolean

  /**
   * 分页变化回调
   */
  onPaginationChange?: (page: number, pageSize: number) => void
}

/**
 * 订单列表组件
 *
 * 使用 Ant Design Table 展示订单列表，包含:
 * - 订单号（可点击跳转详情）
 * - 用户信息（用户名 + 脱敏手机号）
 * - 商品信息（商品摘要）
 * - 订单金额
 * - 订单状态（Tag 徽章）
 * - 创建时间
 * - 分页控件
 *
 * @example
 * ```tsx
 * <OrderList
 *   data={orders}
 *   total={100}
 *   page={1}
 *   pageSize={20}
 *   loading={isLoading}
 *   onPaginationChange={(page, pageSize) => setParams({ page, pageSize })}
 * />
 * ```
 */
export const OrderList: React.FC<OrderListProps> = React.memo(
  ({ data, total, page, pageSize, loading = false, onPaginationChange }) => {
    const columns: TableProps<ProductOrder>['columns'] = [
      {
        title: '订单号',
        dataIndex: 'orderNumber',
        key: 'orderNumber',
        width: 180,
        fixed: 'left',
        render: (orderNumber: string, record: ProductOrder) => (
          <Link to={`/orders/${record.id}`}>
            <Text strong>{orderNumber}</Text>
          </Link>
        )
      },
      {
        title: '用户',
        key: 'user',
        width: 180,
        render: (_: unknown, record: ProductOrder) => (
          <div>
            <div>{record.user?.username || '-'}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.user?.phone ? maskPhone(record.user.phone) : '-'}
            </Text>
          </div>
        )
      },
      {
        title: '商品',
        dataIndex: 'productSummary',
        key: 'productSummary',
        width: 200,
        ellipsis: true,
        render: (summary: string) => (
          <Text ellipsis={{ tooltip: summary }}>{summary || '-'}</Text>
        )
      },
      {
        title: '订单金额',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: 120,
        align: 'right',
        render: (amount: number) => (
          <Text strong>¥{amount.toFixed(2)}</Text>
        )
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        align: 'center',
        render: (status) => <OrderStatusBadge status={status} />
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (createdAt: string) => (
          <Text>{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
        )
      }
    ]

    return (
      <Table<ProductOrder>
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: onPaginationChange
        }}
        scroll={{ x: 1000 }}
        bordered
      />
    )
  }
)

OrderList.displayName = 'OrderList'

export default OrderList
