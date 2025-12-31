/**
 * 响应式Hook测试
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useResponsive,
  useBreakpointValue,
  useResponsivePageSize,
  useResponsiveTableScroll,
  useResponsiveColumns,
  useResponsiveGutter,
  useResponsiveFormLayout,
  useResponsiveCardGrid,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useResponsiveNavigation,
  useResponsiveActions,
} from '../useResponsive';

// Mock usehooks-ts
vi.mock('usehooks-ts', () => ({
  useMediaQuery: vi.fn(),
}));

const { useMediaQuery } = vi.mocked(require('usehooks-ts'));

describe('useResponsive', () => {
  beforeEach(() => {
    // Reset mock implementation
    useMediaQuery.mockImplementation((query: string) => {
      // Default to desktop
      if (query.includes('max-width: 480px')) return false;
      if (query.includes('min-width: 576px')) return true;
      if (query.includes('min-width: 768px')) return true;
      if (query.includes('min-width: 992px')) return true;
      if (query.includes('min-width: 1200px')) return true;
      if (query.includes('min-width: 1600px')) return false;
      return false;
    });
  });

  it('should return responsive screen information', () => {
    const { result } = renderHook(() => useResponsive());

    expect(result.current).toHaveProperty('xs');
    expect(result.current).toHaveProperty('sm');
    expect(result.current).toHaveProperty('md');
    expect(result.current).toHaveProperty('lg');
    expect(result.current).toHaveProperty('xl');
    expect(result.current).toHaveProperty('xxl');
    expect(result.current).toHaveProperty('isMobile');
    expect(result.current).toHaveProperty('isTablet');
    expect(result.current).toHaveProperty('isDesktop');
    expect(result.current).toHaveProperty('current');
  });

  it('should correctly identify desktop view', () => {
    // Mock desktop screen
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 992px')) return true;
      if (query.includes('max-width: 480px')) return false;
      if (query.includes('min-width: 576px') && query.includes('max-width: 767px')) return false;
      if (query.includes('min-width: 768px') && query.includes('max-width: 991px')) return false;
      if (query.includes('min-width: 1200px') && query.includes('max-width: 1599px')) return false;
      return false;
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });

  it('should correctly identify mobile view', () => {
    // Mock mobile screen
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('max-width: 480px')) return true;
      if (query.includes('min-width: 576px')) return false;
      return false;
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });

  it('should correctly identify tablet view', () => {
    // Mock tablet screen
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 768px') && query.includes('max-width: 991px')) return true;
      if (query.includes('max-width: 480px')) return false;
      if (query.includes('min-width: 576px') && query.includes('max-width: 767px')) return false;
      return false;
    });

    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });
});

describe('useBreakpointValue', () => {
  it('should return value for current breakpoint', () => {
    const { result } = renderHook(() =>
      useBreakpointValue({
        xs: 'small',
        sm: 'medium',
        md: 'large',
        lg: 'extra-large',
        xl: 'huge',
        xxl: 'massive',
      })
    );

    expect(typeof result.current).toBe('string');
  });

  it('should return undefined when no matching value', () => {
    const { result } = renderHook(() => useBreakpointValue({}));

    expect(result.current).toBeUndefined();
  });

  it('should find value from largest to smallest', () => {
    // Mock large screen
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 1200px')) return true;
      return false;
    });

    const { result } = renderHook(() =>
      useBreakpointValue({
        xs: 'small',
        lg: 'large',
      })
    );

    expect(result.current).toBe('large');
  });
});

describe('useResponsivePageSize', () => {
  it('should return appropriate page size for mobile', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('max-width: 480px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsivePageSize());
    expect(result.current).toBe(10);
  });

  it('should return appropriate page size for tablet', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 768px') && query.includes('max-width: 991px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsivePageSize());
    expect(result.current).toBe(15);
  });

  it('should return appropriate page size for desktop', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 992px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsivePageSize());
    expect(result.current).toBe(20);
  });
});

describe('useResponsiveTableScroll', () => {
  it('should return scroll configuration for mobile', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('max-width: 480px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsiveTableScroll());
    expect(result.current.x).toBe(800);
    expect(result.current.y).toBe(400);
  });

  it('should return scroll configuration for tablet', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 768px') && query.includes('max-width: 991px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsiveTableScroll());
    expect(result.current.x).toBe(1000);
    expect(result.current.y).toBe(500);
  });

  it('should return scroll configuration for desktop', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 992px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsiveTableScroll());
    expect(result.current.x).toBeUndefined();
    expect(result.current.y).toBe(600);
  });
});

describe('useResponsiveColumns', () => {
  it('should return column count for breakpoint', () => {
    const columnMap = {
      xs: 12,
      sm: 8,
      md: 6,
      lg: 4,
    };

    const { result } = renderHook(() => useResponsiveColumns(columnMap));
    expect([12, 8, 6, 4]).toContain(result.current);
  });

  it('should return default when no matching column', () => {
    const { result } = renderHook(() => useResponsiveColumns({}));
    expect(result.current).toBe(24);
  });
});

describe('useResponsiveGutter', () => {
  it('should return gutter configuration', () => {
    const gutterMap = {
      xs: [8, 8] as [number, number],
      md: [16, 16] as [number, number],
      lg: [24, 24] as [number, number],
    };

    const { result } = renderHook(() => useResponsiveGutter(gutterMap));
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current).toHaveLength(2);
  });

  it('should return default gutter when no matching config', () => {
    const { result } = renderHook(() => useResponsiveGutter({}));
    expect(result.current).toEqual([16, 16]);
  });
});

describe('useResponsiveFormLayout', () => {
  it('should return form layout configuration', () => {
    const { result } = renderHook(() => useResponsiveFormLayout());

    expect(result.current).toHaveProperty('labelCol');
    expect(result.current).toHaveProperty('wrapperCol');
    expect(result.current.labelCol).toHaveProperty('xs');
    expect(result.current.labelCol).toHaveProperty('sm');
    expect(result.current.labelCol).toHaveProperty('md');
    expect(result.current.labelCol).toHaveProperty('lg');
  });
});

describe('useResponsiveCardGrid', () => {
  it('should return grid configuration for mobile', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('max-width: 480px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsiveCardGrid());
    expect(result.current.xs).toBe(24);
    expect(result.current.sm).toBe(12);
    expect(result.current.md).toBe(8);
    expect(result.current.lg).toBe(6);
  });

  it('should return grid configuration for desktop', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 768px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsiveCardGrid());
    expect(result.current.xs).toBe(24);
    expect(result.current.sm).toBe(12);
    expect(result.current.md).toBe(8);
    expect(result.current.lg).toBe(8);
  });
});

describe('useIsMobile', () => {
  it('should return true for mobile screens', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('max-width: 480px')) return true;
      if (query.includes('min-width: 576px') && query.includes('max-width: 767px')) return true;
      return false;
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false for desktop screens', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 992px')) return true;
      return false;
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});

describe('useIsTablet', () => {
  it('should return true for tablet screens', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 768px') && query.includes('max-width: 991px')) return true;
      return false;
    });

    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(true);
  });

  it('should return false for mobile screens', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('max-width: 480px')) return true;
      return false;
    });

    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(false);
  });
});

describe('useIsDesktop', () => {
  it('should return true for desktop screens', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 992px')) return true;
      return false;
    });

    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });

  it('should return false for mobile screens', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('max-width: 480px')) return true;
      return false;
    });

    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);
  });
});

describe('useResponsiveNavigation', () => {
  it('should return navigation configuration for mobile', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('max-width: 480px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsiveNavigation());
    expect(result.current.collapsed).toBe(true);
    expect(result.current.trigger).toBeNull();
    expect(result.current.itemsShowCount).toBe(4);
  });

  it('should return navigation configuration for desktop', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 992px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsiveNavigation());
    expect(result.current.collapsed).toBe(false);
    expect(result.current.itemsShowCount).toBe(8);
  });
});

describe('useResponsiveActions', () => {
  it('should return action configuration for mobile', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('max-width: 480px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsiveActions());
    expect(result.current.size).toBe('small');
    expect(result.current.showText).toBe(false);
    expect(result.current.maxButtons).toBe(2);
  });

  it('should return action configuration for desktop', () => {
    useMediaQuery.mockImplementation((query: string) => {
      if (query.includes('min-width: 992px')) return true;
      return false;
    });

    const { result } = renderHook(() => useResponsiveActions());
    expect(result.current.size).toBe('middle');
    expect(result.current.showText).toBe(true);
    expect(result.current.maxButtons).toBe(6);
  });
});
