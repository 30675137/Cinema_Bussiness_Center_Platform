/**
 * 供应商表单组件
 */
import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Card,
  Row,
  Col,
  Divider,
  Table,
  Tag,
  Upload,
  Modal,
  message
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { Supplier, SupplierStatus, SupplierLevel, SupplierType, ContactInfo, BankAccount, SupplierQualification, CreateSupplierParams, UpdateSupplierParams } from '@/types/supplier';
import { generateId } from '@/utils/helpers';

const { Option } = Select;
const { TextArea } = Input;

interface SupplierFormProps {
  mode: 'create' | 'edit';
  initialData?: Supplier | null;
  onSubmit: (data: CreateSupplierParams | UpdateSupplierParams) => void;
  onCancel: () => void;
  loading?: boolean;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [contacts, setContacts] = useState<ContactInfo[]>(initialData?.contacts || []);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialData?.bankAccounts || []);
  const [qualifications, setQualifications] = useState<SupplierQualification[]>(initialData?.qualifications || []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.setFieldsValue({
        name: initialData.name,
        shortName: initialData.shortName,
        type: initialData.type,
        level: initialData.level,
        creditCode: initialData.creditCode,
        legalRepresentative: initialData.legalRepresentative,
        address: initialData.address,
        postalCode: initialData.postalCode,
        phone: initialData.phone,
        fax: initialData.fax,
        email: initialData.email,
        website: initialData.website,
        productCategories: initialData.productCategories,
        mainProducts: initialData.mainProducts,
        cooperationStartDate: initialData.cooperationStartDate,
        cooperationEndDate: initialData.cooperationEndDate,
        creditLimit: initialData.creditLimit,
        paymentTerms: initialData.paymentTerms,
        remarks: initialData.remarks
      });
    }
  }, [initialData, mode, form]);

  // 供应商状态选项
  const statusOptions = [
    { value: SupplierStatus.ACTIVE, label: '正常合作', color: 'green' },
    { value: SupplierStatus.SUSPENDED, label: '暂停合作', color: 'orange' },
    { value: SupplierStatus.TERMINATED, label: '终止合作', color: 'red' },
    { value: SupplierStatus.PENDING_APPROVAL, label: '待审批', color: 'blue' },
    { value: SupplierStatus.UNDER_REVIEW, label: '复核中', color: 'purple' }
  ];

  // 供应商等级选项
  const levelOptions = [
    { value: SupplierLevel.STRATEGIC, label: '战略供应商', icon: '⭐⭐⭐' },
    { value: SupplierLevel.PREFERRED, label: '优选供应商', icon: '⭐⭐' },
    { value: SupplierLevel.STANDARD, label: '标准供应商', icon: '⭐' },
    { value: SupplierLevel.TRIAL, label: '试用供应商', icon: '📋' }
  ];

  // 供应商类型选项
  const typeOptions = [
    { value: SupplierType.MANUFACTURER, label: '生产商' },
    { value: SupplierType.WHOLESALER, label: '批发商' },
    { value: SupplierType.DISTRIBUTOR, label: '经销商' },
    { value: SupplierType.SERVICE_PROVIDER, label: '服务提供商' },
    { value: SupplierType.OTHER, label: '其他' }
  ];

  // 供应品类选项
  const categoryOptions = [
    '食品原料',
    '包装材料',
    '清洁用品',
    '设备配件',
    '办公用品',
    '电子设备',
    '服装纺织',
    '其他用品'
  ];

  // 添加联系人
  const handleAddContact = () => {
    const newContact: ContactInfo = {
      id: generateId(),
      name: '',
      phone: '',
      position: '',
      email: '',
      isPrimary: contacts.length === 0
    };
    setContacts([...contacts, newContact]);
  };

  // 删除联系人
  const handleDeleteContact = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该联系人吗？',
      onOk: () => {
        setContacts(contacts.filter(contact => contact.id !== id));
      }
    });
  };

  // 联系人表格列
  const contactColumns: ColumnsType<ContactInfo> = [
    {
      title: '姓名',
      dataIndex: 'name',
      render: (text, record) => (
        <div>
          {text}
          {record.isPrimary && <Tag color="blue" size="small" className="ml-2">主要</Tag>}
        </div>
      )
    },
    {
      title: '职位',
      dataIndex: 'position'
    },
    {
      title: '手机',
      dataIndex: 'phone'
    },
    {
      title: '邮箱',
      dataIndex: 'email'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteContact(record.id)}
        />
      )
    }
  ];

  // 添加银行账户
  const handleAddBankAccount = () => {
    const newAccount: BankAccount = {
      id: generateId(),
      bankName: '',
      accountName: '',
      accountNumber: '',
      isDefault: bankAccounts.length === 0
    };
    setBankAccounts([...bankAccounts, newAccount]);
  };

  // 删除银行账户
  const handleDeleteBankAccount = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该银行账户吗？',
      onOk: () => {
        setBankAccounts(bankAccounts.filter(account => account.id !== id));
      }
    });
  };

  // 银行账户表格列
  const bankAccountColumns: ColumnsType<BankAccount> = [
    {
      title: '开户行',
      dataIndex: 'bankName'
    },
    {
      title: '账户名称',
      dataIndex: 'accountName'
    },
    {
      title: '账号',
      dataIndex: 'accountNumber'
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      render: (isDefault) => (
        isDefault ? <Tag color="green">默认</Tag> : '-'
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteBankAccount(record.id)}
        />
      )
    }
  ];

  // 添加资质证书
  const handleAddQualification = () => {
    const newQualification: SupplierQualification = {
      id: generateId(),
      qualificationType: '',
      qualificationName: '',
      certificateNumber: '',
      issuingAuthority: '',
      issueDate: '',
      expireDate: '',
      status: 'valid'
    };
    setQualifications([...qualifications, newQualification]);
  };

  // 删除资质证书
  const handleDeleteQualification = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该资质证书吗？',
      onOk: () => {
        setQualifications(qualifications.filter(qualification => qualification.id !== id));
      }
    });
  };

  // 资质证书表格列
  const qualificationColumns: ColumnsType<SupplierQualification> = [
    {
      title: '资质类型',
      dataIndex: 'qualificationType'
    },
    {
      title: '证书名称',
      dataIndex: 'qualificationName'
    },
    {
      title: '证书编号',
      dataIndex: 'certificateNumber'
    },
    {
      title: '发证机关',
      dataIndex: 'issuingAuthority'
    },
    {
      title: '有效期至',
      dataIndex: 'expireDate'
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'valid' ? 'green' : status === 'expired' ? 'red' : 'blue'}>
          {status === 'valid' ? '有效' : status === 'expired' ? '已过期' : '待验证'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteQualification(record.id)}
        />
      )
    }
  ];

  // 处理文件上传
  const handleUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
    }
    if (info.file.status === 'done') {
      setUploading(false);
      message.success('文件上传成功');
    }
    if (info.file.status === 'error') {
      setUploading(false);
      message.error('文件上传失败');
    }
  };

  // 表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        contacts,
        bankAccounts,
        qualifications
      };
      onSubmit(formData);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialData ? {
          status: initialData.status
        } : { status: SupplierStatus.PENDING_APPROVAL }}
      >
        {/* 基本信息 */}
        <Card title="基本信息" className="mb-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="供应商名称"
                name="name"
                rules={[{ required: true, message: '请输入供应商名称' }]}
              >
                <Input placeholder="请输入供应商名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="供应商简称"
                name="shortName"
              >
                <Input placeholder="请输入供应商简称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="供应商类型"
                name="type"
                rules={[{ required: true, message: '请选择供应商类型' }]}
              >
                <Select placeholder="请选择供应商类型">
                  {typeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="供应商等级"
                name="level"
                rules={[{ required: true, message: '请选择供应商等级' }]}
              >
                <Select placeholder="请选择供应商等级">
                  {levelOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="统一社会信用代码"
                name="creditCode"
              >
                <Input placeholder="请输入统一社会信用代码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="法定代表人"
                name="legalRepresentative"
              >
                <Input placeholder="请输入法定代表人" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="公司地址"
                name="address"
                rules={[{ required: true, message: '请输入公司地址' }]}
              >
                <Input placeholder="请输入公司地址" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="邮政编码"
                name="postalCode"
              >
                <Input placeholder="请输入邮政编码" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="公司电话"
                name="phone"
                rules={[{ required: true, message: '请输入公司电话' }]}
              >
                <Input placeholder="请输入公司电话" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="公司传真"
                name="fax"
              >
                <Input placeholder="请输入公司传真" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="公司邮箱"
                name="email"
                rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
              >
                <Input placeholder="请输入公司邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="公司网站"
                name="website"
              >
                <Input placeholder="请输入公司网站" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 业务信息 */}
        <Card title="业务信息" className="mb-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="供应品类"
                name="productCategories"
                rules={[{ required: true, message: '请选择供应品类' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择供应品类"
                  options={categoryOptions.map(category => ({
                    label: category,
                    value: category
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="主营产品"
                name="mainProducts"
              >
                <TextArea
                  rows={3}
                  placeholder="请输入主营产品，多个产品用逗号分隔"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="合作开始日期"
                name="cooperationStartDate"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="合作结束日期"
                name="cooperationEndDate"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="信用额度"
                name="creditLimit"
              >
                <Input type="number" placeholder="请输入信用额度" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="付款条件"
                name="paymentTerms"
              >
                <Input placeholder="请输入付款条件" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="备注"
                name="remarks"
              >
                <TextArea rows={3} placeholder="请输入备注信息" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 联系人信息 */}
        <Card
          title="联系人信息"
          className="mb-4"
          extra={
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddContact}
            >
              添加联系人
            </Button>
          }
        >
          <Table
            dataSource={contacts}
            columns={contactColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>

        {/* 银行账户信息 */}
        <Card
          title="银行账户信息"
          className="mb-4"
          extra={
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddBankAccount}
            >
              添加银行账户
            </Button>
          }
        >
          <Table
            dataSource={bankAccounts}
            columns={bankAccountColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>

        {/* 资质证书 */}
        <Card
          title="资质证书"
          className="mb-4"
          extra={
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddQualification}
            >
              添加资质证书
            </Button>
          }
        >
          <Table
            dataSource={qualifications}
            columns={qualificationColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <Space>
            <Button onClick={onCancel}>
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {mode === 'create' ? '创建供应商' : '保存修改'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default SupplierForm;