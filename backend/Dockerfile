# Cinema Business Center Platform - Backend Dockerfile
# Java Spring Boot 应用

FROM amazoncorretto:17-alpine

# 设置工作目录
WORKDIR /app

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 复制构建好的 JAR 文件
COPY target/hall-store-backend-*.jar app.jar

# 暴露端口
EXPOSE 8080

# JVM 配置
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
