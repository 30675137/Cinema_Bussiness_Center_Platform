/**
 * 面包屑导航组件
 */

import React from 'react';
import { Breadcrumb as AntdBreadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLayoutState } from '@/hooks/useLayoutState';
import BreadcrumbItem from './BreadcrumbItem';
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
      path: '/',
      current: false,
    },
    ...breadcrumbs.map(item => ({
      title: item.title,
      path: item.path,
      current: item.current,
    })),
  ];

  return (
    <div className="breadcrumb-container">
      <AntdBreadcrumb separator="/">
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem
            key={index}
            title={item.title}
            path={item.path}
            current={item.current}
            onClick={handleBreadcrumbClick}
          />
        ))}
      </AntdBreadcrumb>
    </div>
  );
};

export default Breadcrumb;