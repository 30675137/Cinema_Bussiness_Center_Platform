#!/bin/sh

# 设置环境变量
if [ -z "$API_BASE_URL" ]; then
    export API_BASE_URL="http://localhost:8080"
fi

# 替换 nginx 配置中的占位符
envsubst '$API_BASE_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# 创建必要的目录
mkdir -p /var/cache/nginx /var/log/nginx /var/run

# 设置权限
chown -R nextjs:nodejs /var/cache/nginx /var/log/nginx /var/run

# 启动 nginx
exec "$@"