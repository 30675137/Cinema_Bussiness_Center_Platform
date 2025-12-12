import React from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, Tabs, Timeline } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * 审核管理页面
 * 显示和管理待审核的项目
 */
const ReviewList: React.FC = () => {
  // 模拟数据
  const pendingData = [
    {
      key: '1',
      id: 'REVIEW001',
      type: '商品审核',
      title: '新商品上架申请',
      applicant: '张三',
      applicantDept: '商品部',
      submitTime: '2025-12-10 09:30',
      priority: '高',
      status: 'pending',
      content: '爆米花套餐新商品申请上架，包含多种口味选择',
    },
    {
      key: '2',
      id: 'REVIEW002',
      type: '价格审核',
      title: '节假日价格调整',
      applicant: '李四',
      applicantDept: '市场部',
      submitTime: '2025-12-10 10:15',
      priority: '中',
      status: 'pending',
      content: '春节期间部分商品价格调整申请',
    },
    {
      key: '3',
      id: 'REVIEW003',
      type: '促销审核',
      title: '套餐促销活动',
      applicant: '王五',
      applicantDept: '运营部',
      submitTime: '2025-12-10 11:00',
      priority: '低',
      status: 'pending',
      content: '周末套餐组合促销活动申请',
    }
  ];

  const completedData = [
    {
      key: '4',
      id: 'REVIEW004',
      type: '商品审核',
      title: '3D眼镜新品上架',
      applicant: '赵六',
      applicantDept: '商品部',
      submitTime: '2025-12-09 14:20',
      reviewTime: '2025-12-09 16:30',
      reviewer: '管理员',
      priority: '中',
      status: 'approved',
      content: '3D眼镜新品申请已通过审核',
    },
    {
      key: '5',
      id: 'REVIEW005',
      type: '库存审核',
      title: '库存盘点报告',
      applicant: '钱七',
      applicantDept: '仓储部',
      submitTime: '2025-12-09 15:00',
      reviewTime: '2025-12-09 17:00',
      reviewer: '管理员',
      priority: '高',
      status: 'rejected',
      content: '库存盘点报告数据不完整，已驳回',
    }
  ];

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      '高': 'red',
      '中': 'orange',
      '低': 'green',
    };
    return colorMap[priority] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'approved': <CheckOutlined style={{ color: '#52c41a' }} />,
      'rejected': <CloseOutlined style={{ color: '#f5222d' }} />,
      'pending': <ClockCircleOutlined style={{ color: '#faad14' }} />,
    };
    return iconMap[status] || <ClockCircleOutlined />;
  };

  const columns = [
    {
      title: '审核编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '审核类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
    },
    {
      title: '部门',
      dataIndex: 'applicantDept',
      key: 'applicantDept',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>{priority}</Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: any) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} size="small">
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" style={{ color: '#52c41a' }}>
                通过
              </Button>
              <Button type="link" size="small" style={{ color: '#f5222d' }}>
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const completedColumns = [
    ...columns.slice(0, -1),
    {
      title: '审核人',
      dataIndex: 'reviewer',
      key: 'reviewer',
    },
    {
      title: '审核时间',
      dataIndex: 'reviewTime',
      key: 'reviewTime',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Space>
          {getStatusIcon(status)}
          <Tag color={status === 'approved' ? 'green' : 'red'}>
            {status === 'approved' ? '已通过' : '已驳回'}
          </Tag>
        </Space>
      ),
    },
    columns[columns.length - 1], // 操作列
  ];

  // 审核统计
  const reviewStats = {
    pending: pendingData.length,
    approved: completedData.filter(item => item.status === 'approved').length,
    rejected: completedData.filter(item => item.status === 'rejected').length,
    today: completedData.filter(item =>
      item.reviewTime && item.reviewTime.startsWith('2025-12-10')
    ).length,
  };

  const renderTimeline = (record: any) => {
    const items = [
      {
        key: 'submit',
        dot: <ClockCircleOutlined style={{ color: '#faad14' }} />,
        children: (
          <div>
            <div>{record.applicant} 提交申请</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.submitTime}</div>
          </div>
        ),
      },
    ];

    if (record.reviewTime) {
      items.push({
        key: 'review',
        dot: record.status === 'approved'
          ? <CheckOutlined style={{ color: '#52c41a' }} />
          : <CloseOutlined style={{ color: '#f5222d' }} />,
        children: (
          <div>
            <div>{record.reviewer} {record.status === 'approved' ? '通过' : '驳回'}审核</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.reviewTime}</div>
          </div>
        ),
      });
    }

    return <Timeline items={items} />;
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 审核统计卡片 */}
      <div style={{ marginBottom: '24px' }}>
        <Card title="审核概览">
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                {reviewStats.pending}
              </div>
              <div style={{ color: '#666' }}>待审核</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {reviewStats.approved}
              </div>
              <div style={{ color: '#666' }}>已通过</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                {reviewStats.rejected}
              </div>
              <div style={{ color: '#666' }}>已驳回</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {reviewStats.today}
              </div>
              <div style={{ color: '#666' }}>今日审核</div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="审核管理">
        <Tabs defaultActiveKey="pending">
          <TabPane tab={`待审核 (${pendingData.length})`} key="pending">
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: '16px' }}>
              <Space size="middle">
                <Search
                  placeholder="搜索标题或申请人"
                  allowClear
                  style={{ width: 200 }}
                  prefix={<SearchOutlined />}
                />
                <Select placeholder="审核类型" style={{ width: 120 }} allowClear>
                  <Option value="商品审核">商品审核</Option>
                  <Option value="价格审核">价格审核</Option>
                  <Option value="库存审核">库存审核</Option>
                  <Option value="促销审核">促销审核</Option>
                </Select>
                <Select placeholder="优先级" style={{ width: 120 }} allowClear>
                  <Option value="高">高</Option>
                  <Option value="中">中</Option>
                  <Option value="低">低</Option>
                </Select>
                <Select placeholder="申请部门" style={{ width: 120 }} allowClear>
                  <Option value="商品部">商品部</Option>
                  <Option value="市场部">市场部</Option>
                  <Option value="运营部">运营部</Option>
                  <Option value="仓储部">仓储部</Option>
                </Select>
              </Space>
            </div>

            {/* 待审核列表 */}
            <Table
              columns={columns}
              dataSource={pendingData}
              pagination={{
                total: pendingData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
              expandedRowRender={renderTimeline}
            />
          </TabPane>

          <TabPane tab={`已完成 (${completedData.length})`} key="completed">
            {/* 搜索和筛选 */}
            <div style={{ marginBottom: '16px' }}>
              <Space size="middle">
                <Search
                  placeholder="搜索标题或申请人"
                  allowClear
                  style={{ width: 200 }}
                  prefix={<SearchOutlined />}
                />
                <Select placeholder="审核结果" style={{ width: 120 }} allowClear>
                  <Option value="approved">已通过</Option>
                  <Option value="rejected">已驳回</Option>
                </Select>
                <Select placeholder="审核时间" style={{ width: 120 }} allowClear>
                  <Option value="today">今天</Option>
                  <Option value="week">本周</Option>
                  <Option value="month">本月</Option>
                </Select>
              </Space>
            </div>

            {/* 已完成列表 */}
            <Table
              columns={completedColumns}
              dataSource={completedData}
              pagination={{
                total: completedData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
              expandedRowRender={renderTimeline}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReviewList;