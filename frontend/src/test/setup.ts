import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

// 设置MSW测试服务器
export const server = setupServer(...handlers);

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Mock console methods to reduce noise in tests
const originalError = console.error;
beforeAll(() => {
  // 启动MSW服务器
  server.listen({
    onUnhandledRequest: 'error',
  });

  console.error = (...args: any[]) => {
    // Filter out specific React errors that are expected in tests
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is deprecated')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

// 每个测试后清理
afterEach(() => {
  // 清理React Testing Library状态
  cleanup();
  // 重置MSW处理器
  server.resetHandlers();
  // 清理mocks
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// 所有测试完成后关闭
afterAll(() => {
  // 关闭MSW服务器
  server.close();
  // 恢复console.error
  console.error = originalError;
});

// Add custom matchers
expect.extend({
  toBeInTheDocument(received) {
    const pass = received && document.body.contains(received);
    return {
      message: () =>
        pass
          ? `expected element not to be in the document`
          : `expected element to be in the document`,
      pass,
    };
  },

  toHaveClass(received, className) {
    const pass = received && received.classList && received.classList.contains(className);
    return {
      message: () =>
        pass
          ? `expected element not to have class "${className}"`
          : `expected element to have class "${className}"`,
      pass,
    };
  },

  toHaveStyle(received, style) {
    if (!received || !received.style) {
      return {
        message: () => `expected element to have style`,
        pass: false,
      };
    }

    const styles = style
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    const allMatch = styles.every((s) => {
      const [property, value] = s.split(':').map((p) => p.trim());
      return received.style[property] === value;
    });

    return {
      message: () =>
        allMatch
          ? `expected element not to have style "${style}"`
          : `expected element to have style "${style}"`,
      pass: allMatch,
    };
  },
});

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    refetchQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
  })),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock Ant Design message and notification
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      loading: vi.fn(),
    },
    notification: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
      open: vi.fn(),
      destroy: vi.fn(),
    },
  };
});

// 全局测试工具
export const testUtils = {
  // 模拟等待
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // 创建模拟用户事件
  createMockEvent: (type: string, detail?: any) => new CustomEvent(type, { detail }),

  // 测试用例基础配置
  defaultTestConfig: {
    wrapper: ({ children }: { children: React.ReactNode }) => children,
  },

  // 等待条件满足
  waitFor: (condition: () => boolean, timeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 50);
        }
      };

      check();
    });
  },

  // 创建模拟fetch响应
  createMockResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
  }),
};
