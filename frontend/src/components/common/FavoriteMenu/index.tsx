/**
 * 收藏菜单组件
 * 显示用户收藏的菜单项，支持快速访问和收藏管理
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, List, Tooltip, Button, Empty, Dropdown, Space, Typography } from 'antd';
import {
  StarOutlined,
  StarFilled,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNavigation } from '@/hooks/useNavigation';
import { MenuItem } from '@/types/navigation';
import FavoriteItem from './FavoriteItem';
import './index.css';

const { Title, Text } = Typography;

/**
 * 收藏菜单组件属性接口
 */
export interface FavoriteMenuProps {
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  /** 是否支持拖拽排序 */
  draggable?: boolean;
  /** 最大显示数量 */
  maxItems?: number;
  /** 布局模式 */
  layout?: 'grid' | 'list';
  /** 网格列数 */
  gridCols?: number;
  /** 自定义样式类名 */
  className?: string;
  /** 收藏项点击回调 */
  onItemClick?: (item: MenuItem) => void;
  /** 收藏管理回调 */
  onManage?: (action: 'add' | 'remove' | 'edit' | 'reorder', item?: MenuItem) => void;
}

/**
 * 收藏菜单组件
 */
const FavoriteMenu: React.FC<FavoriteMenuProps> = ({
  showTitle = true,
  showActions = true,
  draggable = false,
  maxItems = 8,
  layout = 'grid',
  gridCols = 4,
  className = '',
  onItemClick,
  onManage,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);

  const { getFavorites, addToFavorites, removeFromFavorites, isFavorite } = useUserPreferences();
  const { navigateToMenuItem } = useNavigation();

  const favoriteMenuIds = getFavorites();

  /**
   * 获取收藏菜单项列表
   */
  const getFavoriteMenuItems = useCallback((): MenuItem[] => {
    // 这里应该从navigation store或service获取完整的菜单项信息
    // 暂时使用mock数据
    const mockFavorites: MenuItem[] = favoriteMenuIds.slice(0, maxItems).map((id, index) => ({
      id,
      title: `收藏菜单 ${index + 1}`,
      path: `/favorite/${id}`,
      icon: 'star',
      children: [],
      level: 1,
      parentId: null,
      isExpanded: false,
      isActive: false,
      isFavorite: true,
      functionalArea: 'general' as const,
      permissions: [],
      badge: undefined,
      description: `收藏的菜单项 ${id}`,
    }));

    return mockFavorites;
  }, [favoriteMenuIds, maxItems]);

  const favoriteItems = getFavoriteMenuItems();

  /**
   * 处理收藏项点击
   */
  const handleItemClick = useCallback((item: MenuItem) => {
    navigateToMenuItem(item);
    onItemClick?.(item);
  }, [navigateToMenuItem, onItemClick]);

  /**
   * 处理添加收藏
   */
  const handleAddFavorite = useCallback((item: MenuItem) => {
    addToFavorites(item.id);
    onManage?.('add', item);
  }, [addToFavorites, onManage]);

  /**
   * 处理移除收藏
   */
  const handleRemoveFavorite = useCallback((item: MenuItem) => {
    removeFromFavorites(item.id);
    onManage?.('remove', item);
  }, [removeFromFavorites, onManage]);

  /**
   * 处理编辑收藏
   */
  const handleEditFavorite = useCallback((item: MenuItem) => {
    onManage?.('edit', item);
  }, [onManage]);

  /**
   * 处理拖拽开始
   */
  const handleDragStart = useCallback((item: MenuItem) => {
    setDraggedItem(item);
  }, []);

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
  }, []);

  /**
   * 处理拖拽放置
   */
  const handleDrop = useCallback((targetItem: MenuItem) => {
    if (draggedItem && draggedItem.id !== targetItem.id) {
      // 这里应该实现重新排序逻辑
      onManage?.('reorder', draggedItem);
    }
    setDraggedItem(null);
  }, [draggedItem, onManage]);

  /**
   * 获取操作菜单
   */
  const getActionMenu = (item: MenuItem) => {
    const items = [
      {
        key: 'remove',
        label: '取消收藏',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleRemoveFavorite(item),
      },
    ];

    if (showActions) {
      items.unshift({
        key: 'edit',
        label: '编辑',
        icon: <EditOutlined />,
        onClick: () => handleEditFavorite(item),
      });
    }

    return { items };
  };

  /**
   * 渲染收藏项列表
   */
  const renderFavoriteItems = () => {
    if (favoriteItems.length === 0) {
      return (
        <div className="favorite-empty">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无收藏菜单"
            className="favorite-empty-content"
          >
            {showActions && (
              <Button type="primary" icon={<PlusOutlined />}>
                添加收藏
              </Button>
            )}
          </Empty>
        </div>
      );
    }

    if (layout === 'list') {
      return (
        <List
          className="favorite-list"
          dataSource={favoriteItems}
          renderItem={(item) => (
            <FavoriteItem
              key={item.id}
              item={item}
              draggable={draggable}
              isEditing={isEditing}
              onClick={() => handleItemClick(item)}
              onEdit={() => handleEditFavorite(item)}
              onRemove={() => handleRemoveFavorite(item)}
              onDragStart={() => handleDragStart(item)}
              onDragEnd={handleDragEnd}
              onDrop={() => handleDrop(item)}
            />
          )}
        />
      );
    }

    // Grid布局
    return (
      <div
        className="favorite-grid"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        }}
      >
        {favoriteItems.map((item) => (
          <FavoriteItem
            key={item.id}
            item={item}
            draggable={draggable}
            isEditing={isEditing}
            layout="card"
            onClick={() => handleItemClick(item)}
            onEdit={() => handleEditFavorite(item)}
            onRemove={() => handleRemoveFavorite(item)}
            onDragStart={() => handleDragStart(item)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(item)}
          />
        ))}
      </div>
    );
  };

  /**
   * 渲染标题区域
   */
  const renderHeader = () => {
    if (!showTitle) return null;

    return (
      <div className="favorite-header">
        <div className="favorite-title">
          <Title level={5} className="favorite-title-text">
            <StarFilled className="favorite-title-icon" />
            我的收藏
          </Title>
          <Text type="secondary" className="favorite-count">
            ({favoriteItems.length})
          </Text>
        </div>

        {showActions && (
          <div className="favorite-actions">
            <Space>
              {isEditing ? (
                <>
                  <Button size="small" onClick={() => setIsEditing(false)}>
                    完成
                  </Button>
                  <Tooltip title="拖拽调整顺序">
                    <Button
                      size="small"
                      type="text"
                      icon={<DragOutlined />}
                      className="drag-hint"
                    >
                      拖拽排序
                    </Button>
                  </Tooltip>
                </>
              ) : (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'edit',
                        label: '编辑收藏',
                        icon: <EditOutlined />,
                        onClick: () => setIsEditing(true),
                      },
                      {
                        key: 'add',
                        label: '添加收藏',
                        icon: <PlusOutlined />,
                        onClick: () => onManage?.('add'),
                      },
                    ],
                  }}
                  placement="bottomRight"
                >
                  <Button
                    size="small"
                    type="text"
                    icon={<MoreOutlined />}
                  />
                </Dropdown>
              )}
            </Space>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      className={`favorite-menu ${layout} ${className}`}
      size="small"
      title={renderHeader()}
      bordered={false}
    >
      <div className="favorite-content">
        {renderFavoriteItems()}
      </div>

      {favoriteItems.length > maxItems && (
        <div className="favorite-more">
          <Text type="secondary">
            还有 {favoriteItems.length - maxItems} 个收藏项
          </Text>
        </div>
      )}
    </Card>
  );
};

export default FavoriteMenu;