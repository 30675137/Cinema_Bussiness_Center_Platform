import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

// 耀莱影城品牌色彩配置
const colors = {
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

// Ant Design主题配置
export const antdTheme: ThemeConfig = {
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
export const darkTheme: ThemeConfig = {
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

export default {
  light: antdTheme,
  dark: darkTheme,
  colors,
  statusColors,
};