/**
 * 日志系统
 */

// 日志级别枚举
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// 日志条目接口
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  category?: string;
  context?: Record<string, any>;
  error?: Error;
  stack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
}

// 日志配置接口
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  endpoint?: string;
  apiKey?: string;
  batchSize: number;
  flushInterval: number;
  maxLogEntries: number;
  includeStackTrace: boolean;
  categories?: string[];
  excludedCategories?: string[];
}

/**
 * 日志管理器
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logQueue: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableRemote: false,
      batchSize: 50,
      flushInterval: 5000, // 5秒
      maxLogEntries: 1000,
      includeStackTrace: true,
    };

    this.setupFlushTimer();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 配置日志器
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };

    // 重新设置定时器
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.setupFlushTimer();
  }

  /**
   * 记录调试日志
   */
  debug(message: string, context?: Record<string, any>, category = 'general'): void {
    this.log(LogLevel.DEBUG, message, context, category);
  }

  /**
   * 记录信息日志
   */
  info(message: string, context?: Record<string, any>, category = 'general'): void {
    this.log(LogLevel.INFO, message, context, category);
  }

  /**
   * 记录警告日志
   */
  warn(message: string, context?: Record<string, any>, category = 'general'): void {
    this.log(LogLevel.WARN, message, context, category);
  }

  /**
   * 记录错误日志
   */
  error(message: string, error?: Error, context?: Record<string, any>, category = 'error'): void {
    this.log(LogLevel.ERROR, message, context, category, error);
  }

  /**
   * 记录致命错误日志
   */
  fatal(message: string, error?: Error, context?: Record<string, any>, category = 'fatal'): void {
    this.log(LogLevel.FATAL, message, context, category, error);
  }

  /**
   * 记录日志
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    category = 'general',
    error?: Error
  ): void {
    // 检查日志级别
    if (level < this.config.level) return;

    // 检查类别过滤
    if (this.config.categories && !this.config.categories.includes(category)) return;
    if (this.config.excludedCategories?.includes(category)) return;

    // 创建日志条目
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId,
    };

    // 添加错误信息
    if (error) {
      logEntry.error = error;
      logEntry.stack = this.config.includeStackTrace ? error.stack : undefined;
    }

    // 控制台输出
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // 添加到队列
    this.logQueue.push(logEntry);

    // 限制队列大小
    if (this.logQueue.length > this.config.maxLogEntries) {
      this.logQueue = this.logQueue.slice(-this.config.maxLogEntries);
    }

    // 立即刷新致命错误
    if (level >= LogLevel.FATAL) {
      this.flush();
    }
  }

  /**
   * 输出到控制台
   */
  private logToConsole(entry: LogEntry): void {
    const { level, message, category, context, error, stack } = entry;
    const timestamp = entry.timestamp.split('T')[1]?.split('.')[0];

    let logMessage = `[${timestamp}] [${category.toUpperCase()}] ${message}`;

    if (context) {
      logMessage += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        if (stack) console.debug(stack);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        if (error) console.warn(error);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        if (error) console.error(error);
        if (stack) console.error(stack);
        break;
      case LogLevel.FATAL:
        console.error(`🔴 FATAL: ${logMessage}`);
        if (error) console.error(error);
        if (stack) console.error(stack);
        break;
    }
  }

  /**
   * 设置刷新定时器
   */
  private setupFlushTimer(): void {
    if (!this.config.enableRemote || !this.config.endpoint) return;

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * 刷新日志到远程服务器
   */
  private async flush(): Promise<void> {
    if (!this.config.enableRemote || !this.config.endpoint || this.logQueue.length === 0) return;

    const logsToSend = this.logQueue.splice(0, this.config.batchSize);

    if (logsToSend.length === 0) return;

    try {
      await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey || '',
        },
        body: JSON.stringify({
          logs: logsToSend,
          metadata: {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.sessionId,
          },
        }),
      });
    } catch (error) {
      // 如果发送失败，将日志重新加入队列
      this.logQueue.unshift(...logsToSend);
      console.warn('Failed to send logs to remote server:', error);
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 获取日志统计
   */
  getStats(): {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByCategory: Record<string, number>;
  } {
    const stats = {
      totalLogs: this.logQueue.length,
      logsByLevel: {} as Record<LogLevel, number>,
      logsByCategory: {} as Record<string, number>,
    };

    for (const entry of this.logQueue) {
      stats.logsByLevel[entry.level] = (stats.logsByLevel[entry.level] || 0) + 1;
      const category = entry.category || 'general';
      stats.logsByCategory[category] = (stats.logsByCategory[category] || 0) + 1;
    }

    return stats;
  }

  /**
   * 清空日志队列
   */
  clear(): void {
    this.logQueue = [];
  }

  /**
   * 获取最近的日志
   */
  getRecentLogs(count = 100): LogEntry[] {
    return this.logQueue.slice(-count);
  }

  /**
   * 导出日志
   */
  exportLogs(): string {
    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        sessionId: this.sessionId,
        totalLogs: this.logQueue.length,
      },
      logs: this.logQueue,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 销毁日志器
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
    this.clear();
  }
}

// 创建全局日志器实例
export const logger = Logger.getInstance();

// 便捷函数
export const log = {
  debug: (message: string, context?: Record<string, any>, category?: string) =>
    logger.debug(message, context, category),
  info: (message: string, context?: Record<string, any>, category?: string) =>
    logger.info(message, context, category),
  warn: (message: string, context?: Record<string, any>, category?: string) =>
    logger.warn(message, context, category),
  error: (message: string, error?: Error, context?: Record<string, any>, category?: string) =>
    logger.error(message, error, context, category),
  fatal: (message: string, error?: Error, context?: Record<string, any>, category?: string) =>
    logger.fatal(message, error, context, category),
};

// 业务日志类别
export const LogCategories = {
  GENERAL: 'general',
  API: 'api',
  AUTH: 'auth',
  USER: 'user',
  INVENTORY: 'inventory',
  PRICE: 'price',
  AUDIT: 'audit',
  PERFORMANCE: 'performance',
  ERROR: 'error',
  SECURITY: 'security',
  NETWORK: 'network',
  CACHE: 'cache',
  DATABASE: 'database',
} as const;

export default logger;
