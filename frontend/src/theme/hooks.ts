/**
 * 主题系统React Hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { themeManager } from './core';
import type { ThemeMode, ThemeConfig, ThemeSettings, ThemeCustomization } from './types';

/**
 * 使用主题的Hook
 */
export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themeManager.getCurrentTheme());
  const [currentMode, setCurrentMode] = useState<ThemeMode>(themeManager.getCurrentMode());

  // 监听主题变化
  useEffect(() => {
    const handleThemeChange = ({ theme }: { theme: ThemeConfig }) => {
      setCurrentTheme(theme);
    };

    const handleModeChange = ({ mode }: { mode: ThemeMode }) => {
      setCurrentMode(mode);
    };

    themeManager.on('themeChanged', handleThemeChange);
    themeManager.on('modeChanged', handleModeChange);

    return () => {
      themeManager.off('themeChanged', handleThemeChange);
      themeManager.off('modeChanged', handleModeChange);
    };
  }, []);

  // 切换主题模式
  const setMode = useCallback((mode: ThemeMode) => {
    themeManager.setMode(mode);
  }, []);

  // 应用自定义主题
  const applyThemeConfig = useCallback((theme: Partial<ThemeConfig>) => {
    themeManager.applyThemeConfig(theme);
  }, []);

  // 获取主题颜色
  const colors = useMemo(() => currentTheme.colors, [currentTheme]);

  // 获取主题字体配置
  const typography = useMemo(() => currentTheme.typography, [currentTheme]);

  // 获取主题间距配置
  const spacing = useMemo(() => currentTheme.spacing, [currentTheme]);

  // 获取主题圆角配置
  const borderRadius = useMemo(() => currentTheme.borderRadius, [currentTheme]);

  // 获取主题阴影配置
  const boxShadow = useMemo(() => currentTheme.boxShadow, [currentTheme]);

  // 获取主题断点配置
  const breakpoints = useMemo(() => currentTheme.breakpoints, [currentTheme]);

  // 获取主题动画配置
  const animation = useMemo(() => currentTheme.animation, [currentTheme]);

  // 获取Z-index配置
  const zIndex = useMemo(() => currentTheme.zIndex, [currentTheme]);

  return {
    theme: currentTheme,
    mode: currentMode,
    effectiveMode: themeManager.getEffectiveMode(),
    setMode,
    applyThemeConfig,
    colors,
    typography,
    spacing,
    borderRadius,
    boxShadow,
    breakpoints,
    animation,
    zIndex,
  };
};

/**
 * 使用主题设置的Hook
 */
export const useThemeSettings = () => {
  const [settings, setSettings] = useState<ThemeSettings>(themeManager.getSettings());

  // 监听设置变化（这里简化处理，实际应用中可能需要更复杂的逻辑）
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSettings = themeManager.getSettings();
      setSettings(currentSettings);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 更新设置
  const updateSettings = useCallback((newSettings: Partial<ThemeSettings>) => {
    themeManager.updateSettings(newSettings);
  }, []);

  // 切换动画
  const toggleAnimations = useCallback(() => {
    themeManager.updateSettings({
      enableAnimations: !settings.enableAnimations,
    });
  }, [settings.enableAnimations]);

  // 切换高对比度
  const toggleHighContrast = useCallback(() => {
    themeManager.updateSettings({
      enableHighContrast: !settings.enableHighContrast,
    });
  }, [settings.enableHighContrast]);

  // 切换减少动画
  const toggleReducedMotion = useCallback(() => {
    themeManager.updateSettings({
      enableReducedMotion: !settings.enableReducedMotion,
    });
  }, [settings.enableReducedMotion]);

  // 设置字体大小
  const setFontSize = useCallback((fontSize: 'small' | 'medium' | 'large') => {
    themeManager.updateSettings({ fontSize });
  }, []);

  // 设置字体
  const setFontFamily = useCallback((fontFamily: string) => {
    themeManager.updateSettings({ fontFamily });
  }, []);

  return {
    settings,
    updateSettings,
    toggleAnimations,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    setFontFamily,
  };
};

/**
 * 使用自定义主题的Hook
 */
export const useCustomThemes = () => {
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>(themeManager.getCustomThemes());

  // 监听自定义主题变化
  useEffect(() => {
    const handleCustomThemeAdded = ({ theme }: { theme: ThemeConfig }) => {
      setCustomThemes(themeManager.getCustomThemes());
    };

    const handleCustomThemeRemoved = () => {
      setCustomThemes(themeManager.getCustomThemes());
    };

    themeManager.on('customThemeAdded', handleCustomThemeAdded);
    themeManager.on('customThemeRemoved', handleCustomThemeRemoved);

    return () => {
      themeManager.off('customThemeAdded', handleCustomThemeAdded);
      themeManager.off('customThemeRemoved', handleCustomThemeRemoved);
    };
  }, []);

  // 创建自定义主题
  const createCustomTheme = useCallback(
    (customization: ThemeCustomization, name: string): ThemeConfig => {
      return themeManager.createCustomTheme(customization, name);
    },
    []
  );

  // 添加自定义主题
  const addCustomTheme = useCallback((theme: ThemeConfig) => {
    themeManager.addCustomTheme(theme);
  }, []);

  // 移除自定义主题
  const removeCustomTheme = useCallback((themeId: string) => {
    themeManager.removeCustomTheme(themeId);
  }, []);

  // 克隆主题
  const cloneTheme = useCallback(
    (baseTheme: ThemeConfig, name: string): ThemeConfig => {
      const cloned: ThemeConfig = {
        ...baseTheme,
        id: `custom-${Date.now()}`,
        name,
        description: `Cloned from ${baseTheme.name}`,
      };
      addCustomTheme(cloned);
      return cloned;
    },
    [addCustomTheme]
  );

  return {
    customThemes,
    createCustomTheme,
    addCustomTheme,
    removeCustomTheme,
    cloneTheme,
  };
};

/**
 * 使用主题切换器的Hook
 */
export const useThemeToggle = () => {
  const { mode, setMode } = useTheme();

  // 切换到下一个模式
  const nextMode = useCallback(() => {
    const modes: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  }, [mode, setMode]);

  // 切换明暗模式（跳过auto）
  const toggleLightDark = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  // 设置为明亮模式
  const setLightMode = useCallback(() => {
    setMode('light');
  }, [setMode]);

  // 设置为暗黑模式
  const setDarkMode = useCallback(() => {
    setMode('dark');
  }, [setMode]);

  // 设置为自动模式
  const setAutoMode = useCallback(() => {
    setMode('auto');
  }, [setMode]);

  return {
    mode,
    nextMode,
    toggleLightDark,
    setLightMode,
    setDarkMode,
    setAutoMode,
  };
};

/**
 * 使用主题CSS变量的Hook
 */
export const useThemeCSSVariables = () => {
  const cssVariables = useMemo(() => {
    return themeManager.getCSSVariables();
  }, []);

  // 获取CSS变量值
  const getVariable = useCallback(
    (key: string): string => {
      return cssVariables[key] || '';
    },
    [cssVariables]
  );

  // 生成CSS变量字符串
  const getCSSVariableString = useCallback((): string => {
    return Object.entries(cssVariables)
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n  ');
  }, [cssVariables]);

  // 应用CSS变量到元素
  const applyToElement = useCallback(
    (element: HTMLElement) => {
      Object.entries(cssVariables).forEach(([key, value]) => {
        element.style.setProperty(key, value);
      });
    },
    [cssVariables]
  );

  return {
    cssVariables,
    getVariable,
    getCSSVariableString,
    applyToElement,
  };
};

/**
 * 使用主题适配的Hook（根据主题模式返回不同值）
 */
export const useThemeAdapt = <T>(options: { light?: T; dark?: T; auto?: T }): T | undefined => {
  const { effectiveMode } = useTheme();

  return useMemo(() => {
    if (effectiveMode === 'light' && options.light !== undefined) {
      return options.light;
    }
    if (effectiveMode === 'dark' && options.dark !== undefined) {
      return options.dark;
    }
    if (options.auto !== undefined) {
      return options.auto;
    }
    return undefined;
  }, [effectiveMode, options]);
};
