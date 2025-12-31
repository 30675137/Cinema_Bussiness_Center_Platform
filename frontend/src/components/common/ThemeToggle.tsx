/**
 * 主题切换组件
 */

import React from 'react';
import { Button, Switch, Select, Space, Tooltip, Dropdown, MenuProps } from 'antd';
import { SunOutlined, MoonOutlined, BgColorsOutlined, SettingOutlined } from '@ant-design/icons';
import { useTheme, useThemeToggle, useThemeSettings } from '@/theme/hooks';
import type { ThemeMode } from '@/theme/types';

interface ThemeToggleProps {
  type?: 'button' | 'switch' | 'select' | 'dropdown';
  size?: 'small' | 'middle' | 'large';
  showText?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 简单的主题切换按钮
 */
export const ThemeToggleButton: React.FC<Omit<ThemeToggleProps, 'type'>> = ({
  size = 'middle',
  showText = false,
  className,
  style,
}) => {
  const { mode, effectiveMode, toggleLightDark } = useThemeToggle();

  const getIcon = () => {
    if (mode === 'auto') {
      return effectiveMode === 'dark' ? <MoonOutlined /> : <SunOutlined />;
    }
    return mode === 'dark' ? <MoonOutlined /> : <SunOutlined />;
  };

  const getText = () => {
    if (mode === 'auto') {
      return effectiveMode === 'dark' ? '暗黑模式' : '明亮模式';
    }
    return mode === 'dark' ? '暗黑模式' : '明亮模式';
  };

  return (
    <Tooltip title={`切换主题 (当前: ${getText()})`}>
      <Button
        type="text"
        size={size}
        icon={getIcon()}
        className={className}
        style={style}
        onClick={toggleLightDark}
      >
        {showText && getText()}
      </Button>
    </Tooltip>
  );
};

/**
 * 主题切换开关
 */
export const ThemeToggleSwitch: React.FC<Omit<ThemeToggleProps, 'type'>> = ({
  size = 'middle',
  showText = false,
  className,
  style,
}) => {
  const { mode, effectiveMode, toggleLightDark } = useThemeToggle();
  const isDark = effectiveMode === 'dark';

  return (
    <Space className={className} style={style}>
      <SunOutlined />
      <Switch
        checked={isDark}
        onChange={toggleLightDark}
        size={size === 'small' ? 'small' : 'default'}
      />
      <MoonOutlined />
      {showText && <span>{isDark ? '暗黑模式' : '明亮模式'}</span>}
    </Space>
  );
};

/**
 * 主题模式选择器
 */
export const ThemeModeSelector: React.FC<Omit<ThemeToggleProps, 'type'>> = ({
  size = 'middle',
  showText = false,
  className,
  style,
}) => {
  const { mode, setMode } = useThemeToggle();

  const modeOptions = [
    { value: 'light', label: '明亮', icon: <SunOutlined /> },
    { value: 'dark', label: '暗黑', icon: <MoonOutlined /> },
    { value: 'auto', label: '自动', icon: <BgColorsOutlined /> },
  ];

  return (
    <Select
      value={mode}
      onChange={setMode}
      size={size}
      className={className}
      style={{ minWidth: showText ? 100 : 80, ...style }}
      placeholder="选择主题"
      options={modeOptions.map((option) => ({
        value: option.value,
        label: (
          <Space>
            {option.icon}
            {showText && option.label}
          </Space>
        ),
      }))}
    />
  );
};

/**
 * 主题下拉菜单
 */
export const ThemeDropdown: React.FC<Omit<ThemeToggleProps, 'type'>> = ({
  size = 'middle',
  className,
  style,
}) => {
  const { mode, setMode } = useThemeToggle();
  const { settings, updateSettings } = useThemeSettings();

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'mode',
      label: '主题模式',
      type: 'group',
      children: [
        {
          key: 'light',
          label: (
            <Space>
              <SunOutlined />
              明亮模式
              {mode === 'light' && <span style={{ color: '#1890ff' }}>✓</span>}
            </Space>
          ),
          onClick: () => handleModeChange('light'),
        },
        {
          key: 'dark',
          label: (
            <Space>
              <MoonOutlined />
              暗黑模式
              {mode === 'dark' && <span style={{ color: '#1890ff' }}>✓</span>}
            </Space>
          ),
          onClick: () => handleModeChange('dark'),
        },
        {
          key: 'auto',
          label: (
            <Space>
              <BgColorsOutlined />
              自动模式
              {mode === 'auto' && <span style={{ color: '#1890ff' }}>✓</span>}
            </Space>
          ),
          onClick: () => handleModeChange('auto'),
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: 'accessibility',
      label: '无障碍选项',
      type: 'group',
      children: [
        {
          key: 'high-contrast',
          label: (
            <Space>
              高对比度
              {settings.enableHighContrast && <span style={{ color: '#1890ff' }}>✓</span>}
            </Space>
          ),
          onClick: () => updateSettings({ enableHighContrast: !settings.enableHighContrast }),
        },
        {
          key: 'reduced-motion',
          label: (
            <Space>
              减少动画
              {settings.enableReducedMotion && <span style={{ color: '#1890ff' }}>✓</span>}
            </Space>
          ),
          onClick: () => updateSettings({ enableReducedMotion: !settings.enableReducedMotion }),
        },
      ],
    },
    {
      key: 'font-size',
      label: '字体大小',
      type: 'group',
      children: ['small', 'medium', 'large'].map((size) => ({
        key: `font-${size}`,
        label: (
          <Space>
            {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
            {settings.fontSize === size && <span style={{ color: '#1890ff' }}>✓</span>}
          </Space>
        ),
        onClick: () => updateSettings({ fontSize: size as 'small' | 'medium' | 'large' }),
      })),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
      <Button
        type="text"
        size={size}
        icon={<SettingOutlined />}
        className={className}
        style={style}
      />
    </Dropdown>
  );
};

/**
 * 完整的主题切换组件
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  type = 'button',
  size = 'middle',
  showText = false,
  className,
  style,
}) => {
  switch (type) {
    case 'switch':
      return (
        <ThemeToggleSwitch size={size} showText={showText} className={className} style={style} />
      );
    case 'select':
      return (
        <ThemeModeSelector size={size} showText={showText} className={className} style={style} />
      );
    case 'dropdown':
      return <ThemeDropdown size={size} className={className} style={style} />;
    default:
      return (
        <ThemeToggleButton size={size} showText={showText} className={className} style={style} />
      );
  }
};

export default ThemeToggle;
