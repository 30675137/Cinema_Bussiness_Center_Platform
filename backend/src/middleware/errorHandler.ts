import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  // 记录错误日志
  logger.error('API错误', {
    error: message,
    stack: err.stack,
    statusCode,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // 开发环境返回详细错误信息
  const response: any = {
    code: statusCode,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.details = err.details;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};