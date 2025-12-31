/**
 * 场景包创建页（按设计图实现）
 *
 * 布局：左右两栏
 * - 左侧：基础信息 + 使用规则
 * - 右侧：封面图 + 定价策略
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Card, Space, Row, Col, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useCreatePackage } from '../../features/scenario-package-management/hooks/usePackageMutations';
import { ImageUpload } from '../../features/scenario-package-management/components/atoms';
// 019-store-association: Import StoreSelector component
import { StoreSelector } from '../../features/scenario-package-management/components/molecules';
import type { CreatePackageRequest } from '../../features/scenario-package-management/types';

const { TextArea } = Input;

// 预设的影厅类型选项（后续可从 API 获取）
// 注意：开发阶段使用字符串 ID，后续有真实影厅数据后改为 UUID
const HALL_TYPE_OPTIONS = [
  { id: 'vip', name: 'VIP 厅' },
  { id: 'party', name: 'Party 厅' },
  { id: 'couple', name: '情侣厅' },
  { id: 'imax', name: 'IMAX 厅' },
];

const ScenarioPackageCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const createMutation = useCreatePackage();

  // 选中的影厅类型
  const [selectedHallTypes, setSelectedHallTypes] = useState<string[]>([]);

  // 019-store-association: 选中的门店ID列表
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);

  /**
   * 切换影厅类型选择状态
   */
  const handleHallTypeToggle = (hallId: string) => {
    setSelectedHallTypes((prev) =>
      prev.includes(hallId) ? prev.filter((id) => id !== hallId) : [...prev, hallId]
    );
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: any) => {
    // 019-store-association: 验证至少选择一个门店
    if (selectedStoreIds.length === 0) {
      message.error('请至少选择一个关联门店');
      return;
    }

    try {
      const request: CreatePackageRequest = {
        name: values.name,
        description: values.description,
        backgroundImageUrl: values.backgroundImageUrl,
        rule: {
          durationHours: values.durationHours,
          minPeople: values.minPeople,
          maxPeople: values.maxPeople,
        },
        hallTypeIds: selectedHallTypes,
        // 新增：打包一口价
        packagePrice: values.packagePrice,
        // 019-store-association: 包含门店关联
        storeIds: selectedStoreIds,
      } as any;

      await createMutation.mutateAsync(request);
      navigate('/scenario-packages');
    } catch (error) {
      // 错误已由 mutation onError 处理
      console.error('Create failed:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面头部 - 按钮在右上角 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/scenario-packages')}
          />
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}
          >
            编辑场景包
          </span>
        </Space>
        <Space>
          <Button onClick={() => navigate('/scenario-packages')}>取消</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={createMutation.isPending}
          >
            保存为草稿
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          durationHours: 2,
          minPeople: 2,
          maxPeople: 10,
        }}
      >
        <Row gutter={24}>
          {/* 左侧主内容区 */}
          <Col span={16}>
            {/* 基础信息 Card */}
            <Card
              title={
                <Space>
                  <SettingOutlined style={{ color: '#1890ff' }} />
                  基础信息
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Form.Item
                label="场景包名称"
                name="name"
                required
                rules={[
                  { required: true, message: '请输入场景包名称' },
                  { max: 255, message: '名称长度不能超过255个字符' },
                ]}
              >
                <Input placeholder="例如：VIP 生日派对专场" />
              </Form.Item>

              <Form.Item label="背景描述" name="description">
                <TextArea
                  rows={4}
                  placeholder="介绍该场景包的特色服务..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item label="适用影厅类型">
                <Space wrap>
                  {HALL_TYPE_OPTIONS.map((hall) => (
                    <Tag.CheckableTag
                      key={hall.id}
                      checked={selectedHallTypes.includes(hall.id)}
                      onChange={() => handleHallTypeToggle(hall.id)}
                      style={{
                        padding: '4px 12px',
                        border: '1px solid #d9d9d9',
                        borderRadius: 16,
                        backgroundColor: selectedHallTypes.includes(hall.id)
                          ? '#1890ff'
                          : 'transparent',
                        color: selectedHallTypes.includes(hall.id) ? '#fff' : 'inherit',
                      }}
                    >
                      {hall.name}
                    </Tag.CheckableTag>
                  ))}
                </Space>
              </Form.Item>
            </Card>

            {/* 019-store-association: 关联门店 Card */}
            <Card
              title={
                <Space>
                  <ShopOutlined style={{ color: '#1890ff' }} />
                  关联门店
                </Space>
              }
              style={{ marginBottom: 24 }}
              extra={<span style={{ color: '#8c8c8c', fontSize: 12 }}>必填，至少选择一个门店</span>}
            >
              <StoreSelector value={selectedStoreIds} onChange={setSelectedStoreIds} required />
            </Card>

            {/* 使用规则 Card - 三列横向排列 */}
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  使用规则
                </Space>
              }
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    label="建议时长（小时）"
                    name="durationHours"
                    rules={[{ required: true, message: '请输入时长' }]}
                  >
                    <InputNumber
                      min={0.1}
                      step={0.5}
                      precision={0}
                      style={{ width: '100%' }}
                      addonAfter="H"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="最小人数" name="minPeople">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="最大人数" name="maxPeople">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 右侧侧边栏 */}
          <Col span={8}>
            {/* 封面图 Card */}
            <Card
              title={
                <Space>
                  <PictureOutlined style={{ color: '#1890ff' }} />
                  封面图
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Form.Item name="backgroundImageUrl" noStyle>
                <ImageUpload onChange={(url) => form.setFieldValue('backgroundImageUrl', url)} />
              </Form.Item>
            </Card>

            {/* 定价策略 Card */}
            <Card
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: '#1890ff' }} />
                  定价策略
                </Space>
              }
            >
              {/* 价格汇总展示 */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: '#8c8c8c' }}>单品累计总价</span>
                  <span>¥0.00</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: '#8c8c8c' }}>服务项目总价</span>
                  <span>¥0.00</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                  }}
                >
                  <span>参考总价（不含硬权益）</span>
                  <span style={{ fontSize: 18 }}>¥0.00</span>
                </div>
              </div>

              <Form.Item
                label="打包一口价"
                name="packagePrice"
                required
                rules={[{ required: true, message: '请输入打包一口价' }]}
              >
                <InputNumber
                  prefix="¥"
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ScenarioPackageCreatePage;
