/**
 * 审核管理页面
 */

import React, { useState, useEffect } from 'react';
import { Tag, Button, Space, Input, Select, Modal, message } from 'antd';
import {
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DataTable from '@/components/common/DataTable';
import { mockApi } from '@/services/mockApi';
import type { ReviewItem } from '@/types/mock';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

/**
 * 审核管理页面组件
 */
const ReviewList: React.FC = () => {
  const [data, setData] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: '',
  });

  /**
   * 加载审核数据
   */
  const loadData = async (params?: any) => {
    setLoading(true);
    try {
      const response = await mockApi.getReviews({
        page: params?.current || pagination.current,
        pageSize: params?.pageSize || pagination.pageSize,
        type: params?.type || filters.type,
        status: params?.status || filters.status,
      });

      if (response.code === 200) {
        setData(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.length,
          current: params?.current || prev.current,
          pageSize: params?.pageSize || prev.pageSize,
        }));
      } else {
        message.error('加载审核数据失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
      console.error('加载审核数据错误:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 初始化加载数据
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * 搜索处理
   */
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    loadData({ ...pagination, search: value });
  };

  /**
   * 筛选处理
   */
  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    loadData({ ...pagination, [key]: value });
  };

  /**
   * 分页处理
   */
  const handleTableChange = (pageInfo: any) => {
    loadData({ ...filters, ...pageInfo });
  };

  /**
   * 刷新处理
   */
  const handleRefresh = () => {
    loadData();
  };

  /**
   * 导出处理
   */
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  /**
   * 查看详情
   */
  const handleView = (record: ReviewItem) => {
    Modal.info({
      title: '审核详情',
      width: 600,
      content: (
        <div style={{ marginTop: 16 }}>
          <p><strong>审核类型：</strong>{renderReviewType(record.type)}</p>
          <p><strong>审核标题：</strong>{record.title}</p>
          <p><strong>目标ID：</strong>{record.targetId}</p>
          <p><strong>申请人：</strong>{record.applicant}</p>
          <p><strong>申请时间：</strong>{record.applyTime}</p>
          <p><strong>状态：</strong>{renderStatus(record.status)}</p>
          {record.reviewer && <p><strong>审核人：</strong>{record.reviewer}</p>}
          {record.reviewTime && <p><strong>审核时间：</strong>{record.reviewTime}</p>}
          {record.comment && <p><strong>审核意见：</strong>{record.comment}</p>}
        </div>
      ),
    });
  };

  /**
   * 审核通过
   */
  const handleApprove = (record: ReviewItem) => {
    confirm({
      title: '确认通过',
      content: `确认通过审核申请：${record.title}？`,
      onOk: async () => {
        try {
          const response = await mockApi.approveReview(record.id, '审核通过');
          if (response.code === 200) {
            message.success('审核通过成功');
            loadData();
          } else {
            message.error('审核操作失败');
          }
        } catch (error) {
          message.error('网络错误，请稍后重试');
          console.error('审核通过错误:', error);
        }
      },
    });
  };

  /**
   * 审核驳回
   */
  const handleReject = (record: ReviewItem) => {
    confirm({
      title: '确认驳回',
      content: `确认驳回审核申请：${record.title}？`,
      onOk: async () => {
        try {
          const response = await mockApi.rejectReview(record.id, '审核驳回');
          if (response.code === 200) {
            message.success('审核驳回成功');
            loadData();
          } else {
            message.error('审核操作失败');
          }
        } catch (error) {
          message.error('网络错误，请稍后重试');
          console.error('审核驳回错误:', error);
        }
      },
    });
  };

  /**
   * 审核类型标签渲染
   */
  const renderReviewType = (type: string) => {
    const typeConfig = {
      product: { color: 'blue', text: '商品审核' },
      pricing: { color: 'green', text: '定价审核' },
      inventory: { color: 'purple', text: '库存审核' },
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 状态标签渲染
   */
  const renderStatus = (status: string) => {
    const statusConfig = {
      pending: { color: 'orange', text: '待审核' },
      approved: { color: 'green', text: '已通过' },
      rejected: { color: 'red', text: '已驳回' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 表格列配置
   */
  const columns: ColumnsType<ReviewItem> = [
    {
      title: '审核ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '审核类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: renderReviewType,
    },
    {
      title: '审核标题',
      dataIndex: 'title',
      key: 'title',
      width: 180,
    },
    {
      title: '目标ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 120,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus,
    },
    {
      title: '审核人',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: 100,
      render: (reviewer: string) => reviewer || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                success
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleApprove(record)}
              >
                通过
              </Button>
              <Button
                type="text"
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => handleReject(record)}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  /**
   * 筛选工具栏
   */
  const filterToolbar = (
    <Space style={{ marginBottom: 16 }}>
      <Search
        placeholder="搜索审核标题或申请人"
        allowClear
        style={{ width: 240 }}
        onSearch={handleSearch}
      />
      <Select
        placeholder="审核类型"
        allowClear
        style={{ width: 120 }}
        onChange={(value) => handleFilter('type', value || '')}
      >
        <Option value="product">商品审核</Option>
        <Option value="pricing">定价审核</Option>
        <Option value="inventory">库存审核</Option>
      </Select>
      <Select
        placeholder="审核状态"
        allowClear
        style={{ width: 120 }}
        onChange={(value) => handleFilter('status', value || '')}
      >
        <Option value="pending">待审核</Option>
        <Option value="approved">已通过</Option>
        <Option value="rejected">已驳回</Option>
      </Select>
    </Space>
  );

  return (
    <div className="review-list-page">
      <DataTable
        title="审核管理"
        data={data}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onRefresh={handleRefresh}
        onExport={handleExport}
        extra={filterToolbar}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default ReviewList;