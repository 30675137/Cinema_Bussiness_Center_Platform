/**
 * 场景包编辑页（完整实现）
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Space,
  Spin,
  Alert,
  Tag,
  Descriptions,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { usePackageDetail } from '../../features/scenario-package-management/hooks/usePackageDetail';
import { useUpdatePackage } from '../../features/scenario-package-management/hooks/usePackageMutations';
import type { UpdatePackageRequest } from '../../features/scenario-package-management/types';

const { TextArea } = Input;

const ScenarioPackageEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();

  const { data, isLoading, isError, error, refetch } = usePackageDetail(id);
  const updateMutation = useUpdatePackage();

  // 当数据加载完成时，填充表单
  useEffect(() => {
    if (data?.data) {
      const pkg = data.data;
      form.setFieldsValue({
        name: pkg.name,
        description: pkg.description,
        backgroundImageUrl: pkg.backgroundImageUrl,
        durationHours: pkg.rule?.durationHours,
        minPeople: pkg.rule?.minPeople,
        maxPeople: pkg.rule?.maxPeople,
        hallTypeIds: pkg.hallTypes?.map((h) => h.id).join(',') || '',
      });
    }
  }, [data, form]);

  const handleSubmit = async (values: any) => {
    if (!data?.data) return;

    try {
      // 解析影厅类型 IDs
      const hallTypeIds = values.hallTypeIds
        ? values.hallTypeIds.split(',').map((id: string) => id.trim()).filter(Boolean)
        : [];

      const request: UpdatePackageRequest = {
        versionLock: data.data.versionLock, // 关键：传递乐观锁版本号
        name: values.name,
        description: values.description,
        backgroundImageUrl: values.backgroundImageUrl,
        rule: {
          durationHours: values.durationHours,
          minPeople: values.minPeople,
          maxPeople: values.maxPeople,
        },
        hallTypeIds,
      };

      await updateMutation.mutateAsync({ id: id!, request });
      navigate('/scenario-packages');
    } catch (error) {
      // 错误已由 mutation onError 处理
      console.error('Update failed:', error);
      // 如果是乐观锁冲突，重新加载数据
      refetch();
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="加载场景包数据中..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Alert
            message="加载失败"
            description={`无法加载场景包数据: ${(error as any)?.message || '未知错误'}`}
            type="error"
            showIcon
            action={
              <Space>
                <Button size="small" onClick={handleRefresh}>
                  重试
                </Button>
                <Button size="small" onClick={() => navigate('/scenario-packages')}>
                  返回列表
                </Button>
              </Space>
            }
          />
        </Card>
      </div>
    );
  }

  const pkg = data?.data;
  if (!pkg) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Alert
            message="场景包不存在"
            description="未找到指定的场景包"
            type="warning"
            showIcon
            action={
              <Button onClick={() => navigate('/scenario-packages')}>返回列表</Button>
            }
          />
        </Card>
      </div>
    );
  }

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      DRAFT: { color: 'default', text: '草稿' },
      PUBLISHED: { color: 'success', text: '已发布' },
      UNPUBLISHED: { color: 'warning', text: '已下架' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/scenario-packages')}
            />
            <span>编辑场景包</span>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              刷新
            </Button>
          </Space>
        }
      >
        {/* 场景包元数据展示 */}
        <Card
          size="small"
          title="场景包信息"
          style={{ marginBottom: 24, backgroundColor: '#fafafa' }}
        >
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="ID">{pkg.id}</Descriptions.Item>
            <Descriptions.Item label="状态">{getStatusTag(pkg.status)}</Descriptions.Item>
            <Descriptions.Item label="版本">v{pkg.version}</Descriptions.Item>
            <Descriptions.Item label="乐观锁版本">{pkg.versionLock}</Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(pkg.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(pkg.updatedAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 编辑表单 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 800 }}
        >
          <Form.Item
            label="场景包名称"
            name="name"
            rules={[
              { required: true, message: '请输入场景包名称' },
              { max: 255, message: '名称长度不能超过255个字符' },
            ]}
          >
            <Input placeholder="例如：VIP生日派对专场" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <TextArea
              rows={4}
              placeholder="描述场景包的特色和适用场景"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="背景图片URL"
            name="backgroundImageUrl"
            extra="当前版本暂不支持文件上传，请直接输入图片URL"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          {pkg.backgroundImageUrl && (
            <Form.Item label="当前背景图片预览">
              <img
                src={pkg.backgroundImageUrl}
                alt="背景图片"
                style={{ maxWidth: 400, maxHeight: 300, objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </Form.Item>
          )}

          <Card title="使用规则" size="small" style={{ marginBottom: 24 }}>
            <Form.Item
              label="时长（小时）"
              name="durationHours"
              rules={[
                { required: true, message: '请输入时长' },
                { type: 'number', min: 0.1, message: '时长必须大于0' },
              ]}
            >
              <InputNumber
                min={0.1}
                step={0.5}
                precision={2}
                style={{ width: 200 }}
                addonAfter="小时"
              />
            </Form.Item>

            <Form.Item label="最小人数" name="minPeople">
              <InputNumber
                min={0}
                style={{ width: 200 }}
                addonAfter="人"
                placeholder="不限制可留空"
              />
            </Form.Item>

            <Form.Item label="最大人数" name="maxPeople">
              <InputNumber
                min={0}
                style={{ width: 200 }}
                addonAfter="人"
                placeholder="不限制可留空"
              />
            </Form.Item>
          </Card>

          <Form.Item
            label="适用影厅类型"
            name="hallTypeIds"
            extra="多个UUID请用逗号分隔（MVP版本：暂不支持下拉选择）"
          >
            <Input placeholder="例如：123e4567-e89b-12d3-a456-426614174000" />
          </Form.Item>

          <Alert
            message="乐观锁提示"
            description={`当前版本锁: ${pkg.versionLock}。如果其他用户同时编辑了此场景包，保存时将提示冲突。`}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updateMutation.isPending}
              >
                保存更新
              </Button>
              <Button onClick={() => navigate('/scenario-packages')}>取消</Button>
              <Button type="dashed" onClick={() => form.resetFields()}>
                重置表单
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ScenarioPackageEditPage;
