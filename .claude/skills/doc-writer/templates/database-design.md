# 数据库设计文档 - {{specId}}

**文档版本**: 1.0
**创建日期**: {{date}}
**作者**: {{author}}

---

## 1. 数据库概述

### 1.1 数据库选型

| 属性 | 值 |
|------|-----|
| 数据库类型 | {{databaseType}} |
| 版本 | {{databaseVersion}} |
| 字符集 | UTF-8 |
| 时区 | UTC |

### 1.2 设计原则

{{#each designPrinciples}}
- **{{name}}**: {{description}}
{{/each}}

### 1.3 命名规范

| 对象类型 | 命名规范 | 示例 |
|---------|---------|------|
| 表名 | snake_case（复数） | `users`, `order_items` |
| 字段名 | snake_case | `user_id`, `created_at` |
| 主键 | `id` | `id` |
| 外键 | `{关联表单数}_id` | `user_id`, `product_id` |
| 索引 | `idx_{表名}_{字段名}` | `idx_users_email` |
| 唯一约束 | `uk_{表名}_{字段名}` | `uk_users_username` |

---

## 2. ER 图

### 2.1 整体 ER 图

```mermaid
erDiagram
{{erDiagram}}
```

### 2.2 核心实体关系说明

{{#each entityRelationships}}
#### {{source}} ↔ {{target}}

- **关系类型**: {{relationType}}
- **关系描述**: {{description}}
- **关联字段**: {{foreignKey}}
{{/each}}

---

## 3. 表结构设计

{{#each tables}}
### 3.{{@index}}. {{name}}

**说明**: {{description}}

**表名**: `{{tableName}}`

#### 字段定义

| 字段名 | 数据类型 | 长度 | 允许空 | 默认值 | 说明 | 约束 |
|-------|---------|------|--------|--------|------|------|
{{#each columns}}
| {{name}} | {{dataType}} | {{#if length}}{{length}}{{else}}-{{/if}} | {{#if nullable}}是{{else}}否{{/if}} | {{#if defaultValue}}{{defaultValue}}{{else}}-{{/if}} | {{description}} | {{constraints}} |
{{/each}}

#### 索引

{{#if indexes}}
| 索引名 | 类型 | 字段 | 说明 |
|-------|------|------|------|
{{#each indexes}}
| {{name}} | {{type}} | {{columns}} | {{description}} |
{{/each}}
{{else}}
无额外索引（仅主键）
{{/if}}

#### 约束

{{#if constraints}}
| 约束名 | 类型 | 字段 | 说明 |
|-------|------|------|------|
{{#each constraints}}
| {{name}} | {{type}} | {{columns}} | {{description}} |
{{/each}}
{{else}}
无额外约束
{{/if}}

#### 示例数据

```sql
INSERT INTO {{tableName}} ({{sampleInsertColumns}}) VALUES
{{sampleInsertValues}};
```

---

{{/each}}

## 4. 索引设计

### 4.1 索引策略

| 索引类型 | 使用场景 | 性能影响 |
|---------|---------|---------|
| 主键索引 | 唯一标识记录 | 自动创建 |
| 唯一索引 | 保证字段唯一性 | 插入/更新时验证 |
| 普通索引 | 加速查询 | 提升查询性能 |
| 组合索引 | 多字段查询 | 需考虑字段顺序 |
| 全文索引 | 文本搜索 | 适用于大文本 |

### 4.2 关键索引清单

{{#each criticalIndexes}}
#### {{name}}

- **表名**: {{tableName}}
- **索引字段**: {{columns}}
- **索引类型**: {{indexType}}
- **使用场景**: {{useCase}}
- **预期查询性能**: {{expectedPerformance}}
{{/each}}

### 4.3 索引维护建议

{{#each indexMaintenanceRules}}
- {{this}}
{{/each}}

---

## 5. 数据字典

{{#each dataDictionary}}
### 5.{{@index}}. {{tableName}}

{{#each columns}}
#### {{name}}

| 属性 | 值 |
|------|-----|
| 字段名 | {{name}} |
| 中文名 | {{chineseName}} |
| 数据类型 | {{dataType}} |
| 长度 | {{#if length}}{{length}}{{else}}-{{/if}} |
| 允许空 | {{#if nullable}}是{{else}}否{{/if}} |
| 默认值 | {{#if defaultValue}}{{defaultValue}}{{else}}-{{/if}} |
| 说明 | {{description}} |
| 示例值 | {{exampleValue}} |

{{#if isEnum}}
**枚举值**:

| 值 | 说明 |
|----|------|
{{#each enumValues}}
| {{value}} | {{label}} |
{{/each}}
{{/if}}

---

{{/each}}

{{/each}}

## 6. 数据迁移方案

### 6.1 初始化脚本

**创建数据库**:
```sql
CREATE DATABASE {{databaseName}}
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8'
  TEMPLATE template0;
```

**创建表（Flyway 迁移脚本）**:

```sql
-- V001__create_{{tableName}}_table.sql
{{#each migrationScripts}}
{{script}}

{{/each}}
```

### 6.2 数据迁移策略

{{#each migrationStrategies}}
#### {{phase}}: {{title}}

**说明**: {{description}}

**执行步骤**:
{{#each steps}}
{{@index}}. {{this}}
{{/each}}

**回滚方案**:
{{rollbackPlan}}

---

{{/each}}

### 6.3 版本控制

使用 **Flyway** 进行数据库版本管理：

| 版本 | 文件名 | 说明 | 执行日期 |
|-----|--------|------|---------|
{{#each migrations}}
| {{version}} | {{filename}} | {{description}} | {{executedAt}} |
{{/each}}

---

## 7. 备份策略

### 7.1 备份计划

| 备份类型 | 频率 | 保留时间 | 存储位置 |
|---------|------|---------|---------|
| 全量备份 | 每天 00:00 | 30 天 | Supabase 自动备份 + 云存储 |
| 增量备份 | 每小时 | 7 天 | 云存储 |
| 归档备份 | 每月 1 日 | 1 年 | 冷存储 |

### 7.2 备份脚本

**PostgreSQL 备份命令**:
```bash
pg_dump -h <host> -U <user> -d <database> -F c -b -v -f backup_$(date +%Y%m%d_%H%M%S).dump
```

**恢复命令**:
```bash
pg_restore -h <host> -U <user> -d <database> -v backup_file.dump
```

### 7.3 备份验证

{{#each backupValidationRules}}
- {{this}}
{{/each}}

---

## 8. 性能优化

### 8.1 查询优化

#### 慢查询优化策略

{{#each slowQueryOptimizations}}
- **场景**: {{scenario}}
- **优化前**: {{before}}
- **优化后**: {{after}}
- **性能提升**: {{improvement}}
{{/each}}

#### 常见查询模式

{{#each commonQueryPatterns}}
##### {{name}}

**SQL 示例**:
```sql
{{sql}}
```

**执行计划**:
```
{{executionPlan}}
```

**优化建议**:
{{#each optimizationTips}}
- {{this}}
{{/each}}

---

{{/each}}

### 8.2 分区策略

{{#if partitioningStrategy}}
#### 分区表设计

{{#each partitionedTables}}
##### {{tableName}}

- **分区类型**: {{partitionType}}
- **分区键**: {{partitionKey}}
- **分区规则**: {{partitionRule}}
- **预期分区数**: {{estimatedPartitions}}

**创建分区表**:
```sql
{{partitionSQL}}
```
{{/each}}

{{else}}
当前不需要分区，数据量在可控范围内。
{{/if}}

### 8.3 数据归档

{{#if archivalStrategy}}
#### 归档策略

{{#each archivalRules}}
- **表名**: {{tableName}}
- **归档条件**: {{condition}}
- **归档频率**: {{frequency}}
- **归档目标**: {{destination}}
{{/each}}

**归档脚本示例**:
```sql
{{archivalScript}}
```

{{else}}
暂无归档需求。
{{/if}}

---

## 9. 数据安全

### 9.1 访问控制

**角色定义**:

| 角色 | 权限 | 适用对象 |
|------|------|----------|
{{#each databaseRoles}}
| {{role}} | {{permissions}} | {{scope}} |
{{/each}}

**权限控制 SQL**:
```sql
{{#each roleScripts}}
-- {{description}}
{{sql}}

{{/each}}
```

### 9.2 敏感数据保护

| 表名 | 敏感字段 | 保护措施 |
|------|---------|---------|
{{#each sensitiveData}}
| {{tableName}} | {{columns}} | {{protection}} |
{{/each}}

### 9.3 审计日志

**启用审计日志**:
```sql
-- 记录所有 DML 操作
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(100),
  operation VARCHAR(10),
  old_data JSONB,
  new_data JSONB,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建触发器函数
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id)
  VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_user_id());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 10. 监控与告警

### 10.1 监控指标

| 指标 | 阈值 | 告警级别 |
|------|------|---------|
{{#each monitoringMetrics}}
| {{metric}} | {{threshold}} | {{severity}} |
{{/each}}

### 10.2 性能基线

| 指标 | 基线值 | 目标值 |
|------|--------|--------|
| 查询响应时间 (P95) | < 100ms | < 50ms |
| 连接数 | < 100 | < 200 |
| 磁盘使用率 | < 70% | < 80% |
| 缓存命中率 | > 90% | > 95% |

---

## 11. 附录

### 11.1 数据库配置

**Supabase PostgreSQL 配置**:
```sql
-- 连接池配置
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

-- 日志配置
log_statement = 'all'
log_duration = on
log_min_duration_statement = 1000

-- 自动清理配置
autovacuum = on
autovacuum_max_workers = 3
```

### 11.2 故障排查

{{#each troubleshootingGuides}}
#### {{issue}}

**症状**: {{symptoms}}

**排查步骤**:
{{#each steps}}
{{@index}}. {{this}}
{{/each}}

**解决方案**: {{solution}}

---

{{/each}}

### 11.3 变更历史

| 版本 | 日期 | 变更内容 |
|-----|------|---------|
| 1.0 | {{date}} | 初始版本 |

### 11.4 相关文档

- 技术设计文档: `specs/{{specId}}/design/tdd-{{specId}}.md`
- 数据模型说明: `specs/{{specId}}/data-model.md`
- API 接口文档: `specs/{{specId}}/design/interface-{{specId}}.md`
