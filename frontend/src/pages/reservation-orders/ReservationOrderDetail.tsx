/**
 * 预约单详情页
 *
 * B端预约单管理详情页面
 */

import React, { useState, useCallback } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Descriptions,
  Table,
  Timeline,
  Spin,
  Empty,
  Divider,
  Row,
  Col,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

import { useReservationDetail } from './hooks/useReservationDetail'
import OrderStatusBadge, { canConfirm, canCancel } from './components/OrderStatusBadge'
import ConfirmOrderModal from './components/ConfirmOrderModal'
import CancelOrderModal from './components/CancelOrderModal'
import type {
  ReservationItem,
  OperationLog,
} from './types/reservation-order.types'
import { OPERATION_TYPE_CONFIG } from './types/reservation-order.types'

const { Title, Text } = Typography

/**
 * 预约单详情页
 */
const ReservationOrderDetail: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // 获取详情数据
  const { data: order, isLoading, error, refetch } = useReservationDetail(id)

  // 对话框状态
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  /**
   * 返回列表
   */
  const handleBack = useCallback(() => {
    navigate('/reservation-orders')
  }, [navigate])

  /**
   * 刷新详情
   */
  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  /**
   * 打开确认对话框
   */
  const handleOpenConfirm = useCallback(() => {
    setConfirmModalOpen(true)
  }, [])

  /**
   * 打开取消对话框
   */
  const handleOpenCancel = useCallback(() => {
    setCancelModalOpen(true)
  }, [])

  /**
   * 加购项表格列
   */
  const itemColumns: ColumnsType<ReservationItem> = [
    {
      title: '加购项名称',
      dataIndex: 'addonItemName',
      key: 'addonItemName',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) => `¥${price?.toFixed(2) || '0.00'}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right' as const,
      render: (price: number) => `¥${price?.toFixed(2) || '0.00'}`,
    },
  ]

  // 加载中
  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  // 错误
  if (error || !order) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Empty
            description={error?.message || '预约单不存在'}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={handleBack}>
              返回列表
            </Button>
          </Empty>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回列表
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            预约单详情
          </Title>
        </Space>

        {/* 操作按钮 */}
        <Space>
          {canConfirm(order.status) && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleOpenConfirm}
            >
              确认预约
            </Button>
          )}
          {canCancel(order.status) && (
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={handleOpenCancel}
            >
              取消预约
            </Button>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧主要信息 */}
        <Col xs={24} lg={16}>
          {/* 基本信息卡片 */}
          <Card title="基本信息" style={{ marginBottom: 24 }}>
            <Descriptions column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="预约单号">
                <Text strong copyable>{order.orderNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <OrderStatusBadge status={order.status} />
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {order.createdAt
                  ? dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {order.updatedAt
                  ? dayjs(order.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="是否需要支付">
                {order.requiresPayment ? '是' : '否'}
              </Descriptions.Item>
              <Descriptions.Item label="总金额">
                <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                  ¥{order.totalAmount?.toFixed(2) || '0.00'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 场景包信息卡片 */}
          <Card title="预约信息" style={{ marginBottom: 24 }}>
            <Descriptions column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="场景包">
                {order.scenarioPackageName}
              </Descriptions.Item>
              <Descriptions.Item label="套餐">
                {order.packageTierName}
              </Descriptions.Item>
              <Descriptions.Item label="预订日期">
                {order.reservationDate}
              </Descriptions.Item>
              <Descriptions.Item label="预订时段">
                {order.reservationTime} - {order.reservationEndTime}
              </Descriptions.Item>
            </Descriptions>

            {/* 加购项列表 */}
            {order.items && order.items.length > 0 && (
              <>
                <Divider>加购项明细</Divider>
                <Table
                  columns={itemColumns}
                  dataSource={order.items}
                  rowKey="id"
                  size="small"
                  pagination={false}
                />
              </>
            )}
          </Card>

          {/* 联系人信息卡片 */}
          <Card title="联系人信息" style={{ marginBottom: 24 }}>
            <Descriptions column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="联系人姓名">
                {order.contactName}
              </Descriptions.Item>
              <Descriptions.Item label="联系人手机">
                <Text copyable>{order.contactPhone}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {order.remark || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 取消信息（如果已取消） */}
          {order.status === 'CANCELLED' && order.cancelReason && (
            <Card title="取消信息" style={{ marginBottom: 24 }}>
              <Descriptions column={1}>
                <Descriptions.Item label="取消时间">
                  {order.cancelledAt
                    ? dayjs(order.cancelledAt).format('YYYY-MM-DD HH:mm:ss')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="取消原因">
                  {order.cancelReason}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* 右侧操作日志 */}
        <Col xs={24} lg={8}>
          <Card title="操作日志">
            {order.operationLogs && order.operationLogs.length > 0 ? (
              <Timeline>
                {order.operationLogs.map((log: OperationLog) => (
                  <Timeline.Item
                    key={log.id}
                    dot={<ClockCircleOutlined style={{ fontSize: 16 }} />}
                  >
                    <div>
                      <Text strong>
                        {OPERATION_TYPE_CONFIG[log.operationType]?.label ||
                          log.operationType}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {log.operatedAt
                          ? dayjs(log.operatedAt).format('YYYY-MM-DD HH:mm:ss')
                          : '-'}
                      </Text>
                    </div>
                    {log.operatorName && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          操作人: {log.operatorName}
                        </Text>
                      </div>
                    )}
                    {log.reason && (
                      <div style={{ marginTop: 4 }}>
                        <Text style={{ fontSize: 12 }}>{log.reason}</Text>
                      </div>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Empty
                description="暂无操作日志"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 确认预约对话框 */}
      <ConfirmOrderModal
        open={confirmModalOpen}
        orderId={order.id}
        onClose={() => setConfirmModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* 取消预约对话框 */}
      <CancelOrderModal
        open={cancelModalOpen}
        orderId={order.id}
        onClose={() => setCancelModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  )
}

export default ReservationOrderDetail
