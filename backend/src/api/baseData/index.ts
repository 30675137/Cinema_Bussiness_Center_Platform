import { Router } from 'express';
import categoriesRouter from './categories';
import brandsRouter from './brands';
import unitsRouter from './units';

const router = Router();

router.use('/categories', categoriesRouter);
router.use('/brands', brandsRouter);
router.use('/units', unitsRouter);

export default router;