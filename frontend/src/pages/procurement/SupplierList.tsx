/**
 * @spec N002-unify-supplier-data
 * @spec N003-supplier-edit
 * 供应商列表页面 - 统一使用后端真实 API 数据
 * 路由: /purchase-management/suppliers
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Form,
  message,
  Spin,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { useSupplierStore } from '@/stores/supplierStore';
import { SupplierStatus } from '@/types/supplier';
import type { Supplier } from '@/types/supplier';
import { createSupplier, updateSupplier } from '@/services/supplierApi';

const { Search } = Input;
const { Option } = Select;

/**
 * 供应商列表视图项（用于表格展示）
 */
interface SupplierListItem {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  contactPhone: string;
  status: SupplierStatus;
}

const SupplierList: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierListItem | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  // 使用供应商 store
  const items = useSupplierStore((state) => state.items);
  const loading = useSupplierStore((state) => state.loading);
  const error = useSupplierStore((state) => state.error);
  const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers);

  // 加载供应商数据
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // 将 Supplier 转换为列表视图项
  const suppliers: SupplierListItem[] = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];

    return items.map((supplier: Supplier) => ({
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      contactPerson: supplier.contacts?.[0]?.name || '',
      contactPhone: supplier.phone || supplier.contacts?.[0]?.phone || '',
      status: supplier.status,
    }));
  }, [items]);

  // 应用搜索和筛选
  const filteredSuppliers = useMemo(() => {
    let result = suppliers;

    // 搜索过滤
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(
        (s) =>
          s.code.toLowerCase().includes(lowerSearch) ||
          s.name.toLowerCase().includes(lowerSearch) ||
          s.contactPerson.toLowerCase().includes(lowerSearch)
      );
    }

    // 状态过滤
    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter);
    }

    return result;
  }, [suppliers, searchText, statusFilter]);

  // 统计数据
  const statistics = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((s) => s.status === SupplierStatus.ACTIVE).length;
    return { total, active };
  }, [suppliers]);

  // 状态映射
  const statusMap: Record<string, { label: string; color: string }> = {
    [SupplierStatus.ACTIVE]: { label: '启用', color: 'success' },
    [SupplierStatus.SUSPENDED]: { label: '暂停', color: 'warning' },
    [SupplierStatus.TERMINATED]: { label: '终止', color: 'error' },
    [SupplierStatus.PENDING_APPROVAL]: { label: '待审批', color: 'processing' },
    [SupplierStatus.UNDER_REVIEW]: { label: '复核中', color: 'default' },
  };

  // 表格列定义
  const columns: ColumnsType<SupplierListItem> = [
    {
      title: '供应商编码',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      fixed: 'left',
    },
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 140,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: SupplierStatus) => {
        const statusInfo = statusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<SearchOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
  };

  const handleRefresh = () => {
    fetchSuppliers();
    message.success('刷新成功');
  };

  const handleExport = () => {
    message.info('导出功能开发中');
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleView = (supplier: SupplierListItem) => {
    navigate(`/purchase-management/suppliers/${supplier.id}`);
  };

  const handleEdit = (supplier: SupplierListItem) => {
    setEditingSupplier(supplier);
    form.setFieldsValue({
      code: supplier.code,
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      contactPhone: supplier.contactPhone,
      status: supplier.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (supplier: SupplierListItem) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除供应商"${supplier.name}"吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        message.info('删除功能开发中');
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      if (editingSupplier) {
        // 编辑模式 - 调用 updateSupplier API
        await updateSupplier(editingSupplier.id, {
          name: values.name,
          contactName: values.contactPerson || undefined,
          contactPhone: values.contactPhone || undefined,
          status: values.status,
        });
        message.success('供应商更新成功');
      } else {
        // 新建模式 - 调用 createSupplier API
        await createSupplier({
          code: values.code,
          name: values.name,
          contactName: values.contactPerson || undefined,
          contactPhone: values.contactPhone || undefined,
          status: values.status,
        });
        message.success('供应商创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingSupplier(null);
      // 刷新列表
      fetchSuppliers();
    } catch (error) {
      if (error instanceof Error) {
        // 显示错误消息，保持弹窗打开
        message.error(error.message);
      } else {
        console.error('表单验证失败:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingSupplier(null);
  };

  // 错误状态
  if (error) {
    return (
      <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
        <Card title="供应商列表">
          <Empty
            description={
              <span>
                加载失败: {error}
                <Button type="link" onClick={handleRefresh}>
                  重试
                </Button>
              </span>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title="供应商列表"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
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
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态"
              style={{ width: '100%' }}
              allowClear
              onChange={handleStatusChange}
            >
              <Option value={SupplierStatus.ACTIVE}>启用</Option>
              <Option value={SupplierStatus.SUSPENDED}>暂停</Option>
              <Option value={SupplierStatus.TERMINATED}>终止</Option>
            </Select>
          </Col>
        </Row>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {statistics.total}
                </div>
                <div style={{ color: '#666' }}>供应商总数</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {statistics.active}
                </div>
                <div style={{ color: '#666' }}>启用中</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 表格 */}
        <Spin spinning={loading}>
          {filteredSuppliers.length === 0 && !loading ? (
            <Empty description="暂无供应商数据" />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredSuppliers}
              rowKey="id"
              scroll={{ x: 1000 }}
              pagination={{
                total: filteredSuppliers.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
              }}
            />
          )}
        </Spin>
      </Card>

      {/* 新建/编辑供应商弹窗 */}
      <Modal
        title={editingSupplier ? '编辑供应商' : '新建供应商'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText="确定"
        cancelText="取消"
        confirmLoading={saving}
        okButtonProps={{ disabled: saving }}
        cancelButtonProps={{ disabled: saving }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: SupplierStatus.ACTIVE,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="供应商编码"
                name="code"
                rules={[{ required: true, message: '请输入供应商编码' }]}
              >
                <Input
                  placeholder="请输入供应商编码"
                  disabled={!!editingSupplier}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="供应商名称"
                name="name"
                rules={[{ required: true, message: '请输入供应商名称' }]}
              >
                <Input placeholder="请输入供应商名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="联系人" name="contactPerson">
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="联系电话"
                name="contactPhone"
                rules={[{ pattern: /^$|^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value={SupplierStatus.ACTIVE}>启用</Option>
                  <Option value={SupplierStatus.SUSPENDED}>暂停</Option>
                  <Option value={SupplierStatus.TERMINATED}>终止</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierList;
