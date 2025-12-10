import { Pool, PoolClient } from 'pg';
import { config } from './config';
import { logger } from '@/utils/logger';

let pool: Pool;

export const createPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      logger.error('数据库连接池错误', { error: err.message });
    });

    pool.on('connect', (client) => {
      logger.info('新的数据库连接建立');
    });
  }

  return pool;
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('数据库连接池未初始化，请先调用 createPool()');
  }
  return pool;
};

export const getClient = async (): Promise<PoolClient> => {
  const pool = getPool();
  return await pool.connect();
};

export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const pool = getPool();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.debug('数据库查询执行', {
      query: text,
      params,
      duration: `${duration}ms`,
      rowCount: result.rowCount,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('数据库查询错误', {
      query: text,
      params,
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    logger.info('数据库连接池已关闭');
    pool = null as any;
  }
};