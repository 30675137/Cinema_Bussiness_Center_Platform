/**
 * 搜索输入组件
 * 提供带防抖的搜索输入功能
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import { debounce } from '@/utils/helpers';
import './SearchInput.css';

const { Search } = Input;

/**
 * 搜索输入组件属性接口
 */
export interface SearchInputProps {
  /** 当前值 */
  value?: string;
  /** 默认值 */
  defaultValue?: string;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示清除按钮 */
  allowClear?: boolean;
  /** 是否自动聚焦 */
  autoFocus?: boolean;
  /** 最大长度 */
  maxLength?: number;
  /** 防抖延迟时间（毫秒） */
  debounceDelay?: number;
  /** 是否正在搜索 */
  loading?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 输入变化回调 */
  onChange?: (value: string) => void;
  /** 搜索确认回调 */
  onSearch?: (value: string) => void;
  /** 焦点获得回调 */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** 焦点失去回调 */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** 键盘按下回调 */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** 清除回调 */
  onClear?: () => void;
}

/**
 * 搜索输入组件
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  defaultValue,
  placeholder = '搜索菜单...',
  disabled = false,
  allowClear = true,
  autoFocus = false,
  maxLength = 100,
  debounceDelay = 300,
  loading = false,
  className = '',
  onChange,
  onSearch,
  onFocus,
  onBlur,
  onKeyDown,
  onClear,
}) => {
  const [inputValue, setInputValue] = useState(value || defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<any>(null);

  // 同步外部value
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  /**
   * 防抖搜索函数
   */
  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      onSearch?.(searchValue);
    }, debounceDelay),
    [onSearch, debounceDelay]
  );

  /**
   * 处理输入变化
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange?.(newValue);

      // 触发防抖搜索
      debouncedSearch(newValue);
    },
    [onChange, debouncedSearch]
  );

  /**
   * 处理搜索确认
   */
  const handleSearch = useCallback(
    (searchValue: string) => {
      // 取消防抖搜索，立即执行
      debouncedSearch.cancel();
      onSearch?.(searchValue);
    },
    [onSearch, debouncedSearch]
  );

  /**
   * 处理清除操作
   */
  const handleClear = useCallback(() => {
    setInputValue('');
    onChange?.('');
    debouncedSearch.cancel();
    onClear?.();

    // 重新聚焦
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange, debouncedSearch, onClear]);

  /**
   * 处理焦点事件
   */
  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // ESC键清除输入
      if (e.key === 'Escape') {
        handleClear();
        return;
      }

      onKeyDown?.(e);
    },
    [onKeyDown, handleClear]
  );

  /**
   * 获取后缀图标
   */
  const getSuffix = () => {
    const icons = [];

    // 加载图标
    if (loading) {
      icons.push(<LoadingOutlined key="loading" className="search-loading-icon" spin />);
    } else if (inputValue) {
      icons.push(<SearchOutlined key="search" className="search-icon" />);
    }

    // 清除按钮
    if (allowClear && inputValue && !loading) {
      icons.push(
        <Button
          key="clear"
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={handleClear}
          className="clear-button"
        />
      );
    }

    return icons.length > 0 ? <div className="search-suffix">{icons}</div> : null;
  };

  /**
   * 获取前缀图标
   */
  const getPrefix = () => {
    return <SearchOutlined className={`search-prefix-icon ${isFocused ? 'focused' : ''}`} />;
  };

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 清理防抖函数
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className={`search-input-wrapper ${className}`}>
      <Input
        ref={inputRef}
        value={inputValue}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        prefix={getPrefix()}
        suffix={getSuffix()}
        className={`search-input ${isFocused ? 'focused' : ''} ${loading ? 'loading' : ''}`}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPressEnter={() => handleSearch(inputValue)}
      />
    </div>
  );
};

export default SearchInput;
