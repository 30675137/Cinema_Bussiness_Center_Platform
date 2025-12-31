import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言资源
import zhCN from './zh-CN.json';
import enUS from './en-US.json';

// 资源配置
const resources = {
  'zh-CN': {
    translation: zhCN,
  },
  'en-US': {
    translation: enUS,
  },
};

// 初始化i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh-CN', // 默认使用中文
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React已经默认转义
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
