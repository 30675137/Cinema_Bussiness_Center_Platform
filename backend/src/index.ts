import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import authRoutes from '@/api/auth';
import productRoutes from '@/api/products';
import baseDataRoutes from '@/api/baseData';

const app = express();

// 中间件配置
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/base-data', baseDataRoutes);

// 错误处理
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port || 3001;

app.listen(PORT, () => {
  logger.info(`服务器启动成功: http://localhost:${PORT}`);
  logger.info(`API文档: http://localhost:${PORT}/api-docs`);
});