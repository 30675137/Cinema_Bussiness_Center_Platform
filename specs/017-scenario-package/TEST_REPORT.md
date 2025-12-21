# 场景包管理功能测试报告

**日期**: 2025-12-19
**状态**: 🟡 前端就绪 / 🔴 后端需配置

---

## 🎯 测试目标

使用 Chrome DevTools 对场景包管理功能进行端到端测试，发现并修复问题。

---

## 📋 环境准备

### 前端环境
- ✅ **状态**: 已启动
- ✅ **地址**: http://localhost:3000
- ✅ **框架**: Vite 6.4.1 + React 19.2.0
- ✅ **依赖**: 已安装（566 packages）

### 后端环境
- 🔴 **状态**: 需要数据库配置
- 🔴 **端口**: 8080（未启动）
- 🔴 **框架**: Spring Boot 3.3.5 + Java 17
- 🔴 **问题**: 数据库连接失败

---

## 🔧 已修复的问题

### 1. ❌ 缺少 Spring Data JPA 依赖

**问题描述**:
```
找不到符号: 类 Entity, Table, Id, GeneratedValue, Column, etc.
```

**原因**: `pom.xml` 缺少 `spring-boot-starter-data-jpa` 和 PostgreSQL 驱动

**修复**:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

**文件**: `backend/pom.xml:34-45`

---

### 2. ❌ 缺少 JPA 配置

**问题描述**:
后端无法连接数据库，缺少数据源配置。

**修复**:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
    username: postgres.fxhgyxceqrmnpezluaht
    password: Linyk12345678
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 5
      minimum-idle: 2
      connection-timeout: 30000

  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: none
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        use_sql_comments: true
```

**文件**: `backend/src/main/resources/application.yml:5-28`

---

### 3. ❌ 组件扫描范围不足

**问题描述**:
```
No static resource api/scenario-packages
```

主应用类在 `com.cinema.hallstore` 包，但场景包代码在 `com.cinema.scenariopackage` 包，Spring Boot 默认扫描不到。

**修复**:
```java
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.cinema.hallstore",
    "com.cinema.scenariopackage",
    "com.cinema.common"
})
@EnableJpaRepositories(basePackages = {
    "com.cinema.hallstore.repository",
    "com.cinema.scenariopackage.repository"
})
@EntityScan(basePackages = {
    "com.cinema.hallstore.model",
    "com.cinema.scenariopackage.model"
})
public class HallStoreBackendApplication {
    // ...
}
```

**文件**: `backend/src/main/java/com/cinema/hallstore/HallStoreBackendApplication.java:9-12`

---

### 4. ❌ Bean 定义冲突

**问题描述**:
```
ConflictingBeanDefinitionException: 'globalExceptionHandler'
conflicts between:
- com.cinema.common.exception.GlobalExceptionHandler
- com.cinema.hallstore.config.GlobalExceptionHandler
```

**修复**:
删除旧的 `GlobalExceptionHandler`，使用 `com.cinema.common` 包中的完整版本。

```bash
rm backend/src/main/java/com/cinema/hallstore/config/GlobalExceptionHandler.java
```

---

### 5. ❌ 前端依赖未安装

**问题描述**:
```
sh: vite: command not found
```

**修复**:
```bash
cd frontend && npm install
```

---

## 🟡 待解决的问题

### 1. 数据库连接失败

**问题描述**:
```
FATAL: Tenant or user not found
org.hibernate.exception.GenericJDBCException:
Unable to open JDBC Connection for DDL execution
```

**原因**:
- 数据库表未创建（迁移脚本未执行）
- 可能需要更新数据库连接字符串（pooler vs 直连）

**解决方案（需用户手动执行）**:

#### 步骤 1: 执行数据库迁移脚本

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 复制并执行以下脚本：

```sql
-- 文件: backend/src/main/resources/db/migration/V1__create_scenario_packages.sql
-- 完整内容见该文件
```

#### 步骤 2: 验证表创建成功

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'scenario_packages',
    'package_rules',
    'package_hall_associations'
);
```

应该返回 3 行记录。

#### 步骤 3: 重启后端

```bash
cd backend
mvn spring-boot:run
```

---

## 🧪 测试计划（待执行）

一旦数据库配置完成，按以下步骤测试：

### 1. 列表页测试
- [ ] 访问 `http://localhost:3000/scenario-packages`
- [ ] 验证页面加载无错误
- [ ] 验证空状态提示
- [ ] 验证「新建场景包」按钮可见

### 2. 创建场景包测试
- [ ] 点击「新建场景包」
- [ ] 填写表单：
  ```
  名称: VIP生日派对专场
  描述: 适合10-20人的生日派对
  背景图片URL: https://picsum.photos/800/600
  时长: 3 小时
  最小人数: 10
  最大人数: 20
  影厅类型: 123e4567-e89b-12d3-a456-426614174000
  ```
- [ ] 点击「保存草稿」
- [ ] 验证跳转回列表页
- [ ] 验证新场景包出现在列表中

### 3. 编辑场景包测试
- [ ] 在列表中点击「编辑」
- [ ] 验证表单预填充正确
- [ ] 验证元数据显示（ID、版本、versionLock）
- [ ] 修改名称为「VIP生日派对专场（已更新）」
- [ ] 点击「保存更新」
- [ ] 验证更新成功

### 4. 乐观锁测试
- [ ] 打开两个浏览器窗口
- [ ] 同时打开同一个场景包的编辑页
- [ ] 在窗口A中修改并保存（应成功）
- [ ] 在窗口B中修改并保存（应失败）
- [ ] 验证窗口B显示冲突提示
- [ ] 验证窗口B自动重新加载最新数据

### 5. 删除场景包测试
- [ ] 在列表中点击「删除」
- [ ] 验证确认对话框
- [ ] 点击「确定」
- [ ] 验证场景包从列表中消失
- [ ] 验证数据库中 `deleted_at` 字段被设置

---

## 📊 Chrome DevTools 检查项

### Network 标签
- [ ] 检查 API 请求是否成功（200 OK）
- [ ] 检查请求头（Content-Type: application/json）
- [ ] 检查响应体格式（ApiResponse<T>）
- [ ] 检查错误响应（409 Conflict, 404 Not Found）

### Console 标签
- [ ] 检查是否有 JavaScript 错误
- [ ] 检查 React 渲染警告
- [ ] 检查 TanStack Query 缓存日志

### Elements 标签
- [ ] 检查表单元素渲染正确
- [ ] 检查 Ant Design 组件样式
- [ ] 检查响应式布局

### Application 标签
- [ ] 检查 TanStack Query 缓存（DevTools）
- [ ] 检查 localStorage（如有）

---

## 📝 已知限制（MVP）

1. **图片上传**: 仅支持URL输入，不支持文件上传
2. **影厅选择**: 手动输入UUID，无下拉选择器
3. **预览页**: 仅占位符，未实现
4. **状态管理**: 仅草稿状态，无发布/下架功能
5. **定价和内容**: User Story 2-4 未实现

---

## 🚀 下一步行动

### 立即执行
1. ✅ 用户手动执行数据库迁移脚本
2. ✅ 重启后端服务
3. ✅ 使用 Chrome DevTools 完整测试所有功能
4. ✅ 记录发现的问题

### 后续优化
1. 实现影厅类型选择器
2. 完善预览页
3. 集成 Supabase Storage 图片上传
4. 实现 User Story 2-4

---

## 🐛 Bug 报告模板

如果发现问题，请按以下格式记录：

```markdown
### Bug #N: [简短描述]

**重现步骤**:
1. 访问 ...
2. 点击 ...
3. 观察到 ...

**预期行为**:
应该 ...

**实际行为**:
实际 ...

**截图/日志**:
[粘贴 Console 错误或 Network 请求详情]

**环境**:
- 浏览器: Chrome 120.x
- 前端版本: http://localhost:3000
- 后端版本: http://localhost:8080
```

---

## 📌 重要提醒

**⚠️ 当前状态**: 后端未启动，需要先执行数据库迁移才能进行完整测试。

**用户需要做的**:
1. 登录 Supabase Dashboard
2. 执行 `V1__create_scenario_packages.sql` 脚本
3. 重启后端服务
4. 开始测试

**文档版本**: v1.0
**最后更新**: 2025-12-19 18:10 CST
