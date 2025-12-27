import React from 'react';
import { Avatar, Image } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import type { BrandLogoProps } from '../../types/brand.types';

/**
 * 品牌LOGO原子组件
 * 用于显示品牌LOGO图片，支持不同尺寸和占位符
 */
const BrandLogo: React.FC<BrandLogoProps> = ({
  src,
  alt = '品牌LOGO',
  size = 'medium',
  className
}) => {
  // 根据size设置尺寸
  const getAvatarSize = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return 32;
      case 'medium':
        return 48;
      case 'large':
        return 64;
      default:
        return 48;
    }
  };

  const avatarSize = getAvatarSize(size);

  // 如果没有图片URL，显示默认占位符
  if (!src) {
    return (
      <Avatar
        size={avatarSize}
        icon={<PictureOutlined />}
        className={`brand-logo-placeholder brand-logo-${size} ${className || ''}`}
        data-testid="brand-logo-placeholder"
        alt={alt}
      />
    );
  }

  return (
    <div className={`brand-logo-wrapper brand-logo-${size} ${className || ''}`}>
      <Avatar
        size={avatarSize}
        src={
          <Image
            src={src}
            alt={alt}
            preview={false}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZGIiBzdHJva2U9IiNFN0U3RTciLz4KPHBhdGggZD0iTTEyIDE2VjI0SDE2VjE2SDEyWiIgc3Ryb2tlPSIjRTdFN0U3IiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTI0IDEySDI4VjE2SDE2VjEySDI0WiIgc3Ryb2tlPSIjRTdFN0U3IiBzdHJva2Utd2lkdGg9IjIiLz4KPC9zdmc+"
          />
        }
        className={`brand-logo brand-logo-${size} ${className || ''}`}
        data-testid="brand-logo"
        alt={alt}
      />
    </div>
  );
};

export default BrandLogo;