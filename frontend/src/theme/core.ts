/**
 * 主题系统核心类
 */

import {
  ThemeMode,
  ThemeConfig,
  ThemeSettings,
  ThemePreset,
  ThemeCustomization,
  ThemeEventType,
  ThemeEventListener,
  CSSVariableMap
} from './types';

/**
 * 主题管理核心类
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeConfig;
  private currentMode: ThemeMode = 'light';
  private customThemes: ThemeConfig[] = [];
  private eventListeners: Map<ThemeEventType, Set<ThemeEventListener>> = new Map();
  private settings: ThemeSettings;

  private constructor() {
    this.settings = {
      mode: 'light',
      currentTheme: 'default',
      customThemes: [],
      enableAnimations: true,
      enableHighContrast: false,
      enableReducedMotion: false,
      fontSize: 'medium',
      fontFamily: 'Inter'
    };

    this.currentTheme = this.createDefaultTheme('light');
    this.initEventListeners();
    this.loadSettings();
    this.applyTheme();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * 设置主题模式
   */
  setMode(mode: ThemeMode): void {
    if (mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentMode = prefersDark ? 'dark' : 'light';

      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.settings.mode === 'auto') {
          this.currentMode = e.matches ? 'dark' : 'light';
          this.applyTheme();
        }
      });
    } else {
      this.currentMode = mode;
    }

    this.settings.mode = mode;
    this.saveSettings();
    this.applyTheme();
    this.emit('modeChanged', { mode: this.currentMode });
  }

  /**
   * 获取当前模式
   */
  getCurrentMode(): ThemeMode {
    return this.settings.mode;
  }

  /**
   * 获取实际应用的模式
   */
  getEffectiveMode(): ThemeMode {
    return this.currentMode;
  }

  /**
   * 应用主题配置
   */
  applyThemeConfig(theme: Partial<ThemeConfig>): void {
    this.currentTheme = { ...this.currentTheme, ...theme };
    this.applyTheme();
    this.emit('themeChanged', { theme: this.currentTheme });
  }

  /**
   * 创建自定义主题
   */
  createCustomTheme(customization: ThemeCustomization, name: string): ThemeConfig {
    const baseTheme = this.getBaseTheme();
    const customTheme: ThemeConfig = {
      ...baseTheme,
      id: `custom-${Date.now()}`,
      name,
      mode: this.currentMode,
      ...customization
    };

    return customTheme;
  }

  /**
   * 添加自定义主题
   */
  addCustomTheme(theme: ThemeConfig): void {
    this.customThemes.push(theme);
    this.settings.customThemes.push(theme);
    this.saveSettings();
    this.emit('customThemeAdded', { theme });
  }

  /**
   * 移除自定义主题
   */
  removeCustomTheme(themeId: string): void {
    this.customThemes = this.customThemes.filter(theme => theme.id !== themeId);
    this.settings.customThemes = this.settings.customThemes.filter(theme => theme.id !== themeId);
    this.saveSettings();
    this.emit('customThemeRemoved', { themeId });
  }

  /**
   * 获取所有自定义主题
   */
  getCustomThemes(): ThemeConfig[] {
    return [...this.customThemes];
  }

  /**
   * 获取当前主题配置
   */
  getCurrentTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }

  /**
   * 获取主题设置
   */
  getSettings(): ThemeSettings {
    return { ...this.settings };
  }

  /**
   * 更新主题设置
   */
  updateSettings(settings: Partial<ThemeSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();

    // 如果模式发生变化，重新应用
    if (settings.mode && settings.mode !== this.getCurrentMode()) {
      this.setMode(settings.mode);
    }
  }

  /**
   * 获取CSS变量映射
   */
  getCSSVariables(): CSSVariableMap {
    const variables: CSSVariableMap = {};
    const theme = this.currentTheme;

    // 颜色变量
    const colors = theme.colors;
    variables['--color-primary'] = colors.primary;
    variables['--color-secondary'] = colors.secondary;
    variables['--color-success'] = colors.success;
    variables['--color-warning'] = colors.warning;
    variables['--color-error'] = colors.error;
    variables['--color-info'] = colors.info;
    variables['--color-background'] = colors.background;
    variables['--color-surface'] = colors.surface;
    variables['--color-text-primary'] = colors.text.primary;
    variables['--color-text-secondary'] = colors.text.secondary;
    variables['--color-text-disabled'] = colors.text.disabled;
    variables['--color-text-inverse'] = colors.text.inverse;
    variables['--color-border'] = colors.border;
    variables['--color-shadow'] = colors.shadow;

    // 字体变量
    const typography = theme.typography;
    variables['--font-family-primary'] = typography.fontFamily.primary;
    variables['--font-family-monospace'] = typography.fontFamily.monospace;
    variables['--font-family-sans'] = typography.fontFamily.sans;

    // 字号变量
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      variables[`--font-size-${key}`] = value;
    });

    // 字重变量
    Object.entries(typography.fontWeight).forEach(([key, value]) => {
      variables[`--font-weight-${key}`] = value.toString();
    });

    // 行高变量
    Object.entries(typography.lineHeight).forEach(([key, value]) => {
      variables[`--line-height-${key}`] = value.toString();
    });

    // 间距变量
    Object.entries(theme.spacing).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value;
    });

    // 圆角变量
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      variables[`--border-radius-${key}`] = value;
    });

    // 阴影变量
    Object.entries(theme.boxShadow).forEach(([key, value]) => {
      variables[`--shadow-${key}`] = value;
    });

    // 断点变量
    Object.entries(theme.breakpoints).forEach(([key, value]) => {
      variables[`--breakpoint-${key}`] = value;
    });

    // 动画变量
    Object.entries(theme.animation.duration).forEach(([key, value]) => {
      variables[`--animation-duration-${key}`] = value;
    });

    Object.entries(theme.animation.easing).forEach(([key, value]) => {
      variables[`--animation-easing-${key}`] = value;
    });

    // Z-index变量
    Object.entries(theme.zIndex).forEach(([key, value]) => {
      variables[`--z-index-${key}`] = value.toString();
    });

    return variables;
  }

  /**
   * 应用主题到DOM
   */
  private applyTheme(): void {
    // 检查 DOM 是否准备好
    if (typeof document === 'undefined' || !document.documentElement) {
      return;
    }
    
    const root = document.documentElement;
    const variables = this.getCSSVariables();

    // 应用CSS变量
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // 设置主题模式类名
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${this.currentMode}`);

    // 设置字体大小类名
    root.classList.remove('text-size-small', 'text-size-medium', 'text-size-large');
    root.classList.add(`text-size-${this.settings.fontSize}`);

    // 设置高对比度类名
    if (this.settings.enableHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 设置减少动画类名
    if (this.settings.enableReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }

  /**
   * 创建默认主题
   */
  private createDefaultTheme(mode: ThemeMode): ThemeConfig {
    const isDark = mode === 'dark';

    return {
      id: 'default',
      name: 'Default',
      description: 'Default theme',
      mode,
      colors: {
        primary: isDark ? '#1890ff' : '#1890ff',
        secondary: isDark ? '#722ed1' : '#722ed1',
        success: isDark ? '#52c41a' : '#52c41a',
        warning: isDark ? '#faad14' : '#faad14',
        error: isDark ? '#ff4d4f' : '#ff4d4f',
        info: isDark ? '#13c2c2' : '#13c2c2',
        background: isDark ? '#141414' : '#ffffff',
        surface: isDark ? '#1f1f1f' : '#fafafa',
        text: {
          primary: isDark ? '#ffffff' : '#000000',
          secondary: isDark ? '#a6a6a6' : '#595959',
          disabled: isDark ? '#434343' : '#bfbfbf',
          inverse: isDark ? '#000000' : '#ffffff'
        },
        border: isDark ? '#434343' : '#d9d9d9',
        shadow: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'
      },
      typography: {
        fontFamily: {
          primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          monospace: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
          sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeight: {
          tight: 1.25,
          normal: 1.5,
          relaxed: 1.75
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
        '5xl': '8rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
      },
      breakpoints: {
        xs: '480px',
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        '2xl': '1600px'
      },
      animation: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: {
          ease: 'ease',
          easeIn: 'ease-in',
          easeOut: 'ease-out',
          easeInOut: 'ease-in-out'
        }
      },
      zIndex: {
        hide: -1,
        auto: 'auto',
        base: 0,
        docked: 10,
        dropdown: 1000,
        sticky: 1100,
        banner: 1200,
        overlay: 1300,
        modal: 1400,
        popover: 1500,
        skipLink: 1600,
        toast: 1700,
        tooltip: 1800,
        menu: 1900,
        actionMenu: 2000,
        notification: 2100,
        mask: 2200,
        fullscreen: 2300
      }
    };
  }

  /**
   * 获取基础主题
   */
  private getBaseTheme(): ThemeConfig {
    return this.createDefaultTheme(this.currentMode);
  }

  /**
   * 保存设置到本地存储
   */
  private saveSettings(): void {
    try {
      localStorage.setItem('theme-settings', JSON.stringify(this.settings));
      localStorage.setItem('custom-themes', JSON.stringify(this.customThemes));
    } catch (error) {
      console.warn('Failed to save theme settings:', error);
    }
  }

  /**
   * 从本地存储加载设置
   */
  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem('theme-settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }

      const savedCustomThemes = localStorage.getItem('custom-themes');
      if (savedCustomThemes) {
        this.customThemes = JSON.parse(savedCustomThemes);
        this.settings.customThemes = this.customThemes;
      }

      // 应用保存的模式
      this.setMode(this.settings.mode);
    } catch (error) {
      console.warn('Failed to load theme settings:', error);
    }
  }

  /**
   * 初始化事件监听器
   */
  private initEventListeners(): void {
    // 这里可以添加一些默认的事件监听器
  }

  /**
   * 添加事件监听器
   */
  on(event: ThemeEventType, listener: ThemeEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: ThemeEventType, listener: ThemeEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: ThemeEventType, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Theme event listener error:', error);
        }
      });
    }
  }
}

// 创建全局主题管理器实例
export const themeManager = ThemeManager.getInstance();