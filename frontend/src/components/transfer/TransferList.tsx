/**
 * 调拨列表组件
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Dropdown,
  Modal,
  message,
  Tooltip,
  Divider,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd/es/menu';
import {
  PlusOutlined,
  SearchOutlined,
  ExportOutlined,
  PrinterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useTransferStore, useTransferSelectors } from '@/stores/transferStore';
import {
  Transfer,
  TransferStatus,
  TransferType,
  TransferPriority,
  TransferFilters,
} from '@/types/transfer';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';

const { RangePicker } = DatePicker;
const { Search } = Input;

/**
 * 调拨列表组件属性
 */
interface TransferListProps {
  onView?: (transfer: Transfer) => void;
  onEdit?: (transfer: Transfer) => void;
  onCreate?: () => void;
}

/**
 * 调拨状态选项
 */
const statusOptions = [
  { label: '草稿', value: TransferStatus.DRAFT, color: 'default' },
  { label: '待审批', value: TransferStatus.PENDING_APPROVAL, color: 'processing' },
  { label: '已审批', value: TransferStatus.APPROVED, color: 'success' },
  { label: '已拒绝', value: TransferStatus.REJECTED, color: 'error' },
  { label: '调拨中', value: TransferStatus.IN_TRANSIT, color: 'warning' },
  { label: '部分收货', value: TransferStatus.PARTIAL_RECEIVED, color: 'warning' },
  { label: '已完成', value: TransferStatus.COMPLETED, color: 'success' },
  { label: '已取消', value: TransferStatus.CANCELLED, color: 'default' },
  { label: '异常', value: TransferStatus.EXCEPTION, color: 'error' },
];

/**
 * 调拨类型选项
 */
const typeOptions = [
  { label: '仓库间调拨', value: TransferType.WAREHOUSE_TO_WAREHOUSE },
  { label: '门店间调拨', value: TransferType.STORE_TO_STORE },
  { label: '仓库到门店', value: TransferType.WAREHOUSE_TO_STORE },
  { label: '门店到仓库', value: TransferType.STORE_TO_WAREHOUSE },
  { label: '紧急调拨', value: TransferType.EMERGENCY },
];

/**
 * 调拨优先级选项
 */
const priorityOptions = [
  { label: '低', value: TransferPriority.LOW, color: 'default' },
  { label: '普通', value: TransferPriority.NORMAL, color: 'blue' },
  { label: '高', value: TransferPriority.HIGH, color: 'orange' },
  { label: '紧急', value: TransferPriority.URGENT, color: 'red' },
];

/**
 * 调拨列表组件
 */
const TransferList: React.FC<TransferListProps> = ({ onView, onEdit, onCreate }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const {
    transfers,
    loading,
    error,
    selectedTransferIds,
    statistics,
    queryParams,
  } = useTransferStore();

  const {
    fetchTransfers,
    deleteTransfer,
    submitTransfer,
    approveTransfer,
    rejectTransfer,
    startTransfer,
    cancelTransfer,
    batchDelete,
    batchApprove,
    batchReject,
    selectTransfer,
    selectAllTransfers,
    clearSelection,
    setFilters,
    setQueryParams,
    fetchStatistics,
  } = useTransferStore();

  const isLoading = useTransferSelectors.isLoading();
  const errorInfo = useTransferSelectors.error();

  // 获取状态标签
  const getStatusTag = (status: TransferStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return (
      <Tag color={option?.color || 'default'}>
        {option?.label || status}
      </Tag>
    );
  };

  // 获取类型标签
  const getTypeTag = (type: TransferType) => {
    const option = typeOptions.find(opt => opt.value === type);
    return <Tag>{option?.label || type}</Tag>;
  };

  // 获取优先级标签
  const getPriorityTag = (priority: TransferPriority) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return (
      <Tag color={option?.color || 'default'}>
        {option?.label || priority}
      </Tag>
    );
  };

  // 删除单个调拨
  const handleDelete = (transfer: Transfer) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除调拨单"${transfer.transferNumber}"吗？此操作不可恢复。`,
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteTransfer(transfer.id);
          message.success('删除成功');
          await fetchTransfers();
          await fetchStatistics();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 提交审批
  const handleSubmit = async (transfer: Transfer) => {
    try {
      await submitTransfer(transfer.id);
      message.success('提交审批成功');
      await fetchTransfers();
      await fetchStatistics();
    } catch (error) {
      message.error('提交审批失败');
    }
  };

  // 审批操作
  const handleApproval = async (transfer: Transfer, approve: boolean, comment?: string) => {
    try {
      if (approve) {
        await approveTransfer(transfer.id, comment);
        message.success('审批通过');
      } else {
        await rejectTransfer(transfer.id, comment || '');
        message.success('已拒绝');
      }
      await fetchTransfers();
      await fetchStatistics();
    } catch (error) {
      message.error(approve ? '审批失败' : '拒绝失败');
    }
  };

  // 开始调拨
  const handleStartTransfer = async (transfer: Transfer) => {
    try {
      await startTransfer(transfer.id);
      message.success('调拨已开始');
      await fetchTransfers();
      await fetchStatistics();
    } catch (error) {
      message.error('开始调拨失败');
    }
  };

  // 取消调拨
  const handleCancelTransfer = (transfer: Transfer) => {
    Modal.confirm({
      title: '确认取消',
      content: `确定要取消调拨单"${transfer.transferNumber}"吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await cancelTransfer(transfer.id, '用户取消');
          message.success('已取消调拨');
          await fetchTransfers();
          await fetchStatistics();
        } catch (error) {
          message.error('取消失败');
        }
      },
    });
  };

  // 批量操作菜单
  const batchMenuItems: MenuProps['items'] = [
    {
      key: 'approve',
      label: '批量审批',
      icon: <CheckOutlined />,
      disabled: selectedTransferIds.length === 0,
      onClick: () => {
        Modal.confirm({
          title: '批量审批确认',
          content: `确定要批量审批 ${selectedTransferIds.length} 个调拨单吗？`,
          onOk: async () => {
            try {
              await batchApprove(selectedTransferIds);
              message.success('批量审批成功');
              await fetchTransfers();
              await fetchStatistics();
            } catch (error) {
              message.error('批量审批失败');
            }
          },
        });
      },
    },
    {
      key: 'reject',
      label: '批量拒绝',
      icon: <CloseOutlined />,
      disabled: selectedTransferIds.length === 0,
      onClick: () => {
        Modal.confirm({
          title: '批量拒绝确认',
          content: `确定要批量拒绝 ${selectedTransferIds.length} 个调拨单吗？`,
          onOk: async () => {
            try {
              await batchReject(selectedTransferIds, '批量拒绝');
              message.success('批量拒绝成功');
              await fetchTransfers();
              await fetchStatistics();
            } catch (error) {
              message.error('批量拒绝失败');
            }
          },
        });
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '批量删除',
      icon: <DeleteOutlined />,
      disabled: selectedTransferIds.length === 0,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: '批量删除确认',
          content: `确定要批量删除 ${selectedTransferIds.length} 个调拨单吗？此操作不可恢复。`,
          icon: <ExclamationCircleOutlined />,
          okText: '确认删除',
          cancelText: '取消',
          okButtonProps: { danger: true },
          onOk: async () => {
            try {
              await batchDelete(selectedTransferIds);
              message.success('批量删除成功');
              await fetchTransfers();
              await fetchStatistics();
            } catch (error) {
              message.error('批量删除失败');
            }
          },
        });
      },
    },
  ];

  // 单个操作菜单
  const getActionMenuItems = (transfer: Transfer): MenuProps['items'] => {
    const items: MenuProps['items'] = [];

    if (transfer.status === TransferStatus.DRAFT) {
      items.push({
        key: 'submit',
        label: '提交审批',
        icon: <CheckOutlined />,
        onClick: () => handleSubmit(transfer),
      });
    }

    if (transfer.status === TransferStatus.PENDING_APPROVAL) {
      items.push(
        {
          key: 'approve',
          label: '审批通过',
          icon: <CheckOutlined />,
          onClick: () => handleApproval(transfer, true),
        },
        {
          key: 'reject',
          label: '审批拒绝',
          icon: <CloseOutlined />,
          onClick: () => handleApproval(transfer, false),
        }
      );
    }

    if (transfer.status === TransferStatus.APPROVED) {
      items.push({
        key: 'start',
        label: '开始调拨',
        icon: <CheckOutlined />,
        onClick: () => handleStartTransfer(transfer),
      });
    }

    if ([TransferStatus.DRAFT, TransferStatus.PENDING_APPROVAL, TransferStatus.REJECTED].includes(transfer.status)) {
      items.push({
        key: 'cancel',
        label: '取消调拨',
        icon: <CloseOutlined />,
        onClick: () => handleCancelTransfer(transfer),
      });
    }

    if (transfer.status === TransferStatus.DRAFT) {
      items.push({
        type: 'divider',
      });
      items.push({
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(transfer),
      });
    }

    return items;
  };

  // 搜索和过滤
  const handleSearch = (value: string) => {
    setFilters({ search: value });
    fetchTransfers();
  };

  const handleStatusFilter = (value: TransferStatus | undefined) => {
    setFilters({ status: value });
    fetchTransfers();
  };

  const handleTypeFilter = (value: TransferType | undefined) => {
    setFilters({ type: value });
    fetchTransfers();
  };

  const handlePriorityFilter = (value: TransferPriority | undefined) => {
    setFilters({ priority: value });
    fetchTransfers();
  };

  const handleDateFilter = (dates: any) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      setFilters({
        dateRange: [
          start.format('YYYY-MM-DD'),
          end.format('YYYY-MM-DD'),
        ],
      });
    } else {
      setFilters({ dateRange: undefined });
    }
    fetchTransfers();
  };

  // 导出数据
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 打印功能
  const handlePrint = () => {
    message.info('打印功能开发中...');
  };

  // 表格列定义
  const columns: ColumnsType<Transfer> = [
    {
      title: '调拨单号',
      dataIndex: 'transferNumber',
      key: 'transferNumber',
      width: 150,
      fixed: 'left',
    },
    {
      title: '调拨标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: TransferType) => getTypeTag(type),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: TransferStatus) => getStatusTag(status),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: TransferPriority) => getPriorityTag(priority),
    },
    {
      title: '调出位置',
      dataIndex: ['fromLocation', 'name'],
      key: 'fromLocation',
      width: 150,
      ellipsis: true,
    },
    {
      title: '调入位置',
      dataIndex: ['toLocation', 'name'],
      key: 'toLocation',
      width: 150,
      ellipsis: true,
    },
    {
      title: '计划日期',
      dataIndex: 'plannedDate',
      key: 'plannedDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: '实际发货',
      dataIndex: 'actualShipDate',
      key: 'actualShipDate',
      width: 120,
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: '实际收货',
      dataIndex: 'actualReceiveDate',
      key: 'actualReceiveDate',
      width: 120,
      render: (date: string) => date ? formatDate(date) : '-',
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: '申请人',
      dataIndex: ['applicant', 'name'],
      key: 'applicant',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (time: string) => formatDateTime(time),
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
            />
          </Tooltip>

          {record.status === TransferStatus.DRAFT && (
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit?.(record)}
              />
            </Tooltip>
          )}

          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // 选择配置
  const rowSelection = {
    selectedRowKeys: selectedTransferIds,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
      keys.forEach(key => {
        if (!selectedTransferIds.includes(key as string)) {
          selectTransfer(key as string);
        }
      });
      selectedTransferIds.forEach(id => {
        if (!keys.includes(id)) {
          selectTransfer(id);
        }
      });
    },
    onSelectAll: (selected: boolean) => {
      if (selected) {
        selectAllTransfers();
        setSelectedRowKeys(transfers.map(t => t.id));
      } else {
        clearSelection();
        setSelectedRowKeys([]);
      }
    },
  };

  // 分页配置
  const pagination = {
    current: queryParams.page,
    pageSize: queryParams.pageSize,
    total: statistics?.totalTransfers || 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    onChange: (page: number, pageSize: number) => {
      setQueryParams({ page, pageSize });
      fetchTransfers();
    },
  };

  // 初始化数据
  useEffect(() => {
    fetchTransfers();
    fetchStatistics();
  }, []);

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="总调拨单"
                value={statistics.totalTransfers}
                prefix={<PlusOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="待审批"
                value={statistics.pendingApprovalTransfers}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="调拨中"
                value={statistics.inTransitTransfers}
                valueStyle={{ color: '#faad14' }}
                prefix={<MoreOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="已完成"
                value={statistics.completedTransfers}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* 搜索和操作栏 */}
      <Card>
        <div className="space-y-4">
          {/* 搜索行 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="搜索调拨单号、标题、位置"
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="状态"
                allowClear
                onChange={handleStatusFilter}
                style={{ width: '100%' }}
              >
                {statusOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="类型"
                allowClear
                onChange={handleTypeFilter}
                style={{ width: '100%' }}
              >
                {typeOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="优先级"
                allowClear
                onChange={handlePriorityFilter}
                style={{ width: '100%' }}
              >
                {priorityOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                onChange={handleDateFilter}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>

          {/* 操作行 */}
          <div className="flex items-center justify-between">
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onCreate}
              >
                新建调拨
              </Button>

              <Dropdown
                menu={{ items: batchMenuItems }}
                disabled={selectedTransferIds.length === 0}
              >
                <Button>
                  批量操作 ({selectedTransferIds.length})
                </Button>
              </Dropdown>

              <Divider type="vertical" />

              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出
              </Button>

              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                打印
              </Button>
            </Space>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchTransfers();
                fetchStatistics();
              }}
              loading={loading}
            >
              刷新
            </Button>
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={transfers}
          rowKey="id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={pagination}
          scroll={{ x: 1800 }}
          size="middle"
        />
      </Card>

      {/* 错误提示 */}
      {errorInfo && (
        <Card className="text-center">
          <p className="text-red-500">{errorInfo}</p>
          <Button
            type="primary"
            onClick={() => {
              fetchTransfers();
              fetchStatistics();
            }}
          >
            重试
          </Button>
        </Card>
      )}
    </div>
  );
};

export default TransferList;