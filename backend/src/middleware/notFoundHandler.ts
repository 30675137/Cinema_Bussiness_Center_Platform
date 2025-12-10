import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    code: 404,
    message: `路由 ${req.method} ${req.originalUrl} 不存在`,
  });
};