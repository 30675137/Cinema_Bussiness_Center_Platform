# Implementation Plan: Flyway 数据库迁移管理

**Branch**: `T003-flyway-migration` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T003-flyway-migration/spec.md`

## Summary

整合 Flyway 数据库迁移框架，实现：
1. 启用 Flyway 自动迁移（当前处于禁用状态）
2. 整合现有 60+ 个迁移脚本
3. 添加初始化数据脚本（品牌、分类等基础数据）
4. 支持多环境配置（dev/test/prod）

技术方案：配置 Spring Boot Flyway 集成，使用 baseline-on-migrate 处理现有数据库，通过 Spring Profile 实现多环境差异化配置。

## Technical Context

**Language/Version**:
- Backend: Java 17 + Spring Boot 3.3.5 (强制使用 Java 17)
- Database: PostgreSQL (Supabase hosted)

**Primary Dependencies**:
- Spring Boot Flyway Starter (org.flywaydb:flyway-core)
- Spring Boot JDBC (数据源配置)
- PostgreSQL JDBC Driver

**Storage**: Supabase PostgreSQL (aws-1-us-east-2.pooler.supabase.com:6543)

**Testing**:
- Backend: JUnit 5 + Spring Boot Test
- Integration: 使用独立测试数据库验证迁移脚本

**Target Platform**:
- Spring Boot Backend API
- 支持 Docker 容器化部署

**Project Type**:
- Backend Infrastructure (数据库迁移管理)
- 不涉及前端开发

**Performance Goals**:
- 迁移执行时间 < 5 分钟（全量脚本）
- 增量迁移 < 30 秒

**Constraints**:
- 必须兼容现有 60+ 个迁移脚本
- 必须支持 Supabase PostgreSQL
- 禁止破坏现有数据

**Scale/Scope**:
- 约 60+ 个迁移脚本整合
- 3 个环境配置（dev/test/prod）
- 初始化数据：品牌、分类、单位换算等

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `T003-flyway-migration` = active_spec `specs/T003-flyway-migration` ✅
- [x] **测试驱动开发**: 迁移脚本验证测试将在 Phase 1 设计 ✅
- [N/A] **组件化架构**: 本功能为后端基础设施，不涉及前端组件
- [N/A] **前端技术栈分层**: 本功能为后端基础设施，不涉及前端开发
- [N/A] **数据驱动状态管理**: 本功能为后端基础设施，不涉及前端状态管理
- [x] **代码质量工程化**: 迁移脚本命名规范、SQL 格式规范 ✅
- [x] **后端技术栈约束**: 使用 Spring Boot + Supabase PostgreSQL ✅

### 性能与标准检查：
- [x] **性能标准**: 迁移执行时间目标 < 5 分钟 ✅
- [N/A] **安全标准**: 本功能为数据库迁移，不涉及用户认证
- [N/A] **可访问性标准**: 本功能为后端基础设施，不涉及 UI

## Project Structure

### Documentation (this feature)

```text
specs/T003-flyway-migration/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output - Flyway 配置研究
├── data-model.md        # Phase 1 output - 迁移脚本清单
├── quickstart.md        # Phase 1 output - 开发者快速上手指南
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
backend/
├── src/main/resources/
│   ├── application.yml           # 主配置（Flyway 启用）
│   ├── application-dev.yml       # 开发环境配置
│   ├── application-test.yml      # 测试环境配置
│   ├── application-prod.yml      # 生产环境配置
│   └── db/
│       ├── migration/            # Flyway 迁移脚本（现有 60+）
│       │   ├── V001__xxx.sql
│       │   ├── V002__xxx.sql
│       │   └── ...
│       └── seed/                 # 初始化数据脚本
│           ├── R__seed_brands.sql
│           ├── R__seed_categories.sql
│           └── R__seed_unit_conversions.sql
└── pom.xml                       # Maven 依赖配置
```

**Structure Decision**: Backend-only infrastructure feature focusing on database migration management. No frontend changes required.

## Complexity Tracking

> No constitution violations identified. All applicable rules are satisfied.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

## Phase 0: Research

### Research Tasks

1. **Flyway + Spring Boot 3.x 集成配置**
   - 验证 Spring Boot 3.3.5 与 Flyway 版本兼容性
   - 确认 PostgreSQL 方言和连接池配置

2. **现有迁移脚本分析**
   - 清点 60+ 个迁移脚本
   - 识别命名规范问题（数字版本 vs 日期版本）
   - 检测潜在冲突和依赖关系

3. **Supabase PostgreSQL 特性兼容性**
   - 验证 Flyway 是否支持 Supabase Pooler 模式
   - 确认 RLS (Row Level Security) 策略与迁移脚本的兼容性

4. **多环境配置最佳实践**
   - Spring Profile 条件化 Flyway 配置
   - 测试数据隔离策略

### Research Output

详见 [research.md](./research.md)

---

## Phase 1: Design & Contracts

### 1.1 迁移脚本整合设计

详见 [data-model.md](./data-model.md)

### 1.2 配置方案设计

**Flyway 配置项**：
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
    baseline-version: 0
    validate-on-migrate: true
    clean-disabled: true  # 生产环境禁用 clean
    out-of-order: true    # 支持乱序执行
```

### 1.3 初始化数据设计

使用 Repeatable Migration (R__xxx.sql) 管理种子数据：
- `R__seed_brands.sql` - 品牌初始化
- `R__seed_categories.sql` - 分类初始化
- `R__seed_unit_conversions.sql` - 单位换算初始化

### 1.4 开发者快速上手

详见 [quickstart.md](./quickstart.md)

---

## Phase 2: Tasks

> 任务分解将由 `/speckit.tasks` 命令生成，保存在 [tasks.md](./tasks.md)

### 预估任务概览

1. **环境准备** - 验证 Flyway 依赖和版本
2. **迁移脚本整合** - 统一命名规范，解决冲突
3. **配置启用** - 修改 application.yml 启用 Flyway
4. **多环境配置** - 创建 dev/test/prod 配置文件
5. **初始化数据脚本** - 创建 R__seed_*.sql 脚本
6. **测试验证** - 空数据库全量迁移测试
7. **文档更新** - 更新 CLAUDE.md 和开发指南
