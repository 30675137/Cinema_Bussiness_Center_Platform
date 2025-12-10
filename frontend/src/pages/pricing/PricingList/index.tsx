/**
 * 定价中心页面
 */

import React, { useState, useEffect } from 'react';
import { Tag, Button, Space, Input, Select, DatePicker, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTable from '@/components/common/DataTable';
import { mockApi } from '@/services/mockApi';
import type { PricingItem } from '@/types/mock';

const { Search } = Input;
const { Option } = Select;

/**
 * 定价中心页面组件
 */
const PricingList: React.FC = () => {
  const [data, setData] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    priceType: '',
    status: '',
    search: '',
  });

  /**
   * 加载定价数据
   */
  const loadData = async (params?: any) => {
    setLoading(true);
    try {
      const response = await mockApi.getPricing({
        page: params?.current || pagination.current,
        pageSize: params?.pageSize || pagination.pageSize,
        priceType: params?.priceType || filters.priceType,
        status: params?.status || filters.status,
      });

      if (response.code === 200) {
        setData(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.length,
          current: params?.current || prev.current,
          pageSize: params?.pageSize || prev.pageSize,
        }));
      } else {
        message.error('加载定价数据失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('加载定价数据错误:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 初始化加载数据
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * 搜索处理
   */
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    loadData({ ...pagination, search: value });
  };

  /**
   * 筛选处理
   */
  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    loadData({ ...pagination, [key]: value });
  };

  /**
   * 分页处理
   */
  const handleTableChange = (pageInfo: any) => {
    loadData({ ...filters, ...pageInfo });
  };

  /**
   * 刷新处理
   */
  const handleRefresh = () => {
    loadData();
  };

  /**
   * 导出处理
   */
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  /**
   * 新增定价规则
   */
  const handleAdd = () => {
    message.info('新增定价规则功能开发中...');
  };

  /**
   * 编辑定价规则
   */
  const handleEdit = (record: PricingItem) => {
    message.info(`编辑定价规则: ${record.name}`);
  };

  /**
   * 删除定价规则
   */
  const handleDelete = (record: PricingItem) => {
    message.info(`删除定价规则: ${record.name}`);
  };

  /**
   * 价格类型标签渲染
   */
  const renderPriceType = (type: string) => {
    const typeConfig = {
      regular: { color: 'blue', text: '标准价格' },
      promotion: { color: 'orange', text: '促销价格' },
      member: { color: 'purple', text: '会员价格' },
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 状态标签渲染
   */
  const renderStatus = (status: string) => {
    const statusConfig = {
      active: { color: 'green', text: '已生效' },
      inactive: { color: 'red', text: '已失效' },
      pending: { color: 'orange', text: '待审核' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 表格列配置
   */
  const columns: ColumnsType<PricingItem> = [
    {
      title: '规则ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '规则名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: '商品SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 160,
    },
    {
      title: '价格类型',
      dataIndex: 'priceType',
      key: 'priceType',
      width: 120,
      render: renderPriceType,
    },
    {
      title: '价格金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '生效时间',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120,
    },
    {
      title: '过期时间',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  /**
   * 筛选工具栏
   */
  const filterToolbar = (
    <Space style={{ marginBottom: 16 }}>
      <Search
        placeholder="搜索规则名称或SKU"
        allowClear
        style={{ width: 240 }}
        onSearch={handleSearch}
      />
      <Select
        placeholder="价格类型"
        allowClear
        style={{ width: 120 }}
        onChange={(value) => handleFilter('priceType', value || '')}
      >
        <Option value="regular">标准价格</Option>
        <Option value="promotion">促销价格</Option>
        <Option value="member">会员价格</Option>
      </Select>
      <Select
        placeholder="规则状态"
        allowClear
        style={{ width: 120 }}
        onChange={(value) => handleFilter('status', value || '')}
      >
        <Option value="active">已生效</Option>
        <Option value="inactive">已失效</Option>
        <Option value="pending">待审核</Option>
      </Select>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
      >
        新增规则
      </Button>
    </Space>
  );

  return (
    <div className="pricing-list-page">
      <DataTable
        title="定价中心"
        data={data}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onRefresh={handleRefresh}
        onExport={handleExport}
        extra={filterToolbar}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default PricingList;