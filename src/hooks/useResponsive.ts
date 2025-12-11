/**
 * 响应式设计Hook
 * 提供屏幕尺寸检测和响应式断点管理
 */

import { useState, useEffect, useCallback } from 'react';

// 响应式断点定义
export const breakpoints = {
  xs: 0,      // 手机
  sm: 576,    // 平板
  md: 768,    // 小屏桌面
  lg: 992,    // 桌面
  xl: 1200,   // 大屏桌面
  xxl: 1400,  // 超大屏
} as const;

// 响应式数据类型
export type ResponsiveBreakpoint = keyof typeof breakpoints;
export type Responsive = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: ResponsiveBreakpoint;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
};

// 响应式Hook
export const useResponsive = (): Responsive => {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        width: 1024,
        height: 768,
        breakpoint: 'lg' as ResponsiveBreakpoint,
        orientation: 'landscape' as 'portrait' | 'landscape',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width > height ? 'landscape' : 'portrait';

    return {
      width,
      height,
      orientation,
      ...getBreakpointFromWidth(width),
    };
  });

  // 根据宽度获取断点
  const getBreakpointFromWidth = useCallback((width: number): {
    breakpoint: ResponsiveBreakpoint;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  } => {
    let breakpoint: ResponsiveBreakpoint = 'lg';

    if (width < breakpoints.sm) {
      breakpoint = 'xs';
    } else if (width < breakpoints.md) {
      breakpoint = 'sm';
    } else if (width < breakpoints.lg) {
      breakpoint = 'md';
    } else if (width < breakpoints.xl) {
      breakpoint = 'lg';
    } else if (width < breakpoints.xxl) {
      breakpoint = 'xl';
    } else {
      breakpoint = 'xxl';
    }

    return {
      breakpoint,
      isMobile: width < breakpoints.sm,
      isTablet: width >= breakpoints.sm && width < breakpoints.lg,
      isDesktop: width >= breakpoints.lg,
    };
  }, []);

  // 响应式匹配函数
  const isBreakpoint = useCallback((bp: ResponsiveBreakpoint): boolean => {
    return dimensions.breakpoint === bp;
  }, [dimensions.breakpoint]);

  // 检查是否在指定范围之内
  const isInRange = useCallback((min: number, max: number): boolean => {
    return dimensions.width >= min && dimensions.width <= max;
  }, [dimensions.width]);

  // 小于断点检查
  const isLessThan = useCallback((bp: ResponsiveBreakpoint): boolean => {
    return dimensions.width < breakpoints[bp];
  }, [dimensions.width]);

  // 大于等于断点检查
  const isGreaterThan = useCallback((bp: ResponsiveBreakpoint): boolean => {
    return dimensions.width >= breakpoints[bp];
  }, [dimensions.width]);

  // 当前屏幕是否为竖屏
  const isPortrait = useCallback(() => {
    return dimensions.orientation === 'portrait';
  }, [dimensions.orientation]);

  // 当前屏幕是否为横屏
  const isLandscape = useCallback(() => {
    return dimensions.orientation === 'landscape';
  }, [dimensions.orientation]);

  // 响应式值Hook
  const useResponsiveValue = useCallback(<T,>(
    values: Partial<Record<ResponsiveBreakpoint, T>>,
    defaultValue: T
  ): T => {
    return values[dimensions.breakpoint] ?? defaultValue;
  }, [dimensions.breakpoint]);

  // 媒体查询Hook（CSS-in-JS风格）
  const useMediaQuery = useCallback((query: string): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const mediaQuery = window.matchMedia(query);
      return mediaQuery.matches;
    } catch {
      return false;
    }
  }, []);

  // 通用响应式Hook
  const useResponsiveHook = useCallback((
    breakpoint: ResponsiveBreakpoint,
    condition: 'greater-than' | 'less-than' | 'equal'
  ): boolean => {
    switch (condition) {
      case 'greater-than':
        return isGreaterThan(breakpoint);
      case 'less-than':
        return isLessThan(breakpoint);
      case 'equal':
      default:
        return isBreakpoint(breakpoint);
    }
  }, [isBreakpoint, isGreaterThan, isLessThan]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';

      const newDimensions = {
        width,
        height,
        orientation,
        ...getBreakpointFromWidth(width),
      };

      setDimensions(newDimensions);
    };

    // 初始化时调用一次
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    // 监听屏幕方向变化（移动设备）
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    ...dimensions,
    isBreakpoint,
    isInRange,
    isLessThan,
    isGreaterThan,
    isPortrait,
    isLandscape,
    useResponsiveValue,
    useMediaQuery,
    useResponsiveHook,
  };
};

// 便捷的响应式Hook
export const useMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

export const useTablet = (): boolean => {
  const { isTablet } = useResponsive();
  return isTablet;
};

export const useDesktop = (): boolean => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

// 响应式Hook别名
export const useIsMobile = useMobile;
export const useIsTablet = useTablet;
export const useIsDesktop = useDesktop;

// 断点Hook
export const useBreakpoint = (): ResponsiveBreakpoint => {
  const { breakpoint } = useResponsive();
  return breakpoint;
};

// 列数Hook（根据屏幕尺寸返回合适的列数）
export const useResponsiveColumns = (configs: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
} = {}): number => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return configs[isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'] ||
         (isMobile ? 1 : isTablet ? 2 : 4);
};

// 布局Hook
export const useResponsiveLayout = () => {
  const { isMobile, isTablet, isDesktop, width } = useResponsive();

  return {
    // 布局类型
    layout: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',

    // 网格列数
    gridCols: useResponsiveColumns({ mobile: 1, tablet: 2, desktop: 4 }),

    // 卡片列数
    cardCols: useResponsiveColumns({ mobile: 1, tablet: 2, desktop: 3 }),

    // 表格列固定策略
    tableFixedCols: isMobile ? ['name'] : isTablet ? ['name', 'category'] : ['name', 'category', 'status'],

    // 按钮显示策略
    buttonVariant: isMobile ? 'text' : 'default',

    // 对话框尺寸
    modalWidth: isMobile ? '95%' : isTablet ? '80%' : '60%',

    // 侧边栏状态
    sidebarCollapsed: isMobile ? true : false,

    // 表格密度
    tableSize: isMobile ? 'small' : 'middle',

    // 分页大小
    defaultPageSize: isMobile ? 10 : isTablet ? 15 : 20,
  };
};

// 断点工具函数
export const breakpointUp = (breakpoint: ResponsiveBreakpoint): string => `@media (min-width: ${breakpoints[breakpoint]}px)`;
export const breakpointDown = (breakpoint: ResponsiveBreakpoint): string => `@media (max-width: ${breakpoints[breakpoint] - 1}px)`;
export const breakpointOnly = (breakpoint: ResponsiveBreakpoint): string =>
  `@media (min-width: ${breakpoints[breakpoint]}px) and (max-width: ${breakpoints[breakpoint === 'xxl' ? 99999 : breakpoints[breakpoint as keyof typeof breakpoints] as ResponsiveBreakpoint]} - 1}px)`;

// 响应式类名Hook
export const useResponsiveClasses = (classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return [
    isMobile && classes.mobile,
    isTablet && classes.tablet,
    isDesktop && classes.desktop,
  ].filter(Boolean).join(' ');
};

// 响应式样式Hook
export const useResponsiveStyle = (styles: {
  mobile?: React.CSSProperties;
  tablet?: React.CSSProperties;
  desktop?: React.CSSProperties;
}): React.CSSProperties => {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && styles.mobile) {
    return styles.mobile;
  }

  if (isTablet && styles.tablet) {
    return styles.tablet;
  }

  if (isDesktop && styles.desktop) {
    return styles.desktop;
  }

  return {};
};