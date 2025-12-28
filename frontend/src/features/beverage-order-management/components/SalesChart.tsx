/**
 * @spec O003-beverage-order
 * 销售图表组件 (B端)
 *
 * US3: FR-022 - 订单数量和销售额可视化展示
 */
import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, Typography, Spin } from 'antd'
import type { OrderMetrics, SalesMetrics, DateRangeDTO } from '../types/statistics'

const { Title } = Typography

/**
 * SalesChart 组件属性
 */
interface SalesChartProps {
  /**
   * 时间范围信息
   */
  dateRange: DateRangeDTO

  /**
   * 订单指标数据
   */
  orderMetrics: OrderMetrics

  /**
   * 销售指标数据
   */
  salesMetrics: SalesMetrics

  /**
   * 加载状态
   */
  loading?: boolean
}

/**
 * 销售图表组件
 *
 * 功能：
 * - 显示订单数量柱状图
 * - 显示销售额趋势
 * - 完成率、平均客单价等关键指标
 *
 * @param props 组件属性
 * @returns 销售图表
 */
export const SalesChart: React.FC<SalesChartProps> = ({
  dateRange,
  orderMetrics,
  salesMetrics,
  loading = false,
}) => {
  // 构建图表数据
  const chartData = [
    {
      name: '订单数量',
      总订单: orderMetrics.totalOrders,
      已完成: orderMetrics.completedOrders,
      已取消: orderMetrics.cancelledOrders,
    },
  ]

  const rangeTypeLabel = {
    TODAY: '今日',
    WEEK: '本周',
    MONTH: '本月',
    CUSTOM: '自定义',
  }[dateRange.rangeType]

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <Title level={4}>
        {rangeTypeLabel}销售数据
        <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '16px', color: '#8c8c8c' }}>
          {dateRange.startDate} 至 {dateRange.endDate}
        </span>
      </Title>

      {/* 关键指标 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="stat-card">
          <div className="stat-label">销售总额</div>
          <div className="stat-value" style={{ color: '#52c41a' }}>
            ¥{salesMetrics.totalRevenue.toFixed(2)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">总销量</div>
          <div className="stat-value" style={{ color: '#1890ff' }}>
            {salesMetrics.totalQuantity} 杯
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">平均客单价</div>
          <div className="stat-value" style={{ color: '#faad14' }}>
            ¥{salesMetrics.averageOrderValue.toFixed(2)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">订单完成率</div>
          <div className="stat-value" style={{ color: '#13c2c2' }}>
            {orderMetrics.completionRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 订单数量柱状图 */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="总订单" fill="#1890ff" />
          <Bar dataKey="已完成" fill="#52c41a" />
          <Bar dataKey="已取消" fill="#ff4d4f" />
        </BarChart>
      </ResponsiveContainer>

      <style>{`
        .stat-card {
          padding: 16px;
          background: #fafafa;
          border-radius: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #8c8c8c;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
        }
      `}</style>
    </Card>
  )
}

export default SalesChart
