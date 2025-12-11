import React from 'react';
import { Card, Table, Button, Space, Input, Select, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

/**
 * 商品列表页面
 * 显示和管理商品信息
 */
const ProductList: React.FC = () => {
  // 模拟数据
  const dataSource = [
    {
      key: '1',
      id: 'P001',
      name: '爆米花套餐',
      category: '套餐类',
      price: 25.00,
      stock: 150,
      status: '上架',
      createTime: '2025-12-01',
      updateTime: '2025-12-10'
    },
    {
      key: '2',
      id: 'P002',
      name: '可乐饮料',
      category: '饮品类',
      price: 8.00,
      stock: 200,
      status: '上架',
      createTime: '2025-12-01',
      updateTime: '2025-12-09'
    },
    {
      key: '3',
      id: 'P003',
      name: '3D眼镜',
      category: '配件类',
      price: 35.00,
      stock: 80,
      status: '上架',
      createTime: '2025-12-01',
      updateTime: '2025-12-08'
    }
  ];

  const columns = [
    {
      title: '商品编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '商品分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <span style={{ color: stock < 100 ? '#f5222d' : '#52c41a' }}>
          {stock}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === '上架' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Button type="link" icon={<DeleteOutlined />} size="small" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="商品管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            新增商品
          </Button>
        }
      >
        {/* 搜索和筛选 */}
        <div style={{ marginBottom: '16px' }}>
          <Space size="middle">
            <Search
              placeholder="搜索商品名称"
              allowClear
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Select placeholder="商品分类" style={{ width: 120 }} allowClear>
              <Option value="套餐类">套餐类</Option>
              <Option value="饮品类">饮品类</Option>
              <Option value="配件类">配件类</Option>
              <Option value="食品类">食品类</Option>
            </Select>
            <Select placeholder="商品状态" style={{ width: 120 }} allowClear>
              <Option value="上架">上架</Option>
              <Option value="下架">下架</Option>
            </Select>
          </Space>
        </div>

        {/* 商品列表 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{
            total: dataSource.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default ProductList;