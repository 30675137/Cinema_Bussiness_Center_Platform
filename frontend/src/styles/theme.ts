/**
 * Ant Design 主题配置
 */

import { theme } from 'antd';

/** 默认主题配置 */
export const defaultTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // 主色调
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',

    // 布局
    borderRadius: 6,
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,

    // 间距
    paddingXS: 8,
    paddingSM: 12,
    padding: 16,
    paddingMD: 20,
    paddingLG: 24,
    paddingXL: 32,

    // 字体
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,

    // 侧边栏
    siderBg: '#fff',
    triggerHeight: 48,

    // 头部
    headerHeight: 64,
    headerBg: '#fff',
    headerPadding: '0 24px',

    // 内容区域
    contentBg: '#f0f2f5',
    contentPadding: 24,
  },
  components: {
    Layout: {
      siderBg: '#fff',
      triggerBg: '#1890ff',
      headerBg: '#fff',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e6f7ff',
      itemHoverBg: '#f5f5f5',
      itemActiveBg: '#e6f7ff',
    },
    Breadcrumb: {
      separatorColor: '#d9d9d9',
    },
    Table: {
      headerBg: '#fafafa',
    },
  },
};

/** 暗色主题配置 */
export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...defaultTheme.token,
    colorPrimary: '#177ddc',
    colorBgContainer: '#1f1f1f',
    colorBgElevated: '#262626',
    colorBgLayout: '#141414',
  },
  components: {
    Layout: {
      siderBg: '#141414',
      headerBg: '#1f1f1f',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#111b26',
      itemHoverBg: '#262626',
      itemActiveBg: '#111b26',
    },
    Table: {
      headerBg: '#1f1f1f',
    },
  },
};