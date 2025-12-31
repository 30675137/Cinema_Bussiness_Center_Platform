/**
 * 场景包编辑器组件
 *
 * 编辑表单容器，整合表单和操作按钮
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React from 'react';
import { Card, Button, Space, Alert, Descriptions, Spin, Form } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import PackageForm from '../molecules/PackageForm';
import StatusBadge from '../atoms/StatusBadge';
import type {
  ScenarioPackageDetail,
  CreatePackageRequest,
  UpdatePackageRequest,
  HallType,
} from '../../types';

interface PackageEditorProps {
  /** 模式：创建或编辑 */
  mode: 'create' | 'edit';
  /** 场景包数据（编辑模式时传入） */
  packageData?: ScenarioPackageDetail;
  /** 可用的影厅类型列表 */
  hallTypes?: HallType[];
  /** 是否加载中 */
  loading?: boolean;
  /** 提交按钮加载状态 */
  submitLoading?: boolean;
  /** 返回回调 */
  onBack?: () => void;
  /** 刷新回调（编辑模式） */
  onRefresh?: () => void;
  /** 创建提交回调 */
  onCreate?: (data: CreatePackageRequest) => void;
  /** 更新提交回调 */
  onUpdate?: (data: UpdatePackageRequest) => void;
}

/**
 * 场景包编辑器组件
 *
 * 封装场景包的创建和编辑功能
 */
export const PackageEditor: React.FC<PackageEditorProps> = ({
  mode,
  packageData,
  hallTypes = [],
  loading = false,
  submitLoading = false,
  onBack,
  onRefresh,
  onCreate,
  onUpdate,
}) => {
  const [form] = Form.useForm();
  const isEditMode = mode === 'edit';

  /**
   * 处理表单提交
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 解析影厅类型 IDs
      let hallTypeIds: string[] = [];
      if (typeof values.hallTypeIds === 'string') {
        hallTypeIds = values.hallTypeIds
          .split(',')
          .map((id: string) => id.trim())
          .filter(Boolean);
      } else if (Array.isArray(values.hallTypeIds)) {
        hallTypeIds = values.hallTypeIds;
      }

      if (isEditMode && packageData) {
        // 编辑模式
        const request: UpdatePackageRequest = {
          versionLock: packageData.versionLock,
          name: values.name,
          description: values.description,
          backgroundImageUrl: values.backgroundImageUrl,
          rule: values.rule,
          hallTypeIds,
        };
        onUpdate?.(request);
      } else {
        // 创建模式
        const request: CreatePackageRequest = {
          name: values.name,
          description: values.description,
          backgroundImageUrl: values.backgroundImageUrl,
          rule: values.rule || {
            durationHours: 2,
          },
          hallTypeIds,
        };
        onCreate?.(request);
      }
    } catch (error) {
      // 表单验证失败
      console.error('Form validation failed:', error);
    }
  };

  /**
   * 重置表单
   */
  const handleReset = () => {
    form.resetFields();
  };

  // 加载状态
  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" tip="加载场景包数据中..." />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} />
          <span>{isEditMode ? '编辑场景包' : '新建场景包'}</span>
          {isEditMode && (
            <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
              刷新
            </Button>
          )}
        </Space>
      }
    >
      {/* 编辑模式显示元数据 */}
      {isEditMode && packageData && (
        <Card
          size="small"
          title="场景包信息"
          style={{ marginBottom: 24, backgroundColor: '#fafafa' }}
        >
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="ID">{packageData.id}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <StatusBadge status={packageData.status} />
            </Descriptions.Item>
            <Descriptions.Item label="版本">v{packageData.version}</Descriptions.Item>
            <Descriptions.Item label="乐观锁版本">{packageData.versionLock}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(packageData.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(packageData.updatedAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* 表单 */}
      <div style={{ maxWidth: 800 }}>
        <PackageForm
          form={form}
          packageId={packageData?.id}
          hallTypes={hallTypes}
          loading={loading}
          disabled={submitLoading}
          initialValues={
            isEditMode && packageData
              ? {
                  name: packageData.name,
                  description: packageData.description,
                  backgroundImageUrl: packageData.backgroundImageUrl,
                  rule: packageData.rule,
                  hallTypeIds: packageData.hallTypes?.map((h) => h.id) || [],
                }
              : undefined
          }
        />

        {/* 乐观锁提示（编辑模式） */}
        {isEditMode && packageData && (
          <Alert
            message="并发编辑提示"
            description={`当前版本锁: ${packageData.versionLock}。如果其他用户同时编辑了此场景包，保存时将提示冲突。`}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {/* 操作按钮 */}
        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={submitLoading}
            >
              {isEditMode ? '保存更新' : '保存草稿'}
            </Button>
            <Button onClick={onBack}>取消</Button>
            <Button type="dashed" onClick={handleReset}>
              重置表单
            </Button>
          </Space>
        </Form.Item>
      </div>
    </Card>
  );
};

export default PackageEditor;
