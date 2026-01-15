/**
 * @spec O005-channel-product-config
 * Channel Product Image Upload Component
 *
 * Uploads images directly to Supabase Storage via backend API
 * and stores only the URL in the form data (not base64)
 */

import React, { useState } from 'react';
import { Upload, message, Image, Spin } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { uploadChannelProductImage } from '../services/channelProductService';

const DEFAULT_MAX_SIZE = 5; // 5MB
const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';

export interface ChannelProductImageUploadProps {
  value?: string;
  onChange?: (url: string | undefined) => void;
  disabled?: boolean;
  maxSize?: number; // MB
  accept?: string;
}

export const ChannelProductImageUpload: React.FC<ChannelProductImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  maxSize = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);

  const validateFile = (file: File): boolean => {
    const isValidType = accept.split(',').some((type) => file.type === type.trim());
    if (!isValidType) {
      message.error(`仅支持 ${accept.replace(/image\//g, '').toUpperCase()} 格式`);
      return false;
    }

    const isValidSize = file.size / 1024 / 1024 < maxSize;
    if (!isValidSize) {
      message.error(`图片大小不能超过 ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleUpload = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setLoading(true);

    try {
      // 直接上传到 Supabase Storage
      const publicUrl = await uploadChannelProductImage(file);

      setPreviewUrl(publicUrl);
      onChange?.(publicUrl);
      message.success('图片上传成功');
    } catch (error) {
      console.error('图片上传失败:', error);
      message.error('图片上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    listType: 'picture-card',
    className: 'channel-product-image-uploader',
    showUploadList: false,
    beforeUpload: (file) => {
      handleUpload(file);
      return false; // 阻止默认上传行为
    },
    disabled: disabled || loading,
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <div>
      <Upload {...uploadProps}>
        {previewUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Image
              src={previewUrl}
              alt="商品主图"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              preview={false}
            />
            {loading && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              >
                <Spin />
              </div>
            )}
          </div>
        ) : (
          uploadButton
        )}
      </Upload>
      <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
        支持 JPG、PNG、WebP 格式，最大 {maxSize}MB
      </div>
    </div>
  );
};
