import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Table, Button, Space, Tag, Timeline, Divider } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface ReceivingDetailData {
  id: string;
  receivingNumber: string;
  purchaseOrderNumber: string;
  supplier: string;
  receivingDate: string;
  warehouse: string;
  receiver: string;
  phone: string;
  status: string;
  qualityStatus: string;
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

interface ReceivingItemDetail {
  key: string;
  productName: string;
  productCode: string;
  specification: string;
  unit: string;
  orderedQuantity: number;
  receivingQuantity: number;
  qualityStatus: string;
  remark: string;
}

interface TimelineItem {
  time: string;
  operator: string;
  action: string;
  status: string;
}

/**
 * 收货入库详情页面
 * 路由: /purchase-management/receipts/:id
 */
const ReceivingDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [receivingData, setReceivingData] = useState<ReceivingDetailData | null>(null);
  const [receivingItems, setReceivingItems] = useState<ReceivingItemDetail[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  useEffect(() => {
    if (id) {
      loadReceivingDetail(id);
    }
  }, [id]);

  const loadReceivingDetail = async (receivingId: string) => {
    setLoading(true);
    try {
      // TODO: 调用API获取收货单详情
      // Mock数据
      const mockData: ReceivingDetailData = {
        id: receivingId,
        receivingNumber: 'RCV202512110001',
        purchaseOrderNumber: 'PO202512110001',
        supplier: '供应商A',
        receivingDate: '2025-12-11 14:30:00',
        warehouse: '中心仓库',
        receiver: '王五',
        phone: '13800138000',
        status: 'completed',
        qualityStatus: 'passed',
        remark: '收货正常，质检通过',
        createdBy: '张三',
        createdAt: '2025-12-11 14:00:00',
        updatedBy: '王五',
        updatedAt: '2025-12-11 14:30:00',
      };

      const mockItems: ReceivingItemDetail[] = [
        {
          key: '1',
          productName: '可乐',
          productCode: 'PROD001',
          specification: '330ml/瓶',
          unit: '箱',
          orderedQuantity: 100,
          receivingQuantity: 100,
          qualityStatus: 'passed',
          remark: '包装完好',
        },
        {
          key: '2',
          productName: '爆米花',
          productCode: 'PROD002',
          specification: '大桶',
          unit: '包',
          orderedQuantity: 200,
          receivingQuantity: 200,
          qualityStatus: 'passed',
          remark: '质量良好',
        },
      ];

      const mockTimeline: TimelineItem[] = [
        {
          time: '2025-12-11 14:30:00',
          operator: '王五',
          action: '确认收货',
          status: 'completed',
        },
        {
          time: '2025-12-11 14:15:00',
          operator: '李四',
          action: '质检通过',
          status: 'passed',
        },
        {
          time: '2025-12-11 14:00:00',
          operator: '张三',
          action: '创建收货单',
          status: 'created',
        },
      ];

      setReceivingData(mockData);
      setReceivingItems(mockItems);
      setTimeline(mockTimeline);
    } catch (error) {
      console.error('加载收货单详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/purchase-management/receipts');
  };

  const handleEdit = () => {
    navigate(`/purchase-management/receipts/${id}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

  // 状态映射
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '待收货', color: 'default' },
    partial: { label: '部分收货', color: 'processing' },
    completed: { label: '已完成', color: 'success' },
    rejected: { label: '已拒收', color: 'error' },
  };

  // 质检状态映射
  const qualityStatusMap: Record<string, { label: string; color: string }> = {
    waiting: { label: '待质检', color: 'default' },
    checking: { label: '质检中', color: 'processing' },
    passed: { label: '质检通过', color: 'success' },
    failed: { label: '质检不合格', color: 'error' },
  };

  const itemColumns: ColumnsType<ReceivingItemDetail> = [
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 120,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '订购数量',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
      width: 100,
    },
    {
      title: '实收数量',
      dataIndex: 'receivingQuantity',
      key: 'receivingQuantity',
      width: 100,
      render: (quantity: number, record) => (
        <span style={{ color: quantity === record.orderedQuantity ? '#52c41a' : '#faad14' }}>
          {quantity}
        </span>
      ),
    },
    {
      title: '质检状态',
      dataIndex: 'qualityStatus',
      key: 'qualityStatus',
      width: 110,
      render: (status: string) => {
        const statusInfo = qualityStatusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
  ];

  if (!receivingData) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  const statusInfo = statusMap[receivingData.status] || {
    label: receivingData.status,
    color: 'default',
  };
  const qualityInfo = qualityStatusMap[receivingData.qualityStatus] || {
    label: receivingData.qualityStatus,
    color: 'default',
  };

  // 计算汇总
  const totalOrdered = receivingItems.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const totalReceived = receivingItems.reduce((sum, item) => sum + item.receivingQuantity, 0);

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
            {receivingData.status === 'pending' && (
              <Button icon={<EditOutlined />} onClick={handleEdit}>
                编辑
              </Button>
            )}
          </Space>
        }
        loading={loading}
      >
        {/* 基本信息 */}
        <Card type="inner" title="基本信息" style={{ marginBottom: 16 }}>
          <Descriptions column={3} bordered>
            <Descriptions.Item label="收货单号" span={1}>
              <strong>{receivingData.receivingNumber}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="采购单号" span={1}>
              <a style={{ color: '#1890ff' }}>{receivingData.purchaseOrderNumber}</a>
            </Descriptions.Item>
            <Descriptions.Item label="供应商" span={1}>
              {receivingData.supplier}
            </Descriptions.Item>
            <Descriptions.Item label="收货日期" span={1}>
              {receivingData.receivingDate}
            </Descriptions.Item>
            <Descriptions.Item label="收货仓库" span={1}>
              {receivingData.warehouse}
            </Descriptions.Item>
            <Descriptions.Item label="收货人" span={1}>
              {receivingData.receiver}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话" span={1}>
              {receivingData.phone}
            </Descriptions.Item>
            <Descriptions.Item label="收货状态" span={1}>
              <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="质检状态" span={1}>
              <Tag color={qualityInfo.color}>{qualityInfo.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="备注说明" span={3}>
              {receivingData.remark || '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 收货明细 */}
        <Card type="inner" title="收货明细" style={{ marginBottom: 16 }}>
          <Table
            columns={itemColumns}
            dataSource={receivingItems}
            pagination={false}
            scroll={{ x: 1000 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
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
            items={timeline.map((item) => ({
              children: (
                <div>
                  <div style={{ marginBottom: 4 }}>
                    <strong>{item.action}</strong>
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    操作人: {item.operator} | 时间: {item.time}
                  </div>
                </div>
              ),
              color: item.status === 'completed' ? 'green' : 'blue',
            }))}
          />
        </Card>

        <Divider />

        {/* 系统信息 */}
        <Descriptions column={2} size="small">
          <Descriptions.Item label="创建人">{receivingData.createdBy}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{receivingData.createdAt}</Descriptions.Item>
          <Descriptions.Item label="最后修改人">{receivingData.updatedBy}</Descriptions.Item>
          <Descriptions.Item label="最后修改时间">{receivingData.updatedAt}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default ReceivingDetail;
