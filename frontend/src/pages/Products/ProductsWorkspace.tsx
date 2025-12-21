import React, { useState, useEffect } from 'react';
import { Layout, Button, message, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import { useProductStore } from '../../stores/productStore';
import { useAuthStore } from '../../stores/authStore';
import ProductTable from '../../components/product/ProductTable';
import ProductPanel from '../../components/product/ProductPanel';
import ProductFilter from '../../components/product/ProductFilter';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

/**
 * 商品工作台主页面
 * 实现单页双区布局设计
 */
const ProductsWorkspace: React.FC = () => {
  const [panelVisible, setPanelVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [panelMode, setPanelMode] = useState<'create' | 'edit' | 'view'>('create');

  const { user } = useAuthStore();
  const {
    products,
    loading,
    total,
    pagination,
    filters,
    selectedProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters,
    setSelectedProducts
  } = useProductStore();

  // 初始化加载数据
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 处理新建商品
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setPanelMode('create');
    setPanelVisible(true);
  };

  // 处理编辑商品
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setPanelMode('edit');
    setPanelVisible(true);
  };

  // 处理查看商品
  const handleViewProduct = (product: any) => {
    setEditingProduct(product);
    setPanelMode('view');
    setPanelVisible(true);
  };

  // 处理保存商品
  const handleSaveProduct = async (productData: any) => {
    try {
      if (panelMode === 'create') {
        await createProduct(productData);
        message.success('商品创建成功');
      } else if (panelMode === 'edit') {
        await updateProduct(editingProduct.id, productData);
        message.success('商品更新成功');
      }

      // 刷新列表
      fetchProducts();
      setPanelVisible(false);
    } catch (error) {
      message.error('操作失败，请重试');
    }
  };

  // 处理删除商品
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      message.success('商品删除成功');
      fetchProducts();
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    fetchProducts();
    message.success('数据已刷新');
  };

  // 处理导出
  const handleExport = () => {
    // TODO: 实现导出功能
    message.info('导出功能开发中');
  };

  // 处理筛选
  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
    fetchProducts();
  };

  // 处理分页
  const handlePageChange = (page: number, pageSize: number) => {
    fetchProducts({ page, pageSize });
  };

  return (
    <Layout className="h-screen" data-testid="products-workspace">
      {/* 顶部工具栏 */}
      <Header className="bg-white shadow-sm px-6 flex items-center justify-between" data-testid="workspace-header">
        <div className="flex items-center">
          <Title level={3} className="!mb-0 mr-6" data-testid="workspace-title">
            商品工作台
          </Title>
          <span className="text-gray-500" data-testid="product-count">
            共 {total} 个商品
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateProduct}
            data-testid="create-product-btn"
          >
            新建商品
          </Button>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
            data-testid="refresh-btn"
          >
            刷新
          </Button>

          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
            data-testid="export-btn"
          >
            导出
          </Button>
        </div>
      </Header>

      {/* 主内容区域 */}
      <Content className="p-6" data-testid="workspace-content">
        {/* 筛选区域 */}
        <div className="mb-4" data-testid="filter-section">
          <ProductFilter
            filters={filters}
            onFilter={handleFilter}
            loading={loading}
          />
        </div>

        {/* 数据表格 */}
        <ProductTable
          products={products}
          loading={loading}
          selectedProducts={selectedProducts}
          onEdit={handleEditProduct}
          onView={handleViewProduct}
          onDelete={handleDeleteProduct}
          onSelect={setSelectedProducts}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: total,
            onChange: handlePageChange,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
        />
      </Content>

      {/* 编辑面板 - 使用 Drawer 抽屉式设计 */}
      <ProductPanel
        visible={panelVisible}
        mode={panelMode}
        product={editingProduct}
        onSave={handleSaveProduct}
        onCancel={() => setPanelVisible(false)}
      />
    </Layout>
  );
};

export default ProductsWorkspace;