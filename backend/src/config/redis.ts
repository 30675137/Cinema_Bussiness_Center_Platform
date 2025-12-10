import { createClient, RedisClientType } from 'redis';
import { config } from './config';
import { logger } from '@/utils/logger';

let client: RedisClientType;

export const createRedisClient = async (): Promise<RedisClientType> => {
  if (!client) {
    client = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
    });

    client.on('error', (err) => {
      logger.error('Redis客户端错误', { error: err.message });
    });

    client.on('connect', () => {
      logger.info('Redis连接建立成功');
    });

    client.on('disconnect', () => {
      logger.warn('Redis连接断开');
    });

    try {
      await client.connect();
      logger.info('Redis客户端初始化成功');
    } catch (error) {
      logger.error('Redis连接失败', {
        error: error instanceof Error ? error.message : String(error),
        host: config.redis.host,
        port: config.redis.port,
      });
      throw error;
    }
  }

  return client;
};

export const getRedisClient = (): RedisClientType => {
  if (!client) {
    throw new Error('Redis客户端未初始化，请先调用 createRedisClient()');
  }
  return client;
};

export const closeRedisClient = async (): Promise<void> => {
  if (client) {
    try {
      await client.quit();
      logger.info('Redis客户端已关闭');
      client = null as any;
    } catch (error) {
      logger.error('关闭Redis客户端失败', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};

// 缓存工具函数
export const cache = {
  async get(key: string): Promise<string | null> {
    const client = getRedisClient();
    try {
      return await client.get(key);
    } catch (error) {
      logger.error('Redis GET 错误', { key, error });
      return null;
    }
  },

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    const client = getRedisClient();
    try {
      await client.setEx(key, ttl, value);
    } catch (error) {
      logger.error('Redis SET 错误', { key, error });
    }
  },

  async del(key: string): Promise<number> {
    const client = getRedisClient();
    try {
      return await client.del(key);
    } catch (error) {
      logger.error('Redis DEL 错误', { key, error });
      return 0;
    }
  },

  async exists(key: string): Promise<number> {
    const client = getRedisClient();
    try {
      return await client.exists(key);
    } catch (error) {
      logger.error('Redis EXISTS 错误', { key, error });
      return 0;
    }
  },
};