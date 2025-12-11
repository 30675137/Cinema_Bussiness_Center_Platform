/**
 * 搜索结果组件
 * 显示搜索结果和搜索历史
 */

import React from 'react';
import { List, Typography, Tag, Divider, Empty, Spin } from 'antd';
import {
  SearchOutlined,
  HistoryOutlined,
  StarOutlined,
  StarFilled,
  CloseOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { SearchResult, MenuItem } from '@/types/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import './SearchResults.css';

const { Text } = Typography;

/**
 * 搜索结果组件属性接口
 */
export interface SearchResultsProps {
  /** 搜索结果列表 */
  results: SearchResult[];
  /** 搜索历史 */
  history: string[];
  /** 当前搜索关键词 */
  searchQuery: string;
  /** 是否显示搜索历史 */
  showHistory: boolean;
  /** 是否显示收藏标记 */
  showFavorites: boolean;
  /** 结果选择回调 */
  onSelect: (item: SearchResult) => void;
  /** 历史记录点击回调 */
  onHistoryClick: (query: string) => void;
  /** 历史记录删除回调 */
  onHistoryRemove: (query: string) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 搜索结果项组件
 */
const ResultItem: React.FC<{
  item: SearchResult;
  onSelect: (item: SearchResult) => void;
  showFavorites: boolean;
}> = ({ item, onSelect, showFavorites }) => {
  const { isFavorite } = useUserPreferences();

  const handleClick = () => {
    onSelect(item);
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'menu':
        return <SearchOutlined />;
      case 'submenu':
        return <SearchOutlined />;
      case 'page':
        return <ClockCircleOutlined />;
      default:
        return <SearchOutlined />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'menu':
        return '菜单';
      case 'submenu':
        return '子菜单';
      case 'page':
        return '页面';
      default:
        return '其他';
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case 'menu':
        return 'blue';
      case 'submenu':
        return 'green';
      case 'page':
        return 'orange';
      default:
        return 'default';
    }
  };

  return (
    <List.Item
      className="search-result-item"
      onClick={handleClick}
      extra={
        <div className="result-item-extra">
          {showFavorites && item.menuItem && (
            <span className="favorite-indicator">
              {isFavorite(item.menuItem.id) ? (
                <StarFilled style={{ color: '#faad14' }} />
              ) : (
                <StarOutlined />
              )}
            </span>
          )}
          <Tag color={getTypeColor()} className="result-type-tag">
            {getTypeLabel()}
          </Tag>
        </div>
      }
    >
      <List.Item.Meta
        avatar={getTypeIcon()}
        title={
          <div className="result-title">
            <Text strong>{item.title}</Text>
          </div>
        }
        description={
          <div className="result-description">
            {item.description && (
              <Text type="secondary" className="result-desc-text">
                {item.description}
              </Text>
            )}
            {item.path && (
              <div className="result-path">
                <Text type="secondary" className="result-path-text">
                  {item.path}
                </Text>
              </div>
            )}
          </div>
        }
      />
    </List.Item>
  );
};

/**
 * 搜索历史项组件
 */
const HistoryItem: React.FC<{
  query: string;
  onClick: (query: string) => void;
  onRemove: (query: string) => void;
}> = ({ query, onClick, onRemove }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(query);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(query);
  };

  return (
    <List.Item
      className="search-history-item"
      onClick={handleClick}
      actions={[
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={handleRemove}
          className="history-remove-btn"
        />
      ]}
    >
      <List.Item.Meta
        avatar={<HistoryOutlined />}
        title={<Text>{query}</Text>}
        description={<Text type="secondary">搜索历史</Text>}
      />
    </List.Item>
  );
};

/**
 * 搜索结果组件
 */
const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  history,
  searchQuery,
  showHistory,
  showFavorites,
  onSelect,
  onHistoryClick,
  onHistoryRemove,
  className = '',
}) => {
  const isLoading = false; // 可以从父组件传入loading状态

  return (
    <div className={`search-results ${className}`}>
      <div className="search-results-content">
        {/* 搜索结果 */}
        {searchQuery && (
          <>
            {results.length > 0 && (
              <div className="search-results-section">
                <div className="section-header">
                  <Text type="secondary">搜索结果</Text>
                  <Text type="secondary" className="result-count">
                    ({results.length})
                  </Text>
                </div>
                <List
                  dataSource={results}
                  renderItem={(item) => (
                    <ResultItem
                      key={`${item.type}-${item.id}`}
                      item={item}
                      onSelect={onSelect}
                      showFavorites={showFavorites}
                    />
                  )}
                  className="results-list"
                />
              </div>
            )}

            {results.length === 0 && !isLoading && (
              <div className="no-results">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="未找到相关结果"
                  className="no-results-empty"
                />
              </div>
            )}
          </>
        )}

        {/* 搜索历史 */}
        {showHistory && !searchQuery && history.length > 0 && (
          <>
            <Divider className="search-divider" />
            <div className="search-history-section">
              <div className="section-header">
                <Text type="secondary">搜索历史</Text>
                <Text type="secondary" className="history-count">
                  ({history.length})
                </Text>
              </div>
              <List
                dataSource={history.slice(0, 5)} // 只显示最近5条
                renderItem={(query) => (
                  <HistoryItem
                    key={query}
                    query={query}
                    onClick={onHistoryClick}
                    onRemove={onHistoryRemove}
                  />
                )}
                className="history-list"
              />
            </div>
          </>
        )}

        {/* 加载状态 */}
        {isLoading && (
          <div className="search-loading">
            <Spin size="small" />
            <Text type="secondary">搜索中...</Text>
          </div>
        )}

        {/* 空状态 */}
        {showHistory && !searchQuery && history.length === 0 && !isLoading && (
          <div className="empty-history">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无搜索历史"
              className="empty-history-empty"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;