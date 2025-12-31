/**
 * P004-inventory-adjustment: 审批管理页面
 *
 * 运营总监审批页面，显示待审批的库存调整记录。
 * 实现 T049 任务。
 *
 * @since US4 - 大额库存调整审批
 */

import React, { useState } from 'react';
import { Card, Drawer, Descriptions, Divider, Typography, Space, Tag, Timeline, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { ApprovalList } from '@/features/inventory/components/ApprovalList';
import { AdjustmentStatusTag } from '@/features/inventory/components/AdjustmentStatusTag';
import type { InventoryAdjustment } from '@/features/inventory/types/adjustment';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/** 状态筛选选项 */
const STATUS_OPTIONS = [
  { label: '待审批', value: 'pending_approval' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '全部', value: '' },
];

/**
 * 审批管理页面
 */
const ApprovalPage: React.FC = () => {
  const [selectedAdjustment, setSelectedAdjustment] = useState<InventoryAdjustment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending_approval');

  // 查看详情
  const handleViewDetail = (adjustment: InventoryAdjustment) => {
    setSelectedAdjustment(adjustment);
    setDrawerOpen(true);
  };

  // 关闭抽屉
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedAdjustment(null);
  };

  // 状态筛选变化
  const handleStatusChange = (e: RadioChangeEvent) => {
    setStatusFilter(e.target.value);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>库存调整审批</Title>
        <Text type="secondary">审批金额达到1000元及以上的库存调整申请</Text>
      </div>

      {/* 状态筛选器 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Text strong>状态筛选：</Text>
          <Radio.Group
            value={statusFilter}
            onChange={handleStatusChange}
            optionType="button"
            buttonStyle="solid"
          >
            {STATUS_OPTIONS.map((option) => (
              <Radio.Button key={option.value} value={option.value}>
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Space>
      </Card>

      {/* 审批列表 */}
      <ApprovalList statusFilter={statusFilter} onViewDetail={handleViewDetail} />

      {/* 详情抽屉 */}
      <Drawer
        title="调整详情"
        placement="right"
        width={500}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        destroyOnClose
      >
        {selectedAdjustment && (
          <>
            {/* 基本信息 */}
            <Descriptions title="基本信息" column={1} bordered size="small">
              <Descriptions.Item label="调整单号">
                {selectedAdjustment.adjustmentNumber}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <AdjustmentStatusTag status={selectedAdjustment.status} />
              </Descriptions.Item>
              <Descriptions.Item label="申请人">
                {selectedAdjustment.operatorName}
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {dayjs(selectedAdjustment.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* SKU信息 */}
            <Descriptions title="商品信息" column={1} bordered size="small">
              <Descriptions.Item label="SKU编码">
                {selectedAdjustment.sku?.code || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="SKU名称">
                {selectedAdjustment.sku?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="门店">
                {selectedAdjustment.store?.name || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* 调整信息 */}
            <Descriptions title="调整信息" column={1} bordered size="small">
              <Descriptions.Item label="调整类型">
                <Tag
                  color={
                    selectedAdjustment.adjustmentType === 'surplus'
                      ? 'green'
                      : selectedAdjustment.adjustmentType === 'shortage'
                        ? 'orange'
                        : 'red'
                  }
                >
                  {selectedAdjustment.adjustmentType === 'surplus'
                    ? '盘盈'
                    : selectedAdjustment.adjustmentType === 'shortage'
                      ? '盘亏'
                      : '报损'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="调整数量">
                <Text strong>
                  {selectedAdjustment.adjustmentType === 'surplus' ? '+' : '-'}
                  {selectedAdjustment.quantity}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="单价">
                ¥{selectedAdjustment.unitPrice?.toFixed(2) || '0.00'}
              </Descriptions.Item>
              <Descriptions.Item label="调整金额">
                <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>
                  ¥{selectedAdjustment.adjustmentAmount.toFixed(2)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="库存变化">
                <Space>
                  <Text>{selectedAdjustment.stockBefore}</Text>
                  <Text>→</Text>
                  <Text strong>{selectedAdjustment.stockAfter}</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* 原因信息 */}
            <Descriptions title="调整原因" column={1} bordered size="small">
              <Descriptions.Item label="原因类型">
                {selectedAdjustment.reasonCode}
              </Descriptions.Item>
              {selectedAdjustment.reasonText && (
                <Descriptions.Item label="原因说明">
                  {selectedAdjustment.reasonText}
                </Descriptions.Item>
              )}
              {selectedAdjustment.remarks && (
                <Descriptions.Item label="备注">{selectedAdjustment.remarks}</Descriptions.Item>
              )}
            </Descriptions>

            {/* 审批历史 */}
            {selectedAdjustment.approvalHistory &&
              selectedAdjustment.approvalHistory.length > 0 && (
                <>
                  <Divider />
                  <Title level={5}>审批历史</Title>
                  <Timeline
                    items={selectedAdjustment.approvalHistory.map((record) => ({
                      color:
                        record.action === 'approve'
                          ? 'green'
                          : record.action === 'reject'
                            ? 'red'
                            : 'gray',
                      children: (
                        <div>
                          <Text strong>{record.approverName}</Text>
                          <Text type="secondary">
                            {' '}
                            {record.action === 'approve'
                              ? '通过'
                              : record.action === 'reject'
                                ? '拒绝'
                                : '撤回'}
                          </Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {dayjs(record.actionTime).format('YYYY-MM-DD HH:mm')}
                            </Text>
                          </div>
                          {record.comments && (
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary">意见：{record.comments}</Text>
                            </div>
                          )}
                        </div>
                      ),
                    }))}
                  />
                </>
              )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default ApprovalPage;
