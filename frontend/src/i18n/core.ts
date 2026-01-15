/**
 * 国际化核心类
 * 提供翻译、格式化、语言切换等核心功能
 */

import {
  Language,
  LanguageConfig,
  I18nConfig,
  ResourceBundle,
  FormatOptions,
  DateFormatOptions,
  RelativeTimeFormatOptions,
  I18nEventType,
  I18nEventListener,
} from './types';

// 语言配置
export const LANGUAGE_CONFIGS: Record<Language, LanguageConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese',
    nativeName: '简体中文',
    flag: '🇨🇳',
    rtl: false,
  },
  'en-US': {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
};

/**
 * 国际化核心类
 */
export class I18n {
  private config: Required<I18nConfig>;
  private currentLanguage: Language;
  private resources: Map<Language, ResourceBundle> = new Map();
  private eventListeners: Map<I18nEventType, Set<I18nEventListener>> = new Map();

  constructor(config: I18nConfig) {
    this.config = {
      debug: false,
      ...config,
    } as Required<I18nConfig>;

    this.currentLanguage = this.config.default;
    this.initEventListeners();
  }

  /**
   * 添加资源包
   */
  addResources(language: Language, resources: ResourceBundle): void {
    const existingResources = this.resources.get(language) || {};
    const mergedResources = this.deepMerge(existingResources, resources);
    this.resources.set(language, mergedResources);
    this.emit('resourceLoaded', { language, resources });

    if (this.config.debug) {
      console.log(`[I18n] Resources loaded for ${language}:`, resources);
    }
  }

  /**
   * 获取翻译文本
   */
  t(key: string, params?: Record<string, any>, language?: Language): string {
    const targetLanguage = language || this.currentLanguage;
    const resources = this.resources.get(targetLanguage);
    const fallbackResources = this.resources.get(this.config.fallback);

    let translation = this.getTranslationValue(resources, key);

    // 如果当前语言没有找到翻译，尝试使用回退语言
    if (!translation && fallbackResources) {
      translation = this.getTranslationValue(fallbackResources, key);

      if (this.config.debug) {
        console.warn(`[I18n] Using fallback translation for key: ${key}`);
      }
    }

    // 如果仍然没有找到，返回key本身
    if (!translation) {
      if (this.config.debug) {
        console.error(`[I18n] Translation not found for key: ${key}`);
      }
      return key;
    }

    // 替换参数
    if (params) {
      translation = this.interpolateParams(translation, params);
    }

    return translation;
  }

  /**
   * 格式化数字
   */
  formatNumber(value: number, options: FormatOptions = {}, language?: Language): string {
    const targetLanguage = language || this.currentLanguage;
    const locale = this.getLocaleFromLanguage(targetLanguage);

    try {
      return new Intl.NumberFormat(locale, options).format(value);
    } catch (error) {
      if (this.config.debug) {
        console.error(`[I18n] Number formatting error:`, error);
      }
      return value.toString();
    }
  }

  /**
   * 格式化货币
   */
  formatCurrency(value: number, currency: string = 'CNY', language?: Language): string {
    return this.formatNumber(
      value,
      {
        style: 'currency',
        currency,
      },
      language
    );
  }

  /**
   * 格式化日期
   */
  formatDate(
    date: Date | number | string,
    options: DateFormatOptions = {},
    language?: Language
  ): string {
    const targetLanguage = language || this.currentLanguage;
    const locale = this.getLocaleFromLanguage(targetLanguage);

    try {
      const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

      return new Intl.DateTimeFormat(locale, options).format(dateObj);
    } catch (error) {
      if (this.config.debug) {
        console.error(`[I18n] Date formatting error:`, error);
      }
      return String(date);
    }
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options: RelativeTimeFormatOptions = {},
    language?: Language
  ): string {
    const targetLanguage = language || this.currentLanguage;
    const locale = this.getLocaleFromLanguage(targetLanguage);

    try {
      const rtf = new Intl.RelativeTimeFormat(locale, options);
      return rtf.format(value, unit);
    } catch (error) {
      if (this.config.debug) {
        console.error(`[I18n] Relative time formatting error:`, error);
      }
      return `${value} ${unit}`;
    }
  }

  /**
   * 格式化列表
   */
  formatList(items: string[], language?: Language): string {
    const targetLanguage = language || this.currentLanguage;
    const locale = this.getLocaleFromLanguage(targetLanguage);

    try {
      return new Intl.ListFormat(locale, {
        style: 'long',
        type: 'conjunction',
      }).format(items);
    } catch (error) {
      if (this.config.debug) {
        console.error(`[I18n] List formatting error:`, error);
      }
      return items.join(', ');
    }
  }

  /**
   * 设置当前语言
   */
  setLanguage(language: Language): void {
    if (!this.isSupported(language)) {
      throw new Error(`Language ${language} is not supported`);
    }

    const oldLanguage = this.currentLanguage;
    this.currentLanguage = language;
    this.emit('languageChanged', { oldLanguage, newLanguage: language });

    if (this.config.debug) {
      console.log(`[I18n] Language changed from ${oldLanguage} to ${language}`);
    }
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): Language[] {
    return this.config.supportedLanguages;
  }

  /**
   * 检查语言是否支持
   */
  isSupported(language: string): language is Language {
    return this.config.supportedLanguages.includes(language as Language);
  }

  /**
   * 获取最接近的支持语言
   */
  getSupportedLanguage(language: string): Language {
    // 精确匹配
    if (this.isSupported(language)) {
      return language as Language;
    }

    // 匹配语言代码（不考虑地区）
    const languageCode = language.split('-')[0];
    for (const supportedLanguage of this.config.supportedLanguages) {
      if (supportedLanguage.startsWith(languageCode)) {
        return supportedLanguage;
      }
    }

    // 返回默认语言
    return this.config.default;
  }

  /**
   * 获取语言配置
   */
  getLanguageConfig(language?: Language): LanguageConfig {
    const targetLanguage = language || this.currentLanguage;
    return LANGUAGE_CONFIGS[targetLanguage];
  }

  /**
   * 添加事件监听器
   */
  on(event: I18nEventType, listener: I18nEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: I18nEventType, listener: I18nEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: I18nEventType, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          if (this.config.debug) {
            console.error(`[I18n] Event listener error:`, error);
          }
        }
      });
    }
  }

  /**
   * 初始化事件监听器
   */
  private initEventListeners(): void {
    // 这里可以添加一些默认的事件监听器
  }

  /**
   * 深度合并对象
   */
  private deepMerge(target: any, source: any): any {
    if (source === null || source === undefined) {
      return target;
    }

    if (typeof source !== 'object' || typeof target !== 'object') {
      return source;
    }

    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key])
        ) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * 获取嵌套翻译值
   */
  private getTranslationValue(
    resources: ResourceBundle | undefined,
    key: string
  ): string | undefined {
    if (!resources) {
      return undefined;
    }

    const keys = key.split('.');
    let current: any = resources;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }

  /**
   * 插值参数
   */
  private interpolateParams(translation: string, params: Record<string, any>): string {
    return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  /**
   * 从语言代码获取Locale
   */
  private getLocaleFromLanguage(language: Language): string {
    // 简单映射，可以根据需要扩展
    switch (language) {
      case 'zh-CN':
        return 'zh-CN';
      case 'en-US':
        return 'en-US';
      default:
        return language;
    }
  }
}
