/**
 * 采购订单管理页面 - 集成表单和详情
 */
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Space, message } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import PurchaseOrderForm from '@/components/purchase/PurchaseOrderForm';
import PurchaseOrderDetail from '@/components/purchase/PurchaseOrderDetail';
import PurchaseOrderList from '@/components/purchase/PurchaseOrderList';
import SimplePurchaseOrderPage from './SimplePurchaseOrderPage';
import { PurchaseOrder, PurchaseOrderFormData } from '@/types/purchase';
import { usePurchaseOrderStore } from '@/stores/purchaseOrderStore';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const PurchaseOrderManagePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams<{ orderId: string }>();

  // 根据URL参数和状态确定当前视图模式
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (location.pathname.includes('/create')) return 'create';
    if (orderId && location.pathname.includes('/edit')) return 'edit';
    if (orderId && !location.pathname.includes('/edit')) return 'detail';
    return 'list';
  });

  const [currentOrder, setCurrentOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);

  // 处理视图切换
  const handleViewChange = (mode: ViewMode, order?: PurchaseOrder) => {
    setViewMode(mode);
    if (order) {
      setCurrentOrder(order);
    }

    // 更新URL
    switch (mode) {
      case 'list':
        navigate('/procurement/purchase-order');
        break;
      case 'create':
        navigate('/procurement/purchase-order/create');
        break;
      case 'edit':
        if (order) {
          navigate(`/procurement/purchase-order/${order.id}/edit`);
        }
        break;
      case 'detail':
        if (order) {
          navigate(`/procurement/purchase-order/${order.id}`);
        }
        break;
    }
  };

  // 处理返回列表
  const handleBackToList = () => {
    handleViewChange('list');
  };

  // 处理创建订单
  const handleCreateOrder = () => {
    handleViewChange('create');
  };

  // 处理编辑订单
  const handleEditOrder = (order: PurchaseOrder) => {
    handleViewChange('edit', order);
  };

  // 处理查看订单详情
  const handleViewOrder = (order: PurchaseOrder) => {
    handleViewChange('detail', order);
  };

  // 处理表单提交
  const handleFormSubmit = async (data: PurchaseOrderFormData) => {
    setLoading(true);
    try {
      if (viewMode === 'create') {
        // 创建订单
        const orderId = await usePurchaseOrderStore.getState().createOrder(data);
        if (orderId) {
          message.success('订单创建成功');
          handleViewChange('list');
        }
      } else if (viewMode === 'edit' && currentOrder) {
        // 更新订单
        const success = await usePurchaseOrderStore.getState().updateOrder(currentOrder.id, data);
        if (success) {
          message.success('订单更新成功');
          handleViewChange('detail', currentOrder);
        }
      }
    } catch (error) {
      console.error('Form submit error:', error);
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染页面头部
  const renderHeader = () => {
    if (viewMode === 'list') {
      return null;
    }

    return (
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackToList}>
            返回列表
          </Button>
          <span style={{ fontSize: '18px', fontWeight: 600 }}>
            {viewMode === 'create' && '新建采购订单'}
            {viewMode === 'edit' && '编辑采购订单'}
            {viewMode === 'detail' && '采购订单详情'}
          </span>
        </Space>

        {viewMode === 'detail' && currentOrder && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateOrder}
          >
            新建订单
          </Button>
        )}
      </div>
    );
  };

  // 渲染主要内容
  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <SimplePurchaseOrderPage />
        );

      case 'create':
        return (
          <PurchaseOrderForm
            mode="create"
            onSubmit={handleFormSubmit}
            onCancel={handleBackToList}
            loading={loading}
          />
        );

      case 'edit':
        return (
          <PurchaseOrderForm
            mode="edit"
            initialData={currentOrder}
            onSubmit={handleFormSubmit}
            onCancel={handleBackToList}
            loading={loading}
          />
        );

      case 'detail':
        return orderId ? (
          <PurchaseOrderDetail
            orderId={orderId}
            onEdit={handleEditOrder}
            onBack={handleBackToList}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};

export default PurchaseOrderManagePage;