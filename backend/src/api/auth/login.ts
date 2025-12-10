import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '@/services/authService';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
  rememberMe: z.boolean().default(false),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);

    res.json({
      code: 200,
      message: '登录成功',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 400,
        message: '请求参数错误',
        errors: error.errors,
      });
    }

    res.status(401).json({
      code: 401,
      message: error instanceof Error ? error.message : '登录失败',
    });
  }
});

export default router;