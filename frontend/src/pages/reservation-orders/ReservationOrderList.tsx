/**
 * 预约单管理列表页
 *
 * B端运营平台预约单管理的主入口页面
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Card, Table, Button, Space, Empty, Typography, message } from 'antd'
import { EyeOutlined, CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'

import { useReservationOrders } from './hooks/useReservationOrders'
import OrderStatusBadge, { canConfirm, canCancel } from './components/OrderStatusBadge'
import OrderFilters from './components/OrderFilters'
import type {
  ReservationListItem,
  ReservationListQueryRequest,
  ReservationFilterFormValues,
  ReservationStatus,
} from './types/reservation-order.types'

const { Title } = Typography

/**
 * 预约单管理列表页
 */
const ReservationOrderList: React.FC = () => {
  const navigate = useNavigate()

  // 查询参数状态
  const [queryParams, setQueryParams] = useState<ReservationListQueryRequest>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  })

  // 获取列表数据
  const { data, isLoading, error, refetch } = useReservationOrders(queryParams)

  /**
   * 处理筛选条件变更
   */
  const handleFilterChange = useCallback((filters: ReservationFilterFormValues) => {
    setQueryParams((prev: ReservationListQueryRequest) => ({
      ...prev,
      page: 0, // 重置到第一页
      orderNumber: filters.orderNumber,
      contactPhone: filters.orderNumber, // 同时搜索手机号
      statuses: filters.statuses as ReservationStatus[] | undefined,
      reservationDateStart: filters.dateRange?.[0]
        ? dayjs(filters.dateRange[0]).format('YYYY-MM-DD')
        : undefined,
      reservationDateEnd: filters.dateRange?.[1]
        ? dayjs(filters.dateRange[1]).format('YYYY-MM-DD')
        : undefined,
    }))
  }, [])

  /**
   * 处理分页变更
   */
  const handleTableChange = useCallback(
    (pagination: TablePaginationConfig) => {
      setQueryParams((prev: ReservationListQueryRequest) => ({
        ...prev,
        page: (pagination.current || 1) - 1,
        size: pagination.pageSize || 20,
      }))
    },
    []
  )

  /**
   * 查看详情
   */
  const handleViewDetail = useCallback(
    (id: string) => {
      navigate(`/reservation-orders/${id}`)
    },
    [navigate]
  )

  /**
   * 刷新列表
   */
  const handleRefresh = useCallback(() => {
    refetch()
    message.success('列表已刷新')
  }, [refetch])

  /**
   * 表格列配置
   */
  const columns: ColumnsType<ReservationListItem> = useMemo(
    () => [
      {
        title: '预约单号',
        dataIndex: 'orderNumber',
        key: 'orderNumber',
        width: 180,
        fixed: 'left' as const,
        render: (text: string, record) => (
          <a onClick={() => handleViewDetail(record.id)}>{text}</a>
        ),
      },
      {
        title: '联系人',
        dataIndex: 'contactName',
        key: 'contactName',
        width: 100,
      },
      {
        title: '手机号',
        dataIndex: 'contactPhone',
        key: 'contactPhone',
        width: 130,
      },
      {
        title: '场景包',
        dataIndex: 'scenarioPackageName',
        key: 'scenarioPackageName',
        width: 150,
        ellipsis: true,
      },
      {
        title: '套餐',
        dataIndex: 'packageTierName',
        key: 'packageTierName',
        width: 120,
        ellipsis: true,
      },
      {
        title: '预订日期',
        dataIndex: 'reservationDate',
        key: 'reservationDate',
        width: 110,
      },
      {
        title: '预订时段',
        key: 'timeSlot',
        width: 120,
        render: (_, record) =>
          `${record.reservationTime} - ${record.reservationEndTime}`,
      },
      {
        title: '金额',
        dataIndex: 'totalAmount',
        key: 'totalAmount',
        width: 100,
        align: 'right' as const,
        render: (amount: number) => `¥${amount?.toFixed(2) || '0.00'}`,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: ReservationStatus) => (
          <OrderStatusBadge status={status} />
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 160,
        render: (text: string) =>
          text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
      },
      {
        title: '操作',
        key: 'action',
        width: 120,
        fixed: 'right' as const,
        render: (_, record) => (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.id)}
            >
              详情
            </Button>
          </Space>
        ),
      },
    ],
    [handleViewDetail]
  )

  // 错误处理
  if (error) {
    return (
      <Card>
        <Empty
          description={`加载失败: ${error.message}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={() => refetch()}>
            重试
          </Button>
        </Empty>
      </Card>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          预约单管理
        </Title>
      </div>

      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <OrderFilters
          onFilterChange={handleFilterChange}
          loading={isLoading}
        />
      </Card>

      {/* 列表区域 */}
      <Card
        title="预约单列表"
        extra={
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.content || []}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1400 }}
          pagination={{
            current: (queryParams.page || 0) + 1,
            pageSize: queryParams.size || 20,
            total: data?.totalElements || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: (
              <Empty
                description="暂无预约单"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>
    </div>
  )
}

export default ReservationOrderList
