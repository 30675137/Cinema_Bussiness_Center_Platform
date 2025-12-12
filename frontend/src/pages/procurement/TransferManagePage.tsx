/**
 * 调拨管理页面
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, Breadcrumb, message, Button } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import TransferList from '@/components/transfer/TransferList';
import TransferDetail from '@/components/transfer/TransferDetail';
import TransferForm from '@/components/transfer/TransferForm';
import { useTransferStore, useTransferSelectors } from '@/stores/transferStore';
import { Transfer, TransferFormData } from '@/types/transfer';

/**
 * 视图模式枚举
 */
type ViewMode = 'list' | 'create' | 'edit' | 'detail';

/**
 * 调拨管理页面组件
 */
const TransferManagePage: React.FC = () => {
  const navigate = useNavigate();
  const { transferId } = useParams();
  const location = useLocation();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const pathname = location.pathname;

    if (pathname.includes('/create')) {
      return 'create';
    } else if (pathname.includes('/edit') && transferId) {
      return 'edit';
    } else if (pathname.includes(`/${transferId}`) && !pathname.includes('/edit')) {
      return 'detail';
    }

    return 'list';
  });

  const {
    loading,
    showForm,
    showDetail,
    formMode,
    formInitialData,
    detailTransferId,
    currentTransfer,
  } = useTransferStore();

  const {
    fetchTransfers,
    fetchTransferById,
    createTransfer,
    updateTransfer,
    showCreateForm,
    showEditForm,
    hideForm,
    showDetail: showDetailAction,
    hideDetail,
  } = useTransferStore();

  // 初始化数据
  useEffect(() => {
    if (viewMode === 'list') {
      fetchTransfers();
    } else if (viewMode === 'detail' && transferId) {
      fetchTransferById(transferId);
    }
  }, [viewMode, transferId]);

  // 处理URL变化
  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.includes('/create')) {
      setViewMode('create');
    } else if (pathname.includes('/edit') && transferId) {
      setViewMode('edit');
    } else if (pathname.includes(`/${transferId}`) && !pathname.includes('/edit')) {
      setViewMode('detail');
    } else {
      setViewMode('list');
    }
  }, [location.pathname, transferId]);

  // 导航到列表页
  const navigateToList = () => {
    navigate('/procurement/transfer');
  };

  // 导航到详情页
  const navigateToDetail = (id: string) => {
    navigate(`/procurement/transfer/${id}`);
  };

  // 导航到编辑页
  const navigateToEdit = (id: string) => {
    navigate(`/procurement/transfer/${id}/edit`);
  };

  // 导航到创建页
  const navigateToCreate = () => {
    navigate('/procurement/transfer/create');
  };

  // 处理查看详情
  const handleView = (transfer: Transfer) => {
    navigateToDetail(transfer.id);
  };

  // 处理编辑
  const handleEdit = (transfer: Transfer) => {
    navigateToEdit(transfer.id);
  };

  // 处理创建
  const handleCreate = () => {
    navigateToCreate();
  };

  // 处理返回
  const handleBack = () => {
    navigateToList();
  };

  // 处理表单提交
  const handleFormSubmit = async (data: TransferFormData) => {
    try {
      if (formMode === 'create') {
        const id = await createTransfer(data);
        message.success('调拨单创建成功');
        navigateToDetail(id);
      } else if (formMode === 'edit' && transferId) {
        await updateTransfer(transferId, data);
        message.success('调拨单更新成功');
        navigateToDetail(transferId);
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  // 处理表单取消
  const handleFormCancel = () => {
    if (viewMode === 'create') {
      navigateToList();
    } else if (viewMode === 'edit') {
      navigateToDetail(transferId!);
    } else {
      hideForm();
    }
  };

  // 处理详情页编辑
  const handleDetailEdit = (transfer: Transfer) => {
    navigateToEdit(transfer.id);
  };

  // 处理详情页返回
  const handleDetailBack = () => {
    navigateToList();
  };

  // 渲染面包屑
  const renderBreadcrumb = () => {
    const items = [
      {
        title: (
          <span>
            <HomeOutlined />
            <span className="ml-1">首页</span>
          </span>
        ),
        href: '/',
      },
      {
        title: '采购管理',
        href: '/procurement',
      },
      {
        title: '调拨管理',
        href: '/procurement/transfer',
      },
    ];

    if (viewMode === 'create') {
      items.push({ title: '新建调拨' });
    } else if (viewMode === 'edit') {
      items.push({ title: '编辑调拨' });
    } else if (viewMode === 'detail' && currentTransfer) {
      items.push({ title: currentTransfer.transferNumber });
    } else if (viewMode === 'list') {
      items.push({ title: '调拨列表' });
    }

    return <Breadcrumb items={items} />;
  };

  // 渲染头部
  const renderHeader = () => {
    if (viewMode === 'list') {
      return null;
    }

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="mr-4"
          >
            返回
          </Button>
          {renderBreadcrumb()}
        </div>
      </div>
    );
  };

  // 渲染内容
  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <div>
            <div className="mb-4">
              <Breadcrumb>
                <Breadcrumb.Item>
                  <HomeOutlined />
                  <span className="ml-1">首页</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item href="/procurement">
                  采购管理
                </Breadcrumb.Item>
                <Breadcrumb.Item>调拨管理</Breadcrumb.Item>
                <Breadcrumb.Item>调拨列表</Breadcrumb.Item>
              </Breadcrumb>
            </div>

            <TransferList
              onView={handleView}
              onEdit={handleEdit}
              onCreate={handleCreate}
            />
          </div>
        );

      case 'create':
        return (
          <div>
            {renderHeader()}
            <TransferForm
              mode="create"
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              loading={loading}
            />
          </div>
        );

      case 'edit':
        return (
          <div>
            {renderHeader()}
            <TransferForm
              mode="edit"
              initialData={formInitialData}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              loading={loading}
            />
          </div>
        );

      case 'detail':
        return (
          <div>
            {renderHeader()}
            {currentTransfer && (
              <TransferDetail
                transferId={transferId!}
                onEdit={handleDetailEdit}
                onBack={handleDetailBack}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default TransferManagePage;