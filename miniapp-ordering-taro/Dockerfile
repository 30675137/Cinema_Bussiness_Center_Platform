# Cinema Business Platform - Miniapp/H5 Dockerfile
# 影院点餐小程序 CINELounge - Taro H5 构建

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --legacy-peer-deps

# 复制源码
COPY . .

# 构建 H5 版本
RUN npm run build:h5

# Stage 2: Production
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建健康检查端点
RUN mkdir -p /usr/share/nginx/html/health && \
    echo '{"status":"ok"}' > /usr/share/nginx/html/health/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
