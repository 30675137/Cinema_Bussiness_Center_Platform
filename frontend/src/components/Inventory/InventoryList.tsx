import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  Tooltip,
  Modal,
  message,
  Drawer,
  Descriptions,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExportOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import {
  InventoryItem,
  InventoryStatus,
  InventoryQueryParams,
  InventoryStatistics,
} from '@/types/inventory';
import { useInventoryStore } from '@/stores/inventoryStore';
import { formatCurrency, formatDate } from '@/utils/formatters';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

interface InventoryListProps {
  onEdit?: (record: InventoryItem) => void;
  onView?: (record: InventoryItem) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ onEdit, onView }) => {
  // 状态管理
  const {
    inventoryItems,
    locations,
    statistics,
    loading,
    pagination,
    filters,
    selectedItems,
    fetchInventoryItems,
    deleteInventoryItem,
    updateInventoryItem,
    setFilters,
    setPagination,
    setSelectedItems,
    exportInventoryData,
    syncWithProcurement,
  } = useInventoryStore();

  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<InventoryItem | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  // 组件挂载时获取数据
  useEffect(() => {
    handleRefresh();
  }, []);

  // 刷新数据
  const handleRefresh = async () => {
    try {
      await fetchInventoryItems();
    } catch (error) {
      message.error('获取库存数据失败');
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setFilters({ keyword: value });
    handleRefresh();
  };

  // 处理筛选
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    handleRefresh();
  };

  // 处理日期范围选择
  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates.length === 2) {
      const dateRange = [dates[0]!.format('YYYY-MM-DD'), dates[1]!.format('YYYY-MM-DD')] as [
        string,
        string,
      ];
      setFilters({ dateRange });
      handleRefresh();
    } else {
      setFilters({ dateRange: undefined });
      handleRefresh();
    }
  };

  // 重置筛选条件
  const handleResetFilters = () => {
    setFilters({});
    handleRefresh();
  };

  // 处理分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
    handleRefresh();
  };

  // 查看详情
  const handleView = (record: InventoryItem) => {
    setCurrentRecord(record);
    setDetailVisible(true);
    onView?.(record);
  };

  // 编辑
  const handleEdit = (record: InventoryItem) => {
    onEdit?.(record);
  };

  // 删除
  const handleDelete = (record: InventoryItem) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除商品"${record.productName}"吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteInventoryItem(record.id);
          message.success('删除成功');
          handleRefresh();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedItems.length === 0) {
      message.warning('请选择要删除的项目');
      return;
    }

    Modal.confirm({
      title: '批量删除确认',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedItems.length} 个库存项目吗？此操作不可恢复。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await Promise.all(selectedItems.map((id) => deleteInventoryItem(id)));
          message.success('批量删除成功');
          setSelectedItems([]);
          handleRefresh();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 导出数据
  const handleExport = async () => {
    try {
      await exportInventoryData();
      message.success('数据导出成功');
    } catch (error) {
      message.error('数据导出失败');
    }
  };

  // 同步采购数据
  const handleSync = async () => {
    try {
      await syncWithProcurement();
      message.success('数据同步成功');
      handleRefresh();
    } catch (error) {
      message.error('数据同步失败');
    }
  };

  // 获取状态标签
  const getStatusTag = (status: InventoryStatus) => {
    const statusConfig = {
      [InventoryStatus.IN_STOCK]: {
        color: 'green',
        icon: <CheckCircleOutlined />,
        text: '有库存',
      },
      [InventoryStatus.LOW_STOCK]: {
        color: 'orange',
        icon: <WarningOutlined />,
        text: '库存不足',
      },
      [InventoryStatus.OUT_OF_STOCK]: {
        color: 'red',
        icon: <ExclamationCircleOutlined />,
        text: '无库存',
      },
      [InventoryStatus.DISCONTINUED]: {
        color: 'gray',
        icon: <SyncOutlined />,
        text: '停产',
      },
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 表格列定义
  const columns: ColumnsType<InventoryItem> = [
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      fixed: 'left',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      ),
    },
    {
      title: '商品分类',
      dataIndex: 'productCategory',
      key: 'productCategory',
      width: 120,
    },
    {
      title: '规格',
      dataIndex: 'productSpec',
      key: 'productSpec',
      width: 150,
      ellipsis: true,
    },
    {
      title: '存储位置',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 150,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      width: 100,
      align: 'right',
      render: (value: number, record: InventoryItem) => {
        const isLow = value <= record.minStock;
        const isOut = value === 0;

        return (
          <Text strong={isLow || isOut} type={isOut ? 'danger' : isLow ? 'warning' : undefined}>
            {value} {record.unit}
          </Text>
        );
      },
    },
    {
      title: '库存状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: InventoryStatus) => getStatusTag(status),
    },
    {
      title: '库存价值',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 120,
      align: 'right',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: '安全库存',
      dataIndex: 'safeStock',
      key: 'safeStock',
      width: 100,
      align: 'right',
      render: (value: number, record: InventoryItem) => (
        <Text type={record.currentStock < value ? 'danger' : undefined}>
          {value} {record.unit}
        </Text>
      ),
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
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
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys: selectedItems,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedItems(selectedRowKeys as string[]);
    },
    getCheckboxProps: (record: InventoryItem) => ({
      disabled: record.status === InventoryStatus.DISCONTINUED,
    }),
  };

  return (
    <div className="inventory-list">
      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="总商品数"
                value={statistics.totalItems}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="库存总价值"
                value={statistics.totalValue}
                prefix="¥"
                precision={2}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="库存不足"
                value={statistics.lowStockCount}
                valueStyle={{ color: statistics.lowStockCount > 0 ? '#cf1322' : '#3f8600' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="缺货商品"
                value={statistics.outOfStockCount}
                valueStyle={{ color: statistics.outOfStockCount > 0 ? '#cf1322' : '#3f8600' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 库存预警 */}
      {statistics && statistics.lowStockCount > 0 && (
        <Alert
          message="库存预警"
          description={`当前有 ${statistics.lowStockCount} 个商品库存不足，${statistics.outOfStockCount} 个商品已缺货，请及时补货！`}
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Card>
        {/* 搜索和筛选区域 */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="搜索商品名称、编码或规格"
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="商品分类"
                allowClear
                value={filters.categoryId}
                onChange={(value) => handleFilterChange('categoryId', value)}
                style={{ width: '100%' }}
              >
                <Option value="食品">食品</Option>
                <Option value="饮料">饮料</Option>
                <Option value="日用品">日用品</Option>
                <Option value="电子产品">电子产品</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="存储位置"
                allowClear
                value={filters.locationId}
                onChange={(value) => handleFilterChange('locationId', value)}
                style={{ width: '100%' }}
              >
                {locations.map((location) => (
                  <Option key={location.id} value={location.id}>
                    {location.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="库存状态"
                allowClear
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                style={{ width: '100%' }}
              >
                <Option value={InventoryStatus.IN_STOCK}>有库存</Option>
                <Option value={InventoryStatus.LOW_STOCK}>库存不足</Option>
                <Option value={InventoryStatus.OUT_OF_STOCK}>无库存</Option>
                <Option value={InventoryStatus.DISCONTINUED}>停产</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                onChange={handleDateRangeChange}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </div>

        {/* 操作按钮区域 */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onEdit?.({} as InventoryItem)}
            >
              新建库存项
            </Button>
            <Button icon={<SyncOutlined />} onClick={handleSync} loading={loading}>
              同步数据
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出数据
            </Button>
            <Button icon={<WarningOutlined />} onClick={() => setAlertVisible(true)}>
              库存预警
            </Button>
            {selectedItems.length > 0 && (
              <>
                <Button danger icon={<DeleteOutlined />} onClick={handleBatchDelete}>
                  批量删除 ({selectedItems.length})
                </Button>
                <Button onClick={() => setSelectedItems([])}>取消选择</Button>
              </>
            )}
            <Button onClick={handleResetFilters}>重置筛选</Button>
          </Space>
        </div>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={inventoryItems}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
          }}
          scroll={{ x: 1500 }}
          size="middle"
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title={
          <Space>
            <span>库存详情</span>
            {currentRecord && getStatusTag(currentRecord.status)}
          </Space>
        }
        width={800}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnClose
      >
        {currentRecord && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="商品编码">{currentRecord.productCode}</Descriptions.Item>
              <Descriptions.Item label="商品名称">{currentRecord.productName}</Descriptions.Item>
              <Descriptions.Item label="商品分类">
                {currentRecord.productCategory}
              </Descriptions.Item>
              <Descriptions.Item label="商品规格">{currentRecord.productSpec}</Descriptions.Item>
              <Descriptions.Item label="计量单位">{currentRecord.unit}</Descriptions.Item>
              <Descriptions.Item label="存储位置">{currentRecord.locationName}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="库存信息" bordered column={2} style={{ marginTop: 24 }}>
              <Descriptions.Item label="当前库存">
                <Text strong>
                  {currentRecord.currentStock} {currentRecord.unit}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="最小库存">
                {currentRecord.minStock} {currentRecord.unit}
              </Descriptions.Item>
              <Descriptions.Item label="最大库存">
                {currentRecord.maxStock} {currentRecord.unit}
              </Descriptions.Item>
              <Descriptions.Item label="安全库存">
                {currentRecord.safeStock} {currentRecord.unit}
              </Descriptions.Item>
              <Descriptions.Item label="平均成本">
                {formatCurrency(currentRecord.averageCost)}
              </Descriptions.Item>
              <Descriptions.Item label="库存总值">
                {formatCurrency(currentRecord.totalValue)}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="时间信息" bordered column={2} style={{ marginTop: 24 }}>
              <Descriptions.Item label="最后入库">
                {currentRecord.lastInboundDate ? formatDate(currentRecord.lastInboundDate) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最后出库">
                {currentRecord.lastOutboundDate ? formatDate(currentRecord.lastOutboundDate) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最后更新" span={2}>
                {formatDate(currentRecord.lastUpdated)}
              </Descriptions.Item>
            </Descriptions>

            {currentRecord.remark && (
              <Descriptions title="备注" bordered column={1} style={{ marginTop: 24 }}>
                <Descriptions.Item label="备注信息">{currentRecord.remark}</Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default InventoryList;
