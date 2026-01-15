/**
 * 采购订单列表组件
 */
import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Dropdown,
  Modal,
  message,
  Tooltip,
  Typography,
  Divider,
  Badge,
  Input,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd/es/menu';
import {
  PlusOutlined,
  ExportOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { usePurchaseOrderStore } from '../../stores/purchaseOrderStore';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderPriority } from '../../types/purchase';
import { formatCurrency, formatDate } from '../../utils/formatters';
import DataTable from '../common/DataTable';
import StatusTag from '../common/StatusTag';
import PageContainer from '../common/PageContainer';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Title, Text } = Typography;

// 采购订单状态映射
const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  [PurchaseOrderStatus.DRAFT]: { label: '草稿', color: 'default' },
  [PurchaseOrderStatus.PENDING]: { label: '待审核', color: 'processing' },
  [PurchaseOrderStatus.APPROVED]: { label: '已审核', color: 'success' },
  [PurchaseOrderStatus.REJECTED]: { label: '已拒绝', color: 'error' },
  [PurchaseOrderStatus.CONFIRMED]: { label: '已确认', color: 'success' },
  [PurchaseOrderStatus.PARTIAL_RECEIVED]: { label: '部分收货', color: 'warning' },
  [PurchaseOrderStatus.COMPLETED]: { label: '已完成', color: 'success' },
  [PurchaseOrderStatus.CANCELLED]: { label: '已取消', color: 'error' },
};

// 优先级映射
const PRIORITY_MAP: Record<string, { label: string; color: string }> = {
  [PurchaseOrderPriority.LOW]: { label: '低', color: 'default' },
  [PurchaseOrderPriority.NORMAL]: { label: '普通', color: 'blue' },
  [PurchaseOrderPriority.HIGH]: { label: '高', color: 'orange' },
  [PurchaseOrderPriority.URGENT]: { label: '紧急', color: 'red' },
};

interface PurchaseOrderListProps {
  onOrderSelect?: (order: PurchaseOrder) => void;
  onOrderEdit?: (order: PurchaseOrder) => void;
  onOrderView?: (order: PurchaseOrder) => void;
  onOrderCreate?: () => void;
  showHeader?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  height?: number;
}

/**
 * 采购订单列表组件
 */
const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  onOrderSelect,
  onOrderEdit,
  onOrderView,
  onOrderCreate,
  showHeader = true,
  showFilters = true,
  showActions = true,
  height,
}) => {
  // Store状态
  const {
    loading,
    error,
    orders,
    filteredOrders,
    pagination,
    selectedOrderIds,
    keyword,
    statusFilters,
    priorityFilter,
    supplierFilter,
    dateRange,

    // 动作
    fetchOrders,
    deleteOrder,
    approveOrder,
    rejectOrder,
    confirmOrder,
    cancelOrder,
    duplicateOrder,
    exportOrders,
    selectOrder,
    selectAllOrders,
    clearSelection,
    setKeyword,
    setStatusFilters,
    setPriorityFilter,
    setSupplierFilter,
    setDateRange,
    setCurrentPage,
    setPageSize,
  } = usePurchaseOrderStore();

  // 本地状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // 初始化数据
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // 同步选中状态
  useEffect(() => {
    setSelectedRowKeys(selectedOrderIds);
  }, [selectedOrderIds]);

  // 处理表格选择
  const handleTableSelect = (selectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(selectedRowKeys as string[]);
    // 更新store中的选中状态
    selectedRowKeys.forEach((key) => {
      selectOrder(key as string, true);
    });
  };

  // 处理查看订单
  const handleViewOrder = (order: PurchaseOrder) => {
    if (onOrderView) {
      onOrderView(order);
    }
  };

  // 处理编辑订单
  const handleEditOrder = (order: PurchaseOrder) => {
    if (onOrderEdit) {
      onOrderEdit(order);
    }
  };

  // 处理删除订单
  const handleDeleteOrder = (order: PurchaseOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除采购订单 ${order.orderNumber} 吗？此操作不可撤销。`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const success = await deleteOrder(order.id);
        if (success) {
          message.success('删除成功');
          fetchOrders();
        } else {
          message.error('删除失败');
        }
      },
    });
  };

  // 处理复制订单
  const handleDuplicateOrder = async (order: PurchaseOrder) => {
    const orderId = await duplicateOrder(order.id);
    if (orderId) {
      message.success('复制成功');
      fetchOrders();
    } else {
      message.error('复制失败');
    }
  };

  // 处理审批订单
  const handleApproveOrder = (order: PurchaseOrder) => {
    Modal.confirm({
      title: '确认审批',
      content: `确定要审批采购订单 ${order.orderNumber} 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const success = await approveOrder(order.id);
        if (success) {
          message.success('审批成功');
          fetchOrders();
        } else {
          message.error('审批失败');
        }
      },
    });
  };

  // 处理拒绝订单
  const handleRejectOrder = (order: PurchaseOrder) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝采购订单 ${order.orderNumber} 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const success = await rejectOrder(order.id, '审批拒绝');
        if (success) {
          message.success('拒绝成功');
          fetchOrders();
        } else {
          message.error('拒绝失败');
        }
      },
    });
  };

  // 处理确认订单
  const handleConfirmOrder = (order: PurchaseOrder) => {
    Modal.confirm({
      title: '确认订单',
      content: `确定要确认采购订单 ${order.orderNumber} 吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        const success = await confirmOrder(order.id);
        if (success) {
          message.success('确认成功');
          fetchOrders();
        } else {
          message.error('确认失败');
        }
      },
    });
  };

  // 处理导出
  const handleExport = async () => {
    try {
      await exportOrders();
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    fetchOrders();
  };

  // 计算操作菜单
  const getActionMenuItems = (order: PurchaseOrder): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: '查看详情',
        onClick: () => handleViewOrder(order),
      },
    ];

    if (
      order.status === PurchaseOrderStatus.DRAFT ||
      order.status === PurchaseOrderStatus.REJECTED
    ) {
      items.push({
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => handleEditOrder(order),
      });
    }

    if (order.status === PurchaseOrderStatus.PENDING) {
      items.push(
        {
          key: 'approve',
          icon: <CheckOutlined />,
          label: '审批',
          onClick: () => handleApproveOrder(order),
        },
        {
          key: 'reject',
          icon: <CloseOutlined />,
          label: '拒绝',
          onClick: () => handleRejectOrder(order),
        }
      );
    }

    if (order.status === PurchaseOrderStatus.APPROVED) {
      items.push({
        key: 'confirm',
        icon: <CheckOutlined />,
        label: '确认',
        onClick: () => handleConfirmOrder(order),
      });
    }

    items.push(
      {
        type: 'divider',
      },
      {
        key: 'duplicate',
        icon: <CopyOutlined />,
        label: '复制订单',
        onClick: () => handleDuplicateOrder(order),
      },
      {
        key: 'export',
        icon: <ExportOutlined />,
        label: '导出',
        onClick: () => exportOrders({ keyword: order.orderNumber }),
      },
      {
        key: 'print',
        icon: <PrinterOutlined />,
        label: '打印',
        onClick: () => window.print(),
      }
    );

    if (order.status === PurchaseOrderStatus.DRAFT) {
      items.push(
        {
          type: 'divider',
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: '删除',
          danger: true,
          onClick: () => handleDeleteOrder(order),
        }
      );
    }

    return items;
  };

  // 表格列定义
  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: '订单编号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      fixed: 'left',
      render: (text: string, record: PurchaseOrder) => (
        <Button type="link" size="small" onClick={() => handleViewOrder(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '供应商',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PurchaseOrderStatus) => (
        <StatusTag status={status} statusMap={ORDER_STATUS_MAP} />
      ),
      filters: Object.entries(ORDER_STATUS_MAP).map(([key, value]) => ({
        text: value.label,
        value: key,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: PurchaseOrderPriority) => (
        <StatusTag status={priority} statusMap={PRIORITY_MAP} />
      ),
      filters: Object.entries(PRIORITY_MAP).map(([key, value]) => ({
        text: value.label,
        value: key,
      })),
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: '收货状态',
      dataIndex: 'receiptStatus',
      key: 'receiptStatus',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          pending: { label: '待收货', color: 'default' },
          partial: { label: '部分收货', color: 'warning' },
          completed: { label: '已收货', color: 'success' },
        };
        return <StatusTag status={status} statusMap={statusMap} />;
      },
    },
    {
      title: '创建日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
    },
    {
      title: '预计交付日期',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: '创建人',
      dataIndex: ['createdBy', 'name'],
      key: 'creator',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record: PurchaseOrder) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  // 搜索表单字段
  const searchFields = [
    {
      name: 'keyword',
      label: '关键字',
      type: 'input' as const,
      placeholder: '订单编号、标题、供应商',
      width: 200,
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      placeholder: '选择状态',
      options: Object.entries(ORDER_STATUS_MAP).map(([key, value]) => ({
        value: key,
        label: value.label,
      })),
      width: 120,
    },
    {
      name: 'priority',
      label: '优先级',
      type: 'select' as const,
      placeholder: '选择优先级',
      options: Object.entries(PRIORITY_MAP).map(([key, value]) => ({
        value: key,
        label: value.label,
      })),
      width: 120,
    },
    {
      name: 'dateRange',
      label: '订单日期',
      type: 'dateRange' as const,
      width: 240,
    },
  ];

  return (
    <PageContainer>
      {showHeader && (
        <Card className="mb-4">
          <Row gutter={16} align="middle">
            <Col>
              <Title level={4} className="m-0">
                采购订单管理
              </Title>
            </Col>
            <Col flex="auto">
              <Space size="large">
                <Statistic title="总订单数" value={filteredOrders.length} />
                <Statistic
                  title="待审核"
                  value={
                    filteredOrders.filter((o) => o.status === PurchaseOrderStatus.PENDING).length
                  }
                />
                <Statistic
                  title="已完成"
                  value={
                    filteredOrders.filter((o) => o.status === PurchaseOrderStatus.COMPLETED).length
                  }
                />
              </Space>
            </Col>
          </Row>
        </Card>
      )}

      <DataTable
        columns={columns}
        dataSource={filteredOrders}
        loading={loading}
        error={error}
        searchFields={searchFields}
        showActions={showActions}
        rowSelection={{
          selectedRowKeys,
          onChange: handleTableSelect,
          onSelectAll: (selected, selectedRows, changeRows) => {
            if (selected) {
              selectAllOrders(true);
            } else {
              clearSelection();
            }
          },
        }}
        onSearch={(filters) => {
          if (filters.keyword) setKeyword(filters.keyword);
          if (filters.status) setStatusFilters([filters.status]);
          if (filters.priority) setPriorityFilter(filters.priority as PurchaseOrderPriority);
          if (filters.dateRange) setDateRange(filters.dateRange);
        }}
        onRefresh={handleRefresh}
        onCreate={onOrderCreate}
        onExport={handleExport}
        title="采购订单列表"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            if (pageSize !== pagination.pageSize) {
              setPageSize(pageSize);
            }
          },
        }}
        height={height}
      />
    </PageContainer>
  );
};

export default PurchaseOrderList;
