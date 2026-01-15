import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, Button, Space, message, Typography } from 'antd';
import { PlusOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { SPUItem, SPUQueryParams, SPUStatus, Brand, Category } from '@/types/spu';
import type { PaginatedResponse } from '@/services/spuService';
import { spuService } from '@/services/spuService';
import { brandAPI } from '@/services/brandService';
import { categoryAPI } from '@/services/categoryService';
import SPUFilter from '@/components/SPU/SPUFilter';
import SPUList from '@/components/SPU/SPUList';
import BatchOperations from '@/components/SPU/BatchOperations';
import { Breadcrumb as CustomBreadcrumb } from '@/components/common';

const { Title } = Typography;

interface SPUListPageProps {}

const SPUListPage: React.FC<SPUListPageProps> = () => {
  const navigate = useNavigate();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<SPUItem[]>([]);
  const [allData, setAllData] = useState<SPUItem[]>([]);

  // 查询参数
  const [queryParams, setQueryParams] = useState<SPUQueryParams>({
    page: 1,
    pageSize: 20,
    keyword: '',
    status: undefined,
    brandId: undefined,
    categoryId: undefined,
    tags: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // 分页信息
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
  });

  // 基础数据
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // 使用 ref 来跟踪是否已经初始化加载
  const hasInitialized = useRef(false);

  // 加载基础数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 加载初始数据
  const loadInitialData = async () => {
    try {
      setDataLoading(true);

      // 并行加载品牌和分类数据
      const [brandsResult, categoriesResult] = await Promise.all([loadBrands(), loadCategories()]);

      setBrands(brandsResult);
      setCategories(categoriesResult);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      message.error('加载数据失败，请刷新页面重试');
    } finally {
      setDataLoading(false);
    }
  };

  // 加载品牌数据
  const loadBrands = async (): Promise<Brand[]> => {
    try {
      const response = await brandAPI.getBrandList({ page: 1, pageSize: 100 });
      if (response && response.data) {
        // 适配不同的 API 响应结构
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data.list && Array.isArray(response.data.list)) {
          return response.data.list;
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to load brands:', error);
      return [];
    }
  };

  // 加载分类数据
  const loadCategories = async (): Promise<Category[]> => {
    try {
      const response = await categoryAPI.getCategoryList({ page: 1, pageSize: 100 });
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          return response.data;
        } else if (response.data.list && Array.isArray(response.data.list)) {
          return response.data.list;
        }
      }
      return [];
    } catch (error) {
      console.error('Failed to load categories:', error);
      return [];
    }
  };

  // 加载SPU列表数据
  const loadSPUList = useCallback(async (params: SPUQueryParams) => {
    try {
      setLoading(true);

      const response: PaginatedResponse<SPUItem> = await spuService.getSPUList(params);

      if (response.success) {
        setDataSource(response.data.list);
        setAllData(response.data.list);
        setPagination((prev) => ({
          ...prev,
          current: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total,
        }));
      } else {
        message.error(response.message || '获取SPU列表失败');
      }
    } catch (error) {
      console.error('Load SPU list error:', error);
      message.error('获取SPU列表失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载数据 - 只在 dataLoading 变为 false 且未初始化时加载一次
  useEffect(() => {
    if (!dataLoading && !hasInitialized.current) {
      hasInitialized.current = true;
      loadSPUList(queryParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoading]); // 移除 queryParams 依赖，避免无限循环

  // 处理搜索
  const handleSearch = useCallback(
    (filters: Partial<SPUQueryParams>) => {
      const newParams = { ...queryParams, ...filters, page: 1 };
      setQueryParams(newParams);
      loadSPUList(newParams);
    },
    [queryParams, loadSPUList]
  );

  // 处理重置
  const handleReset = useCallback(() => {
    const resetParams: SPUQueryParams = {
      page: 1,
      pageSize: 20,
      keyword: '',
      status: undefined,
      brandId: undefined,
      categoryId: undefined,
      tags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setQueryParams(resetParams);
    loadSPUList(resetParams);
  }, [loadSPUList]);

  // 处理导出
  const handleExport = useCallback(() => {
    spuService
      .batchExportSPU(selectedRowKeys.length > 0 ? (selectedRowKeys as string[]) : undefined)
      .then((response) => {
        if (response.success) {
          // 模拟下载
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.download = response.data.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          message.success(`导出成功：${response.data.fileName}`);
        } else {
          message.error(response.message || '导出失败');
        }
      })
      .catch((error) => {
        console.error('Export error:', error);
        message.error('导出失败，请重试');
      });
  }, [selectedRowKeys]);

  // 处理分页变化
  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      const newParams = { ...queryParams, page, pageSize };
      setQueryParams(newParams);
      loadSPUList(newParams);
    },
    [queryParams, loadSPUList]
  );

  // 处理表格排序
  const handleTableChange = useCallback(
    (pagination: any, filters: any, sorter: any) => {
      if (sorter?.field && sorter?.order) {
        const newParams = {
          ...queryParams,
          sortBy: sorter.field as string,
          sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
        };
        setQueryParams(newParams);
        loadSPUList(newParams);
      }
    },
    [queryParams, loadSPUList]
  );

  // 处理行选择
  const handleRowSelectionChange = useCallback((selectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  }, []);

  // 处理批量删除
  const handleBatchDelete = useCallback(
    (ids: string[]) => {
      spuService
        .batchDeleteSPU(ids)
        .then((response) => {
          if (response.success) {
            message.success(response.message);
            setSelectedRowKeys([]);
            // 重新加载数据
            loadSPUList(queryParams);
          } else {
            message.error(response.message || '批量删除失败');
          }
        })
        .catch((error) => {
          console.error('Batch delete error:', error);
          message.error('批量删除失败，请重试');
        });
    },
    [queryParams, loadSPUList]
  );

  // 处理批量状态更新
  const handleBatchStatusChange = useCallback(
    (ids: string[], status: SPUStatus) => {
      spuService
        .batchUpdateSPUStatus(ids, status)
        .then((response) => {
          if (response.success) {
            message.success(response.message);
            setSelectedRowKeys([]);
            // 重新加载数据
            loadSPUList(queryParams);
          } else {
            message.error(response.message || '批量状态更新失败');
          }
        })
        .catch((error) => {
          console.error('Batch status change error:', error);
          message.error('批量状态更新失败，请重试');
        });
    },
    [queryParams, loadSPUList]
  );

  // 处理批量复制
  const handleBatchCopy = useCallback(
    (ids: string[]) => {
      spuService
        .batchCopySPU(ids)
        .then((response) => {
          if (response.success) {
            message.success(response.message);
            setSelectedRowKeys([]);
            // 重新加载数据
            loadSPUList(queryParams);
          } else {
            message.error(response.message || '批量复制失败');
          }
        })
        .catch((error) => {
          console.error('Batch copy error:', error);
          message.error('批量复制失败，请重试');
        });
    },
    [queryParams, loadSPUList]
  );

  // 处理单行操作
  const handleView = useCallback(
    (record: SPUItem) => {
      navigate(`/spu/${record.id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (record: SPUItem) => {
      navigate(`/spu/${record.id}/edit`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    (record: SPUItem) => {
      spuService
        .deleteSPU(record.id)
        .then((response) => {
          if (response.success) {
            message.success('删除成功');
            // 重新加载数据
            loadSPUList(queryParams);
          } else {
            message.error(response.message || '删除失败');
          }
        })
        .catch((error) => {
          console.error('Delete error:', error);
          message.error('删除失败，请重试');
        });
    },
    [queryParams, loadSPUList]
  );

  const handleCopy = useCallback(
    (record: SPUItem) => {
      spuService
        .batchCopySPU([record.id])
        .then((response) => {
          if (response.success) {
            message.success(response.message);
            // 重新加载数据
            loadSPUList(queryParams);
          } else {
            message.error(response.message || '复制失败');
          }
        })
        .catch((error) => {
          console.error('Copy error:', error);
          message.error('复制失败，请重试');
        });
    },
    [queryParams, loadSPUList]
  );

  // 处理刷新
  const handleRefresh = useCallback(() => {
    loadSPUList(queryParams);
  }, [queryParams, loadSPUList]);

  // 面包屑导航
  const breadcrumbItems = [
    { title: '首页', path: '/dashboard' },
    { title: 'SPU管理', path: '/spu' },
    { title: 'SPU列表' },
  ];

  // 获取选中的行数据
  const selectedRows = useMemo(() => {
    return allData.filter((item) => selectedRowKeys.includes(item.id));
  }, [allData, selectedRowKeys]);

  return (
    <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      {/* 页面标题和导航 */}
      <div style={{ marginBottom: 24 }}>
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      {/* 页面标题和操作按钮 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            SPU管理
          </Title>
          <div style={{ fontSize: '14px', color: '#666', marginTop: 8 }}>
            共{pagination.total}个商品
          </div>
        </div>

        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/spu/create')}>
            新建SPU
          </Button>
          <Button icon={<ExportOutlined />} onClick={handleExport} loading={loading}>
            导出数据
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      {/* 搜索筛选组件 */}
      <SPUFilter
        brands={brands}
        categories={categories}
        value={queryParams}
        onChange={handleSearch}
        onSearch={handleSearch}
        onReset={handleReset}
        onExport={handleExport}
        loading={dataLoading}
      />

      {/* 批量操作组件 */}
      <BatchOperations
        selectedRowKeys={selectedRowKeys}
        selectedRows={selectedRows}
        dataSource={allData}
        onBatchDelete={handleBatchDelete}
        onBatchExport={(ids) => {
          spuService.batchExportSPU(ids).then(handleExport);
        }}
        onBatchStatusChange={handleBatchStatusChange}
        onBatchCopy={handleBatchCopy}
        onClearSelection={() => setSelectedRowKeys([])}
        onSelectAll={() => {
          const allKeys = allData.map((item) => item.id);
          setSelectedRowKeys(allKeys);
        }}
        loading={loading}
      />

      {/* SPU列表表格 */}
      <Card style={{ boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}>
        <SPUList
          data={dataSource}
          loading={loading || dataLoading}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={handleRowSelectionChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onCopy={handleCopy}
          pagination={pagination}
          onChange={handleTableChange}
          rowSelection={{
            type: 'checkbox',
            getCheckboxProps: (record: SPUItem) => ({
              disabled: record.status === 'archived',
            }),
          }}
          scroll={{ x: 1400, y: 600 }}
        />
      </Card>
    </div>
  );
};

export default SPUListPage;
