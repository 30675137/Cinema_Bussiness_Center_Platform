import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '@/services/authService';

const router = Router();

const refreshSchema = z.object({
  refreshToken: z.string().min(1, '刷新令牌不能为空'),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = refreshSchema.parse(req.body);
    const result = await authService.refreshToken(validatedData.refreshToken);

    res.json({
      code: 200,
      message: '刷新成功',
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
      message: error instanceof Error ? error.message : '刷新令牌无效',
    });
  }
});

export default router;