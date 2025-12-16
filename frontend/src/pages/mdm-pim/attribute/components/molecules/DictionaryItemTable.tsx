/**
 * DictionaryItemTable Component (Molecule)
 *
 * Table component for displaying dictionary items with:
 * - Search functionality (300ms debounce per FR-006)
 * - Status filter
 * - Enable/disable toggle
 * - Edit/delete actions
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Table, Input, Select, Space, Button, Popconfirm, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDebounce } from '@/hooks/useDebounce';
import AttributeStatusTag from '../atoms/AttributeStatusTag';
import type { DictionaryItem } from '@/features/attribute-dictionary/types';
import { useDictionaryItemsQuery } from '../../hooks/useDictionaryQueries';
import { useToggleDictionaryItemStatusMutation, useDeleteDictionaryItemMutation } from '../../hooks/useDictionaryMutations';

const { Search } = Input;
const { Option } = Select;

interface DictionaryItemTableProps {
  typeId: string;
  onEdit?: (item: DictionaryItem) => void;
  onDelete?: (item: DictionaryItem) => void;
}

/**
 * Table component for dictionary items
 */
const DictionaryItemTable: React.FC<DictionaryItemTableProps> = ({
  typeId,
  onEdit,
  onDelete,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Debounce search keyword (300ms per FR-006)
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300);

  // Query parameters
  const queryParams = useMemo(() => {
    const params: { status?: 'active' | 'inactive'; keyword?: string } = {};
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    if (debouncedSearchKeyword) {
      params.keyword = debouncedSearchKeyword;
    }
    return params;
  }, [statusFilter, debouncedSearchKeyword]);

  // Fetch items
  const { data: items = [], isLoading, refetch } = useDictionaryItemsQuery(
    typeId,
    queryParams,
    {
      enabled: !!typeId,
    }
  );

  // Mutations
  const toggleStatusMutation = useToggleDictionaryItemStatusMutation();
  const deleteMutation = useDeleteDictionaryItemMutation();

  // Filter items client-side for search (if API doesn't support keyword)
  const filteredItems = useMemo(() => {
    if (!debouncedSearchKeyword) {
      return items;
    }
    const keyword = debouncedSearchKeyword.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword) ||
        (item.remark && item.remark.toLowerCase().includes(keyword))
    );
  }, [items, debouncedSearchKeyword]);

  // Handle status toggle
  const handleToggleStatus = useCallback(
    async (item: DictionaryItem) => {
      try {
        const newStatus = item.status === 'active' ? 'inactive' : 'active';
        await toggleStatusMutation.mutateAsync({
          id: item.id,
          typeId: item.typeId,
          newStatus,
        });
      } catch (error) {
        // Error is handled by mutation hook
      }
    },
    [toggleStatusMutation]
  );

  // Handle delete
  const handleDelete = useCallback(
    async (item: DictionaryItem) => {
      try {
        await deleteMutation.mutateAsync({
          id: item.id,
          typeId: item.typeId,
        });
        onDelete?.(item);
      } catch (error) {
        // Error is handled by mutation hook
      }
    },
    [deleteMutation, onDelete]
  );

  // Table columns
  const columns: ColumnsType<DictionaryItem> = [
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '启用', value: 'active' },
        { text: '停用', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: 'active' | 'inactive') => <AttributeStatusTag status={status} />,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 100,
      sorter: (a, b) => a.sort - b.sort,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: DictionaryItem) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record)}
            loading={toggleStatusMutation.isPending}
          >
            {record.status === 'active' ? '停用' : '启用'}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit?.(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个字典项吗？"
            description="删除后无法恢复"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Search and Filter Bar */}
      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Search
          placeholder="搜索名称、编码或备注"
          allowClear
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="状态筛选"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          allowClear
        >
          <Option value="all">全部</Option>
          <Option value="active">启用</Option>
          <Option value="inactive">停用</Option>
        </Select>
      </Space>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: filteredItems.length,
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default DictionaryItemTable;


