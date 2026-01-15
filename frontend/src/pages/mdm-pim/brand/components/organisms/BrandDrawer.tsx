import React, { useEffect, useState } from 'react';
import { Drawer, Button, Space, message, Modal } from 'antd';
import { CloseOutlined, SaveOutlined } from '@ant-design/icons';
import BrandForm from '../molecules/BrandForm';
import BrandLogoUpload from '../molecules/BrandLogoUpload';
import BrandLogo from '../atoms/BrandLogo';
import type {
  BrandDrawerProps,
  Brand,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '../../types/brand.types';
import { BrandStatus, BrandType } from '../../types/brand.types';
import { useBrandActions } from '../../hooks/useBrandActions';
import { validateBrandBusinessRules } from '../../utils/brandValidation';

/**
 * 品牌抽屉有机体组件
 * 用于品牌的创建、编辑和查看
 */
const BrandDrawer: React.FC<BrandDrawerProps> = ({
  visible,
  brand,
  mode = 'create',
  onClose,
  onSuccess,
}) => {
  const [formHasChanges, setFormHasChanges] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  // @spec B001-fix-brand-creation - 存储待上传的 logo 文件（用于创建模式）
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);

  const { createBrand, updateBrand, uploadLogo, isCreating, isUpdating, isUploadingLogo } =
    useBrandActions();

  // 重置表单变更状态
  const resetFormChanges = () => {
    setFormHasChanges(false);
    setPendingLogoFile(null); // 清理待上传的 logo
  };

  // 标记表单已变更
  const markFormChanged = () => {
    if (!formHasChanges) {
      setFormHasChanges(true);
    }
  };

  // 处理关闭抽屉
  const handleClose = () => {
    if (formHasChanges && mode !== 'view') {
      setPendingAction(() => onClose);
      setShowConfirmModal(true);
    } else {
      onClose();
    }
    resetFormChanges();
  };

  // 确认关闭抽屉
  const handleConfirmClose = () => {
    setShowConfirmModal(false);
    pendingAction();
    resetFormChanges();
  };

  // 取消关闭抽屉
  const handleCancelClose = () => {
    setShowConfirmModal(false);
    setPendingAction(() => () => {});
  };

  // 处理表单提交
  // @spec B001-fix-brand-creation - 创建后上传 logo
  const handleSubmit = async (data: CreateBrandRequest | UpdateBrandRequest) => {
    try {
      let result;

      if (mode === 'create') {
        // 创建模式
        const businessValidation = await validateBrandBusinessRules(data as CreateBrandRequest);
        if (!businessValidation.valid) {
          message.error(businessValidation.errors.join(', '));
          return;
        }

        result = await createBrand(data as CreateBrandRequest);

        // 创建成功后，如果有待上传的 logo，则上传
        if (result && pendingLogoFile) {
          try {
            await uploadLogo({ id: result.id, file: pendingLogoFile });
            message.success('Logo上传成功');
          } catch (logoError) {
            console.error('Logo上传失败:', logoError);
            message.warning('品牌创建成功，但Logo上传失败，请稍后在编辑页面重新上传');
          }
          setPendingLogoFile(null);
        }
      } else if (mode === 'edit' && brand) {
        // 编辑模式
        const businessValidation = await validateBrandBusinessRules(
          data as UpdateBrandRequest,
          brand
        );
        if (!businessValidation.valid) {
          message.error(businessValidation.errors.join(', '));
          return;
        }

        result = await updateBrand({ id: brand.id, data: data as UpdateBrandRequest });
      } else {
        return;
      }

      // 提交成功
      if (result) {
        resetFormChanges();
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('品牌操作失败:', error);
      // 错误已在useBrandActions中处理
    }
  };

  // 处理Logo上传
  // @spec B001-fix-brand-creation - 支持创建模式下暂存 logo
  const handleLogoUpload = async (file: File) => {
    // 创建模式：暂存文件，在品牌创建成功后再上传
    if (!brand) {
      setPendingLogoFile(file);
      markFormChanged();
      // 不抛出错误，让 BrandLogoUpload 组件显示预览
      return;
    }

    // 编辑模式：直接上传
    try {
      await uploadLogo({ id: brand.id, file });
      message.success('Logo上传成功');
    } catch (error) {
      console.error('Logo上传失败:', error);
      // 错误已在useBrandActions中处理
    }
  };

  // 获取抽屉标题
  const getDrawerTitle = () => {
    switch (mode) {
      case 'create':
        return '新建品牌';
      case 'edit':
        return '编辑品牌';
      case 'view':
        return '品牌详情';
      default:
        return '品牌信息';
    }
  };

  // 获取抽屉宽度
  const getDrawerWidth = () => {
    if (mode === 'view') {
      return 800;
    }
    return 900;
  };

  // 获取操作按钮
  const getActionButtons = () => {
    if (mode === 'view') {
      return (
        <div style={{ textAlign: 'right' }}>
          <Button onClick={handleClose}>关闭</Button>
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button
            onClick={handleClose}
            disabled={isCreating || isUpdating}
            data-testid="cancel-brand-button"
          >
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
            icon={mode === 'create' ? <SaveOutlined /> : undefined}
            onClick={() => {
              // 触发表单提交
              const form = document.querySelector(
                '[data-testid="brand-form"] form'
              ) as HTMLFormElement;
              if (form) {
                form.requestSubmit();
              }
            }}
            data-testid="save-brand-button"
          >
            {mode === 'create' ? '新建品牌' : '保存修改'}
          </Button>
        </Space>
      </div>
    );
  };

  return (
    <>
      <Drawer
        title={getDrawerTitle()}
        placement="right"
        width={getDrawerWidth()}
        open={visible}
        onClose={handleClose}
        closeIcon={<CloseOutlined />}
        maskClosable={mode === 'view'}
        destroyOnClose
        footer={getActionButtons()}
        className="brand-drawer"
        data-testid="brand-drawer"
      >
        <div className="brand-drawer-content">
          {/* Logo上传区域 - 在编辑和创建模式显示 */}
          {(mode === 'create' || mode === 'edit') && (
            <div className="brand-drawer-logo-section" style={{ marginBottom: 24 }}>
              <BrandLogoUpload
                currentLogoUrl={brand?.logoUrl}
                mode={mode}
                onUpload={handleLogoUpload}
                loading={isUploadingLogo}
                data-testid="brand-drawer-logo-upload"
              />
            </div>
          )}

          {/* 查看模式的Logo展示 */}
          {mode === 'view' && brand?.logoUrl && (
            <div className="brand-drawer-logo-section" style={{ marginBottom: 24 }}>
              <div className="brand-detail-logo" style={{ textAlign: 'center' }}>
                <h4>品牌Logo</h4>
                <BrandLogo
                  src={brand.logoUrl}
                  alt={brand.name}
                  size="large"
                  style={{ marginTop: 16 }}
                />
              </div>
            </div>
          )}

          {/* 品牌表单 */}
          <BrandForm
            brand={brand}
            mode={mode}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            loading={isCreating || isUpdating}
            onChange={markFormChanged}
          />
        </div>
      </Drawer>

      {/* 未保存修改确认对话框 */}
      <Modal
        title="确认离开"
        open={showConfirmModal}
        onOk={handleConfirmClose}
        onCancel={handleCancelClose}
        okText="确定"
        cancelText="取消"
        data-testid="unsaved-changes-dialog"
      >
        <p>当前有未保存的修改，确定要关闭吗？</p>
      </Modal>
    </>
  );
};

export default BrandDrawer;
