/**
 * P004-inventory-adjustment: 审批列表组件
 *
 * 显示库存调整记录列表，支持状态筛选和审批通过/拒绝操作。
 * 实现 T047 任务。
 *
 * @since US4 - 大额库存调整审批
 */

import React, { useState } from 'react';
import { Table, Button, Space, Typography, Modal, Input, Empty, Spin, Tooltip, Card } from 'antd';
import type { TableProps } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AdjustmentStatusTag } from './AdjustmentStatusTag';
import { useAdjustmentsByStatus, useProcessApproval } from '../hooks/useApproval';
import type { InventoryAdjustment } from '../types/adjustment';

const { Text, Title } = Typography;
const { TextArea } = Input;

export interface ApprovalListProps {
  /** 门店ID过滤（可选） */
  storeId?: string;
  /** 状态筛选: pending_approval | approved | rejected | withdrawn | 空表示全部 */
  statusFilter?: string;
  /** 每页条数 */
  pageSize?: number;
  /** 点击查看详情回调 */
  onViewDetail?: (adjustment: InventoryAdjustment) => void;
}

/**
 * 审批确认弹窗数据
 */
interface ApprovalModalData {
  adjustment: InventoryAdjustment;
  action: 'approve' | 'reject';
}

/**
 * 审批列表组件
 *
 * @example
 * ```tsx
 * <ApprovalList statusFilter="pending_approval" onViewDetail={(adj) => setSelectedAdjustment(adj)} />
 * ```
 */
export const ApprovalList: React.FC<ApprovalListProps> = ({
  storeId,
  statusFilter = 'pending_approval',
  pageSize = 10,
  onViewDetail,
}) => {
  const [page, setPage] = useState(1);
  const [modalData, setModalData] = useState<ApprovalModalData | null>(null);
  const [comments, setComments] = useState('');

  // 获取调整记录列表（支持状态筛选）
  const { data, isLoading, isError } = useAdjustmentsByStatus({
    page,
    pageSize,
    storeId,
    status: statusFilter || undefined,
  });

  // 审批操作
  const { mutate: processApproval, isPending: isProcessing } = useProcessApproval({
    onSuccess: () => {
      setModalData(null);
      setComments('');
    },
  });

  // 打开审批确认弹窗
  const handleOpenModal = (adjustment: InventoryAdjustment, action: 'approve' | 'reject') => {
    setModalData({ adjustment, action });
    setComments('');
  };

  // 确认审批
  const handleConfirmApproval = () => {
    if (!modalData) return;

    processApproval({
      adjustmentId: modalData.adjustment.id,
      action: modalData.action,
      comments: comments || undefined,
    });
  };

  // 表格列定义
  const columns: TableProps<InventoryAdjustment>['columns'] = [
    {
      title: '调整单号',
      dataIndex: 'adjustmentNumber',
      key: 'adjustmentNumber',
      width: 150,
      render: (num: string) => <Text copyable={{ text: num }}>{num}</Text>,
    },
    {
      title: 'SKU',
      key: 'sku',
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.sku?.name || '-'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.sku?.code}
          </Text>
        </div>
      ),
    },
    {
      title: '调整类型',
      dataIndex: 'adjustmentType',
      key: 'adjustmentType',
      width: 100,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          surplus: { text: '盘盈', color: 'green' },
          shortage: { text: '盘亏', color: 'orange' },
          damage: { text: '报损', color: 'red' },
        };
        const config = typeMap[type] || { text: type, color: 'default' };
        return (
          <Text
            style={{
              color:
                config.color === 'green'
                  ? '#52c41a'
                  : config.color === 'orange'
                    ? '#fa8c16'
                    : '#ff4d4f',
            }}
          >
            {config.text}
          </Text>
        );
      },
    },
    {
      title: '调整数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (qty: number, record) => (
        <Text strong>
          {record.adjustmentType === 'surplus' ? '+' : '-'}
          {qty}
        </Text>
      ),
    },
    {
      title: '调整金额',
      dataIndex: 'adjustmentAmount',
      key: 'adjustmentAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#ff4d4f' }}>
          ¥{amount.toFixed(2)}
        </Text>
      ),
    },
    {
      title: '申请人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 100,
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <AdjustmentStatusTag status={status} size="small" />,
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail?.(record)}
            />
          </Tooltip>
          {/* 只有待审批状态才显示审批按钮 */}
          {record.status === 'pending_approval' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleOpenModal(record, 'approve')}
              >
                通过
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleOpenModal(record, 'reject')}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // 根据状态筛选获取标题
  const getListTitle = () => {
    const titleMap: Record<string, string> = {
      pending_approval: '待审批列表',
      approved: '已通过列表',
      rejected: '已拒绝列表',
      withdrawn: '已撤回列表',
    };
    return titleMap[statusFilter || ''] || '全部记录';
  };

  // 根据状态筛选获取提示文字
  const getCountLabel = () => {
    if (statusFilter === 'pending_approval') {
      return `${data?.total || 0} 条待处理`;
    }
    return `共 ${data?.total || 0} 条`;
  };

  if (isError) {
    return (
      <Card>
        <Empty description="加载列表失败" />
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <Space>
            <Title level={5} style={{ margin: 0 }}>
              {getListTitle()}
            </Title>
            {data?.total !== undefined && <Text type="secondary">({getCountLabel()})</Text>}
          </Space>
        }
      >
        <Spin spinning={isLoading}>
          <Table<InventoryAdjustment>
            columns={columns}
            dataSource={data?.data || []}
            rowKey="id"
            size="middle"
            scroll={{ x: 1200 }}
            pagination={{
              current: page,
              pageSize,
              total: data?.total || 0,
              showTotal: (total) => `共 ${total} 条`,
              onChange: setPage,
            }}
            locale={{ emptyText: <Empty description="暂无记录" /> }}
          />
        </Spin>
      </Card>

      {/* 审批确认弹窗 */}
      <Modal
        title={modalData?.action === 'approve' ? '确认通过审批' : '确认拒绝审批'}
        open={!!modalData}
        onOk={handleConfirmApproval}
        onCancel={() => setModalData(null)}
        confirmLoading={isProcessing}
        okText={modalData?.action === 'approve' ? '确认通过' : '确认拒绝'}
        okButtonProps={{
          danger: modalData?.action === 'reject',
        }}
      >
        {modalData && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text>调整单号：</Text>
              <Text strong>{modalData.adjustment.adjustmentNumber}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text>调整金额：</Text>
              <Text strong style={{ color: '#ff4d4f' }}>
                ¥{modalData.adjustment.adjustmentAmount.toFixed(2)}
              </Text>
            </div>
            <div>
              <Text>审批意见（可选）：</Text>
              <TextArea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="请输入审批意见..."
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ApprovalList;
