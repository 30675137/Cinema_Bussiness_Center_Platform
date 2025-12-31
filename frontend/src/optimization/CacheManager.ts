interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // 生存时间（毫秒）
  maxSize?: number; // 最大缓存条目数
  strategy?: 'lru' | 'lfu' | 'fifo'; // 缓存淘汰策略
}

export class CacheManager<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private maxSize: number;
  private defaultTtl: number;
  private strategy: 'lru' | 'lfu' | 'fifo';

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTtl = options.ttl || 5 * 60 * 1000; // 默认5分钟
    this.strategy = options.strategy || 'lru';

    // 定期清理过期缓存
    setInterval(() => {
      this.cleanupExpired();
    }, 60000); // 每分钟清理一次
  }

  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const actualTtl = ttl || this.defaultTtl;

    // 如果缓存已满，先淘汰一些条目
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: now,
      expiresAt: now + actualTtl,
      accessCount: 1,
      lastAccessed: now,
    };

    this.cache.set(key, item);
  }

  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (item.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    // 更新访问信息
    item.accessCount++;
    item.lastAccessed = Date.now();

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // 清理过期的缓存条目
  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  // 根据策略淘汰缓存条目
  private evict(): void {
    let keyToDelete: string | undefined;

    switch (this.strategy) {
      case 'lru':
        keyToDelete = this.findLRUKey();
        break;
      case 'lfu':
        keyToDelete = this.findLFUKey();
        break;
      case 'fifo':
        keyToDelete = this.findFIFOKey();
        break;
    }

    if (keyToDelete) {
      this.cache.delete(keyToDelete);
    }
  }

  // 找到最近最少使用的键
  private findLRUKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // 找到最少使用的键
  private findLFUKey(): string | undefined {
    let leastUsedKey: string | undefined;
    let leastCount = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.accessCount < leastCount) {
        leastCount = item.accessCount;
        leastUsedKey = key;
      }
    }

    return leastUsedKey;
  }

  // 找到最早插入的键
  private findFIFOKey(): string | undefined {
    let oldestKey: string | undefined;
    let oldestTime = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  // 获取缓存统计信息
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memoryUsage: number;
  } {
    // 这里简化实现，实际使用中可以通过计数器来统计命中率
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // 需要在实际使用中跟踪
      memoryUsage: 0, // 需要实际计算内存使用
    };
  }
}

// API缓存管理器
export class APICacheManager {
  private cache: CacheManager<any>;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(options?: CacheOptions) {
    this.cache = new CacheManager(options);
  }

  // 请求缓存装饰器
  async request<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number,
    bypassCache = false
  ): Promise<T> {
    if (!bypassCache) {
      const cached = this.cache.get(key);
      if (cached) {
        return cached;
      }
    }

    // 防止重复请求
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = fetcher()
      .then((data) => {
        this.cache.set(key, data, ttl);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // 预加载数据
  async preload<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<void> {
    try {
      await this.request(key, fetcher, ttl);
    } catch (error) {
      console.warn(`Failed to preload ${key}:`, error);
    }
  }

  // 批量预加载
  async batchPreload<T>(
    items: Array<{ key: string; fetcher: () => Promise<T>; ttl?: number }>
  ): Promise<void> {
    const promises = items.map(({ key, fetcher, ttl }) =>
      this.preload(key, fetcher, ttl).catch((error) => {
        console.warn(`Failed to preload ${key}:`, error);
      })
    );

    await Promise.allSettled(promises);
  }

  // 清除缓存
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // 获取缓存状态
  getCacheInfo() {
    return this.cache.getStats();
  }
}

// 内存缓存实例
export const memoryCache = new CacheManager({
  maxSize: 200,
  ttl: 10 * 60 * 1000, // 10分钟
  strategy: 'lru',
});

// API缓存实例
export const apiCache = new APICacheManager({
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5分钟
  strategy: 'lru',
});

import React, { useState, useEffect, useCallback, useRef } from 'react';

// React Hook for caching
export const useCache = <T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const cacheRef = useRef(new CacheManager<T>(options));

  useEffect(() => {
    const fetchData = async () => {
      // 先尝试从缓存获取
      const cached = cacheRef.current.get(key);
      if (cached) {
        setData(cached);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        cacheRef.current.set(key, result);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, fetcher]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    setData(null);
  }, [key]);

  return { data, loading, error, invalidate };
};
