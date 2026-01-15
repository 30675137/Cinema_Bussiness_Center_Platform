import React, { useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, message, Popconfirm, Card } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSPUStore } from '../../../stores/spuStore';
import { useCategoryStore } from '../../../stores/categoryStore';
import { useBrandStore } from '../../../stores/brandStore';
import { spuAPI } from '../../../services/spuService';
import { categoryAPI } from '../../../services/categoryService';
import { brandAPI } from '../../../services/brandService';
import { SPUColumnsGenerator } from './columns';
import { SPUFilters } from './filters';
import { SPUItem } from '../../../types/spu';

interface SPUListProps {
  onEdit?: (record: SPUItem) => void;
  onView?: (record: SPUItem) => void;
  onCopy?: (record: SPUItem) => void;
}

const SPUList: React.FC<SPUListProps> = ({ onEdit, onView, onCopy }) => {
  const navigate = useNavigate();

  // Zustand stores
  const {
    items,
    loading,
    pagination,
    filters,
    selectedRowKeys,
    setLoading,
    setError,
    setItems,
    setPagination,
    setFilters,
    setSelectedRowKeys,
    removeItems,
  } = useSPUStore();

  const { items: categories, setItems: setCategories } = useCategoryStore();
  const { items: brands, setItems: setBrands } = useBrandStore();

  // 加载分类和品牌数据
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryAPI.getCategories,
    onSuccess: (data) => setCategories(data.data),
    onError: (error: any) => {
      console.error('加载分类失败:', error);
      message.error('加载分类数据失败');
    },
  });

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: brandAPI.getBrands,
    onSuccess: (data) => setBrands(data.data),
    onError: (error: any) => {
      console.error('加载品牌失败:', error);
      message.error('加载品牌数据失败');
    },
  });

  // 加载 SPU 列表
  const { data: spuData, refetch: refetchSPUList } = useQuery({
    queryKey: ['spuList', pagination.current, pagination.pageSize, filters],
    queryFn: () =>
      spuAPI.getSPUList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        filters,
      }),
    onSuccess: (data) => {
      setItems(data.data.list);
      setPagination({
        current: data.data.pagination.current,
        pageSize: data.data.pagination.pageSize,
        total: data.data.pagination.total,
      });
    },
    onError: (error: any) => {
      setError('list', error.message || '加载列表失败');
      message.error('加载SPU列表失败');
    },
  });

  // 生成表格列
  const columns = SPUColumnsGenerator({
    onEdit: onEdit || ((record) => navigate(`/spu/edit/${record.id}`)),
    onView: onView || ((record) => navigate(`/spu/detail/${record.id}`)),
    onCopy: onCopy || ((record) => navigate(`/spu/create?copyId=${record.id}`)),
    categories: categoriesData?.data || [],
    brands: brandsData?.data || [],
  });

  // 搜索处理
  const handleSearch = (keyword: string) => {
    setFilters({ keyword });
    setPagination({ current: 1 });
  };

  // 筛选处理
  const handleFilter = (key: string, value: any) => {
    setFilters({ [key]: value });
    setPagination({ current: 1 });
  };

  // 分页处理
  const handleTableChange = (page: number, pageSize?: number) => {
    setPagination({
      current: page,
      ...(pageSize && { pageSize }),
    });
  };

  // 行选择
  const handleRowSelect = (selectedRowKeys: string[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  // 操作函数
  const handleCreate = () => {
    navigate('/spu/create');
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的SPU');
      return;
    }

    try {
      setLoading('delete', true);
      await spuAPI.batchDeleteSPU(selectedRowKeys);
      message.success(`成功删除${selectedRowKeys.length}个SPU`);
      setSelectedRowKeys([]);
      refetchSPUList();
    } catch (error: any) {
      message.error(error.message || '批量删除失败');
    } finally {
      setLoading('delete', false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await spuAPI.exportSPU({
        filters,
        format: 'excel',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SPU数据_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      message.success('导出成功');
    } catch (error: any) {
      message.error('导出失败');
    }
  };

  return (
    <div className="spu-list p-6">
      {/* 搜索和筛选区域 */}
      <SPUFilters
        categories={categoriesData?.data || []}
        brands={brandsData?.data || []}
        filters={filters}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onReset={() => {
          setFilters({});
          setPagination({ current: 1 });
        }}
      />

      {/* 操作按钮 */}
      <Card className="mb-4">
        <div className="flex justify-between items-center">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建 SPU
            </Button>

            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title="确认删除"
                description={`确定要删除选中的${selectedRowKeys.length}个SPU吗？`}
                onConfirm={handleBatchDelete}
                okText="确认"
                cancelText="取消"
              >
                <Button danger loading={loading.delete}>
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
          </Space>

          <Button icon={<ExportOutlined />} onClick={handleExport}>
            导出数据
          </Button>
        </div>
      </Card>

      {/* 表格 */}
      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={items}
          loading={loading.list}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: handleTableChange,
            onShowSizeChange: (current, size) => handleTableChange(1, size),
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: handleRowSelect,
            preserveSelectedRowKeys: true,
          }}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default SPUList;
