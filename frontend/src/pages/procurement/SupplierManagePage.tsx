/**
 * 供应商管理页面 - 集成列表、详情和表单
 */
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Space, message } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import SupplierList from '@/components/supplier/SupplierList';
import SupplierDetail from '@/components/supplier/SupplierDetail';
import SupplierForm from '@/components/supplier/SupplierForm';
import { Supplier, CreateSupplierParams, UpdateSupplierParams } from '@/types/supplier';
import { useSupplierStore } from '@/stores/supplierStore';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

const SupplierManagePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { supplierId } = useParams<{ supplierId: string }>();

  // 根据URL参数和状态确定当前视图模式
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (location.pathname.includes('/create')) return 'create';
    if (supplierId && location.pathname.includes('/edit')) return 'edit';
    if (supplierId && !location.pathname.includes('/edit')) return 'detail';
    return 'list';
  });

  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);

  // 处理视图切换
  const handleViewChange = (mode: ViewMode, supplier?: Supplier) => {
    setViewMode(mode);
    if (supplier) {
      setCurrentSupplier(supplier);
    }

    // 更新URL
    switch (mode) {
      case 'list':
        navigate('/procurement/supplier');
        break;
      case 'create':
        navigate('/procurement/supplier/create');
        break;
      case 'edit':
        if (supplier) {
          navigate(`/procurement/supplier/${supplier.id}/edit`);
        }
        break;
      case 'detail':
        if (supplier) {
          navigate(`/procurement/supplier/${supplier.id}`);
        }
        break;
    }
  };

  // 处理返回列表
  const handleBackToList = () => {
    handleViewChange('list');
  };

  // 处理创建供应商
  const handleCreateSupplier = () => {
    handleViewChange('create');
  };

  // 处理编辑供应商
  const handleEditSupplier = (supplier: Supplier) => {
    handleViewChange('edit', supplier);
  };

  // 处理查看供应商详情
  const handleViewSupplier = (supplier: Supplier) => {
    handleViewChange('detail', supplier);
  };

  // 处理表单提交
  const handleFormSubmit = async (data: CreateSupplierParams | UpdateSupplierParams) => {
    setLoading(true);
    try {
      if (viewMode === 'create') {
        // 创建供应商
        const supplierId = await useSupplierStore.getState().createSupplier(data as CreateSupplierParams);
        if (supplierId) {
          message.success('供应商创建成功');
          handleViewChange('list');
        }
      } else if (viewMode === 'edit' && currentSupplier) {
        // 更新供应商
        const success = await useSupplierStore.getState().updateSupplier(currentSupplier.id, data);
        if (success) {
          message.success('供应商更新成功');
          handleViewChange('detail', currentSupplier);
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
            {viewMode === 'create' && '新建供应商'}
            {viewMode === 'edit' && '编辑供应商'}
            {viewMode === 'detail' && '供应商详情'}
          </span>
        </Space>

        {viewMode === 'detail' && currentSupplier && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateSupplier}
          >
            新建供应商
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
          <SupplierList
            onView={handleViewSupplier}
            onEdit={handleEditSupplier}
            onCreate={handleCreateSupplier}
          />
        );

      case 'create':
        return (
          <SupplierForm
            mode="create"
            onSubmit={handleFormSubmit}
            onCancel={handleBackToList}
            loading={loading}
          />
        );

      case 'edit':
        return (
          <SupplierForm
            mode="edit"
            initialData={currentSupplier}
            onSubmit={handleFormSubmit}
            onCancel={handleBackToList}
            loading={loading}
          />
        );

      case 'detail':
        return supplierId ? (
          <SupplierDetail
            supplierId={supplierId}
            onEdit={handleEditSupplier}
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

export default SupplierManagePage;