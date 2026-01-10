import React, { useState, useRef, useEffect } from 'react';
import { Upload, Button, Image, Progress, message, Modal, Space, Typography, Spin } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { BrandLogoProps } from '../../types/brand.types';
import { VALIDATION_RULES } from '../../types/brand.types';

const { Text, Title } = Typography;

/**
 * BrandLogoUpload 组件属性
 */
interface BrandLogoUploadProps {
  currentLogoUrl?: string;
  mode?: 'create' | 'edit';
  onUpload?: (file: File) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * 品牌Logo上传分子组件
 * 支持拖拽上传、文件预览、删除等功能
 */
const BrandLogoUpload: React.FC<BrandLogoUploadProps> = ({
  currentLogoUrl,
  mode = 'create',
  onUpload,
  loading = false,
  disabled = false,
}) => {
  const [uploadState, setUploadState] = useState<{
    file: File | null;
    previewUrl: string | null;
    progress: number;
    uploading: boolean;
    error: string | null;
  }>({
    file: null,
    previewUrl: currentLogoUrl || null,
    progress: 0,
    uploading: false,
    error: null,
  });

  const [previewVisible, setPreviewVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // @spec B001-fix-brand-creation - 组件卸载时清理 blob URL 防止内存泄漏
  useEffect(() => {
    return () => {
      if (uploadState.previewUrl && uploadState.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(uploadState.previewUrl);
      }
    };
  }, [uploadState.previewUrl]);

  // 验证文件
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // 文件大小检查
    if (file.size > VALIDATION_RULES.LOGO_MAX_SIZE) {
      return {
        valid: false,
        error: `文件大小超过 ${VALIDATION_RULES.LOGO_MAX_SIZE / 1024 / 1024}MB 限制`,
      };
    }

    // 文件类型检查
    const allowedTypes = VALIDATION_RULES.ALLOWED_LOGO_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `不支持的文件格式，请上传 ${VALIDATION_RULES.ALLOWED_LOGO_EXTENSIONS.join(', ')} 文件`,
      };
    }

    // 文件扩展名检查
    const fileName = file.name.toLowerCase();
    const hasValidExtension = VALIDATION_RULES.ALLOWED_LOGO_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext)
    );
    if (!hasValidExtension) {
      return {
        valid: false,
        error: '文件扩展名不正确，请选择有效的图片文件',
      };
    }

    return { valid: true };
  };

  // 处理文件选择
  const handleFileSelect = async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      message.error(validation.error!);
      return;
    }

    // 清理之前的预览 URL（如果存在且是 blob URL）
    if (uploadState.previewUrl && uploadState.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }

    // 创建预览URL
    const previewUrl = URL.createObjectURL(file);

    setUploadState({
      file,
      previewUrl,
      progress: 0,
      uploading: true,
      error: null,
    });

    try {
      // 调用上传回调
      if (onUpload) {
        await onUpload(file);
      }

      // 上传成功 - 保留 previewUrl 用于显示预览
      // 不在这里 revoke URL，让它在组件卸载或选择新文件时清理
      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        progress: 100,
        // 保留当前的 previewUrl 以便继续显示预览
      }));

      // 注意：不再立即调用 URL.revokeObjectURL(previewUrl)
      // 预览 URL 会在选择新文件时自动清理（见 confirmDelete 和下次 handleFileSelect）

      // @spec B001-fix-brand-creation - 不在这里显示成功消息
      // 成功消息由 BrandDrawer 在适当时机显示（创建后或编辑时上传成功后）
    } catch (error) {
      console.error('Logo上传失败:', error);

      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        error: '上传失败，请重试',
      }));

      message.error('Logo上传失败，请重试');
    }
  };

  // 处理拖拽上传
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || uploadState.uploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      await handleFileSelect(imageFiles[0]);
    }
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理点击上传
  const handleUploadClick = () => {
    if (disabled || uploadState.uploading) return;
    fileInputRef.current?.click();
  };

  // 处理文件输入变化
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    // 清空input值，允许重复选择相同文件
    e.target.value = '';
  };

  // 删除Logo
  const handleDelete = () => {
    setDeleteConfirmVisible(true);
  };

  // 确认删除
  const confirmDelete = () => {
    if (uploadState.previewUrl && uploadState.file) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }

    setUploadState({
      file: null,
      previewUrl: null,
      progress: 0,
      uploading: false,
      error: null,
    });

    setDeleteConfirmVisible(false);
    message.success('Logo已删除');
  };

  // 取消删除
  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
  };

  // 重试上传
  const handleRetry = () => {
    if (uploadState.file) {
      handleFileSelect(uploadState.file);
    }
  };

  // 渲染上传区域
  const renderUploadArea = () => {
    return (
      <div
        className={`brand-logo-upload-area ${disabled ? 'disabled' : ''} ${uploadState.uploading ? 'uploading' : ''}`}
        onClick={handleUploadClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: `2px dashed ${uploadState.error ? '#ff4d4f' : '#d9d9d9'}`,
          borderRadius: 8,
          padding: 40,
          textAlign: 'center',
          cursor: disabled || uploadState.uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          backgroundColor: uploadState.error ? '#fff2f0' : '#fafafa',
        }}
        data-testid="logo-upload-area"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={VALIDATION_RULES.ALLOWED_LOGO_TYPES.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
          data-testid="logo-file-input"
        />

        {uploadState.uploading ? (
          <div data-testid="logo-uploading">
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text strong>正在上传...</Text>
              <Progress
                percent={uploadState.progress}
                style={{ width: 200, marginTop: 8 }}
                data-testid="logo-progress-bar"
              />
            </div>
          </div>
        ) : (
          <>
            <CloudUploadOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <div style={{ marginTop: 16 }}>
              <Text strong style={{ fontSize: 16 }}>
                {mode === 'create' ? '上传品牌Logo' : '更换品牌Logo'}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" data-testid="logo-upload-hint">
                  点击或拖拽文件到此区域上传
                  <br />
                  支持 {VALIDATION_RULES.ALLOWED_LOGO_EXTENSIONS.join(', ')} 格式， 文件大小不超过{' '}
                  {VALIDATION_RULES.LOGO_MAX_SIZE / 1024 / 1024}MB
                </Text>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // 渲染预览区域
  const renderPreview = () => {
    return (
      <div className="brand-logo-preview">
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: 16,
            }}
          >
            <Image
              src={uploadState.previewUrl!}
              alt="品牌Logo预览"
              width={120}
              height={120}
              style={{
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid #d9d9d9',
              }}
              preview={{
                visible: previewVisible,
                onVisibleChange: (visible) => {
                  setPreviewVisible(visible);
                },
              }}
              data-testid="logo-preview-image"
            />

            {!disabled && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                }}
              >
                <Space>
                  <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setPreviewVisible(true)}
                    data-testid="logo-preview-button"
                  />
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    data-testid="logo-delete-button"
                  />
                </Space>
              </div>
            )}
          </div>

          <div>
            <Text strong>{mode === 'create' ? 'Logo预览' : '当前Logo'}</Text>
            {uploadState.file && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {uploadState.file.name}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 渲染错误状态
  const renderError = () => {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Text type="danger" strong data-testid="logo-upload-error">
          {uploadState.error}
        </Text>
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRetry}
            data-testid="logo-retry-button"
          >
            重新上传
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="brand-logo-upload" data-testid="brand-logo-upload">
      <Title level={5} style={{ marginBottom: 16 }}>
        {mode === 'create' ? '品牌Logo' : '更换Logo'}
        <Text type="secondary" style={{ marginLeft: 8, fontWeight: 'normal' }}>
          （可选）
        </Text>
      </Title>

      {uploadState.error
        ? renderError()
        : uploadState.previewUrl
          ? renderPreview()
          : renderUploadArea()}

      {/* 删除确认对话框 */}
      <Modal
        title="确定要删除品牌LOGO吗？"
        open={deleteConfirmVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="确定删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        data-testid="logo-delete-confirm"
      >
        <p>删除后需要重新上传新的Logo文件。</p>
      </Modal>

      {/* 图片预览模态框 */}
      <Modal
        open={previewVisible}
        title="Logo预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
        data-testid="logo-preview-modal"
      >
        <div style={{ textAlign: 'center' }}>
          <Image
            src={uploadState.previewUrl!}
            alt="Logo全尺寸预览"
            style={{ maxWidth: '100%' }}
            preview={false}
          />
        </div>
      </Modal>
    </div>
  );
};

export default BrandLogoUpload;
