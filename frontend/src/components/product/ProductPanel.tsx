import React, { useState, useEffect } from 'react';
import { Drawer, Button, Space, Tag, Tabs, message } from 'antd';
import {
  CloseOutlined,
  SaveOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Product, ProductStatus } from '../../types/product';
import { usePermissions } from '../../hooks/usePermissions';
import ProductForm from './ProductForm';
import ProductViewMode from './ProductViewMode';

interface ProductPanelProps {
  visible: boolean;
  mode: 'create' | 'edit' | 'view';
  product?: Product | null;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 商品编辑面板组件
 */
const ProductPanel: React.FC<ProductPanelProps> = ({
  visible,
  mode,
  product,
  onSave,
  onCancel
                                                   }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { hasPermission } = usePermissions();

  // 监听产品数据变化
  useEffect(() => {
    if (product) {
      // 根据产品状态决定默认标签页
      if (mode === 'view') {
        setActiveTab('info');
      } else {
        setActiveTab('basic');
      }
    } else {
      setActiveTab('basic');
    }
    setHasUnsavedChanges(false);
  }, [product, mode]);

  // 处理保存
  const handleSave = async (data: any) => {
    try {
      setSubmitting(true);
      await onSave(data);
      setHasUnsavedChanges(false);
      message.success(mode === 'create' ? '商品创建成功' : '商品更新成功');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      // TODO: 添加未保存更改确认对话框
      onCancel();
    } else {
      onCancel();
    }
  };

  // 处理提交审核
  const handleSubmitForReview = async () => {
    if (!product) return;

    try {
      setSubmitting(true);
      // TODO: 实现提交审核逻辑
      message.success('已提交审核');
      onCancel();
    } catch (error) {
      console.error('提交审核失败:', error);
      message.error('提交审核失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 获取状态标签
  const getStatusTag = (status: ProductStatus) => {
    const statusConfig = {
      [ProductStatus.DRAFT]: { color: 'default', icon: <EditOutlined />, text: '草稿' },
      [ProductStatus.PENDING_REVIEW]: { color: 'orange', icon: <ClockCircleOutlined />, text: '待审核' },
      [ProductStatus.PUBLISHED]: { color: 'green', icon: <CheckCircleOutlined />, text: '已发布' },
      [ProductStatus.REJECTED]: { color: 'red', icon: <ExclamationCircleOutlined />, text: '驳回' },
      [ProductStatus.ABNORMAL]: { color: 'purple', icon: <ExclamationCircleOutlined />, text: '异常' }
    };

    const config = statusConfig[status] || statusConfig[ProductStatus.DRAFT];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 获取面板标题
  const getTitle = () => {
    if (mode === 'create') {
      return '新建商品';
    } else if (mode === 'edit') {
      return `编辑商品: ${product?.name}`;
    } else {
      return `商品详情: ${product?.name}`;
    }
  };

  // 获取操作按钮
  const getExtraActions = () => {
    const actions = [];

    if (mode === 'view' && product && hasPermission('product:edit')) {
      actions.push(
        <Button
          key="edit"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            // TODO: 切换到编辑模式
            message.info('切换到编辑模式功能开发中');
          }}
        >
          编辑
        </Button>
      );
    }

    if (mode !== 'view') {
      actions.push(
        <Button
          key="save"
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={() => {
            // 触发表单提交
            const form = document.querySelector('.product-form form');
            if (form) {
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(submitEvent);
            }
          }}
        >
          {mode === 'create' ? '创建商品' : '保存更改'}
        </Button>
      );
    }

    // 草稿状态的商品可以提交审核
    if (product && product.status === ProductStatus.DRAFT && hasPermission('product:submit_review')) {
      actions.push(
        <Button
          key="submit"
          type="default"
          loading={submitting}
          onClick={handleSubmitForReview}
        >
          提交审核
        </Button>
      );
    }

    return actions;
  };

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between">
          <span>{getTitle()}</span>
          {product && getStatusTag(product.status)}
        </div>
      }
      placement="right"
      width={600}
      open={visible}
      onClose={handleCancel}
      extra={
        <Space>
          {getExtraActions()}
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleCancel}
          />
        </Space>
      }
      destroyOnClose={true}
      className="product-panel"
    >
      {mode === 'view' ? (
        // 查看模式
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'info',
              label: '基本信息',
              children: product && <ProductViewMode product={product} />,
            },
            {
              key: 'specs',
              label: '规格属性',
              children: (
                <div className="p-4">
                  {/* TODO: 实现规格属性显示 */}
                  <p>规格属性功能开发中...</p>
                </div>
              ),
            },
            {
              key: 'inventory',
              label: '库存管理',
              children: (
                <div className="p-4">
                  {/* TODO: 实现库存管理显示 */}
                  <p>库存管理功能开发中...</p>
                </div>
              ),
            },
            {
              key: 'history',
              label: '操作记录',
              children: (
                <div className="p-4">
                  {/* TODO: 实现操作记录显示 */}
                  <p>操作记录功能开发中...</p>
                </div>
              ),
            },
          ]}
        />
      ) : (
        // 编辑模式
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-auto">
            {mode === 'create' || mode === 'edit' ? (
              <ProductForm
                product={product}
                mode={mode}
                onSubmit={handleSave}
                onCancel={handleCancel}
                loading={submitting}
              />
            ) : null}
          </div>
        </div>
      )}

      {/* 底部操作栏 */}
      {mode !== 'view' && (
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {/* 提示信息 */}
              {mode === 'create' && '填写商品基本信息，30秒内可完成草稿创建'}
              {mode === 'edit' && '修改商品信息，保存后立即生效'}
            </div>

            <Space>
              <Button onClick={handleCancel}>
                取消
              </Button>

              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={submitting}
                onClick={() => {
                  // 触发表单提交
                  const form = document.querySelector('.product-form form');
                  if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(submitEvent);
                  }
                }}
              >
                {mode === 'create' ? '创建商品' : '保存更改'}
              </Button>
            </Space>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default ProductPanel;