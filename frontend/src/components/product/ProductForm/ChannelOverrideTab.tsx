import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Table,
  Upload,
  Image,
  Popconfirm,
  message,
  Divider,
  Tag,
  Alert
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SettingOutlined,
  UploadOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  CopyOutlined
} from '@ant-design/icons';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { UploadFile, UploadProps } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Channel {
  id: string;
  code: string;
  name: string;
  type: 'mini_program' | 'app' | 'website' | 'offline';
  platform?: string;
  status: 'active' | 'inactive' | 'testing';
}

interface ChannelOverride {
  id: string;
  channelId: string;
  channel: Channel;
  title?: string;
  shortTitle?: string;
  shortDescription?: string;
  customImages?: Array<{
    id: string;
    url: string;
    alt?: string;
    sortOrder: number;
  }>;
  customAttributes?: Record<string, any>;
  isActive: boolean;
}

interface ChannelOverrideTabProps {
  control: Control<any>;
  errors: FieldErrors<FieldValues>;
  touched: Record<string, boolean>;
}

const ChannelOverrideTab: React.FC<ChannelOverrideTabProps> = ({
  control,
  errors,
  touched
}) => {
  const [editingOverride, setEditingOverride] = useState<ChannelOverride | null>(null);
  const [overrideFormVisible, setOverrideFormVisible] = useState(false);

  const {
    fields: overrideFields,
    append: appendOverride,
    remove: removeOverride,
    update: updateOverride
  } = useFieldArray({
    control,
    name: 'channelOverrides'
  });

  // 模拟渠道数据（实际应该从API获取）
  const availableChannels: Channel[] = [
    { id: 'ch001', code: 'wechat_mini', name: '微信小程序', type: 'mini_program', platform: 'wechat', status: 'active' },
    { id: 'ch002', code: 'alipay_mini', name: '支付宝小程序', type: 'mini_program', platform: 'alipay', status: 'active' },
    { id: 'ch003', code: 'cinema_app', name: '影城APP', type: 'app', platform: 'ios', status: 'active' },
    { id: 'ch004', code: 'h5_website', name: 'H5网站', type: 'website', platform: 'web', status: 'active' },
    { id: 'ch005', code: 'offline_store', name: '线下门店', type: 'offline', status: 'active' }
  ];

  // 获取可用渠道（排除已添加的）
  const getAvailableChannels = () => {
    const usedChannelIds = control.getValues('channelOverrides')?.map((override: ChannelOverride) => override.channelId) || [];
    return availableChannels.filter(channel => !usedChannelIds.includes(channel.id));
  };

  // 渠道类型标签
  const getChannelTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      'mini_program': { color: 'green', text: '小程序' },
      'app': { color: 'blue', text: 'APP' },
      'website': { color: 'orange', text: '网站' },
      'offline': { color: 'purple', text: '线下' }
    };
    const config = typeMap[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 添加渠道覆写
  const handleAddOverride = () => {
    const availableChannels = getAvailableChannels();
    if (availableChannels.length === 0) {
      message.warning('暂无可用的渠道，所有渠道都已添加');
      return;
    }

    const newOverride: ChannelOverride = {
      id: Date.now().toString(),
      channelId: '',
      channel: {} as Channel,
      title: '',
      shortTitle: '',
      shortDescription: '',
      customImages: [],
      customAttributes: {},
      isActive: true
    };
    setEditingOverride(newOverride);
    setOverrideFormVisible(true);
  };

  // 编辑渠道覆写
  const handleEditOverride = (override: ChannelOverride) => {
    setEditingOverride({ ...override });
    setOverrideFormVisible(true);
  };

  // 保存渠道覆写
  const handleSaveOverride = (override: ChannelOverride) => {
    const channel = availableChannels.find(ch => ch.id === override.channelId);
    if (!channel) {
      message.error('请选择有效的渠道');
      return;
    }
    override.channel = channel;

    if (editingOverride && overrideFields.find(field => field.id === editingOverride.id)) {
      // 更新现有覆写
      const index = overrideFields.findIndex(field => field.id === override.id);
      if (index !== -1) {
        updateOverride(index, override);
      }
    } else {
      // 添加新覆写
      appendOverride(override);
    }

    setOverrideFormVisible(false);
    setEditingOverride(null);
    message.success('渠道配置保存成功');
  };

  // 删除渠道覆写
  const handleDeleteOverride = (index: number) => {
    removeOverride(index);
    message.success('渠道配置已删除');
  };

  // 切换启用状态
  const handleToggleActive = (index: number, active: boolean) => {
    const overrides = control.getValues('channelOverrides') || [];
    overrides[index].isActive = active;
    control.setValue('channelOverrides', overrides);
  };

  // 复制基础内容
  const handleCopyFromBase = (field: string) => {
    const baseContent = control.getValues(`content.${field}`) || '';
    if (editingOverride) {
      setEditingOverride({
        ...editingOverride,
        [field]: baseContent
      });
    }
  };

  // 图片上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return false;
      }
      return false;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '渠道',
      dataIndex: ['channel', 'name'],
      key: 'channel',
      render: (_: any, record: ChannelOverride) => (
        <Space direction="vertical" size={0}>
          <span>{record.channel.name || '-'}</span>
          {getChannelTypeTag(record.channel.type)}
        </Space>
      )
    },
    {
      title: '自定义标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ChannelOverride) => (
        <Space>
          <span>{title || record.channel.name}</span>
          {title && <Tag color="blue" >自定义</Tag>}
        </Space>
      )
    },
    {
      title: '自定义描述',
      dataIndex: 'shortDescription',
      key: 'shortDescription',
      render: (desc: string) => (
        desc ? (
          <Text ellipsis style={{ maxWidth: 200 }}>
            {desc}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        )
      )
    },
    {
      title: '自定义图片',
      dataIndex: 'customImages',
      key: 'customImages',
      render: (images: any[]) => (
        <Space>
          {images && images.length > 0 ? (
            <>
              <Image
                width={40}
                height={40}
                src={images[0]?.url}
                style={{ objectFit: 'cover', borderRadius: 4 }}
                preview={{
                  mask: <EyeOutlined />
                }}
              />
              {images.length > 1 && (
                <Tag >+{images.length - 1}</Tag>
              )}
            </>
          ) : (
            <Text type="secondary">无</Text>
          )}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean, record: ChannelOverride, index: number) => (
        <Switch
          
          checked={isActive}
          onChange={(checked) => handleToggleActive(index, checked)}
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: any, record: ChannelOverride, index: number) => (
        <Space >
          <Button
            type="text"
            
            icon={<EditOutlined />}
            onClick={() => handleEditOverride(record)}
          />
          <Popconfirm
            title="确定删除此渠道配置吗？"
            onConfirm={() => handleDeleteOverride(index)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="channel-override-tab">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 说明信息 */}
        <Alert
          message="渠道内容覆写"
          description="为不同销售渠道配置专属的商品展示内容，包括标题、描述、图片等。启用覆写后，该渠道将显示自定义内容而非默认内容。"
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
        />

        {/* 渠道覆写列表 */}
        <div>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              渠道配置
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddOverride}
              disabled={getAvailableChannels().length === 0}
            >
              添加渠道配置
            </Button>
          </div>

          {overrideFields.length === 0 ? (
            <Card
              style={{ textAlign: 'center', padding: '60px 0' }}
              bodyStyle={{ borderStyle: 'dashed' }}
            >
              <div style={{ color: '#d9d9d9', fontSize: 48, marginBottom: 16 }}>
                <SettingOutlined />
              </div>
              <div>
                <Text type="secondary">暂无渠道配置</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  为不同渠道配置专属的商品展示内容
                </Text>
              </div>
            </Card>
          ) : (
            <Table
              dataSource={control.getValues('channelOverrides') || []}
              columns={columns}
              rowKey="id"
              pagination={false}
              
              bordered
            />
          )}
        </div>

        {/* 渠道编辑表单 */}
        {overrideFormVisible && editingOverride && (
          <OverrideForm
            override={editingOverride}
            availableChannels={getAvailableChannels()}
            onSave={handleSaveOverride}
            onCancel={() => {
              setOverrideFormVisible(false);
              setEditingOverride(null);
            }}
            onCopyFromBase={handleCopyFromBase}
            uploadProps={uploadProps}
          />
        )}
      </Space>
    </div>
  );
};

// 渠道覆写编辑表单组件
interface OverrideFormProps {
  override: ChannelOverride;
  availableChannels: Channel[];
  onSave: (override: ChannelOverride) => void;
  onCancel: () => void;
  onCopyFromBase: (field: string) => void;
  uploadProps: UploadProps;
}

const OverrideForm: React.FC<OverrideFormProps> = ({
  override,
  availableChannels,
  onSave,
  onCancel,
  onCopyFromBase,
  uploadProps
}) => {
  const [formOverride, setFormOverride] = useState<ChannelOverride>(override);

  // 渠道选择
  const handleChannelSelect = (channelId: string) => {
    setFormOverride({
      ...formOverride,
      channelId,
      title: '', // 重置自定义内容
      shortTitle: '',
      shortDescription: '',
      customImages: []
    });
  };

  // 图片上传处理
  const handleImageUpload = (info: any) => {
    if (info.file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now().toString(),
          url: e.target?.result as string,
          alt: '',
          sortOrder: (formOverride.customImages || []).length
        };
        setFormOverride({
          ...formOverride,
          customImages: [...(formOverride.customImages || []), newImage]
        });
      };
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // 删除图片
  const handleDeleteImage = (imageId: string) => {
    setFormOverride({
      ...formOverride,
      customImages: (formOverride.customImages || []).filter(img => img.id !== imageId)
    });
  };

  return (
    <Card
      title="渠道内容配置"
      style={{ marginTop: 16 }}
      extra={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            onClick={() => onSave(formOverride)}
            disabled={!formOverride.channelId}
          >
            保存配置
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Form.Item label="选择渠道" required>
            <Select
              placeholder="请选择渠道"
              value={formOverride.channelId}
              onChange={handleChannelSelect}
            >
              {availableChannels.map(channel => (
                <Option key={channel.id} value={channel.id}>
                  {channel.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="启用状态">
            <Switch
              checked={formOverride.isActive}
              onChange={(checked) => setFormOverride({
                ...formOverride,
                isActive: checked
              })}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider />

      {/* 自定义标题 */}
      <Row gutter={[16, 0]} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Form.Item label="自定义标题">
            <Input
              placeholder="留空使用默认标题"
              value={formOverride.title || ''}
              onChange={(e) => setFormOverride({
                ...formOverride,
                title: e.target.value
              })}
              addonAfter={
                <Button
                  type="text"
                  
                  icon={<CopyOutlined />}
                  onClick={() => onCopyFromBase('title')}
                  title="复制基础标题"
                />
              }
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="自定义短标题">
            <Input
              placeholder="留空使用默认短标题"
              value={formOverride.shortTitle || ''}
              onChange={(e) => setFormOverride({
                ...formOverride,
                shortTitle: e.target.value
              })}
              addonAfter={
                <Button
                  type="text"
                  
                  icon={<CopyOutlined />}
                  onClick={() => onCopyFromBase('subtitle')}
                  title="复制基础短标题"
                />
              }
            />
          </Form.Item>
        </Col>
      </Row>

      {/* 自定义描述 */}
      <Form.Item label="自定义描述" style={{ marginBottom: 16 }}>
        <TextArea
          rows={3}
          placeholder="留空使用默认描述"
          value={formOverride.shortDescription || ''}
          onChange={(e) => setFormOverride({
            ...formOverride,
            shortDescription: e.target.value
          })}
        />
        <div style={{ textAlign: 'right', marginTop: 4 }}>
          <Button
            type="text"
            
            icon={<CopyOutlined />}
            onClick={() => onCopyFromBase('description')}
          >
            复制基础描述
          </Button>
        </div>
      </Form.Item>

      {/* 自定义图片 */}
      <Form.Item label="自定义图片">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Upload {...uploadProps} onChange={handleImageUpload}>
            <Button icon={<UploadOutlined />}>上传图片</Button>
          </Upload>

          {formOverride.customImages && formOverride.customImages.length > 0 && (
            <Row gutter={[8, 8]}>
              {formOverride.customImages.map((image, index) => (
                <Col span={6} key={image.id}>
                  <div style={{ position: 'relative' }}>
                    <Image
                      width="100%"
                      height={80}
                      src={image.url}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                    <Button
                      type="text"
                      
                      danger
                      icon={<DeleteOutlined />}
                      style={{ position: 'absolute', top: 4, right: 4 }}
                      onClick={() => handleDeleteImage(image.id)}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Space>
      </Form.Item>
    </Card>
  );
};

export default ChannelOverrideTab;