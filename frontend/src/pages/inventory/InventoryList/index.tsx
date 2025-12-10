/**
 * 库存追溯页面
 */

import React, { useState, useEffect } from 'react';
import { Tag, Button, Space, Input, Select, DatePicker, message } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTable from '@/components/common/DataTable';
import { mockApi } from '@/services/mockApi';
import type { InventoryItem } from '@/types/mock';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * 库存追溯页面组件
 */
const InventoryList: React.FC = () => {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    location: '',
    operation: '',
    search: '',
  });

  /**
   * 加载库存数据
   */
  const loadData = async (params?: any) => {
    setLoading(true);
    try {
      const response = await mockApi.getInventory({
        page: params?.current || pagination.current,
        pageSize: params?.pageSize || pagination.pageSize,
        location: params?.location || filters.location,
        operation: params?.operation || filters.operation,
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
        message.error('加载库存数据失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('加载库存数据错误:', error);
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
   * 新增库存记录
   */
  const handleAdd = () => {
    message.info('新增库存记录功能开发中...');
  };

  /**
   * 库存状态渲染（基于数量显示不同颜色）
   */
  const renderStockStatus = (quantity: number) => {
    let color = 'green';
    let text = `${quantity} (充足)`;

    if (quantity <= 10) {
      color = 'red';
      text = `${quantity} (紧缺)`;
    } else if (quantity <= 30) {
      color = 'orange';
      text = `${quantity} (偏少)`;
    }

    return <Tag color={color}>{text}</Tag>;
  };

  /**
   * 操作类型标签渲染
   */
  const renderOperation = (operation: string) => {
    const operationConfig = {
      in: { color: 'green', text: '入库' },
      out: { color: 'red', text: '出库' },
      adjust: { color: 'blue', text: '调整' },
    };
    const config = operationConfig[operation as keyof typeof operationConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 操作数量渲染
   */
  const renderOperationQty = (qty: number, operation: string) => {
    let color = 'green';
    let sign = '';

    if (operation === 'out') {
      color = 'red';
      sign = '-';
    } else if (operation === 'in') {
      color = 'green';
      sign = '+';
    } else {
      color = qty >= 0 ? 'green' : 'red';
      sign = qty >= 0 ? '+' : '';
    }

    return <Tag color={color}>{sign}${Math.abs(qty)}</Tag>;
  };

  /**
   * 表格列配置
   */
  const columns: ColumnsType<InventoryItem> = [
    {
      title: '记录ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '商品SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 160,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 160,
    },
    {
      title: '仓库位置',
      dataIndex: 'location',
      key: 'location',
      width: 120,
    },
    {
      title: '当前库存',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: renderStockStatus,
    },
    {
      title: '操作类型',
      dataIndex: 'operation',
      key: 'operation',
      width: 100,
      render: renderOperation,
    },
    {
      title: '操作数量',
      dataIndex: 'operationQty',
      key: 'operationQty',
      width: 100,
      render: (qty: number, record: InventoryItem) => renderOperationQty(qty, record.operation),
    },
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      key: 'operationTime',
      width: 160,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
    {
      title: '备注说明',
      dataIndex: 'remark',
      key: 'remark',
      width: 160,
      render: (remark: string) => remark || '-',
    },
  ];

  /**
   * 筛选工具栏
   */
  const filterToolbar = (
    <Space style={{ marginBottom: 16 }}>
      <Search
        placeholder="搜索商品SKU或名称"
        allowClear
        style={{ width: 240 }}
        onSearch={handleSearch}
      />
      <Select
        placeholder="仓库位置"
        allowClear
        style={{ width: 120 }}
        onChange={(value) => handleFilter('location', value || '')}
      >
        <Option value="A-01">A区01架</Option>
        <Option value="B-02">B区02架</Option>
        <Option value="B-03">B区03架</Option>
      </Select>
      <Select
        placeholder="操作类型"
        allowClear
        style={{ width: 120 }}
        onChange={(value) => handleFilter('operation', value || '')}
      >
        <Option value="in">入库</Option>
        <Option value="out">出库</Option>
        <Option value="adjust">调整</Option>
      </Select>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
      >
        新增记录
      </Button>
    </Space>
  );

  return (
    <div className="inventory-list-page">
      <DataTable
        title="库存追溯"
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

export default InventoryList;