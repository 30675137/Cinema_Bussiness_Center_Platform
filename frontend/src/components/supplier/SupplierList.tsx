/**
 * 供应商列表组件
 */
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  message,
  Dropdown,
  Card,
  Row,
  Col,
  Statistic,
  Tooltip
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ExportOutlined,
  ImportOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useSupplierStore } from '@/stores/supplierStore';
import { Supplier, SupplierStatus, SupplierLevel, SupplierType } from '@/types/supplier';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/utils/formatters';
// import DataTable from '@/components/common/DataTable';
// import StatusTag from '@/components/common/StatusTag';

const { Search } = Input;
const { Option } = Select;

interface SupplierListProps {
  onView?: (supplier: Supplier) => void;
  onEdit?: (supplier: Supplier) => void;
  onCreate?: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({
  onView,
  onEdit,
  onCreate
}) => {
  const {
    suppliers,
    loading,
    filteredSuppliers,
    selectedSupplierIds,
    statusFilter,
    levelFilter,
    typeFilter,
    searchQuery,
    currentPage,
    pageSize,
    total,
    fetchSuppliers,
    deleteSupplier,
    activateSupplier,
    suspendSupplier,
    terminateSupplier,
    setStatusFilter,
    setLevelFilter,
    setTypeFilter,
    clearFilters,
    selectSupplier,
    selectAllSuppliers,
    clearSelection,
    exportSuppliers
  } = useSupplierStore();

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers({
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      status: statusFilter,
      level: levelFilter,
      type: typeFilter
    });
  }, [currentPage, pageSize, searchQuery, statusFilter, levelFilter, typeFilter]);

  // 供应商状态配置
  const statusConfig = {
    [SupplierStatus.ACTIVE]: { color: 'green', text: '正常合作' },
    [SupplierStatus.SUSPENDED]: { color: 'orange', text: '暂停合作' },
    [SupplierStatus.TERMINATED]: { color: 'red', text: '终止合作' },
    [SupplierStatus.PENDING_APPROVAL]: { color: 'blue', text: '待审批' },
    [SupplierStatus.UNDER_REVIEW]: { color: 'purple', text: '复核中' }
  };

  // 供应商等级配置
  const levelConfig = {
    [SupplierLevel.STRATEGIC]: { color: 'gold', text: '战略供应商', icon: '⭐⭐⭐' },
    [SupplierLevel.PREFERRED]: { color: 'blue', text: '优选供应商', icon: '⭐⭐' },
    [SupplierLevel.STANDARD]: { color: 'green', text: '标准供应商', icon: '⭐' },
    [SupplierLevel.TRIAL]: { color: 'gray', text: '试用供应商', icon: '📋' }
  };

  // 供应商类型配置
  const typeConfig = {
    [SupplierType.MANUFACTURER]: '生产商',
    [SupplierType.WHOLESALER]: '批发商',
    [SupplierType.DISTRIBUTOR]: '经销商',
    [SupplierType.SERVICE_PROVIDER]: '服务提供商',
    [SupplierType.OTHER]: '其他'
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setLocalSearchQuery(value);
    useSupplierStore.setState({ searchQuery: value });
  };

  // 处理状态变更
  const handleStatusChange = async (supplierId: string, newStatus: SupplierStatus, remarks?: string) => {
    setActionLoading(supplierId);
    try {
      let success = false;
      switch (newStatus) {
        case SupplierStatus.ACTIVE:
          success = await activateSupplier(supplierId, remarks);
          break;
        case SupplierStatus.SUSPENDED:
          success = await suspendSupplier(supplierId, remarks);
          break;
        case SupplierStatus.TERMINATED:
          success = await terminateSupplier(supplierId, remarks);
          break;
      }

      if (success) {
        message.success('状态更新成功');
        fetchSuppliers();
      } else {
        message.error('状态更新失败');
      }
    } catch (error) {
      console.error('Status change error:', error);
      message.error('操作失败，请重试');
    } finally {
      setActionLoading(null);
    }
  };

  // 处理删除
  const handleDelete = (supplier: Supplier) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除供应商"${supplier.name}"吗？此操作不可撤销。`,
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        setActionLoading(supplier.id);
        try {
          const success = await deleteSupplier(supplier.id);
          if (success) {
            message.success('删除成功');
            fetchSuppliers();
          } else {
            message.error('删除失败');
          }
        } catch (error) {
          console.error('Delete error:', error);
          message.error('删除失败，请重试');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  // 处理导出
  const handleExport = async (supplierIds?: string[]) => {
    try {
      const downloadUrl = await exportSuppliers({ supplierIds });
      message.success('导出成功');
      // TODO: 实现文件下载
    } catch (error) {
      console.error('Export error:', error);
      message.error('导出失败，请重试');
    }
  };

  // 表格列定义
  const columns: ColumnsType<Supplier> = [
    {
      title: '供应商信息',
      key: 'supplierInfo',
      width: 300,
      render: (_, record) => (
        <div>
          <div className="flex items-center mb-1">
            <span className="font-medium text-gray-900">{record.name}</span>
            {record.level && (
              <span className="ml-2 text-xs">{levelConfig[record.level]?.icon}</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            <span className="mr-4">编号: {record.code}</span>
            {record.shortName && <span>简称: {record.shortName}</span>}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {typeConfig[record.type]}
          </div>
        </div>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <PhoneOutlined className="mr-1 text-gray-400" />
            {formatPhoneNumber(record.phone)}
          </div>
          {record.email && (
            <div className="flex items-center text-sm">
              <MailOutlined className="mr-1 text-gray-400" />
              <span className="truncate" title={record.email}>{record.email}</span>
            </div>
          )}
          <div className="flex items-center text-xs text-gray-500">
            <UserOutlined className="mr-1" />
            {record.contacts.length > 0 ? `${record.contacts.length}个联系人` : '无联系人'}
          </div>
        </div>
      )
    },
    {
      title: '供应品类',
      key: 'categories',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="space-y-1">
            {record.productCategories.slice(0, 2).map((category, index) => (
              <Tag key={index} size="small">{category}</Tag>
            ))}
            {record.productCategories.length > 2 && (
              <Tag size="small" color="default">+{record.productCategories.length - 2}</Tag>
            )}
          </div>
          {record.mainProducts && (
            <div className="text-xs text-gray-500 mt-1">
              主营: {record.mainProducts.slice(0, 20)}
              {record.mainProducts.length > 20 && '...'}
            </div>
          )}
        </div>
      )
    },
    {
      title: '采购统计',
      key: 'stats',
      width: 150,
      render: (_, record) => (
        <div className="text-sm">
          <div>订单: {record.purchaseStats.totalOrders}次</div>
          <div>金额: {formatCurrency(record.purchaseStats.totalAmount)}</div>
          <div className="text-xs text-gray-500">
            准时率: {record.purchaseStats.onTimeDeliveryRate}%
          </div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: SupplierStatus) => (
        <StatusTag status={status} config={statusConfig} />
      )
    },
    {
      title: '评价',
      key: 'evaluation',
      width: 100,
      render: (_, record) => {
        const latestEvaluation = record.evaluations[record.evaluations.length - 1];
        return latestEvaluation ? (
          <div className="text-center">
            <div className="flex items-center justify-center">
              <StarOutlined className="text-yellow-400 mr-1" />
              <span className="font-medium">{latestEvaluation.score}</span>
            </div>
            <Tag
              size="small"
              color={
                latestEvaluation.grade === 'A' ? 'green' :
                latestEvaluation.grade === 'B' ? 'blue' :
                latestEvaluation.grade === 'C' ? 'orange' : 'red'
              }
            >
              {latestEvaluation.grade}
            </Tag>
          </div>
        ) : (
          <span className="text-gray-400 text-xs">暂无评价</span>
        );
      }
    },
    {
      title: '合作时间',
      key: 'cooperation',
      width: 120,
      render: (_, record) => (
        <div className="text-sm">
          <div>开始: {formatDate(record.cooperationStartDate)}</div>
          {record.cooperationEndDate && (
            <div className="text-xs text-gray-500">
              结束: {formatDate(record.cooperationEndDate)}
            </div>
          )}
        </div>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onView?.(record)}
              disabled={actionLoading === record.id}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(record)}
              disabled={actionLoading === record.id}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'activate',
                  label: '激活',
                  disabled: record.status === SupplierStatus.ACTIVE,
                  onClick: () => handleStatusChange(record, SupplierStatus.ACTIVE)
                },
                {
                  key: 'suspend',
                  label: '暂停合作',
                  disabled: record.status !== SupplierStatus.ACTIVE,
                  onClick: () => handleStatusChange(record, SupplierStatus.SUSPENDED)
                },
                {
                  key: 'terminate',
                  label: '终止合作',
                  disabled: record.status === SupplierStatus.TERMINATED,
                  onClick: () => handleStatusChange(record, SupplierStatus.TERMINATED),
                  danger: true
                },
                {
                  type: 'divider'
                },
                {
                  key: 'delete',
                  label: '删除',
                  danger: true,
                  onClick: () => handleDelete(record)
                }
              ]
            }}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              loading={actionLoading === record.id}
            />
          </Dropdown>
        </Space>
      )
    }
  ];

  // 搜索表单配置
  const searchFields = [
    {
      name: 'search',
      label: '搜索',
      component: (
        <Search
          placeholder="搜索供应商名称、编号、联系人"
          allowClear
          enterButton
          onSearch={handleSearch}
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
        />
      ),
      span: 8
    },
    {
      name: 'status',
      label: '状态',
      component: (
        <Select
          placeholder="选择状态"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: '100%' }}
        >
          {Object.entries(statusConfig).map(([key, config]) => (
            <Option key={key} value={key}>
              <Tag color={config.color}>{config.text}</Tag>
            </Option>
          ))}
        </Select>
      ),
      span: 4
    },
    {
      name: 'level',
      label: '等级',
      component: (
        <Select
          placeholder="选择等级"
          allowClear
          value={levelFilter}
          onChange={setLevelFilter}
          style={{ width: '100%' }}
        >
          {Object.entries(levelConfig).map(([key, config]) => (
            <Option key={key} value={key}>
              <span>{config.icon} {config.text}</span>
            </Option>
          ))}
        </Select>
      ),
      span: 4
    },
    {
      name: 'type',
      label: '类型',
      component: (
        <Select
          placeholder="选择类型"
          allowClear
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: '100%' }}
        >
          {Object.entries(typeConfig).map(([key, label]) => (
            <Option key={key} value={key}>{label}</Option>
          ))}
        </Select>
      ),
      span: 4
    }
  ];

  // 工具栏操作
  const toolbarActions = [
    {
      key: 'create',
      label: '新建供应商',
      icon: <PlusOutlined />,
      onClick: onCreate
    },
    {
      key: 'import',
      label: '导入',
      icon: <ImportOutlined />,
      onClick: () => message.info('导入功能开发中')
    },
    {
      key: 'export',
      label: '导出',
      icon: <ExportOutlined />,
      onClick: () => handleExport(selectedSupplierIds.length > 0 ? selectedSupplierIds : undefined)
    }
  ];

  return (
    <div className="supplier-list">
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="总供应商"
              value={suppliers.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="活跃供应商"
              value={suppliers.filter(s => s.status === SupplierStatus.ACTIVE).length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="战略供应商"
              value={suppliers.filter(s => s.level === SupplierLevel.STRATEGIC).length}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="即将到期资质"
              value={0} // TODO: 计算即将到期的资质数量
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#d46b08' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="供应商列表">
        <div className="mb-4">
          <Row gutter={16}>
            <Col span={8}>
              <Search
                placeholder="搜索供应商名称、编号、联系人"
                allowClear
                enterButton
                onSearch={handleSearch}
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="选择状态"
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
              >
                {Object.entries(statusConfig).map(([key, config]) => (
                  <Option key={key} value={key}>
                    <Tag color={config.color}>{config.text}</Tag>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="选择等级"
                allowClear
                value={levelFilter}
                onChange={setLevelFilter}
                style={{ width: '100%' }}
              >
                {Object.entries(levelConfig).map(([key, config]) => (
                  <Option key={key} value={key}>
                    {config.icon} {config.text}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={8}>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={onCreate}
                >
                  新建供应商
                </Button>
                <Button icon={<ImportOutlined />}>导入</Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => handleExport(selectedSupplierIds.length > 0 ? selectedSupplierIds : undefined)}
                >
                  导出
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          loading={loading}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedSupplierIds,
            onChange: (selectedRowKeys, selectedRows) => {
              clearSelection();
              selectedRowKeys.forEach((key) => {
                selectSupplier(key as string, true);
              });
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
              selectAllSuppliers(selected);
            }
          }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            onChange: (page, size) => {
              useSupplierStore.setState({ currentPage: page, pageSize: size });
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default SupplierList;