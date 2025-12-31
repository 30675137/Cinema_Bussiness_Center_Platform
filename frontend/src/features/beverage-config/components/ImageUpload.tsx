/**
 * @spec O003-beverage-order
 * 饮品图片上传组件 (User Story 3 - FR-029)
 */

import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { uploadBeverageImage } from '../services/beverageAdminApi';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  maxSize?: number; // MB
}

/**
 * 单张图片上传组件
 * 用于饮品主图上传
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, maxSize = 5 }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(value);

  const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      setLoading(false);
      const url = info.file.response as string;
      setImageUrl(url);
      onChange?.(url);
    }
    if (info.file.status === 'error') {
      setLoading(false);
      message.error('图片上传失败');
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`图片大小不能超过 ${maxSize}MB！`);
      return false;
    }

    return true;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      const url = await uploadBeverageImage(file as File);
      onSuccess?.(url);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <Upload
      name="image"
      listType="picture-card"
      className="beverage-image-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      customRequest={customRequest}
    >
      {imageUrl ? <img src={imageUrl} alt="beverage" style={{ width: '100%' }} /> : uploadButton}
    </Upload>
  );
};

interface MultiImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  maxSize?: number; // MB
}

/**
 * 多张图片上传组件
 * 用于饮品详情图上传
 */
export const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  value = [],
  onChange,
  maxCount = 5,
  maxSize = 5,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(
    value.map((url, index) => ({
      uid: `${index}`,
      name: `image-${index}`,
      status: 'done',
      url,
    }))
  );

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // 提取所有已上传成功的图片URL
    const urls = newFileList
      .filter((file) => file.status === 'done')
      .map((file) => file.url || file.response)
      .filter(Boolean) as string[];

    onChange?.(urls);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`图片大小不能超过 ${maxSize}MB！`);
      return false;
    }

    return true;
  };

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;

    try {
      const url = await uploadBeverageImage(file as File);
      onSuccess?.(url);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      customRequest={customRequest}
      maxCount={maxCount}
    >
      {fileList.length >= maxCount ? null : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传图片</div>
        </div>
      )}
    </Upload>
  );
};
