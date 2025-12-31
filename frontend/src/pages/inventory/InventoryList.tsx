import React from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, Progress } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

/**
 * 库存管理页面
 * 显示和管理库存信息
 */
const InventoryList: React.FC = () => {
  // 模拟数据
  const dataSource = [
    {
      key: '1',
      id: 'INV001',
      productName: '爆米花套餐',
      productCode: 'P001',
      totalStock: 500,
      availableStock: 350,
      reservedStock: 120,
      lowStockThreshold: 100,
      warehouse: '中心仓库',
      lastUpdate: '2025-12-10 14:30',
    },
    {
      key: '2',
      id: 'INV002',
      productName: '可乐饮料',
      productCode: 'P002',
      totalStock: 800,
      availableStock: 680,
      reservedStock: 100,
      lowStockThreshold: 150,
      warehouse: '中心仓库',
      lastUpdate: '2025-12-10 13:45',
    },
    {
      key: '3',
      id: 'INV003',
      productName: '3D眼镜',
      productCode: 'P003',
      totalStock: 200,
      availableStock: 85,
      reservedStock: 100,
      lowStockThreshold: 100,
      warehouse: '配件仓库',
      lastUpdate: '2025-12-10 12:20',
    },
  ];

  const getStockStatus = (available: number, threshold: number) => {
    if (available <= threshold) {
      return { color: 'red', text: '库存不足' };
    } else if (available <= threshold * 1.5) {
      return { color: 'orange', text: '库存预警' };
    } else {
      return { color: 'green', text: '库存充足' };
    }
  };

  const getStockPercentage = (available: number, total: number) => {
    return Math.round((available / total) * 100);
  };

  const columns = [
    {
      title: '库存编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: '总库存',
      dataIndex: 'totalStock',
      key: 'totalStock',
    },
    {
      title: '可用库存',
      dataIndex: 'availableStock',
      key: 'availableStock',
      render: (stock: number, record: any) => (
        <div>
          <div style={{ color: stock <= record.lowStockThreshold ? '#f5222d' : '#52c41a' }}>
            {stock}
          </div>
          <Progress
            percent={getStockPercentage(stock, record.totalStock)}
            size="small"
            status={stock <= record.lowStockThreshold ? 'exception' : 'active'}
            style={{ width: 80, marginTop: 4 }}
          />
        </div>
      ),
    },
    {
      title: '预留库存',
      dataIndex: 'reservedStock',
      key: 'reservedStock',
    },
    {
      title: '库存状态',
      key: 'stockStatus',
      render: (_, record: any) => {
        const status = getStockStatus(record.availableStock, record.lowStockThreshold);
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: '最后更新',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} size="small">
            调整库存
          </Button>
          {record.availableStock <= record.lowStockThreshold && (
            <Button type="link" icon={<ExclamationCircleOutlined />} size="small" danger>
              补货提醒
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 库存统计
  const stockStats = {
    total: dataSource.reduce((sum, item) => sum + item.totalStock, 0),
    available: dataSource.reduce((sum, item) => sum + item.availableStock, 0),
    reserved: dataSource.reduce((sum, item) => sum + item.reservedStock, 0),
    lowStock: dataSource.filter((item) => item.availableStock <= item.lowStockThreshold).length,
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 库存统计卡片 */}
      <div style={{ marginBottom: '24px' }}>
        <Card title="库存概览">
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {stockStats.total}
              </div>
              <div style={{ color: '#666' }}>总库存</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {stockStats.available}
              </div>
              <div style={{ color: '#666' }}>可用库存</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {stockStats.reserved}
              </div>
              <div style={{ color: '#666' }}>预留库存</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                {stockStats.lowStock}
              </div>
              <div style={{ color: '#666' }}>库存不足</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="库存管理">
        {/* 搜索和筛选 */}
        <div style={{ marginBottom: '16px' }}>
          <Space size="middle">
            <Search
              placeholder="搜索商品名称"
              allowClear
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Select placeholder="仓库" style={{ width: 120 }} allowClear>
              <Option value="中心仓库">中心仓库</Option>
              <Option value="配件仓库">配件仓库</Option>
              <Option value="食品仓库">食品仓库</Option>
            </Select>
            <Select placeholder="库存状态" style={{ width: 120 }} allowClear>
              <Option value="sufficient">库存充足</Option>
              <Option value="warning">库存预警</Option>
              <Option value="insufficient">库存不足</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />}>
              新增库存
            </Button>
          </Space>
        </div>

        {/* 库存列表 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{
            total: dataSource.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default InventoryList;
