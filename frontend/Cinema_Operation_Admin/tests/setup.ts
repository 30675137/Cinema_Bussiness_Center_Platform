/**
 * 测试环境设置文件
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock dayjs and its dependencies
vi.mock('dayjs', () => {
  const mockDayjs = vi.fn((date?: string | Date) => {
    const actualDate = date ? new Date(date) : new Date('2024-01-01T00:00:00.000Z');
    return {
      format: vi.fn((format: string) => {
        if (!format) return actualDate.toISOString();
        if (format === 'YYYY-MM-DD') return '2024-01-01';
        if (format === 'YYYY-MM-DD HH:mm:ss') return '2024-01-01 00:00:00';
        if (format === 'YYYY/MM/DD') return '2024/01/01';
        if (format === 'YYYY年MM月DD日') return '2024年01月01日';
        return actualDate.toISOString();
      }),
      fromNow: vi.fn(() => '刚刚'),
      valueOf: vi.fn(() => actualDate.getTime()),
      toDate: vi.fn(() => actualDate),
      isBefore: vi.fn(() => false),
      isAfter: vi.fn(() => false),
      isSame: vi.fn(() => false),
      diff: vi.fn(() => 0),
      startOf: vi.fn(() => mockDayjs()),
      endOf: vi.fn(() => mockDayjs()),
      add: vi.fn(() => mockDayjs()),
      subtract: vi.fn(() => mockDayjs()),
      locale: vi.fn(() => mockDayjs()),
    };
  });

  mockDayjs.extend = vi.fn(() => mockDayjs);
  mockDayjs.utc = vi.fn(() => mockDayjs());
  mockDayjs.unix = vi.fn(() => mockDayjs());
  mockDayjs.tz = vi.fn(() => mockDayjs());
  mockDayjs.duration = vi.fn((value: number, unit?: string) => ({
    days: vi.fn(() => Math.floor(value / 86400)),
    hours: vi.fn(() => Math.floor((value % 86400) / 3600)),
    minutes: vi.fn(() => Math.floor((value % 3600) / 60)),
    seconds: vi.fn(() => value % 60),
    months: vi.fn(() => 0),
    years: vi.fn(() => 0),
    asDays: vi.fn(() => value / 86400),
    asHours: vi.fn(() => value / 3600),
    asMinutes: vi.fn(() => value / 60),
    asSeconds: vi.fn(() => value),
    asMonths: vi.fn(() => 0),
    asYears: vi.fn(() => 0),
    humanize: vi.fn(() => `${value}秒`),
  }));

  return mockDayjs;
});

// Mock dayjs插件
vi.mock('dayjs/plugin/relativeTime', () => ({}));
vi.mock('dayjs/plugin/duration', () => ({}));
vi.mock('dayjs/locale/zh-cn', () => ({}));

// Mock formatters模块来避免dayjs问题
vi.mock('@/utils/formatters', () => ({
  formatCurrency: vi.fn((amount: number) => `¥${amount.toFixed(2)}`),
  formatNumber: vi.fn((num: number) => num.toLocaleString()),
  formatPercentage: vi.fn((value: number) => `${(value * 100).toFixed(2)}%`),
  formatDate: vi.fn((date: string | Date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    if (format === 'YYYY-MM-DD') return d.toISOString().split('T')[0];
    if (format === 'YYYY-MM-DD HH:mm:ss') return d.toISOString().replace('T', ' ').split('.')[0];
    return d.toISOString();
  }),
  formatDateTime: vi.fn((date: string | Date) => new Date(date).toISOString().replace('T', ' ').split('.')[0]),
  formatRelativeTime: vi.fn(() => '刚刚'),
  formatQuantity: vi.fn((quantity: number, unit = '') => `${quantity}${unit}`),
  formatDuration: vi.fn((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}小时${minutes}分钟${secs}秒`;
  }),
  formatFileSize: vi.fn((bytes: number) => `${bytes} B`),
  formatPhone: vi.fn((phone: string) => phone),
  formatDiscount: vi.fn(() => '无折扣'),
  formatStatus: vi.fn((status: string) => status),
  formatAddress: vi.fn((address: any) => JSON.stringify(address)),
  formatUserName: vi.fn((user: any) => user.name || '未知用户'),
  formatOrderNumber: vi.fn((order: string) => order),
  formatSKU: vi.fn((sku: string) => sku),
  formatProgressText: vi.fn((completed: number, total: number) => `${Math.round(completed/total*100)}%`),
  formatRatio: vi.fn((num: number, den: number) => `${num}:${den}`),
  formatCurrencyChinese: vi.fn(() => '零元整'),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock console methods to avoid test output noise
global.console = {
  ...console,
  // Uncomment to suppress console.error during tests
  // error: vi.fn(),
  // warn: vi.fn(),
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Setup test environment variables
process.env.NODE_ENV = 'test';

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
    },
  };
});

// Mock fetch if needed
global.fetch = vi.fn();

// Setup global test utilities
global.createMockEvent = (type: string, detail?: any) => {
  const event = new CustomEvent(type, { detail });
  return event;
};

// Add custom matchers for better test assertions
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Mock Performance API for timing tests
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
};

// Mock URL constructor for testing
global.URL = class URL {
  constructor(url: string, base?: string) {
    this.href = url;
    this.origin = 'http://localhost';
    this.protocol = 'http:';
    this.host = 'localhost';
    this.hostname = 'localhost';
    this.port = '';
    this.pathname = url;
    this.search = '';
    this.hash = '';
  }

  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;

  toString() {
    return this.href;
  }
};