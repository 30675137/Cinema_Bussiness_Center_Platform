/**
 * 库存调整表格组件
 * 提供调整记录的展示、排序和操作功能
 */

import React, {
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Typography,
  Dropdown,
  Modal,
  message,
  Badge,
  Input,
  Form,
  Radio,
} from 'antd';
import type {
  ColumnsType,
  TableProps,
  TablePaginationConfig,
} from 'antd/es/table';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  PlayCircleOutlined,
  MoreOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { InventoryAdjustment, SortParams, Pagination } from '@/types/inventory';
import {
  getAdjustmentTypeConfig,
  getAdjustmentStatusConfig,
  formatDate,
  formatNumber,
} from '@/utils/inventoryHelpers';
import { useResponsive } from '@/hooks/useResponsive';
import { usePermissions } from '@/hooks/usePermissions';
import AdjustmentModal from './AdjustmentModal';

const { Text } = Typography;
const { TextArea } = Input;

interface AdjustmentTableProps {
  data: InventoryAdjustment[];
  loading: boolean;
  sort: SortParams;
  pagination: Pagination;
  onSortChange: (sort: SortParams) => void;
  onPaginationChange: (pagination: Partial<Pagination>) => void;
  onViewDetails: (adjustment: InventoryAdjustment) => void;
  onApprove?: (adjustment: InventoryAdjustment, approved: boolean, remark?: string) => void;
  onExecute?: (adjustment: InventoryAdjustment) => void;
  onExport?: () => void;
  refreshData?: () => void;
  isApproving?: boolean;
  isExecuting?: boolean;
}

const AdjustmentTable: React.FC<AdjustmentTableProps> = ({
  data,
  loading,
  sort,
  pagination,
  onSortChange,
  onPaginationChange,
  onViewDetails,
  onApprove,
  onExecute,
  onExport,
  refreshData,
  isApproving = false,
  isExecuting = false,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const { canRead, canAdmin } = usePermissions();
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<InventoryAdjustment | null>(null);
  const [approvalForm] = Form.useForm();
  const [executeModalVisible, setExecuteModalVisible] = useState(false);

  // 排序处理
  const handleTableChange = useCallback((
    newPagination: TablePaginationConfig,
    filters: any,
    sorter: any,
  ) => {
    if (sorter.field) {
      onSortChange({
        sortBy: sorter.field,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
      });
    }

    if (newPagination.current !== pagination.current || newPagination.pageSize !== pagination.pageSize) {
      onPaginationChange({
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      });
    }
  }, [sort, pagination, onSortChange, onPaginationChange]);

  // 渲染调整类型标签
  const renderAdjustmentType = useCallback((type: string) => {
    const config = getAdjustmentTypeConfig(type);
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  }, []);

  // 渲染状态标签
  const renderStatus = useCallback((status: string) => {
    const config = getAdjustmentStatusConfig(status);
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  }, []);

  // 渲染调整数量
  const renderQuantity = useCallback((quantity: number) => {
    const isPositive = quantity > 0;
    return (
      <Text strong style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
        {isPositive ? '+' : ''}{formatNumber(quantity)}
      </Text>
    );
  }, []);

  // 渲染时间
  const renderDateTime = useCallback((dateString: string) => (
    <Text style={{ fontSize: '12px' }}>
      {formatDate(dateString, 'MM-DD HH:mm')}
    </Text>
  ), []);

  // 处理审批
  const handleApprove = useCallback((adjustment: InventoryAdjustment) => {
    setSelectedAdjustment(adjustment);
    setApprovalModalVisible(true);
  }, []);

  // 处理审批提交
  const handleApprovalSubmit = useCallback(async (values: any) => {
    if (!selectedAdjustment || !onApprove) return;

    try {
      await onApprove(selectedAdjustment, values.approved, values.remark);
      setApprovalModalVisible(false);
      setSelectedAdjustment(null);
      approvalForm.resetFields();
    } catch (error) {
      console.error('审批失败:', error);
    }
  }, [selectedAdjustment, onApprove, approvalForm]);

  // 处理审批取消
  const handleApprovalCancel = useCallback(() => {
    setApprovalModalVisible(false);
    setSelectedAdjustment(null);
    approvalForm.resetFields();
  }, [approvalForm]);

  // 处理执行
  const handleExecute = useCallback((adjustment: InventoryAdjustment) => {
    setSelectedAdjustment(adjustment);
    setExecuteModalVisible(true);
  }, []);

  // 处理执行确认
  const handleExecuteConfirm = useCallback(async () => {
    if (!selectedAdjustment || !onExecute) return;

    try {
      await onExecute(selectedAdjustment);
      setExecuteModalVisible(false);
      setSelectedAdjustment(null);
    } catch (error) {
      console.error('执行失败:', error);
    }
  }, [selectedAdjustment, onExecute]);

  // 处理执行取消
  const handleExecuteCancel = useCallback(() => {
    setExecuteModalVisible(false);
    setSelectedAdjustment(null);
  }, []);

  // 操作列配置
  const renderActions = useCallback((record: InventoryAdjustment) => {
    const items = [
      {
        key: 'view',
        label: '查看详情',
        icon: <EyeOutlined />,
        onClick: () => onViewDetails(record),
      },
    ];

    if (canAdmin) {
      if (record.status === 'pending') {
        items.push(
          {
            key: 'approve',
            label: '批准',
            icon: <CheckOutlined />,
            onClick: () => handleApprove(record),
          },
          {
            key: 'reject',
            label: '拒绝',
            icon: <CloseOutlined />,
            onClick: () => handleApprove(record),
          }
        );
      }

      if (record.status === 'approved') {
        items.push({
          key: 'execute',
          label: '执行',
          icon: <PlayCircleOutlined />,
          onClick: () => handleExecute(record),
        });
      }
    }

    return (
      <Space>
        <Tooltip title="查看详情">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record)}
          />
        </Tooltip>
        {canAdmin && record.status === 'pending' && (
          <>
            <Tooltip title="批准">
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
                loading={isApproving}
              />
            </Tooltip>
            <Tooltip title="拒绝">
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleApprove(record)}
                loading={isApproving}
              />
            </Tooltip>
          </>
        )}
        {canAdmin && record.status === 'approved' && (
          <Tooltip title="执行">
            <Button
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleExecute(record)}
              loading={isExecuting}
            />
          </Tooltip>
        )}
        <Dropdown
          menu={{ items }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="link"
            size="small"
            icon={<MoreOutlined />}
          />
        </Dropdown>
      </Space>
    );
  }, [canAdmin, onViewDetails, handleApprove, handleExecute, isApproving, isExecuting]);

  // 基础列配置
  const baseColumns: ColumnsType<InventoryAdjustment> = [
    {
      title: '申请编号',
      dataIndex: 'adjustmentNo',
      key: 'adjustmentNo',
      width: 140,
      fixed: 'left',
      render: (text) => <Text code>{text}</Text>,
      sorter: true,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
      render: (text) => <Text code>{text}</Text>,
      sorter: true,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      ellipsis: true,
      sorter: true,
    },
    {
      title: '仓库',
      dataIndex: 'locationName',
      key: 'locationName',
      width: 100,
      sorter: true,
    },
    {
      title: '调整类型',
      dataIndex: 'adjustmentType',
      key: 'adjustmentType',
      width: 100,
      render: renderAdjustmentType,
      sorter: true,
    },
    {
      title: '调整数量',
      dataIndex: 'adjustmentQuantity',
      key: 'adjustmentQuantity',
      width: 100,
      align: 'right',
      render: renderQuantity,
      sorter: true,
    },
    {
      title: '原数量',
      dataIndex: 'originalQuantity',
      key: 'originalQuantity',
      width: 100,
      align: 'right',
      render: (value) => formatNumber(value),
      sorter: true,
    },
    {
      title: '调整后',
      dataIndex: 'adjustedQuantity',
      key: 'adjustedQuantity',
      width: 100,
      align: 'right',
      render: (value) => formatNumber(value),
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: renderStatus,
      sorter: true,
    },
    {
      title: '申请人',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      width: 100,
      sorter: true,
    },
    {
      title: '申请时间',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      width: 120,
      render: renderDateTime,
      sorter: true,
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      fixed: 'right',
      render: (_, record) => renderActions(record),
    },
  ];

  // 响应式列配置
  const columns = useMemo(() => {
    if (isMobile) {
      // 移动端只显示关键列
      return baseColumns.filter(col => [
        'adjustmentNo',
        'productName',
        'adjustmentType',
        'adjustmentQuantity',
        'status',
        'actions',
      ].includes(col.key as string));
    }

    if (isTablet) {
      // 平板端隐藏部分列
      return baseColumns.filter(col => ![
        'locationName',
        'originalQuantity',
        'adjustedQuantity',
        'requestedBy',
      ].includes(col.key as string));
    }

    return baseColumns;
  }, [baseColumns, isMobile, isTablet]);

  // 表格工具栏
  const TableToolbar = () => (
    <Space>
      {refreshData && (
        <Tooltip title="刷新数据">
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshData}
            loading={loading}
          />
        </Tooltip>
      )}
      {onExport && (
        <Button
          icon={<ReloadOutlined />}
          onClick={onExport}
        >
          导出
        </Button>
      )}
    </Space>
  );

  // 表格配置
  const tableConfig: TableProps<InventoryAdjustment> = {
    columns,
    dataSource: data,
    loading,
    rowKey: 'id',
    pagination: {
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
      pageSizeOptions: ['10', '20', '50', '100'],
      size: isMobile ? 'small' : 'default',
    },
    onChange: handleTableChange,
    scroll: {
      x: columns.reduce((width, col) => width + (col.width || 120), 0),
      y: isMobile ? undefined : 600,
    },
    size: isMobile ? 'small' : 'middle',
    bordered: true,
    title: () => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>库存调整记录</Text>
        <TableToolbar />
      </div>
    ),
  };

  return (
    <>
      <Table {...tableConfig} />

      {/* 审批弹窗 */}
      <Modal
        title="审批调整申请"
        open={approvalModalVisible}
        onCancel={handleApprovalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={approvalForm}
          layout="vertical"
          onFinish={handleApprovalSubmit}
        >
          {selectedAdjustment && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong>申请信息：</Text>
                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                  <div>申请编号：{selectedAdjustment.adjustmentNo}</div>
                  <div>商品：{selectedAdjustment.productName}</div>
                  <div>调整类型：{renderAdjustmentType(selectedAdjustment.adjustmentType)}</div>
                  <div>调整数量：{renderQuantity(selectedAdjustment.adjustmentQuantity)}</div>
                  <div>申请人：{selectedAdjustment.requestedBy}</div>
                </div>
              </div>

              <Form.Item name="approved" label="审批结果" rules={[{ required: true }]}>
                <Radio.Group>
                  <Radio value={true}>批准</Radio>
                  <Radio value={false}>拒绝</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="remark" label="审批意见">
                <TextArea rows={4} placeholder="请输入审批意见" maxLength={500} />
              </Form.Item>

              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={handleApprovalCancel}>取消</Button>
                <Button type="primary" htmlType="submit" loading={isApproving}>
                  提交审批
                </Button>
              </Space>
            </Space>
          )}
        </Form>
      </Modal>

      {/* 执行确认弹窗 */}
      <Modal
        title="执行调整"
        open={executeModalVisible}
        onOk={handleExecuteConfirm}
        onCancel={handleExecuteCancel}
        confirmLoading={isExecuting}
        width={500}
      >
        {selectedAdjustment && (
          <Space direction="vertical" size="middle">
            <div>
              <Text strong>即将执行以下库存调整：</Text>
            </div>
            <div style={{ padding: 12, background: '#fff7e6', borderRadius: 6, border: '1px solid #ffd591' }}>
              <div>商品：<Text strong>{selectedAdjustment.productName}</Text></div>
              <div>调整类型：<Text strong>{getAdjustmentTypeConfig(selectedAdjustment.adjustmentType).text}</Text></div>
              <div>调整数量：<Text strong style={{ color: selectedAdjustment.adjustmentQuantity > 0 ? '#52c41a' : '#f5222d' }}>
                {selectedAdjustment.adjustmentQuantity > 0 ? '+' : ''}{selectedAdjustment.adjustmentQuantity}
              </Text></div>
              <div>当前库存：<Text strong>{selectedAdjustment.originalQuantity}</Text> → <Text strong>{selectedAdjustment.adjustedQuantity}</Text></div>
            </div>
            <div style={{ color: '#fa8c16' }}>
              <ExclamationCircleOutlined style={{ marginRight: 8 }} />
              此操作不可撤销，请确认无误后执行。
            </div>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default AdjustmentTable;