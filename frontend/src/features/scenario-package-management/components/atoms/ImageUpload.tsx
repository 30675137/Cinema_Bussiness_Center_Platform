/**
 * 图片上传组件
 *
 * 支持预签名 URL 上传，文件类型和大小验证
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import React, { useState } from 'react';
import { Upload, Button, message, Image, Spin } from 'antd';
import { UploadOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import packageService from '../../services/packageService';

interface ImageUploadProps {
  /** 场景包 ID（用于关联上传） */
  packageId?: string;
  /** 当前图片 URL */
  value?: string;
  /** 值变更回调 */
  onChange?: (url: string | undefined) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 最大文件大小（MB） */
  maxSize?: number;
  /** 允许的文件类型 */
  accept?: string;
}

/** 默认允许的文件类型 */
const DEFAULT_ACCEPT = '.jpg,.jpeg,.png,.webp';

/** 默认最大文件大小（5MB） */
const DEFAULT_MAX_SIZE = 5;

/**
 * 图片上传组件
 *
 * 支持两种模式：
 * 1. 有 packageId：使用预签名 URL 上传到 Supabase Storage
 * 2. 无 packageId：仅本地预览，等待表单提交时再上传
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  packageId,
  value,
  onChange,
  disabled = false,
  maxSize = DEFAULT_MAX_SIZE,
  accept = DEFAULT_ACCEPT,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);

  /**
   * 验证文件
   */
  const validateFile = (file: File): boolean => {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('仅支持 JPG/PNG/WebP 格式');
      return false;
    }

    // 检查文件大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      message.error(`文件大小不能超过 ${maxSize}MB`);
      return false;
    }

    return true;
  };

  /**
   * 处理文件上传
   */
  const handleUpload = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setLoading(true);

    try {
      if (packageId) {
        // 模式 1：使用预签名 URL 上传
        const publicUrl = await packageService.uploadBackgroundImage(packageId, file);
        setPreviewUrl(publicUrl);
        onChange?.(publicUrl);
        message.success('图片上传成功');
      } else {
        // 模式 2：本地预览（创建时使用）
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        // 对于新建场景包，暂时存储 base64 或等待后续处理
        const reader = new FileReader();
        reader.onload = () => {
          // 存储 base64 供后续使用
          onChange?.(reader.result as string);
        };
        reader.readAsDataURL(file);
        message.info('图片已选择，保存后将上传');
      }
    } catch (error: any) {
      message.error(`图片上传失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除图片
   */
  const handleRemove = () => {
    setPreviewUrl(undefined);
    onChange?.(undefined);
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept,
    showUploadList: false,
    beforeUpload: (file) => {
      handleUpload(file);
      return false; // 阻止默认上传行为
    },
  };

  return (
    <div className="image-upload-container">
      {previewUrl ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image
            src={previewUrl}
            alt="背景图片预览"
            style={{
              maxWidth: 400,
              maxHeight: 300,
              objectFit: 'cover',
              borderRadius: 8,
            }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9teleih69/rqvK+3xf+4MH8HA=="
          />
          {!disabled && (
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              删除
            </Button>
          )}
        </div>
      ) : (
        <Upload {...uploadProps} disabled={disabled || loading}>
          <Button
            icon={loading ? <LoadingOutlined /> : <UploadOutlined />}
            loading={loading}
            disabled={disabled}
          >
            {loading ? '上传中...' : '上传背景图片'}
          </Button>
        </Upload>
      )}

      {loading && (
        <div style={{ marginTop: 8 }}>
          <Spin size="small" />
          <span style={{ marginLeft: 8, color: '#999' }}>正在上传...</span>
        </div>
      )}

      <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
        支持 JPG、PNG、WebP 格式，最大 {maxSize}MB
      </div>
    </div>
  );
};

export default ImageUpload;
