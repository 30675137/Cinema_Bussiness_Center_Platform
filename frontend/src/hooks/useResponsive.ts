/**
 * 响应式布局自定义Hook
 */

import { useState, useEffect } from 'react';
import { useLayoutStore } from '@/stores/layoutStore';
import type { Breakpoint } from '@/types/layout';

/**
 * 响应式断点配置
 */
const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};

/**
 * 获取当前屏幕尺寸对应的断点
 */
const getCurrentBreakpoint = (width: number): Breakpoint => {
  for (const [breakpoint, breakpointWidth] of Object.entries(BREAKPOINTS).reverse()) {
    if (width >= breakpointWidth) {
      return breakpoint as Breakpoint;
    }
  }
  return 'xs';
};

/**
 * 响应式布局Hook
 */
export const useResponsive = () => {
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  const { sidebarCollapsed, setSidebarCollapsed } = useLayoutStore();

  /**
   * 检查是否为移动设备
   */
  const checkIsMobile = (bp: Breakpoint) => {
    return bp === 'xs' || bp === 'sm';
  };

  /**
   * 检查是否为平板设备
   */
  const checkIsTablet = (bp: Breakpoint) => {
    return bp === 'md';
  };

  /**
   * 检查是否为桌面设备
   */
  const checkIsDesktop = (bp: Breakpoint) => {
    return bp === 'lg' || bp === 'xl' || bp === 'xxl';
  };

  /**
   * 处理窗口大小变化
   */
  const handleResize = () => {
    const width = window.innerWidth;
    const currentBreakpoint = getCurrentBreakpoint(width);

    setScreenWidth(width);
    setBreakpoint(currentBreakpoint);
    setIsMobile(checkIsMobile(currentBreakpoint));
    setIsTablet(checkIsTablet(currentBreakpoint));
    setIsDesktop(checkIsDesktop(currentBreakpoint));

    // 移动设备上自动折叠侧边栏
    if (checkIsMobile(currentBreakpoint) && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    } else if (checkIsDesktop(currentBreakpoint) && sidebarCollapsed && width > 1200) {
      // 大屏幕设备上可以自动展开（用户手动折叠的除外）
      // 这里暂时不自动展开，保持用户选择
    }
  };

  useEffect(() => {
    // 初始化时设置屏幕宽度
    handleResize();

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize);

    // 清理监听器
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarCollapsed]);

  return {
    // 尺寸信息
    screenWidth,
    breakpoint,

    // 设备类型判断
    isMobile,
    isTablet,
    isDesktop,

    // 响应式辅助函数
    isLessThan: (targetBreakpoint: Breakpoint) => {
      const targetWidth = BREAKPOINTS[targetBreakpoint];
      return screenWidth < targetWidth;
    },

    isGreaterThan: (targetBreakpoint: Breakpoint) => {
      const targetWidth = BREAKPOINTS[targetBreakpoint];
      return screenWidth > targetWidth;
    },

    // 断点判断
    isBreakpoint: (targetBreakpoint: Breakpoint) => {
      return breakpoint === targetBreakpoint;
    },
  };
};