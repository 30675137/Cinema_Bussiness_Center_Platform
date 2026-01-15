/**
 * PackagesTab 组件
 * 套餐配置标签页
 * Feature: 001-scenario-package-tabs
 */

import React, { useState } from 'react';
import { Empty, Button, Skeleton, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { EditableCard } from '../';
import PackageTierCard from '../molecules/PackageTierCard';
import PackageTierForm from '../forms/PackageTierForm';
import { useScenarioPackageStore } from '../../stores/useScenarioPackageStore';
import {
  usePackageTiers,
  useCreatePackageTier,
  useUpdatePackageTier,
  useDeletePackageTier,
} from '../../hooks/useScenarioPackageQueries';
import type { PackageTier } from '../../types';
import type { PackageTierFormData } from '../../schemas/validationSchemas';

interface PackagesTabProps {
  /** 场景包ID */
  packageId: string;
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * 套餐配置标签页
 */
const PackagesTab: React.FC<PackagesTabProps> = ({ packageId, loading: parentLoading = false }) => {
  const isDirty = useScenarioPackageStore((state) => state.dirtyTabs.packages);
  const setDirty = useScenarioPackageStore((state) => state.setDirty);

  // 模态框状态
  const [formOpen, setFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PackageTier | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 查询套餐列表
  const { data: tiers = [], isLoading } = usePackageTiers(packageId);

  // 变更 hooks
  const createMutation = useCreatePackageTier(packageId);
  const updateMutation = useUpdatePackageTier(packageId);
  const deleteMutation = useDeletePackageTier(packageId);

  // 打开新建弹窗
  const handleAdd = () => {
    setEditingTier(null);
    setFormOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (tier: PackageTier) => {
    setEditingTier(tier);
    setFormOpen(true);
  };

  // 保存套餐
  const handleSave = async (data: PackageTierFormData) => {
    try {
      if (editingTier) {
        await updateMutation.mutateAsync({
          id: editingTier.id,
          ...data,
        });
        message.success('套餐已更新');
      } else {
        await createMutation.mutateAsync(data);
        message.success('套餐已添加');
      }
      setFormOpen(false);
      setEditingTier(null);
    } catch (error) {
      message.error('保存失败');
      throw error;
    }
  };

  // 删除套餐
  const handleDelete = async (tierId: string) => {
    try {
      setDeletingId(tierId);
      await deleteMutation.mutateAsync(tierId);
      message.success('套餐已删除');
    } catch (error) {
      message.error('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  // 关闭弹窗
  const handleClose = () => {
    setFormOpen(false);
    setEditingTier(null);
  };

  const loading = parentLoading || isLoading;

  return (
    <>
      <EditableCard
        title="套餐配置"
        description="配置不同档位的套餐及服务内容"
        isDirty={isDirty}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加套餐
          </Button>
        }
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : tiers.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无套餐，请添加第一个套餐">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加套餐
            </Button>
          </Empty>
        ) : (
          <div>
            {tiers.map((tier) => (
              <PackageTierCard
                key={tier.id}
                tier={tier}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleting={deletingId === tier.id}
              />
            ))}
          </div>
        )}
      </EditableCard>

      {/* 套餐编辑表单 */}
      <PackageTierForm
        open={formOpen}
        tier={editingTier}
        onSave={handleSave}
        onClose={handleClose}
        saving={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
};

export default PackagesTab;
