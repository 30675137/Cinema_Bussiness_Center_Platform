/**
 * @spec O002-miniapp-menu-config
 * 删除分类确认对话框
 */

import React from 'react';
import { Modal, Typography, Alert, Space } from 'antd';
import { ExclamationCircleFilled, WarningOutlined } from '@ant-design/icons';
import type { MenuCategoryDTO, DeleteCategoryData } from '../types';

const { Text, Paragraph } = Typography;

interface DeleteCategoryDialogProps {
  open: boolean;
  category: MenuCategoryDTO | null;
  deletePreview: DeleteCategoryData | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  open,
  category,
  deletePreview,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!category) return null;

  const hasProducts = deletePreview && deletePreview.affectedProductCount > 0;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleFilled style={{ color: '#faad14' }} />
          <span>删除分类</span>
        </Space>
      }
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="确认删除"
      okButtonProps={{ danger: true }}
      cancelText="取消"
      width={480}
    >
      <div style={{ marginTop: 16 }}>
        <Paragraph>
          确定要删除分类 <Text strong>「{category.displayName}」</Text>（{category.code}）吗？
        </Paragraph>

        {hasProducts && deletePreview && (
          <Alert
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            message="该分类下有关联商品"
            description={
              <div>
                <Paragraph style={{ marginBottom: 8 }}>
                  此分类下有 <Text strong>{deletePreview.affectedProductCount}</Text> 个商品，
                  删除后将自动迁移到默认分类
                  <Text strong>「{deletePreview.targetCategoryName}」</Text>。
                </Paragraph>
                <Text type="secondary">
                  商品迁移后，您可以在默认分类中重新分配它们。
                </Text>
              </div>
            }
            style={{ marginBottom: 16 }}
          />
        )}

        {!hasProducts && (
          <Alert
            type="info"
            message="该分类下没有商品"
            description="可以安全删除此分类。"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          此操作不可撤销，请谨慎操作。
        </Paragraph>
      </div>
    </Modal>
  );
};

export default DeleteCategoryDialog;
