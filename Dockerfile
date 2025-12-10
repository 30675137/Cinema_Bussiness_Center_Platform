# 多阶段构建 - 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false

# 复制package文件
COPY frontend/package*.json ./

# 安装依赖（仅生产依赖）
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY frontend/ .

# 构建应用
RUN npm run build

# 生产阶段 - Nginx服务
FROM nginx:1.25-alpine AS production

# 安装必要的工具
RUN apk add --no-cache curl

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 复制自定义Nginx配置
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

# 复制构建产物到Nginx目录
COPY --from=builder --chown=nextjs:nodejs /app/dist /usr/share/nginx/html

# 创建日志目录
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log && \
    touch /var/log/nginx/error.log && \
    chown -R nextjs:nodejs /var/log/nginx

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# 切换到非root用户
USER nextjs

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]