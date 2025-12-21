/**
 * 语言选择器组件
 */

import React from 'react';
import { Select, Space, Typography } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguageSelector } from '@/i18n/hooks';
import type { MenuProps } from 'antd';

const { Text } = Typography;

interface LanguageSelectorProps {
  className?: string;
  size?: 'small' | 'middle' | 'large';
  showText?: boolean;
  style?: React.CSSProperties;
}

/**
 * 语言选择器下拉菜单组件
 */
export const LanguageDropdown: React.FC<LanguageSelectorProps> = ({
  className,
  size = 'middle',
  showText = false,
  style
}) => {
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguageSelector();

  const menuItems: MenuProps['items'] = supportedLanguages.map((lang) => ({
    key: lang.code,
    label: (
      <Space>
        <span style={{ fontSize: '16px' }}>{lang.flag}</span>
        <Text>{lang.nativeName}</Text>
      </Space>
    ),
    onClick: () => changeLanguage(lang.code)
  }));

  const currentLangConfig = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <Select
      className={className}
      size={size}
      value={currentLanguage}
      onChange={changeLanguage}
      style={{
        minWidth: showText ? 120 : 80,
        ...style
      }}
      placeholder="选择语言"
      options={supportedLanguages.map(lang => ({
        value: lang.code,
        label: (
          <Space>
            <span>{lang.flag}</span>
            {showText && <span>{lang.nativeName}</span>}
          </Space>
        )
      }))}
      suffixIcon={<GlobalOutlined />}
    />
  );
};

/**
 * 简单的语言切换按钮
 */
export const LanguageToggle: React.FC<LanguageSelectorProps> = ({
  className,
  style
}) => {
  const { currentLanguage, supportedLanguages, nextLanguage } = useLanguageSelector();

  const currentLangConfig = supportedLanguages.find(lang => lang.code === currentLanguage);

  const handleToggle = () => {
    nextLanguage();
  };

  return (
    <div
      className={className}
      style={{
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        transition: 'all 0.3s',
        ...style
      }}
      onClick={handleToggle}
      title={`切换语言 (当前: ${currentLangConfig?.nativeName})`}
    >
      <Space size="small">
        <span style={{ fontSize: '16px' }}>{currentLangConfig?.flag}</span>
        <Text style={{ fontSize: '12px' }}>{currentLangConfig?.code}</Text>
      </Space>
    </div>
  );
};

/**
 * 完整的语言选择器组件
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className,
  style
}) => {
  return (
    <div className={className} style={style}>
      <LanguageDropdown showText={false} />
    </div>
  );
};

/**
 * 带文字的语言选择器
 */
export const LanguageSelectorWithText: React.FC<LanguageSelectorProps> = ({
  className,
  style
}) => {
  return (
    <div className={className} style={style}>
      <LanguageDropdown showText={true} />
    </div>
  );
};

export default LanguageSelector;