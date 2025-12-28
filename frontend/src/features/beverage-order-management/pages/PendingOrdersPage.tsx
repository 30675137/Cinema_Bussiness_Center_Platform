/**
 * @spec O003-beverage-order
 * B端待处理订单页面
 */
import React, { useState } from 'react'
import { Card, Row, Col, Empty, Spin, Typography, Badge, Space, Button } from 'antd'
import { ReloadOutlined, SoundOutlined } from '@ant-design/icons'
import { usePendingOrders } from '../../../hooks/useBeverageOrders'
import { useVoiceAnnouncement } from '../../../hooks/useVoiceAnnouncement'
import { useNewOrderNotification } from '../../../hooks/useNewOrderNotification'
import { BeverageOrderCard } from '../components'
import type { BeverageOrderDTO } from '../../../types/beverageOrder'

const { Title, Text } = Typography

/**
 * B端待处理订单页面
 *
 * 功能：
 * - 显示待制作 + 制作中的订单
 * - 5秒自动刷新
 * - 按状态分栏显示（待制作 | 制作中）
 * - 快捷操作按钮
 * - 新订单语音提醒（TODO: T101-T117）
 */
export const PendingOrdersPage: React.FC = () => {
  // TODO: 从用户上下文或配置获取门店ID
  const [storeId] = useState('00000000-0000-0000-0000-000000000001')

  const { data: orders, isLoading, error, refetch, isRefetching } = usePendingOrders(storeId)
  const { isAnnouncing, announceMultipleQueueNumbers, isSupported } = useVoiceAnnouncement()

  // 新订单通知（语音播报 + 桌面通知）
  useNewOrderNotification(orders, {
    enableVoice: true,
    enableDesktop: true,
  })

  // 按状态分组
  const pendingProductionOrders =
    orders?.filter((order) => order.status === 'PENDING_PRODUCTION') || []
  const producingOrders = orders?.filter((order) => order.status === 'PRODUCING') || []

  const handleOrderClick = (order: BeverageOrderDTO) => {
    // TODO: 导航到订单详情页
    console.log('查看订单详情:', order)
  }

  const handleVoiceAnnouncement = () => {
    // 播报所有已完成订单的取餐号
    const completedQueueNumbers = orders
      ?.filter((order) => order.status === 'COMPLETED' && order.queueNumber)
      .map((order) => order.queueNumber as string) || []

    announceMultipleQueueNumbers(completedQueueNumbers)
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <Empty
          description={`加载失败: ${error.message}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              待处理订单
            </Title>
            <Text type="secondary">
              共 {orders?.length || 0} 单（待制作 {pendingProductionOrders.length} | 制作中{' '}
              {producingOrders.length}）
            </Text>
          </div>
          <Space>
            <Button
              icon={<SoundOutlined />}
              onClick={handleVoiceAnnouncement}
              disabled={!isSupported || isAnnouncing}
              loading={isAnnouncing}
            >
              {isAnnouncing ? '播报中...' : '语音叫号'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isRefetching}
            >
              刷新
            </Button>
          </Space>
        </Space>
      </Card>

      {/* 订单列表 - 双栏布局 */}
      <Row gutter={[24, 24]}>
        {/* 待制作订单 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>待制作</Text>
                <Badge count={pendingProductionOrders.length} showZero />
              </Space>
            }
            bordered={false}
            style={{ minHeight: 600 }}
          >
            {pendingProductionOrders.length === 0 ? (
              <Empty description="暂无待制作订单" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              pendingProductionOrders.map((order) => (
                <BeverageOrderCard key={order.id} order={order} onClick={handleOrderClick} />
              ))
            )}
          </Card>
        </Col>

        {/* 制作中订单 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Text strong>制作中</Text>
                <Badge count={producingOrders.length} showZero status="processing" />
              </Space>
            }
            bordered={false}
            style={{ minHeight: 600 }}
          >
            {producingOrders.length === 0 ? (
              <Empty description="暂无制作中订单" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              producingOrders.map((order) => (
                <BeverageOrderCard key={order.id} order={order} onClick={handleOrderClick} />
              ))
            )}
          </Card>
        </Col>
      </Row>

      {/* 自动刷新提示 */}
      <div style={{ textAlign: 'center', marginTop: 16, color: '#999', fontSize: 12 }}>
        页面每 5 秒自动刷新
      </div>
    </div>
  )
}
