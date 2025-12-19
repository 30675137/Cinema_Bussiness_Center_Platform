/**
 * 场景包创建页（MVP版本）
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React from 'react';
import { Form, Input, InputNumber, Button, Card, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useCreatePackage } from '../../features/scenario-package-management/hooks/usePackageMutations';
import type { CreatePackageRequest } from '../../features/scenario-package-management/types';

const { TextArea } = Input;

const ScenarioPackageCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const createMutation = useCreatePackage();

  const handleSubmit = async (values: any) => {
    try {
      // 解析影厅类型 IDs（支持逗号分隔的字符串）
      const hallTypeIds = values.hallTypeIds
        ? values.hallTypeIds.split(',').map((id: string) => id.trim()).filter(Boolean)
        : [];

      const request: CreatePackageRequest = {
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

      await createMutation.mutateAsync(request);
      navigate('/scenario-packages');
    } catch (error) {
      // 错误已由 mutation onError 处理
      console.error('Create failed:', error);
    }
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
            <span>新建场景包</span>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            durationHours: 2,
            minPeople: 1,
            maxPeople: 10,
          }}
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

          <Form.Item
            label="描述"
            name="description"
          >
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
            extra="MVP版本：请直接输入图片URL，暂不支持上传"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

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

            <Form.Item
              label="最小人数"
              name="minPeople"
            >
              <InputNumber
                min={0}
                style={{ width: 200 }}
                addonAfter="人"
                placeholder="不限制可留空"
              />
            </Form.Item>

            <Form.Item
              label="最大人数"
              name="maxPeople"
            >
              <InputNumber
                min={0}
                style={{ width: 200 }}
                addonAfter="人"
                placeholder="不限制可留空"
              />
            </Form.Item>
          </Card>

          <Form.Item
            label="适用影厅类型（MVP版本：暂不支持选择，请手动输入UUID）"
            name="hallTypeIds"
            extra="多个UUID请用逗号分隔"
          >
            <Input placeholder="例如：123e4567-e89b-12d3-a456-426614174000" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={createMutation.isPending}
              >
                保存草稿
              </Button>
              <Button onClick={() => navigate('/scenario-packages')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ScenarioPackageCreatePage;
