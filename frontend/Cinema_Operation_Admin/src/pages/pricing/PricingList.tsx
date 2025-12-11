import React from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, InputNumber, Modal, Form } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, CopyOutlined, HistoryOutlined } from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

/**
 * 价格管理页面
 * 显示和管理商品价格信息
 */
const PricingList: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = React.useState(false);

  // 模拟数据
  const dataSource = [
    {
      key: '1',
      id: 'PRICE001',
      productName: '爆米花套餐',
      productCode: 'P001',
      basePrice: 25.00,
      memberPrice: 22.50,
      vipPrice: 20.00,
      weekendPrice: 28.00,
      holidayPrice: 30.00,
      status: '生效',
      effectiveDate: '2025-12-01',
      lastUpdate: '2025-12-10',
    },
    {
      key: '2',
      id: 'PRICE002',
      productName: '可乐饮料',
      productCode: 'P002',
      basePrice: 8.00,
      memberPrice: 7.20,
      vipPrice: 6.40,
      weekendPrice: 9.00,
      holidayPrice: 10.00,
      status: '生效',
      effectiveDate: '2025-12-01',
      lastUpdate: '2025-12-09',
    },
    {
      key: '3',
      id: 'PRICE003',
      productName: '3D眼镜',
      productCode: 'P003',
      basePrice: 35.00,
      memberPrice: 31.50,
      vipPrice: 28.00,
      weekendPrice: 40.00,
      holidayPrice: 45.00,
      status: '待审核',
      effectiveDate: '2025-12-15',
      lastUpdate: '2025-12-08',
    }
  ];

  const columns = [
    {
      title: '价格编号',
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
      title: '基础价格',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '会员价',
      dataIndex: 'memberPrice',
      key: 'memberPrice',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: 'VIP价',
      dataIndex: 'vipPrice',
      key: 'vipPrice',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '周末价',
      dataIndex: 'weekendPrice',
      key: 'weekendPrice',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '节假日价',
      dataIndex: 'holidayPrice',
      key: 'holidayPrice',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          '生效': 'green',
          '待审核': 'orange',
          '已过期': 'red',
          '草稿': 'default',
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
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
            编辑
          </Button>
          <Button type="link" icon={<CopyOutlined />} size="small">
            复制
          </Button>
          <Button type="link" icon={<HistoryOutlined />} size="small">
            历史
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddPrice = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('Form values:', values);
      setModalVisible(false);
      // 这里可以添加提交逻辑
    });
  };

  // 价格统计
  const priceStats = {
    total: dataSource.length,
    active: dataSource.filter(item => item.status === '生效').length,
    pending: dataSource.filter(item => item.status === '待审核').length,
    expired: dataSource.filter(item => item.status === '已过期').length,
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 价格统计卡片 */}
      <div style={{ marginBottom: '24px' }}>
        <Card title="价格概览">
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {priceStats.total}
              </div>
              <div style={{ color: '#666' }}>总价格数</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {priceStats.active}
              </div>
              <div style={{ color: '#666' }}>生效中</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {priceStats.pending}
              </div>
              <div style={{ color: '#666' }}>待审核</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                {priceStats.expired}
              </div>
              <div style={{ color: '#666' }}>已过期</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="价格管理">
        {/* 搜索和筛选 */}
        <div style={{ marginBottom: '16px' }}>
          <Space size="middle">
            <Search
              placeholder="搜索商品名称"
              allowClear
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Select placeholder="价格状态" style={{ width: 120 }} allowClear>
              <Option value="active">生效</Option>
              <Option value="pending">待审核</Option>
              <Option value="expired">已过期</Option>
              <Option value="draft">草稿</Option>
            </Select>
            <Select placeholder="生效日期" style={{ width: 120 }} allowClear>
              <Option value="today">今天</Option>
              <Option value="week">本周</Option>
              <Option value="month">本月</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPrice}>
              新增价格
            </Button>
            <Button icon={<CopyOutlined />}>
              批量导入
            </Button>
          </Space>
        </div>

        {/* 价格列表 */}
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

      {/* 新增价格弹窗 */}
      <Modal
        title="新增价格"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="productName"
            label="商品名称"
            rules={[{ required: true, message: '请选择商品' }]}
          >
            <Select placeholder="请选择商品">
              <Option value="爆米花套餐">爆米花套餐</Option>
              <Option value="可乐饮料">可乐饮料</Option>
              <Option value="3D眼镜">3D眼镜</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="basePrice"
              label="基础价格"
              rules={[{ required: true, message: '请输入基础价格' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
                prefix="¥"
              />
            </Form.Item>

            <Form.Item
              name="memberPrice"
              label="会员价格"
              rules={[{ required: true, message: '请输入会员价格' }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
                prefix="¥"
              />
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="vipPrice"
              label="VIP价格"
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
                prefix="¥"
              />
            </Form.Item>

            <Form.Item
              name="weekendPrice"
              label="周末价格"
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="0.00"
                prefix="¥"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="holidayPrice"
            label="节假日价格"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="0.00"
              prefix="¥"
            />
          </Form.Item>

          <Form.Item
            name="effectiveDate"
            label="生效日期"
            rules={[{ required: true, message: '请选择生效日期' }]}
          >
            <input type="date" style={{ width: '100%', padding: '8px' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PricingList;