import React, { useState } from 'react';
import {
  Table,
  TableProps,
  Pagination,
  PaginationProps,
  Row,
  Col,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Form,
  Tooltip,
} from 'antd';
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';

export interface DataTableProps<T = any> extends TableProps<T> {
  // 搜索相关
  searchable?: boolean;
  searchFields?: Array<{
    name: string;
    label: string;
    type: 'input' | 'select' | 'dateRange';
    placeholder?: string;
    options?: Array<{ label: string; value: any }>;
    width?: number;
  }>;
  onSearch?: (values: Record<string, any>) => void;
  onReset?: () => void;

  // 分页相关
  pagination?: boolean | PaginationProps;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  onPaginationChange?: (page: number, pageSize: number) => void;

  // 工具栏
  showToolbar?: boolean;
  extraButtons?: React.ReactNode;
  onExport?: () => void;
  onRefresh?: () => void;

  // 数据相关
  loading?: boolean;
  dataSource: T[];
  total?: number;
  current?: number;
  pageSize?: number;

  // 其他
  rowKey?: string | ((record: T) => string);
  scroll?: { x?: number; y?: number };
  size?: 'small' | 'middle' | 'large';
}

const DataTable = <T extends Record<string, any>>({
  searchable = true,
  searchFields = [],
  onSearch,
  onReset,
  pagination = true,
  showSizeChanger = true,
  showQuickJumper = true,
  onPaginationChange,
  showToolbar = true,
  extraButtons,
  onExport,
  onRefresh,
  loading = false,
  dataSource,
  total,
  current = 1,
  pageSize = 20,
  rowKey = 'id',
  scroll,
  size = 'middle',
  columns,
  ...tableProps
}: DataTableProps<T>) => {
  const [searchForm] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  // 渲染搜索字段
  const renderSearchField = (field: any) => {
    switch (field.type) {
      case 'input':
        return (
          <Input
            placeholder={field.placeholder}
            allowClear
            style={{ width: field.width || 200 }}
          />
        );
      case 'select':
        return (
          <Select
            placeholder={field.placeholder}
            allowClear
            style={{ width: field.width || 150 }}
            options={field.options}
          />
        );
      case 'dateRange':
        return (
          <DatePicker.RangePicker
            style={{ width: field.width || 250 }}
            placeholder={['开始日期', '结束日期']}
          />
        );
      default:
        return null;
    }
  };

  // 处理搜索
  const handleSearch = () => {
    const values = searchForm.getFieldsValue();
    // 处理日期范围
    if (values.dateRange) {
      values.startDate = values.dateRange[0]?.format('YYYY-MM-DD');
      values.endDate = values.dateRange[1]?.format('YYYY-MM-DD');
      delete values.dateRange;
    }
    onSearch?.(values);
  };

  // 处理重置
  const handleReset = () => {
    searchForm.resetFields();
    onReset?.();
  };

  // 处理分页变化
  const handlePaginationChange = (page: number, size: number) => {
    onPaginationChange?.(page, size);
  };

  // 分页配置
  const paginationConfig: PaginationProps = pagination === true ? {
    current,
    pageSize,
    total,
    showSizeChanger,
    showQuickJumper,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    onChange: handlePaginationChange,
    onShowSizeChange: handlePaginationChange,
  } : pagination as PaginationProps;

  return (
    <div className="data-table">
      {/* 搜索区域 */}
      {searchable && searchFields.length > 0 && (
        <div className="table-search mb-4">
          <Form
            form={searchForm}
            layout="inline"
            onFinish={handleSearch}
            className="search-form"
          >
            <Row gutter={[16, 16]} style={{ width: '100%' }}>
              {searchFields.slice(0, expanded ? searchFields.length : 3).map((field) => (
                <Col key={field.name}>
                  <Form.Item name={field.name} label={field.label}>
                    {renderSearchField(field)}
                  </Form.Item>
                </Col>
              ))}
              <Col>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                  <Button onClick={handleReset}>
                    重置
                  </Button>
                  {searchFields.length > 3 && (
                    <Button
                      type="link"
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? '收起' : '展开'}
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Form>
        </div>
      )}

      {/* 工具栏 */}
      {showToolbar && (
        <div className="table-toolbar mb-4">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                {extraButtons}
              </Space>
            </Col>
            <Col>
              <Space>
                {onRefresh && (
                  <Tooltip title="刷新">
                    <Button icon={<ReloadOutlined />} onClick={onRefresh} />
                  </Tooltip>
                )}
                {onExport && (
                  <Tooltip title="导出">
                    <Button icon={<ExportOutlined />} onClick={onExport}>
                      导出
                    </Button>
                  </Tooltip>
                )}
              </Space>
            </Col>
          </Row>
        </div>
      )}

      {/* 表格 */}
      <Table<T>
        {...tableProps}
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey={rowKey}
        scroll={scroll}
        size={size}
        pagination={pagination ? paginationConfig : false}
        bordered
      />
    </div>
  );
};

export default DataTable;