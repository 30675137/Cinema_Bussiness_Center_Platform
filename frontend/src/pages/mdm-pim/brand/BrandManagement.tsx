import React from 'react';
import { message, Modal } from 'antd';
import type { Brand } from './types/brand.types';
import { BrandStatus } from './types/brand.types';
import { brandService } from './services/brandService';
import BrandList from './components/organisms/BrandList';

/**
 * @spec B001-fix-brand-creation
 * 品牌管理页面组件
 * 使用 BrandList 组件渲染完整的品牌列表和抽屉管理界面
 */
const BrandManagement: React.FC = () => {
  // 处理品牌状态变更（启用/停用/删除）
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

  return (
    <div className="brand-list-page">
      {/* BrandList 内部管理抽屉状态和渲染 */}
      <BrandList onBrandStatusChange={handleBrandStatusChange} />
    </div>
  );
};

export default BrandManagement;
