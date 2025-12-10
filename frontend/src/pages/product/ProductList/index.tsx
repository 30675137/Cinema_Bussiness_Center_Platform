import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Tooltip,
  message,
  Modal,
  Typography,
  Row,
  Col,
  Statistic,
  Avatar,
  Badge,
  Dropdown,
  MenuProps,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  ExportOutlined,
  ReloadOutlined,
  FilterOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { Drawer } from 'antd';

import { useProductsQuery, useDeleteProductMutation } from '@/stores/productStore';
import { useAppActions } from '@/stores/appStore';
import { Product, ProductStatus, MaterialType, ProductFilters } from '@/types/product';
import ProductForm from '../ProductForm';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setBreadcrumbs } = useAppActions();

  // 状态管理
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  // 排序状态
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 查询参数
  const queryParams = {
    page: pagination.current,
    pageSize: pagination.pageSize,
    keyword: searchKeyword,
    ...filters,
    sortBy: sortField,
    sortOrder
  };

  const { data: productsData, isLoading, refetch } = useProductsQuery(queryParams);
  const deleteMutation = useDeleteProductMutation();

  // 设置面包屑
  useEffect(() => {
    setBreadcrumbs([
      { title: t('menu.product') },
      { title: t('product.list') }
    ]);
  }, [setBreadcrumbs, t]);

  // 处理分页变化
  const handleTableChange = (paginationInfo: any, filters: any, sorter: any) => {
    setPagination({
      ...pagination,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    });

    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setPagination({ ...pagination, current: 1 });
  };

  // 创建商品
  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  // 编辑商品
  const handleEdit = (product: Product) => {
    navigate(`/product/edit/${product.id}`);
  };

  // 查看详情
  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setDetailDrawerVisible(true);
  };

  // 删除商品
  const handleDelete = async (productId: string) => {
    try {
      await deleteMutation.mutateAsync(productId);
      message.success('商品删除成功');
      refetch();
    } catch (error) {
      message.error('商品删除失败');
    }
  };

  // 复制商品
  const handleCopy = (product: Product) => {
    navigate(`/product/create?copyFrom=${product.id}`);
  };

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 状态标签
  const getStatusTag = (status: ProductStatus) => {
    const statusMap = {
      draft: { color: 'orange', text: '草稿' },
      active: { color: 'green', text: '上架' },
      inactive: { color: 'red', text: '下架' },
      pending: { color: 'blue', text: '待审核' },
      rejected: { color: 'volcano', text: '已驳回' },
      discontinued: { color: 'default', text: '已停产' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 物料类型标签
  const getMaterialTypeTag = (type: MaterialType) => {
    const typeMap = {
      raw_material: { color: 'purple', text: '原材料' },
      semi_finished: { color: 'cyan', text: '半成品' },
      finished_goods: { color: 'blue', text: '成品' },
      consumable: { color: 'green', text: '消耗品' },
      packaging: { color: 'orange', text: '包装材料' }
    };
    const config = typeMap[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 更多操作菜单
  const getMoreMenu = (record: Product): MenuProps => ({
    items: [
      {
        key: 'copy',
        label: '复制商品',
        icon: <CopyOutlined />,
        onClick: () => handleCopy(record)
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        label: '删除商品',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(record.id)
      }
    ]
  });

  // 表格列定义
  const columns: ColumnsType<Product> = [
    {
      title: <span data-testid="table-header-name">商品信息</span>,
      key: 'productInfo',
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar
            size={48}
            shape="square"
            src={record.images?.[0]?.url}
            icon={<EditOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }} data-testid="cell-name">
              {record.name}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }} data-testid="cell-sku">
              SKU: {record.skuId}
            </div>
            <div style={{ marginTop: 4 }}>
              {getMaterialTypeTag(record.materialType)}
            </div>
          </div>
        </Space>
      )
    },
    {
      title: <span data-testid="table-header-category">类目</span>,
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 120,
      render: (_, record) => (
        <Text data-testid="cell-category">{record.category?.name || '-'}</Text>
      )
    },
    {
      title: <span data-testid="table-header-price">价格</span>,
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 100,
      sorter: true,
      render: (price: number) => (
        <Text strong data-testid="cell-price">¥{(price || 0).toFixed(2)}</Text>
      )
    },
    {
      title: <span data-testid="table-header-status">状态</span>,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ProductStatus) => <span data-testid="cell-status">{getStatusTag(status)}</span>
    },
    {
      title: <span data-testid="table-header-stock">库存</span>,
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock: number) => (
        <Text data-testid="cell-stock">{stock || 0}</Text>
      )
    },
    {
      title: '品牌',
      dataIndex: 'brand',
      key: 'brand',
      width: 100,
      render: (brand: string) => brand || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Dropdown menu={getMoreMenu(record)} trigger={['click']}>
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      )
    }
  ];

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys as string[]);
    }
  };

  const products = productsData?.data || [];
  const totalCount = productsData?.total || 0;

  return (
    <div className="product-list">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <span data-testid="breadcrumb">
                <span data-testid="breadcrumb-home">首页</span>
                {' / '}
                <span data-testid="breadcrumb-current">商品管理</span>
              </span>
              <Badge count={totalCount} style={{ marginLeft: 8 }} />
            </Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport} data-testid="batch-export">        
                导出
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} data-testid="create-product-button">
                新建商品
              </Button>
            </Space>
          </Col>
        </Row>
        {selectedRowKeys.length > 0 && (
          <Row style={{ marginTop: 16 }}>
            <Space>
              <Text data-testid="selected-count">已选择 {selectedRowKeys.length} 项</Text>
              <Button danger data-testid="batch-delete" onClick={() => message.info('批量删除功能开发中...')}>
                批量删除
              </Button>
            </Space>
          </Row>
        )}
      </Card>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Search
              placeholder="搜索商品名称、SKU、品牌"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ maxWidth: 400 }}
              data-testid="search-input"
            />
          </Col>
          <Col>
            <Space>
              <Select
                placeholder="物料类型"
                style={{ width: 120 }}
                allowClear
                value={filters.materialType}
                onChange={(value) => setFilters({ ...filters, materialType: value })}
                data-testid="material-type-filter"
              >
                <Option value="raw_material" data-value="原材料">原材料</Option>
                <Option value="semi_finished" data-value="半成品">半成品</Option>
                <Option value="finished_goods" data-value="成品">成品</Option>
                <Option value="consumable" data-value="消耗品">消耗品</Option>
                <Option value="packaging" data-value="包装材料">包装材料</Option>
              </Select>

              <Select
                placeholder="商品状态"
                style={{ width: 120 }}
                allowClear
                value={filters.status?.[0]}
                onChange={(value) => setFilters({
                  ...filters,
                  status: value ? [value] : undefined
                })}
                data-testid="status-filter"
              >
                <Option value="draft" data-value="draft">草稿</Option>
                <Option value="active" data-value="active">上架</Option>
                <Option value="inactive" data-value="inactive">下架</Option>
                <Option value="pending" data-value="pending">待审核</Option>
                <Option value="rejected" data-value="rejected">已驳回</Option>
                <Option value="discontinued" data-value="discontinued">已停产</Option>
              </Select>
              
              <Select
                placeholder="商品类目"
                style={{ width: 120 }}
                allowClear
                data-testid="category-filter"
              >
                <Option value="food" data-value="食品">食品</Option>
                <Option value="beverage" data-value="饮料">饮料</Option>
                <Option value="snack" data-value="零食">零食</Option>
              </Select>
              
              <Button icon={<FilterOutlined />} data-testid="mobile-filter-toggle" style={{ display: 'none' }}>
                筛选
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 商品表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={isLoading}
          rowSelection={{
            ...rowSelection,
            getCheckboxProps: (record: Product) => ({
              'data-testid': 'select-checkbox'
            })
          }}
          onRow={(record) => ({
            'data-testid': 'product-row'
          })}
          pagination={{
            ...pagination,
            total: totalCount,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            className: 'pagination',
            itemRender: (page, type, originalElement) => {
              if (type === 'page') {
                return <span data-testid="page-info">{originalElement}</span>;
              }
              if (type === 'next') {
                return <span data-testid="next-page">{originalElement}</span>;
              }
              return originalElement;
            }
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          data-testid="product-table"
          className="product-table"
        />
        <div data-testid="pagination" className="pagination">
          <span data-testid="page-size">每页 {pagination.pageSize} 条</span>
          <span data-testid="page-info"> 第 {pagination.current} 页</span>
        </div>
      </Card>

      {/* 创建商品弹窗 */}
      <Modal
        title="新建商品"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={1200}
        destroyOnClose
      >
        <ProductForm mode="create" />
      </Modal>

      {/* 商品详情抽屉 */}
      <Drawer
        title="商品详情"
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedProduct(null);
        }}
        width={800}
        destroyOnClose
      >
        {selectedProduct && (
          <div>
            <Title level={4}>{selectedProduct.name}</Title>
            <Text>{selectedProduct.description}</Text>
            {/* 这里可以添加更详细的商品信息展示 */}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProductList;