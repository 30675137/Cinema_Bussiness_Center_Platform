/**
 * 类目详情面包屑导航组件
 * 显示当前类目的层级路径，支持导航到父级类目
 */

import React from 'react';
import Breadcrumb from '../../../../components/common/Breadcrumb';
import { HomeOutlined } from '@ant-design/icons';

interface CategoryBreadcrumbProps {
  categoryId?: string;
  categoryName?: string;
  className?: string;
  style?: React.CSSProperties;
}

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
  categoryId,
  categoryName,
  className,
  style,
}) => {
  // 构建面包屑路径
  const breadcrumbItems = [
    {
      title: '首页',
      path: '/',
      icon: <HomeOutlined />,
    },
    {
      title: '基础设置与主数据',
      path: '/mdm-pim',
    },
    {
      title: '商品管理 (MDM/PIM)',
      path: '/mdm-pim/category',
    },
  ];

  // 如果有选中的类目，添加类目详情
  if (categoryId && categoryName) {
    breadcrumbItems.push({
      title: `类目详情 - ${categoryName}`,
    });
  } else if (categoryId) {
    breadcrumbItems.push({
      title: '类目详情',
    });
  } else {
    breadcrumbItems.push({
      title: '类目管理',
    });
  }

  return <Breadcrumb items={breadcrumbItems} className={className} style={style} />;
};

export default CategoryBreadcrumb;
