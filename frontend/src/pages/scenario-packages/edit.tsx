/**
 * 场景包编辑页（按设计图实现）
 *
 * 布局：左右两栏
 * - 左侧：基础信息 + 使用规则
 * - 右侧：封面图 + 定价策略
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React, { useEffect, useState } from 'react';
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
  Row,
  Col,
  Upload,
  message,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { usePackageDetail } from '../../features/scenario-package-management/hooks/usePackageDetail';
import { useUpdatePackage } from '../../features/scenario-package-management/hooks/usePackageMutations';
import type { UpdatePackageRequest } from '../../features/scenario-package-management/types';

const { TextArea } = Input;

// 预设的影厅类型选项（后续可从 API 获取）
const HALL_TYPE_OPTIONS = [
  { id: 'vip', name: 'VIP 厅' },
  { id: 'party', name: 'Party 厅' },
  { id: 'couple', name: '情侣厅' },
  { id: 'imax', name: 'IMAX 厅' },
];

const ScenarioPackageEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();

  // 选中的影厅类型
  const [selectedHallTypes, setSelectedHallTypes] = useState<string[]>([]);

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
        packagePrice: pkg.pricing?.packagePrice,
      });
      // 设置已选中的影厅类型
      if (pkg.hallTypes?.length) {
        setSelectedHallTypes(pkg.hallTypes.map((h) => h.id));
      }
    }
  }, [data, form]);

  /**
   * 切换影厅类型选择状态
   */
  const handleHallTypeToggle = (hallId: string) => {
    setSelectedHallTypes((prev) =>
      prev.includes(hallId)
        ? prev.filter((id) => id !== hallId)
        : [...prev, hallId]
    );
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: any) => {
    if (!data?.data) return;

    try {
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
        hallTypeIds: selectedHallTypes,
        packagePrice: values.packagePrice,
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
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isLoading}
            size="small"
          >
            刷新
          </Button>
        </Space>
        <Space>
          <Button onClick={() => navigate('/scenario-packages')}>取消</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={updateMutation.isPending}
          >
            保存更新
          </Button>
        </Space>
      </div>

      {/* 场景包元数据展示 */}
      <Card
        size="small"
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            场景包信息
          </Space>
        }
        style={{ marginBottom: 24, backgroundColor: '#fafafa' }}
      >
        <Descriptions size="small" column={4}>
          <Descriptions.Item label="ID">
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
              {pkg.id.substring(0, 8)}...
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(pkg.status)}</Descriptions.Item>
          <Descriptions.Item label="版本">v{pkg.version}</Descriptions.Item>
          <Descriptions.Item label="乐观锁">{pkg.versionLock}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
                        color: selectedHallTypes.includes(hall.id)
                          ? '#fff'
                          : 'inherit',
                      }}
                    >
                      {hall.name}
                    </Tag.CheckableTag>
                  ))}
                </Space>
              </Form.Item>
            </Card>

            {/* 使用规则 Card - 三列横向排列 */}
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  使用规则
                </Space>
              }
              style={{ marginBottom: 24 }}
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

            {/* 乐观锁提示 */}
            <Alert
              message="并发编辑提示"
              description={`当前版本锁: ${pkg.versionLock}。如果其他用户同时编辑了此场景包，保存时将提示冲突。`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
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
                {pkg.backgroundImageUrl ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={pkg.backgroundImageUrl}
                      alt="背景图片"
                      style={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                        borderRadius: 8,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <Button
                      size="small"
                      style={{ position: 'absolute', top: 8, right: 8 }}
                      onClick={() => form.setFieldValue('backgroundImageUrl', '')}
                    >
                      更换
                    </Button>
                  </div>
                ) : (
                  <Upload.Dragger
                    name="file"
                    accept="image/jpeg,image/png"
                    maxCount={1}
                    showUploadList={false}
                    beforeUpload={(file) => {
                      const isValidType =
                        file.type === 'image/jpeg' || file.type === 'image/png';
                      const isLt5M = file.size / 1024 / 1024 < 5;

                      if (!isValidType) {
                        message.error('只支持 JPG/PNG 格式!');
                        return false;
                      }
                      if (!isLt5M) {
                        message.error('图片大小不能超过 5MB!');
                        return false;
                      }
                      // TODO: 实现图片上传逻辑
                      message.info('图片上传功能待实现');
                      return false;
                    }}
                    style={{
                      background: '#fafafa',
                      border: '2px dashed #d9d9d9',
                      borderRadius: 8,
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <PictureOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
                    </p>
                    <p style={{ color: '#8c8c8c' }}>点击上传背景图</p>
                    <p style={{ color: '#bfbfbf', fontSize: 12 }}>
                      支持 JPG/PNG，不超过 5MB
                    </p>
                  </Upload.Dragger>
                )}
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
                  <span>¥{pkg.pricing?.itemTotalPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: '#8c8c8c' }}>服务项目总价</span>
                  <span>¥{pkg.pricing?.serviceTotalPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                  }}
                >
                  <span>参考总价（不含硬权益）</span>
                  <span style={{ fontSize: 18 }}>
                    ¥{pkg.pricing?.referencePrice?.toFixed(2) || '0.00'}
                  </span>
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

export default ScenarioPackageEditPage;
