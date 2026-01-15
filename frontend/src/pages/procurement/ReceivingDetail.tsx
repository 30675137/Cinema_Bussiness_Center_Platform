/**
 * @spec N001-purchase-inbound
 * 收货入库详情页面
 * 路由: /purchase-management/receipts/:id
 */
import React from 'react';
import { Card, Descriptions, Table, Button, Space, Tag, Timeline, Divider, Spin, Result } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useGoodsReceipt } from '@/features/procurement/hooks/useGoodsReceipts';
import type { GoodsReceipt, GoodsReceiptItem, QualityStatus } from '@/features/procurement/types';

/**
 * 收货入库详情页面
 */
const ReceivingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 使用 TanStack Query 获取收货单详情
  const { data: receipt, isLoading, error } = useGoodsReceipt(id);

  const handleBack = () => {
    navigate('/purchase-management/receipts');
  };

  const handleEdit = () => {
    navigate(`/purchase-management/receipts/${id}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

  // 收货单状态映射（匹配后端枚举）
  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: '待确认', color: 'processing' },
    CONFIRMED: { label: '已确认', color: 'success' },
    CANCELLED: { label: '已取消', color: 'default' },
  };

  // 质检状态映射（匹配后端枚举：QUALIFIED, UNQUALIFIED, PENDING_CHECK）
  const qualityStatusMap: Record<string, { label: string; color: string }> = {
    PENDING_CHECK: { label: '待质检', color: 'default' },
    QUALIFIED: { label: '质检通过', color: 'success' },
    UNQUALIFIED: { label: '质检不合格', color: 'error' },
  };

  // 收货明细表格列定义
  const itemColumns: ColumnsType<GoodsReceiptItem> = [
    {
      title: 'SKU编码',
      dataIndex: ['sku', 'code'],
      key: 'skuCode',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: ['sku', 'name'],
      key: 'skuName',
      width: 180,
    },
    {
      title: '单位',
      dataIndex: ['sku', 'mainUnit'],
      key: 'unit',
      width: 80,
      render: (unit: string) => unit || '-',
    },
    {
      title: '订购数量',
      dataIndex: 'orderedQty',
      key: 'orderedQty',
      width: 100,
    },
    {
      title: '实收数量',
      dataIndex: 'receivedQty',
      key: 'receivedQty',
      width: 100,
      render: (qty: number, record) => (
        <span style={{ color: qty === record.orderedQty ? '#52c41a' : '#faad14' }}>
          {qty}
        </span>
      ),
    },
    {
      title: '质检状态',
      dataIndex: 'qualityStatus',
      key: 'qualityStatus',
      width: 110,
      render: (status: QualityStatus) => {
        const statusInfo = qualityStatusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '拒收原因',
      dataIndex: 'rejectionReason',
      key: 'rejectionReason',
      render: (reason: string) => reason || '-',
    },
  ];

  // 加载状态
  if (isLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="error"
          title="加载失败"
          subTitle={error.message || '无法获取收货单详情'}
          extra={[
            <Button key="back" onClick={handleBack}>返回列表</Button>,
          ]}
        />
      </div>
    );
  }

  // 无数据
  if (!receipt) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status="404"
          title="收货单不存在"
          subTitle="您访问的收货单可能已被删除或不存在"
          extra={[
            <Button key="back" type="primary" onClick={handleBack}>返回列表</Button>,
          ]}
        />
      </div>
    );
  }

  const statusInfo = statusMap[receipt.status] || { label: receipt.status, color: 'default' };
  const items = receipt.items || [];
  const totalOrdered = items.reduce((sum, item) => sum + item.orderedQty, 0);
  const totalReceived = items.reduce((sum, item) => sum + item.receivedQty, 0);

  // 生成操作时间线
  const timelineItems = [
    {
      time: receipt.createdAt,
      action: '创建收货单',
      color: 'blue',
    },
    ...(receipt.status === 'CONFIRMED' && receipt.receivedAt ? [{
      time: receipt.receivedAt,
      action: '确认收货',
      color: 'green' as const,
    }] : []),
    ...(receipt.status === 'CANCELLED' ? [{
      time: receipt.updatedAt,
      action: '取消收货单',
      color: 'gray' as const,
    }] : []),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack} type="text" />
            <span>收货入库详情</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
            {receipt.status === 'PENDING' && (
              <Button icon={<EditOutlined />} onClick={handleEdit}>
                编辑
              </Button>
            )}
          </Space>
        }
      >
        {/* 基本信息 */}
        <Card type="inner" title="基本信息" style={{ marginBottom: 16 }}>
          <Descriptions column={3} bordered>
            <Descriptions.Item label="收货单号" span={1}>
              <strong>{receipt.receiptNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="采购单号" span={1}>
              <a
                style={{ color: '#1890ff' }}
                onClick={() => navigate(`/purchase-management/orders/${receipt.purchaseOrder?.id}`)}
              >
                {receipt.purchaseOrder?.orderNumber}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="供应商" span={1}>
              {receipt.purchaseOrder?.supplier?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="收货时间" span={1}>
              {receipt.receivedAt ? new Date(receipt.receivedAt).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="收货门店" span={1}>
              {receipt.store?.name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="收货人" span={1}>
              {receipt.receivedByName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="收货状态" span={1}>
              <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={1}>
              {new Date(receipt.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={1}>
              {new Date(receipt.updatedAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="备注说明" span={3}>
              {receipt.remarks || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 收货明细 */}
        <Card type="inner" title="收货明细" style={{ marginBottom: 16 }}>
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey="id"
            pagination={false}
            scroll={{ x: 900 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <strong>合计</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    <strong>{totalOrdered}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong
                      style={{ color: totalReceived === totalOrdered ? '#52c41a' : '#faad14' }}
                    >
                      {totalReceived}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} colSpan={2}>
                    {totalReceived === totalOrdered ? (
                      <Tag color="success" icon={<CheckOutlined />}>
                        全部收货
                      </Tag>
                    ) : (
                      <Tag color="warning">部分收货（缺 {totalOrdered - totalReceived}）</Tag>
                    )}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* 操作历史 */}
        <Card type="inner" title="操作历史">
          <Timeline
            items={timelineItems.map((item) => ({
              children: (
                <div>
                  <div style={{ marginBottom: 4 }}>
                    <strong>{item.action}</strong>
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    时间: {new Date(item.time).toLocaleString('zh-CN')}
                  </div>
                </div>
              ),
              color: item.color,
            }))}
          />
        </Card>

        <Divider />

        {/* 系统信息 */}
        <Descriptions column={2} size="small">
          <Descriptions.Item label="版本号">{receipt.version}</Descriptions.Item>
          <Descriptions.Item label="记录ID">{receipt.id}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ReceivingDetail;
