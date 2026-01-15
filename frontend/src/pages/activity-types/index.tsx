/**
 * 活动类型管理 - 主页面
 */

import React, { useState } from 'react';
import { Card, Typography, Space, Button, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ActivityTypeTable } from './components/ActivityTypeTable';
import { ActivityTypeForm } from './components/ActivityTypeForm';
import {
  useActivityTypesQuery,
  useCreateActivityType,
  useUpdateActivityType,
  useDeleteActivityType,
  useToggleActivityTypeStatus,
} from './hooks/useActivityTypesQuery';
import type {
  ActivityType,
  CreateActivityTypePayload,
  UpdateActivityTypePayload,
  ActivityTypeStatus,
} from './types/activity-type.types';
import type {
  CreateActivityTypeInput,
  UpdateActivityTypeInput,
} from './types/activity-type.schema';

const { Title } = Typography;

export const ActivityTypePage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingActivityType, setEditingActivityType] = useState<ActivityType | null>(null);
  const { data: activityTypes = [], isLoading, error, refetch } = useActivityTypesQuery();
  const createMutation = useCreateActivityType();
  const updateMutation = useUpdateActivityType();
  const deleteMutation = useDeleteActivityType();
  const toggleStatusMutation = useToggleActivityTypeStatus();

  // 处理错误
  React.useEffect(() => {
    if (error) {
      message.error(
        '加载活动类型列表失败: ' + (error instanceof Error ? error.message : '未知错误')
      );
    }
  }, [error]);

  const handleCreate = () => {
    setCreateModalVisible(true);
  };

  const handleCreateSubmit = async (data: CreateActivityTypeInput) => {
    try {
      const payload: CreateActivityTypePayload = {
        name: data.name,
        description: data.description || null,
        sort: data.sort,
      };
      await createMutation.mutateAsync(payload);
      message.success('活动类型创建成功');
      setCreateModalVisible(false);
      await refetch(); // 刷新列表
    } catch (error) {
      // 错误处理在 ActivityTypeForm 中完成
      // 不关闭弹窗，让用户看到错误信息并可以修改后重试
      throw error;
    }
  };

  const handleCreateCancel = () => {
    setCreateModalVisible(false);
  };

  const handleEdit = (activityType: ActivityType) => {
    setEditingActivityType(activityType);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (data: UpdateActivityTypeInput) => {
    if (!editingActivityType) {
      throw new Error('未选择活动类型');
    }
    try {
      const payload: UpdateActivityTypePayload = {
        name: data.name,
        description: data.description || null,
        sort: data.sort,
      };
      await updateMutation.mutateAsync({
        id: editingActivityType.id,
        payload,
      });
      setEditModalVisible(false);
      setEditingActivityType(null);
      await refetch(); // 刷新列表
    } catch (error) {
      throw error;
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingActivityType(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('活动类型删除成功');
      await refetch(); // 刷新列表
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败，请重试');
    }
  };

  const handleToggleStatus = async (id: string, status: ActivityTypeStatus) => {
    try {
      await toggleStatusMutation.mutateAsync({ id, status });
      message.success(status === ActivityTypeStatus.ENABLED ? '活动类型已启用' : '活动类型已停用');
      await refetch(); // 刷新列表
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败，请重试');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={2} style={{ margin: 0 }}>
              活动类型管理
            </Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建
            </Button>
          </Space>

          <ActivityTypeTable
            data={activityTypes}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </Space>
      </Card>

      {/* 创建活动类型弹窗 */}
      <Modal
        title="新建活动类型"
        open={createModalVisible}
        onCancel={handleCreateCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <ActivityTypeForm
          initialData={null}
          onSubmit={handleCreateSubmit}
          onCancel={handleCreateCancel}
          loading={createMutation.isPending}
        />
      </Modal>

      {/* 编辑活动类型弹窗 */}
      <Modal
        title={`编辑活动类型 - ${editingActivityType?.name || ''}`}
        open={editModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        {editingActivityType && (
          <ActivityTypeForm
            initialData={editingActivityType}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
};

export default ActivityTypePage;
