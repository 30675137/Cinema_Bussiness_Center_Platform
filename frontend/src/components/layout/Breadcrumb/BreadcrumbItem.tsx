/**
 * 面包屑项目组件
 */

import React from 'react';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import './BreadcrumbItem.css';

interface BreadcrumbItemProps {
  /** 面包屑标题 */
  title: React.ReactNode;
  /** 导航路径 */
  path: string;
  /** 是否为当前页面 */
  current: boolean;
  /** 点击事件处理 */
  onClick: (path: string) => void;
}

/**
 * 面包屑项目组件
 */
const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  title,
  path,
  current,
  onClick,
}) => {
  /**
   * 处理点击事件
   */
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!current) {
      onClick(path);
    }
  };

  /**
   * 渲染内容
   */
  const content = current ? (
    <span className="breadcrumb-item breadcrumb-current">{title}</span>
  ) : (
    <a
      href={path}
      className="breadcrumb-item breadcrumb-link"
      onClick={handleClick}
    >
      {title}
    </a>
  );

  return (
    <AntdBreadcrumb.Item className="breadcrumb-wrapper">
      {content}
    </AntdBreadcrumb.Item>
  );
};

export default BreadcrumbItem;