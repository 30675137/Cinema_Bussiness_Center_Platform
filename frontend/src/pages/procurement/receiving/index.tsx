/**
 * 收货管理页面
 * 提供收货单管理、到货验收等功能
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Input, Select, DatePicker, message } from 'antd';
import { SearchOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useReceiptStore } from '@/stores/receiptStore';
import { Receipt, ReceiptStatus } from '@/types/receipt';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * 收货管理页面组件
 */
const ReceivingManagePage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const {
    receipts,
    loading,
    statistics,
    fetchReceipts,
    confirmReceipt,
    completeReceipt,
    cancelReceipt,
  } = useReceiptStore();

  // 初始化数据
  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  // 获取状态标签
  const getStatusTag = (status: ReceiptStatus) => {
    const statusConfig = {
      [ReceiptStatus.DRAFT]: { color: 'default', text: '草稿' },
      [ReceiptStatus.PENDING]: { color: 'processing', text: '待收货' },
      [ReceiptStatus.PARTIAL_RECEIVED]: { color: 'warning', text: '部分收货' },
      [ReceiptStatus.COMPLETED]: { color: 'success', text: '已完成' },
      [ReceiptStatus.CANCELLED]: { color: 'error', text: '已取消' },
      [ReceiptStatus.RETURNED]: { color: 'orange', text: '已退货' },
    };

    const config = statusConfig[status] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<Receipt> = [
    {
      title: '收货单号',
      dataIndex: 'receiptNumber',
      key: 'receiptNumber',
      width: 150,
      render: (text: string) => <span className="font-mono">{text}</span>,
    },
    {
      title: '采购单号',
      dataIndex: 'purchaseOrderNumber',
      key: 'purchaseOrderNumber',
      width: 150,
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 150,
    },
    {
      title: '收货状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ReceiptStatus) => getStatusTag(status),
    },
    {
      title: '计划收货日期',
      dataIndex: 'plannedDate',
      key: 'plannedDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '实际收货日期',
      dataIndex: 'actualDate',
      key: 'actualDate',
      width: 120,
      render: (date?: string) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '操作人',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          {record.status === ReceiptStatus.PENDING && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleConfirm(record)}
            >
              确认收货
            </Button>
          )}
          {record.status === ReceiptStatus.PARTIAL_RECEIVED && (
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleComplete(record)}
            >
              完成收货
            </Button>
          )}
          {(record.status === ReceiptStatus.DRAFT || record.status === ReceiptStatus.PENDING) && (
            <Button
              type="text"
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => handleCancel(record)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 处理确认收货
  const handleConfirm = async (receipt: Receipt) => {
    try {
      await confirmReceipt(receipt.id);
      message.success('确认收货成功');
    } catch (error) {
      message.error('确认收货失败');
    }
  };

  // 处理完成收货
  const handleComplete = async (receipt: Receipt) => {
    try {
      await completeReceipt(receipt.id);
      message.success('完成收货成功');
    } catch (error) {
      message.error('完成收货失败');
    }
  };

  // 处理取消收货单
  const handleCancel = async (receipt: Receipt) => {
    try {
      await cancelReceipt(receipt.id);
      message.success('取消收货单成功');
    } catch (error) {
      message.error('取消收货单失败');
    }
  };

  // 过滤数据
  const filteredData = receipts.filter((receipt) => {
    const matchesSearch =
      !searchText ||
      receipt.receiptNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      receipt.purchaseOrderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      receipt.supplierName.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = !statusFilter || receipt.status === statusFilter;

    const matchesDate =
      !dateRange ||
      (dayjs(receipt.plannedDate).isAfter(dateRange[0]) &&
        dayjs(receipt.plannedDate).isBefore(dateRange[1]));

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">收货管理</h1>
          <p className="text-gray-600 mt-1">管理到货验收和收货单据</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statistics?.pendingCount || 0}
              </div>
              <div className="text-gray-600">待收货</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {statistics?.partialReceivedCount || 0}
              </div>
              <div className="text-gray-600">部分收货</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statistics?.completedCount || 0}
              </div>
              <div className="text-gray-600">已完成</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{statistics?.totalCount || 0}</div>
              <div className="text-gray-600">总收货单</div>
            </div>
          </Card>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Search
                placeholder="搜索收货单号、采购单号、供应商"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <Select
              placeholder="状态筛选"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 120 }}
            >
              <Option value={ReceiptStatus.DRAFT}>草稿</Option>
              <Option value={ReceiptStatus.PENDING}>待收货</Option>
              <Option value={ReceiptStatus.PARTIAL_RECEIVED}>部分收货</Option>
              <Option value={ReceiptStatus.COMPLETED}>已完成</Option>
              <Option value={ReceiptStatus.CANCELLED}>已取消</Option>
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['开始日期', '结束日期']}
            />
            <Button type="primary" icon={<PlusOutlined />}>
              新建收货单
            </Button>
          </div>
        </Card>

        {/* 收货单列表 */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            pagination={{
              total: filteredData.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default ReceivingManagePage;
