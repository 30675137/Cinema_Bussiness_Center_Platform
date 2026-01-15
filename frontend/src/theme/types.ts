/**
 * 主题系统相关类型定义
 */

// 主题模式
export type ThemeMode = 'light' | 'dark' | 'auto';

// 颜色类型
export interface ColorPalette {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: string;
  shadow: string;
}

// 字体配置
export interface Typography {
  fontFamily: {
    primary: string;
    monospace: string;
    sans: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

// 间距配置
export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
}

// 圆角配置
export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

// 阴影配置
export interface BoxShadow {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

// 断点配置
export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// 动画配置
export interface Animation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

// Z-index层级
export interface ZIndex {
  hide: number;
  auto: number;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  skipLink: number;
  toast: number;
  tooltip: number;
  menu: number;
  actionMenu: number;
  notification: number;
  mask: number;
  fullscreen: number;
}

// 完整主题配置
export interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  mode: ThemeMode;
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  boxShadow: BoxShadow;
  breakpoints: Breakpoints;
  animation: Animation;
  zIndex: ZIndex;
  customProperties?: Record<string, any>;
}

// 主题预设
export interface ThemePreset {
  id: string;
  name: string;
  description?: string;
  theme: Partial<ThemeConfig>;
  preview?: string;
}

// 主题自定义配置
export interface ThemeCustomization {
  colors?: Partial<ColorPalette>;
  typography?: Partial<Typography>;
  spacing?: Partial<Spacing>;
  borderRadius?: Partial<BorderRadius>;
  boxShadow?: Partial<BoxShadow>;
  animation?: Partial<Animation>;
  customCSS?: string;
}

// 主题设置
export interface ThemeSettings {
  mode: ThemeMode;
  currentTheme: string;
  customThemes: ThemeConfig[];
  enableAnimations: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: string;
}

// 主题事件类型
export type ThemeEventType =
  | 'themeChanged'
  | 'modeChanged'
  | 'customThemeAdded'
  | 'customThemeRemoved';

// 主题事件监听器
export type ThemeEventListener = (data: any) => void;

// CSS变量映射
export interface CSSVariableMap {
  [key: string]: string;
}
