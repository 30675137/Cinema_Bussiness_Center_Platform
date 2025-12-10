import { Router } from 'express';
import loginRouter from './login';
import refreshRouter from './refresh';

const router = Router();

router.use('/login', loginRouter);
router.use('/refresh', refreshRouter);

export default router;