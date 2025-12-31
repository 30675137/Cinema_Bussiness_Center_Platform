/**
 * 用户偏好服务
 * 处理用户偏好设置的持久化、导入导出等功能
 */

import { UserPreference } from '@/types/navigation';

/**
 * LocalStorage键名
 */
const STORAGE_KEY = 'cinema-navigation-preferences';
const STORAGE_VERSION = '1.0';

/**
 * 存储数据接口
 */
interface StorageData {
  version: string;
  preferences: UserPreference;
  exportDate: string;
}

/**
 * 默认用户偏好设置
 */
const defaultPreferences: UserPreference = {
  userId: 'user-001',
  sidebarExpanded: true,
  expandedMenuIds: [],
  favoriteMenuIds: [],
  theme: {
    mode: 'light',
    primaryColor: '#1890ff',
  },
  navigation: {
    showBreadcrumb: true,
    enableSearch: true,
    recentItemsLimit: 10,
    searchHistoryLimit: 20,
  },
  ui: {
    compactMode: false,
    fixedSidebar: true,
    enableAnimation: true,
  },
  lastUpdated: new Date().toISOString(),
};

/**
 * 用户偏好服务类
 */
export class UserPreferenceService {
  /**
   * 加载用户偏好设置
   */
  static loadPreferences(): UserPreference | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const data: StorageData = JSON.parse(stored);

      // 检查版本
      if (data.version !== STORAGE_VERSION) {
        console.warn(
          `Preferences version mismatch: expected ${STORAGE_VERSION}, got ${data.version}`
        );
        return null;
      }

      // 验证数据结构
      if (!this.isValidPreferences(data.preferences)) {
        console.warn('Invalid preferences data structure');
        return null;
      }

      return data.preferences;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return null;
    }
  }

  /**
   * 保存用户偏好设置
   */
  static savePreferences(preferences: UserPreference): boolean {
    try {
      const data: StorageData = {
        version: STORAGE_VERSION,
        preferences,
        exportDate: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      return false;
    }
  }

  /**
   * 验证用户偏好数据结构
   */
  static isValidPreferences(preferences: any): boolean {
    if (!preferences || typeof preferences !== 'object') {
      return false;
    }

    // 检查必需字段
    const requiredFields = ['userId', 'theme', 'navigation', 'ui', 'lastUpdated'];

    for (const field of requiredFields) {
      if (!(field in preferences)) {
        console.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    // 检查主题结构
    const theme = preferences.theme;
    if (!theme.mode || !theme.primaryColor) {
      console.warn('Invalid theme structure');
      return false;
    }

    // 检查导航偏好结构
    const navigation = preferences.navigation;
    if (
      typeof navigation.showBreadcrumb !== 'boolean' ||
      typeof navigation.enableSearch !== 'boolean' ||
      typeof navigation.recentItemsLimit !== 'number' ||
      typeof navigation.searchHistoryLimit !== 'number'
    ) {
      console.warn('Invalid navigation preferences structure');
      return false;
    }

    // 检查UI偏好结构
    const ui = preferences.ui;
    if (
      typeof ui.compactMode !== 'boolean' ||
      typeof ui.fixedSidebar !== 'boolean' ||
      typeof ui.enableAnimation !== 'boolean'
    ) {
      console.warn('Invalid UI preferences structure');
      return false;
    }

    // 检查数组字段
    const arrayFields = ['favoriteMenuIds', 'expandedMenuIds', 'recentMenuIds', 'searchHistory'];
    for (const field of arrayFields) {
      if (!Array.isArray(preferences[field])) {
        console.warn(`Invalid array field: ${field}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 重置用户偏好为默认值
   */
  static resetToDefaults(userId?: string): UserPreference {
    return {
      ...defaultPreferences,
      userId: userId || defaultPreferences.userId,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * 获取默认偏好设置
   */
  static getDefaults(): UserPreference {
    return { ...defaultPreferences };
  }

  /**
   * 合并偏好设置
   */
  static mergePreferences(
    current: UserPreference,
    updates: Partial<UserPreference>
  ): UserPreference {
    return {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * 清除所有用户偏好数据
   */
  static clearAll(): boolean {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear user preferences:', error);
      return false;
    }
  }

  /**
   * 检查LocalStorage是否可用
   */
  static isLocalStorageAvailable(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取存储空间使用情况
   */
  static getStorageUsage(): { used: number; available: number; total: number } {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const used = stored ? stored.length : 0;

      // 估算LocalStorage总容量（通常为5-10MB）
      const total = 5 * 1024 * 1024; // 5MB
      const available = total - used;

      return { used, available, total };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }

  /**
   * 导出用户偏好设置为JSON字符串
   */
  static exportPreferences(preferences: UserPreference): string {
    try {
      return JSON.stringify(preferences, null, 2);
    } catch (error) {
      console.error('Failed to export preferences:', error);
      throw new Error('导出用户偏好失败');
    }
  }

  /**
   * 从JSON字符串导入用户偏好
   */
  static importPreferences(preferencesData: string, userId?: string): UserPreference {
    try {
      const imported = JSON.parse(preferencesData);

      if (!this.isValidPreferences(imported)) {
        throw new Error('无效的用户偏好数据格式');
      }

      return {
        ...imported,
        userId: userId || imported.userId,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to import preferences:', error);
      throw new Error('导入用户偏好失败');
    }
  }

  /**
   * 迁移旧版本的用户偏好数据
   */
  static migrateOldVersion(): boolean {
    try {
      const oldKey = 'cinema-navigation-preferences-old';
      const oldData = localStorage.getItem(oldKey);

      if (!oldData) {
        return true; // 没有旧数据，无需迁移
      }

      // 尝试解析旧数据
      const oldPreferences = JSON.parse(oldData);

      // 创建新的偏好设置
      const newPreferences: UserPreference = {
        userId: oldPreferences.userId || 'user-001',
        sidebarExpanded: oldPreferences.sidebarExpanded ?? true,
        expandedMenuIds: oldPreferences.expandedMenuIds || [],
        favoriteMenuIds: oldPreferences.favoriteMenuIds || [],
        theme: oldPreferences.theme || {
          mode: 'light',
          primaryColor: '#1890ff',
        },
        navigation: oldPreferences.navigation || {
          showBreadcrumb: true,
          enableSearch: true,
          recentItemsLimit: 10,
          searchHistoryLimit: 20,
        },
        ui: oldPreferences.ui || {
          compactMode: false,
          fixedSidebar: true,
          enableAnimation: true,
        },
        lastUpdated: new Date().toISOString(),
      };

      // 保存新格式
      const success = this.savePreferences(newPreferences);

      if (success) {
        // 删除旧数据
        localStorage.removeItem(oldKey);
      }

      return success;
    } catch (error) {
      console.error('Failed to migrate old preferences:', error);
      return false;
    }
  }

  /**
   * 创建偏好设置的备份
   */
  static createBackup(): string | null {
    try {
      const preferences = this.loadPreferences();
      if (!preferences) {
        return null;
      }

      const backup = {
        timestamp: new Date().toISOString(),
        preferences: preferences,
      };

      const backupKey = `${STORAGE_KEY}-backup-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));

      return backupKey;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return null;
    }
  }

  /**
   * 恢复偏好设置备份
   */
  static restoreFromBackup(backupKey: string): boolean {
    try {
      const backupData = localStorage.getItem(backupKey);
      if (!backupData) {
        return false;
      }

      const backup = JSON.parse(backupData);

      if (!backup.preferences) {
        return false;
      }

      return this.savePreferences(backup.preferences);
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * 清理旧的备份文件
   */
  static cleanupOldBackups(): number {
    try {
      let cleaned = 0;
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        if (key.startsWith(`${STORAGE_KEY}-backup-`)) {
          // 保留最近的5个备份
          const timestamp = key.split('-').pop();
          const backupTime = parseInt(timestamp);
          const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7天前

          if (backupTime < cutoffTime) {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      });

      return cleaned;
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
      return 0;
    }
  }
}

export default UserPreferenceService;
