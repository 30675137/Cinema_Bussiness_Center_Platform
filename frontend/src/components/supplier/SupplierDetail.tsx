/**
 * 供应商详情组件
 */
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Space,
  Tabs,
  Table,
  Avatar,
  Progress,
  Timeline,
  Statistic,
  Modal,
  Form,
  Input,
  Rate,
  message,
  Divider,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  BankOutlined,
  FileTextOutlined,
  EditOutlined,
  StarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  Supplier,
  SupplierStatus,
  SupplierLevel,
  SupplierType,
  ContactInfo,
  BankAccount,
  SupplierQualification,
  SupplierEvaluation,
} from '@/types/supplier';
import { useSupplierStore } from '@/stores/supplierStore';
import { formatCurrency, formatDate, formatPhoneNumber } from '@/utils/formatters';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface SupplierDetailProps {
  supplierId: string;
  onEdit?: (supplier: Supplier) => void;
  onBack?: () => void;
}

const SupplierDetail: React.FC<SupplierDetailProps> = ({ supplierId, onEdit, onBack }) => {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluationModalVisible, setEvaluationModalVisible] = useState(false);
  const [evaluationForm] = Form.useForm();

  const { fetchSupplierById, addEvaluation, updatePurchaseStats } = useSupplierStore();

  useEffect(() => {
    if (supplierId) {
      loadSupplierData();
    }
  }, [supplierId]);

  const loadSupplierData = async () => {
    setLoading(true);
    try {
      // TODO: 从store获取供应商数据
      // const supplierData = await fetchSupplierById(supplierId);
      // setSupplier(supplierData);

      // Mock数据
      const mockSupplier: Supplier = {
        id: supplierId,
        code: 'SUP001',
        name: '示例供应商有限公司',
        shortName: '示例供应商',
        type: SupplierType.MANUFACTURER,
        level: SupplierLevel.STRATEGIC,
        status: SupplierStatus.ACTIVE,
        creditCode: '91110000123456789X',
        legalRepresentative: '张三',
        address: '北京市朝阳区示例路123号',
        postalCode: '100000',
        phone: '010-12345678',
        fax: '010-12345679',
        email: 'contact@example.com',
        website: 'www.example.com',
        contacts: [
          {
            id: '1',
            name: '李四',
            position: '销售经理',
            phone: '13800138000',
            email: 'lisi@example.com',
            isPrimary: true,
          },
          {
            id: '2',
            name: '王五',
            position: '技术支持',
            phone: '13900139000',
            email: 'wangwu@example.com',
            isPrimary: false,
          },
        ],
        bankAccounts: [
          {
            id: '1',
            bankName: '中国工商银行',
            bankCode: 'ICBC',
            accountName: '示例供应商有限公司',
            accountNumber: '6222021234567890123',
            isDefault: true,
          },
        ],
        qualifications: [
          {
            id: '1',
            qualificationType: '营业执照',
            qualificationName: '企业法人营业执照',
            certificateNumber: '11000000123456789',
            issuingAuthority: '北京市工商行政管理局',
            issueDate: '2020-01-01',
            expireDate: '2030-01-01',
            status: 'valid',
            certificateFile: '/files/business-license.pdf',
          },
        ],
        evaluations: [
          {
            id: '1',
            evaluationType: 'comprehensive',
            score: 4.5,
            grade: 'A',
            comments: '产品质量优秀，交付及时，服务态度良好',
            evaluatorId: 'admin',
            evaluationDate: '2024-01-15',
          },
          {
            id: '2',
            evaluationType: 'quality',
            score: 4.2,
            grade: 'A',
            comments: '产品质量稳定，符合标准',
            evaluatorId: 'quality-manager',
            evaluationDate: '2024-01-10',
          },
        ],
        purchaseStats: {
          totalOrders: 156,
          totalAmount: 2580000,
          onTimeDeliveryRate: 95.5,
          qualityPassRate: 98.2,
          lastOrderDate: '2024-01-20',
        },
        productCategories: ['食品原料', '包装材料'],
        mainProducts: '薯片、爆米花原料、包装袋、纸杯',
        cooperationStartDate: '2020-01-01',
        creditLimit: 500000,
        paymentTerms: '月结30天',
        remarks: '战略合作伙伴，长期稳定合作',
        createdById: 'admin',
        createdAt: '2020-01-01T00:00:00Z',
        updatedById: 'admin',
        updatedAt: '2024-01-20T00:00:00Z',
      };

      setSupplier(mockSupplier);
    } catch (error) {
      console.error('Load supplier error:', error);
      message.error('加载供应商信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 供应商状态配置
  const statusConfig = {
    [SupplierStatus.ACTIVE]: { color: 'green', text: '正常合作', icon: <CheckCircleOutlined /> },
    [SupplierStatus.SUSPENDED]: {
      color: 'orange',
      text: '暂停合作',
      icon: <ExclamationCircleOutlined />,
    },
    [SupplierStatus.TERMINATED]: {
      color: 'red',
      text: '终止合作',
      icon: <ExclamationCircleOutlined />,
    },
    [SupplierStatus.PENDING_APPROVAL]: {
      color: 'blue',
      text: '待审批',
      icon: <ClockCircleOutlined />,
    },
    [SupplierStatus.UNDER_REVIEW]: {
      color: 'purple',
      text: '复核中',
      icon: <ExclamationCircleOutlined />,
    },
  };

  // 供应商等级配置
  const levelConfig = {
    [SupplierLevel.STRATEGIC]: { color: 'gold', text: '战略供应商', icon: '⭐⭐⭐' },
    [SupplierLevel.PREFERRED]: { color: 'blue', text: '优选供应商', icon: '⭐⭐' },
    [SupplierLevel.STANDARD]: { color: 'green', text: '标准供应商', icon: '⭐' },
    [SupplierLevel.TRIAL]: { color: 'gray', text: '试用供应商', icon: '📋' },
  };

  // 供应商类型配置
  const typeConfig = {
    [SupplierType.MANUFACTURER]: '生产商',
    [SupplierType.WHOLESALER]: '批发商',
    [SupplierType.DISTRIBUTOR]: '经销商',
    [SupplierType.SERVICE_PROVIDER]: '服务提供商',
    [SupplierType.OTHER]: '其他',
  };

  // 处理评价提交
  const handleEvaluationSubmit = async (values: any) => {
    try {
      await addEvaluation(supplierId, {
        evaluationType: values.evaluationType,
        score: values.score,
        comments: values.comments,
      });
      message.success('评价添加成功');
      setEvaluationModalVisible(false);
      evaluationForm.resetFields();
      loadSupplierData(); // 重新加载数据
    } catch (error) {
      console.error('Evaluation submit error:', error);
      message.error('评价添加失败');
    }
  };

  // 更新采购统计
  const handleUpdatePurchaseStats = async () => {
    try {
      await updatePurchaseStats(supplierId);
      message.success('采购统计更新成功');
      loadSupplierData();
    } catch (error) {
      console.error('Update stats error:', error);
      message.error('统计更新失败');
    }
  };

  if (!supplier) {
    return <div>加载中...</div>;
  }

  // 联系人表格列
  const contactColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ContactInfo) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{text}</span>
          {record.isPrimary && (
            <Tag color="blue" size="small">
              主要
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => formatPhoneNumber(phone),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
  ];

  // 银行账户表格列
  const bankAccountColumns = [
    {
      title: '开户行',
      dataIndex: 'bankName',
      key: 'bankName',
    },
    {
      title: '账户名称',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: '账号',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) => (isDefault ? <Tag color="green">默认</Tag> : '-'),
    },
  ];

  // 资质证书表格列
  const qualificationColumns = [
    {
      title: '资质类型',
      dataIndex: 'qualificationType',
      key: 'qualificationType',
    },
    {
      title: '证书名称',
      dataIndex: 'qualificationName',
      key: 'qualificationName',
    },
    {
      title: '证书编号',
      dataIndex: 'certificateNumber',
      key: 'certificateNumber',
    },
    {
      title: '发证机关',
      dataIndex: 'issuingAuthority',
      key: 'issuingAuthority',
    },
    {
      title: '有效期至',
      dataIndex: 'expireDate',
      key: 'expireDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          valid: { color: 'green', text: '有效' },
          expired: { color: 'red', text: '已过期' },
          pending: { color: 'blue', text: '待验证' },
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config?.color}>{config?.text}</Tag>;
      },
    },
  ];

  // 评价历史表格列
  const evaluationColumns = [
    {
      title: '评价类型',
      dataIndex: 'evaluationType',
      key: 'evaluationType',
      render: (type: string) => {
        const typeMap = {
          quality: '质量评价',
          delivery: '交付评价',
          service: '服务评价',
          price: '价格评价',
          comprehensive: '综合评价',
        };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => <Rate disabled defaultValue={score} style={{ fontSize: 14 }} />,
    },
    {
      title: '等级',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: string) => {
        const colorMap = { A: 'green', B: 'blue', C: 'orange', D: 'red' };
        return <Tag color={colorMap[grade as keyof typeof colorMap]}>{grade}</Tag>;
      },
    },
    {
      title: '评价说明',
      dataIndex: 'comments',
      key: 'comments',
      ellipsis: true,
    },
    {
      title: '评价时间',
      dataIndex: 'evaluationDate',
      key: 'evaluationDate',
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* 操作按钮 */}
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Button onClick={onBack}>返回</Button>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>供应商详情</span>
        </Space>
        <Space>
          <Button onClick={() => setEvaluationModalVisible(true)}>添加评价</Button>
          <Button onClick={handleUpdatePurchaseStats}>更新统计</Button>
          <Button type="primary" icon={<EditOutlined />} onClick={() => onEdit?.(supplier)}>
            编辑
          </Button>
        </Space>
      </div>

      {/* 基本信息 */}
      <Card title="基本信息" className="mb-4">
        <Row gutter={16}>
          <Col span={16}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="供应商编号">{supplier.code}</Descriptions.Item>
              <Descriptions.Item label="供应商名称">{supplier.name}</Descriptions.Item>
              <Descriptions.Item label="供应商简称">{supplier.shortName || '-'}</Descriptions.Item>
              <Descriptions.Item label="供应商类型">{typeConfig[supplier.type]}</Descriptions.Item>
              <Descriptions.Item label="供应商等级">
                <Tag color={levelConfig[supplier.level].color}>
                  {levelConfig[supplier.level].icon} {levelConfig[supplier.level].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="供应商状态">
                <Tag
                  color={statusConfig[supplier.status].color}
                  icon={statusConfig[supplier.status].icon}
                >
                  {statusConfig[supplier.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="统一社会信用代码">
                {supplier.creditCode || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="法定代表人">
                {supplier.legalRepresentative || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="公司地址" span={2}>
                {supplier.address}
              </Descriptions.Item>
              <Descriptions.Item label="邮政编码">{supplier.postalCode || '-'}</Descriptions.Item>
              <Descriptions.Item label="公司电话">
                <Space>
                  <PhoneOutlined />
                  {formatPhoneNumber(supplier.phone)}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="公司传真">{supplier.fax || '-'}</Descriptions.Item>
              <Descriptions.Item label="公司邮箱">
                <Space>
                  <MailOutlined />
                  {supplier.email || '-'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="公司网站">
                {supplier.website ? (
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                    {supplier.website}
                  </a>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="供应品类" span={2}>
                <Space wrap>
                  {supplier.productCategories.map((category, index) => (
                    <Tag key={index}>{category}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="主营产品" span={2}>
                {supplier.mainProducts || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="合作开始日期">
                {formatDate(supplier.cooperationStartDate)}
              </Descriptions.Item>
              <Descriptions.Item label="合作结束日期">
                {supplier.cooperationEndDate ? formatDate(supplier.cooperationEndDate) : '长期合作'}
              </Descriptions.Item>
              <Descriptions.Item label="信用额度">
                {formatCurrency(supplier.creditLimit || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="付款条件">{supplier.paymentTerms || '-'}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {supplier.remarks || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={8}>
            {/* 采购统计卡片 */}
            <Card title="采购统计" size="small" className="mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="总订单数"
                    value={supplier.purchaseStats.totalOrders}
                    prefix={<TrophyOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="总采购金额"
                    value={supplier.purchaseStats.totalAmount}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={12}>
                  <div>
                    <div style={{ marginBottom: '8px' }}>准时交付率</div>
                    <Progress
                      percent={supplier.purchaseStats.onTimeDeliveryRate}
                      status={
                        supplier.purchaseStats.onTimeDeliveryRate >= 95 ? 'success' : 'exception'
                      }
                    />
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <div style={{ marginBottom: '8px' }}>质量合格率</div>
                    <Progress
                      percent={supplier.purchaseStats.qualityPassRate}
                      status={
                        supplier.purchaseStats.qualityPassRate >= 98 ? 'success' : 'exception'
                      }
                    />
                  </div>
                </Col>
              </Row>
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <small className="text-gray-500">
                  最近采购:{' '}
                  {supplier.purchaseStats.lastOrderDate
                    ? formatDate(supplier.purchaseStats.lastOrderDate)
                    : '暂无记录'}
                </small>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 详情标签页 */}
      <Card>
        <Tabs defaultActiveKey="contacts">
          <TabPane tab="联系人信息" key="contacts">
            <Table
              dataSource={supplier.contacts}
              columns={contactColumns}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="银行账户" key="bankAccounts">
            <Table
              dataSource={supplier.bankAccounts}
              columns={bankAccountColumns}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="资质证书" key="qualifications">
            <Table
              dataSource={supplier.qualifications}
              columns={qualificationColumns}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="评价历史" key="evaluations">
            <Table
              dataSource={supplier.evaluations}
              columns={evaluationColumns}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 评价弹窗 */}
      <Modal
        title="添加供应商评价"
        open={evaluationModalVisible}
        onCancel={() => {
          setEvaluationModalVisible(false);
          evaluationForm.resetFields();
        }}
        onOk={() => {
          evaluationForm.submit();
        }}
        destroyOnClose
      >
        <Form form={evaluationForm} layout="vertical" onFinish={handleEvaluationSubmit}>
          <Form.Item
            name="evaluationType"
            label="评价类型"
            rules={[{ required: true, message: '请选择评价类型' }]}
          >
            <Select placeholder="请选择评价类型">
              <Option value="quality">质量评价</Option>
              <Option value="delivery">交付评价</Option>
              <Option value="service">服务评价</Option>
              <Option value="price">价格评价</Option>
              <Option value="comprehensive">综合评价</Option>
            </Select>
          </Form.Item>

          <Form.Item name="score" label="评分" rules={[{ required: true, message: '请选择评分' }]}>
            <Rate />
          </Form.Item>

          <Form.Item
            name="comments"
            label="评价说明"
            rules={[{ required: true, message: '请输入评价说明' }]}
          >
            <TextArea rows={4} placeholder="请输入评价说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SupplierDetail;
