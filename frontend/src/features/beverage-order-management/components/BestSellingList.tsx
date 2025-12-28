/**
 * @spec O003-beverage-order
 * 热销饮品排行榜组件 (B端)
 *
 * US3: FR-022 - 热销饮品排行展示
 */
import React from 'react'
import { Card, Typography, List, Tag, Progress, Empty, Spin } from 'antd'
import { TrophyOutlined } from '@ant-design/icons'
import type { BestSellingItem } from '../types/statistics'

const { Title, Text } = Typography

/**
 * BestSellingList 组件属性
 */
interface BestSellingListProps {
  /**
   * 热销商品数据列表
   */
  items: BestSellingItem[]

  /**
   * 加载状态
   */
  loading?: boolean

  /**
   * 标题（默认"热销饮品排行"）
   */
  title?: string

  /**
   * 显示数量限制（默认显示全部）
   */
  limit?: number
}

/**
 * 热销饮品排行榜组件
 *
 * 功能：
 * - 显示 Top N 饮品排行
 * - 展示销量、销售额、占比
 * - 排名徽章和进度条可视化
 *
 * @param props 组件属性
 * @returns 热销饮品列表
 */
export const BestSellingList: React.FC<BestSellingListProps> = ({
  items,
  loading = false,
  title = '热销饮品排行',
  limit,
}) => {
  // 限制显示数量
  const displayItems = limit ? items.slice(0, limit) : items

  // 排名徽章颜色
  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return '#cd7f32' // bronze
    return '#8c8c8c'
  }

  // 排名图标
  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <TrophyOutlined style={{ color: getRankColor(rank), fontSize: '20px' }} />
    }
    return null
  }

  if (loading) {
    return (
      <Card>
        <Title level={4}>{title}</Title>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (items.length === 0) {
    return (
      <Card>
        <Title level={4}>{title}</Title>
        <Empty description="暂无销售数据" />
      </Card>
    )
  }

  return (
    <Card>
      <Title level={4}>{title}</Title>

      <List
        dataSource={displayItems}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '16px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div style={{ width: '100%' }}>
              {/* 排名和饮品名称 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getRankIcon(item.rank) || (
                    <Tag
                      color="default"
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {item.rank}
                    </Tag>
                  )}
                </div>

                <Text
                  strong
                  style={{
                    fontSize: '16px',
                    flex: 1,
                    marginLeft: '12px',
                  }}
                >
                  {item.beverageName}
                </Text>

                <Tag color="blue">
                  {item.percentage.toFixed(1)}% 占比
                </Tag>
              </div>

              {/* 销量和销售额 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  paddingLeft: '52px',
                }}
              >
                <Text type="secondary">销量: {item.quantity} 杯</Text>
                <Text type="secondary">销售额: ¥{item.revenue.toFixed(2)}</Text>
              </div>

              {/* 占比进度条 */}
              <div style={{ paddingLeft: '52px' }}>
                <Progress
                  percent={parseFloat(item.percentage.toFixed(1))}
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#52c41a',
                  }}
                  showInfo={false}
                />
              </div>
            </div>
          </List.Item>
        )}
      />

      {limit && items.length > limit && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Text type="secondary">
            显示前 {limit} 名，共 {items.length} 个商品
          </Text>
        </div>
      )}
    </Card>
  )
}

export default BestSellingList
