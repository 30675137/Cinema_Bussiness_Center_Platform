/**
 * @spec P007-fix-spu-batch-delete
 * MockSPUStore - Mock 数据持久化管理类
 *
 * 提供 SPU Mock 数据的集中式管理,支持 CRUD 操作和可选的 localStorage 持久化
 */

import type { SPUItem } from '@/types/spu';
import { generateMockSPUList } from './generators';

const STORAGE_KEY = 'mockSPUData';

/**
 * MockSPUStore 单例类
 *
 * 管理 SPU Mock 数据的生命周期:
 * - 内存存储: 使用私有数组 data 存储当前数据
 * - 可选持久化: 通过 enablePersistence() 启用 localStorage 同步
 * - 数据隔离: getAll() 返回数据副本,防止外部修改内部状态
 */
class MockSPUStore {
  private data: SPUItem[] = [];
  private persistenceEnabled = false;

  constructor() {
    this.initialize();
  }

  /**
   * 初始化数据
   * - 优先从 localStorage 恢复数据
   * - 如果无缓存数据,则生成默认 Mock 数据
   */
  private initialize(): void {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        this.data = JSON.parse(stored) as SPUItem[];
        console.log(`[MockSPUStore] Restored ${this.data.length} SPU items from localStorage`);
      } catch (error) {
        console.warn(
          '[MockSPUStore] Failed to parse localStorage data, generating fresh data',
          error
        );
        this.data = generateMockSPUList(100);
      }
    } else {
      this.data = generateMockSPUList(100);
      console.log(`[MockSPUStore] Generated ${this.data.length} fresh SPU items`);
    }
  }

  /**
   * 启用或禁用 localStorage 持久化
   *
   * @param enabled - true 启用持久化, false 禁用持久化
   */
  enablePersistence(enabled: boolean): void {
    this.persistenceEnabled = enabled;

    if (enabled) {
      this.saveToPersistence();
      console.log('[MockSPUStore] Persistence enabled');
    } else {
      console.log('[MockSPUStore] Persistence disabled');
    }
  }

  /**
   * 保存数据到 localStorage
   * 仅在 persistenceEnabled = true 时执行
   */
  private saveToPersistence(): void {
    if (!this.persistenceEnabled) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      console.log(`[MockSPUStore] Saved ${this.data.length} items to localStorage`);
    } catch (error) {
      console.error('[MockSPUStore] Failed to save to localStorage', error);
    }
  }

  /**
   * 获取所有 SPU 数据
   *
   * @returns SPU 数组的副本(防止外部直接修改内部状态)
   */
  getAll(): SPUItem[] {
    return [...this.data];
  }

  /**
   * 根据 ID 获取单个 SPU
   *
   * @param id - SPU ID
   * @returns SPU 对象或 undefined
   */
  getById(id: string): SPUItem | undefined {
    return this.data.find((spu) => spu.id === id);
  }

  /**
   * 批量删除 SPU
   *
   * @param ids - 待删除的 SPU ID 数组
   * @returns 删除结果 { success: 成功删除数量, failed: 失败数量 }
   */
  deleteMany(ids: string[]): { success: number; failed: number } {
    if (!ids || ids.length === 0) {
      return { success: 0, failed: 0 };
    }

    const initialCount = this.data.length;
    const idsSet = new Set(ids);

    // 过滤掉要删除的 ID
    this.data = this.data.filter((spu) => !idsSet.has(spu.id));

    const deletedCount = initialCount - this.data.length;
    const failedCount = ids.length - deletedCount;

    // 同步到持久化存储
    this.saveToPersistence();

    console.log(
      `[MockSPUStore] Deleted ${deletedCount} SPU(s), failed ${failedCount}, remaining ${this.data.length}`
    );

    return {
      success: deletedCount,
      failed: failedCount,
    };
  }

  /**
   * 创建新 SPU
   *
   * @param spu - SPU 数据(无需提供 id, code, createdAt,将自动生成)
   * @returns 创建后的完整 SPU 对象
   */
  create(spu: Omit<SPUItem, 'id' | 'code' | 'createdAt'>): SPUItem {
    const now = new Date().toISOString();
    const newId = `SPU${Date.now()}`;
    const newCode = `SPU${Date.now()}`;

    const newSPU: SPUItem = {
      ...spu,
      id: newId,
      code: newCode,
      createdAt: now,
      updatedAt: now,
    };

    this.data.push(newSPU);
    this.saveToPersistence();

    console.log(`[MockSPUStore] Created SPU ${newId}`);

    return newSPU;
  }

  /**
   * 更新 SPU
   *
   * @param id - SPU ID
   * @param updates - 待更新的字段
   * @returns 更新后的 SPU 对象或 undefined(未找到)
   */
  update(id: string, updates: Partial<SPUItem>): SPUItem | undefined {
    const index = this.data.findIndex((spu) => spu.id === id);

    if (index === -1) {
      console.warn(`[MockSPUStore] SPU ${id} not found for update`);
      return undefined;
    }

    const updatedSPU: SPUItem = {
      ...this.data[index],
      ...updates,
      id: this.data[index].id, // Prevent ID modification
      code: this.data[index].code, // Prevent code modification
      updatedAt: new Date().toISOString(),
    };

    this.data[index] = updatedSPU;
    this.saveToPersistence();

    console.log(`[MockSPUStore] Updated SPU ${id}`);

    return updatedSPU;
  }

  /**
   * 重置数据
   * - 如果存在 localStorage 数据,从中恢复
   * - 否则重新生成初始数据
   */
  reset(): void {
    this.initialize();
    console.log('[MockSPUStore] Data reset');
  }

  /**
   * 筛选 SPU
   *
   * @param predicate - 筛选条件函数
   * @returns 符合条件的 SPU 数组
   */
  filter(predicate: (spu: SPUItem) => boolean): SPUItem[] {
    return this.data.filter(predicate);
  }

  /**
   * 搜索 SPU(根据名称或编码)
   *
   * @param keyword - 搜索关键词
   * @returns 匹配的 SPU 数组
   */
  search(keyword: string): SPUItem[] {
    if (!keyword || keyword.trim() === '') {
      return this.getAll();
    }

    const lowerKeyword = keyword.toLowerCase();

    return this.data.filter(
      (spu) =>
        spu.name.toLowerCase().includes(lowerKeyword) ||
        spu.code.toLowerCase().includes(lowerKeyword)
    );
  }
}

// 导出单例实例
export const mockSPUStore = new MockSPUStore();
