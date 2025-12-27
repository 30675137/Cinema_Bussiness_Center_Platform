/**
 * @spec O001-product-order-list
 * 订单列表页面 - User Story 1 & 2
 */

import React from 'react'
import { Card, message, Space, Typography } from 'antd'
import { OrderList } from '../../features/order-management/components/OrderList'
import { OrderFilter, type OrderFilterValues } from '../../features/order-management/components/OrderFilter'
import { useOrders, useOrderQueryParams } from '../../features/order-management/hooks/useOrders'
import dayjs from 'dayjs'

const { Title } = Typography

/**
 * 订单列表页面
 *
 * 功能:
 * - 展示商品订单列表 (US1)
 * - 支持分页查看 (US1)
 * - 订单按创建时间倒序排列 (US1)
 * - 每页默认显示 20 条记录 (US1)
 * - 支持点击订单号跳转到详情页 (US1)
 * - 支持多维度筛选（状态、时间范围、搜索） (US2)
 * - 默认显示最近30天订单 (US2)
 * - 筛选条件同步到 URL (US2)
 *
 * User Story: US1 - B端订单列表查看, US2 - 订单多维度筛选
 */
const OrderListPage: React.FC = () => {
  // 从 URL 同步查询参数
  const [queryParams, updateQueryParams] = useOrderQueryParams()

  // 设置默认时间范围（最近30天）
  React.useEffect(() => {
    if (!queryParams.startDate && !queryParams.endDate) {
      const startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD')
      const endDate = dayjs().format('YYYY-MM-DD')
      updateQueryParams({ startDate, endDate })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 使用 TanStack Query 查询订单列表
  const { data, isLoading, isError, error } = useOrders(queryParams)

  // 错误处理
  React.useEffect(() => {
    if (isError && error) {
      message.error(error.message || '加载订单列表失败，请稍后重试')
    }
  }, [isError, error])

  // 筛选处理
  const handleFilter = (values: OrderFilterValues) => {
    const { status, dateRange, search } = values

    updateQueryParams({
      status,
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      search,
      page: 1 // 筛选时重置到第一页
    })
  }

  // 重置处理
  const handleReset = () => {
    const startDate = dayjs().subtract(30, 'days').format('YYYY-MM-DD')
    const endDate = dayjs().format('YYYY-MM-DD')

    updateQueryParams({
      status: undefined,
      startDate,
      endDate,
      search: undefined,
      page: 1,
      pageSize: 20
    })
  }

  // 分页变化处理
  const handlePaginationChange = (page: number, pageSize: number) => {
    updateQueryParams({ page, pageSize })
  }

  // 准备筛选组件的默认值
  const filterDefaultValues: OrderFilterValues = {
    status: queryParams.status,
    dateRange: queryParams.startDate && queryParams.endDate
      ? [dayjs(queryParams.startDate), dayjs(queryParams.endDate)]
      : [dayjs().subtract(30, 'days'), dayjs()],
    search: queryParams.search
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 页面标题 */}
        <Card>
          <Title level={2}>订单列表</Title>
        </Card>

        {/* 筛选表单 (User Story 2) */}
        <Card>
          <OrderFilter
            onFilter={handleFilter}
            onReset={handleReset}
            defaultValues={filterDefaultValues}
            loading={isLoading}
          />
        </Card>

        {/* 订单列表表格 */}
        <Card>
          <OrderList
            data={data?.data || []}
            total={data?.total || 0}
            page={queryParams.page || 1}
            pageSize={queryParams.pageSize || 20}
            loading={isLoading}
            onPaginationChange={handlePaginationChange}
          />
        </Card>
      </Space>
    </div>
  )
}

export default OrderListPage
