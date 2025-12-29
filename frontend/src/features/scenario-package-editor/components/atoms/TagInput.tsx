/**
 * TagInput 原子组件
 * 标签输入组件
 * Feature: 001-scenario-package-tabs
 */

import React, { useState, useRef } from 'react';
import { Tag, Input, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';

const { Text } = Typography;

interface TagInputProps {
  /** 标签值 */
  value: string[];
  /** 值变化回调 */
  onChange: (value: string[]) => void;
  /** 最大标签数 */
  maxCount?: number;
  /** 最大标签长度 */
  maxLength?: number;
  /** 占位符 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 标签输入组件
 * 
 * 支持输入标签并按回车添加，点击标签可删除
 */
const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  maxCount = 5,
  maxLength = 20,
  placeholder = '输入标签后按回车添加',
  disabled = false,
}) => {
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  // 显示输入框
  const showInput = () => {
    setInputVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // 输入确认（按回车或失去焦点）
  const handleInputConfirm = () => {
    const trimmedValue = inputValue.trim();
    
    if (trimmedValue && !value.includes(trimmedValue) && value.length < maxCount) {
      onChange([...value, trimmedValue]);
    }
    
    setInputVisible(false);
    setInputValue('');
  };

  // 删除标签
  const handleClose = (removedTag: string) => {
    onChange(value.filter((tag) => tag !== removedTag));
  };

  return (
    <div>
      <Space size={[8, 8]} wrap>
        {value.map((tag) => (
          <Tag
            key={tag}
            closable={!disabled}
            onClose={() => handleClose(tag)}
            style={{ padding: '4px 8px' }}
          >
            {tag}
          </Tag>
        ))}

        {inputVisible ? (
          <Input
            ref={inputRef}
            type="text"
            size="small"
            style={{ width: 100 }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
            maxLength={maxLength}
            disabled={disabled}
          />
        ) : (
          value.length < maxCount && !disabled && (
            <Tag
              onClick={showInput}
              style={{
                borderStyle: 'dashed',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <PlusOutlined /> 添加标签
            </Tag>
          )
        )}
      </Space>

      {value.length >= maxCount && (
        <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
          最多添加 {maxCount} 个标签
        </Text>
      )}
    </div>
  );
};

export default TagInput;
