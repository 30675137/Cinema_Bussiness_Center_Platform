/**
 * @spec O001-product-order-list
 * @spec O003-beverage-order
 * 订单列表组件 - 使用 Ant Design Table 展示统一订单列表（包含商品订单和饮品订单）
 */

import React from 'react';
import { Table, type TableProps, Typography, Tag } from 'antd';
import { Link } from 'react-router-dom';
import type { UnifiedOrder, OrderType } from '../types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import dayjs from 'dayjs';

const { Text } = Typography;

export interface OrderListProps {
  /**
   * 统一订单数据（包含商品订单和饮品订单）
   */
  data: UnifiedOrder[];

  /**
   * 总记录数
   */
  total: number;

  /**
   * 当前页码
   */
  page: number;

  /**
   * 每页记录数
   */
  pageSize: number;

  /**
   * 加载状态
   */
  loading?: boolean;

  /**
   * 分页变化回调
   */
  onPaginationChange?: (page: number, pageSize: number) => void;
}

/**
 * 订单列表组件
 *
 * 使用 Ant Design Table 展示统一订单列表（包含商品订单和饮品订单），包含:
 * - 订单号（可点击跳转详情）
 * - 订单类型（商品订单/饮品订单）
 * - 用户ID
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
    // 订单类型标签映射
    const getOrderTypeTag = (orderType: OrderType) => {
      if (orderType === 'BEVERAGE') {
        return <Tag color="blue">饮品订单</Tag>;
      }
      return <Tag color="green">商品订单</Tag>;
    };

    const columns: TableProps<UnifiedOrder>['columns'] = [
      {
        title: '订单号',
        dataIndex: 'orderNumber',
        key: 'orderNumber',
        width: 200,
        fixed: 'left',
        render: (orderNumber: string, record: UnifiedOrder) => (
          <Link to={`/orders/${record.id}`}>
            <Text strong>{orderNumber}</Text>
          </Link>
        ),
      },
      {
        title: '订单类型',
        dataIndex: 'orderType',
        key: 'orderType',
        width: 120,
        align: 'center',
        render: (orderType: OrderType) => getOrderTypeTag(orderType),
      },
      {
        title: '用户ID',
        dataIndex: 'userId',
        key: 'userId',
        width: 280,
        ellipsis: true,
        render: (userId: string) => (
          <Text ellipsis={{ tooltip: userId }} type="secondary">
            {userId}
          </Text>
        ),
      },
      {
        title: '订单金额',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        width: 120,
        align: 'right',
        render: (amount: number) => <Text strong>¥{amount.toFixed(2)}</Text>,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        align: 'center',
        render: (status: string) => <OrderStatusBadge status={status} />,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (createdAt: string) => (
          <Text>{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
        ),
      },
    ];

    return (
      <Table<UnifiedOrder>
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
          onChange: onPaginationChange,
        }}
        scroll={{ x: 1200 }}
        bordered
      />
    );
  }
);

OrderList.displayName = 'OrderList';

export default OrderList;
