/**
 * 国际化相关类型定义
 */

// 支持的语言类型
export type Language = 'zh-CN' | 'en-US';

// 语言配置接口
export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

// 国际化配置接口
export interface I18nConfig {
  default: Language;
  fallback: Language;
  supportedLanguages: Language[];
  debug?: boolean;
}

// 资源包接口
export interface ResourceBundle {
  [key: string]: string | ResourceBundle;
}

// 格式化参数接口
export interface FormatOptions {
  currency?: string;
  style?: 'decimal' | 'currency' | 'percent';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// 日期格式化选项接口
export interface DateFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  timeZone?: string;
}

// 相对时间格式化选项接口
export interface RelativeTimeFormatOptions {
  numeric?: 'always' | 'auto';
  style?: 'long' | 'short' | 'narrow';
}

// 国际化事件类型
export type I18nEventType = 'languageChanged' | 'resourceLoaded' | 'error';

// 国际化事件监听器类型
export type I18nEventListener = (data: any) => void;