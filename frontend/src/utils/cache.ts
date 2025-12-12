/**
 * 缓存工具类
 * 提供内存缓存、本地存储缓存和会话存储缓存功能
 */

// 缓存项接口
export interface CacheItem<T = any> {
  value: T
  timestamp: number
  expireTime?: number
  tags?: string[]
  version?: number
}

// 缓存配置接口
export interface CacheConfig {
  defaultExpireTime?: number // 默认过期时间（毫秒）
  maxSize?: number // 最大缓存项数
  enableVersioning?: boolean // 是否启用版本控制
  autoCleanup?: boolean // 是否自动清理过期项
  cleanupInterval?: number // 清理间隔（毫秒）
  storageQuota?: number // 存储空间配额（字节）
}

// 缓存统计接口
export interface CacheStats {
  totalItems: number
  hitCount: number
  missCount: number
  hitRate: number
  size: number // 占用字节数
  expiredItems: number
}

// 存储类型
export enum StorageType {
  MEMORY = 'memory',
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage'
}

/**
 * 通用缓存类
 */
abstract class BaseCache<T = any> {
  protected items: Map<string, CacheItem<T>> = new Map()
  protected config: Required<CacheConfig>
  protected stats: CacheStats = {
    totalItems: 0,
    hitCount: 0,
    missCount: 0,
    hitRate: 0,
    size: 0,
    expiredItems: 0
  }

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultExpireTime: 5 * 60 * 1000, // 5分钟
      maxSize: 100,
      enableVersioning: true,
      autoCleanup: true,
      cleanupInterval: 60 * 1000, // 1分钟
      storageQuota: 5 * 1024 * 1024, // 5MB
      ...config
    }

    if (this.config.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, expireTime?: number, tags?: string[]): void {
    const now = Date.now()
    const item: CacheItem<T> = {
      value,
      timestamp: now,
      expireTime: expireTime || this.config.defaultExpireTime,
      tags
    }

    this.items.set(key, item)
    this.updateStats()
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    const item = this.items.get(key)

    if (!item) {
      this.stats.missCount++
      this.updateStats()
      return null
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.items.delete(key)
      this.stats.expiredItems++
      this.stats.missCount++
      this.updateStats()
      return null
    }

    this.stats.hitCount++
    this.updateStats()
    return item.value
  }

  /**
   * 检查缓存项是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.items.get(key)
    return item !== undefined && !this.isExpired(item)
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const deleted = this.items.delete(key)
    if (deleted) {
      this.updateStats()
    }
    return deleted
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.items.clear()
    this.updateStats()
  }

  /**
   * 根据标签删除缓存项
   */
  deleteByTag(tag: string): number {
    let deletedCount = 0
    for (const [key, item] of this.items.entries()) {
      if (item.tags?.includes(tag)) {
        this.items.delete(key)
        deletedCount++
      }
    }
    if (deletedCount > 0) {
      this.updateStats()
    }
    return deletedCount
  }

  /**
   * 根据前缀删除缓存项
   */
  deleteByPrefix(prefix: string): number {
    let deletedCount = 0
    for (const [key] of this.items.keys()) {
      if (key.startsWith(prefix)) {
        this.items.delete(key)
        deletedCount++
      }
    }
    if (deletedCount > 0) {
      this.updateStats()
    }
    return deletedCount
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.items.keys())
  }

  /**
   * 获取所有缓存项
   */
  getAll(): Record<string, T> {
    const result: Record<string, T> = {}
    for (const [key, item] of this.items.entries()) {
      if (!this.isExpired(item)) {
        result[key] = item.value
      }
    }
    return result
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * 清理过期项
   */
  cleanup(): number {
    let cleanedCount = 0
    for (const [key, item] of this.items.entries()) {
      if (this.isExpired(item)) {
        this.items.delete(key)
        cleanedCount++
      }
    }
    this.stats.expiredItems += cleanedCount
    this.updateStats()
    return cleanedCount
  }

  /**
   * 启动自动清理
   */
  protected startAutoCleanup(): void {
    setInterval(() => {
      this.cleanup()
      // 如果缓存项超过最大限制，删除最旧的项
      if (this.items.size > this.config.maxSize) {
        this.evictOldest()
      }
    }, this.config.cleanupInterval)
  }

  /**
   * 淘汰最旧的缓存项
   */
  protected evictOldest(): void {
    if (this.items.size === 0) return

    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, item] of this.items.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.items.delete(oldestKey)
      this.updateStats()
    }
  }

  /**
   * 检查缓存项是否过期
   */
  protected isExpired(item: CacheItem<T>): boolean {
    return item.expireTime !== undefined && Date.now() > item.expireTime
  }

  /**
   * 更新统计信息
   */
  protected updateStats(): void {
    this.stats.totalItems = this.items.size
    this.stats.size = this.calculateSize()
    this.stats.hitRate = this.stats.hitCount + this.stats.missCount > 0
      ? this.stats.hitCount / (this.stats.hitCount + this.stats.missCount)
      : 0
  }

  /**
   * 计算缓存占用的内存大小（估算）
   */
  protected calculateSize(): number {
    let size = 0
    for (const item of this.items.values()) {
      size += this.getItemSize(item)
    }
    return size
  }

  /**
   * 计算单个缓存项的大小（估算）
   */
  protected getItemSize(item: CacheItem<T>): number {
    try {
      return JSON.stringify(item).length * 2 // 粗略估算：字符串长度 * 2字节
    } catch {
      return 100 // 默认估算值
    }
  }
}

/**
 * 内存缓存类
 */
export class MemoryCache<T> extends BaseCache<T> {
  constructor(config: CacheConfig = {}) {
    super(config)
  }
}

/**
 * 本地存储缓存类
 */
export class LocalStorageCache<T> extends BaseCache<T> {
  private readonly storageKey: string

  constructor(storageKey: string, config: CacheConfig = {}) {
    super(config)
    this.storageKey = storageKey
    this.loadFromStorage()
  }

  /**
   * 保存到本地存储
   */
  saveToStorage(): void {
    try {
      const data = {
        items: Array.from(this.items.entries()),
        config: this.config
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error)
    }
  }

  /**
   * 从本地存储加载
   */
  protected loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        this.items = new Map(parsed.items)
        this.updateStats()
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
    }
  }

  /**
   * 同步设置缓存项并持久化
   */
  setSync(key: string, value: T, expireTime?: number, tags?: string[]): void {
    super.set(key, value, expireTime, tags)
    this.saveToStorage()
  }

  /**
   * 同步删除缓存项并持久化
   */
  deleteSync(key: string): boolean {
    const deleted = super.delete(key)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }

  /**
   * 同步清空缓存并持久化
   */
  clearSync(): void {
    super.clear()
    this.saveToStorage()
  }
}

/**
 * 会话存储缓存类
 */
export class SessionStorageCache<T> extends BaseCache<T> {
  private readonly storageKey: string

  constructor(storageKey: string, config: CacheConfig = {}) {
    super(config)
    this.storageKey = storageKey
    this.loadFromStorage()
  }

  /**
   * 保存到会话存储
   */
  saveToStorage(): void {
    try {
      const data = {
        items: Array.from(this.items.entries()),
        config: this.config
      }
      sessionStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save cache to sessionStorage:', error)
    }
  }

  /**
   * 从会话存储加载
   */
  protected loadFromStorage(): void {
    try {
      const data = sessionStorage.getItem(this.storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        this.items = new Map(parsed.items)
        this.updateStats()
      }
    } catch (error) {
      console.warn('Failed to load cache from sessionStorage:', error)
    }
  }

  /**
   * 同步设置缓存项并持久化
   */
  setSync(key: string, value: T, expireTime?: number, tags?: string[]): void {
    super.set(key, value, expireTime, tags)
    this.saveToStorage()
  }

  /**
   * 同步删除缓存项并持久化
   */
  deleteSync(key: string): boolean {
    const deleted = super.delete(key)
    if (deleted) {
      this.saveToStorage()
    }
    return deleted
  }

  /**
   * 同步清空缓存并持久化
   */
  clearSync(): void {
    super.clear()
    this.saveToStorage()
  }
}

/**
 * 缓存工厂类
 */
export class CacheFactory {
  private static instances: Map<string, BaseCache> = new Map()

  /**
   * 获取或创建缓存实例
   */
  static getInstance<T>(
    name: string,
    type: StorageType = StorageType.MEMORY,
    config?: CacheConfig
  ): BaseCache<T> {
    const key = `${type}:${name}`

    if (!this.instances.has(key)) {
      let cache: BaseCache<T>

      switch (type) {
        case StorageType.MEMORY:
          cache = new MemoryCache<T>(config)
          break
        case StorageType.LOCAL:
          cache = new LocalStorageCache<T>(name, config)
          break
        case StorageType.SESSION:
          cache = new SessionStorageCache<T>(name, config)
          break
        default:
          cache = new MemoryCache<T>(config)
      }

      this.instances.set(key, cache)
    }

    return this.instances.get(key)!
  }

  /**
   * 清除所有缓存实例
   */
  static clearAll(): void {
    this.instances.clear()
  }

  /**
   * 获取所有缓存实例的统计信息
   */
  static getAllStats(): Array<{ name: string; stats: CacheStats }> {
    const stats: Array<{ name: string; stats: CacheStats }> = []

    for (const [key, cache] of this.instances.entries()) {
      stats.push({
        name: key,
        stats: cache.getStats()
      })
    }

    return stats
  }
}

// 预定义的缓存实例
export const defaultMemoryCache = new MemoryCache({
  defaultExpireTime: 5 * 60 * 1000, // 5分钟
  maxSize: 200
})

export const apiCache = new MemoryCache({
  defaultExpireTime: 10 * 60 * 1000, // 10分钟
  maxSize: 100
})

export const userCache = new LocalStorageCache('user-cache', {
  defaultExpireTime: 30 * 60 * 1000, // 30分钟
  maxSize: 50
})

/**
 * 缓存装饰器函数
 */
export function withCache<T extends any[], R>(
  cache: BaseCache,
  keyPrefix?: string,
  expireTime?: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: T): Promise<R> {
      const cacheKey = keyPrefix ? `${keyPrefix}:${JSON.stringify(args)}` : JSON.stringify(args)

      // 尝试从缓存获取
      const cachedResult = cache.get(cacheKey)
      if (cachedResult !== null) {
        return cachedResult
      }

      // 执行原方法
      const result = await originalMethod.apply(this, args)

      // 将结果存入缓存
      cache.set(cacheKey, result, expireTime)

      return result
    }

    return descriptor
  }
}

/**
 * 异步缓存装饰器
 */
export function withAsyncCache<T extends any[], R>(
  cache: BaseCache,
  keyPrefix?: string,
  expireTime?: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: T): Promise<R> {
      const cacheKey = keyPrefix ? `${keyPrefix}:${JSON.stringify(args)}` : JSON.stringify(args)

      // 尝试从缓存获取
      const cachedResult = cache.get(cacheKey)
      if (cachedResult !== null) {
        return Promise.resolve(cachedResult)
      }

      // 执行原方法
      const promise = originalMethod.apply(this, args)

      // 将Promise结果存入缓存
      promise
        .then(result => {
          cache.set(cacheKey, result, expireTime)
          return result
        })
        .catch(error => {
          // 不缓存错误结果
          throw error
        })

      return promise
    }

    return descriptor
  }
}

/**
 * 防抖缓存Hook
 */
export function useDebounceCache<T>(
  cache: BaseCache,
  delay: number = 300
) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return (key: string, fetcher: () => Promise<T>, expireTime?: number): Promise<T> => {
    return new Promise((resolve, reject) => {
      // 清除之前的定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 设置新的定时器
      timeoutRef.current = setTimeout(() => {
        const cacheKey = `debounce:${key}`

        // 尝试从缓存获取
        const cachedResult = cache.get(cacheKey)
        if (cachedResult !== null) {
          resolve(cachedResult)
          return
        }

        // 执行获取函数
        fetcher()
          .then(result => {
            cache.set(cacheKey, result, expireTime)
            resolve(result)
          })
          .catch(reject)
      }, delay)
    })
  }
}

/**
 * 定期刷新缓存Hook
 */
export function useRefreshCache<T>(
  cache: BaseCache,
  fetcher: (key: string) => Promise<T>,
  refreshInterval: number = 5 * 60 * 1000 // 5分钟
) {
  const intervalRef = useRef<NodeJS.Timeout>()

  const refresh = useCallback((key: string) => {
    fetcher(key)
      .then(result => {
        cache.set(key, result)
      })
      .catch(error => {
        console.warn(`Failed to refresh cache for ${key}:`, error)
      })
  }, [cache, fetcher])

  const startRefreshing = useCallback((keys: string[]) => {
    // 初始刷新
    keys.forEach(refresh)

    // 设置定期刷新
    intervalRef.current = setInterval(() => {
      keys.forEach(refresh)
    }, refreshInterval)
  }, [refresh, refreshInterval])

  const stopRefreshing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [])

  return {
    startRefreshing,
    stopRefreshing,
    refresh
  }
}

export {
  BaseCache,
  MemoryCache,
  LocalStorageCache,
  SessionStorageCache,
  CacheFactory,
  defaultMemoryCache,
  apiCache,
  userCache
}

export default CacheFactory