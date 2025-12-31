import React, { useState } from 'react';
import { message, Modal } from 'antd';
import type { Brand } from './types/brand.types';
import { BrandStatus } from './types/brand.types';
import { brandService } from './services/brandService';
import BrandList from './components/organisms/BrandList';
import BrandDrawer from './components/organisms/BrandDrawer';

/**
 * 品牌管理页面组件
 * 整合品牌列表功能和品牌详情抽屉，提供完整的品牌管理页面
 */
const BrandManagement: React.FC = () => {
  // 抽屉状态管理
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentBrand, setCurrentBrand] = useState<Brand | undefined>();

  // 处理品牌查看
  const handleBrandView = (brand: Brand) => {
    setCurrentBrand(brand);
    setDrawerMode('view');
    setDrawerVisible(true);
  };

  // 处理品牌编辑
  const handleBrandEdit = (brand: Brand) => {
    setCurrentBrand(brand);
    setDrawerMode('edit');
    setDrawerVisible(true);
  };

  // 处理新建品牌
  const handleBrandCreate = () => {
    setCurrentBrand(undefined);
    setDrawerMode('create');
    setDrawerVisible(true);
  };

  // 处理品牌状态变更
  const handleBrandStatusChange = async (brand: Brand, newStatus: BrandStatus) => {
    let confirmTitle = '';
    let confirmContent = '';
    let operationText = '';

    switch (newStatus) {
      case 'enabled':
        confirmTitle = '启用品牌';
        confirmContent = `确定要启用品牌"${brand.name}"吗？启用后该品牌将可用于SPU/SKU关联。`;
        operationText = '启用';
        break;
      case 'disabled':
        confirmTitle = '停用品牌';
        confirmContent = `确定要停用品牌"${brand.name}"吗？停用后将影响该品牌下所有SPU/SKU的使用。`;
        operationText = '停用';
        break;
      case 'draft':
        confirmTitle = '删除品牌';
        confirmContent = `确定要删除品牌"${brand.name}"吗？删除后将无法恢复。`;
        operationText = '删除';
        break;
    }

    Modal.confirm({
      title: confirmTitle,
      content: confirmContent,
      okText: `确认${operationText}`,
      cancelText: '取消',
      okType: newStatus === 'disabled' ? 'danger' : 'primary',
      onOk: async () => {
        try {
          await brandService.updateBrandStatus(brand.id, newStatus, '管理员操作');

          message.success(`品牌${operationText}成功`);

          // 刷新列表数据
          window.location.reload();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '操作失败';
          message.error(`品牌${operationText}失败: ${errorMessage}`);
        }
      },
    });
  };

  // 处理抽屉关闭
  const handleDrawerClose = () => {
    setDrawerVisible(false);
    setCurrentBrand(undefined);
  };

  // 处理品牌操作成功
  const handleBrandSuccess = () => {
    message.success('操作成功');
    handleDrawerClose();
    // 刷新列表数据
    window.location.reload();
  };

  return (
    <div className="brand-list-page">
      {/* 品牌列表组件 */}
      <BrandList
        onBrandView={handleBrandView}
        onBrandEdit={handleBrandEdit}
        onBrandCreate={handleBrandCreate}
        onBrandStatusChange={handleBrandStatusChange}
      />

      {/* 品牌详情抽屉 */}
      {drawerVisible && (
        <BrandDrawer
          visible={drawerVisible}
          brand={currentBrand}
          mode={drawerMode}
          onClose={handleDrawerClose}
          onSuccess={handleBrandSuccess}
        />
      )}
    </div>
  );
};

export default BrandManagement;
