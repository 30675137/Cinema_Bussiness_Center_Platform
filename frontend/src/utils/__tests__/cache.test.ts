/**
 * 缓存工具测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryCache, LocalStorageCache, CacheFactory } from '../cache';

describe('MemoryCache', () => {
  let cache: MemoryCache<string>;

  beforeEach(() => {
    cache = new MemoryCache<string>({
      defaultExpireTime: 1000, // 1秒
      maxSize: 5,
      autoCleanup: false,
    });
  });

  afterEach(() => {
    cache.clear();
  });

  describe('basic operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should delete keys', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
      expect(cache.delete('nonexistent')).toBe(false);
    });

    it('should clear all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('expiration', () => {
    it('should expire items after expire time', (done) => {
      cache.set('key1', 'value1', 50); // 50ms

      setTimeout(() => {
        expect(cache.get('key1')).toBeNull();
        done();
      }, 100);
    });

    it('should not expire items before time', () => {
      cache.set('key1', 'value1', 5000); // 5秒
      expect(cache.get('key1')).toBe('value1');
    });

    it('should clean up expired items', () => {
      cache.set('key1', 'value1', -1); // 立即过期
      const cleanedCount = cache.cleanup();
      expect(cleanedCount).toBe(1);
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('tags', () => {
    it('should delete items by tag', () => {
      cache.set('key1', 'value1', undefined, ['tag1']);
      cache.set('key2', 'value2', undefined, ['tag1', 'tag2']);
      cache.set('key3', 'value3', undefined, ['tag2']);

      const deletedCount = cache.deleteByTag('tag1');
      expect(deletedCount).toBe(2);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBe('value3');
    });
  });

  describe('prefix', () => {
    it('should delete items by prefix', () => {
      cache.set('user:1', 'user1');
      cache.set('user:2', 'user2');
      cache.set('product:1', 'product1');

      const deletedCount = cache.deleteByPrefix('user:');
      expect(deletedCount).toBe(2);
      expect(cache.get('user:1')).toBeNull();
      expect(cache.get('user:2')).toBeNull();
      expect(cache.get('product:1')).toBe('product1');
    });
  });

  describe('statistics', () => {
    it('should track hit rate', () => {
      cache.set('key1', 'value1');

      // Hit
      cache.get('key1');
      // Miss
      cache.get('nonexistent');

      const stats = cache.getStats();
      expect(stats.hitCount).toBe(1);
      expect(stats.missCount).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should track total items', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();
      expect(stats.totalItems).toBe(2);
    });
  });

  describe('max size and eviction', () => {
    it('should evict oldest items when max size exceeded', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');
      cache.set('key5', 'value5');
      cache.set('key6', 'value6'); // 应该触发淘汰

      expect(cache.get('key1')).toBeNull(); // 最早的项目被淘汰
      expect(cache.get('key2')).not.toBeNull();
      expect(cache.get('key6')).toBe('value6');
    });
  });
});

describe('LocalStorageCache', () => {
  let cache: LocalStorageCache<string>;

  beforeEach(() => {
    // 模拟localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    cache = new LocalStorageCache<string>('test-cache');
  });

  afterEach(() => {
    cache.clear();
  });

  describe('persistence', () => {
    it('should save to localStorage on sync operations', () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem');

      cache.setSync('key1', 'value1');
      expect(setItemSpy).toHaveBeenCalled();
    });

    it('should load from localStorage on initialization', () => {
      const mockData = {
        items: [['key1', { value: 'value1', timestamp: Date.now() }]],
        config: {},
      };

      vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockData));

      const newCache = new LocalStorageCache<string>('test-cache');
      expect(newCache.get('key1')).toBe('value1');
    });
  });
});

describe('CacheFactory', () => {
  beforeEach(() => {
    CacheFactory.clearAll();
  });

  afterEach(() => {
    CacheFactory.clearAll();
  });

  describe('singleton instances', () => {
    it('should return same instance for same name and type', () => {
      const cache1 = CacheFactory.getInstance<string>('test', 'memory');
      const cache2 = CacheFactory.getInstance<string>('test', 'memory');

      expect(cache1).toBe(cache2);
    });

    it('should return different instances for different names', () => {
      const cache1 = CacheFactory.getInstance<string>('test1', 'memory');
      const cache2 = CacheFactory.getInstance<string>('test2', 'memory');

      expect(cache1).not.toBe(cache2);
    });

    it('should return different instances for different types', () => {
      const cache1 = CacheFactory.getInstance<string>('test', 'memory');
      const cache2 = CacheFactory.getInstance<string>('test', 'localStorage');

      expect(cache1).not.toBe(cache2);
    });
  });

  describe('statistics', () => {
    it('should return stats for all instances', () => {
      const cache1 = CacheFactory.getInstance<string>('test1', 'memory');
      const cache2 = CacheFactory.getInstance<string>('test2', 'memory');

      cache1.set('key1', 'value1');
      cache2.set('key2', 'value2');

      const allStats = CacheFactory.getAllStats();
      expect(allStats).toHaveLength(2);
    });
  });
});

describe('cache utilities', () => {
  describe('generateColorVariants', () => {
    it('should generate color variants for hex colors', () => {
      const { generateColorVariants } = require('../cache');
      const variants = generateColorVariants('#1890ff');

      expect(variants).toHaveProperty('lighter');
      expect(variants).toHaveProperty('light');
      expect(variants).toHaveProperty('base');
      expect(variants).toHaveProperty('dark');
      expect(variants).toHaveProperty('darker');
      expect(variants.base).toBe('#1890ff');
    });
  });

  describe('blendColors', () => {
    it('should blend two colors', () => {
      const { blendColors } = require('../cache');
      const blended = blendColors('#ff0000', '#0000ff', 0.5);

      expect(blended).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('getContrastColor', () => {
    it('should return black for light backgrounds', () => {
      const { getContrastColor } = require('../cache');
      const contrast = getContrastColor('#ffffff');

      expect(contrast).toBe('#000000');
    });

    it('should return white for dark backgrounds', () => {
      const { getContrastColor } = require('../cache');
      const contrast = getContrastColor('#000000');

      expect(contrast).toBe('#ffffff');
    });
  });
});
