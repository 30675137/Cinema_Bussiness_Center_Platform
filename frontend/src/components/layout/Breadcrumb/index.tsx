/**
 * 面包屑导航组件
 */

import React from 'react';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLayoutState } from '@/hooks/useLayoutState';
import './index.css';

/**
 * 面包屑导航组件
 */
const Breadcrumb: React.FC = () => {
  const navigate = useNavigate();
  const { breadcrumbs } = useLayoutState();

  /**
   * 处理面包屑点击事件
   */
  const handleBreadcrumbClick = (path: string) => {
    navigate(path);
  };

  /**
   * 渲染面包屑项目
   */
  const breadcrumbItems = [
    {
      title: (
        <span className="breadcrumb-home">
          <HomeOutlined />
          <span>首页</span>
        </span>
      ),
      onClick: () => handleBreadcrumbClick('/'),
    },
    ...breadcrumbs.map(item => ({
      title: item.current ? (
        <span className="breadcrumb-item breadcrumb-current">{item.title}</span>
      ) : (
        <span className="breadcrumb-item breadcrumb-link">{item.title}</span>
      ),
      onClick: item.current ? undefined : () => handleBreadcrumbClick(item.path),
    })),
  ];

  return (
    <div className="breadcrumb-container">
      <AntdBreadcrumb separator="/" items={breadcrumbItems} />
    </div>
  );
};

export default Breadcrumb;