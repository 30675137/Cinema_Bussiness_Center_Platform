/**
 * 场景包编辑器响应式设计工具
 * Feature: 001-scenario-package-tabs
 * T094: Responsive design breakpoints for tablet and mobile
 */

import { useState, useEffect, useMemo } from 'react';

/**
 * 断点定义（与 Ant Design 保持一致）
 */
export const BREAKPOINTS = {
  xs: 480, // 手机竖屏
  sm: 576, // 手机横屏
  md: 768, // 平板竖屏
  lg: 992, // 平板横屏 / 小屏笔记本
  xl: 1200, // 桌面
  xxl: 1600, // 大屏桌面
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * 媒体查询字符串
 */
export const MEDIA_QUERIES = {
  xs: `(max-width: ${BREAKPOINTS.xs - 1}px)`,
  sm: `(min-width: ${BREAKPOINTS.xs}px) and (max-width: ${BREAKPOINTS.sm - 1}px)`,
  md: `(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`,
  lg: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  xl: `(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`,
  xxl: `(min-width: ${BREAKPOINTS.xl}px)`,

  // 常用组合
  mobile: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
} as const;

/**
 * 获取当前断点
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'lg';

  const width = window.innerWidth;

  if (width < BREAKPOINTS.xs) return 'xs';
  if (width < BREAKPOINTS.sm) return 'sm';
  if (width < BREAKPOINTS.md) return 'md';
  if (width < BREAKPOINTS.lg) return 'lg';
  if (width < BREAKPOINTS.xl) return 'xl';
  return 'xxl';
}

/**
 * 响应式状态 Hook
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getCurrentBreakpoint);

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === 'xxl';
  const isTouch = isMobile || isTablet;

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
  };
}

/**
 * 媒体查询 Hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    // 初始检查
    setMatches(mediaQueryList.matches);

    // 监听变化
    mediaQueryList.addEventListener('change', listener);
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * 响应式值 Hook
 * 根据当前断点返回对应的值
 */
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>> & { default: T }): T {
  const { breakpoint } = useBreakpoint();

  return useMemo(() => {
    // 按优先级查找：当前断点 -> 更小的断点 -> default
    const breakpointOrder: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = breakpointOrder.indexOf(breakpoint);

    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp] as T;
      }
    }

    return values.default;
  }, [breakpoint, values]);
}

/**
 * 场景包编辑器响应式布局配置
 */
export const editorLayoutConfig = {
  /**
   * 标签页布局
   */
  tabs: {
    mobile: {
      tabPosition: 'top' as const,
      size: 'small' as const,
      centered: false,
    },
    tablet: {
      tabPosition: 'top' as const,
      size: 'middle' as const,
      centered: true,
    },
    desktop: {
      tabPosition: 'top' as const,
      size: 'large' as const,
      centered: false,
    },
  },

  /**
   * 表单布局
   */
  form: {
    mobile: {
      layout: 'vertical' as const,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 },
    },
    tablet: {
      layout: 'horizontal' as const,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    },
    desktop: {
      layout: 'horizontal' as const,
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    },
  },

  /**
   * 卡片网格
   */
  grid: {
    mobile: { gutter: [8, 8] as [number, number], column: 1 },
    tablet: { gutter: [16, 16] as [number, number], column: 2 },
    desktop: { gutter: [24, 24] as [number, number], column: 3 },
  },

  /**
   * 模态框宽度
   */
  modal: {
    mobile: '100%',
    tablet: 600,
    desktop: 800,
  },

  /**
   * 表格滚动配置
   */
  table: {
    mobile: { x: 600 },
    tablet: { x: 800 },
    desktop: { x: undefined },
  },
};

/**
 * 获取当前设备类型的布局配置
 */
export function useEditorLayout() {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  return useMemo(() => {
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    return {
      deviceType,
      tabs: editorLayoutConfig.tabs[deviceType],
      form: editorLayoutConfig.form[deviceType],
      grid: editorLayoutConfig.grid[deviceType],
      modal: editorLayoutConfig.modal[deviceType],
      table: editorLayoutConfig.table[deviceType],
    };
  }, [isMobile, isTablet, isDesktop]);
}

/**
 * 响应式样式生成器
 */
export const responsiveStyles = {
  /**
   * 容器 padding
   */
  containerPadding: (isMobile: boolean, isTablet: boolean): React.CSSProperties => ({
    padding: isMobile ? 12 : isTablet ? 16 : 24,
  }),

  /**
   * 标题字体大小
   */
  titleSize: (isMobile: boolean): React.CSSProperties => ({
    fontSize: isMobile ? 16 : 20,
    fontWeight: 500,
  }),

  /**
   * 间距
   */
  spacing: (isMobile: boolean, isTablet: boolean): number => {
    return isMobile ? 8 : isTablet ? 12 : 16;
  },

  /**
   * 按钮大小
   */
  buttonSize: (isMobile: boolean): 'small' | 'middle' | 'large' => {
    return isMobile ? 'small' : 'middle';
  },
};

/**
 * 隐藏元素的响应式类名
 */
export const hideOnDevice = {
  mobile: 'hidden-mobile',
  tablet: 'hidden-tablet',
  desktop: 'hidden-desktop',
};

/**
 * 响应式 CSS 变量
 */
export const cssVariables = `
  :root {
    --editor-padding: 24px;
    --editor-gap: 16px;
    --editor-card-padding: 20px;
  }
  
  @media (max-width: ${BREAKPOINTS.md - 1}px) {
    :root {
      --editor-padding: 12px;
      --editor-gap: 8px;
      --editor-card-padding: 12px;
    }
  }
  
  @media (min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px) {
    :root {
      --editor-padding: 16px;
      --editor-gap: 12px;
      --editor-card-padding: 16px;
    }
  }
  
  .hidden-mobile {
    @media (max-width: ${BREAKPOINTS.md - 1}px) {
      display: none !important;
    }
  }
  
  .hidden-tablet {
    @media (min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px) {
      display: none !important;
    }
  }
  
  .hidden-desktop {
    @media (min-width: ${BREAKPOINTS.lg}px) {
      display: none !important;
    }
  }
`;

export default {
  BREAKPOINTS,
  MEDIA_QUERIES,
  getCurrentBreakpoint,
  useBreakpoint,
  useMediaQuery,
  useResponsiveValue,
  editorLayoutConfig,
  useEditorLayout,
  responsiveStyles,
  hideOnDevice,
  cssVariables,
};
