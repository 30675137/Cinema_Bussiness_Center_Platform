/**
 * P004-inventory-adjustment: 列表骨架屏组件
 *
 * 为库存和调整列表提供加载状态的骨架屏显示。
 * 实现 T064 任务。
 *
 * @since Phase 8 - Polish
 */

import React from 'react';
import { Skeleton, Card, Space, Row, Col } from 'antd';

/**
 * 表格骨架屏属性
 */
export interface TableSkeletonProps {
  /** 行数 */
  rows?: number;
  /** 列数 */
  columns?: number;
  /** 是否显示标题行 */
  showHeader?: boolean;
}

/**
 * 表格骨架屏
 */
export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 6,
  showHeader = true,
}) => {
  return (
    <div className="table-skeleton" data-testid="table-skeleton">
      {/* 表头骨架 */}
      {showHeader && (
        <div
          style={{
            display: 'flex',
            gap: 16,
            padding: '12px 16px',
            background: '#fafafa',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton.Input
              key={`header-${i}`}
              active
              size="small"
              style={{ width: i === 0 ? 80 : 100 }}
            />
          ))}
        </div>
      )}

      {/* 表格行骨架 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          style={{
            display: 'flex',
            gap: 16,
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton.Input
              key={`cell-${rowIndex}-${colIndex}`}
              active
              size="small"
              style={{ width: colIndex === 0 ? 120 : 80 + Math.random() * 40 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * 卡片骨架屏属性
 */
export interface CardSkeletonProps {
  /** 卡片数量 */
  count?: number;
  /** 每行显示数量 */
  columns?: number;
}

/**
 * 卡片列表骨架屏
 */
export const CardListSkeleton: React.FC<CardSkeletonProps> = ({ count = 6, columns = 3 }) => {
  return (
    <Row gutter={[16, 16]} data-testid="card-list-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <Col key={index} span={24 / columns}>
          <Card>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

/**
 * 详情骨架屏
 */
export const DetailSkeleton: React.FC = () => {
  return (
    <div data-testid="detail-skeleton">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 标题 */}
        <Skeleton.Input active style={{ width: 200 }} />

        {/* 描述列表 */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={{ display: 'flex', gap: 16 }}>
            <Skeleton.Input active size="small" style={{ width: 80 }} />
            <Skeleton.Input active size="small" style={{ width: 150 }} />
          </div>
        ))}

        {/* 分隔线 */}
        <div style={{ height: 1, background: '#f0f0f0', margin: '16px 0' }} />

        {/* 更多内容 */}
        <Skeleton active paragraph={{ rows: 3 }} />
      </Space>
    </div>
  );
};

/**
 * 审批列表骨架屏
 */
export const ApprovalListSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div data-testid="approval-list-skeleton">
      {Array.from({ length: rows }).map((_, index) => (
        <Card key={index} style={{ marginBottom: 16 }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div style={{ flex: 1 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Skeleton.Input active style={{ width: 200 }} />
                <Skeleton.Input active size="small" style={{ width: 300 }} />
                <Skeleton.Input active size="small" style={{ width: 150 }} />
              </Space>
            </div>
            <Space>
              <Skeleton.Button active size="small" />
              <Skeleton.Button active size="small" />
            </Space>
          </div>
        </Card>
      ))}
    </div>
  );
};

/**
 * 流水列表骨架屏
 */
export const TransactionListSkeleton: React.FC<{ rows?: number }> = ({ rows = 8 }) => {
  return (
    <div data-testid="transaction-list-skeleton">
      <TableSkeleton rows={rows} columns={5} />
    </div>
  );
};

/**
 * 统计卡片骨架屏
 */
export const StatisticsSkeleton: React.FC = () => {
  return (
    <Row gutter={16} data-testid="statistics-skeleton">
      {Array.from({ length: 4 }).map((_, index) => (
        <Col key={index} span={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Skeleton.Input active size="small" style={{ width: 80 }} />
              <Skeleton.Input active style={{ width: 120, height: 32 }} />
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default {
  TableSkeleton,
  CardListSkeleton,
  DetailSkeleton,
  ApprovalListSkeleton,
  TransactionListSkeleton,
  StatisticsSkeleton,
};
