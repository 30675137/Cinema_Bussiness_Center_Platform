# 本地 Supabase 数据库配置指南

本文档说明如何配置本地托管的 Supabase PostgreSQL 数据库，使后端 Spring Boot 应用能够正常连接。

## 1. 前置条件

- Docker 和 Docker Compose 已安装
- 本地 Supabase 项目已启动（通过 `supabase start` 或 `docker compose up`）

## 2. Supabase 端口映射配置

### 问题说明

默认情况下，Supabase 的 PostgreSQL 数据库容器 (`supabase-db`) **不暴露端口到宿主机**，仅供内部容器网络访问。后端应用无法直连数据库。

### 解决方案

手动修改 Supabase 项目的 `docker-compose.yml` 文件，为 `db` 服务添加端口映射。

#### 步骤

1. **编辑 docker-compose.yml**

   ```bash
   vim /path/to/supabase-project/docker-compose.yml
   ```

2. **找到 `db:` 服务配置**（约第 393 行附近），添加 `ports` 配置：

   ```yaml
   db:
     container_name: supabase-db
     image: supabase/postgres:15.8.1.085
     restart: unless-stopped
     ports:
       - "54322:5432"    # 新增：映射到宿主机 54322 端口
     volumes:
       - ./volumes/db/data:/var/lib/postgresql/data:Z
   ```

   > **注意**：使用 `54322` 而非 `5432`，避免与宿主机已有 PostgreSQL 冲突。

3. **重启 Supabase**

   ```bash
   cd /path/to/supabase-project
   docker compose down
   docker compose up -d
   ```

4. **验证端口映射**

   ```bash
   docker ps --filter "name=supabase-db" --format "{{.Names}}: {{.Ports}}"
   ```

   期望输出：
   ```
   supabase-db: 0.0.0.0:54322->5432/tcp
   ```

## 3. 获取数据库连接信息

### 数据库密码

从 Supabase 项目的 `.env` 文件获取：

```bash
cat /path/to/supabase-project/.env | grep POSTGRES_PASSWORD
```

示例输出：
```
POSTGRES_PASSWORD=2d6ca90031e5ba51d8200b03922c37b7
```

### 连接参数汇总

| 参数     | 值                                      |
|----------|----------------------------------------|
| 主机     | `127.0.0.1`                            |
| 端口     | `54322`                                |
| 数据库名 | `postgres`                             |
| 用户名   | `postgres`                             |
| 密码     | 从 `.env` 中获取的 `POSTGRES_PASSWORD` |

### JDBC 连接字符串

```
jdbc:postgresql://127.0.0.1:54322/postgres
```

## 4. Spring Boot 后端配置

### application-dev.yml

```yaml
spring:
  # 数据源配置（本地 Supabase PostgreSQL）
  datasource:
    url: jdbc:postgresql://${DB_HOST:127.0.0.1}:${DB_PORT:54322}/postgres
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:your_password_here}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 5
      minimum-idle: 2
      connection-timeout: 30000

  # JPA 开发环境配置
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: true
    properties:
      hibernate:
        format_sql: true

  # Flyway 数据库迁移
  flyway:
    enabled: true
```

### 配置说明

- 使用 `${DB_HOST:127.0.0.1}` 格式支持环境变量覆盖
- 默认端口 `54322` 对应 Supabase db 服务的映射端口
- 密码建议通过环境变量传入，避免明文提交到代码仓库

## 5. 启动后端服务

### 使用 Maven 启动

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 通过环境变量覆盖配置

```bash
DB_PASSWORD=your_password mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 验证连接成功

启动日志中应出现：

```
HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@xxxxx
HikariPool-1 - Start completed.
Database: jdbc:postgresql://127.0.0.1:54322/postgres (PostgreSQL 15.x)
```

## 6. 测试数据库连接

### 通过 Docker 直接测试

```bash
docker exec supabase-db psql -U postgres -c "SELECT 'Connected!' as status;"
```

### 通过宿主机测试

```bash
nc -zv 127.0.0.1 54322
# 或
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres
```

## 7. 常见问题

### Q1: HikariPool 连接超时

**现象**：启动日志持续显示 `HikariPool-1 - Starting...`

**原因**：
1. 端口映射未配置或未生效
2. Supabase 容器未启动

**解决**：
```bash
# 检查容器状态
docker ps | grep supabase-db

# 检查端口映射
docker ps --filter "name=supabase-db" --format "{{.Ports}}"

# 如果只显示 5432/tcp（无映射），需重新配置并重启
```

### Q2: 通过 Pooler 连接失败

**现象**：使用端口 `5432` 连接时提示 `User not found`

**原因**：`supabase-pooler` 服务占用了 5432 端口，但需要特定格式的用户名

**解决**：直连 db 服务（使用端口 54322），不通过 Pooler

### Q3: 密码认证失败

**原因**：配置文件中的密码与 `.env` 中不一致

**解决**：从 Supabase 项目 `.env` 文件获取正确密码

## 8. 多环境配置

| 环境 | Profile | 数据库 |
|------|---------|--------|
| 开发 | `dev`   | 本地 Supabase (54322) |
| 测试 | `test`  | 测试环境 Supabase |
| 生产 | `prod`  | 云端 Supabase |

切换环境：
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=test
```

---

## 附录：配置文件位置

| 文件 | 路径 |
|------|------|
| Spring Boot 公共配置 | `backend/src/main/resources/application.yml` |
| 开发环境配置 | `backend/src/main/resources/application-dev.yml` |
| 测试环境配置 | `backend/src/main/resources/application-test.yml` |
| Supabase 环境变量 | `<supabase-project>/.env` |
| Supabase Docker 配置 | `<supabase-project>/docker-compose.yml` |
