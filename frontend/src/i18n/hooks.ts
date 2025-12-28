/**
 * 国际化React Hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { i18n, Language } from './index';
import { LanguageConfig } from './types';

/**
 * 使用翻译的Hook
 */
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(i18n.getCurrentLanguage());

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = ({ newLanguage }: { newLanguage: Language }) => {
      setCurrentLanguage(newLanguage);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // 翻译函数
  const t = useCallback((key: string, params?: Record<string, any>, language?: Language) => {
    return i18n.t(key, params, language);
  }, []);

  // 格式化函数
  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions, language?: Language) => {
    return i18n.formatNumber(value, options, language);
  }, []);

  const formatCurrency = useCallback((value: number, currency?: string, language?: Language) => {
    return i18n.formatCurrency(value, currency, language);
  }, []);

  const formatDate = useCallback((date: Date | number | string, options?: Intl.DateTimeFormatOptions, language?: Language) => {
    return i18n.formatDate(date, options, language);
  }, []);

  const formatRelativeTime = useCallback((
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
    language?: Language
  ) => {
    return i18n.formatRelativeTime(value, unit, options, language);
  }, []);

  const formatList = useCallback((items: string[], language?: Language) => {
    return i18n.formatList(items, language);
  }, []);

  // 切换语言
  const changeLanguage = useCallback((language: Language) => {
    i18n.setLanguage(language);
  }, []);

  return {
    t,
    currentLanguage,
    changeLanguage,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    formatList
  };
};

/**
 * 使用国际化实例的Hook
 */
export const useI18n = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(i18n.getCurrentLanguage());
  const [supportedLanguages] = useState<Language[]>(i18n.getSupportedLanguages());

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = ({ newLanguage }: { newLanguage: Language }) => {
      setCurrentLanguage(newLanguage);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  // 获取语言配置
  const currentLanguageConfig = useMemo(() => {
    return i18n.getLanguageConfig(currentLanguage);
  }, [currentLanguage]);

  const supportedLanguageConfigs = useMemo(() => {
    return supportedLanguages.map(lang => i18n.getLanguageConfig(lang));
  }, [supportedLanguages]);

  // 切换语言
  const changeLanguage = useCallback((language: Language) => {
    i18n.setLanguage(language);
  }, []);

  // 检查语言是否支持
  const isSupported = useCallback((language: string) => {
    return i18n.isSupported(language);
  }, []);

  // 获取最接近的支持语言
  const getSupportedLanguage = useCallback((language: string) => {
    return i18n.getSupportedLanguage(language);
  }, []);

  return {
    i18n,
    currentLanguage,
    currentLanguageConfig,
    supportedLanguages,
    supportedLanguageConfigs,
    changeLanguage,
    isSupported,
    getSupportedLanguage
  };
};

/**
 * 使用语言选择器的Hook
 */
export const useLanguageSelector = () => {
  const { currentLanguage, changeLanguage, supportedLanguageConfigs } = useI18n();

  // 切换到下一个语言
  const nextLanguage = useCallback(() => {
    const currentIndex = supportedLanguageConfigs.findIndex(
      config => config.code === currentLanguage
    );
    const nextIndex = (currentIndex + 1) % supportedLanguageConfigs.length;
    changeLanguage(supportedLanguageConfigs[nextIndex].code);
  }, [currentLanguage, changeLanguage, supportedLanguageConfigs]);

  // 切换语言并保存偏好
  const changeLanguageWithPreference = useCallback((language: Language) => {
    changeLanguage(language);
    localStorage.setItem('i18n-language', language);
  }, [changeLanguage]);

  // 从浏览器语言自动设置
  const setFromBrowser = useCallback(() => {
    const browserLanguage = navigator.language || 'zh-CN';
    const supportedLanguage = i18n.getSupportedLanguage(browserLanguage);
    changeLanguageWithPreference(supportedLanguage);
  }, [changeLanguageWithPreference]);

  return {
    currentLanguage,
    supportedLanguages: supportedLanguageConfigs,
    changeLanguage: changeLanguageWithPreference,
    nextLanguage,
    setFromBrowser
  };
};

/**
 * 使用格式化工具的Hook
 */
export const useFormatter = (language?: Language) => {
  const targetLanguage = language || i18n.getCurrentLanguage();

  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions) => {
    return i18n.formatNumber(value, options, targetLanguage);
  }, [targetLanguage]);

  const formatCurrency = useCallback((value: number, currency?: string) => {
    return i18n.formatCurrency(value, currency, targetLanguage);
  }, [targetLanguage]);

  const formatDate = useCallback((date: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
    return i18n.formatDate(date, options, targetLanguage);
  }, [targetLanguage]);

  const formatTime = useCallback((date: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
    return i18n.formatDate(date, { ...options, timeStyle: 'short' }, targetLanguage);
  }, [targetLanguage]);

  const formatDateTime = useCallback((date: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
    return i18n.formatDate(date, { ...options, dateStyle: 'short', timeStyle: 'short' }, targetLanguage);
  }, [targetLanguage]);

  const formatRelativeTime = useCallback((
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions
  ) => {
    return i18n.formatRelativeTime(value, unit, options, targetLanguage);
  }, [targetLanguage]);

  const formatList = useCallback((items: string[]) => {
    return i18n.formatList(items, targetLanguage);
  }, [targetLanguage]);

  return {
    formatNumber,
    formatCurrency,
    formatDate,
    formatTime,
    formatDateTime,
    formatRelativeTime,
    formatList
  };
};