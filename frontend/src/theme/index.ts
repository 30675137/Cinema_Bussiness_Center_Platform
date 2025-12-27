/**
 * 主题系统入口文件
 * 提供完整的主题管理功能
 */

// 导出核心类
import { themeManager } from './core';
export { ThemeManager, themeManager } from './core';

// 导出类型定义
export type {
  ThemeMode,
  ThemeConfig,
  ThemeSettings,
  ThemePreset,
  ThemeCustomization,
  ColorPalette,
  Typography,
  Spacing,
  BorderRadius,
  BoxShadow,
  Breakpoints,
  Animation,
  ZIndex,
  ThemeEventType,
  ThemeEventListener,
  CSSVariableMap
} from './types';

// 导出React Hooks
export {
  useTheme,
  useThemeSettings,
  useCustomThemes,
  useThemeToggle,
  useThemeCSSVariables,
  useThemeAdapt
} from './hooks';

// 导出工具函数
export {
  generateColorVariants,
  blendColors,
  getContrastColor,
  generateCSSVariables,
  applyCSSVariables,
  createBreakpointHelper,
  createColorHelper,
  createSpacingHelper
} from './utils';

// 兼容旧的Ant Design主题配置
import type { ThemeConfig as AntdThemeConfig } from 'antd';
import { theme } from 'antd';

// 耀莱影城品牌色彩配置（保持向后兼容）
export const colors = {
  primary: '#1890ff',      // 耀莱蓝
  success: '#52c41a',      // 成功绿
  warning: '#faad14',      // 警告橙
  error: '#ff4d4f',        // 错误红
  info: '#1890ff',         // 信息蓝

  // 扩展业务色彩
  cinema: '#722ed1',       // 影院紫
  food: '#fa8c16',         // 食品橙
  ticket: '#13c2c2',       // 票务青

  // 中性色彩
  textPrimary: '#262626',
  textSecondary: '#595959',
  textDisabled: '#bfbfbf',
  borderColor: '#d9d9d9',
  backgroundColor: '#fafafa',
};

// Ant Design主题配置（保持向后兼容）
export const antdTheme: AntdThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // 主色调
    colorPrimary: colors.primary,
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    colorInfo: colors.info,

    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
    fontSize: 14,

    // 圆角
    borderRadius: 6,

    // 间距
    paddingXS: 8,
    paddingSM: 12,
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,

    // 阴影
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    boxShadowSecondary: '0 6px 16px rgba(0, 0, 0, 0.12)',

    // 动画
    motionDurationFast: '0.1s',
    motionDurationMid: '0.3s',
    motionDurationSlow: '0.5s',
  },
  components: {
    Layout: {
      siderBg: '#001529',
      triggerBg: '#002140',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
      darkItemSelectedBg: colors.primary,
    },
    Button: {
      borderRadius: 6,
      controlHeight: 40,
      controlHeightSM: 32,
      controlHeightLG: 48,
    },
    Table: {
      headerBg: '#fafafa',
      headerSplitColor: '#f0f0f0',
    },
    Card: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 6,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 40,
    },
    DatePicker: {
      borderRadius: 6,
      controlHeight: 40,
    },
  },
};

// 状态色彩映射（业务状态）
export const statusColors = {
  // 商品状态
  active: { color: colors.success, text: '已上架', bg: '#f6ffed' },
  inactive: { color: colors.error, text: '已下架', bg: '#fff2f0' },
  draft: { color: colors.warning, text: '草稿', bg: '#fffbe6' },
  archived: { color: '#8c8c8c', text: '已归档', bg: '#f5f5f5' },

  // 审核状态
  pending: { color: colors.warning, text: '待审核', bg: '#fffbe6' },
  approved: { color: colors.success, text: '已通过', bg: '#f6ffed' },
  rejected: { color: colors.error, text: '已拒绝', bg: '#fff2f0' },

  // 库存状态
  inStock: { color: colors.success, text: '有库存', bg: '#f6ffed' },
  lowStock: { color: colors.warning, text: '库存不足', bg: '#fffbe6' },
  outOfStock: { color: colors.error, text: '缺货', bg: '#fff2f0' },

  // 价格状态
  normal: { color: colors.success, text: '正常', bg: '#f6ffed' },
  discount: { color: colors.warning, text: '折扣', bg: '#fffbe6' },
  expired: { color: colors.error, text: '已过期', bg: '#fff2f0' },
};

// 暗色主题配置
export const darkTheme: AntdThemeConfig = {
  ...antdTheme,
  algorithm: theme.darkAlgorithm,
  token: {
    ...antdTheme.token,
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBorder: '#303030',
    colorText: '#ffffff',
    colorTextSecondary: '#a6a6a6',
  },
};

// 自定义样式类
export const customStyles = `
  .layout-header {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    z-index: 100;
  }

  .layout-sider {
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.08);
    z-index: 99;
  }

  .content-wrapper {
    min-height: calc(100vh - 64px);
    padding: 24px;
    background: #f0f2f5;
  }

  .page-header {
    background: #fff;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    margin-bottom: 16px;
  }

  .page-content {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
    padding: 24px;
  }

  .status-tag {
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-active {
    color: ${colors.success};
    background: #f6ffed;
    border: 1px solid #b7eb8f;
  }

  .status-inactive {
    color: ${colors.error};
    background: #fff2f0;
    border: 1px solid #ffccc7;
  }

  .status-draft {
    color: ${colors.warning};
    background: #fffbe6;
    border: 1px solid #ffe58f;
  }

  .table-hover-row {
    transition: background-color 0.2s ease;
  }

  .table-hover-row:hover {
    background-color: #f5f5f5;
  }

  .card-hover {
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .card-hover:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .form-section {
    margin-bottom: 32px;
    padding: 24px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
  }

  .form-section-title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 8px;
  }

  @media (max-width: 768px) {
    .page-header, .page-content {
      padding: 16px;
    }

    .form-section {
      padding: 16px;
      margin-bottom: 16px;
    }
  }
`;

// 主题系统初始化
export const initTheme = () => {
  // 从localStorage加载主题设置
  const savedSettings = localStorage.getItem('theme-settings');
  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);
      themeManager.updateSettings(settings);
    } catch (error) {
      console.warn('Failed to load theme settings:', error);
    }
  }

  return themeManager;
};

// 创建全局主题管理器实例
export const globalTheme = initTheme();

// 默认导出（保持向后兼容）
export default {
  light: antdTheme,
  dark: darkTheme,
  colors,
  statusColors,
  customStyles,
};