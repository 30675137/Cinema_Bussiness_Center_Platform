/**
 * 面包屑导航组件
 * 显示当前页面的导航路径，支持点击跳转和下拉菜单
 */

import React, { useState } from 'react';
import { Breadcrumb, Button, Tooltip, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  RightOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { BreadcrumbItem as NavigationBreadcrumbItem } from '@/types/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { logNavigationAction } from '@/services/navigationLogService';
import { NavigationAction } from '@/types/navigation';
import { useCurrentUser } from '@/stores/userStore';
import { cn } from '@/utils/cn';
import './styles.css';

/**
 * 面包屑组件Props接口
 */
export interface BreadcrumbProps {
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否显示首页图标 */
  showHome?: boolean;
  /** 首页路径 */
  homePath?: string;
  /** 最大显示项目数，超出显示下拉菜单 */
  maxItems?: number;
  /** 分隔符 */
  separator?: React.ReactNode;
  /** 是否显示路径简化 */
  showSimplified?: boolean;
  /** 面包屑数据（如果不提供则自动从路由生成） */
  items?: NavigationBreadcrumbItem[];
  /** 项目点击回调 */
  onItemClick?: (item: NavigationBreadcrumbItem, index: number) => void;
  /** 首页点击回调 */
  onHomeClick?: () => void;
  /** 主题模式 */
  theme?: 'light' | 'dark';
}

/**
 * 面包屑导航组件
 */
const BreadcrumbNavigation: React.FC<BreadcrumbProps> = ({
  className,
  style,
  showHome = true,
  homePath = '/',
  maxItems = 5,
  separator = <RightOutlined />,
  showSimplified = false,
  items,
  onItemClick,
  onHomeClick,
  theme = 'light'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const { activeMenu, menus, getMenuPath } = useNavigation();
  const currentUser = useCurrentUser();

  /**
   * 从路径生成面包屑
   */
  const generateBreadcrumbFromPath = (path: string, homePath: string): NavigationBreadcrumbItem[] => {
    if (path === homePath || path === '/') {
      return [];
    }

    const items: NavigationBreadcrumbItem[] = [];
    const pathParts = path.replace(/^\//, '').split('/').filter(Boolean);

    // 构建路径和标题映射
    const pathTitleMap: Record<string, string> = {
      'basic-settings': '基础设置',
      'product': '商品管理',
      'bom': 'BOM管理',
      'scenario-package': '场景包',
      'pricing': '价格体系',
      'procurement': '采购管理',
      'inventory': '库存管理',
      'scheduling': '排期管理',
      'order-management': '订单管理',
      'operations-reports': '运营报表',
      'system': '系统管理',
      'org': '组织管理',
      'unit': '单位管理',
      'dictionary': '字典管理',
      'permission': '权限管理',
      'approval': '审批流程',
      'spu': 'SPU管理',
      'sku': 'SKU管理',
      'attribute': '属性管理',
      'status': '状态管理',
      'content': '内容管理',
      'material': '素材管理',
      'channel': '渠道管理',
      'publish': '发布管理',
      'config': '配置管理',
      'cost': '成本管理',
      'version': '版本管理',
      'template': '模板管理',
      'resource': '资源管理',
      'addon': '加购管理',
      'rules': '规则管理',
      'supplier': '供应商管理',
      'purchase-order': '采购订单',
      'receiving': '收货管理',
      'transfer': '调拨管理',
      'ledger': '台账管理',
      'operation': '操作管理',
      'check': '盘点管理',
      'allocation': '分配管理',
      'hall': '影厅管理',
      'gantt': '甘特图',
      'calendar': '日历排期',
      'conflict': '冲突管理',
      'list': '订单列表',
      'confirm': '确认管理',
      'verification': '核销管理',
      'refund': '退款管理',
      'efficiency': '效率报表',
      'data-quality': '数据质量',
      'stock-accuracy': '库存准确',
      'sales-analysis': '销售分析',
      'resource-utilization': '资源利用',
      'summary': '汇总报表',
      'user': '用户管理',
      'audit': '审计日志',
      'import-export': '导入导出'
    };

    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === pathParts.length - 1;

      items.push({
        id: `path-${index}`,
        title: pathTitleMap[part] || part,
        path: currentPath,
        isCurrent: isLast,
        isClickable: !isLast
      });
    });

    return items;
  };

  // 生成面包屑数据
  const breadcrumbItems = React.useMemo(() => {
    if (items) {
      return items;
    }

    // 如果有活动菜单，从菜单生成面包屑
    if (activeMenu) {
      const menuPath = getMenuPath(activeMenu.id);
      return menuPath.map((menu, index) => ({
        id: menu.id,
        title: menu.name,
        path: menu.path,
        icon: menu.icon,
        isCurrent: index === menuPath.length - 1,
        isClickable: index < menuPath.length - 1
      } as NavigationBreadcrumbItem));
    }

    // 从当前路径生成面包屑
    return generateBreadcrumbFromPath(location.pathname, homePath);
  }, [items, activeMenu, menus, getMenuPath, location.pathname, homePath]);

  /**
   * 处理面包屑项目点击
   */
  const handleItemClick = async (item: NavigationBreadcrumbItem, index: number) => {
    if (!item.isClickable) return;

    try {
      if (onItemClick) {
        onItemClick(item, index);
      } else if (item.path) {
        navigate(item.path);
      }

      // 记录面包屑点击日志
      if (currentUser) {
        await logNavigationAction({
          userId: currentUser.id,
          action: NavigationAction.BREADCRUMB_CLICK,
          menuId: item.id,
          metadata: {
            path: item.path,
            title: item.title,
            breadcrumbIndex: index
          }
        });
      }
    } catch (error) {
      console.error('面包屑点击失败:', error);
    }
  };

  /**
   * 处理首页点击
   */
  const handleHomeClick = async () => {
    try {
      if (onHomeClick) {
        onHomeClick();
      } else {
        navigate(homePath);
      }

      // 记录首页点击日志
      if (currentUser) {
        await logNavigationAction({
          userId: currentUser.id,
          action: NavigationAction.BREADCRUMB_CLICK,
          menuId: 'home',
          metadata: {
            path: homePath,
            title: '首页',
            isHomeClick: true
          }
        });
      }
    } catch (error) {
      console.error('首页点击失败:', error);
    }
  };

  /**
   * 判断是否需要截断显示
   */
  const shouldTruncate = breadcrumbItems.length > maxItems;

  /**
   * 获取显示的面包屑项目
   */
  const getDisplayItems = () => {
    if (!shouldTruncate) {
      return breadcrumbItems;
    }

    if (expanded) {
      return breadcrumbItems;
    }

    // 显示第一个、最后一个和中间部分
    const items = [...breadcrumbItems];
    if (items.length > maxItems) {
      const keepCount = Math.floor(maxItems / 2);
      const firstItems = items.slice(0, keepCount);
      const lastItems = items.slice(-keepCount);

      return [
        ...firstItems,
        {
          id: 'ellipsis',
          title: '...',
          path: undefined,
          isCurrent: false,
          isClickable: false
        } as NavigationBreadcrumbItem,
        ...lastItems
      ];
    }

    return items;
  };

  /**
   * 生成下拉菜单项
   */
  const getDropdownItems = () => {
    if (!shouldTruncate || expanded) {
      return [];
    }

    const startIndex = Math.floor(maxItems / 2);
    const endIndex = breadcrumbItems.length - Math.floor(maxItems / 2);

    return breadcrumbItems
      .slice(startIndex, endIndex)
      .map((item, index) => ({
        key: item.id,
        label: item.title,
        disabled: !item.isClickable,
        onClick: () => handleItemClick(item, startIndex + index)
      }));
  };

  const displayItems = getDisplayItems();
  const dropdownItems = getDropdownItems();

  // 转换为Ant Design面包屑格式
  const antdBreadcrumbItems = [
    // 首页图标
    ...(showHome ? [{
      key: 'home',
      title: (
        <Tooltip title="返回首页">
          <Button
            type="text"
            size="small"
            icon={<HomeOutlined />}
            onClick={handleHomeClick}
            classNames={{
              root: "breadcrumb-home-button"
            }}
          />
        </Tooltip>
      )
    }] : []),
    // 面包屑项目
    ...displayItems.map((item, index) => ({
      key: item.id,
      title: item.isClickable ? (
        <Button
          type="link"
          size="small"
          onClick={() => handleItemClick(item, index)}
          classNames={{
            root: "breadcrumb-item-clickable"
          }}
        >
          {item.icon}
          {item.title}
        </Button>
      ) : (
        <span className="breadcrumb-item-current">
          {item.icon}
          {item.title}
        </span>
      )
    })),
    // 更多选项下拉菜单
    ...(dropdownItems.length > 0 ? [{
      key: 'more',
      title: (
        <Dropdown
          menu={{ items: dropdownItems }}
          trigger={['click']}
          placement="bottomLeft"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={() => setExpanded(!expanded)}
            classNames={{
              root: "breadcrumb-ellipsis-button"
            }}
          />
        </Dropdown>
      )
    }] : [])
  ];

  return (
    <div
      className={cn(
        'breadcrumb-navigation',
        theme === 'dark' ? 'breadcrumb-dark' : 'breadcrumb-light',
        className
      )}
      style={style}
    >
      <Breadcrumb
        items={antdBreadcrumbItems}
        separator={separator}
        className="breadcrumb-container"
      />

      {/* 简化路径显示 */}
      {showSimplified && breadcrumbItems.length > 2 && (
        <div className="breadcrumb-simplified">
          <Tooltip title={breadcrumbItems.map(item => item.title).join(' > ')}>
            <span className="simplified-path">
              {breadcrumbItems[0].title} ... {breadcrumbItems[breadcrumbItems.length - 1].title}
            </span>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default BreadcrumbNavigation;