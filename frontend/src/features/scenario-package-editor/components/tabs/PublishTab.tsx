/**
 * PublishTab 组件
 * 发布设置标签页
 * Feature: 001-scenario-package-tabs
 */

import React, { useState, useEffect } from 'react';
import {
  Empty,
  Button,
  Skeleton,
  message,
  Form,
  DatePicker,
  InputNumber,
  Space,
  Card,
  List,
  Typography,
  Alert,
  Popconfirm,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  StopOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { EditableCard, UnpublishedBadge } from '../';
import { useScenarioPackageStore } from '../../stores/useScenarioPackageStore';
import {
  useScenarioPackageDetail,
  usePublishValidation,
  useUpdatePublishSettings,
  usePublishPackage,
  useArchivePackage,
} from '../../hooks/useScenarioPackageQueries';
import type { PublishStatus } from '../../types';

const { Text, Title } = Typography;

interface PublishTabProps {
  /** 场景包ID */
  packageId: string;
  /** 是否加载中 */
  loading?: boolean;
}

/**
 * 发布设置标签页
 */
const PublishTab: React.FC<PublishTabProps> = ({ packageId, loading: parentLoading = false }) => {
  const isDirty = useScenarioPackageStore((state) => state.dirtyTabs.publish);
  const setDirty = useScenarioPackageStore((state) => state.setDirty);

  const [form] = Form.useForm();

  // 查询数据
  const { data: packageData, isLoading: loadingPackage } = useScenarioPackageDetail(packageId);
  const { data: validation, isLoading: loadingValidation } = usePublishValidation(packageId);
  const updateSettingsMutation = useUpdatePublishSettings(packageId);
  const publishMutation = usePublishPackage(packageId);
  const archiveMutation = useArchivePackage(packageId);

  const pkg = packageData?.package;
  const status = pkg?.status as PublishStatus;

  // 初始化表单
  useEffect(() => {
    if (pkg) {
      form.setFieldsValue({
        effectiveStartDate: pkg.effectiveStartDate ? dayjs(pkg.effectiveStartDate) : null,
        effectiveEndDate: pkg.effectiveEndDate ? dayjs(pkg.effectiveEndDate) : null,
        advanceBookingDays: pkg.advanceBookingDays,
      });
    }
  }, [pkg, form]);

  // 保存设置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await updateSettingsMutation.mutateAsync({
        effectiveStartDate: values.effectiveStartDate?.format('YYYY-MM-DD') || null,
        effectiveEndDate: values.effectiveEndDate?.format('YYYY-MM-DD') || null,
        advanceBookingDays: values.advanceBookingDays || null,
      });
      message.success('设置已保存');
      setDirty('publish', false);
    } catch (error) {
      if ((error as any).errorFields) return;
      message.error('保存失败');
    }
  };

  // 发布
  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync();
      message.success('发布成功');
    } catch (error) {
      message.error('发布失败');
    }
  };

  // 下架
  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync();
      message.success('已下架');
    } catch (error) {
      message.error('下架失败');
    }
  };

  const loading = parentLoading || loadingPackage || loadingValidation;

  return (
    <EditableCard
      title="发布设置"
      description="配置生效时间和发布状态"
      isDirty={isDirty}
      extra={
        pkg && (
          <Space>
            <UnpublishedBadge status={status} />
            {status === 'DRAFT' && (
              <Popconfirm
                title="确定要发布这个场景包吗？"
                onConfirm={handlePublish}
                disabled={!validation?.canPublish}
              >
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  disabled={!validation?.canPublish}
                  loading={publishMutation.isPending}
                >
                  发布
                </Button>
              </Popconfirm>
            )}
            {status === 'PUBLISHED' && (
              <Popconfirm title="确定要下架这个场景包吗？" onConfirm={handleArchive}>
                <Button danger icon={<StopOutlined />} loading={archiveMutation.isPending}>
                  下架
                </Button>
              </Popconfirm>
            )}
          </Space>
        )
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div style={{ display: 'flex', gap: 24 }}>
          {/* 左侧：设置表单 */}
          <div style={{ flex: 1 }}>
            <Form form={form} layout="vertical" onValuesChange={() => setDirty('publish', true)}>
              <Form.Item name="effectiveStartDate" label="生效开始日期">
                <DatePicker style={{ width: '100%' }} placeholder="选择开始日期" />
              </Form.Item>
              <Form.Item name="effectiveEndDate" label="生效结束日期">
                <DatePicker style={{ width: '100%' }} placeholder="选择结束日期" />
              </Form.Item>
              <Form.Item name="advanceBookingDays" label="提前预订天数">
                <InputNumber
                  min={0}
                  max={365}
                  style={{ width: '100%' }}
                  placeholder="例如：3 表示需提前3天预订"
                  addonAfter="天"
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={updateSettingsMutation.isPending}
                  disabled={!isDirty}
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* 右侧：发布检查 */}
          <Card title="发布检查" style={{ width: 300 }} size="small">
            {validation ? (
              <>
                {validation.canPublish ? (
                  <Alert
                    type="success"
                    message="所有检查均已通过，可以发布"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                ) : (
                  <Alert
                    type="warning"
                    message="部分检查未通过"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
                <List
                  size="small"
                  dataSource={validation.checks}
                  renderItem={(check) => (
                    <List.Item>
                      <Space>
                        {check.passed ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : (
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        )}
                        <Text>{check.item}</Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {check.message}
                      </Text>
                    </List.Item>
                  )}
                />
              </>
            ) : (
              <Empty description="加载中..." />
            )}
          </Card>
        </div>
      )}
    </EditableCard>
  );
};

export default PublishTab;
