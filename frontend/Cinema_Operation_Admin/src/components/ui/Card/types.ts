import { ReactNode } from 'react';

/**
 * Card尺寸枚举
 */
export enum CardSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/**
 * Card变体枚举
 */
export enum CardVariant {
  DEFAULT = 'default',
  OUTLINED = 'outlined',
  FILLED = 'filled',
  SHADOW = 'shadow',
  GHOST = 'ghost',
}

/**
 * 卡片操作项接口
 */
export interface CardAction {
  /** 操作键值 */
  key: string;
  /** 操作标签 */
  label: string;
  /** 操作图标 */
  icon?: ReactNode;
  /** 点击回调 */
  onClick: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 危险操作 */
  danger?: boolean;
  /** 操作类型 */
  type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
}

/**
 * 统计卡片数据接口
 */
export interface StatCardData {
  /** 标题 */
  title: string;
  /** 数值 */
  value: string | number;
  /** 副标题 */
  subtitle?: string;
  /** 趋势数据 */
  trend?: {
    /** 趋势值 */
    value: number;
    /** 是否为上升趋势 */
    isUp: boolean;
    /** 趋势描述 */
    description?: string;
  };
  /** 图标 */
  icon?: ReactNode;
  /** 颜色主题 */
  color?: string;
}

/**
 * Card组件Props接口
 */
export interface CardProps {
  /** 卡片标题 */
  title?: ReactNode;
  /** 卡片副标题 */
  subtitle?: ReactNode;
  /** 卡片内容 */
  children?: ReactNode;
  /** 卡片额外内容（右上角） */
  extra?: ReactNode;
  /** 卡片底部内容 */
  footer?: ReactNode;
  /** 卡片操作按钮 */
  actions?: CardAction[];
  /** 卡片封面 */
  cover?: ReactNode;
  /** 卡片头像 */
  avatar?: ReactNode;
  /** 卡片尺寸 */
  size?: CardSize;
  /** 卡片变体 */
  variant?: CardVariant;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否可悬浮 */
  hoverable?: boolean;
  /** 是否显示阴影 */
  shadow?: boolean;
  /** 加载状态 */
  loading?: boolean;
  /** 卡片宽度 */
  width?: number | string;
  /** 卡片高度 */
  height?: number | string;
  /** 内容内边距 */
  padding?: number | string;
  /** 头部样式 */
  headStyle?: React.CSSProperties;
  /** 身体样式 */
  bodyStyle?: React.CSSProperties;
  /** 底部样式 */
  footerStyle?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 点击卡片回调 */
  onClick?: () => void;
  /** 鼠标移入回调 */
  onMouseEnter?: () => void;
  /** 鼠标移出回调 */
  onMouseLeave?: () => void;
}

/**
 * StatCard组件Props接口（继承CardProps）
 */
export interface StatCardProps extends Omit<CardProps, 'children'> {
  /** 统计数据 */
  data: StatCardData;
  /** 是否显示趋势图标 */
  showTrendIcon?: boolean;
  /** 数值格式化函数 */
  formatValue?: (value: string | number) => string;
  /** 趋势格式化函数 */
  formatTrend?: (value: number) => string;
}