/**
 * 通用数据表格组件
 */

import React from 'react';
import { Table, TableProps, Card, Typography, Space, Button } from 'antd';
import { ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

export interface DataTableProps<T = any> extends Omit<TableProps<T>, 'dataSource' | 'columns'> {
  /** 表格标题 */
  title?: string;
  /** 数据源 */
  data: T[];
  /** 表格列配置 */
  columns: ColumnsType<T>;
  /** 是否显示标题栏 */
  showHeader?: boolean;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示卡片容器 */
  showCard?: boolean;
  /** 刷新函数 */
  onRefresh?: () => void;
  /** 导出函数 */
  onExport?: () => void;
  /** 加载状态 */
  loading?: boolean;
  /** 分页配置 */
  pagination?: any;
  /** 卡片额外操作 */
  extra?: React.ReactNode;
}

/**
 * 通用数据表格组件
 */
const DataTable = <T extends Record<string, any>>({
  title,
  data,
  columns,
  showHeader = true,
  showToolbar = true,
  showCard = true,
  onRefresh,
  onExport,
  loading = false,
  pagination,
  extra,
  ...tableProps
}: DataTableProps<T>) => {
  /**
   * 刷新处理
   */
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  /**
   * 导出处理
   */
  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  /**
   * 工具栏
   */
  const toolbar = showToolbar ? (
    <div className="data-table-toolbar">
      <Space>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          刷新
        </Button>
        {onExport && (
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>
        )}
        {extra}
      </Space>
    </div>
  ) : null;

  /**
   * 表格内容
   */
  const tableContent = (
    <Table
      {...tableProps}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={
        pagination !== false
          ? {
              total: data.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              ...pagination,
            }
          : false
      }
      rowKey="id"
      scroll={{ x: 1000 }}
    />
  );

  /**
   * 标题栏
   */
  const header = showHeader && title ? (
    <div className="data-table-header">
      <Title level={4}>{title}</Title>
    </div>
  ) : null;

  // 如果不显示卡片包装，直接返回表格
  if (!showCard) {
    return (
      <div className="data-table">
        {header}
        {toolbar}
        {tableContent}
      </div>
    );
  }

  // 包装在卡片中
  return (
    <Card className="data-table-card">
      {header}
      {toolbar}
      {tableContent}
    </Card>
  );
};

export default DataTable;