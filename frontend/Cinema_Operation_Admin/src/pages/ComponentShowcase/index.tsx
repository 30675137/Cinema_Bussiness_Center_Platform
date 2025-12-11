import { useState } from 'react';
import { Card, Typography, Space, Button, Form, message, Tag } from 'antd';
import {
  SettingOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { DataTable, FormField, Card as UICard, StatCard } from '../../components/ui';
import { FormFieldType } from '../../components/ui/FormField/types';
import { CardSize, CardVariant } from '../../components/ui/Card/types';

const { Title, Paragraph, Text } = Typography;

/**
 * 组件库示例页面
 */
function ComponentShowcase() {
  const [formData, setFormData] = useState({});

  // 模拟表格数据
  const tableData = [
    {
      id: 1,
      name: '可乐',
      category: '饮料',
      price: 8.00,
      stock: 100,
      status: 'active',
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      name: '爆米花',
      category: '零食',
      price: 15.00,
      stock: 50,
      status: 'active',
      createdAt: '2024-01-14',
    },
    {
      id: 3,
      name: '电影票',
      category: '票务',
      price: 45.00,
      stock: 200,
      status: 'inactive',
      createdAt: '2024-01-13',
    },
  ];

  // 表格列配置
  const tableColumns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      sortable: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      filterable: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      sortable: true,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      align: 'right' as const,
      sortable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <Tag color={value === 'active' ? 'green' : 'red'}>
          {value === 'active' ? '已发布' : '已下架'}
        </Tag>
      ),
    },
  ];

  // 表格操作配置
  const tableActions = {
    actions: [
      {
        label: '编辑',
        icon: <EditOutlined />,
        onClick: (record: any) => message.info(`编辑商品: ${record.name}`),
      },
      {
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: (record: any) => message.warning(`删除商品: ${record.name}`),
      },
    ],
  };

  // 表单字段配置
  const formFields = [
    {
      name: 'name',
      label: '商品名称',
      type: FormFieldType.INPUT,
      required: true,
      placeholder: '请输入商品名称',
      rules: [{ required: true, message: '商品名称是必填项' }],
    },
    {
      name: 'category',
      label: '商品分类',
      type: FormFieldType.SELECT,
      required: true,
      placeholder: '请选择商品分类',
      options: [
        { label: '饮料', value: 'drink' },
        { label: '零食', value: 'snack' },
        { label: '票务', value: 'ticket' },
        { label: '周边', value: 'merchandise' },
      ],
    },
    {
      name: 'price',
      label: '商品价格',
      type: FormFieldType.NUMBER,
      required: true,
      placeholder: '请输入商品价格',
      rules: [
        { required: true, message: '商品价格是必填项' },
        { type: 'number', min: 0, message: '价格不能小于0' },
      ],
    },
    {
      name: 'description',
      label: '商品描述',
      type: FormFieldType.TEXTAREA,
      placeholder: '请输入商品描述',
      description: '选填，详细描述商品特点和优势',
    },
    {
      name: 'isRecommended',
      label: '推荐商品',
      type: FormFieldType.SWITCH,
      defaultValue: false,
    },
  ];

  // 统计卡片数据
  const statData = [
    {
      title: '总商品数',
      value: 128,
      subtitle: '较上月增长',
      trend: { value: 12, isUp: true },
      icon: <ShoppingOutlined style={{ fontSize: 32, color: '#3b82f6' }} />,
      color: '#3b82f6',
    },
    {
      title: '今日销售额',
      value: 15860,
      subtitle: '较昨日增长',
      trend: { value: 8.5, isUp: true },
      icon: <DollarOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      color: '#52c41a',
      formatValue: (value: number) => `¥${value.toLocaleString()}`,
    },
    {
      title: '待处理订单',
      value: 23,
      subtitle: '较昨日减少',
      trend: { value: 5, isUp: false },
      icon: <UserOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      color: '#faad14',
    },
  ];

  return (
    <div className="component-showcase p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <Title level={2}>组件库展示</Title>
          <Paragraph type="secondary">
            展示影院商品管理中台的标准化UI组件库
          </Paragraph>
        </div>

        {/* 统计卡片展示 */}
        <div className="mb-8">
          <Title level={3}>统计卡片组件</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statData.map((data, index) => (
              <StatCard
                key={index}
                data={data}
                size={CardSize.MEDIUM}
                variant={CardVariant.SHADOW}
              />
            ))}
          </div>
        </div>

        {/* 数据表格展示 */}
        <div className="mb-8">
          <Title level={3}>数据表格组件</Title>
          <Card className="mb-4">
            <DataTable
              columns={tableColumns}
              dataSource={tableData}
              title="商品列表"
              description="展示所有影院商品的详细信息"
              pagination={{
                current: 1,
                pageSize: 10,
                total: tableData.length,
                showQuickJumper: true,
                showTotal: true,
              }}
              selection={{
                enabled: true,
                type: 'checkbox',
              }}
              actions={tableActions}
              striped
              headerExtra={
                <Button type="primary" icon={<PlusOutlined />}>
                  添加商品
                </Button>
              }
            />
          </Card>
        </div>

        {/* 表单组件展示 */}
        <div className="mb-8">
          <Title level={3}>表单字段组件</Title>
          <Card title="商品信息录入" className="mb-4">
            <Form layout="vertical">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formFields.map((field) => (
                  <FormField
                    key={field.name}
                    config={field}
                    value={(formData as Record<string, any>)[field.name]}
                    onChange={(value: any, name: string) => {
                      setFormData((prev: Record<string, any>) => ({ ...prev, [name]: value }));
                    }}
                  />
                ))}
              </div>
              <div className="mt-6">
                <Space>
                  <Button type="primary" onClick={() => message.success('表单提交成功')}>
                    保存商品
                  </Button>
                  <Button>取消</Button>
                </Space>
              </div>
            </Form>
          </Card>
        </div>

        {/* 卡片组件展示 */}
        <div className="mb-8">
          <Title level={3}>通用卡片组件</Title>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UICard
              title="默认卡片"
              subtitle="这是一个默认样式的卡片"
              size={CardSize.MEDIUM}
              variant={CardVariant.DEFAULT}
              actions={[
                {
                  key: 'setting',
                  label: '设置',
                  icon: <SettingOutlined />,
                  onClick: () => message.info('设置点击'),
                },
              ]}
            >
              <Text>这是卡片的内容区域，可以放置任何内容。</Text>
            </UICard>

            <UICard
              title="带边框卡片"
              subtitle="这是一个带边框的卡片"
              size={CardSize.MEDIUM}
              variant={CardVariant.OUTLINED}
              hoverable
            >
              <Text>鼠标悬浮时会有交互效果。</Text>
            </UICard>

            <UICard
              title="阴影卡片"
              subtitle="这是一个带阴影的卡片"
              size={CardSize.MEDIUM}
              variant={CardVariant.SHADOW}
              loading={false}
            >
              <Text>具有阴影效果，看起来更有层次感。</Text>
            </UICard>
          </div>
        </div>

        {/* 组件特性说明 */}
        <div>
          <Title level={3}>组件特性</Title>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Title level={5}>✨ 统一设计</Title>
                <Text type="secondary">
                  所有组件遵循统一的设计规范，确保视觉一致性
                </Text>
              </div>
              <div>
                <Title level={5}>📱 响应式布局</Title>
                <Text type="secondary">
                  组件支持响应式设计，适配不同屏幕尺寸
                </Text>
              </div>
              <div>
                <Title level={5}>🎨 主题定制</Title>
                <Text type="secondary">
                  支持主题颜色定制，满足不同业务场景需求
                </Text>
              </div>
              <div>
                <Title level={5}>🔧 高度可配置</Title>
                <Text type="secondary">
                  提供丰富的配置选项，满足各种使用场景
                </Text>
              </div>
              <div>
                <Title level={5}>♿ 无障碍支持</Title>
                <Text type="secondary">
                  遵循无障碍设计规范，提升用户体验
                </Text>
              </div>
              <div>
                <Title level={5}>🚀 性能优化</Title>
                <Text type="secondary">
                  组件经过性能优化，确保流畅的用户体验
                </Text>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ComponentShowcase;