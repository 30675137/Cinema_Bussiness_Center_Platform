import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
    }
  }
}

export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId: string;
}

/**
 * JWT认证中间件
 * 验证请求头中的JWT token，并将用户信息添加到请求对象中
 */
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        code: 'AUTH_TOKEN_MISSING',
        message: '访问令牌缺失',
        data: null
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET环境变量未设置');
      res.status(500).json({
        success: false,
        code: 'AUTH_CONFIG_ERROR',
        message: '服务器配置错误',
        data: null
      });
      return;
    }

    // 验证token
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // 将用户信息添加到请求对象
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        code: 'AUTH_TOKEN_EXPIRED',
        message: '访问令牌已过期',
        data: null
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        code: 'AUTH_TOKEN_INVALID',
        message: '访问令牌无效',
        data: null
      });
      return;
    }

    console.error('JWT认证错误:', error);
    res.status(500).json({
      success: false,
      code: 'AUTH_INTERNAL_ERROR',
      message: '认证服务内部错误',
      data: null
    });
  }
};

/**
 * 可选JWT认证中间件
 * 如果提供了token则验证，否则继续执行
 */
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // 没有token，继续执行但不设置用户信息
    next();
    return;
  }

  // 有token，进行验证
  authenticateToken(req, res, next);
};

/**
 * 生成JWT token
 */
export const generateToken = (user: { userId: string; username: string; email: string }): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET环境变量未设置');
  }

  const payload: JwtPayload = {
    userId: user.userId,
    username: user.username,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpirationTime(jwtExpiresIn)
  };

  return jwt.sign(payload, jwtSecret);
};

/**
 * 生成刷新token
 */
export const generateRefreshToken = (user: { userId: string }): string => {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET环境变量未设置');
  }

  const payload = {
    userId: user.userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + parseExpirationTime(refreshTokenExpiresIn)
  };

  return jwt.sign(payload, jwtSecret);
};

/**
 * 验证刷新token
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  const jwtSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET环境变量未设置');
  }

  const decoded = jwt.verify(token, jwtSecret) as any;

  if (decoded.type !== 'refresh') {
    throw new Error('无效的刷新令牌');
  }

  return { userId: decoded.userId };
};

/**
 * 解析过期时间字符串为秒数
 */
const parseExpirationTime = (timeString: string): number => {
  const unit = timeString.slice(-1);
  const value = parseInt(timeString.slice(0, -1));

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default:
      // 如果没有单位，默认为秒
      return parseInt(timeString);
  }
};