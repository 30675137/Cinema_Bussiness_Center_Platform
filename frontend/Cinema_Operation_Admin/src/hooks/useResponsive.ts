/**
 * 响应式设计Hook
 * 处理不同屏幕尺寸下的布局适配和断点检测
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * 响应式断点配置
 */
export const BREAKPOINTS = {
  xs: 0,      // 手机竖屏
  sm: 576,    // 手机横屏
  md: 768,    // 平板竖屏
  lg: 992,    // 平板横屏/小屏幕笔记本
  xl: 1200,   // 桌面显示器
  xxl: 1600,  // 大屏幕显示器
} as const;

/**
 * 断点类型
 */
export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * 屏幕尺寸类型
 */
export interface ScreenSize {
  width: number;
  height: number;
}

/**
 * 响应式Hook返回值接口
 */
export interface UseResponsiveReturn {
  // 当前屏幕尺寸
  width: number;
  height: number;

  // 当前断点状态
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  isXxl: boolean;

  // 范围判断
  isMobile: boolean;     // xs, sm
  isTablet: boolean;     // md, lg
  isDesktop: boolean;    // xl, xxl

  // 特定尺寸判断
  isSmallScreen: boolean;  // xs, sm, md
  isLargeScreen: boolean;  // lg, xl, xxl

  // 方向判断
  isPortrait: boolean;   // 竖屏
  isLandscape: boolean;  // 横屏

  // 当前断点
  currentBreakpoint: Breakpoint;

  // 工具方法
  getBreakpoint: (width: number) => Breakpoint;
  isBreakpointUp: (breakpoint: Breakpoint) => boolean;
  isBreakpointDown: (breakpoint: Breakpoint) => boolean;
  isBreakpointBetween: (min: Breakpoint, max: Breakpoint) => boolean;
}

/**
 * 响应式Hook
 */
export const useResponsive = (): UseResponsiveReturn => {
  const [screenSize, setScreenSize] = useState<ScreenSize>(() => {
    // 初始化时使用window尺寸，支持SSR
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    return { width: 0, height: 0 };
  });

  // 监听窗口尺寸变化
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // 初始设置
    handleResize();

    // 添加事件监听
    window.addEventListener('resize', handleResize, { passive: true });

    // 清理事件监听
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  /**
   * 根据宽度获取断点
   */
  const getBreakpoint = useCallback((width: number): Breakpoint => {
    if (width >= BREAKPOINTS.xxl) return 'xxl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }, []);

  /**
   * 判断是否大于等于指定断点
   */
  const isBreakpointUp = useCallback((breakpoint: Breakpoint): boolean => {
    return screenSize.width >= BREAKPOINTS[breakpoint];
  }, [screenSize.width]);

  /**
   * 判断是否小于指定断点
   */
  const isBreakpointDown = useCallback((breakpoint: Breakpoint): boolean => {
    return screenSize.width < BREAKPOINTS[breakpoint];
  }, [screenSize.width]);

  /**
   * 判断是否在指定断点范围内
   */
  const isBreakpointBetween = useCallback((min: Breakpoint, max: Breakpoint): boolean => {
    const minWidth = BREAKPOINTS[min];
    const maxWidth = BREAKPOINTS[max];
    return screenSize.width >= minWidth && screenSize.width < maxWidth;
  }, [screenSize.width]);

  const currentBreakpoint = getBreakpoint(screenSize.width);
  const width = screenSize.width;
  const height = screenSize.height;

  // 断点状态
  const isXs = width >= BREAKPOINTS.xs && width < BREAKPOINTS.sm;
  const isSm = width >= BREAKPOINTS.sm && width < BREAKPOINTS.md;
  const isMd = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
  const isLg = width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl;
  const isXl = width >= BREAKPOINTS.xl && width < BREAKPOINTS.xxl;
  const isXxl = width >= BREAKPOINTS.xxl;

  // 范围判断
  const isMobile = isXs || isSm;
  const isTablet = isMd || isLg;
  const isDesktop = isXl || isXxl;

  // 特定尺寸判断
  const isSmallScreen = width < BREAKPOINTS.lg;
  const isLargeScreen = width >= BREAKPOINTS.lg;

  // 方向判断
  const isPortrait = height > width;
  const isLandscape = width > height;

  return {
    width,
    height,

    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,

    isMobile,
    isTablet,
    isDesktop,

    isSmallScreen,
    isLargeScreen,

    isPortrait,
    isLandscape,

    currentBreakpoint,

    getBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    isBreakpointBetween,
  };
};

/**
 * 使用特定断点的Hook
 */
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const responsive = useResponsive();
  return responsive.currentBreakpoint === breakpoint;
};

/**
 * 使用媒体查询的Hook
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 现代浏览器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // 兼容旧浏览器
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
};

/**
 * 响应式工具函数
 */
export const responsiveUtils = {
  /**
   * 获取响应式值
   */
  getValue: <T>(
    responsive: Partial<Record<Breakpoint, T>>,
    defaultValue: T,
    currentBreakpoint: Breakpoint
  ): T => {
    // 优先返回当前断点的值
    if (responsive[currentBreakpoint] !== undefined) {
      return responsive[currentBreakpoint]!;
    }

    // 向上查找更大的断点
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
    const currentIndex = breakpoints.indexOf(currentBreakpoint);

    for (let i = currentIndex + 1; i < breakpoints.length; i++) {
      const bp = breakpoints[i];
      if (responsive[bp] !== undefined) {
        return responsive[bp]!;
      }
    }

    // 向下查找更小的断点
    for (let i = currentIndex - 1; i >= 0; i--) {
      const bp = breakpoints[i];
      if (responsive[bp] !== undefined) {
        return responsive[bp]!;
      }
    }

    return defaultValue;
  },

  /**
   * 获取侧边栏配置
   */
  getSidebarConfig: (breakpoint: Breakpoint) => ({
    collapsed: breakpoint === 'xs' || breakpoint === 'sm',
    width: responsiveUtils.getValue({ xs: 0, sm: 0, md: 200, lg: 240, xl: 280, xxl: 320 }, 240, breakpoint),
    trigger: breakpoint === 'xs' || breakpoint === 'sm' ? 'click' : 'hover' as const,
  }),

  /**
   * 获取表格配置
   */
  getTableConfig: (breakpoint: Breakpoint) => ({
    scrollX: breakpoint === 'xs' || breakpoint === 'sm',
    pageSize: responsiveUtils.getValue({ xs: 5, sm: 10, md: 15, lg: 20, xl: 25, xxl: 30 }, 20, breakpoint),
    size: responsiveUtils.getValue({ xs: 'small', sm: 'small', md: 'middle', lg: 'middle', xl: 'large', xxl: 'large' }, 'middle', breakpoint) as 'small' | 'middle' | 'large',
  }),

  /**
   * 获取栅格配置
   */
  getGridConfig: (breakpoint: Breakpoint) => ({
    gutter: responsiveUtils.getValue({ xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 24 }, 16, breakpoint),
    span: responsiveUtils.getValue({ xs: 24, sm: 24, md: 12, lg: 8, xl: 6, xxl: 6 }, 24, breakpoint),
  }),
};

export default useResponsive;