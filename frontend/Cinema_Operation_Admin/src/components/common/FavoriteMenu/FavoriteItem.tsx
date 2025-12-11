/**
 * 收藏菜单项组件
 * 显示单个收藏菜单项，支持点击、编辑和删除操作
 */

import React, { useRef, useEffect } from 'react';
import { Card, List, Button, Tooltip, Space } from 'antd';
import {
  StarFilled,
  StarOutlined,
  EditOutlined,
  DeleteOutlined,
  DragOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { MenuItem } from '@/types/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import './FavoriteItem.css';

/**
 * 收藏菜单项组件属性接口
 */
export interface FavoriteItemProps {
  /** 菜单项数据 */
  item: MenuItem;
  /** 是否支持拖拽 */
  draggable?: boolean;
  /** 是否处于编辑模式 */
  isEditing?: boolean;
  /** 布局模式 */
  layout?: 'list' | 'card';
  /** 是否紧凑模式 */
  compact?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 点击回调 */
  onClick?: (item: MenuItem) => void;
  /** 编辑回调 */
  onEdit?: (item: MenuItem) => void;
  /** 删除回调 */
  onRemove?: (item: MenuItem) => void;
  /** 拖拽开始回调 */
  onDragStart?: (item: MenuItem) => void;
  /** 拖拽结束回调 */
  onDragEnd?: () => void;
  /** 拖拽放置回调 */
  onDrop?: (item: MenuItem) => void;
  /** 拖拽悬停回调 */
  onDragOver?: (item: MenuItem) => void;
}

/**
 * 获取菜单图标组件
 */
const getMenuIcon = (iconName?: string) => {
  // 这里可以根据icon名称返回对应的图标组件
  // 暂时使用默认图标
  return <StarFilled />;
};

/**
 * 收藏菜单项组件
 */
const FavoriteItem: React.FC<FavoriteItemProps> = ({
  item,
  draggable = false,
  isEditing = false,
  layout = 'list',
  compact = false,
  className = '',
  onClick,
  onEdit,
  onRemove,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { isFavorite } = useUserPreferences();

  /**
   * 处理点击事件
   */
  const handleClick = () => {
    if (!isEditing) {
      onClick?.(item);
    }
  };

  /**
   * 处理拖拽事件
   */
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    elementRef.current?.classList.add('dragging');
    onDragStart?.(item);
  };

  const handleDragEnd = () => {
    elementRef.current?.classList.remove('dragging');
    onDragEnd?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    elementRef.current?.classList.add('drag-over');
    onDragOver?.(item);
  };

  const handleDragLeave = () => {
    elementRef.current?.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    elementRef.current?.classList.remove('drag-over');
    onDrop?.(item);
  };

  /**
   * 获取操作按钮
   */
  const getActionButtons = () => {
    if (!isEditing) return null;

    return (
      <div className="favorite-item-actions">
        <Space size="small">
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(item);
              }}
              className="action-button edit-button"
            />
          </Tooltip>
          <Tooltip title="取消收藏">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.(item);
              }}
              className="action-button remove-button"
            />
          </Tooltip>
          {draggable && (
            <Tooltip title="拖拽调整顺序">
              <Button
                type="text"
                size="small"
                icon={<DragOutlined />}
                className="action-button drag-button"
                style={{ cursor: 'grab' }}
              />
            </Tooltip>
          )}
        </Space>
      </div>
    );
  };

  /**
   * 渲染列表布局
   */
  const renderListItem = () => {
    return (
      <List.Item
        ref={elementRef}
        className={`favorite-item list-item ${isEditing ? 'editing' : ''} ${className}`}
        onClick={handleClick}
        draggable={draggable && isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        actions={isEditing ? [getActionButtons()] : undefined}
      >
        <List.Item.Meta
          avatar={
            <div className="favorite-item-icon">
              {getMenuIcon(item.icon)}
            </div>
          }
          title={
            <div className="favorite-item-title">
              <span className="title-text">{item.title}</span>
              {isFavorite(item.id) && (
                <StarFilled className="favorite-indicator" />
              )}
            </div>
          }
          description={
            item.description && (
              <div className="favorite-item-description">
                {item.description}
              </div>
            )
          }
        />
      </List.Item>
    );
  };

  /**
   * 渲染卡片布局
   */
  const renderCardItem = () => {
    return (
      <Card
        ref={elementRef}
        className={`favorite-item card-item ${isEditing ? 'editing' : ''} ${compact ? 'compact' : ''} ${className}`}
        size="small"
        hoverable={!isEditing}
        onClick={handleClick}
        draggable={draggable && isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        cover={
          <div className="favorite-item-cover">
            {getMenuIcon(item.icon)}
          </div>
        }
        extra={isEditing ? getActionButtons() : undefined}
      >
        <Card.Meta
          title={
            <div className="favorite-item-title">
              <span className="title-text">{item.title}</span>
              {isFavorite(item.id) && (
                <StarFilled className="favorite-indicator" />
              )}
            </div>
          }
          description={
            <div className="favorite-item-description">
              {item.description || '暂无描述'}
            </div>
          }
        />
      </Card>
    );
  };

  return layout === 'list' ? renderListItem() : renderCardItem();
};

export default FavoriteItem;