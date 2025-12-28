import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, Tag, Table, Tabs, Statistic, Row, Col, Timeline } from 'antd';
import { ArrowLeftOutlined, EditOutlined, PrinterOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

interface SupplierDetailData {
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
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  // 额外信息
  registrationNumber: string;
  taxNumber: string;
  bankAccount: string;
  bankName: string;
  remark: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  receivingStatus: string;
}

interface ProductSupplied {
  id: string;
  productCode: string;
  productName: string;
  specification: string;
  unitPrice: number;
  totalPurchased: number;
  lastPurchaseDate: string;
}

/**
 * 供应商详情页面
 * 路由: /purchase-management/suppliers/:id
 */
const SupplierDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [supplierData, setSupplierData] = useState<SupplierDetailData | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [productsSupplied, setProductsSupplied] = useState<ProductSupplied[]>([]);

  useEffect(() => {
    if (id) {
      loadSupplierDetail(id);
    }
  }, [id]);

  const loadSupplierDetail = async (supplierId: string) => {
    setLoading(true);
    try {
      // TODO: 调用API获取供应商详情
      // Mock数据
      const mockData: SupplierDetailData = {
        id: supplierId,
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
        createdAt: '2024-01-15 10:30:00',
        createdBy: '管理员',
        updatedAt: '2025-12-10 15:20:00',
        updatedBy: '张三',
        registrationNumber: '91110000MA01XXXX0X',
        taxNumber: '91110000MA01XXXX0X',
        bankAccount: '6222021234567890123',
        bankName: '中国工商银行北京分行',
        remark: '优质供应商，长期合作伙伴',
      };

      const mockOrders: PurchaseOrder[] = [
        {
          id: '1',
          orderNumber: 'PO202512110001',
          orderDate: '2025-12-11',
          totalAmount: 58000,
          status: 'completed',
          receivingStatus: 'received',
        },
        {
          id: '2',
          orderNumber: 'PO202512080003',
          orderDate: '2025-12-08',
          totalAmount: 42000,
          status: 'pending',
          receivingStatus: 'partial',
        },
        {
          id: '3',
          orderNumber: 'PO202512050002',
          orderDate: '2025-12-05',
          totalAmount: 35000,
          status: 'completed',
          receivingStatus: 'received',
        },
      ];

      const mockProducts: ProductSupplied[] = [
        {
          id: '1',
          productCode: 'PROD001',
          productName: '可乐',
          specification: '330ml/瓶',
          unitPrice: 2.5,
          totalPurchased: 15000,
          lastPurchaseDate: '2025-12-11',
        },
        {
          id: '2',
          productCode: 'PROD002',
          productName: '爆米花',
          specification: '大桶',
          unitPrice: 8.5,
          totalPurchased: 8000,
          lastPurchaseDate: '2025-12-10',
        },
        {
          id: '3',
          productCode: 'PROD003',
          productName: '矿泉水',
          specification: '500ml/瓶',
          unitPrice: 1.5,
          totalPurchased: 20000,
          lastPurchaseDate: '2025-12-09',
        },
      ];

      setSupplierData(mockData);
      setPurchaseOrders(mockOrders);
      setProductsSupplied(mockProducts);
    } catch (error) {
      console.error('加载供应商详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/purchase-management/suppliers');
  };

  const handleEdit = () => {
    navigate(`/purchase-management/suppliers/${id}/edit`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateOrder = () => {
    navigate(`/purchase-management/orders?supplierId=${id}`);
  };

  if (!supplierData) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

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

  // 采购订单状态映射
  const orderStatusMap: Record<string, { label: string; color: string }> = {
    draft: { label: '草稿', color: 'default' },
    pending: { label: '待审核', color: 'processing' },
    approved: { label: '已审核', color: 'success' },
    completed: { label: '已完成', color: 'success' },
    cancelled: { label: '已取消', color: 'error' },
  };

  // 收货状态映射
  const receivingStatusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '待收货', color: 'default' },
    partial: { label: '部分收货', color: 'processing' },
    received: { label: '已收货', color: 'success' },
  };

  const statusInfo = statusMap[supplierData.status] || { label: supplierData.status, color: 'default' };
  const creditInfo = creditRatingMap[supplierData.creditRating] || { 
    label: supplierData.creditRating, 
    color: 'default' 
  };

  // 采购订单表格列
  const orderColumns: ColumnsType<PurchaseOrder> = [
    {
      title: '采购单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => <a style={{ color: '#1890ff' }}>{text}</a>,
    },
    {
      title: '订单日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusInfo = orderStatusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
    {
      title: '收货状态',
      dataIndex: 'receivingStatus',
      key: 'receivingStatus',
      render: (status: string) => {
        const statusInfo = receivingStatusMap[status] || { label: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
      },
    },
  ];

  // 供应商品表格列
  const productColumns: ColumnsType<ProductSupplied> = [
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '累计采购数量',
      dataIndex: 'totalPurchased',
      key: 'totalPurchased',
    },
    {
      title: '最近采购日期',
      dataIndex: 'lastPurchaseDate',
      key: 'lastPurchaseDate',
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Card
        title={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack} type="text" />
            <span>供应商详情</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              编辑
            </Button>
            <Button type="primary" onClick={handleCreateOrder}>
              创建采购订单
            </Button>
          </Space>
        }
        loading={loading}
      >
        {/* 基本信息 */}
        <Card type="inner" title="基本信息" style={{ marginBottom: 16 }}>
          <Descriptions column={3} bordered>
            <Descriptions.Item label="供应商编码" span={1}>
              <strong>{supplierData.supplierCode}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="供应商名称" span={2}>
              <strong style={{ fontSize: 16 }}>{supplierData.supplierName}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="供应商类别" span={1}>
              {categoryMap[supplierData.category] || supplierData.category}
            </Descriptions.Item>
            <Descriptions.Item label="状态" span={1}>
              <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="信用评级" span={1}>
              <Tag color={creditInfo.color}>{creditInfo.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="联系人" span={1}>
              {supplierData.contactPerson}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话" span={1}>
              <Space>
                <PhoneOutlined />
                {supplierData.contactPhone}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="邮箱" span={1}>
              <Space>
                <MailOutlined />
                {supplierData.email}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="地址" span={3}>
              {supplierData.address}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 统计信息 */}
        <Card type="inner" title="统计信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="累计订单数" value={supplierData.totalOrders} suffix="个" />
            </Col>
            <Col span={6}>
              <Statistic 
                title="累计采购金额" 
                value={supplierData.totalAmount} 
                prefix="¥" 
                precision={2} 
              />
            </Col>
            <Col span={6}>
              <Statistic title="供应商品数" value={productsSupplied.length} suffix="个" />
            </Col>
            <Col span={6}>
              <Statistic 
                title="平均订单金额" 
                value={supplierData.totalOrders > 0 ? supplierData.totalAmount / supplierData.totalOrders : 0} 
                prefix="¥" 
                precision={2} 
              />
            </Col>
          </Row>
        </Card>

        {/* 财务信息 */}
        <Card type="inner" title="财务信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="工商注册号">
              {supplierData.registrationNumber}
            </Descriptions.Item>
            <Descriptions.Item label="税务登记号">
              {supplierData.taxNumber}
            </Descriptions.Item>
            <Descriptions.Item label="开户银行">
              {supplierData.bankName}
            </Descriptions.Item>
            <Descriptions.Item label="银行账号">
              {supplierData.bankAccount}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 详细信息标签页 */}
        <Card type="inner" title="详细信息">
          <Tabs
            defaultActiveKey="orders"
            items={[
              {
                key: 'orders',
                label: `采购订单 (${purchaseOrders.length})`,
                children: (
                  <Table
                    columns={orderColumns}
                    dataSource={purchaseOrders}
                    rowKey="id"
                    pagination={{
                      pageSize: 5,
                      showTotal: (total) => `共 ${total} 条`,
                    }}
                  />
                ),
              },
              {
                key: 'products',
                label: `供应商品 (${productsSupplied.length})`,
                children: (
                  <Table
                    columns={productColumns}
                    dataSource={productsSupplied}
                    rowKey="id"
                    pagination={{
                      pageSize: 5,
                      showTotal: (total) => `共 ${total} 条`,
                    }}
                  />
                ),
              },
              {
                key: 'history',
                label: '操作历史',
                children: (
                  <Timeline
                    items={[
                      {
                        children: (
                          <div>
                            <div style={{ marginBottom: 4 }}>
                              <strong>更新供应商信息</strong>
                            </div>
                            <div style={{ color: '#666', fontSize: 12 }}>
                              操作人: {supplierData.updatedBy} | 时间: {supplierData.updatedAt}
                            </div>
                          </div>
                        ),
                        color: 'blue',
                      },
                      {
                        children: (
                          <div>
                            <div style={{ marginBottom: 4 }}>
                              <strong>创建供应商</strong>
                            </div>
                            <div style={{ color: '#666', fontSize: 12 }}>
                              操作人: {supplierData.createdBy} | 时间: {supplierData.createdAt}
                            </div>
                          </div>
                        ),
                        color: 'green',
                      },
                    ]}
                  />
                ),
              },
            ]}
          />
        </Card>

        {/* 备注信息 */}
        {supplierData.remark && (
          <Card type="inner" title="备注信息" style={{ marginTop: 16 }}>
            <p>{supplierData.remark}</p>
          </Card>
        )}

        {/* 系统信息 */}
        <Card type="inner" title="系统信息" style={{ marginTop: 16 }}>
          <Descriptions column={2} size="small">
            <Descriptions.Item label="创建人">{supplierData.createdBy}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{supplierData.createdAt}</Descriptions.Item>
            <Descriptions.Item label="最后修改人">{supplierData.updatedBy}</Descriptions.Item>
            <Descriptions.Item label="最后修改时间">{supplierData.updatedAt}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Card>
    </div>
  );
};

export default SupplierDetail;
