/**
 * 导航访问日志服务
 * 记录用户的导航行为和访问统计
 */

import { NavigationLog, NavigationAction, MenuItem, User, MenuLevel, FunctionalArea } from '@/types/navigation';

/**
 * 导航日志服务类
 */
export class NavigationLogService {
  private static instance: NavigationLogService;
  private logs: NavigationLog[] = [];
  private sessionStartTime: number = Date.now();
  private currentPageStartTime: number = Date.now();
  private currentPageId: string | null = null;
  private isLoggingEnabled: boolean = true;

  private constructor() {
    // 从本地存储加载日志
    this.loadLogsFromStorage();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): NavigationLogService {
    if (!NavigationLogService.instance) {
      NavigationLogService.instance = new NavigationLogService();
    }
    return NavigationLogService.instance;
  }

  /**
   * 记录菜单点击
   */
  logMenuClick(user: User | null, menu: MenuItem, additionalData?: any): void {
    if (!this.isLoggingEnabled || !user) return;

    const log: NavigationLog = {
      id: this.generateLogId(),
      userId: user.id,
      menuId: menu.id,
      menuPath: menu.path || '',
      action: NavigationAction.MENU_CLICK,
      userAgent: navigator.userAgent,
      ipAddress: this.getClientIP(),
      timestamp: new Date()
    };

    this.addLog(log);
  }

  /**
   * 记录面包屑点击
   */
  logBreadcrumbClick(user: User | null, menu: MenuItem, additionalData?: any): void {
    if (!this.isLoggingEnabled || !user) return;

    const log: NavigationLog = {
      id: this.generateLogId(),
      userId: user.id,
      menuId: menu.id,
      menuPath: menu.path || '',
      action: NavigationAction.BREADCRUMB_CLICK,
      userAgent: navigator.userAgent,
      ipAddress: this.getClientIP(),
      timestamp: new Date()
    };

    this.addLog(log);
  }

  /**
   * 记录搜索选择
   */
  logSearchSelect(user: User | null, menu: MenuItem, query: string, additionalData?: any): void {
    if (!this.isLoggingEnabled || !user) return;

    const log: NavigationLog = {
      id: this.generateLogId(),
      userId: user.id,
      menuId: menu.id,
      menuPath: menu.path || '',
      action: NavigationAction.SEARCH_SELECT,
      userAgent: navigator.userAgent,
      ipAddress: this.getClientIP(),
      timestamp: new Date()
    };

    this.addLog(log);
  }

  /**
   * 记录收藏点击
   */
  logFavoriteClick(user: User | null, menu: MenuItem, additionalData?: any): void {
    if (!this.isLoggingEnabled || !user) return;

    const log: NavigationLog = {
      id: this.generateLogId(),
      userId: user.id,
      menuId: menu.id,
      menuPath: menu.path || '',
      action: NavigationAction.FAVORITE_CLICK,
      userAgent: navigator.userAgent,
      ipAddress: this.getClientIP(),
      timestamp: new Date()
    };

    this.addLog(log);
  }

  /**
   * 记录页面浏览
   */
  logPageView(user: User | null, menu: MenuItem, additionalData?: any): void {
    if (!this.isLoggingEnabled || !user) return;

    // 结束上一个页面的访问时长计算
    if (this.currentPageId && this.currentPageStartTime) {
      const duration = Date.now() - this.currentPageStartTime;
      this.updateLastLogDuration(duration);
    }

    const log: NavigationLog = {
      id: this.generateLogId(),
      userId: user.id,
      menuId: menu.id,
      menuPath: menu.path || '',
      action: NavigationAction.PAGE_VIEW,
      userAgent: navigator.userAgent,
      ipAddress: this.getClientIP(),
      timestamp: new Date()
    };

    this.addLog(log);
    this.currentPageId = menu.id;
    this.currentPageStartTime = Date.now();
  }

  /**
   * 记录页面退出
   */
  logPageExit(user: User | null, menuId?: string, additionalData?: any): void {
    if (!this.isLoggingEnabled || !user) return;

    const targetMenuId = menuId || this.currentPageId;
    if (!targetMenuId) return;

    // 计算页面访问时长
    const duration = this.currentPageStartTime ? Date.now() - this.currentPageStartTime : 0;

    const log: NavigationLog = {
      id: this.generateLogId(),
      userId: user.id,
      menuId: targetMenuId,
      menuPath: '',
      action: NavigationAction.PAGE_EXIT,
      duration,
      userAgent: navigator.userAgent,
      ipAddress: this.getClientIP(),
      timestamp: new Date()
    };

    this.addLog(log);
    this.currentPageId = null;
    this.currentPageStartTime = Date.now();
  }

  /**
   * 获取用户导航历史
   */
  getUserNavigationHistory(userId: string, limit: number = 50): NavigationLog[] {
    return this.logs
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * 获取页面访问统计
   */
  getPageAccessStats(userId: string, days: number = 30): {
    pageStats: Record<string, { visits: number; totalTime: number; averageTime: number; lastVisit: Date }>;
    totalVisits: number;
    totalSessions: number;
    averageSessionTime: number;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const userLogs = this.logs.filter(log =>
      log.userId === userId &&
      log.timestamp >= cutoffDate
    );

    const pageStats: Record<string, {
      visits: number;
      totalTime: number;
      averageTime: number;
      lastVisit: Date;
    }> = {};

    let totalVisits = 0;
    let totalTime = 0;

    userLogs.forEach(log => {
      if (log.action === NavigationAction.PAGE_VIEW) {
        const key = log.menuPath || log.menuId;

        if (!pageStats[key]) {
          pageStats[key] = {
            visits: 0,
            totalTime: 0,
            averageTime: 0,
            lastVisit: log.timestamp
          };
        }

        pageStats[key].visits++;
        totalVisits++;

        if (log.duration) {
          pageStats[key].totalTime += log.duration;
          totalTime += log.duration;
        }

        pageStats[key].lastVisit = log.timestamp;
      }
    });

    // 计算平均时间
    Object.values(pageStats).forEach(stat => {
      stat.averageTime = stat.visits > 0 ? stat.totalTime / stat.visits : 0;
    });

    const sessions = this.countSessions(userLogs);
    const averageSessionTime = sessions > 0 ? totalTime / sessions : 0;

    return {
      pageStats,
      totalVisits,
      totalSessions: sessions,
      averageSessionTime
    };
  }

  /**
   * 清理旧日志
   */
  cleanupOldLogs(daysToKeep: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.logs = this.logs.filter(log => log.timestamp >= cutoffDate);
    this.saveLogsToStorage();
  }

  /**
   * 启用/禁用日志记录
   */
  setLoggingEnabled(enabled: boolean): void {
    this.isLoggingEnabled = enabled;
  }

  /**
   * 私有方法：添加日志
   */
  private addLog(log: NavigationLog): void {
    this.logs.push(log);
    this.saveLogsToStorage();

    // 限制内存中的日志数量
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-5000);
    }
  }

  /**
   * 私有方法：生成日志ID
   */
  private generateLogId(): string {
    return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 私有方法：获取客户端IP（模拟）
   */
  private getClientIP(): string {
    // 在实际应用中，这里应该调用服务端API获取真实IP
    // 这里返回模拟IP
    return '192.168.1.' + Math.floor(Math.random() * 254 + 1);
  }

  /**
   * 私有方法：更新最后一条日志的时长
   */
  private updateLastLogDuration(duration: number): void {
    if (this.logs.length > 0) {
      const lastLog = this.logs[this.logs.length - 1];
      lastLog.duration = duration;
      this.saveLogsToStorage();
    }
  }

  /**
   * 私有方法：计算会话数量
   */
  private countSessions(logs: NavigationLog[]): number {
    if (logs.length === 0) return 0;

    let sessions = 1;
    const sessionTimeout = 30 * 60 * 1000; // 30分钟

    for (let i = 1; i < logs.length; i++) {
      const timeDiff = logs[i].timestamp.getTime() - logs[i - 1].timestamp.getTime();
      if (timeDiff > sessionTimeout) {
        sessions++;
      }
    }

    return sessions;
  }

  /**
   * 私有方法：从本地存储加载日志
   */
  private loadLogsFromStorage(): void {
    try {
      const stored = localStorage.getItem('navigation_logs');
      if (stored) {
        const parsedLogs = JSON.parse(stored);
        this.logs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load navigation logs from storage:', error);
      this.logs = [];
    }
  }

  /**
   * 私有方法：保存日志到本地存储
   */
  private saveLogsToStorage(): void {
    try {
      localStorage.setItem('navigation_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save navigation logs to storage:', error);
    }
  }

  /**
   * 记录通用导航操作
   */
  async logGenericNavigationAction(
    user: User,
    action: NavigationAction,
    menu?: MenuItem,
    additionalData?: Record<string, any>
  ): Promise<void> {
    if (!this.isLoggingEnabled) return;

    const log: NavigationLog = {
      id: this.generateLogId(),
      userId: user.id,
      menuId: menu?.id || null,
      menuPath: menu ? this.buildMenuPath(menu) : '',
      action,
      timestamp: new Date(),
      duration: 0,
      metadata: additionalData
    };

    this.logs.push(log);

    // 异步保存到本地存储
    this.saveLogsToStorage();
  }

  /**
   * 构建菜单路径
   */
  private buildMenuPath(menu: MenuItem): string {
    // 简化实现，实际应该构建完整路径
    return menu.path || menu.code;
  }
}

// 导出单例实例
export const navigationLogService = NavigationLogService.getInstance();

// 导出便捷函数
export const logMenuClick = (user: User | null, menu: MenuItem, additionalData?: any) =>
  navigationLogService.logMenuClick(user, menu, additionalData);

export const logPageView = (user: User | null, menu: MenuItem, additionalData?: any) =>
  navigationLogService.logPageView(user, menu, additionalData);

export const logPageExit = (user: User | null, menuId?: string, additionalData?: any) =>
  navigationLogService.logPageExit(user, menuId, additionalData);

// 通用导航操作日志记录函数
export const logNavigationAction = async (params: {
  userId: string;
  action: NavigationAction;
  menuId: string | null;
  metadata?: Record<string, any>;
}): Promise<void> => {
  try {
    // 创建模拟用户对象
    const user: User = {
      id: params.userId,
      username: 'system_user',
      email: 'system@cinema-platform.com',
      displayName: '系统用户',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 创建模拟菜单对象（如果有menuId）
    let menu: MenuItem | undefined;
    if (params.menuId) {
      menu = {
        id: params.menuId,
        name: params.metadata?.menuName || '未知菜单',
        code: 'unknown',
        level: MenuLevel.MAIN,
        sortOrder: 0,
        isActive: true,
        isVisible: true,
        functionalArea: FunctionalArea.BASIC_SETTINGS
      };
    }

    // 根据动作类型调用相应的日志方法
    switch (params.action) {
      case NavigationAction.MENU_CLICK:
        if (menu) {
          navigationLogService.logMenuClick(user, menu, params.metadata);
        }
        break;
      case NavigationAction.PAGE_VIEW:
        if (menu) {
          navigationLogService.logPageView(user, menu, params.metadata);
        }
        break;
      case NavigationAction.PAGE_EXIT:
        navigationLogService.logPageExit(user, params.menuId || undefined, params.metadata);
        break;
      case NavigationAction.BREADCRUMB_CLICK:
      case NavigationAction.SEARCH_SELECT:
      case NavigationAction.FAVORITE_CLICK:
        // 对于其他操作，记录为通用日志
        await navigationLogService.logGenericNavigationAction(user, params.action, menu, params.metadata);
        break;
      default:
        console.warn('未知的导航动作类型:', params.action);
    }
  } catch (error) {
    console.error('记录导航日志失败:', error);
  }
};

export default navigationLogService;