import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, Select, Row, Col, Modal, Form, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExportOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;
const { Option } = Select;

interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  address: string;
  category: string;
  status: string;
  creditRating: string;
  totalOrders: number;
  totalAmount: number;
  createdAt: string;
}

/**
 * 供应商列表页面
 * 路由: /purchase-management/suppliers
 */
const SupplierList: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Mock数据
  const mockData: Supplier[] = [
    {
      id: '1',
      supplierCode: 'SUP001',
      supplierName: '供应商A',
      contactPerson: '张三',
      contactPhone: '13800138001',
      email: 'supplier-a@example.com',
      address: '北京市朝阳区xxx街道xxx号',
      category: 'food',
      status: 'active',
      creditRating: 'A',
      totalOrders: 156,
      totalAmount: 1580000,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      supplierCode: 'SUP002',
      supplierName: '供应商B',
      contactPerson: '李四',
      contactPhone: '13800138002',
      email: 'supplier-b@example.com',
      address: '上海市浦东新区xxx路xxx号',
      category: 'beverage',
      status: 'active',
      creditRating: 'A+',
      totalOrders: 203,
      totalAmount: 2350000,
      createdAt: '2024-02-20',
    },
    {
      id: '3',
      supplierCode: 'SUP003',
      supplierName: '供应商C',
      contactPerson: '王五',
      contactPhone: '13800138003',
      email: 'supplier-c@example.com',
      address: '广州市天河区xxx大道xxx号',
      category: 'equipment',
      status: 'inactive',
      creditRating: 'B',
      totalOrders: 45,
      totalAmount: 680000,
      createdAt: '2024-03-10',
    },
    {
      id: '4',
      supplierCode: 'SUP004',
      supplierName: '供应商D',
      contactPerson: '赵六',
      contactPhone: '13800138004',
      email: 'supplier-d@example.com',
      address: '深圳市南山区xxx街xxx栋',
      category: 'packaging',
      status: 'active',
      creditRating: 'A',
      totalOrders: 89,
      totalAmount: 950000,
      createdAt: '2024-04-05',
    },
  ];

  // 状态映射
  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: '启用', color: 'success' },
    inactive: { label: '停用', color: 'default' },
    suspended: { label: '暂停合作', color: 'warning' },
  };

  // 供应商类别映射
  const categoryMap: Record<string, string> = {
    food: '食品类',
    beverage: '饮料类',
    equipment: '设备类',
    packaging: '包装类',
    other: '其他',
  };

  // 信用评级映射
  const creditRatingMap: Record<string, { label: string; color: string }> = {
    'A+': { label: 'A+', color: 'gold' },
    'A': { label: 'A', color: 'green' },
    'B': { label: 'B', color: 'blue' },
    'C': { label: 'C', color: 'orange' },
    'D': { label: 'D', color: 'red' },
  };

  // 表格列定义
  const columns: ColumnsType<Supplier> = [
    {
      title: '供应商编码',
      dataIndex: 'supplierCode',
      key: 'supplierCode',
      width: 120,
      fixed: 'left',
    },
    {
      title: '供应商名称',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 180,
      fixed: 'left',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => categoryMap[category] || category,
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 130,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 250,
      ellipsis: true,
    },
    {
      title: '信用评级',
      dataIndex: 'creditRating',
      key: 'creditRating',
      width: 100,
      render: (rating: string) => {
        const ratingInfo = creditRatingMap[rating] || { label: rating, color: 'default' };
        return <Tag color={ratingInfo.color}>{ratingInfo.label}</Tag>;
      },
    },
    {
      title: '累计订单',
      dataIndex: 'totalOrders',
      key: 'totalOrders',
      width: 100,
      sorter: (a, b) => a.totalOrders - b.totalOrders,
    },
    {
      title: '累计金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount.toLocaleString()}`,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusInfo = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<SearchOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    console.log('搜索:', value);
  };

  const handleRefresh = () => {
    console.log('刷新列表');
    message.success('刷新成功');
  };

  const handleExport = () => {
    console.log('导出数据');
    message.success('导出成功');
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleView = (supplier: Supplier) => {
    navigate(`/purchase-management/suppliers/${supplier.id}`);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.setFieldsValue(supplier);
    setIsModalVisible(true);
  };

  const handleDelete = (supplier: Supplier) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除供应商"${supplier.supplierName}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        console.log('删除供应商:', supplier.id);
        message.success('删除成功');
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('提交表单:', values);
      
      if (editingSupplier) {
        message.success('更新成功');
      } else {
        message.success('创建成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title="供应商列表"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建供应商
            </Button>
          </Space>
        }
      >
        {/* 筛选区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索供应商编码、名称或联系人"
              onSearch={handleSearch}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select placeholder="供应商类别" style={{ width: '100%' }} allowClear>
              <Option value="food">食品类</Option>
              <Option value="beverage">饮料类</Option>
              <Option value="equipment">设备类</Option>
              <Option value="packaging">包装类</Option>
              <Option value="other">其他</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select placeholder="状态" style={{ width: '100%' }} allowClear>
              <Option value="active">启用</Option>
              <Option value="inactive">停用</Option>
              <Option value="suspended">暂停合作</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select placeholder="信用评级" style={{ width: '100%' }} allowClear>
              <Option value="A+">A+</Option>
              <Option value="A">A</Option>
              <Option value="B">B</Option>
              <Option value="C">C</Option>
              <Option value="D">D</Option>
            </Select>
          </Col>
        </Row>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>4</div>
                <div style={{ color: '#666' }}>供应商总数</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>3</div>
                <div style={{ color: '#666' }}>启用中</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>493</div>
                <div style={{ color: '#666' }}>累计订单</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f5222d' }}>¥556万</div>
                <div style={{ color: '#666' }}>累计金额</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={mockData}
          rowKey="id"
          scroll={{ x: 1800 }}
          pagination={{
            total: mockData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 新建/编辑供应商弹窗 */}
      <Modal
        title={editingSupplier ? '编辑供应商' : '新建供应商'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            creditRating: 'A',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="供应商编码"
                name="supplierCode"
                rules={[{ required: true, message: '请输入供应商编码' }]}
              >
                <Input placeholder="请输入供应商编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="供应商名称"
                name="supplierName"
                rules={[{ required: true, message: '请输入供应商名称' }]}
              >
                <Input placeholder="请输入供应商名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="供应商类别"
                name="category"
                rules={[{ required: true, message: '请选择供应商类别' }]}
              >
                <Select placeholder="请选择供应商类别">
                  <Option value="food">食品类</Option>
                  <Option value="beverage">饮料类</Option>
                  <Option value="equipment">设备类</Option>
                  <Option value="packaging">包装类</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="信用评级"
                name="creditRating"
                rules={[{ required: true, message: '请选择信用评级' }]}
              >
                <Select placeholder="请选择信用评级">
                  <Option value="A+">A+</Option>
                  <Option value="A">A</Option>
                  <Option value="B">B</Option>
                  <Option value="C">C</Option>
                  <Option value="D">D</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="联系人"
                name="contactPerson"
                rules={[{ required: true, message: '请输入联系人' }]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="contactPhone"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">启用</Option>
                  <Option value="inactive">停用</Option>
                  <Option value="suspended">暂停合作</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="地址"
                name="address"
                rules={[{ required: true, message: '请输入地址' }]}
              >
                <Input placeholder="请输入详细地址" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierList;
