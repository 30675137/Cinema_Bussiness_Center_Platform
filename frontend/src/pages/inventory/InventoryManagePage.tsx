import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Button, Space, message, BackTop } from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SyncOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import InventoryList from '@/components/inventory/InventoryList';
import InventoryForm from '@/components/inventory/InventoryForm';
import InventoryDetail from '@/components/inventory/InventoryDetail';
import { InventoryItem } from '@/types/inventory';
import { useInventoryStore } from '@/stores/inventoryStore';

const { Content } = Layout;
const { Title } = Typography;

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const InventoryManagePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingRecord, setEditingRecord] = useState<InventoryItem | null>(null);

  const { loading, fetchInventoryItems, syncWithProcurement } = useInventoryStore();

  // 根据路由参数确定视图模式
  useEffect(() => {
    if (id) {
      if (id === 'create') {
        setViewMode('create');
        setEditingRecord(null);
      } else if (id === 'edit' && editingRecord) {
        setViewMode('edit');
      } else {
        setViewMode('detail');
      }
    } else {
      setViewMode('list');
    }
  }, [id, editingRecord]);

  // 处理返回列表
  const handleBackToList = () => {
    navigate('/inventory');
    setEditingRecord(null);
  };

  // 处理新建
  const handleCreate = () => {
    navigate('/inventory/create');
  };

  // 处理编辑
  const handleEdit = (record: InventoryItem) => {
    setEditingRecord(record);
    navigate(`/inventory/edit`);
  };

  // 处理查看详情
  const handleViewDetail = (record: InventoryItem) => {
    navigate(`/inventory/${record.id}`);
  };

  // 处理表单成功
  const handleFormSuccess = () => {
    message.success('操作成功');
    handleBackToList();
  };

  // 处理同步数据
  const handleSyncData = async () => {
    try {
      await syncWithProcurement();
      message.success('数据同步成功');
      if (viewMode === 'list') {
        fetchInventoryItems();
      }
    } catch (error) {
      message.error('数据同步失败');
    }
  };

  // 渲染页面标题
  const renderPageTitle = () => {
    const titles = {
      list: { title: '库存管理', subtitle: '管理商品库存、预警和调拨' },
      create: { title: '新建库存项', subtitle: '添加新的商品库存记录' },
      edit: { title: '编辑库存项', subtitle: '修改商品库存信息' },
      detail: { title: '库存详情', subtitle: '查看商品库存详细信息和操作记录' },
    };

    const currentTitle = titles[viewMode];

    return (
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ marginBottom: 8 }}>
          {viewMode !== 'list' && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToList}
            >
              返回列表
            </Button>
          )}
          <Title level={2} style={{ margin: 0 }}>
            {currentTitle.title}
          </Title>
        </Space>
        <div style={{ color: '#666', fontSize: '14px', marginLeft: viewMode !== 'list' ? 108 : 0 }}>
          {currentTitle.subtitle}
        </div>
      </div>
    );
  };

  // 渲染操作按钮
  const renderPageActions = () => {
    if (viewMode !== 'list') return null;

    return (
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          新建库存项
        </Button>
        <Button
          icon={<SyncOutlined />}
          onClick={handleSyncData}
          loading={loading}
        >
          同步数据
        </Button>
        <Button
          icon={<BarChartOutlined />}
          onClick={() => navigate('/inventory/analytics')}
        >
          数据分析
        </Button>
        <Button
          icon={<SettingOutlined />}
          onClick={() => navigate('/inventory/settings')}
        >
          库存设置
        </Button>
      </Space>
    );
  };

  // 渲染主要内容
  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <InventoryList
            onEdit={handleEdit}
            onView={handleViewDetail}
          />
        );

      case 'create':
      case 'edit':
        return (
          <InventoryForm
            visible={true}
            onCancel={handleBackToList}
            onSuccess={handleFormSuccess}
            editingRecord={editingRecord}
          />
        );

      case 'detail':
        return (
          <InventoryDetail
            inventoryId={id!}
            onEdit={handleEdit}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        {renderPageTitle()}
        {renderPageActions()}

        <Card
          bordered={false}
          style={{
            borderRadius: '8px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
          }}
          bodyStyle={{ padding: viewMode === 'detail' ? 0 : '24px' }}
        >
          {renderContent()}
        </Card>

        {/* 回到顶部按钮 */}
        <BackTop />
      </Content>
    </Layout>
  );
};

export default InventoryManagePage;