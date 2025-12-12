/**
 * 导航搜索组件
 * 提供菜单搜索功能，支持关键词搜索和搜索历史
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input, AutoComplete, Badge, Button } from 'antd';
import { SearchOutlined, CloseOutlined, HistoryOutlined } from '@ant-design/icons';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNavigation } from '@/hooks/useNavigation';
import { MenuItem, SearchResult } from '@/types/navigation';
import { debounce } from '@/utils/helpers';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import './index.css';

const { Search } = Input;

/**
 * 导航搜索组件属性接口
 */
export interface NavigationSearchProps {
  /** 是否显示搜索历史 */
  showHistory?: boolean;
  /** 是否显示收藏标记 */
  showFavorites?: boolean;
  /** 占位符文本 */
  placeholder?: string;
  /** 最大搜索结果数量 */
  maxResults?: number;
  /** 是否自动聚焦 */
  autoFocus?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 搜索回调函数 */
  onSearch?: (query: string, results: SearchResult[]) => void;
  /** 结果选择回调函数 */
  onSelect?: (item: SearchResult) => void;
}

/**
 * 导航搜索组件
 */
const NavigationSearch: React.FC<NavigationSearchProps> = ({
  showHistory = true,
  showFavorites = true,
  placeholder = '搜索菜单...',
  maxResults = 10,
  autoFocus = false,
  className = '',
  onSearch,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const inputRef = useRef<any>(null);
  const { getSearchHistory, addToSearchHistory, removeFromSearchHistory } = useUserPreferences();
  const { searchMenuItems, navigateToMenuItem } = useNavigation();

  // 获取搜索历史
  const searchHistory = getSearchHistory();

  /**
   * 搜索菜单项
   */
  const performSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(showHistory && searchHistory.length > 0);
        return;
      }

      setIsSearching(true);

      try {
        const results = searchMenuItems(query, maxResults);
        setSearchResults(results);
        setShowResults(true);

        // 添加到搜索历史
        if (query.trim()) {
          addToSearchHistory(query.trim());
        }

        // 回调函数
        onSearch?.(query, results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchMenuItems, maxResults, showHistory, searchHistory, onSearch, addToSearchHistory]
  );

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback((value: string) => {
    setSearchQuery(value);
    performSearch(value);
  }, [performSearch]);

  /**
   * 处理搜索确认
   */
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    performSearch(value);

    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, [performSearch]);

  /**
   * 处理结果选择
   */
  const handleSelect = useCallback((item: SearchResult) => {
    setSearchQuery(item.title);
    setShowResults(false);
    setIsFocused(false);

    // 导航到对应页面
    if (item.menuItem) {
      navigateToMenuItem(item.menuItem);
    }

    onSelect?.(item);
  }, [navigateToMenuItem, onSelect]);

  /**
   * 处理焦点事件
   */
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowResults(searchQuery.length === 0 ? showHistory && searchHistory.length > 0 : true);
  }, [searchQuery.length, showHistory, searchHistory.length]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // 延迟隐藏结果，允许点击结果项
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  }, []);

  /**
   * 清除搜索
   */
  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(showHistory && searchHistory.length > 0);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [showHistory, searchHistory.length]);

  /**
   * 处理历史记录点击
   */
  const handleHistoryClick = useCallback((query: string) => {
    setSearchQuery(query);
    performSearch(query);
  }, [performSearch]);

  /**
   * 处理历史记录删除
   */
  const handleHistoryRemove = useCallback((query: string) => {
    removeFromSearchHistory(query);
  }, [removeFromSearchHistory]);

  /**
   * 点击外部关闭
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.navigation-search')) {
        setShowResults(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 根据焦点状态显示搜索历史
  useEffect(() => {
    if (isFocused && searchQuery.length === 0) {
      setShowResults(showHistory && searchHistory.length > 0);
    }
  }, [isFocused, searchQuery.length, showHistory, searchHistory.length]);

  return (
    <div className={`navigation-search ${className}`}>
      <div className="search-input-wrapper">
        <Search
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onSearch={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          loading={isSearching}
          allowClear
          suffix={
            <div className="search-suffix">
              {isSearching ? (
                <div className="search-loading" />
              ) : (
                <SearchOutlined className="search-icon" />
              )}
              {searchQuery && (
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={handleClear}
                  className="clear-button"
                />
              )}
            </div>
          }
          className="navigation-search-input"
        />
      </div>

      {showResults && (
        <SearchResults
          results={searchResults}
          history={searchHistory}
          searchQuery={searchQuery}
          showHistory={showHistory}
          showFavorites={showFavorites}
          onSelect={handleSelect}
          onHistoryClick={handleHistoryClick}
          onHistoryRemove={handleHistoryRemove}
          className="search-results-dropdown"
        />
      )}
    </div>
  );
};

export default NavigationSearch;