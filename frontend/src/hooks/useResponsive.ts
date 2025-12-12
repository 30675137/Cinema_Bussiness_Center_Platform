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

/**
 * 获取响应式的栅格列数
 */
export const useResponsiveColumns = (columnMap: Partial<Record<Breakpoint, number>>): number => {
  return useBreakpointValue(columnMap) || 24;
};

/**
 * 获取响应式的栅格间距
 */
export const useResponsiveGutter = (gutterMap: Partial<Record<Breakpoint, [number, number]>>): [number, number] => {
  return useBreakpointValue(gutterMap) || [16, 16];
};

/**
 * 获取响应式的表单布局
 */
export const useResponsiveFormLayout = () => {
  const screen = useResponsive();

  return {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      md: { span: 6 },
      lg: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      md: { span: 18 },
      lg: { span: 20 },
    },
  };
};

/**
 * 获取响应式的卡片网格配置
 */
export const useResponsiveCardGrid = () => {
  const screen = useResponsive();

  if (screen.isMobile) {
    return {
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6,
      xxl: 4,
    };
  }

  return {
    xs: 24,
    sm: 12,
    md: 8,
    lg: 8,
    xl: 6,
    xxl: 4,
  };
};

/**
 * 检测是否为移动设备
 */
export const useIsMobile = (): boolean => {
  const screen = useResponsive();
  return screen.isMobile;
};

/**
 * 检测是否为平板设备
 */
export const useIsTablet = (): boolean => {
  const screen = useResponsive();
  return screen.isTablet;
};

/**
 * 检测是否为桌面设备
 */
export const useIsDesktop = (): boolean => {
  const screen = useResponsive();
  return screen.isDesktop;
};

/**
 * 横向滚动检测
 */
export const useHasHorizontalScroll = (): boolean => {
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setHasScroll(window.innerWidth > document.documentElement.clientWidth);
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  return hasScroll;
};

/**
 * 触摸设备检测
 */
export const useIsTouchDevice = (): boolean => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouchDevice;
};

/**
 * 屏幕方向检测
 */
export const useScreenOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    const updateOrientation = () => {
      const angle = screen.orientation?.angle || window.orientation?.angle || 0;
      setOrientation(angle % 180 === 0 ? 'landscape' : 'portrait');
    };

    updateOrientation();

    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handleChange = () => updateOrientation();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // @ts-ignore - 兼容旧版API
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return orientation;
};

/**
 * 安全区域检测（刘海屏等）
 */
export const useSafeAreaInsets = () => {
  const [insets, setInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setInsets({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top')) || 0,
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right')) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom')) || 0,
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left')) || 0,
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  return insets;
};

/**
 * 获取响应式的导航栏配置
 */
export const useResponsiveNavigation = () => {
  const screen = useResponsive();

  return {
    collapsed: screen.isMobile,
    // 移动端默认折叠侧边栏
    trigger: null,
    // 移动端不显示折叠按钮
    itemsShowCount: screen.isMobile ? 4 : screen.isTablet ? 6 : 8,
  };
};

/**
 * 获取响应式的操作按钮配置
 */
export const useResponsiveActions = () => {
  const screen = useResponsive();

  return {
    size: screen.isMobile ? 'small' : 'middle',
    // 移动端使用小尺寸按钮
    showText: !screen.isMobile,
    // 移动端只显示图标
    maxButtons: screen.isMobile ? 2 : screen.isTablet ? 4 : 6,
    // 最大显示按钮数量
  };
};
