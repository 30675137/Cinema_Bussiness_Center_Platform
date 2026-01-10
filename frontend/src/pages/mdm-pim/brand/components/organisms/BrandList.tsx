import React, { useState, useEffect } from 'react';
import { Card, Button, Spin, Alert, Empty, Pagination, Space, Typography, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import type {
  Brand,
  BrandFilters as BrandFiltersType,
  BrandPaginationResponse,
} from '../../types/brand.types';
import { BrandStatus } from '../../types/brand.types';
import { brandService } from '../../services/brandService';
import BrandSearchForm from '../molecules/BrandSearchForm';
import BrandFilters from '../molecules/BrandFilters';
import BrandTable from '../molecules/BrandTable';
import BrandDrawer from './BrandDrawer';
import { useBrandActions } from '../../hooks/useBrandActions';

const { Title } = Typography;

interface BrandListProps {
  onBrandView?: (brand: Brand) => void;
  onBrandEdit?: (brand: Brand) => void;
  onBrandCreate?: () => void;
  onBrandStatusChange?: (brand: Brand, status: BrandStatus) => void;
  onBrandDelete?: (brand: Brand) => void;
}

/**
 * 品牌列表有机体组件
 * 整合搜索、筛选、表格、分页等功能，提供完整的品牌列表管理界面
 */
const BrandList: React.FC<BrandListProps> = ({
  onBrandView,
  onBrandEdit,
  onBrandCreate,
  onBrandStatusChange,
  onBrandDelete,
}) => {
  // 状态管理
  const [filters, setFilters] = useState<BrandFiltersType>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  // Brand Drawer 状态
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // 使用品牌操作 hook
  const { deleteBrand, loading: actionLoading } = useBrandActions();

  // 获取品牌列表数据
  const {
    data: brandListData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['brands', filters, pagination],
    queryFn: () =>
      brandService.getBrands({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      }),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });

  // 处理搜索
  const handleSearch = (newFilters: BrandFiltersType) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 })); // 搜索时重置到第一页
  };

  // 处理重置
  const handleReset = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // 处理分页变化
  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPagination((prev) => ({
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // 处理清除单个筛选条件
  const handleClearFilter = (filterKey: keyof BrandFiltersType) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    handleSearch(newFilters);
  };

  // 处理清除所有筛选条件
  const handleClearAllFilters = () => {
    handleReset();
  };

  // 处理品牌查看
  const handleBrandView = (brand: Brand) => {
    setSelectedBrand(brand);
    setDrawerMode('view');
    setDrawerVisible(true);
    onBrandView?.(brand);
  };

  // 处理品牌编辑
  const handleBrandEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setDrawerMode('edit');
    setDrawerVisible(true);
    onBrandEdit?.(brand);
  };

  // 处理品牌状态变更
  const handleBrandStatusChange = (brand: Brand, status: BrandStatus) => {
    onBrandStatusChange?.(brand, status);
  };

  // 处理品牌删除
  const handleBrandDelete = async (brand: Brand) => {
    try {
      await deleteBrand(brand.id);
      message.success(`品牌「${brand.name}」删除成功`);
      refetch(); // 刷新列表
      onBrandDelete?.(brand);
    } catch (error) {
      message.error(`删除失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 处理新建品牌
  const handleBrandCreate = () => {
    setSelectedBrand(null);
    setDrawerMode('create');
    setDrawerVisible(true);
    onBrandCreate?.();
  };

  // 处理抽屉关闭
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setSelectedBrand(null);
  };

  // 处理品牌操作成功
  const handleDrawerSuccess = () => {
    // 刷新品牌列表数据
    refetch();
  };

  // 处理刷新数据
  const handleRefresh = () => {
    refetch();
  };

  // 获取品牌列表数据 - API直接返回 {success, data: [...], pagination: {...}}
  const brands = brandListData?.data || [];
  const paginationData =
    brandListData?.pagination ||
    ({
      current: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    } as BrandPaginationResponse);

  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="brand-list-loading" data-testid="brand-loading">
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="brand-list-error" data-testid="brand-error">
        <Alert
          message="加载失败"
          description="品牌数据加载失败，请稍后重试"
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleRefresh}>
              重试
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="brand-list-container" data-testid="brand-list-container">
      {/* 页面头部 */}
      <div className="brand-list-header">
        <div className="header-left">
          <Title level={2} data-testid="page-title">
            品牌管理
          </Title>
        </div>
        <div className="header-right">
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={isLoading}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleBrandCreate}
              data-testid="new-brand-button"
            >
              新建品牌
            </Button>
          </Space>
        </div>
      </div>

      {/* 搜索表单 */}
      <Card className="brand-search-card" bordered={false}>
        <BrandSearchForm onSearch={handleSearch} onReset={handleReset} loading={isLoading} />
      </Card>

      {/* 激活的筛选条件 */}
      <BrandFilters
        filters={filters}
        onClearFilter={handleClearFilter}
        onClearAll={handleClearAllFilters}
        className="brand-active-filters"
      />

      {/* 品牌列表 */}
      <Card className="brand-table-card" bordered={false}>
        <BrandTable
          brands={brands}
          loading={isLoading}
          onView={handleBrandView}
          onEdit={handleBrandEdit}
          onStatusChange={handleBrandStatusChange}
          onDelete={handleBrandDelete}
        />

        {/* 分页 */}
        {brands.length > 0 && (
          <div className="brand-pagination-wrapper">
            <div className="pagination-info" data-testid="result-count">
              共 {paginationData.total} 条记录，第 {paginationData.current} /{' '}
              {paginationData.totalPages} 页
            </div>
            <Pagination
              current={paginationData.current}
              pageSize={paginationData.pageSize}
              total={paginationData.total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`}
              onChange={handlePaginationChange}
              onShowSizeChange={handlePaginationChange}
              className="brand-pagination"
              data-testid="brand-pagination"
              size="default"
              pageSizeOptions={['10', '20', '50', '100']}
            />
          </div>
        )}
      </Card>

      {/* 空状态 */}
      {brands.length === 0 && !isLoading && (
        <div className="brand-empty-state" data-testid="brand-empty-state">
          <Empty
            description={Object.keys(filters).length > 0 ? '没有找到匹配的品牌' : '暂无品牌数据'}
          >
            <Button type="primary" onClick={handleBrandCreate}>
              创建品牌
            </Button>
          </Empty>
        </div>
      )}

      {/* 品牌操作抽屉 */}
      <BrandDrawer
        visible={drawerVisible}
        brand={selectedBrand}
        mode={drawerMode}
        onClose={handleDrawerClose}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  );
};

export default BrandList;
