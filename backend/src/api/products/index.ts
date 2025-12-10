import { Router } from 'express';
import listRouter from './list';
import createRouter from './create';
import detailRouter from './detail';
import updateRouter from './update';
import submitReviewRouter from './submitReview';
import batchRouter from './batch';

const router = Router();

router.use('/', listRouter);
router.use('/', createRouter);
router.use('/', detailRouter);
router.use('/', updateRouter);
router.use('/', submitReviewRouter);
router.use('/batch', batchRouter);

export default router;