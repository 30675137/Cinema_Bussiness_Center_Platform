import React, { useState } from 'react';
import {
  Form,
  Input,
  Upload,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Card,
  Image,
  message,
  Divider,
  Tag
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  PictureOutlined
} from '@ant-design/icons';
import type { Control, FieldErrors, FieldValues } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { UploadFile, UploadProps } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ContentTabProps {
  control: Control<any>;
  errors: FieldErrors<FieldValues>;
  touched: Record<string, boolean>;
}

interface ProductImageItem {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
  type: 'main' | 'gallery' | 'detail';
}

const ContentTab: React.FC<ContentTabProps> = ({
  control,
  errors,
  touched
}) => {
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage
  } = useFieldArray({
    control,
    name: 'content.images'
  });

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
      return false; // 阻止自动上传
    },
    onChange: (info) => {
      if (info.file.status === 'done' || info.file.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: ProductImageItem = {
            id: Date.now().toString(),
            url: e.target?.result as string,
            alt: '',
            sortOrder: imageFields.length,
            type: imageFields.length === 0 ? 'main' : 'gallery'
          };
          appendImage(newImage);
        };
        reader.readAsDataURL(info.file.originFileObj);
      }
    }
  };

  // 更新图片信息
  const updateImage = (index: number, field: keyof ProductImageItem, value: any) => {
    const images = control.getValues('content.images') || [];
    images[index] = { ...images[index], [field]: value };
    control.setValue('content.images', images);
  };

  // 设置主图
  const setMainImage = (index: number) => {
    const images = control.getValues('content.images') || [];
    images.forEach((img: ProductImageItem, i: number) => {
      img.type = i === index ? 'main' : 'gallery';
    });
    control.setValue('content.images', images);
  };

  // 删除图片
  const handleDeleteImage = (index: number) => {
    if (imageFields.length <= 1) {
      message.error('至少需要保留一张图片');
      return;
    }
    removeImage(index);
  };

  // 预览图片
  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  return (
    <div className="content-tab">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 基础内容 */}
        <div>
          <Title level={4} style={{ marginBottom: 16 }}>
            展示内容
          </Title>
          <Row gutter={[16, 0]}>
            <Col span={12}>
              <Form.Item
                label="展示标题"
                required
                validateStatus={errors['content.title'] ? 'error' : undefined}
                help={errors['content.title']?.message as string}
              >
                <Input
                  placeholder="请输入商品展示标题"
                  {...control.register('content.title')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="副标题"
                validateStatus={errors['content.subtitle'] ? 'error' : undefined}
                help={errors['content.subtitle']?.message as string}
              >
                <Input
                  placeholder="请输入副标题（可选）"
                  {...control.register('content.subtitle')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="详细描述"
            validateStatus={errors['content.description'] ? 'error' : undefined}
            help={errors['content.description']?.message as string}
          >
            <TextArea
              rows={4}
              placeholder="请输入商品详细描述（可选）"
              {...control.register('content.description')}
            />
          </Form.Item>
        </div>

        <Divider />

        {/* 图片管理 */}
        <div>
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              商品图片
            </Title>
            <Upload {...uploadProps}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                
              >
                上传图片
              </Button>
            </Upload>
          </div>

          {imageFields.length === 0 ? (
            <Card
              style={{ textAlign: 'center', padding: '40px 0' }}
              bodyStyle={{ borderStyle: 'dashed' }}
            >
              <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">暂无图片</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  请上传商品图片，第一张将作为主图
                </Text>
              </div>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {imageFields.map((field, index) => (
                <Col span={8} key={field.id}>
                  <Card
                    
                    title={
                      <Space>
                        <span>图片 {index + 1}</span>
                        {control.getValues(`content.images.${index}.type`) === 'main' && (
                          <Tag color="blue">主图</Tag>
                        )}
                      </Space>
                    }
                    extra={
                      <Space>
                        {index > 0 && (
                          <Button
                            type="text"
                            
                            onClick={() => setMainImage(index)}
                          >
                            设为主图
                          </Button>
                        )}
                        <Button
                          type="text"
                          
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteImage(index)}
                        />
                      </Space>
                    }
                  >
                    <div style={{ marginBottom: 12 }}>
                      <Image
                        width="100%"
                        height={120}
                        src={field.url}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        preview={{
                          mask: <EyeOutlined />
                        }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8O+L"
                      />
                    </div>

                    <Form.Item
                      label="图片说明"
                      style={{ marginBottom: 8 }}
                    >
                      <Input
                        
                        placeholder="请输入图片说明"
                        value={control.getValues(`content.images.${index}.alt`) || ''}
                        onChange={(e) => updateImage(index, 'alt', e.target.value)}
                      />
                    </Form.Item>

                    <Form.Item
                      label="排序"
                      style={{ marginBottom: 8 }}
                    >
                      <Input
                        
                        type="number"
                        placeholder="排序值"
                        value={control.getValues(`content.images.${index}.sortOrder`) || 0}
                        onChange={(e) => updateImage(index, 'sortOrder', parseInt(e.target.value) || 0)}
                      />
                    </Form.Item>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {imageFields.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                * 第一张图片将作为商品主图，支持 JPG/PNG 格式，大小不超过 2MB
              </Text>
            </div>
          )}
        </div>

        <Divider />

        {/* 营销标签（预留） */}
        <div>
          <Title level={4} style={{ marginBottom: 16 }}>
            营销标签
          </Title>
          <Card  style={{ backgroundColor: '#fafafa' }}>
            <Text type="secondary">营销标签功能开发中...</Text>
          </Card>
        </div>
      </Space>

      {/* 图片预览模态框 */}
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewVisible,
          src: previewImage,
          onVisibleChange: (visible) => setPreviewVisible(visible)
        }}
      />
    </div>
  );
};

export default ContentTab;