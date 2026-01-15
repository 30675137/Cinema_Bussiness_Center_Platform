/**
 * ImageUploader 组件
 * 图片上传组件
 * Feature: 001-scenario-package-tabs
 */

import React, { useState } from 'react';
import { Upload, Button, Space, Image, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface ImageUploaderProps {
  /** 图片URL */
  value?: string;
  /** 值变化回调 */
  onChange?: (value: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 最大文件大小（MB） */
  maxSize?: number;
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
}

/**
 * 图片上传组件
 *
 * 支持：
 * 1. 上传图片到服务器
 * 2. 预览已上传图片
 * 3. 删除图片
 *
 * @example
 * <ImageUploader
 *   value={imageUrl}
 *   onChange={(url) => setImageUrl(url)}
 * />
 */
const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  disabled = false,
  maxSize = 5,
  width = 200,
  height = 150,
}) => {
  const [uploading, setUploading] = useState(false);

  // 上传前校验
  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }

    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`图片大小不能超过 ${maxSize}MB`);
      return false;
    }

    return true;
  };

  // 自定义上传
  const customUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      setUploading(true);

      // TODO: 实际项目中应该上传到 Supabase Storage 或其他存储服务
      // 这里使用模拟 URL
      const mockUrl = URL.createObjectURL(file as Blob);

      // 模拟上传延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onChange?.(mockUrl);
      onSuccess?.(mockUrl);
      message.success('上传成功');
    } catch (error) {
      onError?.(error as Error);
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除图片
  const handleRemove = () => {
    onChange?.('');
  };

  // 有图片时显示预览
  if (value) {
    return (
      <Space direction="vertical">
        <Image
          src={value}
          width={width}
          height={height}
          style={{
            objectFit: 'cover',
            borderRadius: 8,
            border: '1px solid #d9d9d9',
          }}
          alt="场景包主图"
        />
        {!disabled && (
          <Space>
            <Upload
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={customUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploading} size="small">
                更换
              </Button>
            </Upload>
            <Button icon={<DeleteOutlined />} onClick={handleRemove} size="small" danger>
              删除
            </Button>
          </Space>
        )}
      </Space>
    );
  }

  // 无图片时显示上传按钮
  return (
    <Upload
      showUploadList={false}
      beforeUpload={beforeUpload}
      customRequest={customUpload}
      accept="image/*"
      disabled={disabled}
    >
      <div
        style={{
          width,
          height,
          border: '1px dashed #d9d9d9',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#f5f5f5' : '#fafafa',
        }}
      >
        <UploadOutlined style={{ fontSize: 24, color: '#999' }} />
        <div style={{ marginTop: 8, color: '#666' }}>{uploading ? '上传中...' : '点击上传'}</div>
        <div style={{ fontSize: 12, color: '#999' }}>支持 JPG、PNG，最大 {maxSize}MB</div>
      </div>
    </Upload>
  );
};

export default ImageUploader;
