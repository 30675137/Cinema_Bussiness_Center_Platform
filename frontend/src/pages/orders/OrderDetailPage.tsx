/**
 * @spec O001-product-order-list
 * 订单详情页面 - User Story 3
 */

import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, Typography, Button, Space, Spin, Result, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { OrderDetail } from '../../features/order-management/components/OrderDetail'
import { OrderActions } from '../../features/order-management/components/OrderActions'
import { useOrderDetail } from '../../features/order-management/hooks/useOrderDetail'

const { Title } = Typography

/**
 * 订单详情页面
 *
 * 功能:
 * - 展示订单完整详细信息
 * - 订单基本信息（订单号、状态、金额等）
 * - 用户信息（姓名、手机号脱敏、收货地址）
 * - 商品列表
 * - 支付信息
 * - 物流信息
 * - 订单日志记录
 * - 404错误处理
 *
 * User Story: US3 - 订单详情查看
 */
const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  // 使用 TanStack Query 查询订单详情
  const { data, isLoading, isError, error } = useOrderDetail(id)

  // 错误处理
  React.useEffect(() => {
    if (isError && error) {
      message.error(error.message || '加载订单详情失败，请稍后重试')
    }
  }, [isError, error])

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 页面头部 */}
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Link to="/orders/list">
                <Button icon={<ArrowLeftOutlined />}>返回列表</Button>
              </Link>
              <Title level={2} style={{ margin: 0 }}>订单详情</Title>
            </Space>
            {/* 订单操作按钮 - User Story 4 */}
            {!isLoading && !isError && data?.data && (
              <OrderActions order={data.data} />
            )}
          </Space>
        </Card>

        {/* 加载状态 */}
        {isLoading && (
          <Card>
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" tip="加载中..." />
            </div>
          </Card>
        )}

        {/* 错误状态 - 订单不存在 (404) */}
        {isError && error?.message.includes('不存在') && (
          <Card>
            <Result
              status="404"
              title="订单不存在"
              subTitle={`未找到订单 ID: ${id}`}
              extra={
                <Link to="/orders/list">
                  <Button type="primary">返回订单列表</Button>
                </Link>
              }
            />
          </Card>
        )}

        {/* 错误状态 - 其他错误 */}
        {isError && !error?.message.includes('不存在') && (
          <Card>
            <Result
              status="error"
              title="加载失败"
              subTitle={error?.message || '服务器错误，请稍后重试'}
              extra={
                <Space>
                  <Button onClick={() => window.location.reload()}>重新加载</Button>
                  <Link to="/orders/list">
                    <Button type="primary">返回订单列表</Button>
                  </Link>
                </Space>
              }
            />
          </Card>
        )}

        {/* 订单详情内容 */}
        {!isLoading && !isError && data?.data && (
          <OrderDetail order={data.data} />
        )}
      </Space>
    </div>
  )
}

export default OrderDetailPage
