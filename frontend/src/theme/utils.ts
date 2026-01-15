/**
 * 主题工具函数
 */

import type { ThemeConfig, ColorPalette, CSSVariableMap } from './types';

/**
 * 生成主题颜色变体
 */
export const generateColorVariants = (
  color: string
): {
  lighter: string;
  light: string;
  base: string;
  dark: string;
  darker: string;
} => {
  // 简化的颜色变体生成逻辑
  const hex2rgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgb2hex = (r: number, g: number, b: number) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const { r, g, b } = hex2rgb(color);

  return {
    lighter: rgb2hex(Math.min(255, r + 40), Math.min(255, g + 40), Math.min(255, b + 40)),
    light: rgb2hex(Math.min(255, r + 20), Math.min(255, g + 20), Math.min(255, b + 20)),
    base: color,
    dark: rgb2hex(Math.max(0, r - 20), Math.max(0, g - 20), Math.max(0, b - 20)),
    darker: rgb2hex(Math.max(0, r - 40), Math.max(0, g - 40), Math.max(0, b - 40)),
  };
};

/**
 * 混合两种颜色
 */
export const blendColors = (color1: string, color2: string, ratio: number = 0.5): string => {
  const hex2rgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgb1 = hex2rgb(color1);
  const rgb2 = hex2rgb(color2);

  const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
  const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
  const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);

  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * 获取对比颜色（用于文本）
 */
export const getContrastColor = (backgroundColor: string): string => {
  const hex2rgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const { r, g, b } = hex2rgb(backgroundColor);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * 生成CSS变量
 */
export const generateCSSVariables = (theme: ThemeConfig): CSSVariableMap => {
  const variables: CSSVariableMap = {};

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

  // 文本颜色变量
  Object.entries(colors.text).forEach(([key, value]) => {
    variables[`--color-text-${key}`] = value;
  });

  // 颜色变体
  const primaryVariants = generateColorVariants(colors.primary);
  Object.entries(primaryVariants).forEach(([key, value]) => {
    variables[`--color-primary-${key}`] = value;
  });

  // 字体变量
  variables['--font-family-primary'] = theme.typography.fontFamily.primary;
  variables['--font-family-monospace'] = theme.typography.fontFamily.monospace;
  variables['--font-family-sans'] = theme.typography.fontFamily.sans;

  // 字号变量
  Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
    variables[`--font-size-${key}`] = value;
  });

  // 字重变量
  Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
    variables[`--font-weight-${key}`] = value.toString();
  });

  // 行高变量
  Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
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
};

/**
 * 将CSS变量应用到样式对象
 */
export const applyCSSVariables = (variables: CSSVariableMap): React.CSSProperties => {
  const style: React.CSSProperties = {};

  Object.entries(variables).forEach(([key, value]) => {
    // 移除 -- 前缀，因为React style对象不需要它
    const cssKey = key.replace(/^--/, '');
    // 转换为 camelCase
    const reactKey = cssKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    (style as any)[reactKey] = value;
  });

  return style;
};

/**
 * 响应式断点工具
 */
export const createBreakpointHelper = (breakpoints: ThemeConfig['breakpoints']) => {
  const mediaQuery = (breakpoint: keyof typeof breakpoints, direction: 'up' | 'down' = 'up') => {
    const value = breakpoints[breakpoint];
    if (direction === 'up') {
      return `@media (min-width: ${value})`;
    } else {
      return `@media (max-width: ${value})`;
    }
  };

  const between = (min: keyof typeof breakpoints, max: keyof typeof breakpoints) => {
    const minValue = breakpoints[min];
    const maxValue = breakpoints[max];
    return `@media (min-width: ${minValue}) and (max-width: ${maxValue})`;
  };

  return {
    up: (breakpoint: keyof typeof breakpoints) => mediaQuery(breakpoint, 'up'),
    down: (breakpoint: keyof typeof breakpoints) => mediaQuery(breakpoint, 'down'),
    between,
    only: (breakpoint: keyof typeof breakpoints) => {
      const breakpointKeys = Object.keys(breakpoints) as (keyof typeof breakpoints)[];
      const index = breakpointKeys.indexOf(breakpoint);
      const nextBreakpoint = breakpointKeys[index + 1];

      if (!nextBreakpoint) {
        return mediaQuery(breakpoint, 'up');
      }

      return between(breakpoint, nextBreakpoint);
    },
  };
};

/**
 * 主题色彩工具
 */
export const createColorHelper = (colors: ColorPalette) => {
  const get = (colorName: keyof ColorPalette) => colors[colorName];
  const alpha = (colorName: keyof ColorPalette, alpha: number) => {
    const color = colors[colorName];
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  };

  const variants = (colorName: keyof ColorPalette) => {
    const color = colors[colorName];
    return generateColorVariants(color);
  };

  return {
    get,
    alpha,
    variants,
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    background: colors.background,
    surface: colors.surface,
    border: colors.border,
    text: colors.text,
  };
};

/**
 * 主题间距工具
 */
export const createSpacingHelper = (spacing: ThemeConfig['spacing']) => {
  const get = (key: keyof typeof spacing) => spacing[key];
  const px = (key: keyof typeof spacing) => {
    const value = spacing[key];
    return parseFloat(value) * (value.includes('rem') ? 16 : 1);
  };

  const create = (value: string | number) => {
    if (typeof value === 'number') {
      return `${value / 16}rem`;
    }
    return value;
  };

  return {
    get,
    px,
    create,
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    '2xl': spacing['2xl'],
    '3xl': spacing['3xl'],
    '4xl': spacing['4xl'],
    '5xl': spacing['5xl'],
  };
};
