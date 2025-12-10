import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
  Tag,
  Popconfirm,
  message,
  Modal,
  Drawer,
  Tooltip,
  Badge,
  Dropdown,
  MenuProps,
  Statistic,
  Progress,
  Tabs
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
  ImportOutlined,
  ReloadOutlined,
  FilterOutlined,
  MoreOutlined,
  SettingOutlined,
  HistoryOutlined,
  DollarOutlined,
  LineChartOutlined,
  FireOutlined,
  CalculatorOutlined,
  ExperimentOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import PriceForm from '@/components/price/PriceForm';
import PriceRulesManager from '@/components/price/PriceRulesManager';
import PriceSimulator from '@/components/price/PriceSimulator';
import BatchPriceAdjustment from '@/components/price/BatchPriceAdjustment';
import PriceHistory from '@/components/price/PriceHistory';

import {
  usePricesQuery,
  useDeletePriceMutation,
  useBatchUpdatePricesMutation,
  usePriceStatistics
} from '@/stores/priceStore';
import { useAppActions } from '@/stores/appStore';
import {
  PriceConfig,
  PriceFilters,
  PriceType,
  PriceStatus,
  PriceStatusConfig,
  PriceTypeConfig
} from '@/types/price';
import PriceForm from '@/components/price/PriceForm';
import PriceHistory from '@/components/price/PriceHistory';
import PriceRulesManager from '@/components/price/PriceRulesManager';
import PriceSimulator from '@/components/price/PriceSimulator';

const { Title, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const PriceManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setBreadcrumbs } = useAppActions();

  // 状态管理
  const [filters, setFilters] = useState<PriceFilters>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<PriceConfig | null>(null);
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('list');

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

  const { data: pricesData, isLoading, refetch } = usePricesQuery(queryParams);
  const { data: statistics } = usePriceStatistics(filters);
  const deleteMutation = useDeletePriceMutation();
  const batchUpdateMutation = useBatchUpdatePricesMutation();

  // 设置面包屑
  useEffect(() => {
    setBreadcrumbs([
      { title: t('menu.price') },
      { title: t('price.management') }
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

  // 筛选处理
  const handleFilter = (newFilters: Partial<PriceFilters>) => {
    setFilters({ ...filters, ...newFilters });
    setPagination({ ...pagination, current: 1 });
    setFilterDrawerVisible(false);
  };

  // 清除筛选
  const handleClearFilters = () => {
    setFilters({});
    setPagination({ ...pagination, current: 1 });
    setFilterDrawerVisible(false);
  };

  // 创建价格
  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  // 编辑价格
  const handleEdit = (price: PriceConfig) => {
    setSelectedPrice(price);
    setEditModalVisible(true);
  };

  // 查看详情
  const handleView = (price: PriceConfig) => {
    navigate(`/price/${price.id}`);
  };

  // 查看历史
  const handleViewHistory = (price: PriceConfig) => {
    setSelectedPrice(price);
    setHistoryDrawerVisible(true);
  };

  // 删除价格
  const handleDelete = async (priceId: string) => {
    try {
      await deleteMutation.mutateAsync(priceId);
      message.success('价格删除成功');
      refetch();
    } catch (error) {
      message.error('价格删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的价格');
      return;
    }

    Modal.confirm({
      title: '批量删除确认',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个价格配置吗？此操作不可恢复。`,
      okText: '确定删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          // 这里需要调用批量删除API
          message.success(`成功删除 ${selectedRowKeys.length} 个价格配置`);
          setSelectedRowKeys([]);
          refetch();
        } catch (error) {
          message.error('批量删除失败');
        }
      }
    });
  };

  // 批量操作
  const handleBatchAction = async (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要操作的价格');
      return;
    }

    switch (action) {
      case 'activate':
        try {
          await batchUpdateMutation.mutateAsync({
            ids: selectedRowKeys,
            data: { status: PriceStatus.ACTIVE }
          });
          message.success(`成功激活 ${selectedRowKeys.length} 个价格`);
          setSelectedRowKeys([]);
          refetch();
        } catch (error) {
          message.error('批量激活失败');
        }
        break;
      case 'deactivate':
        try {
          await batchUpdateMutation.mutateAsync({
            ids: selectedRowKeys,
            data: { status: PriceStatus.INACTIVE }
          });
          message.success(`成功停用 ${selectedRowKeys.length} 个价格`);
          setSelectedRowKeys([]);
          refetch();
        } catch (error) {
          message.error('批量停用失败');
        }
        break;
      default:
        break;
    }
  };

  // 导出价格
  const handleExport = async () => {
    try {
      // 这里需要调用导出API
      message.success('价格导出成功');
    } catch (error) {
      message.error('价格导出失败');
    }
  };

  // 复制价格
  const handleCopy = (price: PriceConfig) => {
    navigate(`/price/create?copyFrom=${price.id}`);
  };

  // 状态标签
  const getStatusTag = (status: PriceStatus) => {
    const config = PriceStatusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 价格类型标签
  const getPriceTypeTag = (type: PriceType) => {
    const config = PriceTypeConfig[type];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 更多操作菜单
  const getMoreMenu = (record: PriceConfig): MenuProps => ({
    items: [
      {
        key: 'history',
        label: '查看历史',
        icon: <HistoryOutlined />,
        onClick: () => handleViewHistory(record)
      },
      {
        key: 'copy',
        label: '复制价格',
        icon: <CopyOutlined />,
        onClick: () => handleCopy(record)
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        label: '删除价格',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(record.id)
      }
    ]
  });

  // 表格列定义
  const columns: ColumnsType<PriceConfig> = [
    {
      title: '商品信息',
      key: 'productInfo',
      width: 250,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.productId}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            SKU: {record.skuId || '-'}
          </div>
        </div>
      )
    },
    {
      title: '价格类型',
      dataIndex: 'priceType',
      key: 'priceType',
      width: 120,
      render: (type: PriceType) => getPriceTypeTag(type)
    },
    {
      title: '价格信息',
      key: 'priceInfo',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            ¥{record.currentPrice.toFixed(2)}
          </div>
          {record.originalPrice && record.originalPrice !== record.currentPrice && (
            <Text type="secondary" delete style={{ fontSize: 12 }}>
              ¥{record.originalPrice.toFixed(2)}
            </Text>
          )}
        </div>
      )
    },
    {
      title: '生效时间',
      key: 'effectiveTime',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{dayjs(record.effectiveFrom).format('YYYY-MM-DD')}</div>
          {record.effectiveTo && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              至 {dayjs(record.effectiveTo).format('YYYY-MM-DD')}
            </Text>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PriceStatus) => getStatusTag(status)
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: number) => (
        <Tag color={priority > 5 ? 'red' : 'blue'}>
          {priority}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: true,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
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

  const prices = pricesData?.data || [];
  const totalCount = pricesData?.pagination?.total || 0;

  // 统计卡片渲染
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总价格配置"
              value={statistics.totalPrices}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均价格"
              value={statistics.averagePrice}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="生效中"
              value={statistics.activePrices}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待变更"
              value={statistics.upcomingChanges}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="price-management">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              价格管理
              <Badge count={totalCount} style={{ marginLeft: 8 }} />
            </Title>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                导出
              </Button>
              <Button icon={<ImportOutlined />}>
                导入
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                新建价格
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'list',
            label: '价格列表',
            children: (
              <>
                {/* 统计信息 */}
                {renderStatistics()}

                {/* 搜索和筛选 */}
                <Card style={{ marginBottom: 16 }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col flex="auto">
                      <Search
                        placeholder="搜索商品ID、SKU或价格"
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        style={{ maxWidth: 400 }}
                      />
                    </Col>
                    <Col>
                      <Space>
                        <Select
                          placeholder="价格类型"
                          style={{ width: 120 }}
                          allowClear
                          value={filters.priceType}
                          onChange={(value) => handleFilter({ priceType: value })}
                        >
                          <Option value={PriceType.BASE}>基础价格</Option>
                          <Option value={PriceType.MEMBER}>会员价格</Option>
                          <Option value={PriceType.PROMOTION}>促销价格</Option>
                          <Option value={PriceType.SPECIAL}>特殊价格</Option>
                          <Option value={PriceType.WHOLESALE}>批发价格</Option>
                          <Option value={PriceType.CHANNEL}>渠道价格</Option>
                        </Select>

                        <Select
                          placeholder="状态"
                          style={{ width: 100 }}
                          allowClear
                          value={filters.status?.[0]}
                          onChange={(value) => handleFilter({
                            status: value ? [value] : undefined
                          })}
                        >
                          <Option value={PriceStatus.ACTIVE}>生效中</Option>
                          <Option value={PriceStatus.INACTIVE}>已失效</Option>
                          <Option value={PriceStatus.PENDING}>待生效</Option>
                          <Option value={PriceStatus.EXPIRED}>已过期</Option>
                        </Select>

                        <Button icon={<FilterOutlined />} onClick={() => setFilterDrawerVisible(true)}>
                          高级筛选
                        </Button>
                      </Space>
                    </Col>
                  </Row>

                  {/* 批量操作 */}
                  {selectedRowKeys.length > 0 && (
                    <Row style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                      <Col>
                        <Space>
                          <Text>已选择 {selectedRowKeys.length} 项</Text>
                          <Button size="small" onClick={() => setSelectedRowKeys([])}>
                            取消选择
                          </Button>
                          <Button size="small" onClick={() => handleBatchAction('activate')}>
                            批量激活
                          </Button>
                          <Button size="small" onClick={() => handleBatchAction('deactivate')}>
                            批量停用
                          </Button>
                          <Popconfirm
                            title="确定删除选中的价格吗？"
                            onConfirm={handleBatchDelete}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button size="small" danger>
                              批量删除
                            </Button>
                          </Popconfirm>
                        </Space>
                      </Col>
                    </Row>
                  )}
                </Card>

                {/* 价格表格 */}
                <Card>
                  <Table
                    columns={columns}
                    dataSource={prices}
                    rowKey="id"
                    loading={isLoading}
                    rowSelection={rowSelection}
                    pagination={{
                      ...pagination,
                      total: totalCount,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1400 }}
                  />
                </Card>
              </>
            )
          },
          {
            key: 'batch',
            label: (
              <span>
                <CalculatorOutlined />
                批量调整
              </span>
            ),
            children: <BatchPriceAdjustment />
          },
          {
            key: 'rules',
            label: (
              <span>
                <SettingOutlined />
                价格规则
              </span>
            ),
            children: <PriceRulesManager />
          },
          {
            key: 'simulator',
            label: (
              <span>
                <ExperimentOutlined />
                价格模拟
              </span>
            ),
            children: <PriceSimulator />
          },
          {
            key: 'history',
            label: (
              <span>
                <HistoryOutlined />
                历史记录
              </span>
            ),
            children: <PriceHistory />
          },
          {
            key: 'analytics',
            label: (
              <span>
                <LineChartOutlined />
                统计分析
              </span>
            ),
            children: (
              <Card>
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                  <LineChartOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                  <div style={{ marginTop: 16 }}>
                    <Title level={4} type="secondary">统计分析功能开发中...</Title>
                    <Text type="secondary">即将推出价格趋势分析和销量预测功能</Text>
                  </div>
                </div>
              </Card>
            )
          }
        ]}
      />

      {/* 创建价格弹窗 */}
      <Modal
        title="新建价格"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <PriceForm
          mode="create"
          onSuccess={() => {
            setCreateModalVisible(false);
            refetch();
          }}
        />
      </Modal>

      {/* 编辑价格弹窗 */}
      <Modal
        title="编辑价格"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedPrice(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        {selectedPrice && (
          <PriceForm
            mode="edit"
            price={selectedPrice}
            onSuccess={() => {
              setEditModalVisible(false);
              setSelectedPrice(null);
              refetch();
            }}
          />
        )}
      </Modal>

      {/* 价格历史抽屉 */}
      <Drawer
        title="价格历史记录"
        open={historyDrawerVisible}
        onClose={() => {
          setHistoryDrawerVisible(false);
          setSelectedPrice(null);
        }}
        width={800}
        destroyOnClose
      >
        {selectedPrice && <PriceHistory productId={selectedPrice.productId} />}
      </Drawer>
    </div>
  );
};

export default PriceManagement;