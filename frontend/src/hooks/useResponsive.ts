import { useState, useEffect } from 'react';
import { useMediaQuery } from 'usehooks-ts';

/**
 * 响应式断点配置
 * 与Ant Design和Tailwind CSS保持一致
 */
export const BREAKPOINTS = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * 屏幕尺寸类型
 */
export interface ScreenSize {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  current: Breakpoint;
}

/**
 * 响应式钩子
 * 用于检测当前屏幕尺寸和断点
 */
export const useResponsive = (): ScreenSize => {
  const xs = useMediaQuery(`(max-width: ${BREAKPOINTS.xs}px)`);
  const sm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px) and (max-width: ${BREAKPOINTS.md - 1}px)`);
  const md = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`);
  const lg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px) and (max-width: ${BREAKPOINTS.xl - 1}px)`);
  const xl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px) and (max-width: ${BREAKPOINTS.xxl - 1}px)`);
  const xxl = useMediaQuery(`(min-width: ${BREAKPOINTS.xxl}px)`);

  const [current, setCurrent] = useState<Breakpoint>('md');

  useEffect(() => {
    if (xxl) setCurrent('xxl');
    else if (xl) setCurrent('xl');
    else if (lg) setCurrent('lg');
    else if (md) setCurrent('md');
    else if (sm) setCurrent('sm');
    else setCurrent('xs');
  }, [xs, sm, md, lg, xl, xxl]);

  return {
    xs,
    sm,
    md,
    lg,
    xl,
    xxl,
    isMobile: xs || sm,
    isTablet: md,
    isDesktop: lg || xl || xxl,
    current,
  };
};

/**
 * 根据屏幕尺寸返回不同的值
 * @param values - 不同断点对应的值
 * @returns 当前断点对应的值
 */
export const useBreakpointValue = <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
  const screen = useResponsive();
  
  // 从大到小查找匹配的断点值
  const breakpoints: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
  
  for (const breakpoint of breakpoints) {
    if (screen[breakpoint] && values[breakpoint] !== undefined) {
      return values[breakpoint];
    }
  }
  
  return undefined;
};

/**
 * 获取响应式的表格分页大小
 */
export const useResponsivePageSize = (): number => {
  const screen = useResponsive();
  
  if (screen.isMobile) return 10;
  if (screen.isTablet) return 15;
  return 20;
};

/**
 * 获取响应式的表格滚动配置
 */
export const useResponsiveTableScroll = () => {
  const screen = useResponsive();
  
  return {
    x: screen.isMobile ? 800 : screen.isTablet ? 1000 : undefined,
    y: screen.isMobile ? 400 : screen.isTablet ? 500 : 600,
  };
};
