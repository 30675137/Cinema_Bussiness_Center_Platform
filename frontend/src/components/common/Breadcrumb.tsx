import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { useNavigate } from 'react-router';

interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  style?: React.CSSProperties;
  separator?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className, style, separator = '/' }) => {
  const navigate = useNavigate();

  const breadcrumbItems = items?.map((item, index) => {
    const isLast = index === (items?.length || 0) - 1;

    const itemProps: any = {
      key: item.path || item.title,
      title: (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: item.path && !isLast ? 'pointer' : 'default',
          }}
        >
          {item.icon}
          {item.title}
        </span>
      ),
    };

    // 只有不是最后一项且有路径时才可点击
    if (item.path && !isLast) {
      itemProps.onClick = () => {
        navigate(item.path);
      };
    }

    return itemProps;
  });

  return (
    <AntBreadcrumb
      items={breadcrumbItems}
      className={className}
      style={{
        marginBottom: '16px',
        ...style,
      }}
      separator={separator}
    />
  );
};

export default Breadcrumb;
