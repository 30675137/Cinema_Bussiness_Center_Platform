import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  Switch,
  message,
  Typography,
  Tag,
  Tooltip,
  Avatar,
  Image,
  Popconfirm,
  Divider,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
  StarOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { Brand } from '@/types/spu';
import { SPUNotificationService } from '@/components/common/Notification';
import { statusColors } from '@/theme';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface BrandManagerProps {
  mode?: 'manage' | 'select';
  onBrandSelect?: (brand: Brand) => void;
  selectedBrandIds?: string[];
  showActions?: boolean;
  height?: number;
}

interface BrandFormData {
  name: string;
  code: string;
  status: boolean;
  logo?: string;
  description?: string;
  website?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  sortOrder?: number;
}

const BrandManager: React.FC<BrandManagerProps> = ({
  mode = 'manage',
  onBrandSelect,
  selectedBrandIds = [],
  showActions = true,
  height = 600,
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(selectedBrandIds);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [searchText, setSearchText] = useState('');

  // 加载品牌数据
  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      // Mock品牌数据 - 实际项目中从API获取
      const mockBrands = generateMockBrands();
      setBrands(mockBrands);
    } catch (error) {
      console.error('Load brands error:', error);
      message.error('加载品牌数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 生成Mock品牌数据
  const generateMockBrands = (): Brand[] => {
    return [
      {
        id: 'brand_001',
        name: '可口可乐',
        code: 'COKE',
        status: 'active',
        logo: '/images/brands/coke-logo.png',
        description: '全球知名的饮料品牌，生产可乐、雪碧、芬达等经典饮料',
        website: 'https://www.coca-cola.com',
        contactPerson: '张经理',
        contactPhone: '13800138001',
        contactEmail: 'coke@example.com',
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'brand_002',
        name: '百事可乐',
        code: 'PEPSI',
        status: 'active',
        logo: '/images/brands/pepsi-logo.png',
        description: '世界著名的饮料公司，旗下有百事可乐、七喜、美年达等品牌',
        website: 'https://www.pepsico.com',
        contactPerson: '李经理',
        contactPhone: '13800138002',
        contactEmail: 'pepsi@example.com',
        sortOrder: 2,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      {
        id: 'brand_003',
        name: '农夫山泉',
        code: 'NONGFU',
        status: 'active',
        logo: '/images/brands/nongfu-logo.png',
        description: '中国领先的饮用水和饮料生产企业',
        website: 'https://www.nongfuspring.com',
        contactPerson: '王经理',
        contactPhone: '13800138003',
        contactEmail: 'nongfu@example.com',
        sortOrder: 3,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      },
      {
        id: 'brand_004',
        name: '康师傅',
        code: 'KSF',
        status: 'active',
        logo: '/images/brands/ksf-logo.png',
        description: '知名的食品饮料品牌，以方便面和饮料闻名',
        website: 'https://www.masterkong.com.cn',
        contactPerson: '赵经理',
        contactPhone: '13800138004',
        contactEmail: 'ksf@example.com',
        sortOrder: 4,
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-04T00:00:00Z',
      },
      {
        id: 'brand_005',
        name: '统一',
        code: 'UNI',
        status: 'active',
        logo: '/images/brands/uni-logo.png',
        description: '台湾知名的食品企业，产品涵盖饮料、零食等',
        website: 'https://www.uni-president.com',
        contactPerson: '刘经理',
        contactPhone: '13800138005',
        contactEmail: 'uni@example.com',
        sortOrder: 5,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z',
      },
      {
        id: 'brand_006',
        name: '旺旺',
        code: 'WW',
        status: 'active',
        logo: '/images/brands/wangwang-logo.png',
        description: '台湾知名的休闲食品品牌',
        website: 'https://www.want-want.com',
        contactPerson: '陈经理',
        contactPhone: '13800138006',
        contactEmail: 'wangwang@example.com',
        sortOrder: 6,
        createdAt: '2024-01-06T00:00:00Z',
        updatedAt: '2024-01-06T00:00:00Z',
      },
      {
        id: 'brand_007',
        name: '奥利奥',
        code: 'OREO',
        status: 'inactive',
        logo: '/images/brands/oreo-logo.png',
        description: '亿滋国际旗下的经典饼干品牌',
        website: 'https://www.oreo.com',
        contactPerson: '周经理',
        contactPhone: '13800138007',
        contactEmail: 'oreo@example.com',
        sortOrder: 7,
        createdAt: '2024-01-07T00:00:00Z',
        updatedAt: '2024-01-07T00:00:00Z',
      },
      {
        id: 'brand_008',
        name: '乐事',
        code: 'LAYS',
        status: 'active',
        logo: '/images/brands/lays-logo.png',
        description: '百事公司旗下的薯片品牌',
        website: 'https://www.lays.com',
        contactPerson: '吴经理',
        contactPhone: '13800138008',
        contactEmail: 'lays@example.com',
        sortOrder: 8,
        createdAt: '2024-01-08T00:00:00Z',
        updatedAt: '2024-01-08T00:00:00Z',
      },
    ];
  };

  // 初始化
  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // 过滤品牌数据
  const filteredBrands = brands.filter((brand) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      brand.name.toLowerCase().includes(searchLower) ||
      brand.code.toLowerCase().includes(searchLower) ||
      brand.description?.toLowerCase().includes(searchLower)
    );
  });

  // 处理添加品牌
  const handleAdd = () => {
    setEditingBrand(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  // 处理编辑品牌
  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    form.setFieldsValue({
      name: brand.name,
      code: brand.code,
      status: brand.status === 'active',
      description: brand.description,
      website: brand.website,
      contactPerson: brand.contactPerson,
      contactPhone: brand.contactPhone,
      contactEmail: brand.contactEmail,
      sortOrder: brand.sortOrder,
    });

    if (brand.logo) {
      setFileList([
        {
          uid: '-1',
          name: brand.logo,
          status: 'done',
          url: brand.logo,
        },
      ]);
    } else {
      setFileList([]);
    }

    setModalVisible(true);
  };

  // 处理删除品牌
  const handleDelete = async (brandId: string) => {
    try {
      // Mock删除操作
      message.success('品牌删除成功');
      SPUNotificationService.success('删除', '品牌');
      loadBrands();
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  // 处理保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // 构建品牌数据
      const brandData: Brand = {
        id: editingBrand?.id || `brand_${Date.now()}`,
        name: values.name,
        code: values.code,
        status: values.status ? 'active' : 'inactive',
        logo: fileList.length > 0 && fileList[0].status === 'done' ? fileList[0].url : undefined,
        description: values.description,
        website: values.website,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        sortOrder: values.sortOrder || 0,
        createdAt: editingBrand?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingBrand) {
        message.success('品牌更新成功');
        SPUNotificationService.success('更新', '品牌');
      } else {
        message.success('品牌添加成功');
        SPUNotificationService.success('添加', '品牌');
      }

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      loadBrands();
    } catch (error) {
      console.error('Save brand error:', error);
    }
  };

  // 处理选择品牌
  const handleSelect = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    accept: 'image/*',
    listType: 'picture-card',
    fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过2MB');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: ({ fileList }) => {
      setFileList(fileList);
    },
  };

  // 表格列配置
  const columns: ColumnsType<Brand> = [
    {
      title: '品牌信息',
      key: 'brand',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={48}
            src={record.logo}
            icon={<ShopOutlined />}
            style={{ backgroundColor: '#f0f0f0' }}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <Tag color="blue" style={{ fontSize: '11px' }}>
                {record.code}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '联系人',
      key: 'contact',
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: '13px' }}>
          {record.contactPerson ? (
            <>
              <div>{record.contactPerson}</div>
              <div style={{ color: '#666' }}>{record.contactPhone || '-'}</div>
            </>
          ) : (
            '-'
          )}
        </div>
      ),
    },
    {
      title: '官网',
      dataIndex: 'website',
      key: 'website',
      width: 150,
      render: (website: string) =>
        website ? (
          <a href={website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px' }}>
            {website.replace('https://', '').replace('http://', '')}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 60,
      align: 'center',
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {mode === 'select' ? (
            <Button
              type="text"
              size="small"
              icon={<StarOutlined />}
              onClick={() => onBrandSelect?.(record)}
            />
          ) : (
            <>
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
              <Popconfirm
                title="确认删除"
                description={`确定要删除品牌"${record.name}"吗？`}
                onConfirm={() => handleDelete(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="text" size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 操作栏 */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            <ShopOutlined /> 品牌管理
          </Title>
          <Text type="secondary">
            共 {brands.length} 个品牌，{brands.filter((b) => b.status === 'active').length} 个启用
          </Text>
        </div>

        <Space>
          <Input
            placeholder="搜索品牌名称或编码"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={loadBrands}>
            刷新
          </Button>
          {mode === 'manage' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加品牌
            </Button>
          )}
        </Space>
      </div>

      {/* 品牌列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredBrands}
          rowKey="id"
          loading={loading}
          scroll={{ y: height }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
            defaultPageSize: 10,
          }}
          rowSelection={
            mode === 'select'
              ? {
                  selectedRowKeys,
                  onChange: handleSelect,
                  type: 'checkbox',
                }
              : undefined
          }
        />
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title={editingBrand ? '编辑品牌' : '添加品牌'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        onOk={handleSave}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: true,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="品牌名称"
                rules={[
                  { required: true, message: '请输入品牌名称' },
                  { max: 50, message: '名称不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入品牌名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="品牌编码"
                rules={[
                  { required: true, message: '请输入品牌编码' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: '编码只能包含字母、数字和下划线' },
                ]}
              >
                <Input placeholder="请输入品牌编码" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="状态" valuePropName="checked">
                <Switch checkedChildren="启用" unCheckedChildren="停用" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sortOrder"
                label="排序"
                rules={[{ type: 'number', message: '请输入有效的数字' }]}
              >
                <Input type="number" placeholder="排序数字，越小越靠前" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="品牌Logo">
            <Upload {...uploadProps}>
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传Logo</div>
                </div>
              )}
            </Upload>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              建议尺寸 200x80px，支持 jpg、png 格式，大小不超过 2MB
            </Text>
          </Form.Item>

          <Form.Item name="description" label="品牌描述">
            <TextArea rows={3} placeholder="请输入品牌描述" showCount maxLength={200} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="website"
                label="官方网站"
                rules={[{ type: 'url', message: '请输入有效的网址' }]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactEmail"
                label="联系邮箱"
                rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
              >
                <Input placeholder="contact@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactPerson" label="联系人">
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPhone" label="联系电话">
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandManager;
