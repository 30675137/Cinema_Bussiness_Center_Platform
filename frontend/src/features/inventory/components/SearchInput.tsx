import React, { useState, useEffect, useCallback } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { InputProps } from 'antd';

/**
 * SearchInput 组件属性
 */
export interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  /** 搜索值 */
  value?: string;
  /** 值变化回调 (防抖后触发) */
  onChange?: (value: string) => void;
  /** 防抖延迟时间 (ms)，默认 300ms */
  debounceMs?: number;
  /** placeholder 文本 */
  placeholder?: string;
  /** 是否允许清除 */
  allowClear?: boolean;
  /** data-testid 用于测试 */
  'data-testid'?: string;
}

/**
 * 搜索输入框组件
 * 支持 300ms 防抖，回车立即触发搜索
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   value={keyword}
 *   onChange={setKeyword}
 *   placeholder="搜索SKU编码/名称"
 * />
 * ```
 * 
 * @since P003-inventory-query FR-005
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value = '',
  onChange,
  debounceMs = 300,
  placeholder = '搜索SKU编码/名称',
  allowClear = true,
  'data-testid': testId = 'search-input',
  ...restProps
}) => {
  // 内部输入值 (即时响应用户输入)
  const [inputValue, setInputValue] = useState(value);
  
  // 同步外部 value 变化
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 防抖触发搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== value) {
        onChange?.(inputValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, onChange, value]);

  // 处理输入变化
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  // 处理回车键 - 立即触发搜索
  const handlePressEnter = useCallback(() => {
    onChange?.(inputValue);
  }, [inputValue, onChange]);

  // 处理清除
  const handleClear = useCallback(() => {
    setInputValue('');
    onChange?.('');
  }, [onChange]);

  return (
    <Input
      value={inputValue}
      onChange={handleChange}
      onPressEnter={handlePressEnter}
      placeholder={placeholder}
      allowClear={allowClear}
      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
      data-testid={testId}
      onClear={handleClear}
      {...restProps}
    />
  );
};

export default SearchInput;
