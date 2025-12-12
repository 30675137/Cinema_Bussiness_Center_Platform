/**
 * 国际化配置入口文件
 * 提供多语言支持和动态切换功能
 */

import { I18n } from './core';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import { Language } from './types';

// 创建国际化实例
export const i18n = new I18n({
  fallback: 'zh-CN',
  default: 'zh-CN',
  supportedLanguages: ['zh-CN', 'en-US'],
  debug: process.env.NODE_ENV === 'development'
});

// 加载语言包
i18n.addResources('zh-CN', zhCN);
i18n.addResources('en-US', enUS);

// 导出常用函数和类型
export { Language } from './types';
export { useTranslation, useI18n } from './hooks';
export { i18n };

// 初始化语言设置
export const initI18n = () => {
  // 从localStorage读取保存的语言设置
  const savedLanguage = localStorage.getItem('i18n-language');

  if (savedLanguage && i18n.isSupported(savedLanguage)) {
    i18n.setLanguage(savedLanguage);
  } else {
    // 根据浏览器语言自动设置
    const browserLanguage = navigator.language || 'zh-CN';
    const supportedLanguage = i18n.getSupportedLanguage(browserLanguage);
    i18n.setLanguage(supportedLanguage);
  }

  // 监听语言变化并保存到localStorage
  i18n.on('languageChanged', (language: Language) => {
    localStorage.setItem('i18n-language', language);
  });

  return i18n;
};

// 全局初始化
export const globalI18n = initI18n();