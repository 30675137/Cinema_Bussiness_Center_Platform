# 场景包功能故障排查指南

## 当前问题诊断

### 问题现象
访问 `http://localhost:3000/scenario-packages/create` 时：
- ✅ CORS 已配置正确
- ✅ 后端服务运行正常 (端口 8080)
- ❌ API 返回 500 错误: "服务器内部错误"

### 根本原因
**数据库表未创建** - `scenario_packages` 及相关表不存在

### 解决方案

## 方案 1: 使用 Supabase 控制台 (推荐)

1. **登录 Supabase 控制台**
   ```
   https://supabase.com/dashboard
   ```

2. **选择项目**
   - 项目 ID: `fxhgyxceqrmnpezluaht`

3. **打开 SQL Editor**
   - 左侧菜单 → SQL Editor
   - 点击 "New Query"

4. **执行迁移脚本**
   - 复制文件内容: `backend/src/main/resources/db/migration/V1__create_scenario_packages.sql`
   - 粘贴到 SQL Editor
   - 点击 "Run" 按钮

5. **验证结果**
   - 应该看到 "Success" 消息
   - 检查创建的表：
     ```sql
     SELECT table_name
     FROM information_schema.tables
     WHERE table_name LIKE '%package%';
     ```

6. **重启后端**（可选）
   ```bash
   # 终止当前后端
   lsof -ti:8080 | xargs kill -9

   # 重新启动
   cd backend
   mvn spring-boot:run
   ```

## 方案 2: 使用命令行 (需要安装 psql)

### 安装 psql

**macOS:**
```bash
brew install postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql-client
```

### 执行迁移

```bash
cd backend
bash run-migration.sh
```

或者手动执行：

```bash
psql "postgresql://postgres.fxhgyxceqrmnpezluaht:ppkZ8sGUEHB0qjFs@aws-1-us-east-2.pooler.supabase.com:6543/postgres" \
  -f src/main/resources/db/migration/V1__create_scenario_packages.sql
```

## 验证修复

### 1. 测试 API 端点

```bash
# 列表查询 (应返回空数组)
curl http://localhost:8080/api/scenario-packages

# 预期响应:
# {
#   "success": true,
#   "data": [],
#   "total": 0,
#   "timestamp": "..."
# }
```

### 2. 测试前端创建功能

1. 访问 http://localhost:3000/scenario-packages/create
2. 填写表单:
   - 场景包名称: "测试场景包"
   - 时长: 2 小时
   - 最小人数: 1
   - 最大人数: 10
3. 点击"保存草稿"
4. 应该成功创建并跳转到列表页

## 已修复的问题

### ✅ CORS 配置
- 允许来源: `http://localhost:3000`, `http://localhost:5173`
- 允许方法: GET, POST, PUT, DELETE, PATCH, OPTIONS
- 允许请求头: Content-Type, Authorization, X-Request-ID 等
- 允许凭证: true

### ✅ 数据库连接
- URL: `jdbc:postgresql://aws-1-us-east-2.pooler.supabase.com:6543/postgres`
- 用户名: `postgres.fxhgyxceqrmnpezluaht`
- 连接模式: Pooler (端口 6543)

### ✅ 后端配置
- 组件扫描: `com.cinema.hallstore`, `com.cinema.scenariopackage`, `com.cinema.common`, `com.cinema.config`
- JPA 仓库扫描: 已启用
- 实体扫描: 已启用

## 需要创建的数据库表

执行迁移后将创建以下表：

1. `scenario_packages` - 场景包主表
2. `package_rules` - 场景包规则
3. `package_hall_associations` - 场景包-影厅关联
4. `package_benefits` - 场景包硬权益
5. `package_items` - 场景包软权益（单品）
6. `package_services` - 场景包服务项目
7. `package_pricing` - 场景包定价

## 常见错误及解决方法

### 错误 1: "FATAL: Tenant or user not found"
**原因**: 数据库连接信息错误
**解决**: 已更新为正确的连接信息

### 错误 2: "Request header field x-request-id is not allowed"
**原因**: CORS 配置缺少允许的请求头
**解决**: 已添加 X-Request-ID 到允许列表

### 错误 3: "Port 8080 already in use"
**原因**: 后端进程已在运行
**解决**:
```bash
lsof -ti:8080 | xargs kill -9
```

### 错误 4: "No table found: scenario_packages"
**原因**: 数据库表未创建
**解决**: 执行上述数据库迁移方案

## 联系支持

如果问题仍未解决，请提供：
1. 浏览器控制台错误日志
2. 后端日志 (`/tmp/backend.log`)
3. 数据库迁移执行结果
